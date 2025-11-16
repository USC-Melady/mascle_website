#!/bin/bash

# This script cleans up Amplify resources in AWS cloud while preserving local settings

echo "Cleaning up Amplify resources in AWS cloud..."

# Delete Amplify resources from AWS cloud
if command -v aws &> /dev/null; then
  # Prompt for AWS profile
  echo "Enter AWS profile to use (leave empty for default):"
  read AWS_PROFILE
  
  PROFILE_OPTION=""
  if [ ! -z "$AWS_PROFILE" ]; then
    PROFILE_OPTION="--profile $AWS_PROFILE"
    echo "Using AWS profile: $AWS_PROFILE"
  else
    echo "Using default AWS profile"
  fi
  
  # Get list of AWS regions
  echo "Checking for Amplify apps across all regions..."
  REGIONS=$(aws ec2 describe-regions $PROFILE_OPTION --query "Regions[].RegionName" --output text)
  
  # Check each region for Amplify apps
  FOUND_APPS=false
  for REGION in $REGIONS; do
    echo "Checking region: $REGION"
    APP_LIST=$(aws amplify list-apps $PROFILE_OPTION --region $REGION)
    APP_COUNT=$(echo $APP_LIST | jq '.apps | length')
    
    if [ "$APP_COUNT" -gt 0 ]; then
      FOUND_APPS=true
      echo "Found Amplify apps in region $REGION:"
      echo "$APP_LIST" | jq '.'
      
      # Prompt for app ID to delete
      echo ""
      echo "Enter the App ID you want to delete from region $REGION (leave empty to skip):"
      read APP_ID
      
      if [ ! -z "$APP_ID" ]; then
        echo "Deleting Amplify app $APP_ID from AWS cloud in region $REGION..."
        aws amplify delete-app $PROFILE_OPTION --app-id $APP_ID --region $REGION
        echo "App deletion initiated. This may take a few minutes to complete."
      else
        echo "No App ID provided. Skipping app deletion for region $REGION."
      fi
    fi
  done
  
  if [ "$FOUND_APPS" = false ]; then
    echo "No Amplify apps found in any region."
    echo "If you believe you have Amplify apps deployed, check that you're using the correct AWS profile."
  fi
  
  # Check for and delete CloudFormation stacks related to Amplify
  echo ""
  echo "Enter AWS region to check for CloudFormation stacks (e.g., us-east-1):"
  read CF_REGION
  
  if [ -z "$CF_REGION" ]; then
    CF_REGION="us-east-1"
    echo "Using default region: $CF_REGION"
  fi
  
  echo "Listing CloudFormation stacks in $CF_REGION that might be related to Amplify..."
  aws cloudformation list-stacks $PROFILE_OPTION --region $CF_REGION --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE | grep -i "amplify\|mascle" || echo "No matching stacks found"
  
  echo ""
  echo "Enter the CloudFormation stack name to delete (leave empty to skip):"
  read STACK_NAME
  
  if [ ! -z "$STACK_NAME" ]; then
    echo "Deleting CloudFormation stack $STACK_NAME in region $CF_REGION..."
    aws cloudformation delete-stack $PROFILE_OPTION --stack-name $STACK_NAME --region $CF_REGION
    echo "Stack deletion initiated. This may take a few minutes to complete."
  else
    echo "No stack name provided. Skipping stack deletion."
  fi
  
  # Check for other AWS resources that might be related to Amplify
  echo ""
  echo "Would you like to check for other AWS resources that might be related to Amplify? (y/n)"
  read CHECK_OTHER
  
  if [ "$CHECK_OTHER" = "y" ] || [ "$CHECK_OTHER" = "Y" ]; then
    echo "Checking for API Gateway APIs..."
    aws apigateway get-rest-apis $PROFILE_OPTION --region $CF_REGION | grep -i "amplify\|mascle" || echo "No matching APIs found"
    
    echo "Checking for Lambda functions..."
    aws lambda list-functions $PROFILE_OPTION --region $CF_REGION | grep -i "amplify\|mascle" || echo "No matching Lambda functions found"
    
    echo "Checking for DynamoDB tables..."
    aws dynamodb list-tables $PROFILE_OPTION --region $CF_REGION | grep -i "amplify\|mascle" || echo "No matching DynamoDB tables found"
    
    echo "Checking for S3 buckets..."
    aws s3 ls $PROFILE_OPTION | grep -i "amplify\|mascle" || echo "No matching S3 buckets found"
  fi
else
  echo "AWS CLI not found. Please install it to delete AWS cloud resources."
  echo "Install instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  echo "You'll also need to install jq: https://stedolan.github.io/jq/download/"
fi

echo ""
echo "Cloud cleanup process initiated."
echo "IMPORTANT: Check your AWS console to confirm all cloud resources have been deleted."
echo "Your local settings have been preserved for future deployment." 