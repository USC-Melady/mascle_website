import { defineFunction } from '@aws-amplify/backend';

export const deleteLab = defineFunction({
  name: 'deleteLab',
  entry: './handler.ts',
  environment: {
    LAB_TABLE: process.env.LAB_TABLE || 'Lab-table'
  }
}); 