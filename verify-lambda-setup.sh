#!/bin/bash

# Script to verify the post-confirmation Lambda setup

echo "=== Verifying PostConfirmation Lambda Configuration ==="

# Get the Lambda function name
LAMBDA_NAME=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'postConfirmation')].FunctionName" --output text)

if [ -z "$LAMBDA_NAME" ]; then
  echo "❌ ERROR: Could not find the postConfirmation Lambda function."
  exit 1
fi

echo "✅ Found Lambda function: $LAMBDA_NAME"

# Get the DynamoDB table names
USER_TABLE_NAME=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)

if [ -z "$USER_TABLE_NAME" ]; then
  echo "❌ ERROR: Could not find the User table."
  exit 1
fi

echo "✅ Found User table: $USER_TABLE_NAME"

# Get the User Pool ID
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?contains(Name, 'amplify')].Id" --output text)

if [ -z "$USER_POOL_ID" ]; then
  echo "❌ ERROR: Could not find the Cognito User Pool."
  exit 1
fi

echo "✅ Found User Pool ID: $USER_POOL_ID"

# Get the role name for the Lambda function
ROLE_NAME=$(aws lambda get-function --function-name $LAMBDA_NAME --query "Configuration.Role" --output text | awk -F/ '{print $NF}')

if [ -z "$ROLE_NAME" ]; then
  echo "❌ ERROR: Could not find the role for the Lambda function."
  exit 1
fi

echo "✅ Found Lambda execution role: $ROLE_NAME"

# Check the environment variables
echo "Checking Lambda environment variables..."
ENV_VARS=$(aws lambda get-function-configuration --function-name $LAMBDA_NAME --query "Environment.Variables" --output json)

if [ -z "$ENV_VARS" ] || [ "$ENV_VARS" == "null" ]; then
  echo "❌ ERROR: No environment variables set for the Lambda function."
else
  echo "Current environment variables: $ENV_VARS"
  
  # Check if USER_TABLE_NAME is set
  TABLE_NAME_VAR=$(echo $ENV_VARS | grep -o '"USER_TABLE_NAME":"[^"]*"' || echo "")
  if [ -z "$TABLE_NAME_VAR" ]; then
    echo "❌ ERROR: USER_TABLE_NAME environment variable is not set."
    NEEDS_ENV_UPDATE=true
  else
    CURRENT_TABLE=$(echo $TABLE_NAME_VAR | cut -d'"' -f4)
    echo "✅ USER_TABLE_NAME is set to: $CURRENT_TABLE"
    
    if [ "$CURRENT_TABLE" != "$USER_TABLE_NAME" ]; then
      echo "⚠️ WARNING: USER_TABLE_NAME is set to $CURRENT_TABLE but should be $USER_TABLE_NAME"
      NEEDS_ENV_UPDATE=true
    fi
  fi
  
  # Check if USER_POOL_ID is set
  POOL_ID_VAR=$(echo $ENV_VARS | grep -o '"USER_POOL_ID":"[^"]*"' || echo "")
  if [ -z "$POOL_ID_VAR" ]; then
    echo "❌ ERROR: USER_POOL_ID environment variable is not set."
    NEEDS_ENV_UPDATE=true
  else
    CURRENT_POOL=$(echo $POOL_ID_VAR | cut -d'"' -f4)
    echo "✅ USER_POOL_ID is set to: $CURRENT_POOL"
    
    if [ "$CURRENT_POOL" != "$USER_POOL_ID" ]; then
      echo "⚠️ WARNING: USER_POOL_ID is set to $CURRENT_POOL but should be $USER_POOL_ID"
      NEEDS_ENV_UPDATE=true
    fi
  fi
fi

# Check Lambda policies
echo "Checking Lambda policies..."
POLICIES=$(aws iam list-role-policies --role-name $ROLE_NAME --output json)

echo "Policies attached to role: $POLICIES"

# Check for DynamoDB permissions
DYNAMODB_POLICY=$(aws iam get-role-policy --role-name $ROLE_NAME --policy-name "DynamoDBAccess-${LAMBDA_NAME}" --output json 2>/dev/null || echo "")
if [ -z "$DYNAMODB_POLICY" ]; then
  echo "❌ ERROR: DynamoDB policy not found."
  NEEDS_POLICY_UPDATE=true
else
  echo "✅ DynamoDB policy exists."
fi

# Check for Cognito permissions
COGNITO_POLICY=$(aws iam get-role-policy --role-name $ROLE_NAME --policy-name "CognitoAccess-${LAMBDA_NAME}" --output json 2>/dev/null || echo "")
if [ -z "$COGNITO_POLICY" ]; then
  echo "❌ ERROR: Cognito policy not found."
  NEEDS_POLICY_UPDATE=true
else
  echo "✅ Cognito policy exists."
fi

# Ask if user wants to fix issues
if [ "$NEEDS_ENV_UPDATE" = true ] || [ "$NEEDS_POLICY_UPDATE" = true ]; then
  echo ""
  echo "Issues were found with the Lambda setup."
  read -p "Do you want to fix these issues? (y/n): " answer
  
  if [ "$answer" = "y" ]; then
    if [ "$NEEDS_POLICY_UPDATE" = true ]; then
      echo "Adding required policies..."
      
      # Create DynamoDB policy
      DYNAMODB_POLICY_DOCUMENT='{
        "Version": "2012-10-17",
        "Statement": [
          {
            "Effect": "Allow",
            "Action": [
              "dynamodb:GetItem",
              "dynamodb:PutItem",
              "dynamodb:UpdateItem"
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
              "cognito-idp:ListGroups",
              "cognito-idp:CreateGroup",
              "cognito-idp:AdminAddUserToGroup"
            ],
            "Resource": "*"
          }
        ]
      }'
      
      # Set the DynamoDB policy
      aws iam put-role-policy --role-name $ROLE_NAME --policy-name "DynamoDBAccess-${LAMBDA_NAME}" --policy-document "$DYNAMODB_POLICY_DOCUMENT"
      echo "✅ DynamoDB policy added."
      
      # Set the Cognito policy
      aws iam put-role-policy --role-name $ROLE_NAME --policy-name "CognitoAccess-${LAMBDA_NAME}" --policy-document "$COGNITO_POLICY_DOCUMENT"
      echo "✅ Cognito policy added."
    fi
    
    if [ "$NEEDS_ENV_UPDATE" = true ]; then
      echo "Updating environment variables..."
      aws lambda update-function-configuration \
        --function-name $LAMBDA_NAME \
        --environment "Variables={USER_TABLE_NAME=$USER_TABLE_NAME,USER_POOL_ID=$USER_POOL_ID}"
      echo "✅ Environment variables updated."
    fi
    
    echo "✅ Lambda configuration has been updated."
  else
    echo "No changes made."
  fi
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "To manually test the postConfirmation Lambda:"
echo "1. Register a new user via your application"
echo "2. Check CloudWatch logs for any errors"
echo "3. Verify that the user is added to the DynamoDB table with the Student role"
echo "4. Verify that the user is added to the Student group in Cognito" 