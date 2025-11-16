import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';
import { fetchAuthSession } from 'aws-amplify/auth';

// Comprehensive skill categories for test data generation
const SKILL_CATEGORIES = {
  'Programming Languages': [
    'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'R', 'MATLAB', 'SQL', 'HTML/CSS',
    'TypeScript', 'Swift', 'Kotlin', 'Go', 'Rust', 'PHP', 'Ruby', 'Scala', 'Perl', 'Shell/Bash'
  ],
  'Data Science & ML': [
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics', 'Data Visualization',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI',
    'Natural Language Processing', 'Computer Vision', 'Neural Networks', 'Statistical Modeling'
  ],
  'Web Development': [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'AWS', 'Azure'
  ],
  'Research & Academic': [
    'Research Design', 'Literature Review', 'Academic Writing', 'Experimental Design', 
    'Data Collection', 'Survey Design', 'Qualitative Analysis', 'Quantitative Analysis',
    'Peer Review', 'Grant Writing', 'Scientific Writing', 'Research Ethics'
  ],
  'Engineering & Technical': [
    'CAD', 'SolidWorks', 'AutoCAD', 'ANSYS', 'Circuit Design', 'PCB Design', 'Arduino', 'Raspberry Pi',
    'Embedded Systems', 'Signal Processing', 'Control Systems', 'Robotics', '3D Printing', 'Prototyping'
  ],
  'Laboratory & Sciences': [
    'Lab Techniques', 'Microscopy', 'Cell Culture', 'PCR', 'Western Blot', 'ELISA', 'Flow Cytometry',
    'Spectroscopy', 'Chromatography', 'Molecular Biology', 'Biochemistry', 'Microbiology'
  ]
};

// Generate random skills from different categories
const generateRandomSkills = (count: number = 8): string[] => {
  const allSkills = Object.values(SKILL_CATEGORIES).flat();
  const selectedSkills = new Set<string>();
  
  while (selectedSkills.size < count && selectedSkills.size < allSkills.length) {
    const randomSkill = allSkills[Math.floor(Math.random() * allSkills.length)];
    selectedSkills.add(randomSkill);
  }
  
  return Array.from(selectedSkills);
};

