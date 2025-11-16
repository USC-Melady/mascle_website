import { defineFunction } from '@aws-amplify/backend';

export const createJob = defineFunction({
  name: 'createJob',
  entry: './handler.ts'
}); 