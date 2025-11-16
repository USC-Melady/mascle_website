#!/bin/bash

# Script to set environment variables for the Lambda function

# Get the Lambda function name
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'postConfirmation')].FunctionName" --output text)

if [ -z "$LAMBDA_NAME" ]; then
  echo "Error: Could not find the postConfirmation Lambda function."
  exit 1
fi

echo "Found Lambda function: $LAMBDA_NAME"

# Get the DynamoDB table name
TABLE_NAME=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)

if [ -z "$TABLE_NAME" ]; then
  echo "Error: Could not find the User table."
  exit 1
fi

echo "Found User table: $TABLE_NAME"

# Set the environment variables
echo "Setting environment variables for the Lambda function..."
aws lambda update-function-configuration \
  --function-name $LAMBDA_NAME \
  --environment "Variables={USER_TABLE_NAME=$TABLE_NAME}"

echo "Environment variables set successfully!"
echo "The Lambda function now has access to the User table." 