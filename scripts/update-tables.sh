#!/bin/bash

# Get table names
USER_TABLE=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)
MATCH_TABLE=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'Match')]" --output text)

if [ -z "$USER_TABLE" ] || [ -z "$MATCH_TABLE" ]; then
  echo "Error: Could not find User or Match tables."
  exit 1
fi

echo "Found tables:"
echo "User table: $USER_TABLE"
echo "Match table: $MATCH_TABLE"

# Update User table with new fields
echo "Updating User table..."
aws dynamodb update-table \
  --table-name $USER_TABLE \
  --attribute-definitions \
    AttributeName=profileCompletion,AttributeType=M \
    AttributeName=applicationStats,AttributeType=M \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"ProfileCompletionIndex\",\"KeySchema\":[{\"AttributeName\":\"profileCompletion\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}}]"

# Update Match table with new fields
echo "Updating Match table..."
aws dynamodb update-table \
  --table-name $MATCH_TABLE \
  --attribute-definitions \
    AttributeName=applicationDetails,AttributeType=M \
  --global-secondary-index-updates \
    "[{\"Create\":{\"IndexName\":\"ApplicationDetailsIndex\",\"KeySchema\":[{\"AttributeName\":\"applicationDetails\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}}]"

echo "Tables updated successfully!" 