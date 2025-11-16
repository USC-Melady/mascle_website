import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  PutItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { hasAnyRole } from '../utils/rbac';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user information from Cognito authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Verify user has admin role (only admins can create labs)
    if (!hasAnyRole(userRoles, ['Admin'])) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. Only Admins can create labs.' }),
      };
    }
    
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { name, professorIds, description, status } = requestBody;
    
    // Validate required fields
    if (!name || !professorIds || !Array.isArray(professorIds) || professorIds.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Missing required fields. Name and at least one professor ID are required.' }),
      };
    }
    
    // Find the Lab table dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    const labTable = tableList.TableNames?.find(name => name.startsWith('Lab-'));
    
    if (!labTable) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Lab table not found' }),
      };
    }
    
    // Create a new lab record
    const now = new Date().toISOString();
    const labId = uuidv4();
    
    const labItem = {
      id: labId,
      name,
      professorId: professorIds[0], // For backward compatibility
      professorIds,
      labAssistantIds: requestBody.labAssistantIds || [],
      description: description || '',
      status: status || 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };
    
    // Save the lab to DynamoDB
    const putCommand = new PutItemCommand({
      TableName: labTable,
      Item: marshall(labItem)
    });
    
    await client.send(putCommand);
    
    // Return the created lab
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        lab: {
          labId,
          name,
          professorId: professorIds[0],
          professorIds,
          labAssistantIds: requestBody.labAssistantIds || [],
          description: description || '',
          status: status || 'ACTIVE',
          createdAt: now,
          updatedAt: now
        }
      }),
    };
  } catch (error) {
    console.error('Error creating lab:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Failed to create lab' }),
    };
  }
}; 