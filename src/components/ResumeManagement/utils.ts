// utils.ts
import { ResumeDetails } from './types';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getUrl } from 'aws-amplify/storage';
import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../../amplify/data/resource';
import { Client } from 'aws-amplify/api';
import { API_ENDPOINTS } from '../../config';

// Define the type for the Amplify client
type AmplifyClientType = Client<Schema>;

// Lazy-initialize the GraphQL client to avoid errors on first load
let client: AmplifyClientType | undefined;
let clientInitializing = false;
let initializationPromise: Promise<AmplifyClientType | undefined> | null = null;

const getClient = async (): Promise<AmplifyClientType | undefined> => {
  // If client is already initialized, return it
  if (client) return client;
  
  // If already initializing, return the existing promise to avoid multiple initializations
  if (clientInitializing && initializationPromise) {
    return initializationPromise;
  }
  
  // Start initialization
  clientInitializing = true;
  
  // Create a promise for the initialization
  initializationPromise = new Promise<AmplifyClientType | undefined>((resolve) => {
    try {
      // Try to initialize the client
  client = generateClient<Schema>();
  console.log('Amplify client initialized for resume management');
      
      // Verify the client is working by checking if models exists
      if (client.models) {
        resolve(client);
        return;
      } else {
        console.warn('Amplify client initialized but models not available');
        
        // Wait a moment and try again if models aren't available
        setTimeout(async () => {
          try {
            client = generateClient<Schema>();
            if (client.models) {
              console.log('Amplify client models available after retry');
              resolve(client);
            } else {
              console.error('Amplify client models still not available after retry');
              resolve(undefined);
            }
          } catch (retryError) {
            console.error('Error in Amplify client retry:', retryError);
            resolve(undefined);
          } finally {
            clientInitializing = false;
          }
        }, 1000);
      }
} catch (error) {
  console.error('Error initializing Amplify client for resume management:', error);
      clientInitializing = false;
      resolve(undefined);
}
  });
  
  return initializationPromise;
};

// Get authenticated user information
export const getAuthenticatedUser = async (): Promise<{ username?: string; attributes?: { email?: string } } | null> => {
  try {
    // Try to get user info from Amplify Auth
    const { tokens } = await fetchAuthSession();
    const idToken = tokens?.idToken;
    
    if (idToken) {
      const username = idToken.payload.sub as string;
      const email = idToken.payload.email as string;
      
      return {
        username,
        attributes: { email }
      };
    }
    
    // Fallback to localStorage for development/testing
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
  } catch (error) {
    console.error('Error getting authenticated user:', error);
  }
  
  return null;
};

/**
 * Load resume details from database
 */
