import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand, 
  PutItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { hasAnyRole, canCreateJob, Lab } from '../utils/rbac';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { title, description, labId, requirements, academicLevel, status = 'DRAFT', visibility = 'public' } = requestBody;
    
    if (!title || !labId) {
      return createErrorResponse(400, 'Missing required parameters: title and labId are required');
    }
    
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user has any of the required roles to create jobs
    if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      return createErrorResponse(403, 'Unauthorized. You need Admin, Professor, or LabAssistant role to create jobs.');
    }
    
    // Find the Job and Lab tables dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    // Use the specific job table name instead of finding it dynamically
    const jobTable = 'Job-3izs4njl3bfj5m7mmysz2zbwz4-NONE';
    // Find the lab table name dynamically (keep this part)
    const labTable = tableList.TableNames?.find(name => name.startsWith('Lab-'));
    
    if (!labTable) {
      return createErrorResponse(500, 'Lab table not found');
    }
    
    console.log('Using job table:', jobTable);
    console.log('Using lab table:', labTable);
    
    // Get the lab to check permissions
    const getLabCommand = new GetItemCommand({
      TableName: labTable,
      Key: marshall({ id: labId }),
    });
    
    const labResponse = await client.send(getLabCommand);
    
    if (!labResponse.Item) {
      return createErrorResponse(404, 'Lab not found');
    }
    
    const lab = unmarshall(labResponse.Item) as Lab;
    
    // Check permissions using the RBAC utility
    if (!canCreateJob(userId, userRoles, labId, lab)) {
      return createErrorResponse(403, 'You do not have permission to create jobs for this lab');
    }
    
    // Create a new job
    const now = new Date().toISOString();
    const jobId = uuidv4();
    
    const job = {
      id: jobId,
      jobId: jobId,
      title,
      description: description || '',
      labId,
      professorId: userId,
      createdBy: userId,
      status,
      visibility: visibility || 'public', // Default to public for backward compatibility
      requirements: requirements || [],
      academicLevel: academicLevel || 'any', // Default to 'any' if not specified
      createdAt: now,
      updatedAt: now,
      deletedAt: null
    };
    
    // Save the job to DynamoDB
    const putItemCommand = new PutItemCommand({
      TableName: jobTable,
      Item: marshall(job),
    });
    
    await client.send(putItemCommand);
    
    return createSuccessResponse({ 
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Failed to create job');
  }
}; 