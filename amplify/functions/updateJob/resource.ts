import { defineFunction } from '@aws-amplify/backend';

export const updateJob = defineFunction({
  name: 'updateJob',
  entry: './handler.ts'
}); 