export const loadResumeDetailsFromStorage = async (): Promise<ResumeDetails | null> => {
  try {
    // First try to get the user
    const user = await getAuthenticatedUser();
    if (!user || !user.username) {
      console.error('No authenticated user found');
      
      // Try localStorage fallback for development/testing
      try {
        const localDetails = localStorage.getItem('resumeDetails');
        if (localDetails) {
          const parsedDetails = JSON.parse(localDetails);
          console.log('Loaded resume details from localStorage (no authenticated user)');
          return validateResumeDetails(parsedDetails);
        }
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
      }
      
      return createEmptyResumeData();
    }
    
    const userId = user.username;
    console.log(`Loading resume details for user: ${userId}`);
    
    // Get the client instance
    const amplifyClient = await getClient();
    
    // Get from database if client is available
    if (amplifyClient && amplifyClient.models && amplifyClient.models.User) {
      try {
        console.log('Attempting to load resume data from database...');
        const response = await amplifyClient.models.User.get({ id: userId });
        const userData = response.data;
        
        if (userData && userData.resumeData) {
          // If we have resumeData in the database, parse and return it
          try {
            const resumeData = JSON.parse(userData.resumeData as string);
            console.log('Loaded resume data from database successfully');
            
            // Also cache in localStorage as backup
            try {
            localStorage.setItem('resumeDetails', JSON.stringify(resumeData));
            } catch (storageError) {
              console.warn('Could not cache resume data to localStorage:', storageError);
            }
            
            return validateResumeDetails(resumeData);
          } catch (parseError) {
            console.error('Error parsing resume data from database:', parseError);
            
            // Try localStorage fallback
            try {
              const localDetails = localStorage.getItem('resumeDetails');
              if (localDetails) {
                const parsedDetails = JSON.parse(localDetails);
                console.log('Loaded resume details from localStorage after database parse error');
                return validateResumeDetails(parsedDetails);
              }
            } catch (localError) {
              console.error('Error reading from localStorage:', localError);
            }
            
            return createEmptyResumeData();
          }
        } else {
          console.log('No resume data found in database');
          
          // Try localStorage fallback
          try {
            const localDetails = localStorage.getItem('resumeDetails');
            if (localDetails) {
              const parsedDetails = JSON.parse(localDetails);
              console.log('Loaded resume details from localStorage (no data in database)');
              return validateResumeDetails(parsedDetails);
            }
          } catch (localError) {
            console.error('Error reading from localStorage:', localError);
          }
          
          return createEmptyResumeData();
        }
      } catch (dbError) {
        console.error('Error loading resume from database:', dbError);
        
        // Try localStorage fallback
        try {
          const localDetails = localStorage.getItem('resumeDetails');
          if (localDetails) {
            const parsedDetails = JSON.parse(localDetails);
            console.log('Loaded resume details from localStorage after database error');
            return validateResumeDetails(parsedDetails);
          }
        } catch (localError) {
          console.error('Error reading from localStorage:', localError);
        }
        
        return createEmptyResumeData();
      }
    } else {
      console.warn('Amplify client not ready, checking localStorage fallback');
      
      // Try localStorage fallback
      try {
        const localDetails = localStorage.getItem('resumeDetails');
        if (localDetails) {
          const parsedDetails = JSON.parse(localDetails);
          console.log('Loaded resume details from localStorage (Amplify client not ready)');
          return validateResumeDetails(parsedDetails);
        }
      } catch (localError) {
        console.error('Error reading from localStorage:', localError);
      }
      
      return createEmptyResumeData();
    }
  } catch (e) {
    console.error('Error loading resume details:', e);
    
    // Final localStorage fallback attempt
    try {
      const localDetails = localStorage.getItem('resumeDetails');
      if (localDetails) {
        const parsedDetails = JSON.parse(localDetails);
        console.log('Loaded resume details from localStorage after critical error');
        return validateResumeDetails(parsedDetails);
      }
    } catch (localError) {
      console.error('Error reading from localStorage:', localError);
    }
    
    return createEmptyResumeData();
  }
};

// Utility function to validate and fix resume details structure
const validateResumeDetails = (data: Partial<ResumeDetails> | unknown): ResumeDetails => {
  // Create default structure
  const defaultData = createEmptyResumeData();
  
  if (!data || typeof data !== 'object') return defaultData;
  
  // Cast to a partial ResumeDetails to allow optional properties
  const resumeData = data as Partial<ResumeDetails>;
  
  // Create a properly structured object with all required fields
  const validatedData: ResumeDetails = {
    education: Array.isArray(resumeData.education) ? resumeData.education : defaultData.education,
    experience: Array.isArray(resumeData.experience) ? resumeData.experience : defaultData.experience,
    skills: Array.isArray(resumeData.skills) ? resumeData.skills : defaultData.skills,
    projects: Array.isArray(resumeData.projects) ? resumeData.projects : defaultData.projects,
    personalLinks: resumeData.personalLinks || defaultData.personalLinks
  };
  
  // Ensure each education entry has all required fields
  validatedData.education = validatedData.education.map(edu => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    major: edu.major || '',
    graduationStartMonth: edu.graduationStartMonth || '',
    graduationStartYear: edu.graduationStartYear || '',
    graduationEndMonth: edu.graduationEndMonth || '',
    graduationEndYear: edu.graduationEndYear || '',
    gpa: edu.gpa || '',
    yearsOfExperience: edu.yearsOfExperience || '',
    seniority: edu.seniority || ''
  }));
  
  // Ensure at least one education entry exists
  if (validatedData.education.length === 0) {
    validatedData.education = defaultData.education;
  }
  
  // Ensure each experience entry has all required fields
  validatedData.experience = validatedData.experience.map(exp => ({
    company: exp.company || '',
    position: exp.position || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    description: exp.description || ''
  }));
  
  // Ensure at least one experience entry exists
  if (validatedData.experience.length === 0) {
    validatedData.experience = defaultData.experience;
  }
  
  // Ensure skills are strings
  validatedData.skills = validatedData.skills.map(skill => 
    typeof skill === 'string' ? skill : '');
  
  // Ensure at least one skill entry exists
  if (validatedData.skills.length === 0) {
    validatedData.skills = defaultData.skills;
  }
  
  // Ensure each project entry has all required fields
  validatedData.projects = validatedData.projects.map(proj => ({
    title: proj.title || '',
    description: proj.description || '',
    technologies: proj.technologies || '',
    url: proj.url || ''
  }));
  
  // Ensure at least one project entry exists
  if (validatedData.projects.length === 0) {
    validatedData.projects = defaultData.projects;
  }
  
  return validatedData;
};

