import { APIGatewayProxyHandler, APIGatewayProxyResult, APIGatewayProxyEvent } from 'aws-lambda';
import { 
  S3Client, 
  PutObjectCommand,
  HeadObjectCommand 
} from '@aws-sdk/client-s3';
import { 
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand
} from '@aws-sdk/client-dynamodb';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { createSuccessResponse, createErrorResponse } from '../utils/response';
import { ScanCommand } from '@aws-sdk/client-dynamodb';

// Initialize clients
const s3Client = new S3Client({});
const dynamoClient = new DynamoDBClient({});

/**
 * Helper to get a DynamoDB table name by its pattern
 */
const getTableName = async (pattern: RegExp): Promise<string | null> => {
  try {
    // For simplicity, we'll directly search for User table
    // In production, we'd use ListTablesCommand to find the actual table name
    const userPattern = pattern.toString();
    if (userPattern.includes('User')) {
      return process.env.USER_TABLE || 'User-abc123';
    }
    if (userPattern.includes('Job')) {
      return process.env.JOB_TABLE || 'Job-abc123';
    }
    if (userPattern.includes('Match')) {
      return process.env.MATCH_TABLE || 'Match-abc123';
    }
    return null;
  } catch (error) {
    console.error('Error getting table name:', error);
    return null;
  }
};

/**
 * Get the content type from a file name
 */
const getContentType = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    default:
      return 'application/octet-stream';
  }
};

/**
 * Validate file type and size
 */
