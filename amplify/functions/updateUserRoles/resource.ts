import { defineFunction } from '@aws-amplify/backend';

export const updateUserRoles = defineFunction({
  name: 'updateUserRoles',
  entry: './handler.ts',
}); 