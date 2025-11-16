import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand,
  UpdateItemCommand
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
    
    // Verify user has appropriate roles
    if (!hasAnyRole(userRoles, ['Admin', 'Professor'])) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. Only Admins and Professors can update labs.' }),
      };
    }
    
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { labId, name, professorIds, labAssistantIds, description, status } = requestBody;
    
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
    
    // Check if the user has permission to modify the lab
    if (!canModifyLab(userId, userRoles, existingLab)) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. You do not have permission to modify this lab.' }),
      };
    }
    
    // Build the update expression
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues: any = {
      ':updatedAt': new Date().toISOString()
    };
    
    if (name) {
      updateExpression += ', #name = :name';
      expressionAttributeValues[':name'] = name;
    }
    
    if (professorIds) {
      updateExpression += ', professorIds = :professorIds, professorId = :primaryProfessorId';
      expressionAttributeValues[':professorIds'] = professorIds;
      expressionAttributeValues[':primaryProfessorId'] = professorIds[0]; // Set the first professor as the primary for backward compatibility
    }
    
    if (labAssistantIds) {
      updateExpression += ', labAssistantIds = :labAssistantIds';
      expressionAttributeValues[':labAssistantIds'] = labAssistantIds;
    }
    
    if (description !== undefined) {
      updateExpression += ', description = :description';
      expressionAttributeValues[':description'] = description;
    }
    
    if (status) {
      updateExpression += ', #status = :status';
      expressionAttributeValues[':status'] = status;
    }
    
    // Update the lab in DynamoDB
    const updateCommand = new UpdateItemCommand({
      TableName: labTable,
      Key: marshall({ id: labId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ExpressionAttributeNames: {
        '#name': 'name',
        '#status': 'status'
      },
      ReturnValues: 'ALL_NEW'
    });
    
    const updateResponse = await client.send(updateCommand);
    
    // Get the updated lab
    const updatedLab = unmarshall(updateResponse.Attributes || {});
    
    // Return the updated lab
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({
        lab: {
          labId: updatedLab.id,
          name: updatedLab.name,
          professorId: updatedLab.professorId,
          professorIds: updatedLab.professorIds,
          labAssistantIds: updatedLab.labAssistantIds,
          description: updatedLab.description,
          status: updatedLab.status,
          createdAt: updatedLab.createdAt,
          updatedAt: updatedLab.updatedAt
        }
      }),
    };
  } catch (error) {
    console.error('Error updating lab:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Failed to update lab' }),
    };
  }
}; 