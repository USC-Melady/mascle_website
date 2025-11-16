#!/bin/bash

# Script to set permissions for the post-confirmation Lambda function

# Get the Lambda function name (post-confirmation function in the auth group)
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'postConfirmation')].FunctionName" --output text)

if [ -z "$LAMBDA_NAME" ]; then
  echo "Error: Could not find the postConfirmation Lambda function."
  exit 1
fi

echo "Found Lambda function: $LAMBDA_NAME"

# Get the DynamoDB table name for User
USER_TABLE_NAME=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)

if [ -z "$USER_TABLE_NAME" ]; then
  echo "Error: Could not find the User table."
  exit 1
fi

echo "Found User table: $USER_TABLE_NAME"

# Get the User Pool ID
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?contains(Name, 'amplify')].Id" --output text)

if [ -z "$USER_POOL_ID" ]; then
  echo "Error: Could not find the Cognito User Pool."
  exit 1
fi

echo "Found User Pool ID: $USER_POOL_ID"

# Get the role name for the Lambda function
ROLE_NAME=$(aws lambda get-function --function-name $LAMBDA_NAME --query "Configuration.Role" --output text | awk -F/ '{print $NF}')

if [ -z "$ROLE_NAME" ]; then
  echo "Error: Could not find the role for the Lambda function."
  exit 1
fi

echo "Found role: $ROLE_NAME"

# Create a policy to allow the Lambda function to access DynamoDB
DYNAMODB_POLICY_DOCUMENT='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:UpdateItem"
      ],
      "Resource": "*"
    }
  ]
}'

# Create a policy to allow the Lambda function to access Cognito
COGNITO_POLICY_DOCUMENT='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:ListGroups",
        "cognito-idp:CreateGroup",
        "cognito-idp:AdminAddUserToGroup"
      ],
      "Resource": "*"
    }
  ]
}'

# Set the DynamoDB policy
echo "Setting DynamoDB policy for the Lambda function role..."
DYNAMO_POLICY_NAME="DynamoDBAccess-${LAMBDA_NAME}"
aws iam put-role-policy --role-name $ROLE_NAME --policy-name $DYNAMO_POLICY_NAME --policy-document "$DYNAMODB_POLICY_DOCUMENT"

# Set the Cognito policy
echo "Setting Cognito policy for the Lambda function role..."
COGNITO_POLICY_NAME="CognitoAccess-${LAMBDA_NAME}"
aws iam put-role-policy --role-name $ROLE_NAME --policy-name $COGNITO_POLICY_NAME --policy-document "$COGNITO_POLICY_DOCUMENT"

# Set the environment variables
echo "Setting environment variables for the Lambda function..."
aws lambda update-function-configuration \
  --function-name $LAMBDA_NAME \
  --environment "Variables={USER_TABLE_NAME=$USER_TABLE_NAME,USER_POOL_ID=$USER_POOL_ID}"

echo ""
echo "Permissions and environment variables set successfully!"
echo "The Lambda function now has access to the User table and Cognito User Pool."
echo ""
echo "To verify the changes, check the AWS Console:"
echo "1. Go to Lambda > $LAMBDA_NAME > Configuration > Permissions"
echo "2. Go to Lambda > $LAMBDA_NAME > Configuration > Environment variables"
echo ""
echo "You can now try registering a new user and verify that the Student role is added." 