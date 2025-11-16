import { defineFunction } from '@aws-amplify/backend';

export const applyToJob = defineFunction({
  name: 'applyToJob',
  entry: './handler.ts'
}); 