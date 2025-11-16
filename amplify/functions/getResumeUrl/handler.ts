import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  S3Client, 
  GetObjectCommand,
  ListObjectsV2Command
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Create S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

// Get bucket name from environment variable
const bucketName = process.env.RESUME_BUCKET_NAME || '';

// Utility function to create standardized API responses
const createResponse = (statusCode: number, body: Record<string, unknown>, headers = {}) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
      ...headers
    },
    body: JSON.stringify(body)
  };
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle CORS preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,POST'
      },
      body: ''
    };
  }
  
  try {
    // Get key from query parameters or parse from request body
    let key = '';
    
    if (event.queryStringParameters && event.queryStringParameters.key) {
      key = decodeURIComponent(event.queryStringParameters.key);
    } else if (event.body) {
      const body = JSON.parse(event.body);
      key = body.key || '';
    }
    
    if (!key) {
      return createResponse(400, { error: 'Missing required parameter: key' });
    }
    
    if (!bucketName) {
      return createResponse(500, { error: 'S3 bucket name not configured' });
    }
    
    // Verify this is a resume file by checking the path prefix
    if (!key.startsWith('resumes/')) {
      return createResponse(400, { error: 'Invalid file path. Only resume files are supported.' });
    }
    
    // List objects in the bucket to determine if there are any files
    const prefix = key.split('/')[0] + '/'; // Get the "resumes/" prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 10
    });
    
    const listResult = await s3Client.send(listCommand);
    console.log('Files in bucket with prefix:', prefix);
    console.log(JSON.stringify(listResult, null, 2));
    
    // Check if the specific file exists
    try {
      // Try to head the object to see if it exists
      const getCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key
      });
      
      // Calculate expiry time (default to 1 hour)
      const expiresIn = 3600; // 1 hour in seconds
      
      // Generate a pre-signed URL for the S3 object
      const signedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn });
      
      // Create download file name from the key
      const fileName = key.split('/').pop() || 'resume.pdf';
      
      // Return the signed URL to the client
      return createResponse(200, {
        url: signedUrl,
        fileName,
        expiresIn,
        debug: {
          bucketName,
          key,
          filesInBucket: listResult.Contents?.map(item => item.Key) || []
        }
      });
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      
      // Return debugging information
      return createResponse(404, { 
        error: 'File not found in S3 bucket',
        message: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          bucketName,
          key,
          filesInBucket: listResult.Contents?.map(item => item.Key) || []
        }
      });
    }
  } catch (error) {
    console.error('Error in handler:', error);
    return createResponse(500, { 
      error: 'Failed to process request', 
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 