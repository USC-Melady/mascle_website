// import { fetchAuthSession } from 'aws-amplify/auth';
// import { API_ENDPOINTS } from '../../../config';

/**
 * Refresh resume data for applications
 * This function calls the backend to refresh resume data for applications
 */
export const refreshApplicationsResumeData = async (_jobId?: string): Promise<{
  success: boolean;
  message: string;
  data?: { applicationsEnhanced?: number };
}> => {
  // Temporarily disabled while fixing backend configuration
  return {
    success: false,
    message: 'Resume refresh functionality is temporarily disabled while fixing backend configuration. Please try again later.'
  };
  
  /* try {
    // Get auth token
    const { tokens } = await fetchAuthSession();
    const token = tokens?.idToken?.toString();
    
    if (!token) {
      console.error('No auth token available');
      return { success: false, message: 'Authentication error. Please log in again.' };
    }
    
    // Determine the API endpoint
    let apiUrl = `${API_ENDPOINTS.REFRESH_RESUME_DATA}`;
    if (jobId) {
      apiUrl += `?jobId=${jobId}`;
    }
    
    console.log(`Calling API to refresh resume data: ${apiUrl}`);
    
    // Make the API call
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error (${response.status}): ${errorText}`);
      return { 
        success: false, 
        message: `Failed to refresh resume data (${response.status})` 
      };
    }
    
    const data = await response.json();
    console.log('Resume data refresh result:', data);
    
    return {
      success: true,
      message: `Successfully refreshed resume data for ${data.applicationsEnhanced || 0} applications`,
      data
    };
  } catch (error) {
    console.error('Error refreshing resume data:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
  */
};

/**
 * Get formatted education text from resumeDetails
 */
export const formatEducation = (resumeDetails?: StructuredResume): string => {
  if (!resumeDetails || !resumeDetails.education || !Array.isArray(resumeDetails.education)) {
    return 'No education information provided';
  }
  
  const validEducation = resumeDetails.education.filter(
    (edu: Education) => edu.institution && edu.degree
  );
  
  if (validEducation.length === 0) {
    return 'No education information provided';
  }
  
  return validEducation
    .map((edu: Education) => 
      `${edu.degree} in ${edu.major || 'Unspecified'} at ${edu.institution}${edu.graduationDate ? ` (${edu.graduationDate})` : ''}`
    )
    .join('\n');
};

/**
 * Get formatted skills text from resumeDetails
 */
export const formatSkills = (resumeDetails?: StructuredResume): string => {
  if (!resumeDetails || !resumeDetails.skills || !Array.isArray(resumeDetails.skills)) {
    return 'No skills provided';
  }
  
  const validSkills = resumeDetails.skills.filter(
    (skill: string) => typeof skill === 'string' && skill.trim() !== ''
  );
  
  if (validSkills.length === 0) {
    return 'No skills provided';
  }
  
  return validSkills.join(', ');
};

/**
 * Education type for structured resume data
 */
export interface Education {
  institution?: string;
  degree?: string;
  major?: string;
  graduationDate?: string;
  gpa?: string;
}

/**
 * Skills type for structured resume data
 */
export type Skills = string[];

/**
 * Experience type for structured resume data
 */
export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  isCurrent?: boolean;
}

/**
 * Project type for structured resume data
 */
export interface Project {
  title: string;
  description: string;
  technologies: string;
  url?: string;
}


/**
 * Resume type for structured resume data
 */
export interface StructuredResume {
  education?: Education[];
  skills?: Skills;
  projects?: Project[];
  experience?: Experience[];
  lastUpdated?: string;
}

/**
 * Format education data into a readable string
 * Handle both structured resume format and legacy string format
 */
export const getFormattedEducationString = (resumeData: StructuredResume | string | unknown): string => {
  try {
    // Check if we have structured resume data
    if (resumeData && typeof resumeData === 'object' && 'education' in resumeData && 
        Array.isArray((resumeData as StructuredResume).education)) {
      // Use the structured format
      return ((resumeData as StructuredResume).education || []).map((edu: Education) => {
        const parts = [];
        if (edu.degree) parts.push(edu.degree);
        if (edu.major) parts.push(`in ${edu.major}`);
        if (edu.institution) parts.push(`from ${edu.institution}`);
        if (edu.graduationDate) {
          const year = new Date(edu.graduationDate).getFullYear();
          if (!isNaN(year)) parts.push(`(${year})`);
        }
        return parts.join(' ');
      }).join('\n');
    }
    
    // Fallback to legacy format (string)
    if (typeof resumeData === 'string') {
      // For simple string format, return as-is
      return resumeData;
    }
    
    // If it's an object but not in the expected format
    if (typeof resumeData === 'object' && resumeData !== null) {
      return JSON.stringify(resumeData);
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting education string:', error);
    return '';
  }
};

/**
 * Format skills data into a readable string
 * Handle both structured resume format and legacy string format
 */
export const getFormattedSkillsString = (resumeData: StructuredResume | string | unknown): string => {
  try {
    // Check if we have structured resume data
    if (resumeData && typeof resumeData === 'object' && 'skills' in resumeData && 
        Array.isArray((resumeData as StructuredResume).skills)) {
      // Use the structured format
      return ((resumeData as StructuredResume).skills || []).join(', ');
    }
    
    // Fallback to legacy format (string)
    if (typeof resumeData === 'string') {
      // For simple string format, return as-is
      return resumeData;
    }
    
    // If it's an object but not in the expected format
    if (typeof resumeData === 'object' && resumeData !== null) {
      return JSON.stringify(resumeData);
    }
    
    return '';
  } catch (error) {
    console.error('Error formatting skills string:', error);
    return '';
  }
}; 