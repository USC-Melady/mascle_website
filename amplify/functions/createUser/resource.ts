import { defineFunction } from '@aws-amplify/backend';

export const createUser = defineFunction({
  name: 'createUser',
  entry: './handler.ts',
  environment: {
    USER_TABLE: 'User-fdob2vhf5rcx5nmzeui5vspzqu-NONE'
  }
}); 