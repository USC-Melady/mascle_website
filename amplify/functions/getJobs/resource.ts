import { defineFunction } from '@aws-amplify/backend';

export const getJobs = defineFunction({
  name: 'getJobs',
  entry: './handler.ts'
}); 