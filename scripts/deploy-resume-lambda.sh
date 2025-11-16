#!/bin/bash

# Script to deploy the uploadResume Lambda function

echo "Deploying uploadResume Lambda function..."

# Navigate to the project root
cd "$(dirname "$0")/.."

# Run Amplify push to deploy the Lambda function
echo "Running amplify push..."
amplify push --yes

# Get the API endpoint
API_ID=$(amplify status | grep -A 3 "API:" | grep "REST Endpoint" | awk '{print $3}' | cut -d '/' -f 3)
REGION=$(aws configure get region || echo "us-east-1")
API_ENDPOINT="https://${API_ID}.execute-api.${REGION}.amazonaws.com/dev/uploadResume"

echo "Your API endpoint is: ${API_ENDPOINT}"
echo ""
echo "To use this endpoint, update your config by:"
echo "1. Edit src/config.ts or"
echo "2. Use the Admin Settings tool in the app"
echo ""
echo "Here's the full URL to use:"
echo "${API_ENDPOINT}"

# Optional: Update the config file automatically
read -p "Do you want to update config.ts automatically? (y/n) " -n 1 -r
echo    # Move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo "Updating src/config.ts..."
    sed -i '' "s|RESUME_UPLOAD: '.*'|RESUME_UPLOAD: '${API_ENDPOINT}'|" src/config.ts
    echo "Config updated!"
fi

echo "Deployment complete!" 