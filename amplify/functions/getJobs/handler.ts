import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient, ListTablesCommand, ScanCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';
import { hasAnyRole, hasRole, canViewJob, Lab, Job } from '../utils/rbac';
import { createSuccessResponse, createErrorResponse } from '../utils/response';

const client = new DynamoDBClient({});

// Define a frontend job type that includes all the fields we need
interface FrontendJob extends Job {
  title?: string;
  description?: string;
  requirements?: string[];
  visibility?: string;
  applicantsCount?: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,Cache-Control',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
};

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Check if this is a public request (no auth needed)
    const isPublicRequest = event.path && (
      event.path.startsWith('/public-jobs') || 
      event.resource === '/public-jobs' || 
      event.resource === '/public-jobs/{jobId}'
    );
    
    console.log(`Request type: ${isPublicRequest ? 'PUBLIC' : 'AUTHENTICATED'}`);
    
    let userRoles: string[] = [];
    let userId = '';
    
    // If not a public request, validate authentication
    if (!isPublicRequest) {
      // Get user groups and user ID from the authorizer
      const groups = event.requestContext.authorizer?.claims['cognito:groups'] || '';
      userId = event.requestContext.authorizer?.claims['sub'] || '';
      
      // Parse groups into an array if it's a string
      userRoles = Array.isArray(groups) ? groups : (typeof groups === 'string' ? groups.split(',') : []);
      
      // Check if user has any of the required roles to access jobs
      if (!hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant', 'Student'])) {
        return createErrorResponse(403, 'Unauthorized. You need a valid role to access this resource.');
      }
      
      console.log('User roles:', userRoles);
      console.log('User ID:', userId);
    }
    
    // Get query parameters
    const queryParams = event.queryStringParameters || {};
    const labId = queryParams.labId;
    const status = queryParams.status;
    const jobId = event.pathParameters?.jobId;
    
    // Find the Job and Lab tables dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    // Use the specific job table name instead of finding it dynamically
    const jobTable = 'Job-3izs4njl3bfj5m7mmysz2zbwz4-NONE';
    // Find the lab table name dynamically (keep this part)
    const labTable = tableList.TableNames?.find(name => name.startsWith('Lab-'));
    
    console.log('Using job table:', jobTable);
    if (labTable) {
      console.log('Using lab table:', labTable);
    } else {
      console.log('Warning: Lab table not found, job details may be incomplete');
      if (!isPublicRequest) {
        return createErrorResponse(500, 'Lab table not found. Cannot determine access permissions.');
      }
    }
    
    // If the user is a professor or lab assistant, we need to determine which labs they're associated with
    let userLabs: Lab[] = [];
    if (!isPublicRequest && hasAnyRole(userRoles, ['Professor', 'LabAssistant']) && !hasRole(userRoles, 'Admin')) {
      try {
        // Get labs where the user is a professor
        if (hasRole(userRoles, 'Professor')) {
          // Query for labs where user is the primary professor
          const primaryLabsCommand = new ScanCommand({
            TableName: labTable,
            FilterExpression: "professorId = :userId",
            ExpressionAttributeValues: {
              ":userId": { S: userId }
            }
          });
          
          const primaryLabsResponse = await client.send(primaryLabsCommand);
          
          // Query for labs where user is in the professorIds array
          const secondaryLabsCommand = new ScanCommand({
            TableName: labTable,
            FilterExpression: "contains(professorIds, :userId)",
            ExpressionAttributeValues: {
              ":userId": { S: userId }
            }
          });
          
          const secondaryLabsResponse = await client.send(secondaryLabsCommand);
          
          // Combine the results
          const primaryLabs = (primaryLabsResponse.Items || []).map(item => unmarshall(item) as Lab);
          const secondaryLabs = (secondaryLabsResponse.Items || []).map(item => unmarshall(item) as Lab);
          
          userLabs = [...primaryLabs, ...secondaryLabs];
        }
        
        // Get labs where the user is a lab assistant
        if (hasRole(userRoles, 'LabAssistant')) {
          const assistantLabsCommand = new ScanCommand({
            TableName: labTable,
            FilterExpression: "contains(labAssistantIds, :userId)",
            ExpressionAttributeValues: {
              ":userId": { S: userId }
            }
          });
          
          const assistantLabsResponse = await client.send(assistantLabsCommand);
          const assistantLabs = (assistantLabsResponse.Items || []).map(item => unmarshall(item) as Lab);
          
          // Add to userLabs if not already present
          for (const lab of assistantLabs) {
            if (!userLabs.some(userLab => userLab.id === lab.id)) {
              userLabs.push(lab);
            }
          }
        }
        
        console.log(`Found ${userLabs.length} labs associated with user ${userId}`);
      } catch (error) {
        console.error('Error fetching user labs:', error);
      }
    }
    
    // If specific jobId is requested
    if (jobId) {
      console.log(`Looking for specific job with ID: ${jobId}`);
      const getCommand = new ScanCommand({
        TableName: jobTable,
        FilterExpression: "id = :jobId OR jobId = :jobId",
        ExpressionAttributeValues: {
          ":jobId": { S: jobId }
        }
      });
      
      const response = await client.send(getCommand);
      
      if (!response.Items || response.Items.length === 0) {
        return createErrorResponse(404, 'Job not found');
      }
      
      const jobItem = response.Items[0];
      const unmarshalledItem = unmarshall(jobItem);
      
      // For public requests, only return OPEN jobs that are marked as public
      if (isPublicRequest) {
        const isOpen = unmarshalledItem.status?.toUpperCase() === 'OPEN' || unmarshalledItem.status === 'Open';
        const isPublicVisible = !unmarshalledItem.visibility || unmarshalledItem.visibility === 'public';
        
        if (!isOpen || !isPublicVisible) {
          return createErrorResponse(404, 'Job not found or not available');
        }
      }
      
      // If we have a lab table and the job has a labId, get the lab details
      let lab: Lab | undefined = undefined;
      
      if (labTable && unmarshalledItem.labId) {
        try {
          // Use a scan with filter
          const scanForLabCommand = new ScanCommand({
            TableName: labTable,
            FilterExpression: "id = :labId OR labId = :labId",
            ExpressionAttributeValues: {
              ":labId": { S: unmarshalledItem.labId }
            }
          });
          
          const scanLabResponse = await client.send(scanForLabCommand);
          
          if (scanLabResponse.Items && scanLabResponse.Items.length > 0) {
            lab = unmarshall(scanLabResponse.Items[0]) as Lab;
            console.log(`Found lab for job: ${lab.name || lab.id || lab.labId}`);
          }
        } catch (error) {
          console.error(`Error fetching lab for job:`, error);
        }
      }
      
      const job: FrontendJob = {
        jobId: unmarshalledItem.jobId || unmarshalledItem.id,
        id: unmarshalledItem.id || unmarshalledItem.jobId,
        title: unmarshalledItem.title || '',
        description: unmarshalledItem.description || '',
        labId: unmarshalledItem.labId,
        professorId: unmarshalledItem.professorId,
        status: unmarshalledItem.status || 'DRAFT',
        visibility: unmarshalledItem.visibility || 'public',
        requirements: unmarshalledItem.requirements || [],
        createdAt: unmarshalledItem.createdAt,
        updatedAt: unmarshalledItem.updatedAt || unmarshalledItem.createdAt
      };
      
      // Add lab info if available
      if (lab) {
        // For public endpoints, only include non-sensitive lab info
        if (isPublicRequest) {
          job.lab = {
            id: lab.id,
            labId: lab.labId,
            name: lab.name,
            description: lab.description
          };
        } else {
          job.lab = lab;
        }
      }
      
      // For professors, lab assistants, and admins only, fetch application count
      if (!isPublicRequest && hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
        try {
          // Find the Match table
          const matchTable = tableList.TableNames?.find(name => name.startsWith('Match-'));
          
          if (matchTable && job.jobId) {
            // Count applications for this job
            const applicationsCommand = new ScanCommand({
              TableName: matchTable,
              FilterExpression: "jobId = :jobId",
              ExpressionAttributeValues: {
                ":jobId": { S: job.jobId }
              }
            });
            
            const applicationsResponse = await client.send(applicationsCommand);
            const applications = applicationsResponse.Items || [];
            
            job.applicantsCount = applications.length;
            console.log(`Job ${job.jobId} has ${job.applicantsCount} applications`);
          }
        } catch (error) {
          console.error(`Error fetching application count for job ${job.jobId}:`, error);
        }
      }
      
      // For authenticated requests, check permissions
      if (!isPublicRequest && !hasRole(userRoles, 'Admin')) {
        const canAccess = canViewJob(userId, userRoles, job);
        if (!canAccess) {
          return createErrorResponse(403, 'You do not have permission to view this job');
        }
      }
      
      // For student role, remove applicant count
      if (hasRole(userRoles, 'Student') && !hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
        // Create a new object without the applicantsCount property
        const jobWithoutCount = { ...job };
        delete jobWithoutCount.applicantsCount;
        return createSuccessResponse(jobWithoutCount);
      }
      
      return createSuccessResponse(job);
    }
    
    // Get all jobs from the database
    const scanCommand = new ScanCommand({
      TableName: jobTable,
      FilterExpression: "attribute_not_exists(deletedAt) OR deletedAt = :null",
      ExpressionAttributeValues: {
        ":null": { NULL: true }
      }
    });
    
    const response = await client.send(scanCommand);
    console.log(`Found ${response.Items?.length || 0} jobs in database`);
    
    // Process each job to include lab information
    let jobs = await Promise.all((response.Items || []).map(async (item) => {
      const unmarshalledItem = unmarshall(item);
      console.log('Processing job:', unmarshalledItem);
      
      // If we have a lab table and the job has a labId, get the lab details
      let lab: Lab | undefined = undefined;
      
      // First, check if this lab is already in our userLabs array (for professors and lab assistants)
      if (unmarshalledItem.labId && userLabs.length > 0) {
        lab = userLabs.find(userLab => userLab.id === unmarshalledItem.labId || userLab.labId === unmarshalledItem.labId);
      }
      
      // If we didn't find it in userLabs or user is admin, fetch it directly
      if (!lab && labTable && unmarshalledItem.labId) {
        try {
          // Use a scan with filter
          const scanForLabCommand = new ScanCommand({
            TableName: labTable,
            FilterExpression: "id = :labId OR labId = :labId",
            ExpressionAttributeValues: {
              ":labId": { S: unmarshalledItem.labId }
            }
          });
          
          const scanLabResponse = await client.send(scanForLabCommand);
          
          if (scanLabResponse.Items && scanLabResponse.Items.length > 0) {
            lab = unmarshall(scanLabResponse.Items[0]) as Lab;
            console.log(`Found lab for job: ${lab.name || lab.id || lab.labId}`);
          }
        } catch (error) {
          console.error(`Error fetching lab for job:`, error);
        }
      }
      
      // Return the job in the format expected by the frontend
      const job: FrontendJob = {
        jobId: unmarshalledItem.jobId || unmarshalledItem.id,
        id: unmarshalledItem.id || unmarshalledItem.jobId,
        title: unmarshalledItem.title || '',
        description: unmarshalledItem.description || '',
        labId: unmarshalledItem.labId,
        professorId: unmarshalledItem.professorId || unmarshalledItem.createdBy,
        createdBy: unmarshalledItem.createdBy,
        status: unmarshalledItem.status || 'DRAFT',
        visibility: unmarshalledItem.visibility || 'public',
        requirements: unmarshalledItem.requirements || [],
        createdAt: unmarshalledItem.createdAt,
        updatedAt: unmarshalledItem.updatedAt || unmarshalledItem.createdAt,
        applicantsCount: 0
      };
      
      // Add lab info if available
      if (lab) {
        // For public endpoints, only include non-sensitive lab info
        if (isPublicRequest) {
          job.lab = {
            id: lab.id,
            labId: lab.labId,
            name: lab.name,
            description: lab.description
          };
        } else {
          job.lab = lab;
        }
      }
      
      // For professors, lab assistants, and admins only, fetch application count
      if (!isPublicRequest && hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
        try {
          // Find the Match table
          const matchTable = tableList.TableNames?.find(name => name.startsWith('Match-'));
          
          if (matchTable && job.jobId) {
            // Count applications for this job
            const applicationsCommand = new ScanCommand({
              TableName: matchTable,
              FilterExpression: "jobId = :jobId",
              ExpressionAttributeValues: {
                ":jobId": { S: job.jobId }
              }
            });
            
            const applicationsResponse = await client.send(applicationsCommand);
            const applications = applicationsResponse.Items || [];
            
            job.applicantsCount = applications.length;
            console.log(`Job ${job.jobId} has ${job.applicantsCount} applications`);
          }
        } catch (error) {
          console.error(`Error fetching application count for job ${job.jobId}:`, error);
        }
      }
      
      // For authenticated requests, check permissions
      if (!isPublicRequest && !hasRole(userRoles, 'Admin')) {
        const canAccess = canViewJob(userId, userRoles, job);
        if (!canAccess) {
          console.log(`User ${userId} cannot access job ${job.id || job.jobId} with title "${job.title}"`);
        }
      }
      
      // For student role, remove applicant count
      if (hasRole(userRoles, 'Student') && !hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
        // Create a new object without the applicantsCount property
        const jobWithoutCount = { ...job };
        delete jobWithoutCount.applicantsCount;
        return jobWithoutCount as FrontendJob;
      }
      
      return job;
    }));
    
    console.log(`Retrieved ${jobs.length} total jobs before filtering`);
    
    // Filter jobs based on query parameters
    if (labId) {
      jobs = jobs.filter(job => job.labId === labId);
      console.log(`Filtered to ${jobs.length} jobs in lab ${labId}`);
    }
    
    if (status) {
      jobs = jobs.filter(job => job.status === status);
      console.log(`Filtered to ${jobs.length} jobs with status ${status}`);
    }
    
    // For professors, lab assistants, and admins only, fetch application counts
    if (!isPublicRequest && hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      try {
        console.log('Fetching application counts for jobs...');
        // Find the Match table
        const matchTable = tableList.TableNames?.find(name => name.startsWith('Match-'));
        
        if (matchTable) {
          console.log(`Found Match table: ${matchTable}`);
          
          // Get all applications
          const applicationsCommand = new ScanCommand({
            TableName: matchTable
          });
          
          const applicationsResponse = await client.send(applicationsCommand);
          const applications = applicationsResponse.Items || [];
          
          console.log(`Found ${applications.length} total applications`);
          
          // Count applications per job
          const applicationCountsByJob: Record<string, number> = {};
          
          for (const app of applications) {
            const application = unmarshall(app);
            const jobId = application.jobId;
            
            if (jobId) {
              applicationCountsByJob[jobId] = (applicationCountsByJob[jobId] || 0) + 1;
            }
          }
          
          // Update the jobs with application counts
          for (const job of jobs) {
            const jobId = job.id || job.jobId;
            if (jobId && applicationCountsByJob[jobId]) {
              job.applicantsCount = applicationCountsByJob[jobId];
            }
          }
          
          console.log('Application counts added to jobs');
        }
      } catch (error) {
        console.error('Error fetching application counts:', error);
      }
    }
    
    // For public requests, only return OPEN jobs that are marked as public
    if (isPublicRequest) {
      jobs = jobs.filter(job => {
        const isOpen = job.status?.toUpperCase() === 'OPEN' || job.status === 'Open';
        const isPublicVisible = !job.visibility || job.visibility === 'public';
        return isOpen && isPublicVisible;
      });
      console.log(`Filtered to ${jobs.length} OPEN and public jobs for public access`);
      
      // Remove sensitive fields from public job listings and limit description
      jobs = jobs.map(job => ({
        jobId: job.jobId,
        id: job.id,
        title: job.title,
        // Limit description to first 150 characters for public view
        description: job.description ? (job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description) : '',
        // Hide detailed requirements for public view
        requirements: job.requirements ? ['View details by logging in'] : [],
        status: job.status,
        visibility: job.visibility,
        isPreview: true, // Flag to indicate this is a limited preview
        lab: job.lab ? {
          id: job.lab.id,
          labId: job.lab.labId,
          name: job.lab.name,
          // Also limit lab description
          description: job.lab.description ? (job.lab.description.length > 100 ? job.lab.description.substring(0, 100) + '...' : job.lab.description) : ''
        } : undefined,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt
      }));
      
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ 
          jobs,
          count: jobs.length
        })
      };
    }
    
    // For student role only, remove applicant counts
    if (hasRole(userRoles, 'Student') && !hasAnyRole(userRoles, ['Admin', 'Professor', 'LabAssistant'])) {
      console.log('Removing application counts for student role');
      jobs = jobs.map(job => {
        // Create a new object without the applicantsCount property
        const jobWithoutCount = { ...job };
        delete jobWithoutCount.applicantsCount;
        return jobWithoutCount as FrontendJob;
      });
    }
    
    // Filter jobs based on user's role and permissions
    let accessibleJobs: FrontendJob[] = [];
    
    // For admins, return all jobs regardless of lab info - bypass permissions check
    if (hasRole(userRoles, 'Admin')) {
      console.log(`User ${userId} is an admin - returning all jobs without permission filtering`);
      accessibleJobs = jobs;
      
      // Even though we're returning all jobs to admins, still log any job without lab info for debugging
      const jobsWithoutLabs = jobs.filter(job => !job.lab);
      if (jobsWithoutLabs.length > 0) {
        console.log(`NOTE: ${jobsWithoutLabs.length} jobs are missing lab information:`);
        jobsWithoutLabs.forEach(job => {
          console.log(`- Job ${job.id || job.jobId} (${job.title}) with labId ${job.labId} has no lab info`);
        });
      }
    } else {
      // Non-admin users go through permission checks as usual
      accessibleJobs = jobs.filter(job => {
        // Ensure job has consistent ID fields
        if (job.id !== job.jobId && job.id && job.jobId) {
          console.log(`WARNING: Job has inconsistent IDs - id: ${job.id}, jobId: ${job.jobId}`);
        }
        
        // Log job data for debugging
        console.log(`Checking permissions for job: ${JSON.stringify({
          id: job.id || job.jobId,
          title: job.title,
          labId: job.labId,
          professorId: job.professorId,
          createdBy: job.createdBy,
          hasLabInfo: !!job.lab
        })}`);
        
        const canAccess = canViewJob(userId, userRoles, job);
        if (!canAccess) {
          console.log(`User ${userId} cannot access job ${job.id || job.jobId} with title "${job.title}"`);
        }
        return canAccess;
      });
    }
    
    console.log(`User ${userId} has access to ${accessibleJobs.length} out of ${jobs.length} jobs`);
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ 
        jobs: accessibleJobs,
        count: accessibleJobs.length
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Failed to retrieve jobs' })
    };
  }
}; 