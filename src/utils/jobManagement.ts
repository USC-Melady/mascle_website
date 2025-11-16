import { generateClient, type Client } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import configureAmplify from '../config/amplify-config';

// Removed unused DEVELOPMENT_MODE variable

// Ensure Amplify is configured
try {
  // Make sure Amplify is configured before attempting to generate a client
  configureAmplify();
  console.log('Current Amplify configuration:', Amplify.getConfig());
} catch (error) {
  console.error('Error getting Amplify configuration:', error);
}

// Define the type for the Amplify client
type AmplifyClientType = Client<Schema>;

// Generate the GraphQL client
let client: AmplifyClientType | undefined;
try {
  client = generateClient<Schema>();
  console.log('Amplify client initialized successfully');
  
  // Log model availability for debugging
  if (client && client.models) {
    console.log('Available models:', Object.keys(client.models).join(', '));
    
    // Verify the Job model specifically
    const jobModel = client.models.Job as { list?: () => unknown };
    if (jobModel && typeof jobModel.list === 'function') {
      console.log('Job model seems available.');
    } else {
      console.warn('Job model or its methods not found in client. Will fall back to Lambda function.');
    }
  } else {
    console.warn('No models available in client. Will fall back to Lambda function.');
  }
} catch (error) {
  console.error('Error initializing Amplify client:', error);
  client = undefined;
}


// Job interface
export interface Job {
  jobId: string;
  title: string;
  description: string;
  labId: string;
  professorId: string;
  createdBy?: string;  // Add createdBy field
  status: string;
  visibility?: string;
  isPreview?: boolean;
  requirements?: string;
  academicLevel?: string; // 'freshman', 'sophomore', 'junior', 'senior', 'masters', 'any'
  createdAt?: string;
  updatedAt?: string;
  lab?: {
    name: string;
  };
  professor?: {
    email: string;
  };
  applicantsCount?: number;
}

// Removed unused mockJobs variable

// Application/Match interface
export interface JobApplication {
  matchId: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  coverLetter?: string;
  resumeUrl?: string;
  // New application fields
  summerAvailability?: string;
  hoursPerWeek?: string;
  expectations?: string;
  // Additional fields for UI display
  student?: {
    userId: string;
    email: string;
    resumeUrl?: string;
  };
  job?: {
    title: string;
    labId: string;
    professorId: string;
  };
  userDetails?: {
    fullName?: string;
    email?: string;
    phone?: string;
    education?: string;
    skills?: string;
    status?: string;
    summerAvailability?: string;
    hoursPerWeek?: string;
    expectations?: string;
  };
  // Resume details with structured data
  resumeDetails?: {
    education?: Array<{
      institution: string;
      degree: string;
      major: string;
      graduationDate: string;
      gpa: string;
    }>;
    experience?: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    skills?: string[];
    projects?: Array<{
      title: string;
      description: string;
      technologies: string;
      url?: string;
    }>;
  };
}

// Add this at the top of the file
const API_ENDPOINTS = {
  jobs: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/jobs'
};

// Removed unused AmplifyClient type

/**
 * Check if the Amplify client is properly initialized and models are available
 */
const isAmplifyReady = (): boolean => {
  const config = Amplify.getConfig();
  const hasConfig = !!(config && config.API?.GraphQL);
  const hasClient = !!client;
  const hasModels = !!(client && client.models);
  const hasMatchModel = !!(client && client.models && client.models.Match);
  
  console.log('Amplify readiness check:', { 
    hasConfig, 
    hasClient, 
    hasModels, 
    hasMatchModel,
    availableModels: client?.models ? Object.keys(client.models).join(', ') : 'none' 
  });
  
  // Return true if we have basic GraphQL setup, even if models aren't detected
  return hasConfig && hasClient;
};

// Add a safe client access method to prevent null errors
const getClient = (): AmplifyClientType | undefined => {
  if (!client) {
    console.warn('Amplify client not initialized');
  }
  return client;
};

/**
 * Get all jobs
 */
