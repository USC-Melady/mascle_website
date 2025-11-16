import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { 
  DynamoDBClient, 
  GetItemCommand, 
  UpdateItemCommand 
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoClient = new DynamoDBClient({});
const USER_TABLE = process.env.USER_TABLE || 'User-3izs4njl3bfj5m7mmysz2zbwz4-NONE';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
};

/**
 * Create a success response
 */
const createSuccessResponse = (data: Record<string, unknown>): APIGatewayProxyResult => {
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify(data)
  };
};

/**
 * Create an error response
 */
const createErrorResponse = (statusCode: number, message: string): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify({ message })
  };
};

// Type definitions to match the schema
interface Education {
  institution: string;
  degree: string;
  major: string;
  graduationStartMonth?: string;
  graduationStartYear?: string;
  graduationEndMonth?: string;
  graduationEndYear?: string;
  gpa?: string | number;
  yearsOfExperience?: string | number;
  seniority?: string;
}

interface Experience {
  company: string;
  position: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
}

interface Project {
  title: string;
  description?: string;
  technologies?: string;
  url?: string;
}

interface ResumeDetails {
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
}

/**
 * Lambda handler to update user resume information
 */
export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle OPTIONS requests (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ message: 'CORS preflight request successful' })
    };
  }
  
  try {
    // Get the user ID from the authorizer
    const userId = event.requestContext?.authorizer?.claims['sub'];
    if (!userId) {
      return createErrorResponse(401, 'Unauthorized. Missing user ID.');
    }
    
    // Parse the request body
    if (!event.body) {
      return createErrorResponse(400, 'Missing request body');
    }
    
    const requestBody = JSON.parse(event.body);
    const { 
      resumeFileName, 
      resumeUrl, 
      resumeData, 
      resume,
      education,
      experience,
      skills,
      projects
    } = requestBody;
    
    // Check if user exists
    const getUserCommand = new GetItemCommand({
      TableName: USER_TABLE,
      Key: marshall({ id: userId }),
    });
    
    const userResponse = await dynamoClient.send(getUserCommand);
    const userExists = !!userResponse.Item;
    
    // Prepare update expression and attributes
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeValues: Record<string, string | string[] | ResumeDetails | boolean> = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Handle resume file information
    if (resumeFileName) {
      updateExpression += ', resumeFileName = :resumeFileName';
      expressionAttributeValues[':resumeFileName'] = resumeFileName;
    }
    
    if (resumeUrl) {
      updateExpression += ', resumeUrl = :resumeUrl';
      expressionAttributeValues[':resumeUrl'] = resumeUrl;
    }
    
    // Handle resume structured data
    let structuredResumeData: ResumeDetails | null = null;
    
    // Option 1: Direct resume object provided
    if (resume && typeof resume === 'object') {
      structuredResumeData = resume as ResumeDetails;
    } 
    // Option 2: Individual fields provided
    else if (education || experience || skills || projects) {
      // Get existing data first if available
      let existingResumeData: Partial<ResumeDetails> = {};
      
      if (userExists && userResponse.Item) {
        const userData = unmarshall(userResponse.Item);
        if (userData.resume) {
          try {
            existingResumeData = typeof userData.resume === 'string' 
              ? JSON.parse(userData.resume) 
              : userData.resume;
          } catch (e) {
            console.warn('Error parsing existing resume data, starting fresh', e);
          }
        }
      }
      
      structuredResumeData = {
        education: education || existingResumeData.education || [],
        experience: experience || existingResumeData.experience || [],
        skills: skills || existingResumeData.skills || [],
        projects: projects || existingResumeData.projects || []
      };
    }
    // Option 3: Legacy resumeData string
    else if (resumeData) {
      try {
        if (typeof resumeData === 'string') {
          const parsedData = JSON.parse(resumeData);
          structuredResumeData = {
            education: parsedData.education || [],
            experience: parsedData.experience || [],
            skills: parsedData.skills || [],
            projects: parsedData.projects || []
          };
        } else {
          structuredResumeData = {
            education: resumeData.education || [],
            experience: resumeData.experience || [],
            skills: resumeData.skills || [],
            projects: resumeData.projects || []
          };
        }
      } catch (e) {
        console.error('Error parsing resumeData:', e);
      }
    }
    
    // Update resume data in the database if we have structured data
    if (structuredResumeData) {
      console.log('Updating resume structured data in database:', JSON.stringify(structuredResumeData));
      
      // For backward compatibility, still save as JSON string
      updateExpression += ', resumeData = :resumeData';
      expressionAttributeValues[':resumeData'] = JSON.stringify(structuredResumeData);
      
      // Save as structured data
      updateExpression += ', resume = :resume';
      expressionAttributeValues[':resume'] = structuredResumeData;
      
      // Extract skills for searching
      if (structuredResumeData.skills && structuredResumeData.skills.length > 0) {
        updateExpression += ', skills = :skills';
        expressionAttributeValues[':skills'] = structuredResumeData.skills;
      }
    }
    
    updateExpression += ', resumeLastUpdated = :resumeLastUpdated';
    expressionAttributeValues[':resumeLastUpdated'] = new Date().toISOString();
    
    if (!userExists) {
      // If user doesn't exist, add required fields
      updateExpression += ', id = :id, userId = :userId, roles = :roles, createdAt = :createdAt, profileComplete = :profileComplete';
      expressionAttributeValues[':id'] = userId;
      expressionAttributeValues[':userId'] = userId;
      expressionAttributeValues[':roles'] = ['Student'];
      expressionAttributeValues[':createdAt'] = new Date().toISOString();
      expressionAttributeValues[':profileComplete'] = true;
    }
    
    // Update the user record
    const updateCommand = new UpdateItemCommand({
      TableName: USER_TABLE,
      Key: marshall({ id: userId }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: marshall(expressionAttributeValues),
      ReturnValues: 'ALL_NEW'
    });
    
    console.log('Executing update command with expression:', updateExpression);
    const updateResult = await dynamoClient.send(updateCommand);
    
    // Return success response
    return createSuccessResponse({
      message: userExists ? 'User resume information updated' : 'User created with resume information',
      userId,
      hasStructuredData: !!structuredResumeData,
      resumeFileName,
      resumeUrl,
      updatedAt: new Date().toISOString(),
      result: unmarshall(updateResult.Attributes || {})
    });
  } catch (error) {
    console.error('Error updating user resume:', error);
    return createErrorResponse(
      500, 
      `Error updating user resume: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}; 