// Sample diverse test data profiles
const testResumeProfiles = [
  {
    education: [
      {
        institution: 'University of Southern California',
        degree: 'Bachelor of Science',
        major: 'Computer Science',
        graduationDate: '2024-05-15',
        gpa: '3.9'
      }
    ],
    experience: [
      {
        company: 'Google',
        position: 'Software Engineering Intern',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        description: 'Developed machine learning models for search optimization using TensorFlow and Python. Collaborated with cross-functional teams to improve search algorithm performance by 15%.'
      }
    ],
    skills: ['Python', 'TensorFlow', 'Machine Learning', 'JavaScript', 'React', 'SQL', 'AWS', 'Git'],
    projects: [
      {
        title: 'AI-Powered Study Assistant',
        description: 'Built a natural language processing application that helps students summarize academic papers and generate study notes using OpenAI API and React',
        technologies: 'React, Node.js, OpenAI API, MongoDB',
        url: 'https://github.com/student/ai-study-assistant'
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    education: [
      {
        institution: 'University of Southern California',
        degree: 'Master of Science',
        major: 'Data Science',
        graduationDate: '2024-12-15',
        gpa: '3.7'
      }
    ],
    experience: [
      {
        company: 'Netflix',
        position: 'Data Science Intern',
        startDate: '2023-05-15',
        endDate: '2023-08-15',
        description: 'Analyzed user engagement patterns and developed recommendation algorithms. Built A/B testing frameworks and statistical models to improve content discovery by 20%.'
      }
    ],
    skills: ['Python', 'R', 'Statistics', 'Deep Learning', 'PyTorch', 'Pandas', 'Tableau', 'SQL', 'Jupyter'],
    projects: [
      {
        title: 'Movie Recommendation System',
        description: 'Implemented collaborative filtering and content-based recommendation algorithms using PyTorch and scikit-learn, achieving 92% accuracy on movie rating predictions',
        technologies: 'Python, PyTorch, scikit-learn, Flask, PostgreSQL',
        url: 'https://github.com/student/movie-recommender'
      }
    ],
    lastUpdated: new Date().toISOString()
  },
  {
    education: [
      {
        institution: 'University of Southern California',
        degree: 'Bachelor of Science',
        major: 'Biomedical Engineering',
        graduationDate: '2025-05-15',
        gpa: '3.6'
      }
    ],
    experience: [
      {
        company: 'Medtronic',
        position: 'Biomedical Engineering Intern',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        description: 'Designed and tested medical device prototypes using CAD software and 3D printing. Conducted biocompatibility testing and regulatory documentation for FDA approval processes.'
      }
    ],
    skills: ['SolidWorks', 'CAD', 'MATLAB', '3D Printing', 'Circuit Design', 'Lab Techniques', 'Research Design', 'Statistical Analysis'],
    projects: [
      {
        title: 'Smart Prosthetic Hand Controller',
        description: 'Developed an EMG-controlled prosthetic hand using Arduino and machine learning algorithms to classify muscle signals with 95% accuracy',
        technologies: 'Arduino, Python, TensorFlow, SolidWorks, 3D Printing',
        url: 'https://github.com/student/smart-prosthetic'
      }
    ],
    lastUpdated: new Date().toISOString()
  }
];

// Create structured resume test data - randomly select from profiles
const getRandomTestResumeData = () => {
  const randomProfile = testResumeProfiles[Math.floor(Math.random() * testResumeProfiles.length)];
  
  // Add some random additional skills to make each test more diverse
  const additionalSkills = generateRandomSkills(5);
  const combinedSkills = [...new Set([...randomProfile.skills, ...additionalSkills])];
  
  return {
    ...randomProfile,
    skills: combinedSkills.slice(0, 12), // Limit to 12 skills max
    lastUpdated: new Date().toISOString()
  };
};

const testResumeData = getRandomTestResumeData();

// Export function to generate multiple diverse test profiles for testing
export const generateMultipleTestProfiles = (count: number = 10) => {
  const profiles = [];
  for (let i = 0; i < count; i++) {
    profiles.push(getRandomTestResumeData());
  }
  return profiles;
};

// Function to test updating a user's resume with structured data
export const testUpdateStructuredResume = async (): Promise<boolean> => {
  try {
    console.log('Starting structured resume test...');
    
    // Get the authenticated user
    const { tokens } = await fetchAuthSession();
    if (!tokens?.idToken) {
      console.error('No authentication token found');
      return false;
    }
    
    const userId = tokens.idToken.payload.sub as string;
    if (!userId) {
      console.error('No user ID found in token');
      return false;
    }
    
    console.log(`Testing resume update for user: ${userId}`);
    
    // Generate GraphQL client
    const client = generateClient<Schema>();
    
    // Store the structured resume data using json field
    const updateResult = await client.models.User.update({
      id: userId,
      resume: testResumeData,
      resumeLastUpdated: new Date().toISOString()
    });
    
    console.log('Update result:', updateResult);
    
    // Verify if update was successful
    if (updateResult.data) {
      console.log('Resume data successfully updated!');
      
      // Now try to retrieve the data
      const getResult = await client.models.User.get({ id: userId });
      
      if (getResult.data && getResult.data.resume) {
        console.log('Retrieved resume data:', getResult.data.resume);
        return true;
      } else {
        console.error('Failed to retrieve resume data');
        return false;
      }
    } else {
      console.error('Failed to update resume data');
      return false;
    }
  } catch (error) {
    console.error('Error in testUpdateStructuredResume:', error);
    return false;
  }
};

// Function to retrieve and display structured resume data
export const testGetStructuredResume = async (): Promise<{
  resume: unknown;
  resumeData: Record<string, unknown> | null;
  resumeUrl: string | null;
} | null> => {
  try {
    console.log('Retrieving structured resume data...');
    
    // Get the authenticated user
    const { tokens } = await fetchAuthSession();
    if (!tokens?.idToken) {
      console.error('No authentication token found');
      return null;
    }
    
    const userId = tokens.idToken.payload.sub as string;
    if (!userId) {
      console.error('No user ID found in token');
      return null;
    }
    
    console.log(`Getting resume for user: ${userId}`);
    
    // Generate GraphQL client
    const client = generateClient<Schema>();
    
    // Get the user record
    const getResult = await client.models.User.get({ id: userId });
    
    if (getResult.data) {
      console.log('User data retrieved:', getResult.data);
      
      // Extract resume data, handle both formats
      const resumeData = getResult.data.resume; // New structured format
      const resumeDataString = getResult.data.resumeData; // Legacy format
      const resumeUrl = getResult.data.resumeUrl; // Resume URL
      
      console.log('Structured resume data:', resumeData);
      console.log('Legacy resume data string:', resumeDataString);
      console.log('Resume URL:', resumeUrl);
      
      return {
        resume: resumeData,
        resumeData: resumeDataString ? JSON.parse(resumeDataString) : null,
        resumeUrl: resumeUrl || null
      };
    } else {
      console.error('Failed to retrieve user data');
      return null;
    }
  } catch (error) {
    console.error('Error in testGetStructuredResume:', error);
    return null;
  }
}; 