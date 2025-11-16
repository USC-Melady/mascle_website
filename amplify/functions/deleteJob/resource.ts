import { defineFunction } from '@aws-amplify/backend';

export const deleteJob = defineFunction({
  name: 'deleteJob',
  entry: './handler.ts'
}); 