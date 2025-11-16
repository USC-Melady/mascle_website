import { APIGatewayProxyHandler } from 'aws-lambda';
import { 
  DynamoDBClient, 
  ListTablesCommand, 
  ScanCommand,
  GetItemCommand
} from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { hasAnyRole, hasRole, canViewJob, Job } from '../utils/rbac';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  // Handle OPTIONS requests (preflight requests for CORS)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,Cache-Control,X-Api-Key,X-Amz-Date,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,OPTIONS',
        'Access-Control-Max-Age': '86400', // 24 hours
      },
      body: JSON.stringify({ message: 'CORS preflight successful' })
    };
  }
  
  try {
    // Get the jobId from the path parameters
    const jobId = event.pathParameters?.jobId;
    
    if (!jobId) {
      return createErrorResponse(400, 'Missing required parameter: jobId is required');
    }
    
    // Get user groups and user ID from the authorizer
    const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
    const userId = event.requestContext.authorizer?.claims['sub'] || '';
    
    // Parse groups into an array if it's a string
    const userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
    
    // Check if user has any of the required roles to view applications
    if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      return createErrorResponse(403, 'Unauthorized. You need Admin, Professor, or LabAssistant role to view applications.');
    }
    
    // Find the Job, Match, and User tables dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    const jobTable = tableList.TableNames?.find(name => name.startsWith('Job-'));
    const matchTable = tableList.TableNames?.find(name => name.startsWith('Match-'));
    const userTable = tableList.TableNames?.find(name => name.startsWith('User-'));
    
    console.log('Using tables:', {
      jobTable,
      matchTable,
      userTable
    });
    
    if (!jobTable || !matchTable) {
      return createErrorResponse(500, 'Required database tables not found');
    }
    
    // First, get the job to check if the user has permission to view its applications
    const getJobCommand = new GetItemCommand({
      TableName: jobTable,
      Key: marshall({ id: jobId }),
    });
    
    const jobResponse = await client.send(getJobCommand);
    
    if (!jobResponse.Item) {
      return createErrorResponse(404, 'Job not found');
    }
    
    const job = unmarshall(jobResponse.Item) as Job;
    
    // Check permissions using the RBAC utility for all except admins
    if (!hasRole(userRoles, 'Admin') && !canViewJob(userId, userRoles, job)) {
      return createErrorResponse(403, 'You do not have permission to view applications for this job');
    }
    
    // Fetch all applications for the job
    const applicationsCommand = new ScanCommand({
      TableName: matchTable,
      FilterExpression: "jobId = :jobId",
      ExpressionAttributeValues: {
        ":jobId": { S: jobId }
      }
    });
    
    const applicationsResponse = await client.send(applicationsCommand);
    const applications = (applicationsResponse.Items || []).map(item => unmarshall(item));
    
    console.log(`Found ${applications.length} applications for job ${jobId}`);
    
    // Enhance applications with user details if possible
    if (userTable) {
      console.log(`Enhancing ${applications.length} applications with user details`);
      
      for (const app of applications) {
        // First, handle the userId field - applications may use either 'userId' or 'studentId'
        const applicantId = app.userId || app.studentId;
        
        if (applicantId) {
          try {
            console.log(`Looking up user details for application with userId: ${applicantId}`);
            
            const getUserCommand = new GetItemCommand({
              TableName: userTable,
              Key: marshall({ id: applicantId }),
            });
            
            const userResponse = await client.send(getUserCommand);
            
            if (userResponse.Item) {
              const user = unmarshall(userResponse.Item);
              console.log(`User data found for ${applicantId}:`, { 
                hasEmail: !!user.email,
                hasFullName: !!user.fullName,
                hasResumeFileName: !!user.resumeFileName 
              });
              
              // Merge application userDetails with user table data (application data takes precedence)
              app.userDetails = {
                email: app.userDetails?.email || user.email || '',
                fullName: app.userDetails?.fullName || user.fullName || '',
                phone: app.userDetails?.phone || user.phone || '',
                education: app.userDetails?.education || user.education || '',
                // Keep any application-specific user details that might exist
                ...(app.userDetails || {}),
                // Add application questions from the Match table itself
                summerAvailability: app.summerAvailability || app.userDetails?.summerAvailability || '',
                hoursPerWeek: app.hoursPerWeek || app.userDetails?.hoursPerWeek || '',
                expectations: app.expectations || app.userDetails?.expectations || ''
              };
              
              // Directly include the resume URL if it exists
              if (user.resumeFileName || app.resumeUrl) {
                app.resumeUrl = app.resumeUrl || user.resumeFileName;
                console.log(`Resume URL for user ${applicantId}: ${app.resumeUrl}`);
                
                // Make sure resumeUrl is also included in the userDetails for backward compatibility
                app.userDetails.resumeUrl = app.resumeUrl;
              } else {
                console.log(`No resume found for user ${applicantId}`);
              }
              
              // Add resume data if available (prefer application stored data over user table)
              if (app.resumeDetails && typeof app.resumeDetails === 'string') {
                try {
                  app.resumeDetails = JSON.parse(app.resumeDetails);
                  console.log(`Resume details parsed from application data for user ${applicantId}`);
                } catch (parseError) {
                  console.error(`Error parsing application resume data: ${parseError}`);
                }
              } else if (user.resumeData) {
                try {
                  app.resumeDetails = JSON.parse(user.resumeData);
                  console.log(`Resume details added from user table for user ${applicantId}`);
                } catch (parseError) {
                  console.error(`Error parsing user table resume data: ${parseError}`);
                }
              }
            } else {
              console.log(`No user data found for userId: ${applicantId}`);
              
              // Even without user table data, ensure application questions are available
              if (!app.userDetails) {
                app.userDetails = {};
              }
              app.userDetails.summerAvailability = app.summerAvailability || '';
              app.userDetails.hoursPerWeek = app.hoursPerWeek || '';
              app.userDetails.expectations = app.expectations || '';
            }
          } catch (error) {
            console.error(`Error fetching user details for application ${app.id || app.matchId}:`, error);
          }
        } else {
          console.log(`Application has no userId or studentId: ${app.id || app.matchId}`);
          
          // Still ensure application questions are available
          if (!app.userDetails) {
            app.userDetails = {};
          }
          app.userDetails.summerAvailability = app.summerAvailability || '';
          app.userDetails.hoursPerWeek = app.hoursPerWeek || '';
          app.userDetails.expectations = app.expectations || '';
        }
        
        // Ensure the main application object also has these fields for backward compatibility
        app.summerAvailability = app.summerAvailability || app.userDetails?.summerAvailability || '';
        app.hoursPerWeek = app.hoursPerWeek || app.userDetails?.hoursPerWeek || '';
        app.expectations = app.expectations || app.userDetails?.expectations || '';
      }
      
      // Log the final enhanced applications
      console.log('Applications with resume URLs:', applications
        .filter(app => app.resumeUrl)
        .map(app => ({ userId: app.userId || app.studentId, resumeUrl: app.resumeUrl }))
      );
    }
    
    // Log the complete application data that will be returned
    console.log('Applications to be returned:', applications.map(app => ({
      id: app.id,
      studentId: app.userId || app.studentId,
      hasUserDetails: !!app.userDetails,
      hasResumeDetails: !!app.resumeDetails,
      hasResumeUrl: !!app.resumeUrl,
      resumeUrl: app.resumeUrl,
      summerAvailability: app.summerAvailability,
      hoursPerWeek: app.hoursPerWeek,
      expectations: app.expectations
    })));
    
    return createSuccessResponse({ 
      applications,
      count: applications.length
    });
  } catch (error) {
    console.error('Error:', error);
    return createErrorResponse(500, 'Failed to fetch job applications');
  }
}; 