import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ListTablesCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Check user roles
    const isAdmin = groups.includes('Admin');
    const isProfessor = groups.includes('Professor');
    const isLabAssistant = groups.includes('LabAssistant');
    
    // If not an admin, professor, or lab assistant, deny access
    if (!isAdmin && !isProfessor && !isLabAssistant) {
      return {
        statusCode: 403,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'Unauthorized. You need Admin, Professor, or LabAssistant role to access this resource.' }),
      };
    }
    
    // Find the User table dynamically
    //******* */ this is  a temporary solution,  once in production, I will specify the table name
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    const userTable = tableList.TableNames?.find(name => name.startsWith('User-'));
    
    if (!userTable) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
        },
        body: JSON.stringify({ error: 'User table not found' }),
      };
    }
    
    // Scan the DynamoDB table to get all users
    const scanCommand = new ScanCommand({
      TableName: userTable,
    });
    
    const response = await client.send(scanCommand);
    
    // Transform the DynamoDB items into the format expected by the frontend
    let users = response.Items?.map(item => {
      const unmarshalledItem = unmarshall(item);
      
      // Ensure roles is always an array
      let roles: string[] = [];
      if (unmarshalledItem.roles) {
        if (Array.isArray(unmarshalledItem.roles)) {
          roles = unmarshalledItem.roles as string[];
        } else if (typeof unmarshalledItem.roles === 'string') {
          const rolesStr = unmarshalledItem.roles as string;
          roles = rolesStr.includes(',') 
            ? rolesStr.split(',') 
            : [rolesStr];
        } else {
          roles = [String(unmarshalledItem.roles)];
        }
      }
      
      // Return the user in the format expected by the frontend
      return {
        userId: unmarshalledItem.id,
        email: unmarshalledItem.email,
        roles: roles,
        labIds: unmarshalledItem.labIds || [],
        status: unmarshalledItem.status || 'UNKNOWN',
        createdAt: unmarshalledItem.createdAt,
        updatedAt: unmarshalledItem.updatedAt || unmarshalledItem.createdAt
      };
    }) || [];
    
    // If the user is not an admin, filter the users based on their role
    if (!isAdmin) {
      // For professors and lab assistants, we need to get their labs
      if (isProfessor || isLabAssistant) {
        // Get the current user's data to find their labs
        const currentUser = users.find(user => user.userId === userId);
        const userLabIds = currentUser?.labIds || [];
        
        if (isProfessor) {
          // Professors can see all students in their labs
          // Filter users to only include students in the professor's labs
          users = users.filter(user => {
            // Include the user if they're a student and share at least one lab with the professor
            const isStudent = user.roles.includes('Student');
            const inProfessorLab = user.labIds?.some(labId => userLabIds.includes(labId));
            
            return isStudent && inProfessorLab;
          });
        } else if (isLabAssistant) {
          // Lab assistants can see all students in the labs they assist
          // Filter users to only include students in the lab assistant's labs
          users = users.filter(user => {
            // Include the user if they're a student and share at least one lab with the lab assistant
            const isStudent = user.roles.includes('Student');
            const inAssistantLab = user.labIds?.some(labId => userLabIds.includes(labId));
            
            return isStudent && inAssistantLab;
          });
        }
      }
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
      },
      body: JSON.stringify({ 
        users: users,
        count: users.length
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
      body: JSON.stringify({ error: 'Failed to retrieve users' }),
    };
  }
}; 