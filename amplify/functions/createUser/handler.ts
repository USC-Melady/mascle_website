import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import * as AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const USER_TABLE = process.env.USER_TABLE || 'User-fdob2vhf5rcx5nmzeui5vspzqu-NONE';

interface CreateUserRequest {
  email: string;
  temporaryPassword: string;
  roles: string[];
  givenName?: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Content-Type': 'application/json'
  };

  // Handle OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Request body is required' })
      };
    }

    const { email, temporaryPassword, roles, givenName } = JSON.parse(event.body) as CreateUserRequest;

    if (!email || !temporaryPassword || !roles || roles.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email, password, and at least one role are required' })
      };
    }

    // Create the user in Cognito
    const userPoolId = process.env.USER_POOL_ID;
    
    if (!userPoolId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'User pool ID environment variable is not set' })
      };
    }

    // Create user in Cognito
    const cognitoParams = {
      UserPoolId: userPoolId,
      Username: email,
      TemporaryPassword: temporaryPassword,
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
          Name: 'given_name',
          Value: givenName || email.split('@')[0] // Use provided name or default to part before @
        }
      ]
    };

    const cognitoResult = await cognito.adminCreateUser(cognitoParams).promise();
    const userId = cognitoResult.User?.Username || uuidv4();

    // Add user to groups based on roles
    for (const role of roles) {
      try {
        await cognito.adminAddUserToGroup({
          UserPoolId: userPoolId,
          Username: userId,
          GroupName: role
        }).promise();
      } catch (error) {
        console.error(`Error adding user to group ${role}:`, error);
      }
    }

    // Create user record in DynamoDB
    const timestamp = new Date().toISOString();
    const userItem = {
      id: userId,
      userId,
      email,
      roles,
      givenName: givenName || email.split('@')[0],
      status: 'FORCE_CHANGE_PASSWORD',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    await docClient.send(new PutCommand({
      TableName: USER_TABLE,
      Item: userItem
    }));

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(userItem)
    };
  } catch (error) {
    console.error('Error creating user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      })
    };
  }
}; 