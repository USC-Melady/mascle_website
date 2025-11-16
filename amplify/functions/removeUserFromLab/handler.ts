import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  GetItemCommand, 
  UpdateItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { canRemoveUserFromLab } from '../utils/rbac';


// Initialize the DynamoDB client once outside the handler
const dynamoClient = new DynamoDBClient({});

// Environment variables for table names
const LAB_TABLE = process.env.LAB_TABLE || '';
const USER_TABLE = process.env.USER_TABLE || '';

// Helper to create standard response
const createResponse = (statusCode: number, body: Record<string, unknown>) => ({
  statusCode,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  },
  body: JSON.stringify(body)
});

// Helper to normalize array values
const normalizeArray = (value: string | string[] | undefined): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',');
  return [];
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const { userId, labId } = JSON.parse(event.body || '{}');
    
    if (!userId || !labId) {
      return createResponse(400, { 
        error: 'Missing required parameters: userId and labId are required' 
      });
    }
    
    // Get user information from authorizer
    const currentUserId = event.requestContext.authorizer?.claims['sub'] || '';
    const userRoles = normalizeArray(event.requestContext.authorizer?.claims['cognito:groups']);
    
    // Validate table names
    if (!LAB_TABLE || !USER_TABLE) {
      return createResponse(500, { 
        error: 'Lab or User table names not configured in environment variables' 
      });
    }
    
    // Get the lab to check permissions
    const labResponse = await dynamoClient.send(new GetItemCommand({
      TableName: LAB_TABLE,
      Key: marshall({ id: labId }),
    }));
    
    if (!labResponse.Item) {
      return createResponse(404, { error: 'Lab not found' });
    }
    
    const lab = unmarshall(labResponse.Item);
    
    // Get the user to update
    const userResponse = await dynamoClient.send(new GetItemCommand({
      TableName: USER_TABLE,
      Key: marshall({ id: userId }),
    }));
    
    if (!userResponse.Item) {
      return createResponse(404, { error: 'User not found' });
    }
    
    const user = unmarshall(userResponse.Item);
    const userToRemoveRoles = normalizeArray(user.roles);
    
    // Check permissions with the user's role
    if (!canRemoveUserFromLab(currentUserId, userRoles, lab, userToRemoveRoles.length > 0 ? userToRemoveRoles[0] : null)) {
      return createResponse(403, { 
        error: 'You do not have permission to remove users from this lab' 
      });
    }
    
    // Update the user's labIds
    const labIds = normalizeArray(user.labIds).filter(id => id !== labId);
    
    // Update the user in DynamoDB
    const updatedUserResponse = await dynamoClient.send(new UpdateItemCommand({
      TableName: USER_TABLE,
      Key: marshall({ id: userId }),
      UpdateExpression: 'SET labIds = :labIds, updatedAt = :updatedAt',
      ExpressionAttributeValues: marshall({
        ':labIds': labIds,
        ':updatedAt': new Date().toISOString(),
      }),
      ReturnValues: 'ALL_NEW',
    }));
    
    // Update the lab's assistants if needed
    const labAssistantIds = normalizeArray(lab.labAssistantIds);
    
    if (labAssistantIds.includes(userId)) {
      // Remove user from lab assistants
      await dynamoClient.send(new UpdateItemCommand({
        TableName: LAB_TABLE,
        Key: marshall({ id: labId }),
        UpdateExpression: 'SET labAssistantIds = :labAssistantIds, updatedAt = :updatedAt',
        ExpressionAttributeValues: marshall({
          ':labAssistantIds': labAssistantIds.filter(id => id !== userId),
          ':updatedAt': new Date().toISOString(),
        }),
      }));
    }
    
    // Return the updated user
    const updatedUser = updatedUserResponse.Attributes 
      ? unmarshall(updatedUserResponse.Attributes)
      : null;
    
    return createResponse(200, { 
      message: 'User removed from lab successfully',
      user: updatedUser
    });
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse(500, { error: 'Failed to remove user from lab' });
  }
};