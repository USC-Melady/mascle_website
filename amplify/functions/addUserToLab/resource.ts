import { defineFunction } from '@aws-amplify/backend';

export const addUserToLab = defineFunction({
  name: 'addUserToLab',
  entry: './handler.ts'
}); 