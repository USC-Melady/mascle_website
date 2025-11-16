import { defineFunction } from '@aws-amplify/backend';

export const enhanceApplicationsWithResumeData = defineFunction({
  name: 'enhanceApplicationsWithResumeData',
  entry: './src/index.js'
});
