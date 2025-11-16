import { defineFunction } from '@aws-amplify/backend';

export const getJobApplications = defineFunction({
  name: 'getJobApplications',
  entry: './handler.ts'
}); 