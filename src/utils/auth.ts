import { fetchAuthSession, getCurrentUser, signIn, signOut, fetchUserAttributes, signUp, confirmSignUp, confirmSignIn, FetchUserAttributesOutput } from 'aws-amplify/auth';

// Development mode flag - FORCE PRODUCTION MODE for testing with real Cognito
const DEVELOPMENT_MODE = false; // Changed from process.env.NODE_ENV === 'development'

// User interface
export interface User {
  username: string;
  roles: string[];
  isAuthenticated: boolean;
  attributes?: Record<string, string | number | boolean | null>;
  requiresNewPassword?: boolean;
  nextStep?: {
    signInStep: string;
    [key: string]: unknown;
  };
}

// Mock users for development
const mockUsers = [
  { 
    username: 'admin@example.com', 
    password: 'Password123!', 
    roles: ['Admin'],
    attributes: {
      email: 'admin@example.com',
      'custom:department': 'Administration'
    }
  },
  { 
    username: 'professor@example.com', 
    password: 'Password123!', 
    roles: ['Professor'],
    attributes: {
      email: 'professor@example.com',
      'custom:department': 'Computer Science'
    }
  },
  { 
    username: 'labassistant@example.com', 
    password: 'Password123!', 
    roles: ['LabAssistant'],
    attributes: {
      email: 'labassistant@example.com',
      'custom:department': 'Computer Science'
    }
  },
  { 
    username: 'student@example.com', 
    password: 'Password123!', 
    roles: ['Student'],
    attributes: {
      email: 'student@example.com'
    }
  },
  { 
    username: 'dual@example.com', 
    password: 'Password123!', 
    roles: ['Student', 'LabAssistant'],
    attributes: {
      email: 'dual@example.com',
      'custom:department': 'Computer Science'
    }
  }
];

// Current user session for mock mode
let currentMockUser: User | null = null;

function cleanAttributes<T extends Record<string, unknown>>(attributes: T): Record<string, string | number | boolean | null> {
  const cleaned: Record<string, string | number | boolean | null> = {};
  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key) && attributes[key] !== undefined) {
      cleaned[key] = attributes[key] as string | number | boolean | null;
    }
  }
  return cleaned;
}

function formatCognitoAttributes(attributes: FetchUserAttributesOutput): Record<string, string | number | boolean | null> {
    const result: Record<string, string | number | boolean | null> = {};
    Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined) {
            result[key] = value;
        }
    });
    return result;
}

/**
 * Sign in a user
 * @param username Email address
 * @param password Password
 * @returns Promise resolving to the signed-in user
 */
export async function authenticateUser(username: string, password: string): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock authentication for development
    const mockUser = mockUsers.find(u => u.username === username && u.password === password);
    
    if (!mockUser) {
      throw new Error('Invalid username or password');
    }
    
    const user: User = {
      username: mockUser.username,
      roles: mockUser.roles,
      isAuthenticated: true,
      attributes: cleanAttributes(mockUser.attributes)
    };
    currentMockUser = user;
    
    // Store in localStorage to persist across page refreshes
    localStorage.setItem('mockUser', JSON.stringify(currentMockUser));
    
    return user;
    
  } else {
    // Real authentication for production
    try {
      const { isSignedIn, nextStep } = await signIn({ username, password });
      
      if (nextStep && nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        // Return a special object indicating that a new password is required
        return {
          username,
          roles: [],
          isAuthenticated: false,
          requiresNewPassword: true,
          nextStep
        } as any; // Using 'any' to add the custom properties
      }
      
      if (nextStep && nextStep.signInStep !== 'DONE') {
        throw new Error(`Authentication requires additional steps: ${nextStep.signInStep}`);
      }
      
      if (!isSignedIn) {
        throw new Error('Authentication failed');
      }
      
      // Get user attributes and session
      const userAttributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const currentUser = await getCurrentUser();
      
      // Extract roles from Cognito groups
      const cognitoGroups = session.tokens?.idToken?.payload['cognito:groups'];
      const roles: string[] = Array.isArray(cognitoGroups) 
        ? cognitoGroups.map(group => String(group))
        : (cognitoGroups ? [String(cognitoGroups)] : []);
      
      // Also check for custom:roles attribute
      if (userAttributes['custom:roles']) {
        try {
          const customRoles = JSON.parse(userAttributes['custom:roles'] as string);
          if (Array.isArray(customRoles)) {
            roles.push(...customRoles);
          }
        } catch (e) {
          console.warn('Failed to parse custom:roles attribute', e);
        }
      }
      
      return {
        username: currentUser.username,
        roles: [...new Set(roles)], // Remove duplicates
        isAuthenticated: true,
        attributes: formatCognitoAttributes(userAttributes)
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(error instanceof Error ? error.message : 'Authentication failed');
    }
  }
}

