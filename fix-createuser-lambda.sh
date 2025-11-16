#!/bin/bash

# Script to fix permissions for the createUser Lambda function

echo "=== Adding permissions to createUser Lambda function ==="

# Set Lambda function name
LAMBDA_NAME="amplify-mascle-alaba-sand-createUserlambdaAFD3F2E8-xvKHcoy88VcS"

# Get the role name for the Lambda function
ROLE_NAME=$(aws lambda get-function --function-name $LAMBDA_NAME --query "Configuration.Role" --output text | awk -F/ '{print $NF}')

if [ -z "$ROLE_NAME" ]; then
  echo "❌ ERROR: Could not find the role for the Lambda function."
  exit 1
fi

echo "✅ Found Lambda execution role: $ROLE_NAME"

# Create DynamoDB policy
DYNAMODB_POLICY_DOCUMENT='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem", 
        "dynamodb:UpdateItem",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "*"
    }
  ]
}'

# Create Cognito policy
COGNITO_POLICY_DOCUMENT='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminAddUserToGroup"
      ],
      "Resource": "*"
    }
  ]
}'

# Set the DynamoDB policy
echo "Setting DynamoDB policy for the Lambda function role..."
aws iam put-role-policy --role-name $ROLE_NAME --policy-name "DynamoDBAccess-${LAMBDA_NAME}" --policy-document "$DYNAMODB_POLICY_DOCUMENT"
echo "✅ DynamoDB policy added."

# Set the Cognito policy
echo "Setting Cognito policy for the Lambda function role..."
aws iam put-role-policy --role-name $ROLE_NAME --policy-name "CognitoAccess-${LAMBDA_NAME}" --policy-document "$COGNITO_POLICY_DOCUMENT"
echo "✅ Cognito policy added."

echo "✅ Lambda function permissions have been updated."
echo ""
echo "Try creating a user again from the admin panel. It should work now." 