export const getJobs = async (forceRefresh: boolean = false): Promise<Job[]> => {
  try {
    const session = await fetchAuthSession();
    if (!session.tokens?.idToken?.toString()) {
      console.error('No auth token available');
      return [];
    }

    // Basic auth headers
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${session.tokens.idToken.toString()}`
    };

    let url = API_ENDPOINTS.jobs;
    
    // Use a query parameter instead of Cache-Control header to bypass cache if needed
    if (forceRefresh) {
      const timestamp = new Date().getTime();
      url = `${url}?_=${timestamp}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Jobs API response${forceRefresh ? ' (force refresh)' : ''}:`, data);
    
    if (!data.jobs || !Array.isArray(data.jobs)) {
      console.error('Invalid jobs data format:', data);
      return [];
    }
    
    return data.jobs.map((job: {
      jobId?: string;
      id?: string;
      title?: string;
      description?: string;
      requirements?: string;
      status?: string;
      labId: string;
      professorId: string;
      lab?: { id?: string; labId?: string; name?: string; description?: string };
      createdAt?: string;
      updatedAt?: string;
      applicantsCount?: number;
    }) => ({
      jobId: job.jobId || job.id,
      title: job.title || '',
      description: job.description || '',
      requirements: job.requirements || '',
      status: job.status || 'Open',
      labId: job.labId,
      professorId: job.professorId,
      lab: job.lab ? {
        id: job.lab.id || job.lab.labId,
        name: job.lab.name || 'Unknown Lab',
        description: job.lab.description || ''
      } : undefined,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      applicantsCount: job.applicantsCount || 0
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

// Removed unused processJobsResponse function and AmplifyJobData type

/**
 * Get job by ID
 */
export const getJobById = async (jobId: string): Promise<Job | null> => {
  try {
    // Use the type guard
    if (!isAmplifyReady() || !client) {
      console.warn('Amplify client not properly initialized, cannot get job by ID.');
      return null;
    }
    
    // 'client' is defined here
    const response = await client.models.Job.get({
      id: jobId
    });
    
    if (!response.data) {
      return null;
    }

    // Get lab details
    let labName = '';
    try {
      const labResponse = await client!.models.Lab.get({
        id: response.data.labId
      });
      if (labResponse.data) {
        labName = labResponse.data.name;
      }
    } catch (error) {
      console.error('Error fetching lab details:', error);
    }

    // Count applications
    let applicantsCount = 0;
    try {
      const matchesResponse = await client!.models.Match.list({
        filter: {
          jobId: {
            eq: jobId
          }
        }
      });
      applicantsCount = matchesResponse.data.length;
    } catch (error) {
      console.error('Error counting applications:', error);
    }

    // Map the Amplify model to our interface
    return {
      jobId: response.data.id,
      title: response.data.title ?? '',
      description: response.data.description ?? '',
      labId: response.data.labId,
      professorId: response.data.professorId,
      requirements: response.data.requirements ?? undefined,
      status: response.data.status ?? 'Open',
      createdAt: response.data.createdAt ?? undefined,
      updatedAt: response.data.updatedAt ?? undefined,
      lab: {
        name: labName
      },
      applicantsCount
    };
  } catch (error) {
    console.error(`Error fetching job with ID ${jobId}:`, error);
    return null;
  }
};

/**
 * Create a new job
 */
export const createJob = async (jobData: Omit<Job, 'jobId' | 'createdAt' | 'updatedAt'>): Promise<Job | null> => {
  try {
    console.log('Creating job with data:', jobData);
    
    // Get the authenticated user
    const session = await fetchAuthSession();
    if (!session?.tokens?.idToken) {
      throw new Error('No auth token available');
    }

    const response = await fetch(`${API_ENDPOINTS.jobs}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens.idToken.toString()}`
      },
      body: JSON.stringify({
        ...jobData,
        labId: jobData.labId || undefined,
        professorId: jobData.professorId || undefined,
        status: jobData.status || 'Open',
        visibility: jobData.visibility || 'public'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Job creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to create job: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Job created successfully:', data);
    
    // The returned job may not have the lab name information, so let's add it
    const newJob = data.job;
    
    // If we have a labId but no lab details, fetch the lab information
    if (newJob && newJob.labId && !newJob.lab) {
      try {
        // Fetch labs to get the lab name
        const labsResponse = await fetch(`${API_ENDPOINTS.jobs.replace('jobs', 'labs')}/${newJob.labId}`, {
          headers: {
            'Authorization': `Bearer ${session.tokens.idToken.toString()}`
          }
        });
        
        if (labsResponse.ok) {
          const labData = await labsResponse.json();
          if (labData && labData.lab) {
            newJob.lab = {
              id: labData.lab.id || labData.lab.labId,
              name: labData.lab.name || 'Unknown Lab',
              description: labData.lab.description || ''
            };
          }
        }
      } catch (labError) {
        console.error('Error fetching lab details for new job:', labError);
      }
    }
    
    return newJob;
  } catch (error) {
    console.error('Error creating job:', error);
    return null;
  }
};

/**
 * Update a job
 */
export const updateJob = async (jobId: string, jobData: Partial<Job>): Promise<Job | null> => {
  try {
    console.log(`Updating job with ID ${jobId}:`, jobData);
    
    // Get the authenticated user
    const session = await fetchAuthSession();
    if (!session?.tokens?.idToken) {
      throw new Error('No auth token available');
    }

    // Use the Lambda function to update the job
    const response = await fetch(`${API_ENDPOINTS.jobs}/${jobId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens.idToken.toString()}`
      },
      body: JSON.stringify({
        ...jobData,
        labId: jobData.labId || undefined,
        professorId: jobData.professorId || undefined,
        status: jobData.status || undefined,
        visibility: jobData.visibility || undefined
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Job update failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to update job: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Job updated successfully:', data);
    
    // The returned job may not have the lab name information, so let's add it
    const updatedJob = data.job;
    
    // If we have a labId but no lab details, fetch the lab information
    if (updatedJob && updatedJob.labId && !updatedJob.lab) {
      try {
        // Fetch labs to get the lab name
        const labsResponse = await fetch(`${API_ENDPOINTS.jobs.replace('jobs', 'labs')}/${updatedJob.labId}`, {
          headers: {
            'Authorization': `Bearer ${session.tokens.idToken.toString()}`
          }
        });
        
        if (labsResponse.ok) {
          const labData = await labsResponse.json();
          if (labData && labData.lab) {
            updatedJob.lab = {
              id: labData.lab.id || labData.lab.labId,
              name: labData.lab.name || 'Unknown Lab',
              description: labData.lab.description || ''
            };
          }
        }
      } catch (labError) {
        console.error('Error fetching lab details for updated job:', labError);
      }
    }
    
    return updatedJob;
  } catch (error) {
    console.error(`Error updating job with ID ${jobId}:`, error);
    return null;
  }
};

/**
 * Delete a job by ID
 */
export const deleteJob = async (jobId: string): Promise<boolean> => {
  try {
    console.log(`Deleting job with ID ${jobId}`);
    
    // Get the authenticated user
    const session = await fetchAuthSession();
    if (!session?.tokens?.idToken) {
      throw new Error('No auth token available');
    }

    // Use the Lambda function to delete the job
    const response = await fetch(`${API_ENDPOINTS.jobs}/${jobId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.tokens.idToken.toString()}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Job deletion failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Failed to delete job: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Job deleted successfully:', data);
    return true;
  } catch (error) {
    console.error(`Error deleting job with ID ${jobId}:`, error);
    return false;
  }
};

