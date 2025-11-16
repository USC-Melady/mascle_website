#!/bin/bash

# This script sets the environment variables for the user management Lambda functions

# Get the Cognito User Pool ID from the Amplify outputs
USER_POOL_ID=$(grep -o '"userPoolId": "[^"]*"' amplify_outputs.json | cut -d'"' -f4)

# Get the User table name from the Amplify outputs
USER_TABLE_NAME=$(grep -o '"User-[^"]*"' amplify_outputs.json | head -1 | tr -d '"')

# Check if values were found
if [ -z "$USER_POOL_ID" ]; then
  echo "Error: Could not find User Pool ID in amplify_outputs.json"
  exit 1
fi

if [ -z "$USER_TABLE_NAME" ]; then
  echo "Error: Could not find User table name in amplify_outputs.json"
  exit 1
fi

echo "Found User Pool ID: $USER_POOL_ID"
echo "Found User Table Name: $USER_TABLE_NAME"

# Set environment variables for updateUserStatus Lambda
echo "Setting environment variables for updateUserStatus Lambda..."
aws lambda update-function-configuration \
  --function-name updateUserStatus \
  --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_TABLE_NAME=$USER_TABLE_NAME}"

# Set environment variables for updateUserRoles Lambda
echo "Setting environment variables for updateUserRoles Lambda..."
aws lambda update-function-configuration \
  --function-name updateUserRoles \
  --environment "Variables={USER_POOL_ID=$USER_POOL_ID,USER_TABLE_NAME=$USER_TABLE_NAME}"

echo "Environment variables set successfully!" 