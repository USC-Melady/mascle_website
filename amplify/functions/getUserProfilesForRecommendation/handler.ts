import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ListTablesCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const client = new DynamoDBClient({});

interface RecommendationProfile {
  userId: string;
  email: string;
  education: Array<{
    institution: string;
    degree: string;
    major: string;
    graduationStartMonth?: string;
    graduationStartYear?: string;
    graduationEndMonth?: string;
    graduationEndYear?: string;
    graduationDate?: string; // legacy field for backward compatibility
    gpa?: string | number;
    yearsOfExperience?: string | number;
    seniority?: string;
  }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  skills: string[];
  seniority: string;
  yearsOfExperience: number;
  careerGoals: string;
  resumeDescription?: string; // New field for resume summary
  profileComplete: boolean;
  lastUpdated: string;
  labIds?: string[];
}

/**
 * Calculate years of experience from experience array
 */
const calculateYearsOfExperience = (experiences: Array<{startDate?: string; endDate?: string}>): number => {
  if (!experiences || experiences.length === 0) return 0;
  
  let totalMonths = 0;
  const currentDate = new Date();
  
  for (const exp of experiences) {
    if (!exp.startDate) continue;
    
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : currentDate;
    
    // Calculate months between dates
    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + 
                      (endDate.getMonth() - startDate.getMonth());
    
    totalMonths += Math.max(0, monthDiff);
  }
  
  return Math.round((totalMonths / 12) * 10) / 10; // Round to 1 decimal place
};

/**
 * Parse resume data from JSON string or structured object
 */
const parseResumeData = (resume: unknown, resumeData: string | null): {
  education: Array<{
    institution: string; 
    degree: string; 
    major: string; 
    graduationStartMonth?: string;
    graduationStartYear?: string;
    graduationEndMonth?: string;
    graduationEndYear?: string;
    graduationDate?: string; // legacy field for backward compatibility
    gpa?: string | number;
    yearsOfExperience?: string | number;
    seniority?: string;
  }>;
  experience: Array<{company: string; position: string; startDate: string; endDate: string; description: string}>;
  skills: string[];
  projects: Array<{title: string; description: string; technologies: string; url?: string}>;
} => {
  let parsedData: any = null;
  
  // Try structured resume field first
  if (resume && typeof resume === 'object') {
    parsedData = resume;
  }
  // Fallback to resumeData JSON string
  else if (resumeData) {
    try {
      parsedData = JSON.parse(resumeData);
    } catch (error) {
      console.warn('Failed to parse resumeData JSON:', error);
      return {
        education: [],
        experience: [],
        skills: [],
        projects: []
      };
    }
  }
  
  if (!parsedData) {
    return {
      education: [],
      experience: [],
      skills: [],
      projects: []
    };
  }
  
  // Normalize and ensure all education fields are present
  const normalizedEducation = (parsedData.education || []).map((edu: any) => {
    const normalizedEdu: any = {
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
    };
    
    // Keep legacy graduationDate field if present
    if (edu.graduationDate) {
      normalizedEdu.graduationDate = edu.graduationDate;
    }
    
    // Ensure all fields are strings or properly typed
    Object.keys(normalizedEdu).forEach(key => {
      if (normalizedEdu[key] === null || normalizedEdu[key] === undefined) {
        normalizedEdu[key] = '';
      }
      if (typeof normalizedEdu[key] !== 'string' && key !== 'gpa' && key !== 'yearsOfExperience') {
        normalizedEdu[key] = String(normalizedEdu[key]);
      }
    });
    
    return normalizedEdu;
  });
  
  // Normalize experience data
  const normalizedExperience = (parsedData.experience || []).map((exp: any) => ({
    company: exp.company || '',
    position: exp.position || '',
    startDate: exp.startDate || '',
    endDate: exp.endDate || '',
    description: exp.description || ''
  }));
  
  // Normalize skills (filter out empty strings)
  const normalizedSkills = (parsedData.skills || [])
    .filter((skill: any) => skill && typeof skill === 'string' && skill.trim() !== '');
  
  // Normalize projects
  const normalizedProjects = (parsedData.projects || []).map((proj: any) => ({
    title: proj.title || '',
    description: proj.description || '',
    technologies: proj.technologies || '',
    url: proj.url || ''
  }));
  
  return {
    education: normalizedEducation,
    experience: normalizedExperience,
    skills: normalizedSkills,
    projects: normalizedProjects
  };
};

