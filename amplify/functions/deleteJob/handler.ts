import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand, 
  DeleteItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hasAnyRole, canManageJob, Lab, Job } from '../utils/rbac';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get the jobId from the path parameters
    const jobId = event.pathParameters?.jobId;
    
    if (!jobId) {
      return createErrorResponse(400, 'Missing required parameter: jobId is required');
    }
    
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user has any of the required roles to delete jobs
    if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      return createErrorResponse(403, 'Unauthorized. You need Admin, Professor, or LabAssistant role to delete jobs.');
    }
    
    // Find the Job and Lab tables dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    // Use the specific job table name instead of finding it dynamically
    const jobTable = 'Job-3izs4njl3bfj5m7mmysz2zbwz4-NONE';
    // Find the lab table name dynamically (keep this part)
    const labTable = tableList.TableNames?.find(name => name.startsWith('Lab-'));
    
    console.log('Using job table:', jobTable);
    if (labTable) {
      console.log('Using lab table:', labTable);
    } else {
      console.log('Warning: Lab table not found, job details may be incomplete');
    }
    
    // Get the job to check permissions
    const getJobCommand = new GetItemCommand({
      TableName: jobTable,
      Key: marshall({ id: jobId }),
    });
    
    const jobResponse = await client.send(getJobCommand);
    
    if (!jobResponse.Item) {
      return createErrorResponse(404, 'Job not found');
    }
    
    const job = unmarshall(jobResponse.Item) as Job;
    
    // If we have a lab table and the job has a labId, get the lab details
    let lab: Lab | undefined = undefined;
    if (labTable && job.labId) {
      const getLabCommand = new GetItemCommand({
        TableName: labTable,
        Key: marshall({ id: job.labId }),
      });
      
      try {
        const labResponse = await client.send(getLabCommand);
        if (labResponse.Item) {
          lab = unmarshall(labResponse.Item) as Lab;
        }
      } catch (error) {
        console.error('Error fetching lab:', error);
      }
    }
    
    // Check permissions using the RBAC utility
    if (!canManageJob(userId, userRoles, job, lab)) {
      return createErrorResponse(403, 'You do not have permission to delete this job');
    }
    
    // Delete the job from DynamoDB
    const deleteItemCommand = new DeleteItemCommand({
      TableName: jobTable,
      Key: marshall({ id: jobId }),
      ReturnValues: 'ALL_OLD',
    });
    
    const deletedJobResponse = await client.send(deleteItemCommand);
    
    // Return the deleted job
    const deletedJob = deletedJobResponse.Attributes 
      ? unmarshall(deletedJobResponse.Attributes)
      : null;
    
    return createSuccessResponse({ 
      message: 'Job deleted successfully',
      job: deletedJob
    });
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Failed to delete job');
  }
}; 