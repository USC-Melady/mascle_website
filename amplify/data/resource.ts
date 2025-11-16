import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

// Define Resume type for structured data
const schema = a.schema({
  // Resume-related types
  Education: a.customType({
    institution: a.string(),
    degree: a.string(),
    major: a.string(),
    graduationStartMonth: a.string(),
    graduationStartYear: a.string(),
    graduationEndMonth: a.string(),
    graduationEndYear: a.string(),
    gpa: a.string(), // keeping as string for flexibility in input handling
    yearsOfExperience: a.string(), // keeping as string for flexibility
    seniority: a.string() // fresh, soph, junior, senior, masters year 1, masters year 2
  }),
  
  Experience: a.customType({
    company: a.string(),
    position: a.string(),
    startDate: a.string(),
    endDate: a.string(),
    description: a.string(),
    startMonth: a.string(),
    startYear: a.string(),
    endMonth: a.string(),
    endYear: a.string(),
    isCurrent: a.boolean()
  }),
  
  Project: a.customType({
    title: a.string(),
    description: a.string(),
    technologies: a.string(),
    url: a.string()
  }),
  
  Resume: a.customType({
    education: a.ref('Education').array(),
    experience: a.ref('Experience').array(),
    skills: a.string().array(),
    projects: a.ref('Project').array(),
    lastUpdated: a.datetime()
  }),
  
  User: a
    .model({
      userId: a.string().required(),
      email: a.string().required(),
      roles: a.string().array().required(), // Array of roles: 'Admin', 'Professor', 'LabAssistant', 'Student'
      labIds: a.string().array(), // Labs they're associated with (if Professor or LabAssistant)
      status: a.string(),
      
      // Resume-related fields
      resumeData: a.string(), // Deprecated: JSON string of the resume details (kept for backward compatibility)
      resumeFileName: a.string(), // S3 file key for the user's resume
      resumeUrl: a.string(), // Direct S3 URL for the resume file
      resumeLastUpdated: a.datetime(), // When resume was last updated
      resume: a.json(), // Structured resume data using the Resume type
      profileComplete: a.boolean(), // Whether the user has completed their profile
      skills: a.string().array(), // Array of skills for searching and matching
      
      // New fields for recommendation system
      careerGoals: a.string(), // Career aspirations and research interests
      seniority: a.string(), // 'freshman', 'sophomore', 'junior', 'senior', 'masters'
      yearsOfExperience: a.float(), // Calculated from experience or manually entered
      resumeDescription: a.string(), // Generated resume summary for similarity matching
      
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [
      // Admins can do everything with users
      allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
      // Professors can read and update users (assistants will be filtered on frontend)
      allow.groups(['Professor']).to(['read', 'update']),
      // Lab Assistants can read user data
      allow.groups(['LabAssistant']).to(['read']),
      // Users can view and update their own data
      allow.owner().to(['read', 'update']),
      // Any authenticated user can see basic user info
      allow.authenticated().to(['read'])
    ]),

  Lab: a
    .model({
      labId: a.string().required(),
      name: a.string().required(),
      professorId: a.string().required(), // Keep for backward compatibility
      professorIds: a.string().array(), // NEW: Array of professor IDs associated with this lab
      labAssistantIds: a.string().array(), // IDs of lab assistants assigned to this lab
      description: a.string(),
      status: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [
      // Admins have full control
      allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
      // Professors can read, update, and delete but not create
      allow.groups(['Professor']).to(['read', 'update', 'delete']),
      // Lab Assistants have same permissions as professors (except creation)
      allow.groups(['LabAssistant']).to(['read', 'update', 'delete']),
      // Students can only view
      allow.groups(['Student']).to(['read'])
    ]),


  Job: a
    .model({
      jobId: a.string().required(),
      title: a.string().required(),
      description: a.string().required(),
      labId: a.string().required(),
      professorId: a.string().required(),
      requirements: a.string(),
      academicLevel: a.string(), // 'freshman', 'sophomore', 'junior', 'senior', 'masters', 'any'
      status: a.string(),
      visibility: a.string(), // 'public' or 'private' - determines if job is visible to non-authenticated users
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [
      // Admins have full control
      allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
      // Professors have full control over jobs
      allow.groups(['Professor', 'LabAssistant']).to(['create', 'read', 'update', 'delete']),
      // Students can only view jobs
      allow.groups(['Student']).to(['read'])
    ]),

  Match: a
    .model({
      matchId: a.string().required(),
      studentId: a.string().required(),
      jobId: a.string().required(),
      status: a.string(), // 'pending', 'accepted', 'rejected'
      // Add fields for storing resume data with application
      coverLetter: a.string(),
      resumeUrl: a.string(),
      resumeData: a.string(), // JSON string of resume data at time of application
      // New application fields
      summerAvailability: a.string(), // 'full-time', 'part-time', 'no', 'tbd'
      hoursPerWeek: a.string(), // '1-7', '8-12', '13-19', '20+'
      expectations: a.string(), // Open text field for expectations
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [
      // Admins have full control
      allow.groups(['Admin']).to(['create', 'read', 'update', 'delete']),
      // Professors can view and update matches
      allow.groups(['Professor']).to(['read', 'update']),
      // Lab Assistants have same abilities as professors
      allow.groups(['LabAssistant']).to(['read', 'update']),
      // Students can see their own matches
      allow.authenticated().to(['read'])
    ])
});

// Debug info
console.log('Schema models configured:', Object.keys(schema.models).join(', '));

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    // Add API Key to allow public access to certain queries
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});

// NOTE: To implement a structured resume format, we'll need to use:
// 1. Custom types in the frontend code
// 2. Parse and stringify JSON data when interacting with the database
// 3. Use proper validation and type checking in the application code

// Example TypeScript interface for structured resume data:
/*
export interface ResumeStructure {
  education: Array<{
    institution: string;
    degree: string;
    major: string;
    graduationStartMonth?: string;
    graduationStartYear?: string;
    graduationEndMonth?: string;
    graduationEndYear?: string;
    gpa?: string | number;
    yearsOfExperience?: string | number;
    seniority?: string; // fresh, soph, junior, senior, masters year 1, masters year 2
  }>;
  skills: string[];
  experience: Array<{
    company: string;
    position: string;
    startDate?: string;
    endDate?: string;
    description?: string;
  }>;
  projects: Array<{
    title: string;
    description?: string;
    technologies?: string;
    url?: string;
  }>;
}
*/