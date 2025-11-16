import { defineFunction } from '@aws-amplify/backend';

export const removeUserFromLab = defineFunction({
  name: 'removeUserFromLab',
  entry: './handler.ts'
}); 