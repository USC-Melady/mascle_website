import { defineFunction } from '@aws-amplify/backend';

export const updateApplicationStatus = defineFunction({
  name: 'updateApplicationStatus',
  entry: './handler.ts'
});