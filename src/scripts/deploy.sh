#!/bin/bash

# This script deploys the backend to AWS and copies the configuration to the frontend

echo "Deploying Amplify backend to AWS..."

# Deploy the backend
npx ampx deploy

# Check if the deployment was successful
if [ $? -eq 0 ]; then
  echo "Deployment successful!"
  
  # Copy the aws-exports.ts file to the frontend
  if [ -f ".amplify/artifacts/aws-exports.ts" ]; then
    echo "Copying aws-exports.ts to frontend..."
    cp ".amplify/artifacts/aws-exports.ts" "../mascle/src/config/aws-exports.ts"
    echo "Done!"
    
    echo "Backend deployed and connected to frontend successfully!"
  else
    echo "Error: aws-exports.ts not found after deployment."
    echo "You may need to run 'npm run copy-exports' manually after the deployment completes."
    exit 1
  fi
else
  echo "Deployment failed. Please check the error messages above."
  exit 1
fi 