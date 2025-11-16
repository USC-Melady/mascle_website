import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { 
  CognitoIdentityProviderClient, 
  AdminDisableUserCommand,
  AdminEnableUserCommand
} from '@aws-sdk/client-cognito-identity-provider';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({});

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Update User Status Lambda triggered', event);

  try {
    // Parse request body
    const requestBody = JSON.parse(event.body || '{}');
    const { userId, status } = requestBody;

    if (!userId || !status) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*'
        },
        body: JSON.stringify({ error: 'userId and status are required' })
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

    // Update user status in Cognito
    if (status === 'DISABLED') {
      // Disable user in Cognito
      await cognitoClient.send(
        new AdminDisableUserCommand({
          UserPoolId: userPoolId,
          Username: user.email // Using email as username
        })
      );
    } else if (status === 'CONFIRMED') {
      // Enable user in Cognito
      await cognitoClient.send(
        new AdminEnableUserCommand({
          UserPoolId: userPoolId,
          Username: user.email // Using email as username
        })
      );
    }
    // Note: FORCE_CHANGE_PASSWORD would require additional Cognito API calls

    // Update user status in DynamoDB
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: userTableName,
        Key: { id: userId },
        UpdateExpression: 'SET #status = :status, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#status': 'status',
          '#updatedAt': 'updatedAt'
        },
        ExpressionAttributeValues: {
          ':status': status,
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
        message: 'User status updated successfully',
        userId,
        status
      })
    };
  } catch (error) {
    console.error('Error updating user status:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({ error: 'Failed to update user status' })
    };
  }
}; 