import { defineFunction } from '@aws-amplify/backend';

export const postConfirmation = defineFunction({
  name: 'postConfirmation',
  entry: './handler.ts',
  environment: {
    // This will be populated during deployment with the correct User table name
    USER_TABLE_NAME: process.env.USER_TABLE_NAME || 'User-placeholder',
  },
  // Assign this function to the auth resource group since it's used as auth triggers
  resourceGroupName: 'auth',
  permissions: [
    // Add permissions for DynamoDB operations
    {
      actions: [
        'dynamodb:GetItem',
        'dynamodb:PutItem',
        'dynamodb:UpdateItem'
      ],
      resources: ['*'] // This will be scoped down by the CDK stack to the specific tables
    },
    // Add permissions for Cognito operations
    {
      actions: [
        'cognito-idp:ListGroups',
        'cognito-idp:CreateGroup',
        'cognito-idp:AdminAddUserToGroup'
      ],
      resources: ['*'] // This will be scoped down by the CDK stack to the specific user pool
    }
  ]
});

// Note: Permissions will need to be added via AWS console or CLI:
// - Allow the Lambda to read from and write to the User table (dynamodb:GetItem, PutItem, UpdateItem, etc.)
// - Allow the Lambda to interact with Cognito (cognito-idp:AdminAddUserToGroup)