/**
 * Complete new password challenge for a user
 * @param username User's username
 * @param currentPassword Temporary password
 * @param newPassword New permanent password
 * @returns Promise resolving to the signed-in user
 */
export async function completeNewPasswordChallenge(
  username: string,
  currentPassword: string,
  newPassword: string
): Promise<User> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    const mockUser = mockUsers.find(u => u.username === username);
    
    if (!mockUser) {
      throw new Error('User not found');
    }
    
    mockUser.password = newPassword;
    
    const user: User = {
      username: mockUser.username,
      roles: mockUser.roles,
      isAuthenticated: true,
      attributes: cleanAttributes(mockUser.attributes)
    };
    currentMockUser = user;
    
    localStorage.setItem('mockUser', JSON.stringify(currentMockUser));
    
    return user;
  } else {
    try {
      // First sign in to get the challenge
      const { nextStep } = await signIn({ username, password: currentPassword });
      
      if (!nextStep || nextStep.signInStep !== 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw new Error('User is not in new password required state');
      }
      
      // Complete the new password challenge
      const { isSignedIn } = await confirmSignIn({ challengeResponse: newPassword });
      
      if (!isSignedIn) {
        throw new Error('Failed to complete new password challenge');
      }
      
      // Get user info after successful authentication
      const userAttributes = await fetchUserAttributes();
      const session = await fetchAuthSession();
      const currentUser = await getCurrentUser();
      
      // Extract roles from Cognito groups
      const cognitoGroups = session.tokens?.idToken?.payload['cognito:groups'];
      const roles: string[] = Array.isArray(cognitoGroups) 
        ? cognitoGroups.map(group => String(group))
        : (cognitoGroups ? [String(cognitoGroups)] : []);
      
      return {
        username: currentUser.username,
        roles: [...new Set(roles)], // Remove duplicates
        isAuthenticated: true,
        attributes: formatCognitoAttributes(userAttributes)
      };
    } catch (error) {
      console.error('Error completing new password challenge:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to complete new password challenge');
    }
  }
}

/**
 * Sign up a new user
 * @param email User's email
 * @param password User's password
 * @param attributes Additional user attributes
 * @returns Promise resolving when sign-up is complete
 */
export async function registerUser(
  email: string, 
  password: string, 
  attributes: Record<string, string> = {}
): Promise<{ username: string; isConfirmed: boolean; }> {
  if (DEVELOPMENT_MODE) {
    // Mock sign-up
    console.log('[DEV] Mock registration for:', email);
    if (mockUsers.some(u => u.username === email)) {
      throw new Error('User already exists');
    }
    
    // Add to mock users - always assign Student role by default
    const newUser = {
      username: email,
      password,
      roles: ['Student'], // Default role is always Student
      attributes: {
        email,
        'custom:roles': JSON.stringify(['Student']),
        ...attributes
      }
    };
    mockUsers.push(newUser);
    
    console.log('[DEV] Mock user created:', email);
    return { username: email, isConfirmed: true };
  } else {
    // Real sign-up
    try {
      console.log('[PROD] Registering user with email:', email);
      console.log('[PROD] Password length:', password.length);
      console.log('[PROD] Password meets requirements:', 
        /[A-Z]/.test(password) && 
        /[a-z]/.test(password) && 
        /[0-9]/.test(password) && 
        /[^A-Za-z0-9]/.test(password) && 
        password.length >= 8
      );
      
      // Create user attributes object - include required attributes
      // Note: given_name is required based on the Cognito configuration
      const userAttributes: Record<string, string> = {
        email,
        given_name: attributes.given_name || email.split('@')[0] // Use part of email as name if not provided
      };
      
      // Add other standard attributes if they exist
      if (attributes.name) userAttributes.name = attributes.name;
      if (attributes.family_name) userAttributes.family_name = attributes.family_name;
      if (attributes.phone_number) userAttributes.phone_number = attributes.phone_number;
      
      console.log('[PROD] User attributes for registration:', JSON.stringify(userAttributes, null, 2));
      
      // Call Amplify signUp API
      console.log('[PROD] Calling signUp API with username:', email);
      const signUpParams = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...userAttributes
          }
        }
      };
      console.log('[PROD] SignUp params (excluding password):', {
        ...signUpParams,
        password: '********'
      });
      
      const result = await signUp(signUpParams);
      
      console.log('[PROD] Sign up result:', JSON.stringify(result, null, 2));
      
      // Always return the email as username for consistency
      return { 
        username: email, 
        isConfirmed: result.isSignUpComplete || false
      };
    } catch (error) {
      console.error('[PROD] Registration error:', error);
      if (error instanceof Error) {
        console.error('[PROD] Error message:', error.message);
        console.error('[PROD] Error stack:', error.stack);
        
        if (error.message.includes('User already exists')) {
          throw new Error('An account with this email already exists. Please try logging in or use a different email.');
        }
      }
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  }
}

