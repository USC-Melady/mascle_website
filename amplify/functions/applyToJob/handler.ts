import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand, 
  PutItemCommand,
  ScanCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { hasRole, canApplyToJob, Job } from '../utils/rbac';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

/**
 * Get DynamoDB table names that match a pattern
 */
const getTableNames = async (pattern: RegExp): Promise<string | null> => {
  const listTablesCommand = new ListTablesCommand({});
  const tableList = await client.send(listTablesCommand);
  
  const matchingTable = tableList.TableNames?.find(name => pattern.test(name));
  return matchingTable || null;
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
      },
      body: ''
    };
  }
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { 
      jobId, 
      coverLetter, 
      resumeUrl, 
      resumeDetails, 
      userDetails 
    } = requestBody;
    
    if (!jobId) {
      return createErrorResponse(400, 'Missing required parameter: jobId is required');
    }
    
    // Get user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    const userEmail = event.requestContext.authorizer?.claims['email'] || '';
    
    if (!userId) {
      return createErrorResponse(401, 'Authentication required');
    }
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user is a student
    if (!hasRole(userRoles, 'Student')) {
      return createErrorResponse(403, 'Unauthorized. Only students can apply to jobs.');
    }
    
    // Find the Job and Match tables dynamically
    const jobTable = await getTableNames(/^Job-/);
    const matchTable = await getTableNames(/^Match-/);
    
    if (!jobTable || !matchTable) {
      return createErrorResponse(500, 'Required database tables not found');
    }
    
    // Get the job to check if it's open for applications
    const getJobCommand = new GetItemCommand({
      TableName: jobTable,
      Key: marshall({ id: jobId }),
    });
    
    const jobResponse = await client.send(getJobCommand);
    
    if (!jobResponse.Item) {
      return createErrorResponse(404, 'Job not found');
    }
    
    const job = unmarshall(jobResponse.Item) as Job;
    
    // Check permissions using the RBAC utility
    if (!canApplyToJob(userId, userRoles, job)) {
      return createErrorResponse(403, 'You cannot apply to this job. It may not be open for applications.');
    }
    
    // Check if student has already applied to this job
    const checkExistingApplicationCommand = new ScanCommand({
      TableName: matchTable,
      FilterExpression: "jobId = :jobId AND studentId = :studentId",
      ExpressionAttributeValues: marshall({
        ":jobId": jobId,
        ":studentId": userId
      })
    });
    
    const existingApplications = await client.send(checkExistingApplicationCommand);
    
    if (existingApplications.Items && existingApplications.Items.length > 0) {
      return createErrorResponse(400, 'You have already applied for this job.');
    }
    
    // Create a new application
    const now = new Date().toISOString();
    const applicationId = uuidv4();
    
    const application = {
      id: applicationId,
      jobId,
      studentId: userId,  // Use the correct field name as per schema
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
      coverLetter: coverLetter || '',
      resumeUrl: resumeUrl || '',
      resumeDetails: typeof resumeDetails === 'object' ? JSON.stringify(resumeDetails) : resumeDetails || '',
      // New application fields
      summerAvailability: userDetails?.summerAvailability || '',
      hoursPerWeek: userDetails?.hoursPerWeek || '',
      expectations: userDetails?.expectations || '',
      userDetails: userDetails || {
        email: userEmail,
        fullName: '',
        phone: '',
        education: ''
      }
    };
    
    console.log('Creating application:', JSON.stringify(application, null, 2));
    
    // Save the application to DynamoDB
    const putItemCommand = new PutItemCommand({
      TableName: matchTable,
      Item: marshall(application),
    });
    
    await client.send(putItemCommand);
    
    return createSuccessResponse({ 
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Failed to submit application');
  }
}; 