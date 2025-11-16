import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { 
  CognitoIdentityProviderClient, 
  AdminAddUserToGroupCommand,
  ListGroupsCommand,
  CreateGroupCommand
} from '@aws-sdk/client-cognito-identity-provider';
import type { 
  PostConfirmationTriggerEvent, 
  UserMigrationTriggerEvent, 
  CustomMessageTriggerEvent,
  PreSignUpTriggerEvent,
  PostAuthenticationTriggerEvent
} from 'aws-lambda';

// Initialize DynamoDB client
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({});

// Define a union type for Cognito trigger events
type CognitoTriggerEvent = 
  | PostConfirmationTriggerEvent 
  | UserMigrationTriggerEvent 
  | CustomMessageTriggerEvent
  | PreSignUpTriggerEvent
  | PostAuthenticationTriggerEvent;

export const handler = async (event: CognitoTriggerEvent) => {
  console.log('Cognito Lambda trigger event:', JSON.stringify(event, null, 2));
  
  // Determine the trigger source
  const triggerSource = event.triggerSource;
  console.log('Trigger source:', triggerSource);

  try {
    // Handle different trigger sources
    switch (triggerSource) {
      // Post confirmation events
      case 'PostConfirmation_ConfirmSignUp':
      case 'PostConfirmation_ConfirmForgotPassword':
        return await handlePostConfirmation(event as PostConfirmationTriggerEvent);
      
      // Pre sign-up events
      case 'PreSignUp_SignUp':
      case 'PreSignUp_AdminCreateUser':
      case 'PreSignUp_ExternalProvider':
        return await handlePreSignUp(event as PreSignUpTriggerEvent);

      // Post authentication events
      case 'PostAuthentication_Authentication':
        return await handlePostAuthentication(event as PostAuthenticationTriggerEvent);
      
      default:
        console.log(`No specific handler for trigger source: ${triggerSource}, passing event through`);
        return event;
    }
  } catch (error) {
    console.error(`Error handling ${triggerSource}:`, error);
    // Always return the event to allow the authentication flow to continue
    return event;
  }
};

/**
 * Handle Pre Sign-Up events
 * This is where we can track when users are created but not yet confirmed
 */
async function handlePreSignUp(event: PreSignUpTriggerEvent) {
  console.log('Handling Pre Sign-Up event');

  try {
    const { userAttributes } = event.request;
    const { 
      email, 
      'cognito:user_status': cognitoUserStatus 
    } = userAttributes;

    // We can't access the sub (user ID) yet in pre-signup, so we'll use email as a key
    const USER_TABLE_NAME = process.env.USER_TABLE_NAME;
    if (!USER_TABLE_NAME) {
      console.error('USER_TABLE_NAME environment variable is not set');
      return event;
    }

    console.log('User status in pre-signup:', cognitoUserStatus || 'UNCONFIRMED');
    
    // Store this information if needed. Since we don't have a user ID yet, 
    // we can just log for now and handle the actual user creation in post-confirmation
    console.log('Pre sign-up event for email:', email, 'Status:', cognitoUserStatus || 'UNCONFIRMED');
  } catch (error) {
    console.error('Error in pre-signup handler:', error);
  }

  // Auto-confirm email for testing if needed (uncomment for testing only)
  // event.response.autoConfirmUser = true;
  // event.response.autoVerifyEmail = true;

  return event;
}

/**
 * Handle Post Authentication events
 * This is where we update last login time and track user activity
 */
async function handlePostAuthentication(event: PostAuthenticationTriggerEvent) {
  console.log('Handling Post Authentication event');

  try {
    const { userAttributes } = event.request;
    const { 
      sub,
      'cognito:user_status': cognitoUserStatus 
    } = userAttributes;

    const USER_TABLE_NAME = process.env.USER_TABLE_NAME;
    if (!USER_TABLE_NAME) {
      console.error('USER_TABLE_NAME environment variable is not set');
      return event;
    }

    // Update the user's last login timestamp
    try {
      await ddbDocClient.send(
        new UpdateCommand({
          TableName: USER_TABLE_NAME,
          Key: { id: sub },
          UpdateExpression: 'SET lastLogin = :lastLogin, updatedAt = :updatedAt, #status = :status',
          ExpressionAttributeNames: {
            '#status': 'status'
          },
          ExpressionAttributeValues: {
            ':lastLogin': new Date().toISOString(),
            ':updatedAt': new Date().toISOString(),
            ':status': cognitoUserStatus || 'CONFIRMED'
          }
        })
      );
      console.log('Updated user last login timestamp and status for user:', sub);
    } catch (updateError) {
      console.error('Error updating user last login:', updateError);
    }
  } catch (error) {
    console.error('Error in post-authentication handler:', error);
  }

  return event;
}

/**
 * Ensures that the Student group exists in Cognito
 * @param userPoolId The Cognito User Pool ID
 * @returns Promise<boolean> Whether the group was found or created
 */