/**
 * Confirm a user's sign-up with verification code
 * @param username User's email
 * @param code Verification code
 * @returns Promise resolving when confirmation is complete
 */
export async function confirmRegistration(username: string, code: string): Promise<void> {
  if (DEVELOPMENT_MODE) {
    // Mock confirmation - nothing to do in dev mode
    console.log('[DEV] Mock confirmation for user:', username, 'with code:', code);
    return;
  } else {
    // Real confirmation
    try {
      console.log('[PROD] Confirming user:', username, 'with code:', code);
      
      const confirmParams = {
        username,
        confirmationCode: code
      };
      console.log('[PROD] Confirmation params:', confirmParams);
      
      const result = await confirmSignUp(confirmParams);
      
      console.log('[PROD] Confirmation result:', JSON.stringify(result, null, 2));
      
      if (!result.isSignUpComplete) {
        throw new Error('Confirmation failed. Please try again with a valid code.');
      }
    } catch (error) {
      console.error('[PROD] Confirmation error:', error);
      if (error instanceof Error) {
        console.error('[PROD] Error message:', error.message);
        console.error('[PROD] Error stack:', error.stack);
      }
      throw new Error(error instanceof Error ? error.message : 'Confirmation failed');
    }
  }
}

/**
 * Sign out the current user
 * @returns Promise resolving when sign-out is complete
 */
export async function signOutUser(): Promise<void> {
  if (DEVELOPMENT_MODE) {
    // Mock sign-out
    currentMockUser = null;
    localStorage.removeItem('mockUser');
    console.log('[DEV] Mock user signed out');
  } else {
    // Real sign-out
    try {
      await signOut();
      
      // Clear any cached authentication data
      localStorage.removeItem('amplify-auto-sign-in');
      sessionStorage.clear();
      
      // Clear any application-specific cached data
      localStorage.removeItem('mockUser');
      localStorage.removeItem('resumeData');
      localStorage.removeItem('userProfile');
      
      console.log('User successfully signed out and all cached data cleared');
    } catch (error) {
      console.error('Error signing out:', error);
      
      // Even if signOut fails, clear local data
      localStorage.removeItem('amplify-auto-sign-in');
      sessionStorage.clear();
      localStorage.removeItem('mockUser');
      localStorage.removeItem('resumeData');
      localStorage.removeItem('userProfile');
      
      throw error;
    }
  }
}

/**
 * Get the currently authenticated user
 * @returns Promise resolving to the current user or null if not authenticated
 */
export async function getAuthenticatedUser(): Promise<User | null> {
  if (DEVELOPMENT_MODE) {
    // Mock implementation for development
    try {
      // Try to get mock user from localStorage
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        currentMockUser = JSON.parse(storedUser);
      }
      
      return currentMockUser;
    } catch (error) {
      console.error('Error getting mock user:', error);
      return null;
    }
  } else {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      
      // If no session, user is not authenticated
      if (!session.tokens) {
        return null;
      }
      
      const userAttributes = await fetchUserAttributes();
      
      // Extract roles from Cognito groups
      const cognitoGroups = session.tokens.idToken?.payload['cognito:groups'];
      const roles: string[] = Array.isArray(cognitoGroups) 
        ? cognitoGroups.map(group => String(group))
        : (cognitoGroups ? [String(cognitoGroups)] : []);

      if (userAttributes['custom:roles']) {
        try {
          const customRoles = JSON.parse(userAttributes['custom:roles'] as string) as string[];
          roles.push(...customRoles);
        } catch {
          //
        }
      }
      
      return {
        username: currentUser.username,
        roles: [...new Set(roles)], // Remove duplicates
        isAuthenticated: true,
        attributes: formatCognitoAttributes(userAttributes)
      };
    } catch {
      // Not an error, just means user is not logged in
      return null;
    }
  }
}