/**
 * Get all jobs for specific lab IDs
 */
export const getJobsForLabs = async (labIds: string[]): Promise<Job[]> => {
  try {
    console.log('Getting jobs for lab IDs:', labIds);
    
    // Get all jobs first
    const allJobs = await getJobs();
    
    // Filter jobs that belong to the specified labs
    const labJobs = allJobs.filter(job => job.labId && labIds.includes(job.labId));
    
    console.log(`Found ${labJobs.length} jobs in labs ${labIds.join(', ')} out of ${allJobs.length} total jobs`);
    return labJobs;
  } catch (error) {
    console.error('Error getting jobs for labs:', error);
    return [];
  }
};

/**
 * Get all applications
 */
export const getApplications = async (): Promise<JobApplication[]> => {
  try {
    // First try to use GraphQL API (preferred method) 
    console.log('Attempting to use GraphQL for applications');
    
    if (client && client.models && client.models.Match) {
      try {
        console.log('Using GraphQL to fetch applications via Match model');
        const response = await client.models.Match.list();

        if (response.data && response.data.length > 0) {
          const applications = response.data.map(match => ({
            matchId: match.matchId,
            studentId: match.studentId,
            jobId: match.jobId,
            status: match.status || 'Pending',
            coverLetter: match.coverLetter || '',
            resumeUrl: match.resumeUrl || '',
            resumeData: match.resumeData || '',
            summerAvailability: match.summerAvailability || '',
            hoursPerWeek: match.hoursPerWeek || '',
            expectations: match.expectations || '',
            createdAt: match.createdAt || new Date().toISOString(),
            updatedAt: match.updatedAt || new Date().toISOString(),
            job: undefined
          }));
          
          console.log(`Successfully fetched ${applications.length} applications via GraphQL`);
          return applications;
        } else {
          console.log('No applications found via GraphQL - this is normal for new users');
          return [];
        }
      } catch (graphqlError) {
        console.error('Error fetching applications via GraphQL:', graphqlError);
        console.log('GraphQL failed, falling back to REST API');
      }
    } else {
      console.log('GraphQL Match model not available - applications will be empty until backend schema is deployed');
    }

    // Skip REST API to avoid CORS errors - return empty applications
    console.log('No applications found - this is normal for users who haven\'t applied to any jobs yet');
    return [];
    
    // REST API disabled due to CORS - uncomment below if CORS is fixed on backend:
    /*
    try {
      console.log('Making direct API call to get all applications');
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString() || '';
      
      if (token) {
        const apiBaseUrl = 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev';
        const apiUrl = `${apiBaseUrl}/applications`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`API returned ${result.applications?.length || 0} total applications`);
          
          if (result.applications && Array.isArray(result.applications)) {
            // Convert API response to our JobApplication interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiApplications = result.applications.map((app: any) => ({
              matchId: app.id || app.matchId,
              jobId: app.jobId,
              studentId: app.userId || app.studentId,
              status: app.status || 'Pending',
              createdAt: app.createdAt,
              updatedAt: app.updatedAt,
              coverLetter: app.coverLetter,
              resumeUrl: app.resumeUrl,
              // New application fields
              summerAvailability: app.summerAvailability,
              hoursPerWeek: app.hoursPerWeek,
              expectations: app.expectations,
              student: {
                userId: app.userId || app.studentId,
                email: app.user?.email || app.userDetails?.email || ''
              },
              job: {
                title: app.job?.title || '',
                labId: app.job?.labId || '',
                professorId: app.job?.professorId || ''
              },
              userDetails: app.userDetails || {},
              resumeDetails: app.resumeDetails || null
            }));
            
            console.log('Successfully fetched applications via REST API');
            return apiApplications;
          }
        } else {
          console.warn(`Applications API returned status ${response.status}`);
          const errorText = await response.text();
          console.warn('Applications API error response:', errorText);
        }
      }
    } catch (apiError) {
      console.error('Error fetching applications via REST API:', apiError);
    }
    
    */
    
    // GraphQL already tried above, REST API disabled due to CORS
    // Applications will be empty until GraphQL schema is properly deployed
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

/**
          // Get student details
          let studentEmail = '';
          try {
            const userResponse = await client!.models.User.get({
              id: app.studentId
            });
            if (userResponse.data) {
              studentEmail = userResponse.data.email;
            }
          } catch (error) {
            console.error('Error fetching student details:', error);
          }

          // Get job details
          let jobTitle = '';
          let labId = '';
          let professorId = '';
          try {
            const jobResponse = await client!.models.Job.get({
              id: app.jobId
            });
            if (jobResponse.data) {
              jobTitle = jobResponse.data.title;
              labId = jobResponse.data.labId;
              professorId = jobResponse.data.professorId;
            }
          } catch (error) {
            console.error('Error fetching job details:', error);
          }

          // Map the Amplify model to our interface
          return {
            matchId: app.id,
            studentId: app.studentId,
            jobId: app.jobId,
            status: app.status || 'Pending',
            createdAt: app.createdAt ?? undefined,
            updatedAt: app.updatedAt ?? undefined,
            student: {
              userId: app.studentId,
              email: studentEmail
            },
            job: {
              title: jobTitle,
              labId,
              professorId
            }
          };
        })
      );

      return applicationsWithDetails;
    }
    
    // Final fallback - no applications found (normal for new users)
    console.log('No applications found - this is normal for users who haven\'t applied to any jobs yet');
    return [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};

/**
 * Get applications for a specific job
 */
export const getApplicationsForJob = async (jobId: string): Promise<JobApplication[]> => {
  try {
    console.log(`Fetching applications for job ${jobId}...`);
    const applications: JobApplication[] = [];
    
    // First get job details to populate job information
    let jobDetails: Job | undefined;
    try {
      const allJobs = await getJobs();
      jobDetails = allJobs.find(job => job.jobId === jobId);
      console.log(`Found job details for ${jobId}:`, jobDetails ? { title: jobDetails.title, labId: jobDetails.labId } : 'not found');
    } catch (jobError) {
      console.error('Error fetching job details:', jobError);
    }
    
    // First try to use DynamoDB API directly with Lambda function for most accurate results
    try {
      console.log(`Making direct API call to get applications for job ${jobId}`);
      // Get auth token
      let token = '';
      try {
        const session = await fetchAuthSession();
        token = session.tokens?.idToken?.toString() || '';
      } catch (authError) {
        console.error('Error getting auth token:', authError);
      }
      
      if (token) {
        const apiBaseUrl = 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev';
        const apiUrl = `${apiBaseUrl}/jobs/${jobId}/applications`;
        
        const response = await fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log(`API returned ${result.applications?.length || 0} applications for job ${jobId}`);
          console.log('Raw API response data:', JSON.stringify(result, null, 2));
          
          if (result.applications && Array.isArray(result.applications)) {
            // Convert API response to our JobApplication interface
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const apiApplications = result.applications.map((app: any) => {
              console.log(`Processing application for user ${app.userId || app.studentId}`, {
                hasUserDetails: !!app.userDetails,
                hasUser: !!app.user,
                hasResumeUrl: !!app.resumeUrl,
                resumeUrl: app.resumeUrl,
                hasResumeDetails: !!app.resumeDetails
              });
              
              return {
                matchId: app.id || app.matchId,
                jobId: app.jobId,
                studentId: app.userId || app.studentId,
                status: app.status || 'Pending',
                createdAt: app.createdAt,
                updatedAt: app.updatedAt,
                coverLetter: app.coverLetter,
                resumeUrl: app.resumeUrl,
                resumeDetails: app.resumeDetails,
                // New application questions
                summerAvailability: app.userDetails?.summerAvailability || app.summerAvailability,
                hoursPerWeek: app.userDetails?.hoursPerWeek || app.hoursPerWeek,
                expectations: app.userDetails?.expectations || app.expectations,
                student: {
                  userId: app.userId || app.studentId,
                  email: app.userDetails?.email || app.user?.email || app.email || ''
                },
                // Include detailed user information if available
                userDetails: {
                  ...app.userDetails || app.user || {},
                  fullName: app.fullName || app.userDetails?.fullName || '',
                  email: app.email || app.userDetails?.email || app.user?.email || '',
                  phone: app.phone || app.userDetails?.phone || '',
                  education: app.education || app.userDetails?.education || '',
                  summerAvailability: app.userDetails?.summerAvailability || app.summerAvailability,
                  hoursPerWeek: app.userDetails?.hoursPerWeek || app.hoursPerWeek,
                  expectations: app.userDetails?.expectations || app.expectations
                },
                job: {
                  title: jobDetails?.title || 'Unknown',
                  labId: jobDetails?.labId || '',
                  professorId: jobDetails?.professorId || ''
                }
              };
            });
            
            applications.push(...apiApplications);
            console.log(`Processed ${applications.length} applications from API`);
            console.log('Final applications data:', applications.map(app => ({
              matchId: app.matchId,
              studentId: app.studentId,
              hasResumeUrl: !!app.resumeUrl,
              resumeUrl: app.resumeUrl
            })));
          }
        } else {
          console.warn(`API request failed with status ${response.status}`);
          const errorText = await response.text();
          console.error('API error response:', errorText);
        }
      }
    } catch (apiError) {
      console.error('Error fetching applications from API:', apiError);
    }
    
    // If we already have applications from the API, no need to query Amplify
    if (applications.length > 0) {
      return applications;
    }
    
    // Fallback to Amplify client if the API call failed or returned no results
    // Check if Amplify client is ready
    if (!isAmplifyReady() || !client || !client.models || !client.models.Match) {
      console.warn('Amplify client not properly initialized and API call failed - Match model not available');
      return applications; // Return whatever we got from the API (might be empty)
    }
    
    const response = await client.models.Match.list({
      filter: {
        jobId: {
          eq: jobId
        }
      }
    });
    
    if (!response.data || response.data.length === 0) {
      console.warn(`No applications found for job ${jobId} in Amplify`);
      return applications; // Return whatever we got from the API (might be empty)
    }
    
    const amplifyApplications = response.data;

    // For each application, get the student details
    const applicationsWithDetails = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      amplifyApplications.map(async (app: any) => {
        // Get student details
        let studentEmail = '';
        try {
          if (client) {
            const userResponse = await client.models.User.get({
              id: app.studentId
            });
            if (userResponse.data) {
              studentEmail = userResponse.data.email;
            }
          }
        } catch (error) {
          console.error('Error fetching student details:', error);
        }

        // Get job details
        let jobTitle = '';
        let labId = '';
        let professorId = '';
        try {
          if (client) {
            const jobResponse = await client.models.Job.get({
              id: app.jobId
            });
            if (jobResponse.data) {
              jobTitle = jobResponse.data.title;
              labId = jobResponse.data.labId;
              professorId = jobResponse.data.professorId;
            }
          }
        } catch (error) {
          console.error('Error fetching job details:', error);
        }

        // Map the Amplify model to our interface
        return {
          matchId: app.id,
          studentId: app.studentId,
          jobId: app.jobId,
          status: app.status || 'Pending',
          createdAt: app.createdAt,
          updatedAt: app.updatedAt,
          student: {
            userId: app.studentId,
            email: studentEmail
          },
          job: {
            title: jobTitle,
            labId,
            professorId
          }
        };
      })
    );

    // Combine results from API and Amplify without duplicates
    const allApplications = [...applications];
    
    // Add Amplify results if they don't already exist in the API results
    applicationsWithDetails.forEach(app => {
      const exists = allApplications.some(a => a.matchId === app.matchId);
      if (!exists) {
        allApplications.push(app);
      }
    });
    
    console.log(`Returning ${allApplications.length} total applications for job ${jobId}`);
    return allApplications;
  } catch (error) {
    console.error(`Error fetching applications for job ${jobId}:`, error);
    return [];
  }
};

