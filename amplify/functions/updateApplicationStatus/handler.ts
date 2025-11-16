import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ScanCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Cache-Control',
  'Access-Control-Allow-Methods': 'POST,OPTIONS'
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));

  // Handle CORS preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    };
  }

  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required');
    }

    const { matchId, status } = JSON.parse(event.body);

    if (!matchId || !status) {
      return createErrorResponse(400, 'Missing required parameters: matchId and status');
    }

    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';

    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);

    // Check if user has permission to update applications
    const hasPermission = userRoles.some(role => ['Admin', 'Professor', 'LabAssistant'].includes(role));
    if (!hasPermission) {
      return createErrorResponse(403, 'Unauthorized. You do not have permission to update application status.');
    }

    console.log('User roles:', userRoles);
    console.log('User ID:', userId);

    // Find the Match table dynamically
    const listTablesCommand = new ScanCommand({
      TableName: 'PLACEHOLDER' // This will fail, but we need to find table names differently
    });

    // Use a hardcoded table name for now - in production this should be from environment variables
    const matchTable = 'Match-3izs4njl3bfj5m7mmysz2zbwz4-NONE';

    // Find the match by ID
    const scanCommand = new ScanCommand({
      TableName: matchTable,
      FilterExpression: 'id = :matchId',
      ExpressionAttributeValues: marshall({
        ':matchId': matchId
      })
    });

    const scanResult = await client.send(scanCommand);

    if (!scanResult.Items || scanResult.Items.length === 0) {
      return createErrorResponse(404, 'Application not found');
    }

    const match = unmarshall(scanResult.Items[0]);

    // Update the match status
    const updateCommand = new UpdateItemCommand({
      TableName: matchTable,
      Key: marshall({ id: matchId }),
      UpdateExpression: 'SET #status = :status, updatedAt = :updatedAt',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: marshall({
        ':status': status,
        ':updatedAt': new Date().toISOString()
      }),
      ReturnValues: 'ALL_NEW'
    });

    const updateResult = await client.send(updateCommand);

    if (updateResult.Attributes) {
      const updatedMatch = unmarshall(updateResult.Attributes);
      console.log('Match updated successfully:', updatedMatch);

      return createSuccessResponse({
        message: 'Application status updated successfully',
        match: updatedMatch
      });
    } else {
      return createErrorResponse(500, 'Failed to update application status');
    }

  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Failed to update application status');
  }
};