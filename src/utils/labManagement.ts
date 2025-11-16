import { generateClient } from 'aws-amplify/api';
import { Schema } from '../../amplify/data/resource';
import { fetchAuthSession } from 'aws-amplify/auth';
import { v4 as uuidv4 } from 'uuid';
import { getApiEndpoint } from './userManagement';

// Generate the GraphQL client
let client: ReturnType<typeof generateClient<Schema>> | null;
try {
  client = generateClient<Schema>();
  console.log('Amplify client initialized successfully for lab management');
} catch (error) {
  console.error('Error initializing Amplify client:', error);
  client = null;
}

// Lab interface
export interface Lab {
  id?: string;
  labId: string;
  name: string;
  description?: string;
  professorId: string;
  professorIds?: string[];
  labAssistantIds?: string[];
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  // Additional fields for UI display
  professors?: {
    userId: string;
    email: string;
  }[];
  assistants?: {
    userId: string;
    email: string;
  }[];
  students?: {
    userId: string;
    email: string;
  }[];
}

/**
 * Check if the Amplify client is properly initialized
 */
const isAmplifyReady = (): boolean => {
  return !!(client && client.models && client.models.Lab && client.models.Lab.list);
};

/**
 * Get labs that the current user is associated with (as professor or lab assistant)
 */
export const getUserLabs = async (): Promise<Lab[]> => {
  try {
    // Get current user ID
    const session = await fetchAuthSession();
    const currentUserId = session.tokens?.idToken?.payload?.sub as string;
    
    if (!currentUserId) {
      console.error('No user ID available');
      return [];
    }
    
    // Get all labs
    const allLabs = await getLabs();
    
    // Filter labs where current user is professor or lab assistant
    const userLabs = allLabs.filter(lab => {
      const isProfessor = lab.professorId === currentUserId || 
                         (lab.professorIds && lab.professorIds.includes(currentUserId));
      const isLabAssistant = lab.labAssistantIds && lab.labAssistantIds.includes(currentUserId);
      
      return isProfessor || isLabAssistant;
    });
    
    console.log(`User ${currentUserId} is associated with ${userLabs.length} labs:`, userLabs.map(lab => lab.name));
    return userLabs;
  } catch (error) {
    console.error('Error getting user labs:', error);
    return [];
  }
};

/**
 * Get all labs
 */
export const getLabs = async (): Promise<Lab[]> => {
  try {
    console.log('Fetching labs');
    
    // Try GraphQL API first (if available)
    if (isAmplifyReady() && client) {
      console.log('Using GraphQL API to fetch labs');
      const response = await client.models.Lab.list();
      console.log('Labs response:', response);
      
      if (response.data && response.data.length > 0) {
        return response.data.map((lab) => ({
          labId: lab.labId,
          name: lab.name,
          professorId: lab.professorId,
          professorIds: lab.professorIds?.filter((id): id is string => id !== null) ?? undefined,
          labAssistantIds: lab.labAssistantIds?.filter((id): id is string => id !== null) ?? undefined,
          description: lab.description ?? undefined,
          status: lab.status ?? undefined,
          createdAt: lab.createdAt ?? undefined,
          updatedAt: lab.updatedAt ?? undefined
        }));
      }
    }
    
    // Fall back to REST API
    console.log('Using REST API to fetch labs');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const labsEndpoint = getApiEndpoint('/labs');
    console.log('Labs API URL:', labsEndpoint);
    
    const response = await fetch(labsEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch labs from database');
    }
    
    const data = await response.json();
    console.log('API response data:', data);
    
    return data.labs || [];
  } catch (error) {
    console.error('Error fetching labs:', error);
    throw error;
  }
};

/**
 * Get a lab by ID
 */
export const getLabById = async (labId: string): Promise<Lab | null> => {
  try {
    console.log(`Fetching lab with ID: ${labId}`);
    
    // Try GraphQL API first
    if (isAmplifyReady() && client) {
      console.log('Using GraphQL API to fetch lab');
      const response = await client.models.Lab.get({
        id: labId
      });
      
      if (response.data) {
        return {
          labId: response.data.labId,
          name: response.data.name,
          professorId: response.data.professorId,
          professorIds: response.data.professorIds?.filter((id): id is string => id !== null) ?? undefined,
          labAssistantIds: response.data.labAssistantIds?.filter((id): id is string => id !== null) ?? undefined,
          description: response.data.description ?? undefined,
          status: response.data.status ?? undefined,
          createdAt: response.data.createdAt ?? undefined,
          updatedAt: response.data.updatedAt ?? undefined
        };
      }
    }
    
    // Fall back to fetching all labs and filtering
    const allLabs = await getLabs();
    return allLabs.find(lab => lab.labId === labId) || null;
  } catch (error) {
    console.error(`Error fetching lab with ID ${labId}:`, error);
    throw error;
  }
};

/**
 * Create a new lab
 */
