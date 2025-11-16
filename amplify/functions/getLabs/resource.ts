import { defineFunction } from '@aws-amplify/backend';

export const getLabs = defineFunction({
  name: 'getLabs',
  entry: './handler.ts'
}); 