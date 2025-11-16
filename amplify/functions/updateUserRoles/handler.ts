import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { 
  CognitoIdentityProviderClient, 
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminListGroupsForUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({});

// Valid roles
const VALID_ROLES = ['Admin', 'Professor', 'LabAssistant', 'Student'];

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Update User Roles Lambda triggered', event);

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { userId, roles } = requestBody;

    if (!userId || !roles || !Array.isArray(roles)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'userId and roles array are required' })
      };
    }

    // Validate roles
    const invalidRoles = roles.filter(role => !VALID_ROLES.includes(role));
    if (invalidRoles.length > 0) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: `Invalid roles: ${invalidRoles.join(', ')}` })
      };
    }

    // Get user pool ID from environment variable
    const userPoolId = process.env.USER_POOL_ID;
    if (!userPoolId) {
      console.error('USER_POOL_ID environment variable is not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Get table name from environment variable
    const userTableName = process.env.USER_TABLE_NAME;
    if (!userTableName) {
      console.error('USER_TABLE_NAME environment variable is not set');
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'Server configuration error' })
      };
    }

    // Get the user from DynamoDB to get the Cognito username
    const getUserResult = await ddbDocClient.send(
      new GetCommand({
        TableName: userTableName,
        Key: { id: userId }
      })
    );

    const user = getUserResult.Item;
    if (!user) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Get current groups for the user
    const listGroupsResult = await cognitoClient.send(
      new AdminListGroupsForUserCommand({
        UserPoolId: userPoolId,
        Username: user.email // Using email as username
      })
    );

    const currentGroups = listGroupsResult.Groups?.map(group => group.GroupName) || [];
    
    // Determine groups to add and remove
    const groupsToAdd = roles.filter(role => !currentGroups.includes(role));
    const groupsToRemove = currentGroups.filter(group => !roles.includes(group));

    // Add user to new groups
    for (const groupName of groupsToAdd) {
      await cognitoClient.send(
        new AdminAddUserToGroupCommand({
          UserPoolId: userPoolId,
          Username: user.email,
          GroupName: groupName
        })
      );
    }

    // Remove user from groups that are no longer assigned
    for (const groupName of groupsToRemove) {
      await cognitoClient.send(
        new AdminRemoveUserFromGroupCommand({
          UserPoolId: userPoolId,
          Username: user.email,
          GroupName: groupName
        })
      );
    }

    // Update user roles in DynamoDB
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: userTableName,
        Key: { id: userId },
        UpdateExpression: 'SET #roles = :roles, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#roles': 'roles',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':roles': roles,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      })
    );

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({ 
        message: 'User roles updated successfully',
        userId,
        roles,
        groupsAdded: groupsToAdd,
        groupsRemoved: groupsToRemove
      })
    };
  } catch (error) {
    console.error('Error updating user roles:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({ error: 'Failed to update user roles' })
    };
  }
}; 