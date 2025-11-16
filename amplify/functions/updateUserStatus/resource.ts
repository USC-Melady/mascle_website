import { defineFunction } from '@aws-amplify/backend';

export const updateUserStatus = defineFunction({
  name: 'updateUserStatus',
  entry: './handler.ts',
}); 