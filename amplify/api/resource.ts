// This file will be imported by backend.ts
// We'll export the functions to be used in the API configuration
import { updateUserStatus } from '../functions/updateUserStatus/resource';
import { updateUserRoles } from '../functions/updateUserRoles/resource';

// Export the functions to be used in backend.ts
export const apiFunctions = {
  updateUserStatus,
  updateUserRoles
}; 