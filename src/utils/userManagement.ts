import { User, Lab } from "../types/api";
import { getCurrentUser, fetchAuthSession } from "aws-amplify/auth";

// Set this to false to use real data
const DEVELOPMENT_MODE = false;

// Mock data for development - will only be used if DEVELOPMENT_MODE is true
const mockUsers: User[] = [
  {
    userId: 'admin-123',
    email: 'admin@example.com',
    roles: ['Admin'],
    status: 'CONFIRMED',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    userId: 'prof-123',
    email: 'professor@example.com',
    roles: ['Professor'],
    labIds: ['lab-1', 'lab-2'],
    status: 'CONFIRMED',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    userId: 'assistant-123',
    email: 'labassistant@example.com',
    roles: ['LabAssistant'],
    labIds: ['lab-1'],
    status: 'CONFIRMED',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    userId: 'student-123',
    email: 'student@example.com',
    roles: ['Student'],
    status: 'CONFIRMED',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

const mockLabs: Lab[] = [
  {
    labId: 'lab-1',
    name: 'Computer Vision Lab',
    professorId: 'prof-123',
    labAssistantIds: ['assistant-123'],
    description: 'Research in computer vision and image processing',
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  },
  {
    labId: 'lab-2',
    name: 'Machine Learning Research Group',
    professorId: 'prof-123',
    labAssistantIds: [],
    description: 'Advanced research in machine learning algorithms',
    status: 'ACTIVE',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z'
  }
];

// Define an interface for the raw user data from the API
interface RawUserData {
  userId?: string;
  id?: string;
  email: string;
  roles?: string[];
  labIds?: string[];
  status?: string;
  givenName?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Helper function to get the API endpoint
 * @param path The API path
 * @returns The full API endpoint URL
 */
export function getApiEndpoint(path: string): string {
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  // If we have an API URL from environment variables, use it
  if (apiUrl) {
    return `${apiUrl}${path}`;
  }
  
  // Fallback to hardcoded URL if environment variable is not set
  const region = 'us-east-1';
  const restApiId = 'scvh6uq7r1'; 
  const stage = 'dev';
  
  const baseUrl = `https://${restApiId}.execute-api.${region}.amazonaws.com/${stage}`;
  console.log(`API endpoint: ${baseUrl}${path}`);
  return `${baseUrl}${path}`;
}

/**
 * Get all users in the system
 * @returns Promise<User[]>
 */
export async function getAllUsers(): Promise<User[]> {
  if (DEVELOPMENT_MODE) {
    return mockUsers;
  } else {
    try {
      // Get auth session for the API call
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Call the API to get users from DynamoDB
      const usersEndpoint = getApiEndpoint('/users');
      console.log('API URL:', usersEndpoint);

      const response = await fetch(usersEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin
        }
      });
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || `Failed to fetch users: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
          errorMessage = `Failed to fetch users: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = await response.json();
        console.log('API response data:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid JSON response from API');
      }
      
      // Handle different response formats
      if (data.users && Array.isArray(data.users)) {
        return data.users.map((user: RawUserData) => ({
          userId: user.userId || user.id || '',
          email: user.email,
          roles: user.roles || [],
          labIds: user.labIds || [],
          status: user.status,
          givenName: user.givenName,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));
      } else if (Array.isArray(data)) {
        return data.map((user: RawUserData) => ({
          userId: user.userId || user.id || '',
          email: user.email,
          roles: user.roles || [],
          labIds: user.labIds || [],
          status: user.status,
          givenName: user.givenName,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }));
      } else {
        console.warn('Unexpected API response format:', data);
        return [];
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
}

/**
 * Get all labs in the system
 * @returns Promise<Lab[]>
 */
export async function getAllLabs(): Promise<Lab[]> {
  if (DEVELOPMENT_MODE) {
    return mockLabs;
  } else {
    try {
      console.log('Getting all labs...');
      
      // Get the current session to retrieve the authentication token
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Get the API URL from environment variables or use a default
      const apiUrl = process.env.REACT_APP_API_URL || 'https://api.example.com';
      const labsEndpoint = `${apiUrl}/labs`;
      
      console.log('API URL:', labsEndpoint);
      
      // Make the API request
      const response = await fetch(labsEndpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Labs data:', data);
      
      if (!data.labs || !Array.isArray(data.labs)) {
        throw new Error('Invalid response format');
      }
      
      return data.labs;
    } catch (error) {
      console.error('Error getting labs:', error);
      
      // In development mode, return mock data
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock lab data in development mode');
        return [
          {
            labId: 'lab-1',
            name: 'Computer Vision Lab',
            description: 'Research in computer vision and image processing',
            professorId: 'prof-1',
            assistants: ['assistant-1', 'assistant-2'],
            students: ['student-1', 'student-2', 'student-3'],
            status: 'active'
          },
          {
            labId: 'lab-2',
            name: 'Machine Learning Research Group',
            description: 'Advanced research in machine learning algorithms',
            professorId: 'prof-2',
            assistants: ['assistant-3'],
            students: ['student-4', 'student-5', 'student-6', 'student-7'],
            status: 'active'
          },
          {
            labId: 'lab-3',
            name: 'Robotics Lab',
            description: 'Robotics and automation research',
            professorId: 'prof-1',
            assistants: ['assistant-4'],
            students: ['student-8', 'student-9'],
            status: 'active'
          }
        ];
      }
      
      throw error;
    }
  }
}

/**
 * Get labs for a specific professor
 * @param professorId The ID of the professor
 * @returns Promise<Lab[]>
 */
export async function getLabsForProfessor(professorId: string): Promise<Lab[]> {
  try {
    const allLabs = await getAllLabs();
    return allLabs.filter(lab => lab.professorId === professorId);
  } catch (error) {
    console.error('Error fetching labs for professor:', error);
    throw error;
  }
}

/**
 * Get the current user's ID
 * @returns Promise<string | null>
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const currentUser = await getCurrentUser();
    return currentUser.userId;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Create a new user in Cognito and the database
 * @param email User's email
 * @param temporaryPassword Temporary password
 * @param roles Array of roles to assign
 * @param givenName Optional given name
 * @returns Promise<User>
 */
export async function createUser(
  email: string,
  temporaryPassword: string,
  roles: string[],
  givenName?: string
): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const newUser: User = {
      userId: `user-${Date.now()}`,
      email,
      roles,
      status: 'FORCE_CHANGE_PASSWORD',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    return newUser;
  } else {
    try {
      // Get auth session for the API call
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      // Call the API to create a user - using the /create endpoint which exists
      const createEndpoint = getApiEndpoint('/createUser');
      console.log('Creating user with endpoint:', createEndpoint);
      console.log('Request payload:', { email, roles, givenName, temporaryPassword: '***' });
      
      const response = await fetch(createEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          email,
          temporaryPassword,
          roles,
          givenName
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          errorMessage = errorData.message || errorData.error || `Failed to create user: ${response.status} ${response.statusText}`;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
          errorMessage = `Failed to create user: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      let data;
      try {
        data = await response.json();
        console.log('Create user response:', data);
      } catch (parseError) {
        console.error('Error parsing response:', parseError);
        throw new Error('Invalid JSON response from API');
      }
      
      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }
}

/**
 * Update a user's roles in both Cognito and the database
 * @param userId User ID
 * @param newRoles Array of new roles
 * @returns Promise<User>
 */
export async function updateUserRoles(userId: string, newRoles: string[]): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const userIndex = mockUsers.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      roles: newRoles,
      updatedAt: new Date().toISOString()
    };
    
    return mockUsers[userIndex];
  } else {
    try {
      // Call the updateUserRoles Lambda function
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const updateUserRolesEndpoint = getApiEndpoint('/updateUserRoles');
      const response = await fetch(updateUserRolesEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, roles: newRoles })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user roles');
      }
      
      // Get the updated user
      const userIndex = mockUsers.findIndex(u => u.userId === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        roles: newRoles,
        updatedAt: new Date().toISOString()
      };
      
      return mockUsers[userIndex];
    } catch (error) {
      console.error('Error updating user roles:', error);
      throw error;
    }
  }
}

/**
 * Add a lab assistant to a lab
 * @param labId Lab ID
 * @param userId User ID to add as lab assistant
 * @returns Promise<Lab>
 */
export async function addLabAssistant(labId: string, userId: string): Promise<Lab> {
  try {
    // Find the lab
    const labIndex = mockLabs.findIndex(lab => lab.labId === labId);
    if (labIndex === -1) {
      throw new Error('Lab not found');
    }
    
    // Find the user
    const userIndex = mockUsers.findIndex(user => user.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Add the lab assistant ID to the lab
    const lab = mockLabs[labIndex];
    const assistantIds = lab.labAssistantIds || [];
    if (!assistantIds.includes(userId)) {
      assistantIds.push(userId);
    }
    
    // Update the lab
    mockLabs[labIndex] = {
      ...lab,
      labAssistantIds: assistantIds,
      updatedAt: new Date().toISOString()
    };
    
    // Add LabAssistant role to the user if they don't have it
    if (!mockUsers[userIndex].roles.includes('LabAssistant')) {
      mockUsers[userIndex].roles.push('LabAssistant');
    }
    
    // Add labIds to the user if they don't have it
    const userLabIds = mockUsers[userIndex].labIds || [];
    if (!userLabIds.includes(labId)) {
      userLabIds.push(labId);
      mockUsers[userIndex].labIds = userLabIds;
    }
    
    return mockLabs[labIndex];
  } catch (error) {
    console.error('Error adding lab assistant:', error);
    throw error;
  }
}

/**
 * Remove a lab assistant from a lab
 * @param labId Lab ID
 * @param userId User ID to remove as lab assistant
 * @returns Promise<Lab>
 */
export async function removeLabAssistant(labId: string, userId: string): Promise<Lab> {
  try {
    // Find the lab
    const labIndex = mockLabs.findIndex(lab => lab.labId === labId);
    if (labIndex === -1) {
      throw new Error('Lab not found');
    }
    
    // Find the user
    const userIndex = mockUsers.findIndex(user => user.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    // Remove the lab assistant ID from the lab
    const lab = mockLabs[labIndex];
    const assistantIds = lab.labAssistantIds || [];
    const updatedAssistantIds = assistantIds.filter(id => id !== userId);
    
    // Update the lab
    mockLabs[labIndex] = {
      ...lab,
      labAssistantIds: updatedAssistantIds,
      updatedAt: new Date().toISOString()
    };
    
    // Remove labId from user's labIds
    if (mockUsers[userIndex].labIds) {
      mockUsers[userIndex].labIds = mockUsers[userIndex].labIds.filter(id => id !== labId);
      
      // If user has no more labs, remove LabAssistant role
      if (mockUsers[userIndex].labIds.length === 0) {
        mockUsers[userIndex].roles = mockUsers[userIndex].roles.filter(role => role !== 'LabAssistant');
      }
    }
    
    return mockLabs[labIndex];
  } catch (error) {
    console.error('Error removing lab assistant:', error);
    throw error;
  }
}

/**
 * Get all users with Student role who are not lab assistants for a specific lab
 * @param labId Lab ID
 * @returns Promise<User[]>
 */
export async function getEligibleLabAssistants(labId: string): Promise<User[]> {
  try {
    const allUsers = await getAllUsers();
    const lab = mockLabs.find(lab => lab.labId === labId);
    
    if (!lab) {
      throw new Error('Lab not found');
    }
    
    // Filter for students who are not already assistants in this lab
    return allUsers.filter(user => {
      const isStudent = user.roles.includes('Student');
      const isNotAssistantInThisLab = !lab.labAssistantIds?.includes(user.userId);
      return isStudent && isNotAssistantInThisLab;
    });
  } catch (error) {
    console.error('Error getting eligible lab assistants:', error);
    throw error;
  }
}

/**
 * Get all lab assistants for a specific lab
 * @param labId Lab ID
 * @returns Promise<User[]>
 */
export async function getLabAssistants(labId: string): Promise<User[]> {
  try {
    const allUsers = await getAllUsers();
    const lab = mockLabs.find(lab => lab.labId === labId);
    
    if (!lab) {
      throw new Error('Lab not found');
    }
    
    // Filter for users who are assistants in this lab
    return allUsers.filter(user => {
      return lab.labAssistantIds?.includes(user.userId);
    });
  } catch (error) {
    console.error('Error getting lab assistants:', error);
    throw error;
  }
}

/**
 * Update a user's status in both Cognito and the database
 * @param userId User ID
 * @param newStatus New status (CONFIRMED, DISABLED, FORCE_CHANGE_PASSWORD)
 * @returns Promise<User>
 */
export async function updateUserStatus(userId: string, newStatus: string): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const userIndex = mockUsers.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      status: newStatus,
      updatedAt: new Date().toISOString()
    };
    
    return mockUsers[userIndex];
  } else {
    try {
      // Call the updateUserStatus Lambda function
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const updateUserStatusEndpoint = getApiEndpoint('/updateUserStatus');
      const response = await fetch(updateUserStatusEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status: newStatus })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user status');
      }
      
      // Get the updated user
      const userIndex = mockUsers.findIndex(u => u.userId === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      return mockUsers[userIndex];
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }
}

/**
 * Get labs for a specific user
 * @param userId The user ID to get labs for
 * @returns Promise resolving to an array of labs
 */
export async function getLabsForUser(userId: string): Promise<Lab[]> {
  const allLabs = await getAllLabs();
  
  // Filter labs based on user's association, safely checking for undefined arrays
  return allLabs.filter(lab => 
    lab.professorId === userId || 
    (lab.assistants && lab.assistants.includes(userId)) || 
    (lab.students && lab.students.includes(userId))
  );
}

/**
 * Add a user to a lab
 * @param userId User ID to add to the lab
 * @param labId Lab ID to add the user to
 * @param role Optional role to assign to the user (LabAssistant or Student)
 * @returns Promise<User>
 */
export async function addUserToLab(userId: string, labId: string, role?: string): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const userIndex = mockUsers.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const labIndex = mockLabs.findIndex(lab => lab.labId === labId);
    if (labIndex === -1) {
      throw new Error('Lab not found');
    }
    
    // Add lab to user's labIds
    const userLabIds = mockUsers[userIndex].labIds || [];
    if (!userLabIds.includes(labId)) {
      userLabIds.push(labId);
      mockUsers[userIndex].labIds = userLabIds;
    }
    
    // If role is LabAssistant, add user to lab's labAssistantIds
    if (role === 'LabAssistant') {
      const labAssistantIds = mockLabs[labIndex].labAssistantIds || [];
      if (!labAssistantIds.includes(userId)) {
        labAssistantIds.push(userId);
        mockLabs[labIndex].labAssistantIds = labAssistantIds;
      }
      
      // Add LabAssistant role to user if they don't have it
      if (!mockUsers[userIndex].roles.includes('LabAssistant')) {
        mockUsers[userIndex].roles.push('LabAssistant');
      }
    }
    
    return mockUsers[userIndex];
  } else {
    try {
      // Call the addUserToLab Lambda function
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const addUserToLabEndpoint = getApiEndpoint('/addUserToLab');
      const response = await fetch(addUserToLabEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, labId, role })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user to lab');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error adding user to lab:', error);
      throw error;
    }
  }
}

/**
 * Remove a user from a lab
 * @param userId User ID to remove from the lab
 * @param labId Lab ID to remove the user from
 * @returns Promise<User>
 */
export async function removeUserFromLab(userId: string, labId: string): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const userIndex = mockUsers.findIndex(u => u.userId === userId);
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const labIndex = mockLabs.findIndex(lab => lab.labId === labId);
    if (labIndex === -1) {
      throw new Error('Lab not found');
    }
    
    // Remove lab from user's labIds
    const userLabIds = mockUsers[userIndex].labIds || [];
    mockUsers[userIndex].labIds = userLabIds.filter(id => id !== labId);
    
    // Remove user from lab's labAssistantIds if they are a lab assistant
    if (mockUsers[userIndex].roles.includes('LabAssistant')) {
      const labAssistantIds = mockLabs[labIndex].labAssistantIds || [];
      mockLabs[labIndex].labAssistantIds = labAssistantIds.filter(id => id !== userId);
    }
    
    return mockUsers[userIndex];
  } else {
    try {
      // Call the removeUserFromLab Lambda function
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      
      if (!token) {
        throw new Error('No authentication token available');
      }
      
      const removeUserFromLabEndpoint = getApiEndpoint('/removeUserFromLab');
      const response = await fetch(removeUserFromLabEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, labId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove user from lab');
      }
      
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error removing user from lab:', error);
      throw error;
    }
  }
} 