export const handler: APIGatewayProxyHandler = async (event): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Check if this is a test endpoint (no authorization required)
    const isTestEndpoint = event.resource === '/test-profiles';
    
    // Check if this is an API key authenticated request
    const isApiKeyRequest = event.headers && (event.headers['x-api-key'] || event.headers['X-API-Key']);
    
    // Variables for user context
    let requestingUserId = '';
    let isAdmin = false;
    let isProfessor = false;
    let isLabAssistant = false;
    
    if (!isTestEndpoint && !isApiKeyRequest) {
      // Get user groups and user ID from the authorizer context for secured endpoints
      const claims = event.requestContext.authorizer?.claims;
      const groups = claims?.['cognito:groups'] || claims?.groups || '';
      requestingUserId = claims?.['sub'] || claims?.userId || '';
      const requestingUserEmail = claims?.['email'] || '';
      
      console.log('Authorization details:', {
        groups,
        requestingUserId,
        requestingUserEmail,
        allClaims: claims
      });
      
      // Check user roles - support both string and array formats
      const groupsArray = typeof groups === 'string' ? groups.split(',') : (Array.isArray(groups) ? groups : []);
      isAdmin = groupsArray.includes('Admin');
      isProfessor = groupsArray.includes('Professor');
      isLabAssistant = groupsArray.includes('LabAssistant');
      
      console.log('Role check result:', { isAdmin, isProfessor, isLabAssistant, groupsArray });
      
      // Allow access for Admin, Professor, or LabAssistant roles
      if (!isAdmin && !isProfessor && !isLabAssistant) {
        return {
          statusCode: 403,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            error: 'Unauthorized. You need Admin, Professor, or LabAssistant role to access this resource.',
            yourRoles: groupsArray,
            requiredRoles: ['Admin', 'Professor', 'LabAssistant']
          }),
        };
      }
    } else {
      console.log('Test endpoint or API key request accessed - skipping authorization');
      isAdmin = true; // Grant admin access for test endpoint and API key requests
    }
    
    // Find the User table dynamically
    const listTablesCommand = new ListTablesCommand({});
    const tableList = await client.send(listTablesCommand);
    
    const userTable = tableList.TableNames?.find(name => name.startsWith('User-'));
    
    if (!userTable) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'User table not found' }),
      };
    }
    
    // Scan the DynamoDB table to get all users
    const scanCommand = new ScanCommand({
      TableName: userTable,
    });
    
    const response = await client.send(scanCommand);
    
    // Transform the DynamoDB items into recommendation profiles
    let profiles: RecommendationProfile[] = [];
    
    if (response.Items) {
      for (const item of response.Items) {
        const unmarshalledItem = unmarshall(item);
        
        // Only process students for recommendation system
        const roles = Array.isArray(unmarshalledItem.roles) 
          ? unmarshalledItem.roles 
          : (typeof unmarshalledItem.roles === 'string' 
              ? unmarshalledItem.roles.split(',') 
              : []);
        
        if (!roles.includes('Student')) {
          continue; // Skip non-students
        }
        
        // Parse resume data
        const resumeData = parseResumeData(unmarshalledItem.resume, unmarshalledItem.resumeData);
        
        // Calculate years of experience if not manually set
        let yearsOfExperience = unmarshalledItem.yearsOfExperience || 0;
        if (!yearsOfExperience && resumeData.experience) {
          yearsOfExperience = calculateYearsOfExperience(resumeData.experience);
        }
        
        // Build the recommendation profile
        const profile: RecommendationProfile = {
          userId: unmarshalledItem.id || unmarshalledItem.userId,
          email: unmarshalledItem.email || '',
          education: resumeData.education || [],
          experience: resumeData.experience || [],
          skills: unmarshalledItem.skills || resumeData.skills || [],
          seniority: unmarshalledItem.seniority || 'Unknown',
          yearsOfExperience: yearsOfExperience,
          careerGoals: unmarshalledItem.careerGoals || '',
          resumeDescription: unmarshalledItem.resumeDescription || '',
          profileComplete: unmarshalledItem.profileComplete || false,
          lastUpdated: unmarshalledItem.updatedAt || unmarshalledItem.createdAt || new Date().toISOString(),
          labIds: unmarshalledItem.labIds || []
        };
        
        profiles.push(profile);
      }
    }
    
    // Query parameters for filtering/formatting
    const queryParams = event.queryStringParameters || {};
    const format = queryParams.format?.toLowerCase();
    const includeIncompleteProfiles = queryParams.includeIncomplete === 'true';
    
    // Filter profiles based on role and parameters
    if (!isAdmin) {
      // For Professors and Lab Assistants, filter to show only students in their labs
      // This would require additional logic to map users to labs
      // For now, we'll show all students but this can be restricted
    }
    
    // Filter incomplete profiles if not requested
    if (!includeIncompleteProfiles) {
      profiles = profiles.filter(profile => profile.profileComplete);
    }
    
    // Prepare metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      filterApplied: 'students_only',
      includedIncomplete: includeIncompleteProfiles,
      requestedBy: requestingUserId,
      apiVersion: '1.0'
    };
    
    // Return data in requested format
    if (format === 'csv') {
      // Generate CSV format
      const csvHeaders = [
        'userId', 'email', 'education', 'experience', 'skills', 
        'seniority', 'yearsOfExperience', 'careerGoals', 'profileComplete', 'lastUpdated'
      ];
      
      const csvRows = profiles.map(profile => [
        profile.userId,
        profile.email,
        JSON.stringify(profile.education),
        JSON.stringify(profile.experience),
        JSON.stringify(profile.skills),
        profile.seniority,
        profile.yearsOfExperience.toString(),
        profile.careerGoals,
        profile.profileComplete.toString(),
        profile.lastUpdated
      ]);
      
      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
      
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="student-profiles.csv"'
        },
        body: csvContent,
      };
    } else {
      // Return JSON format
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profiles,
          count: profiles.length,
          metadata
        }),
      };
    }
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
}; 