import { defineFunction } from '@aws-amplify/backend';

/**
 * Lambda function to directly update a user's resume information in the User table
 * This is used as a fallback mechanism when the main upload confirmation endpoint fails
 */
export const updateUserResume = defineFunction({
  name: 'updateUserResume',
  entry: './handler.ts',
  environment: {
    USER_TABLE: 'User-3izs4njl3bfj5m7mmysz2zbwz4-NONE'
  }
}); 