const validateFile = (fileName: string, fileSize?: number): { valid: boolean; message?: string } => {
  // Check file extension
  const extension = fileName.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['pdf', 'doc', 'docx'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      message: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` 
    };
  }
  
  // Check file size if provided (in bytes, 10MB max)
  if (fileSize && fileSize > 10 * 1024 * 1024) {
    return {
      valid: false,
      message: 'File too large. Maximum size is 10MB.'
    };
  }
  
  return { valid: true };
};

/**
 * Update user record with resume file name and URL
 */
const updateUserRecord = async (userId: string, fileKey: string, jobId?: string): Promise<boolean> => {
  try {
    // Find the User table
    const userTable = await getTableName(/^User-/);
    
    if (!userTable) {
      console.error('User table not found');
      return false;
    }
    
    // Generate a proper S3 URL from the key
    const bucketName = process.env.RESUME_BUCKET || 'amplify-storage-bucket';
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    
    console.log(`Generated S3 URL: ${s3Url}`);
    
    // Check if user exists in the database
    const getUserCommand = new GetItemCommand({
      TableName: userTable,
      Key: marshall({ id: userId }),
    });
    
    const userResponse = await dynamoClient.send(getUserCommand);
    
    if (userResponse.Item) {
      // Get current data for checking existing resume
      const userData = unmarshall(userResponse.Item);
      console.log('Found existing user record:', userData.userId);
      
      const timestamp = new Date().toISOString();
      
      // Build update expression and attribute values
      const updateExpression = 'SET resumeFileName = :fileName, resumeUrl = :resumeUrl, resumeLastUpdated = :updated';
      const expressionAttributeValues: Record<string, string> = {
        ':fileName': fileKey,
        ':resumeUrl': s3Url,
        ':updated': timestamp
      };
      
      // If we have job info, we could add it to metadata (not used currently)
      if (jobId) {
        console.log(`Associated with job: ${jobId}`);
      }
      
      // Update existing user record
      const updateUserCommand = new UpdateItemCommand({
        TableName: userTable,
        Key: marshall({ id: userId }),
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: marshall(expressionAttributeValues),
        ReturnValues: 'ALL_NEW'
      });
      
      await dynamoClient.send(updateUserCommand);
      console.log('Updated user record with resume file name and URL');
      return true;
    } else {
      // User doesn't exist in database yet, create a new record
      console.log('User not found in database, creating new record');
      
      const newUser = {
        id: userId,
        userId: userId,
        resumeFileName: fileKey,
        resumeUrl: s3Url,
        resumeLastUpdated: new Date().toISOString(),
        roles: ['Student'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const createUserCommand = new PutItemCommand({
        TableName: userTable,
        Item: marshall(newUser),
      });
      
      await dynamoClient.send(createUserCommand);
      console.log('Created new user record with resume file name and URL');
      return true;
    }
  } catch (error) {
    console.error('Error updating user record:', error);
    return false;
  }
};

/**
 * Update job application with resume file
 */
const updateJobApplication = async (userId: string, jobId: string, fileKey: string): Promise<boolean> => {
  if (!jobId) return false;
  
  try {
    // Find the Match table
    const matchTable = await getTableName(/^Match-/);
    
    if (!matchTable) {
      console.error('Match table not found');
      return false;
    }
    
    // Generate a proper S3 URL from the key
    const bucketName = process.env.RESUME_BUCKET || 'amplify-storage-bucket';
    const region = process.env.AWS_REGION || 'us-east-1';
    const s3Url = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    
    // First try to find the application by userId and jobId
    // In a real implementation with a GSI, we would do a direct query,
    // but for now we'll use a scan with a filter expression
    
    // Create scan parameters
    const scanParams = {
      TableName: matchTable,
      FilterExpression: 'studentId = :userId AND jobId = :jobId',
      ExpressionAttributeValues: marshall({
        ':userId': userId,
        ':jobId': jobId
      })
    };
    
    try {
      // Scan for matching applications
      const scanCommand = new ScanCommand(scanParams);
      const { Items } = await dynamoClient.send(scanCommand);
      
      if (Items && Items.length > 0) {
        // We found matching applications - update them all
        const updatePromises = Items.map(item => {
          const unmarshalledItem = unmarshall(item);
          
          // Prepare update command
          const updateCommand = new UpdateItemCommand({
            TableName: matchTable,
            Key: marshall({ id: unmarshalledItem.id }),
            UpdateExpression: 'SET resumeUrl = :resumeUrl, updatedAt = :updated',
            ExpressionAttributeValues: marshall({
              ':resumeUrl': s3Url,
              ':updated': new Date().toISOString()
            })
          });
          
          return dynamoClient.send(updateCommand);
        });
        
        // Execute all updates
        await Promise.all(updatePromises);
        console.log(`Updated ${Items.length} job application(s) with resume URL`);
        return true;
      } else {
        console.log('No matching applications found to update');
        return false;
      }
    } catch (scanError) {
      console.error('Error scanning for applications:', scanError);
      return false;
    }
  } catch (error) {
    console.error('Error updating job application:', error);
    return false;
  }
};

/**
 * Check if file exists in S3
 */
const checkFileExists = async (s3Key: string): Promise<boolean> => {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.RESUME_BUCKET || 'amplify-storage-bucket',
      Key: s3Key
    });
    
    await s3Client.send(command);
    return true;
  } catch (fileError) {
    console.error('Error checking if file exists:', fileError.name);
    return false;
  }
};

/**
 * Generate pre-signed URL for file upload
 */
const generatePresignedUrl = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the request body
    if (!event.body) {
      return createErrorResponse(400, 'Missing required parameters');
    }
    
    const { fileName, fileType, fileSize, jobId } = JSON.parse(event.body);
    
    if (!fileName) {
      return createErrorResponse(400, 'Missing required parameter: fileName');
    }
    
    // Get the user ID from Cognito authorizer
    const userId = event.requestContext.authorizer?.claims.sub;
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized, missing user ID');
    }
    
    // Validate file type and size
    const validation = validateFile(fileName, fileSize);
    if (!validation.valid) {
      return createErrorResponse(400, validation.message || 'Invalid file');
    }
    
    // Generate a unique file name
    const timestamp = Date.now();
    const fileId = uuidv4();
    const extension = fileName.split('.').pop();
    const key = `resumes/${userId}/${timestamp}-${fileId}.${extension}`;
    
    // Get the content type
    const contentType = getContentType(fileName);
    
    // Get bucket name from environment variable
    const bucketName = process.env.RESUME_BUCKET_NAME || 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t';
    
    console.log(`Using S3 bucket: ${bucketName}`);
    
    // Create the S3 put command
    const putObjectCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Metadata: {
        'user-id': userId,
        'job-id': jobId || '',
        'original-name': fileName
      }
    });
    
    // Generate the pre-signed URL
    const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 900 });  // 15 minutes
    
    console.log(`Generated pre-signed URL: ${url}`);
    
    // Return the pre-signed URL to the client
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PUT'
      },
      body: JSON.stringify({
        message: 'Pre-signed URL generated successfully',
        presignedUrl: url,
        fileKey: key,
        fileName: `${fileId}.${extension}`
      })
    };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return createErrorResponse(500, 'Error generating pre-signed URL');
  }
};

/**
 * Confirm file upload and update database records
 */
const confirmUpload = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { fileKey, jobId } = requestBody;
    
    if (!fileKey) {
      return createErrorResponse(400, 'Missing required parameter: fileKey is required');
    }
    
    // Get user ID from the authorizer
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    if (!userId) {
      return createErrorResponse(401, 'Authentication required');
    }
    
    // Check if the file exists in S3
    const fileExists = await checkFileExists(fileKey);
    if (!fileExists) {
      return createErrorResponse(404, 'File not found in storage');
    }
    
    // Update user record with the resume file name
    const userUpdateSuccess = await updateUserRecord(userId, fileKey, jobId);
    
    // If job ID is provided, update the job application as well
    let applicationUpdateSuccess = true;
    if (jobId) {
      applicationUpdateSuccess = await updateJobApplication(userId, jobId, fileKey);
    }
    
    if (!userUpdateSuccess) {
      console.warn('Failed to update user record but file exists');
    }
    
    if (jobId && !applicationUpdateSuccess) {
      console.warn('Failed to update job application but file exists');
    }
    
    return createSuccessResponse({
      message: 'File upload confirmed',
      fileKey,
      userUpdated: userUpdateSuccess,
      applicationUpdated: jobId ? applicationUpdateSuccess : null
    });
  } catch (error) {
    console.error('Error confirming upload:', error);
    return createErrorResponse(500, 'Failed to confirm upload');
  }
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Fix path handling for /confirm endpoint
  // Route based on path and resource
  const path = event.path || '';
  const resource = event.resource || '';
  
  console.log(`Processing request with path: ${path}, resource: ${resource}, method: ${event.httpMethod}`);
  
  // Check multiple ways to detect confirmation endpoint
  if (path.endsWith('/confirm') || resource.endsWith('/confirm') || event.requestContext?.resourcePath?.endsWith('/confirm')) {
    console.log('Detected confirmation endpoint, processing upload confirmation');
    return confirmUpload(event);
  } else {
    console.log('Processing request for pre-signed URL generation');
    return generatePresignedUrl(event);
  }
}; 