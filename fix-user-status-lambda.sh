#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fixing User Status Lambda Configuration${NC}"

# Get the real User table name
USER_TABLE=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User-')]" --output text | grep -v placeholder)

if [ -z "$USER_TABLE" ]; then
    echo -e "${RED}Error: Could not find User table in DynamoDB${NC}"
    exit 1
fi

echo -e "${GREEN}Found User table: $USER_TABLE${NC}"

# Get the PostConfirmation Lambda function name
POST_CONFIRMATION_LAMBDA=$(aws lambda list-functions --query "Functions[?contains(FunctionName, 'postConfirmation')].FunctionName" --output text)

if [ -z "$POST_CONFIRMATION_LAMBDA" ]; then
    echo -e "${RED}Error: Could not find postConfirmation Lambda function${NC}"
    exit 1
fi

echo -e "${GREEN}Found Lambda function: $POST_CONFIRMATION_LAMBDA${NC}"

# Update the Lambda environment variables
echo "Updating environment variables for $POST_CONFIRMATION_LAMBDA..."
aws lambda update-function-configuration \
    --function-name $POST_CONFIRMATION_LAMBDA \
    --environment "Variables={USER_TABLE_NAME=$USER_TABLE}"

echo -e "${YELLOW}Updating IAM permissions...${NC}"

# Get the Lambda's role
LAMBDA_ROLE=$(aws lambda get-function --function-name $POST_CONFIRMATION_LAMBDA --query 'Configuration.Role' --output text)
ROLE_NAME=$(echo $LAMBDA_ROLE | cut -d'/' -f2)

echo -e "${GREEN}Lambda uses IAM Role: $ROLE_NAME${NC}"

# Create a policy document for DynamoDB access
cat > dynamodb-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:GetItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:*:*:table/$USER_TABLE"
            ]
        }
    ]
}
EOF

# Create and attach the policy
POLICY_NAME="PostConfirmationDynamoDBAccess"
aws iam create-policy \
    --policy-name $POLICY_NAME \
    --policy-document file://dynamodb-policy.json > /dev/null

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
POLICY_ARN="arn:aws:iam::$ACCOUNT_ID:policy/$POLICY_NAME"

# Check if policy already attached
POLICY_ATTACHED=$(aws iam list-attached-role-policies --role-name $ROLE_NAME --query "AttachedPolicies[?PolicyName=='$POLICY_NAME'].PolicyArn" --output text)

if [ -z "$POLICY_ATTACHED" ]; then
    echo "Attaching policy to role..."
    aws iam attach-role-policy \
        --role-name $ROLE_NAME \
        --policy-arn $POLICY_ARN
else
    echo "Policy already attached to role."
fi

# Clean up
rm dynamodb-policy.json

echo -e "${GREEN}Lambda function updated successfully!${NC}"
echo "To test, try logging in again with test@usc.edu or create a new test user."
echo "The status should now be updated correctly in the DynamoDB database." 