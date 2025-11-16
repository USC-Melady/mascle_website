// utils.ts
import { ResumeDetails, Application, Position } from './types';

// Simulating the auth utilities that were imported in the original file
export const getAuthenticatedUser = async (): Promise<{ username?: string; attributes?: { email?: string } } | null> => {
  // This is a placeholder that mimics the behavior of the original getAuthenticatedUser function
  // In a real application, this would interact with an authentication service
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    return JSON.parse(storedUser);
  }
  return null;
};

export const hasRequiredRole = async (_roles: string[]): Promise<boolean> => {
  // This is a placeholder for role-checking logic
  // In a real application, this would check against user roles in a backend
  return true;
};

export const signOutUser = async (): Promise<void> => {
  // This is a placeholder for sign-out logic
  // In a real application, this would handle authentication sign-out
  localStorage.removeItem('user');
};

// Load resume details from local storage
export const loadResumeDetailsFromStorage = (): ResumeDetails | null => {
  try {
    const savedResumeDetails = localStorage.getItem('resumeDetails');
    if (savedResumeDetails) {
      return JSON.parse(savedResumeDetails);
    }
  } catch (e) {
    console.error('Error parsing saved resume details', e);
  }
  return null;
};

// Check if user has an uploaded resume
export const hasUploadedResume = (): boolean => {
  return !!localStorage.getItem('userResume');
};

// Save resume details to storage
export const saveResumeDetailsToStorage = (resumeDetails: ResumeDetails): void => {
  localStorage.setItem('resumeDetails', JSON.stringify(resumeDetails));
};

// Save resume file information
export const saveResumeFile = (fileName: string): void => {
  localStorage.setItem('userResume', fileName);
};

// Get default empty resume details
export const getDefaultResumeDetails = (): ResumeDetails => {
  return {
    education: [{ institution: '', degree: '', major: '', graduationDate: '', gpa: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '' }],
    skills: [''],
    projects: [{ title: '', description: '', technologies: '', url: '' }]
  };
};

// Get mock applications data
export const getMockApplications = (): Application[] => {
  return [
    { 
      id: '1', 
      position: 'Computer Vision Research Assistant',
      lab: 'Computer Vision Lab',
      professor: 'Dr. Smith',
      applied: 'March 1, 2023',
      status: 'Under Review',
      statusBadge: 'warning'
    },
    { 
      id: '2', 
      position: 'Machine Learning Lab Assistant',
      lab: 'AI Research Group',
      professor: 'Dr. Johnson',
      applied: 'February 15, 2023',
      status: 'Interview Scheduled',
      statusBadge: 'success'
    },
    { 
      id: '3', 
      position: 'Data Science Research Position',
      lab: 'Data Science Lab',
      professor: 'Dr. Williams',
      applied: 'January 20, 2023',
      status: 'Rejected',
      statusBadge: 'danger'
    }
  ];
};

// Get mock open positions
export const getMockOpenPositions = (): Position[] => {
  return [
    {
      id: '101',
      title: 'AI Ethics Research Position',
      department: 'Department of Computer Science',
      lab: 'AI Ethics Lab',
      professor: 'Dr. Garcia',
      deadline: '3 days',
      description: 'Research position focusing on ethical implications of AI algorithms.',
      requirements: ['Strong background in AI', 'Interest in ethics', 'Programming skills']
    },
    {
      id: '102',
      title: 'Robotics Lab Assistant',
      department: 'Department of Electrical Engineering',
      lab: 'Robotics Research Lab',
      professor: 'Dr. Lee',
      deadline: '5 days',
      description: 'Assist with robotics experiments and data collection.',
      requirements: ['Experience with robotics', 'Programming in Python', 'Lab experience']
    },
    {
      id: '103',
      title: 'Natural Language Processing Researcher',
      department: 'Department of Computer Science',
      lab: 'NLP Research Group',
      professor: 'Dr. Taylor',
      deadline: '7 days',
      description: 'Research in advanced NLP techniques and applications.',
      requirements: ['NLP experience', 'Machine learning knowledge', 'Python proficiency']
    }
  ];
};