/**
 * Check if the current user has a specific role
 * @param role The role to check
 * @returns Promise resolving to boolean indicating if the user has the role
 */
export async function hasRole(role: string): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user !== null && user.roles.includes(role);
}

/**
 * Check if the user is authenticated
 * @returns Promise resolving to boolean indicating if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getAuthenticatedUser();
  return user !== null;
}

/**
 * Get all roles for the current user
 * @returns Promise resolving to array of roles or empty array if not authenticated
 */
export async function getUserRoles(): Promise<string[]> {
  try {
    const session = await fetchAuthSession();
    const cognitoGroups = session.tokens?.idToken?.payload['cognito:groups'];
    const roles: string[] = [];

    if (Array.isArray(cognitoGroups)) {
      roles.push(...cognitoGroups.map(group => String(group)));
    } else if (cognitoGroups) {
      roles.push(String(cognitoGroups));
    }

    // Also check custom:roles attribute
    const userAttributes = await fetchUserAttributes();
    if (userAttributes['custom:roles']) {
      try {
        const customRoles = JSON.parse(userAttributes['custom:roles'] as string);
        if (Array.isArray(customRoles)) {
          roles.push(...customRoles);
        }
      } catch {
        console.warn('Failed to parse custom:roles attribute');
      }
    }
    
    return [...new Set(roles)];
  } catch {
    return []; // Not signed in
  }
}

/**
 * Check if the current user has the required role
 * @param requiredRoles Array of roles that are allowed to access the resource
 * @returns Promise<boolean>
 */
export async function hasRequiredRole(requiredRoles: string[]): Promise<boolean> {
  try {
    // Get the current authenticated user's session
    const session = await fetchAuthSession();
    
    if (!session.tokens) {
      console.log('No session tokens available');
      return false;
    }

    // Get groups from the access token
    const groups: string[] = (session.tokens.accessToken.payload['cognito:groups'] as string[]) || [];
    console.log('User groups:', groups);

    // Check if user has any of the required roles
    return requiredRoles.some(role => groups.includes(role));
  } catch {
    console.error('Error checking user roles:');
    return false;
  }
}

/**
 * Check if user can perform an action on a resource
 * @param resource The resource type (e.g., 'Lab', 'User')
 * @param action The action to perform ('create', 'read', 'update', 'delete')
 * @returns Promise<boolean>
 */
export async function canPerformAction(resource: string, action: 'create' | 'read' | 'update' | 'delete'): Promise<boolean> {
  // Define permission matrix
  const permissionMatrix: Record<string, Record<string, string[]>> = {
    Lab: {
      create: ['Admin'],
      read: ['Admin', 'Professor', 'LabAssistant', 'Student'],
      update: ['Admin', 'Professor', 'LabAssistant'],
      delete: ['Admin', 'Professor', 'LabAssistant']
    },
    User: {
      create: ['Admin'],
      read: ['Admin', 'Professor', 'LabAssistant'],
      update: ['Admin', 'Professor'],
      delete: ['Admin']
    }
    // Add other resources as needed
  };

  // Get required roles for this action on this resource
  const requiredRoles = permissionMatrix[resource]?.[action] || [];
  if (requiredRoles.length === 0) {
    console.warn(`No permissions defined for ${action} on ${resource}`);
    return false;
  }

  return hasRequiredRole(requiredRoles);
}

/**
 * Inspect the current session tokens
 * @returns Promise<void>
 */
export async function inspectTokens(): Promise<void> {
  try {
    const session = await fetchAuthSession();
    console.log('ID Token:', session.tokens?.idToken?.toString());
    console.log('Access Token:', session.tokens?.accessToken.toString());
    
    if (session.tokens?.idToken) {
      const idTokenPayload = session.tokens.idToken.payload;
      console.log('ID Token Payload:', idTokenPayload);
      console.log('Cognito Groups:', idTokenPayload['cognito:groups']);
      console.log('Username:', idTokenPayload['cognito:username']);
      console.log('Custom Roles:', idTokenPayload['custom:roles']);
    }
  } catch {
    console.error('Error inspecting tokens:');
  }
}

// Example usage in a component:
// async function fetchLabData(labId: string) {
//   if (await canPerformAction('Lab', 'read')) {
//     // Fetch and display lab data
//   } else {
//     // Show access denied message
//   }
// } 