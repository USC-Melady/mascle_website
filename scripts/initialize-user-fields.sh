#!/bin/bash

# Get User table name
USER_TABLE=$(aws dynamodb list-tables --query "TableNames[?contains(@, 'User')]" --output text)

if [ -z "$USER_TABLE" ]; then
  echo "Error: Could not find User table."
  exit 1
fi

echo "Found User table: $USER_TABLE"

# Get all users
echo "Fetching all users..."
users=$(aws dynamodb scan --table-name $USER_TABLE --output json)

# Process each user
echo "Processing users..."
echo "$users" | jq -c '.Items[]' | while read -r user; do
  userId=$(echo "$user" | jq -r '.id.S')
  
  # Initialize profile completion
  profileCompletion=$(cat << EOF
{
  "isComplete": false,
  "lastUpdated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "completedFields": [],
  "missingFields": ["resume", "profile", "education", "experience"]
}
EOF
)

  # Initialize application stats
  applicationStats=$(cat << EOF
{
  "totalApplications": 0,
  "lastApplicationDate": null,
  "applicationLimit": 5
}
EOF
)

  # Update user record
  echo "Updating user: $userId"
  aws dynamodb update-item \
    --table-name $USER_TABLE \
    --key "{\"id\": {\"S\": \"$userId\"}}" \
    --update-expression "SET profileCompletion = :pc, applicationStats = :as" \
    --expression-attribute-values "{\":pc\": {\"M\": $profileCompletion}, \":as\": {\"M\": $applicationStats}}" \
    --return-values ALL_NEW

  echo "Updated user: $userId"
done

echo "User field initialization completed!" 