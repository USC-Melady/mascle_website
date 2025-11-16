import { defineAuth } from '@aws-amplify/backend';
import { postConfirmation } from '../functions/postConfirmation/resource';

// Define the auth resource
export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  userAttributes: {
    givenName: {
      required: true,
      mutable: true,
    },
  },
  // Define all user groups
  groups: ["Admin", "Professor", "LabAssistant", "Student"],
  triggers: {
    // Post confirmation handles new user signup confirmation
    postConfirmation,
    // Use the same Lambda for pre sign-up to detect status changes
    preSignUp: postConfirmation,
    // Use the same Lambda for post authentication to update last login time
    postAuthentication: postConfirmation
  }
});
