const { 
  LambdaClient, 
  InvokeCommand 
} = require('@aws-sdk/client-lambda');
const { hasAnyRole } = require('../utils/rbac');

const lambda = new LambdaClient({});

/**
 * API Handler for refreshing resume data in applications
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle OPTIONS requests (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return createCorsResponse();
  }
  
  try {
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    console.log('User info:', {
      userId,
      groups: typeof groups === 'string' ? groups : JSON.stringify(groups)
    });
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user has required permissions
    if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      console.warn(`User ${userId} with roles [${userRoles.join(', ')}] attempted to refresh resume data but lacks permission`);
      return createErrorResponse(403, 'Unauthorized. You need Admin, Professor, or LabAssistant role to refresh resume data.');
    }
    
    // Parse job ID from query parameters if provided
    let jobId = null;
    if (event.queryStringParameters?.jobId) {
      jobId = event.queryStringParameters.jobId;
      console.log(`Refresh request for specific job: ${jobId}`);
    } else {
      console.log('Refresh request for all applications');
    }
    
    // Create parameters for the enhanceApplicationsWithResumeData Lambda
    const enhanceLambdaName = process.env.ENHANCE_LAMBDA_NAME || 'enhanceApplicationsWithResumeData';
    console.log(`Using Lambda function: ${enhanceLambdaName}`);
    
    const params = {
      FunctionName: enhanceLambdaName,
      Payload: JSON.stringify({
        requestedBy: userId,
        roles: userRoles,
        jobId,
        source: 'refresh-api',
        timestamp: new Date().toISOString()
      })
    };
    
    console.log(`Calling ${params.FunctionName} Lambda with params:`, JSON.stringify(params, null, 2));
    
    // Invoke the enhanceApplicationsWithResumeData Lambda
    const command = new InvokeCommand(params);
    const response = await lambda.send(command);
    
    // Check for Lambda execution errors
    if (response.FunctionError) {
      console.error(`Lambda execution error: ${response.FunctionError}`);
      console.error('Error payload:', Buffer.from(response.Payload).toString());
      throw new Error(`Lambda function ${enhanceLambdaName} failed: ${response.FunctionError}`);
    }
    
    // Parse the response
    const payload = Buffer.from(response.Payload).toString();
    let result;
    try {
      result = JSON.parse(payload);
      console.log('Lambda execution succeeded. Response:', result);
    } catch (parseError) {
      console.error('Error parsing Lambda response:', parseError);
      console.error('Raw payload:', payload);
      throw new Error('Failed to parse Lambda response');
    }
    
    // Extract the response body if it's a structured API response
    if (result.statusCode && result.body) {
      try {
        result = JSON.parse(result.body);
      } catch (bodyParseError) {
        console.error('Error parsing Lambda response body:', bodyParseError);
      }
    }
    
    // Return the result
    return createSuccessResponse(result, result.matchCount, result.updatedCount);
  } catch (error) {
    console.error('Error refreshing resume data:', error);
    return createErrorResponse(500, `Failed to refresh resume data: ${error.message}`);
  }
};

/**
 * Create a success response
 */
const createSuccessResponse = async (data, matchCount, updatedCount) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
  };
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      message: `Resume data refresh triggered for ${matchCount} applications. ${updatedCount} applications were updated with resume data.`,
      details: "Refreshed both structured and legacy resume formats",
      data
    })
  };
};

/**
 * Create an error response
 */
function createErrorResponse(statusCode, message) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    body: JSON.stringify({ message })
  };
}

/**
 * Create a CORS response for OPTIONS requests
 */
function createCorsResponse() {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
    body: JSON.stringify({ message: 'CORS preflight request successful' })
  };
} 