async function ensureStudentGroupExists(userPoolId: string): Promise<boolean> {
  try {
    console.log('Checking if Student group exists in user pool:', userPoolId);
    
    // List existing groups
    const listGroupsCommand = new ListGroupsCommand({
      UserPoolId: userPoolId,
    });
    
    const groupsResponse = await cognitoClient.send(listGroupsCommand);
    const groups = groupsResponse.Groups || [];
    
    // Check if Student group exists
    const studentGroup = groups.find(g => g.GroupName === 'Student');
    if (studentGroup) {
      console.log('Student group already exists');
      return true;
    }
    
    // Create Student group if it doesn't exist
    console.log('Student group does not exist. Creating it now...');
    const createGroupCommand = new CreateGroupCommand({
      UserPoolId: userPoolId,
      GroupName: 'Student',
      Description: 'Students who can apply to jobs',
      Precedence: 3 // Higher number than other groups
    });
    
    await cognitoClient.send(createGroupCommand);
    console.log('Student group created successfully');
    return true;
  } catch (error) {
    console.error('Error ensuring Student group exists:', error);
    return false;
  }
}

/**
 * Handle Post Confirmation events
 */
async function handlePostConfirmation(event: PostConfirmationTriggerEvent) {
  console.log('Handling Post Confirmation event');

  try {
    const { userAttributes } = event.request;
    const { 
      sub, 
      email, 
      email_verified, 
      given_name, 
      family_name, 
      name, 
      phone_number, 
      'cognito:user_status': cognitoUserStatus 
    } = userAttributes;

    // Read table name from the environment variable
    const USER_TABLE_NAME = process.env.USER_TABLE_NAME;

    if (!USER_TABLE_NAME) {
      console.error('USER_TABLE_NAME environment variable is not set');
      return event;
    }

    console.log('Using table name:', USER_TABLE_NAME);

    // Make sure the Student group exists in Cognito
    await ensureStudentGroupExists(event.userPoolId);

    // Check if user already exists
    let existingUser;
    try {
      const getUserResult = await ddbDocClient.send(
        new GetCommand({
          TableName: USER_TABLE_NAME,
          Key: { id: sub }
        })
      );
      existingUser = getUserResult.Item;
      console.log('Existing user check result:', existingUser ? 'User found' : 'User not found');
    } catch (getError) {
      console.error('Error checking if user exists:', getError);
    }

    if (existingUser) {
      // User exists, update only the necessary fields
      console.log('Updating existing user record with new status:', cognitoUserStatus);
      
      try {
        // Update existing user record, ensure the user has the Student role
        const roles = existingUser.roles || [];
        if (!roles.includes('Student')) {
          roles.push('Student');
        }
        
        await ddbDocClient.send(
          new UpdateCommand({
            TableName: USER_TABLE_NAME,
            Key: { id: sub },
            UpdateExpression: 'SET #status = :status, emailVerified = :emailVerified, updatedAt = :updatedAt, roles = :roles',
            ExpressionAttributeNames: {
              '#status': 'status'
            },
            ExpressionAttributeValues: {
              ':status': cognitoUserStatus || 'CONFIRMED',
              ':emailVerified': email_verified === 'true',
              ':updatedAt': new Date().toISOString(),
              ':roles': roles
            }
          })
        );
        console.log('User record updated successfully in DynamoDB');
      } catch (updateError) {
        console.error('Error updating user in DynamoDB:', updateError);
      }
    } else {
      // Create new user record with all available attributes
      const user = {
        id: sub, // Primary key
        userId: sub, // Keep for backward compatibility
        email: email,
        emailVerified: email_verified === 'true',
        status: cognitoUserStatus || 'CONFIRMED',
        roles: ['Student'], // Default role for new users
        
        // Personal information
        givenName: given_name || undefined,
        familyName: family_name || undefined,
        fullName: name || (given_name ? (family_name ? `${given_name} ${family_name}` : given_name) : undefined),
        phoneNumber: phone_number || undefined,
        
        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      console.log('Creating new user in DynamoDB:', user);

      try {
        // Save to DynamoDB
        await ddbDocClient.send(
          new PutCommand({
            TableName: USER_TABLE_NAME,
            Item: user
          })
        );
        console.log('User record created successfully in DynamoDB');
      } catch (dbError) {
        console.error('Error saving user to DynamoDB:', dbError);
        // Continue execution to try adding user to group
      }
    }

    // Add user to Student group in Cognito (for both new and existing users)
    try {
      console.log('Attempting to add user to Student group in Cognito');
      const addToStudentGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: event.userPoolId,
        Username: event.userName,
        GroupName: 'Student'
      });

      await cognitoClient.send(addToStudentGroupCommand);
      console.log('Successfully added user to Student group in Cognito');
    } catch (groupError) {
      console.error('Error adding user to Student group:', groupError);
      // Don't throw here - we want to return the event even if group assignment fails
    }
  } catch (error) {
    console.error('Error in post-confirmation handler:', error);
  }

  // Always return the event to allow the authentication flow to continue
  return event;
}
