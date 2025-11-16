import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand,
  DeleteItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hasAnyRole, canModifyLab } from '../utils/rbac';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user information from Cognito authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Verify user has appropriate roles (only admins can delete labs)
    if (!hasAnyRole(userRoles, ['Admin'])) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. Only Admins can delete labs.' }),
      };
    }
    
    // Parse request body or query parameters to get labId
    const labId = event.queryStringParameters?.labId || 
                  JSON.parse(event.body || '{}').labId;
    
    // Validate required fields
    if (!labId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Missing required field: labId' }),
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
    
    // Check if the lab exists
    const getItemCommand = new GetItemCommand({
      TableName: labTable,
      Key: marshall({ id: labId })
    });
    
    const getItemResponse = await client.send(getItemCommand);
    
    if (!getItemResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Lab not found' }),
      };
    }
    
    // Get the existing lab
    const existingLab = unmarshall(getItemResponse.Item);
    
    // Check if the user has permission to modify the lab (although we already checked for admin)
    if (!canModifyLab(userId, userRoles, existingLab)) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. You do not have permission to delete this lab.' }),
      };
    }
    
    // Delete the lab from DynamoDB
    const deleteCommand = new DeleteItemCommand({
      TableName: labTable,
      Key: marshall({ id: labId }),
      ReturnValues: 'ALL_OLD'
    });
    
    const deleteResponse = await client.send(deleteCommand);
    
    // Get the deleted lab
    const deletedLab = unmarshall(deleteResponse.Attributes || {});
    
    // Return success message
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        success: true,
        message: 'Lab deleted successfully',
        lab: {
          labId: deletedLab.id,
          name: deletedLab.name,
          professorId: deletedLab.professorId,
          professorIds: deletedLab.professorIds,
          labAssistantIds: deletedLab.labAssistantIds,
          description: deletedLab.description,
          status: deletedLab.status,
          createdAt: deletedLab.createdAt,
          updatedAt: deletedLab.updatedAt
        }
      }),
    };
  } catch (error) {
    console.error('Error deleting lab:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Failed to delete lab' }),
    };
  }
}; 