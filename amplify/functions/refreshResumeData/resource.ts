import { defineFunction } from '@aws-amplify/backend';

export const refreshResumeData = defineFunction({
  name: 'refreshResumeData',
  entry: './src/index.js'
});
