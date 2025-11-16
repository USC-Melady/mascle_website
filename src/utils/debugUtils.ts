import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

/**
 * Debug utility to capture and log authentication information
 * @returns Diagnostic information about the current user and auth session
 */
export const debugAuthStatus = async (): Promise<{
  isAuthenticated: boolean;
  username?: string;
  roles?: string[];
  idToken?: string;
  errorMessage?: string;
}> => {
  try {
    // Try to get session
    const session = await fetchAuthSession();
    const hasTokens = !!session.tokens;
    
    // Extract useful information
    const result: {
      isAuthenticated: boolean;
      username?: string;
      roles?: string[];
      idToken?: string;
      errorMessage?: string;
    } = {
      isAuthenticated: hasTokens
    };
    
    // Get token information
    if (hasTokens && session.tokens?.idToken) {
      // Get token details
      result.idToken = session.tokens.idToken.toString().substring(0, 20) + '...';
      
      // Extract claims
      const claims = session.tokens.idToken.payload;
      
      // Extract relevant information from claims
      if (claims.sub) {
        result.username = claims.sub as string;
      }
      
      // Extract roles from cognito:groups claim
      const cognitoGroups = claims['cognito:groups'];
      if (cognitoGroups) {
        result.roles = Array.isArray(cognitoGroups) 
          ? cognitoGroups.map(group => String(group))
          : [String(cognitoGroups)];
      }
    } else {
      result.errorMessage = 'No tokens available in session';
    }
    
    // Additional info from get current user
    try {
      const user = await getCurrentUser();
      if (user && !result.username) {
        result.username = user.username;
      }
    } catch (userError) {
      if (!result.errorMessage) {
        result.errorMessage = `Error getting current user: ${userError instanceof Error ? userError.message : 'Unknown error'}`;
      }
    }
    
    // Log the result for easier debugging
    console.log('Auth Debug Info:', result);
    
    return result;
  } catch (error) {
    console.error('Error in debugAuthStatus:', error);
    return {
      isAuthenticated: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error getting auth status'
    };
  }
};

/**
 * Debug utility to check if the user has the student role
 * @returns Information about whether the user has the student role
 */
export const debugStudentRoleCheck = async (): Promise<{
  hasStudentRole: boolean;
  roles?: string[];
  username?: string;
  errorMessage?: string;
}> => {
  try {
    const authInfo = await debugAuthStatus();
    
    if (!authInfo.isAuthenticated) {
      return {
        hasStudentRole: false,
        errorMessage: 'User is not authenticated'
      };
    }
    
    const roles = authInfo.roles || [];
    
    return {
      hasStudentRole: roles.includes('Student'),
      roles,
      username: authInfo.username,
      errorMessage: authInfo.errorMessage
    };
  } catch (error) {
    console.error('Error in debugStudentRoleCheck:', error);
    return {
      hasStudentRole: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error checking student role'
    };
  }
};

/**
 * Format debug information for display
 */
export const formatDebugInfo = (info: Record<string, unknown>): string => {
  return Object.entries(info)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${value.join(', ')}`;
      } else if (typeof value === 'object' && value !== null) {
        return `${key}: ${JSON.stringify(value)}`;
      } else {
        return `${key}: ${value}`;
      }
    })
    .join(' | ');
}; 