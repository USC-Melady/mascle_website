/**
 * Role-Based Access Control (RBAC) utility functions
 */

// Define types for our models
export interface User {
  id: string;
  roles?: string[];
  labIds?: string[] | string;
  [key: string]: unknown;
}

export interface Lab {
  id?: string;
  labId?: string;
  professorId?: string;
  professorIds?: string[] | string;
  labAssistantIds?: string[] | string;
  [key: string]: unknown;
}

export interface Job {
  id?: string;
  jobId?: string;
  labId?: string;
  createdBy?: string;
  status?: string;
  lab?: Lab;
  [key: string]: unknown;
}

// Define role hierarchy
export const ROLE_HIERARCHY: Record<string, string[]> = {
  'Admin': ['Professor', 'LabAssistant', 'Student'],
  'Professor': ['LabAssistant', 'Student'],
  'LabAssistant': ['Student'],
  'Student': []
};

// Define permissions for each role on each resource
export const RESOURCE_PERMISSIONS: Record<string, Record<string, string[]>> = {
  'Lab': {
    'Admin': ['create', 'read', 'update', 'delete', 'addUser', 'removeUser'],
    'Professor': ['create', 'read', 'update', 'addUser', 'removeUser'],
    'LabAssistant': ['read'],
    'Student': []
  },
  'User': {
    'Admin': ['create', 'read', 'update', 'delete'],
    'Professor': ['read'],
    'LabAssistant': ['read'],
    'Student': ['read']
  },
  'Job': {
    'Admin': ['create', 'read', 'update', 'delete'],
    'Professor': ['create', 'read', 'update', 'delete'],
    'LabAssistant': ['create', 'read', 'update', 'delete'],
    'Student': ['read', 'apply']
  }
};

// Helper to normalize array values
export function normalizeArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(',');
  return [];
}

/**
 * Checks if a user has a specific role
 * @param userRoles The roles of the user
 * @param role The role to check for
 * @returns True if the user has the role, false otherwise
 */
export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

/**
 * Checks if a user has any of the specified roles
 * @param userRoles The roles of the user
 * @param roles The roles to check for
 * @returns True if the user has any of the roles, false otherwise
 */
export function hasAnyRole(userRoles: string[], roles: string[]): boolean {
  return roles.some(role => hasRole(userRoles, role));
}

/**
 * Checks if a user has permission to perform an action on a resource
 * @param userRoles The roles of the user
 * @param resource The resource to check permissions for
 * @param action The action to check permissions for
 * @returns True if the user has permission, false otherwise
 */
export function hasPermission(userRoles: string[], resource: string, action: string): boolean {
  return userRoles.some(role => {
    const resourcePermissions = RESOURCE_PERMISSIONS[resource];
    if (!resourcePermissions) return false;
    
    const rolePermissions = resourcePermissions[role];
    if (!rolePermissions) return false;
    
    return rolePermissions.includes(action);
  });
}

/**
 * Checks if a user can manage a specific lab based on their roles and relationship to the lab
 * @param userId The ID of the user attempting to manage the lab
 * @param userRoles The roles of the user
 * @param lab The lab object
 * @returns True if the user can manage the lab, false otherwise
 */
export function canManageLab(userId: string, userRoles: string[], lab: Lab): boolean {
  // Admins can manage all labs
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can only manage their own labs
  if (hasRole(userRoles, 'Professor')) {
    return lab.professorId === userId;
  }
  
  return false;
}

/**
 * Checks if a user can view a specific lab based on their roles and relationship to the lab
 * @param userId The ID of the user attempting to view the lab
 * @param userRoles The roles of the user
 * @param lab The lab object
 * @returns True if the user can view the lab, false otherwise
 */
export function canViewLab(userId: string, userRoles: string[], lab: Lab): boolean {
  // Admins can view all labs
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can view labs they own
  if (hasRole(userRoles, 'Professor') && lab.professorId === userId) {
    return true;
  }
  
  // Lab assistants can view labs they assist
  if (hasRole(userRoles, 'LabAssistant')) {
    const labAssistantIds = Array.isArray(lab.labAssistantIds) 
      ? lab.labAssistantIds 
      : (typeof lab.labAssistantIds === 'string' ? lab.labAssistantIds.split(',') : []);
    
    return labAssistantIds.includes(userId);
  }
  
  return false;
}

/**
 * Checks if a user can add another user to a lab
 * @param userId The ID of the user attempting to add another user
 * @param userRoles The roles of the user
 * @param lab The lab object
 * @param roleToAdd The role to add the user as
 * @returns True if the user can add the user to the lab, false otherwise
 */
export function canAddUserToLab(userId: string, userRoles: string[], lab: Lab, roleToAdd: string | null): boolean {
  // Admins can add any user to any lab
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can only add users to their own labs
  if (hasRole(userRoles, 'Professor')) {
    if (lab.professorId !== userId) {
      return false;
    }
    
    // Professors can only add lab assistants and students
    return !roleToAdd || ['LabAssistant', 'Student'].includes(roleToAdd);
  }
  
  return false;
}

