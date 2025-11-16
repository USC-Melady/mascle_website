#!/bin/bash

# Script to verify user registration flow

echo "=== Verifying User Registration Flow ==="

# Check for required arguments
if [ $# -lt 1 ]; then
  echo "Usage: $0 <email_to_check>"
  echo "Example: $0 user@example.com"
  exit 1
fi

EMAIL_TO_CHECK=$1
echo "Checking user registration status for: $EMAIL_TO_CHECK"

# Get the User Pool ID
USER_POOL_ID=$(aws cognito-idp list-user-pools --max-results 20 --query "UserPools[?contains(Name, 'amplify')].Id" --output text)

if [ -z "$USER_POOL_ID" ]; then
  echo "❌ ERROR: Could not find the Cognito User Pool."
  exit 1
fi

echo "✅ Found User Pool ID: $USER_POOL_ID"

# Find the user in Cognito
echo "Checking if user exists in Cognito..."
COGNITO_USER_RESULT=$(aws cognito-idp list-users --user-pool-id $USER_POOL_ID --filter "email=\"$EMAIL_TO_CHECK\"" --query "Users[0]" --output json 2>/dev/null || echo "{}")

if [ "$COGNITO_USER_RESULT" == "{}" ]; then
  echo "❌ User not found in Cognito User Pool."
  exit 1
fi

echo "✅ User found in Cognito User Pool:"
echo "$COGNITO_USER_RESULT" | grep Username

# Extract user sub (ID)
USER_SUB=$(echo "$COGNITO_USER_RESULT" | grep -o '"sub": "[^"]*"' | cut -d'"' -f4)
echo "User sub (ID): $USER_SUB"

# Check user status
USER_STATUS=$(echo "$COGNITO_USER_RESULT" | grep -o '"UserStatus": "[^"]*"' | cut -d'"' -f4)
echo "User status: $USER_STATUS"

# Check if user is in the Student group
echo "Checking if user is in the Student group..."
USER_GROUPS=$(aws cognito-idp admin-list-groups-for-user --user-pool-id $USER_POOL_ID --username "$USER_SUB" --output json 2>/dev/null || echo "{}")

if [ "$USER_GROUPS" == "{}" ]; then
  echo "❌ Could not retrieve user groups."
else
  STUDENT_GROUP=$(echo "$USER_GROUPS" | grep -o '"GroupName": "Student"' || echo "")
  if [ -z "$STUDENT_GROUP" ]; then
    echo "❌ User is NOT in the Student group."
  else
    echo "✅ User is in the Student group."
  fi
fi

# Get the DynamoDB table names
USER_TABLE_NAME=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)

if [ -z "$USER_TABLE_NAME" ]; then
  echo "❌ ERROR: Could not find the User table."
  exit 1
fi

echo "✅ Found User table: $USER_TABLE_NAME"

# Check if user exists in DynamoDB
echo "Checking if user exists in DynamoDB..."
DDB_USER_RESULT=$(aws dynamodb get-item --table-name $USER_TABLE_NAME --key "{\"id\":{\"S\":\"$USER_SUB\"}}" --output json 2>/dev/null || echo "{}")

if [ "$DDB_USER_RESULT" == "{}" ] || [ "$(echo $DDB_USER_RESULT | grep -o '"Item"')" == "" ]; then
  echo "❌ User not found in DynamoDB table."
else
  echo "✅ User found in DynamoDB table."
  
  # Check if user has Student role
  USER_ROLES=$(echo "$DDB_USER_RESULT" | grep -o '"roles": {[^}]*}' || echo "")
  STUDENT_ROLE=$(echo "$USER_ROLES" | grep -o '"Student"' || echo "")
  
  if [ -z "$STUDENT_ROLE" ]; then
    echo "❌ User does NOT have the Student role in DynamoDB."
  else
    echo "✅ User has the Student role in DynamoDB."
  fi
  
  # Check other fields
  echo "User data from DynamoDB:"
  echo "Email: $(echo "$DDB_USER_RESULT" | grep -o '"email": {"S": "[^"]*"}' | cut -d'"' -f6)"
  echo "Status: $(echo "$DDB_USER_RESULT" | grep -o '"status": {"S": "[^"]*"}' | cut -d'"' -f6)"
  echo "Given Name: $(echo "$DDB_USER_RESULT" | grep -o '"givenName": {"S": "[^"]*"}' | cut -d'"' -f6 || echo "Not set")"
  echo "Full Name: $(echo "$DDB_USER_RESULT" | grep -o '"fullName": {"S": "[^"]*"}' | cut -d'"' -f6 || echo "Not set")"
fi

echo ""
echo "=== Verification Complete ==="
echo ""
echo "If any issues were found with the user registration flow:"
echo "1. Check CloudWatch logs for any Lambda function errors"
echo "2. Run ./verify-lambda-setup.sh to ensure the Lambda has proper permissions"
echo "3. Manually delete and recreate the user to test the registration process" 