export const createLab = async (labData: Omit<Lab, 'labId' | 'createdAt' | 'updatedAt'>): Promise<Lab | null> => {
  try {
    console.log('Creating new lab:', labData);
    
    // Generate a unique ID for the lab
    const labId = uuidv4();
    
    // Try GraphQL API first
    if (isAmplifyReady() && client) {
      console.log('Using GraphQL API to create lab');
      const response = await client.models.Lab.create({
        labId,
        name: labData.name,
        professorId: labData.professorId,
        professorIds: labData.professorIds || [labData.professorId],
        labAssistantIds: labData.labAssistantIds || [],
        description: labData.description || '',
        status: labData.status || 'ACTIVE'
      });
      
      if (response.data) {
        return {
          labId: response.data.labId,
          name: response.data.name,
          professorId: response.data.professorId,
          professorIds: response.data.professorIds?.filter((id): id is string => id !== null) ?? undefined,
          labAssistantIds: response.data.labAssistantIds?.filter((id): id is string => id !== null) ?? undefined,
          description: response.data.description ?? undefined,
          status: response.data.status ?? undefined,
          createdAt: response.data.createdAt ?? undefined,
          updatedAt: response.data.updatedAt ?? undefined
        };
      }
    }
    
    // Fall back to REST API
    console.log('Using REST API to create lab');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const createLabEndpoint = getApiEndpoint('/labs/create');
    console.log('Create lab API URL:', createLabEndpoint);
    
    const response = await fetch(createLabEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: labData.name,
        professorIds: labData.professorIds || [labData.professorId],
        labAssistantIds: labData.labAssistantIds || [],
        description: labData.description || '',
        status: labData.status || 'ACTIVE'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create lab');
    }
    
    const data = await response.json();
    return data.lab;
  } catch (error) {
    console.error('Error creating lab:', error);
    throw error;
  }
};

/**
 * Update an existing lab
 */
export const updateLab = async (labId: string, labData: Partial<Lab>): Promise<Lab | null> => {
  try {
    console.log(`Updating lab with ID: ${labId}`, labData);
    
    // Try GraphQL API first
    if (isAmplifyReady() && client) {
      console.log('Using GraphQL API to update lab');
      const response = await client.models.Lab.update({
        id: labId,
        ...labData
      });
      
      if (response.data) {
        return {
          labId: response.data.labId,
          name: response.data.name,
          professorId: response.data.professorId,
          professorIds: response.data.professorIds?.filter((id): id is string => id !== null) ?? undefined,
          labAssistantIds: response.data.labAssistantIds?.filter((id): id is string => id !== null) ?? undefined,
          description: response.data.description ?? undefined,
          status: response.data.status ?? undefined,
          createdAt: response.data.createdAt ?? undefined,
          updatedAt: response.data.updatedAt ?? undefined
        };
      }
    }
    
    // Fall back to REST API
    console.log('Using REST API to update lab');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const updateLabEndpoint = getApiEndpoint('/labs/update');
    console.log('Update lab API URL:', updateLabEndpoint);
    
    const response = await fetch(updateLabEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        labId,
        ...labData
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update lab');
    }
    
    const data = await response.json();
    return data.lab;
  } catch (error) {
    console.error(`Error updating lab with ID ${labId}:`, error);
    throw error;
  }
};

/**
 * Delete a lab
 */
export const deleteLab = async (labId: string): Promise<boolean> => {
  try {
    console.log(`Deleting lab with ID: ${labId}`);
    
    // Try GraphQL API first
    if (isAmplifyReady() && client) {
      console.log('Using GraphQL API to delete lab');
      await client.models.Lab.delete({
        id: labId
      });
      return true;
    }
    
    // Fall back to REST API
    console.log('Using REST API to delete lab');
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const deleteLabEndpoint = getApiEndpoint('/labs/delete');
    console.log('Delete lab API URL:', deleteLabEndpoint);
    
    const response = await fetch(`${deleteLabEndpoint}?labId=${labId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete lab');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting lab with ID ${labId}:`, error);
    throw error;
  }
};

/**
 * Add a user to a lab
 */
export const addUserToLab = async (userId: string, labId: string, role?: string): Promise<boolean> => {
  try {
    console.log(`Adding user ${userId} to lab ${labId} with role ${role || 'default'}`);
    
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const addUserToLabEndpoint = getApiEndpoint('/addUserToLab');
    console.log('Add user to lab API URL:', addUserToLabEndpoint);
    
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
    
    return true;
  } catch (error) {
    console.error('Error adding user to lab:', error);
    throw error;
  }
};

/**
 * Remove a user from a lab
 */
export const removeUserFromLab = async (userId: string, labId: string): Promise<boolean> => {
  try {
    console.log(`Removing user ${userId} from lab ${labId}`);
    
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();
    
    if (!token) {
      throw new Error('No authentication token available');
    }
    
    const removeUserFromLabEndpoint = getApiEndpoint('/removeUserFromLab');
    console.log('Remove user from lab API URL:', removeUserFromLabEndpoint);
    
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
    
    return true;
  } catch (error) {
    console.error('Error removing user from lab:', error);
    throw error;
  }
}; 