/**
 * Checks if a user can remove another user from a lab
 * @param userId The ID of the user attempting to remove another user
 * @param userRoles The roles of the user
 * @param lab The lab object
 * @param roleToRemove The role of the user to remove
 * @returns True if the user can remove the user from the lab, false otherwise
 */
export function canRemoveUserFromLab(userId: string, userRoles: string[], lab: Lab, roleToRemove: string | null): boolean {
  // Admins can remove any user from any lab
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can only remove users from their own labs
  if (hasRole(userRoles, 'Professor')) {
    // Check if the user is the primary professor of the lab
    const isPrimaryProfessor = lab.professorId === userId;
    
    // Check if the user is in the professorIds array
    const professorIds = normalizeArray(lab.professorIds);
    const isAssociatedProfessor = professorIds.includes(userId);
    
    // If they're neither the primary professor nor in the professorIds array, they can't remove users
    if (!isPrimaryProfessor && !isAssociatedProfessor) {
      return false;
    }
    
    // Professors can only remove lab assistants and students
    return !roleToRemove || ['LabAssistant', 'Student'].includes(roleToRemove);
  }
  
  return false;
}

/**
 * Checks if a user can view a specific job based on their roles and relationship to the job
 * @param userId The ID of the user attempting to view the job
 * @param userRoles The roles of the user
 * @param job The job object
 * @returns True if the user can view the job, false otherwise
 */
export function canViewJob(userId: string, userRoles: string[], job: Job): boolean {
  // Log the job data for debugging
  console.log(`canViewJob check for user ${userId} with roles [${userRoles.join(', ')}] on job ${job.id || job.jobId}`);
  
  // Admins can view all jobs - unconditional access
  if (hasRole(userRoles, 'Admin')) {
    console.log(`User ${userId} is an Admin - allowing access to job ${job.id || job.jobId}`);
    return true;
  }
  
  // Job creators can view their own jobs
  if (job.createdBy === userId) {
    console.log(`User ${userId} created job ${job.id || job.jobId} - allowing access`);
    return true;
  }
  
  // Professors can view jobs in their labs
  if (hasRole(userRoles, 'Professor')) {
    // If the professor is directly associated with this job
    if (job.professorId === userId) {
      console.log(`User ${userId} is the professor assigned to job ${job.id || job.jobId} - allowing access`);
      return true;
    }
    
    // If we have the lab information directly
    if (job.lab) {
      // Check if professor is the primary professor of the lab
      if (job.lab.professorId === userId) {
        console.log(`User ${userId} is the primary professor of lab ${job.lab.id || job.lab.labId} - allowing access to job ${job.id || job.jobId}`);
        return true;
      }
      
      // Check if professor is in the professorIds array
      const professorIds = normalizeArray(job.lab.professorIds);
      if (professorIds.includes(userId)) {
        console.log(`User ${userId} is in the professorIds array of lab ${job.lab.id || job.lab.labId} - allowing access to job ${job.id || job.jobId}`);
        return true;
      }
      
      // If we have lab info but the professor isn't associated, deny access
      console.log(`User ${userId} is a professor but not associated with lab ${job.lab.id || job.lab.labId} - denying access to job ${job.id || job.jobId}`);
      return false;
    }
    
    // If we don't have lab info, we can't determine, so default to false 
    console.log(`No lab info available for job ${job.id || job.jobId}, professor ${userId} denied access`);
    return false;
  }
  
  // Lab assistants can view jobs in labs they assist
  if (hasRole(userRoles, 'LabAssistant')) {
    // If we have the lab information
    if (job.lab) {
      const labAssistantIds = normalizeArray(job.lab.labAssistantIds);
      if (labAssistantIds.includes(userId)) {
        console.log(`User ${userId} is a lab assistant for lab ${job.lab.id || job.lab.labId} - allowing access to job ${job.id || job.jobId}`);
        return true;
      }
      
      console.log(`User ${userId} is a lab assistant but not for lab ${job.lab.id || job.lab.labId} - denying access to job ${job.id || job.jobId}`);
      return false;
    }
    
    // If we don't have lab info, we can't determine, so default to false
    console.log(`No lab info available for job ${job.id || job.jobId}, lab assistant ${userId} denied access`);
    return false;
  }
  
  // Students can view all jobs (they'll apply to ones they're interested in)
  if (hasRole(userRoles, 'Student')) {
    console.log(`User ${userId} is a student - allowing access to job ${job.id || job.jobId}`);
    return true;
  }
  
  console.log(`User ${userId} with roles [${userRoles.join(', ')}] does not have permission to view job ${job.id || job.jobId}`);
  return false;
}

/**
 * Checks if a user can create a job for a specific lab
 * @param userId The ID of the user attempting to create the job
 * @param userRoles The roles of the user
 * @param labId The ID of the lab for which the job is being created
 * @param lab Optional lab object if available
 * @returns True if the user can create a job for the lab, false otherwise
 */
