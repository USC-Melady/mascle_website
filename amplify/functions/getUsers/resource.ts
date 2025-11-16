import { defineFunction } from '@aws-amplify/backend';

export const getUsers = defineFunction({
  name: 'getUsers',
  entry: './handler.ts',
  environment: {
    // We'll get the table name from the data resource in backend.ts
    USER_TABLE: process.env.USER_TABLE || 'User-table'
  }
}); 