/**
 * Update application status
 */
export const updateApplicationStatus = async (matchId: string, status: string): Promise<JobApplication | null> => {
  try {
    // Check if Amplify client is ready
    if (!isAmplifyReady() || !client) {
      console.warn('Amplify client not properly initialized');
      return null;
    }
    
    const response = await client.models.Match.update({
      id: matchId,
      status
    });
    
    // Get the full application details
    const app = response.data;
    if (!app) {
      console.error('No data returned from update operation');
      return null;
    }
    
    // Get student details
    let studentEmail = '';
    try {
      const userResponse = await client.models.User.get({
        id: app.studentId
      });
      if (userResponse.data) {
        studentEmail = userResponse.data.email;
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
    }

    // Get job details
    let jobTitle = '';
    let labId = '';
    let professorId = '';
    try {
      const jobResponse = await client.models.Job.get({
        id: app.jobId
      });
      if (jobResponse.data) {
        jobTitle = jobResponse.data.title;
        labId = jobResponse.data.labId;
        professorId = jobResponse.data.professorId;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
    }

    // Map the Amplify model to our interface
    return {
      matchId: app.id,
      studentId: app.studentId,
      jobId: app.jobId,
      status: app.status ?? 'Pending',
      createdAt: app.createdAt ?? undefined,
      updatedAt: app.updatedAt ?? undefined,
      student: {
        userId: app.studentId,
        email: studentEmail
      },
      job: {
        title: jobTitle,
        labId,
        professorId
      }
    };
  } catch (error) {
    console.error(`Error updating application status for ID ${matchId}:`, error);
    return null;
  }
};

/**
 * Create a new application for a job
 */
export const createApplication = async (
  jobId: string, 
  coverLetter: string,
  userData: {
    fullName: string;
    email: string;
    phone: string;
    education: string;
    skills: string;
    resumeFileName: string;
    resumeDetails?: unknown;
    resumeUrl?: string;
    summerAvailability?: string;
    hoursPerWeek?: string;
    expectations?: string;
  }
): Promise<boolean> => {
  try {
    console.log(`Creating application for job ${jobId}`);
    console.log('User data:', userData);
    
    // Get authentication info
    const { tokens } = await fetchAuthSession();
    if (!tokens?.idToken) {
      console.error('No auth token available');
      return false;
    }
    
    const userId = tokens.idToken.payload.sub as string;
    if (!userId) {
      console.error('No user ID available in auth token');
      return false;
    }
    
    // Use resume details from userData if provided, otherwise get them
    let resumeDetails = userData.resumeDetails || null;
    let resumeUrl = userData.resumeUrl || null;
    
    // If resume details weren't provided, try to get them
    if (!resumeDetails || !resumeUrl) {
      try {
        // Attempt to get complete resume data
        const resumeData = await import('../components/ResumeManagement/utils')
          .then(module => module.getResumeDataForApplication());
        
        resumeDetails = resumeData.resumeDetails || resumeDetails;
        resumeUrl = resumeData.resumeFileUrl || resumeUrl;
        console.log('Retrieved resume details and URL for application', {
          hasResumeDetails: !!resumeDetails,
          resumeUrl
        });
      } catch (error) {
        console.error('Error getting resume data:', error);
      }
    }
    
    // Check if Amplify client is ready
    if (!isAmplifyReady()) {
      console.warn('Amplify client not properly initialized, falling back to API');
    }
    
    // Always prefer direct API call for creating applications
    try {
      console.log('Creating application using direct API call');
      const apiBaseUrl = 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev';
      const apiUrl = `${apiBaseUrl}/applications`;
      
      // Prepare application data with structured resume details
      const applicationData = {
        jobId,
        userId,
        coverLetter,
        status: 'Pending',
        userDetails: {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          education: userData.education,
          skills: userData.skills,
          summerAvailability: userData.summerAvailability,
          hoursPerWeek: userData.hoursPerWeek,
          expectations: userData.expectations
        },
        resumeDetails,
        resumeUrl
      };
      
      console.log('Sending application data:', JSON.stringify(applicationData, null, 2));
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.idToken.toString()}`
        },
        body: JSON.stringify(applicationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Application created successfully:', result);
        return true;
      } else {
        const errorText = await response.text();
        console.error(`API request failed with status ${response.status}:`, errorText);
        // Fall back to Amplify client
      }
    } catch (apiError) {
      console.error('Error creating application via API:', apiError);
      // Fall back to Amplify client
    }
    
    // Fallback to Amplify client if API call failed
    if (isAmplifyReady() && client) {
      console.log('Falling back to Amplify client for application creation');
      
      try {
        // Create a new match record with resume data
        const safeClient = getClient();
        if (!safeClient || !safeClient.models || !safeClient.models.Match) {
          throw new Error('Client or Match model not available');
        }

        const match = await safeClient.models.Match.create({
          matchId: `${jobId}-${userId}-${Date.now()}`,
          jobId,
          studentId: userId,
          status: 'Pending',
          coverLetter: coverLetter,
          resumeUrl: resumeUrl,
          resumeData: resumeDetails ? JSON.stringify(resumeDetails) : undefined,
          // New application questions
          summerAvailability: userData.summerAvailability,
          hoursPerWeek: userData.hoursPerWeek,
          expectations: userData.expectations
        });
        
        console.log('Application created successfully with Amplify:', match);
        return true;
      } catch (error) {
        console.error('Error creating application with Amplify:', error);
        return false;
      }
    }
    
    console.error('All methods to create application failed');
    return false;
  } catch (error) {
    console.error('Error creating application:', error);
    return false;
  }
};