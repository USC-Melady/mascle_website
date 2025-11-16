import { defineFunction } from '@aws-amplify/backend';

export const updateLab = defineFunction({
  name: 'updateLab',
  entry: './handler.ts',
  environment: {
    LAB_TABLE: process.env.LAB_TABLE || 'Lab-table'
  }
}); 