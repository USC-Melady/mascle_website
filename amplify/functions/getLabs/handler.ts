import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ListTablesCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { hasAnyRole, canViewLab } from '../utils/rbac';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user has any of the required roles to access labs
    if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. You need Admin, Professor, or LabAssistant role to access this resource.' }),
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
    
    // Scan the DynamoDB table to get all labs
    const scanCommand = new ScanCommand({
      TableName: labTable,
    });
    
    const response = await client.send(scanCommand);
    
    // Transform the DynamoDB items into the format expected by the frontend
    let labs = response.Items?.map(item => {
      const unmarshalledItem = unmarshall(item);
      
      // Ensure labAssistantIds is always an array
      let labAssistantIds: string[] = [];
      if (unmarshalledItem.labAssistantIds) {
        if (Array.isArray(unmarshalledItem.labAssistantIds)) {
          labAssistantIds = unmarshalledItem.labAssistantIds as string[];
        } else if (typeof unmarshalledItem.labAssistantIds === 'string') {
          const idsStr = unmarshalledItem.labAssistantIds as string;
          labAssistantIds = idsStr.includes(',') 
            ? idsStr.split(',') 
            : [idsStr];
        }
      }
      
      // Return the lab in the format expected by the frontend
      return {
        labId: unmarshalledItem.id,
        name: unmarshalledItem.name,
        professorId: unmarshalledItem.professorId,
        labAssistantIds: labAssistantIds,
        description: unmarshalledItem.description || '',
        status: unmarshalledItem.status || 'ACTIVE',
        createdAt: unmarshalledItem.createdAt,
        updatedAt: unmarshalledItem.updatedAt || unmarshalledItem.createdAt
      };
    }) || [];
    
    // Filter labs based on user's role and permissions
    labs = labs.filter(lab => canViewLab(userId, userRoles, lab));
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ 
        labs: labs,
        count: labs.length
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
      body: JSON.stringify({ error: 'Failed to retrieve labs' }),
    };
  }
}; 