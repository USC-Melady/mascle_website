import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  GetItemCommand, 
  UpdateItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { canAddUserToLab } from '../utils/rbac';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { userId, labId, role } = requestBody;
    
    if (!userId || !labId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Missing required parameters: userId and labId are required' }),
      };
    }
    
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const currentUserId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Find the Lab and User tables dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    const labTable = tableList.TableNames?.find(name => name.startsWith('Lab-'));
    const userTable = tableList.TableNames?.find(name => name.startsWith('User-'));
    
    if (!labTable || !userTable) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Lab or User table not found' }),
      };
    }
    
    // Get the lab to check permissions
    const getLabCommand = new GetItemCommand({
      TableName: labTable,
      Key: marshall({ id: labId }),
    });
    
    const labResponse = await client.send(getLabCommand);
    
    if (!labResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Lab not found' }),
      };
    }
    
    const lab = unmarshall(labResponse.Item);
    
    // Check permissions using the RBAC utility
    if (!canAddUserToLab(currentUserId, userRoles, lab, role)) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'You do not have permission to add users to this lab' }),
      };
    }
    
    // Get the user to update
    const getUserCommand = new GetItemCommand({
      TableName: userTable,
      Key: marshall({ id: userId }),
    });
    
    const userResponse = await client.send(getUserCommand);
    
    if (!userResponse.Item) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User not found' }),
      };
    }
    
    const user = unmarshall(userResponse.Item);
    
    // Update the user's labIds
    let labIds = user.labIds || [];
    if (Array.isArray(labIds)) {
      if (!labIds.includes(labId)) {
        labIds.push(labId);
      }
    } else if (typeof labIds === 'string') {
      labIds = labIds.split(',');
      if (!labIds.includes(labId)) {
        labIds.push(labId);
      }
    } else {
      labIds = [labId];
    }
    
    // Update the user in DynamoDB
    const updateUserCommand = new UpdateItemCommand({
      TableName: userTable,
      Key: marshall({ id: userId }),
      UpdateExpression: 'SET labIds = :labIds, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':labIds': labIds,
        ':updatedAt': new Date().toISOString(),
      }),
      ReturnValues: 'ALL_NEW',
    });
    
    const updatedUserResponse = await client.send(updateUserCommand);
    
    // If the user is being added as a lab assistant, update the lab's labAssistantIds
    if (role === 'LabAssistant') {
      let labAssistantIds = lab.labAssistantIds || [];
      if (Array.isArray(labAssistantIds)) {
        if (!labAssistantIds.includes(userId)) {
          labAssistantIds.push(userId);
        }
      } else if (typeof labAssistantIds === 'string') {
        labAssistantIds = labAssistantIds.split(',');
        if (!labAssistantIds.includes(userId)) {
          labAssistantIds.push(userId);
        }
      } else {
        labAssistantIds = [userId];
      }
      
      // Update the lab in DynamoDB
      const updateLabCommand = new UpdateItemCommand({
        TableName: labTable,
        Key: marshall({ id: labId }),
        UpdateExpression: 'SET labAssistantIds = :labAssistantIds, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':labAssistantIds': labAssistantIds,
          ':updatedAt': new Date().toISOString(),
        }),
        ReturnValues: 'ALL_NEW',
      });
      
      await client.send(updateLabCommand);
    }
    
    // Return the updated user
    const updatedUser = updatedUserResponse.Attributes 
      ? unmarshall(updatedUserResponse.Attributes)
      : null;
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ 
        message: 'User added to lab successfully',
        user: updatedUser
      }),
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ error: 'Failed to add user to lab' }),
    };
  }
}; 