export function canCreateJob(userId: string, userRoles: string[], labId: string, lab?: Lab): boolean {
  // Admins can create jobs for any lab
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can create jobs for their own labs
  if (hasRole(userRoles, 'Professor')) {
    // If we have the lab object, check if the user is the professor
    if (lab) {
      return lab.professorId === userId;
    }
    
    // Otherwise, we'll need to check if this lab belongs to the professor
    // This would typically require a separate database lookup
    // For now, we'll return true and assume the check happens elsewhere
    return true;
  }
  
  // Lab assistants can create jobs for labs they assist
  if (hasRole(userRoles, 'LabAssistant')) {
    // If we have the lab object, check if the user is a lab assistant
    if (lab) {
      const labAssistantIds = Array.isArray(lab.labAssistantIds) 
        ? lab.labAssistantIds 
        : (typeof lab.labAssistantIds === 'string' ? lab.labAssistantIds.split(',') : []);
      
      return labAssistantIds.includes(userId);
    }
    
    // Otherwise, we'll need to check if this user is a lab assistant for this lab
    // This would typically require a separate database lookup
    // For now, we'll return true and assume the check happens elsewhere
    return true;
  }
  
  return false;
}

/**
 * Checks if a user can update or delete a specific job
 * @param userId The ID of the user attempting to update/delete the job
 * @param userRoles The roles of the user
 * @param job The job object
 * @param lab Optional lab object if available
 * @returns True if the user can update/delete the job, false otherwise
 */
export function canManageJob(userId: string, userRoles: string[], job: Job, lab?: Lab): boolean {
  // Admins can manage any job
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Job creators can manage their own jobs
  if (job.createdBy === userId) {
    return true;
  }
  
  // Professors can manage jobs in their labs
  if (hasRole(userRoles, 'Professor')) {
    // If the professor is directly associated with this job
    if (job.professorId === userId) {
      return true;
    }
    
    // If we have the lab object directly
    if (lab) {
      // Check if professor is the primary professor of the lab
      if (lab.professorId === userId) {
        return true;
      }
      
      // Check if professor is in the professorIds array
      const professorIds = normalizeArray(lab.professorIds);
      if (professorIds.includes(userId)) {
        return true;
      }
      
      // If we have lab info but professor isn't associated, deny access
      return false;
    }
    
    // If we have lab info from the job object
    if (job.lab) {
      // Check if professor is the primary professor of the lab
      if (job.lab.professorId === userId) {
        return true;
      }
      
      // Check if professor is in the professorIds array
      const professorIds = normalizeArray(job.lab.professorIds);
      if (professorIds.includes(userId)) {
        return true;
      }
      
      // If we have lab info but professor isn't associated, deny access
      return false;
    }
    
    // If we don't have lab info, we can't determine, so default to false
    console.log(`No lab info available for job ${job.id}, professor ${userId} denied management access`);
    return false;
  }
  
  // Lab assistants can manage jobs in labs they assist
  if (hasRole(userRoles, 'LabAssistant')) {
    // Lab assistants can always manage jobs they created
    if (job.createdBy === userId) {
      return true;
    }
    
    // If we have the lab object directly
    if (lab) {
      const labAssistantIds = normalizeArray(lab.labAssistantIds);
      return labAssistantIds.includes(userId);
    }
    
    // If we have lab info from the job object
    if (job.lab) {
      const labAssistantIds = normalizeArray(job.lab.labAssistantIds);
      return labAssistantIds.includes(userId);
    }
    
    // If we don't have lab info, we can't determine, so default to false
    console.log(`No lab info available for job ${job.id}, lab assistant ${userId} denied management access`);
    return false;
  }
  
  return false;
}

/**
 * Checks if a student can apply to a job
 * @param userId The ID of the student
 * @param userRoles The roles of the user
 * @param job The job object
 * @returns True if the student can apply to the job, false otherwise
 */
export function canApplyToJob(userId: string, userRoles: string[], job: Job): boolean {
  // Only students can apply to jobs
  if (!hasRole(userRoles, 'Student')) {
    return false;
  }
  
  // Check if the job is open for applications
  // Normalize status to uppercase for case-insensitive comparison
  const jobStatus = (job.status || '').toUpperCase();
  if (jobStatus !== 'OPEN') {
    return false;
  }
  
  // Additional business rules could be added here
  // For example, checking if the student has already applied
  
  return true;
}

/**
 * Check if a user can modify a specific lab based on their role and relation to the lab
 * @param userId The user's ID
 * @param userRoles Array of user roles
 * @param lab The lab object
 * @returns boolean
 */
export function canModifyLab(userId: string, userRoles: string[], lab: any): boolean {
  // Admins can modify all labs
  if (userRoles.includes('Admin')) {
    return true;
  }
  
  // Professors can only modify labs they're assigned to
  if (userRoles.includes('Professor')) {
    // Check if the user is the primary professor or in the professorIds array
    if (lab.professorId === userId) {
      return true;
    }
    
    // Check if the user is in the professorIds array
    if (lab.professorIds && Array.isArray(lab.professorIds) && lab.professorIds.includes(userId)) {
      return true;
    }
  }
  
  // Lab assistants cannot modify labs (only view them)
  
  return false;
} 