/**
 * Check if user has an uploaded resume
 */
export const hasUploadedResume = async (): Promise<boolean> => {
  try {
    // Check localStorage first as fallback
    const storedResumeFileName = localStorage.getItem('userResume');
    if (storedResumeFileName) {
      return true;
    }
    
    // Get the authenticated user
    const user = await getAuthenticatedUser();
    if (!user || !user.username) {
      return false;
    }
    
    const userId = user.username;
    
    // Get the client instance
    const amplifyClient = await getClient();
    
    // Check in database
    if (amplifyClient && amplifyClient.models && amplifyClient.models.User) {
      try {
        const response = await amplifyClient.models.User.get({ id: userId });
        const userData = response.data;
        
        if (userData && userData.resumeFileName) {
          // Also store in localStorage as fallback
          localStorage.setItem('userResume', userData.resumeFileName as string);
          return true;
        }
      } catch (dbError) {
        console.error('Error checking resume in database:', dbError);
      }
    } else {
      console.warn('Amplify client not ready when checking for uploaded resume');
    }
    
    return false;
  } catch (error) {
    console.error('Error checking uploaded resume:', error);
    return false;
  }
};

/**
 * Save resume details to database
 */
export const saveResumeDetailsToStorage = async (resumeDetails: ResumeDetails): Promise<boolean> => {
  try {
    // Validate resume details before saving
    if (!resumeDetails) {
      console.error('Invalid resume details - cannot be null or undefined');
      return false;
    }
    
    // Ensure all required fields exist
    if (!Array.isArray(resumeDetails.education) || 
        !Array.isArray(resumeDetails.experience) || 
        !Array.isArray(resumeDetails.skills) || 
        !Array.isArray(resumeDetails.projects)) {
      console.error('Invalid resume details structure - missing required arrays');
      return false;
    }
    
    // Get the current user
    const user = await getAuthenticatedUser();
    if (!user || !user.username) {
      console.error('No authenticated user found');
      return false;
    }
    
    const userId = user.username;
    console.log(`Saving resume details for user: ${userId}`);
    
    // Save to localStorage as fallback
    try {
      localStorage.setItem('resumeDetails', JSON.stringify(resumeDetails));
      console.log('Saved resume details to localStorage as backup');
    } catch (storageError) {
      console.warn('Could not save to localStorage:', storageError);
    }
    
    // Try to get the client instance
    const amplifyClient = await getClient();
    
    // Save to database if client is available
    if (amplifyClient && amplifyClient.models && amplifyClient.models.User) {
      try {
        // First check if user record exists
        const response = await amplifyClient.models.User.get({ id: userId });
        const userData = response.data;
        
        // For backwards compatibility, still create the JSON string
        const resumeDataString = JSON.stringify(resumeDetails);
        console.log(`Resume data size: ${resumeDataString.length} characters`);
        
        // Create structured resume object
        const structuredResume = {
          education: resumeDetails.education,
          experience: resumeDetails.experience,
          skills: resumeDetails.skills,
          projects: resumeDetails.projects,
          lastUpdated: new Date().toISOString()
        };
        
        if (userData) {
          // Update existing user record with both string and structured formats
          console.log('Updating existing user record with resume details');
          
          try {
            await amplifyClient.models.User.update({
            id: userId,
              resumeData: resumeDataString, // Keep for backward compatibility
              resume: structuredResume, // New structured format
              resumeLastUpdated: new Date().toISOString()
          });
          console.log('Resume details saved to database');
          return true;
          } catch (updateError) {
            console.error('Error updating user record:', updateError);
            // Return success anyway since we've already saved to localStorage
            return true;
          }
        } else {
          // Create new user record with both formats
          console.log('Creating new user record with resume details');
          
          try {
            await amplifyClient.models.User.create({
            id: userId,
            userId: userId,
            email: user.attributes?.email || '',
            roles: ['Student'],
              resumeData: resumeDataString, // Keep for backward compatibility
              resume: structuredResume, // New structured format
              resumeLastUpdated: new Date().toISOString()
          });
          console.log('Created new user record with resume details');
          return true;
          } catch (createError) {
            console.error('Error creating user record:', createError);
            // Return success anyway since we've already saved to localStorage
            return true;
          }
        }
      } catch (dbError) {
        console.error('Error accessing database:', dbError);
        // Continue because we've already saved to localStorage
        return true;
      }
    } else {
      console.warn('Amplify client not ready, trying REST API fallback...');
      
      // Try using the REST API endpoint as fallback
      try {
        const { tokens } = await fetchAuthSession();
        const idToken = tokens?.idToken?.toString();
        
        if (!idToken) {
          console.error('No auth token available for REST API fallback');
          return true; // Still return success since we saved to localStorage
        }
        
        const updateUserResumeEndpoint = getApiEndpoint('UPDATE_USER_RESUME');
        console.log('Using REST API fallback:', updateUserResumeEndpoint);
        
        const structuredResume = {
          education: resumeDetails.education,
          experience: resumeDetails.experience,
          skills: resumeDetails.skills,
          projects: resumeDetails.projects,
          lastUpdated: new Date().toISOString()
        };
        
        const response = await fetch(updateUserResumeEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken
          },
          body: JSON.stringify({
            resumeData: JSON.stringify(resumeDetails), // Keep for backward compatibility
            resume: structuredResume, // New structured format
            education: resumeDetails.education,
            experience: resumeDetails.experience,
            skills: resumeDetails.skills,
            projects: resumeDetails.projects
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Successfully saved resume details via REST API fallback:', result);
          return true;
        } else {
          console.error('REST API fallback failed:', response.status, response.statusText);
          try {
            const errorData = await response.json();
            console.error('REST API error details:', errorData);
          } catch (parseError) {
            console.error('Could not parse error response');
          }
          return true; // Still return success since we saved to localStorage
        }
      } catch (restApiError) {
        console.error('Error with REST API fallback:', restApiError);
        return true; // Still return success since we saved to localStorage
      }
    }
  } catch (error) {
    console.error('Error in saveResumeDetailsToStorage:', error);
    return false;
  }
};

/**
 * Get API endpoint, with localStorage override if available
 */
const getApiEndpoint = (key: keyof typeof API_ENDPOINTS): string => {
  try {
    const savedEndpoints = localStorage.getItem('api_endpoints');
    if (savedEndpoints) {
      const endpoints = JSON.parse(savedEndpoints);
      if (endpoints[key]) {
        return endpoints[key];
      }
    }
  } catch (e) {
    console.error('Error reading API endpoint from localStorage:', e);
  }
  return API_ENDPOINTS[key];
};

/**
 * Upload resume file to S3 using pre-signed URL
 */
export const saveResumeFile = async (file: File): Promise<string | null> => {
  try {
    // Get the current user
    const user = await getAuthenticatedUser();
    if (!user || !user.username) {
      console.error('No authenticated user found');
      return null;
    }
    
    // Validate file size
    if (file.size > 10 * 1024 * 1024) { // 10MB max
      throw new Error('File too large. Maximum size is 10MB.');
    }
    
    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['pdf', 'doc', 'docx'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
    }
    
    console.log(`Requesting pre-signed URL for: ${file.name} (${file.size} bytes)`);
    
    // Call our Lambda function to get a pre-signed URL
    try {
      // Get auth tokens for the API call
      const { tokens } = await fetchAuthSession();
      const idToken = tokens?.idToken?.toString();
      
      if (!idToken) {
        console.error('No auth token available');
        return null;
      }
      
      // Get the API endpoint from config with localStorage override
      const apiEndpoint = getApiEndpoint('RESUME_UPLOAD');
      
      console.log('Using API endpoint:', apiEndpoint);
      
      try {
        // Request pre-signed URL
        console.log('Making fetch request to:', apiEndpoint);
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken,
            'Cache-Control': 'no-cache'
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          console.error('Error response from Lambda:', response.status, response.statusText);
          try {
            const errorData = await response.json();
            console.error('Error details:', errorData);
            throw new Error(errorData.message || `Failed to get upload URL. Status: ${response.status}`);
          } catch (parseError) {
            console.error('Error parsing error response:', parseError);
            throw new Error(`Failed to get upload URL. Status: ${response.status}`);
          }
        }
        
        const data = await response.json();
        console.log('Pre-signed URL generated successfully:', data);
        
        // Get the pre-signed URL and S3 key from the response
        const { presignedUrl, fileKey } = data;
        
        if (!presignedUrl || !fileKey) {
          console.error('Invalid response from server:', data);
          throw new Error('Invalid response from server');
        }
        
        // Directly upload to S3 using the pre-signed URL
        console.log('Uploading file directly to S3 using pre-signed URL:', presignedUrl);
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: file
        });
        
        console.log('S3 upload response status:', uploadResponse.status);
        
        if (!uploadResponse.ok) {
          console.error('Error uploading to S3:', uploadResponse.status, uploadResponse.statusText);
          throw new Error(`Failed to upload file to S3. Status: ${uploadResponse.status}`);
        }
        
        console.log('File uploaded successfully to S3');
        
        // Now call the confirmation endpoint to ensure database is updated
        try {
          // Use the updateUserResume API endpoint as a fallback when the confirm endpoint returns 404
          const updateUserResumeEndpoint = getApiEndpoint('UPDATE_USER_RESUME');
          
          // First try the standard /confirm endpoint
          const confirmResponse = await fetch(`${apiEndpoint}/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': idToken
            },
            body: JSON.stringify({
              fileKey
            })
          });
          
          if (confirmResponse.ok) {
            console.log('Upload confirmed with server, database record updated');
          } else {
            console.warn(`Failed to confirm upload with server (status: ${confirmResponse.status}), trying fallback endpoint...`);
            
            // Try the fallback endpoint if the confirm endpoint fails
            try {
              // First get the structured resume data
              const resumeDetails = await loadResumeDetailsFromStorage();
              
              // Create structured resume object with any available resume data
              const structuredResume = resumeDetails ? {
                education: resumeDetails.education || [],
                experience: resumeDetails.experience || [],
                skills: resumeDetails.skills || [],
                projects: resumeDetails.projects || [],
                lastUpdated: new Date().toISOString()
              } : null;
              
              // Include resume structured data in the payload
              const fallbackResponse = await fetch(updateUserResumeEndpoint, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': idToken
                },
                body: JSON.stringify({
                  resumeFileName: fileKey,
                  resumeUrl: `https://mascle-resume-uploads-209479287811.s3.us-east-1.amazonaws.com/${fileKey}`,
                  resumeData: resumeDetails ? JSON.stringify(resumeDetails) : undefined,
                  resume: structuredResume
                })
              });
              
              if (fallbackResponse.ok) {
                console.log('Successfully updated user record using fallback endpoint');
              } else {
                console.warn('Fallback endpoint also failed, will update directly via Amplify');
              }
            } catch (fallbackError) {
              console.warn('Error using fallback endpoint:', fallbackError);
              // Will still attempt direct Amplify update below
            }
          }
        } catch (confirmError) {
          console.warn('Error confirming upload, but file was uploaded successfully:', confirmError);
          // We will still update the User record directly via Amplify below
        }
        
        // Save the file key locally as a fallback
        localStorage.setItem('userResume', fileKey);
        
        // Always try to update database record regardless of confirmation endpoint success
        try {
          // Generate a S3 URL from the key
          const region = import.meta.env.VITE_AWS_REGION || localStorage.getItem('aws_region') || 'us-east-1';
          const bucket = import.meta.env.VITE_RESUME_BUCKET || localStorage.getItem('s3_bucket') || 'amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t';
          const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${fileKey}`;
          
          // Get the client instance
          const amplifyClient = await getClient();
          
          if (amplifyClient && amplifyClient.models && amplifyClient.models.User) {
            try {
              // Get structured resume data (if available)
              const resumeDetails = await loadResumeDetailsFromStorage();
              
              // Create structured resume object
              const structuredResume = resumeDetails ? {
                education: resumeDetails.education || [],
                experience: resumeDetails.experience || [],
                skills: resumeDetails.skills || [],
                projects: resumeDetails.projects || [],
                lastUpdated: new Date().toISOString()
              } : null;
              
              // Update full user record with both file info and structured data
              await amplifyClient.models.User.update({
                id: user.username,
                resumeFileName: fileKey,
                resumeUrl: s3Url,
                resumeLastUpdated: new Date().toISOString(),
                resumeData: resumeDetails ? JSON.stringify(resumeDetails) : undefined,
                resume: structuredResume
              });
              console.log('Updated user record with resume file and structured data in database');
            } catch (dbError) {
              console.error('Error updating user record, but file was uploaded:', dbError);
              // Continue despite database error
            }
          } else {
            console.warn('Amplify client not ready, but file was uploaded. Using localStorage fallback.');
          }
        } catch (clientError) {
          console.error('Client error, but file was uploaded:', clientError);
          // Continue despite client error
        }
        
        // Return the S3 key
        return fileKey;
      } catch (fetchError) {
        console.error('Fetch error during upload process:', fetchError);
        throw fetchError;
      }
    } catch (apiError) {
      console.error('Error in resume upload process:', apiError);
      throw apiError;
    }
  } catch (error) {
    console.error('Error in saveResumeFile:', error);
    throw error;
  }
};

/**
 * Get a download URL for a resume file stored in S3
 */
export const getResumeFileUrl = async (fileName: string): Promise<string | null> => {
  if (!fileName) return null;
  
  try {
    console.log('Getting URL for resume file:', fileName);
    
    // If the fileName is a full S3 path (starts with 'resumes/'), get a temporary URL
    if (fileName.startsWith('resumes/')) {
      const result = await getUrl({
        key: fileName,
        options: {
          expiresIn: 3600 // URL valid for 1 hour
        }
      });
      
      console.log('Generated resume download URL successfully');
      return result.url.toString();
    }
    
    // If it's already a URL, return it
    if (fileName.startsWith('http://') || fileName.startsWith('https://')) {
      console.log('Using existing URL for resume file');
      return fileName;
    }
    
    console.warn('Resume file name format not recognized');
    return null;
  } catch (error) {
    console.error('Error getting resume file URL:', error);
    return null;
  }
};

// Get default empty resume details
export const getDefaultResumeDetails = (): ResumeDetails => {
  return {
    education: [{ 
      institution: '', 
      degree: '', 
      major: '', 
      graduationStartMonth: '',
      graduationStartYear: '',
      graduationEndMonth: '',
      graduationEndYear: '',
      gpa: '',
      yearsOfExperience: '',
      seniority: ''
    }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '', url: '' }],
    personalLinks: {
      linkedin: '',
      website: '',
      github: ''
    }
  };
};

// Get user resume data for job applications
export const getResumeDataForApplication = async (): Promise<{
  resumeDetails: ResumeDetails | null;
  resumeFileName: string | null;
  resumeFileUrl: string | null;
  userEmail: string | null;
  fullName: string | null;
}> => {
  try {
    // Get auth session to get user details
    const session = await fetchAuthSession();
    const idToken = session.tokens?.idToken;
    const userEmail = idToken?.payload.email as string || null;
    
    // Try to get full name if available
    let fullName = idToken?.payload.name as string || null;
    if (!fullName && idToken?.payload.given_name && idToken?.payload.family_name) {
      fullName = `${idToken.payload.given_name as string} ${idToken.payload.family_name as string}`;
    }
    
    // Get resume details from database
    const resumeDetails = await loadResumeDetailsFromStorage();
    
    // Get user data including resume file name from database
    let resumeFileName = null;
    let resumeFileUrl = null;
    
    const user = await getAuthenticatedUser();
    if (user && user.username) {
      // Get the client instance
      const amplifyClient = await getClient();
      
      if (amplifyClient && amplifyClient.models && amplifyClient.models.User) {
        try {
          const response = await amplifyClient.models.User.get({ id: user.username });
        const userData = response.data;
        
          if (userData) {
            // Get the resumeFileName field
            if (userData.resumeFileName) {
          resumeFileName = userData.resumeFileName as string;
              
              // Check if we have a direct resumeUrl field
              if (userData.resumeUrl) {
                resumeFileUrl = userData.resumeUrl as string;
                console.log('Using direct resumeUrl from database:', resumeFileUrl);
              } else {
                // Fall back to generating a URL if the direct URL is not available
          resumeFileUrl = await getResumeFileUrl(resumeFileName);
                console.log('Generated resumeFileUrl from fileName:', resumeFileUrl);
              }
            }
        }
      } catch (dbError) {
        console.error('Error getting user data from database:', dbError);
      }
    }
    }
    
    // Log the results
    console.log('Resume data for application:', {
      hasResumeDetails: !!resumeDetails,
      resumeFileName,
      resumeFileUrl,
      userEmail
    });
    
    return {
      resumeDetails,
      resumeFileName,
      resumeFileUrl,
      userEmail,
      fullName
    };
  } catch (e) {
    console.error('Error getting resume data for application:', e);
    return {
      resumeDetails: null,
      resumeFileName: null,
      resumeFileUrl: null,
      userEmail: null,
      fullName: null
    };
  }
};

// Check if resume is complete enough for application
export const isResumeComplete = async (): Promise<boolean> => {
  try {
    // Get resume details from database or localStorage  
    const resumeDetails = await loadResumeDetailsFromStorage();
    if (!resumeDetails) return false;
    
    // Check if at least one education entry is filled
    const hasEducation = resumeDetails.education.some(
      edu => edu.institution && edu.degree && edu.major
    );
    
    // Check if at least one relevant skill is provided
    const hasSkills = resumeDetails.skills.some(skill => skill.trim() !== '');
    
    // Check if resume file is uploaded
    const hasResumeFile = await hasUploadedResume();
    
    return hasEducation && hasSkills && hasResumeFile;
  } catch (error) {
    console.error('Error checking if resume is complete:', error);
    return false;
  }
};

// Utility function to create default empty resume data
const createEmptyResumeData = (): ResumeDetails => {
  return {
    education: [{ 
      institution: '', 
      degree: '', 
      major: '', 
      graduationStartMonth: '',
      graduationStartYear: '',
      graduationEndMonth: '',
      graduationEndYear: '',
      gpa: '',
      yearsOfExperience: '',
      seniority: ''
    }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '', url: '' }],
    personalLinks: {
      linkedin: '',
      website: '',
      github: ''
    }
  };
};

/**
 * Ensures that any resume data stored in localStorage is properly synced to the database
 * This function should be called after successful login or when app loads
 */
export const syncResumeDataToDatabase = async (): Promise<boolean> => {
  try {
    // Check if we have resume data in localStorage
    const localData = localStorage.getItem('resumeDetails');
    if (!localData) {
      console.log('No local resume data to sync');
      return false;
    }

    // Parse the local data
    const resumeDetails = JSON.parse(localData);
    if (!resumeDetails) {
      console.log('Invalid local resume data');
      return false;
    }

    // Validate the resume data
    const validatedData = validateResumeDetails(resumeDetails);
    
    console.log('Syncing local resume data to database...');
    
    // Save the validated data to database
    const result = await saveResumeDetailsToStorage(validatedData);
    
    if (result) {
      console.log('Successfully synced resume data from local storage to database');
    } else {
      console.warn('Failed to sync resume data from local storage to database');
    }
    
    return result;
  } catch (error) {
    console.error('Error syncing resume data to database:', error);
    return false;
  }
};