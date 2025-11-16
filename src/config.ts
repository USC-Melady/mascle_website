// Configuration constants
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.dev.mascle.app';

export const API_ENDPOINTS = {
  GET_USERS: `${API_BASE_URL}/users`,
  CREATE_USER: `${API_BASE_URL}/createUser`,
  GET_LABS: `${API_BASE_URL}/labs`,
  CREATE_LAB: `${API_BASE_URL}/labs/create`,
  UPDATE_LAB: `${API_BASE_URL}/labs/update`,
  DELETE_LAB: `${API_BASE_URL}/labs/delete`,
  ADD_USER_TO_LAB: `${API_BASE_URL}/addUserToLab`,
  REMOVE_USER_FROM_LAB: `${API_BASE_URL}/removeUserFromLab`,
  GET_JOBS: `${API_BASE_URL}/jobs`,
  CREATE_JOB: `${API_BASE_URL}/jobs`,
  UPDATE_JOB: `${API_BASE_URL}/jobs/{jobId}`,
  DELETE_JOB: `${API_BASE_URL}/jobs/{jobId}`,
  APPLY_TO_JOB: `${API_BASE_URL}/jobs/{jobId}/apply`,
  GET_JOB_APPLICATIONS: `${API_BASE_URL}/jobs/{jobId}/applications`,
  UPDATE_USER_STATUS: `${API_BASE_URL}/updateUserStatus`,
  UPDATE_USER_ROLES: `${API_BASE_URL}/updateUserRoles`,
  RESUME_UPLOAD: `${API_BASE_URL}/uploadResume`,
  UPDATE_USER_RESUME: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/updateUserResume',
  REFRESH_RESUME_DATA: `${API_BASE_URL}/refreshResumeData`,
  PUBLIC_JOBS: `${API_BASE_URL}/public-jobs`,
  UPLOAD_RESUME: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/uploadResume',
  GET_RESUME_URL: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/getResumeUrl',
  UPDATE_APPLICATION_STATUS: 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev/updateApplicationStatus'
};

// Other configuration settings
export const APP_CONFIG = {
  // App-wide settings
  APP_NAME: 'MASCLE',
  VERSION: '1.0.0',
  
  // Features toggles
  FEATURES: {
    ENABLE_RESUME_UPLOAD: true,
    ENABLE_FILE_PREVIEW: true,
    ENABLE_RESUME_REFRESH: true
  }
}; 