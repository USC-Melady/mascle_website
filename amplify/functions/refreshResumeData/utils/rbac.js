/**
 * Check if a user has a specific role
 * @param {string[]} userRoles - The roles of the user
 * @param {string} role - The role to check for
 * @returns {boolean} - True if the user has the role, false otherwise
 */
function hasRole(userRoles, role) {
  return userRoles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 * @param {string[]} userRoles - The roles of the user
 * @param {string[]} roles - The roles to check for
 * @returns {boolean} - True if the user has any of the roles, false otherwise
 */
function hasAnyRole(userRoles, roles) {
  return roles.some(role => userRoles.includes(role));
}

/**
 * Check if a user has all of the specified roles
 * @param {string[]} userRoles - The roles of the user
 * @param {string[]} roles - The roles to check for
 * @returns {boolean} - True if the user has all of the roles, false otherwise
 */
function hasAllRoles(userRoles, roles) {
  return roles.every(role => userRoles.includes(role));
}

/**
 * Check if a user can view the specified job
 * @param {string} userId - The ID of the user
 * @param {string[]} userRoles - The roles of the user
 * @param {any} job - The job to check
 * @returns {boolean} - True if the user can view the job, false otherwise
 */
function canViewJob(userId, userRoles, job) {
  // Admins can view all jobs
  if (hasRole(userRoles, 'Admin')) {
    return true;
  }
  
  // Professors can view their own jobs 
  if (hasRole(userRoles, 'Professor') && job.professorId === userId) {
    return true;
  }
  
  // Lab assistants can view jobs for labs they assist with
  if (hasRole(userRoles, 'LabAssistant') && job.labId) {
    // We assume lab assistants can view all jobs for now
    // In a real implementation, we would check if they're assistants for the specific lab
    return true;
  }
  
  return false;
}

module.exports = {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  canViewJob
}; 