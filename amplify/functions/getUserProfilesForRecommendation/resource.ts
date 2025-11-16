import { defineFunction } from '@aws-amplify/backend';

export const getUserProfilesForRecommendation = defineFunction({
  name: 'getUserProfilesForRecommendation',
  entry: './handler.ts'
}); 