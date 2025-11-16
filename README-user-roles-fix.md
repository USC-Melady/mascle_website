# Fix for User Registration and Role Assignment

This document explains how to fix the permission issues with the postConfirmation Lambda function to ensure new users are automatically assigned the Student role.

## Issue

The Lambda function that handles post-confirmation of user registration is failing to:
1. Create/update user records in DynamoDB
2. Add newly registered users to the "Student" Cognito group

This happens because the Lambda function doesn't have the proper IAM permissions to access DynamoDB and Cognito resources.

## Solution

We've made the following changes:

1. Updated the `amplify/functions/postConfirmation/resource.ts` file to include the necessary IAM permissions
2. Created a script `set-lambda-permissions.sh` to manually set the permissions and environment variables

## Deployment Steps

Follow these steps to deploy the fix:

### 1. Deploy the Changes

Deploy your Amplify project with the updated lambda function:

```bash
npx amplify push
```

### 2. Run the Permission Script

After deployment, run the script to set the necessary permissions:

```bash
./set-lambda-permissions.sh
```

This script will:
- Find your postConfirmation Lambda function
- Find your User DynamoDB table
- Find your Cognito User Pool ID
- Add IAM policies to allow the Lambda to access DynamoDB and Cognito
- Set environment variables with the correct table name and user pool ID

### 3. Verify the Fix

You can verify the fix by registering a new user and checking that:
1. The user is added to the "Student" group in Cognito
2. The user record is created in the DynamoDB table with the "Student" role

## Manual Alternative

If you prefer to make these changes manually, you can:

1. Go to AWS Lambda console > Function > Configuration > Permissions
2. Add permissions to access DynamoDB (GetItem, PutItem, UpdateItem)
3. Add permissions to access Cognito (AdminAddUserToGroup, ListGroups, CreateGroup)
4. Set environment variables USER_TABLE_NAME and USER_POOL_ID with appropriate values

## Troubleshooting

If you're still having issues, check the CloudWatch logs for the postConfirmation Lambda function to see specific error messages.

The most common error is "AccessDeniedException" which indicates the Lambda function doesn't have sufficient permissions to access a resource.

You can also test the Lambda function directly from the AWS console to verify the permissions are working correctly. 