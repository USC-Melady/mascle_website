import { defineFunction } from '@aws-amplify/backend';

export const createLab = defineFunction({
  name: 'createLab',
  entry: './handler.ts',
  environment: {
    LAB_TABLE: process.env.LAB_TABLE || 'Lab-table'
  }
}); 