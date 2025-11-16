#!/bin/bash

# Script to deploy the Lambda function to the Amplify sandbox environment

echo "Installing dependencies for the Lambda function..."
cd amplify/functions/postConfirmation
npm install
cd ../../..

echo "Deploying to Amplify sandbox..."
npx amplify sandbox push

echo "Deployment complete!"
echo "Check the AWS Console to verify the Lambda function is connected to the Cognito User Pool."
echo ""
echo "IMPORTANT: You need to manually connect the Lambda function to Cognito:"
echo "1. Go to the AWS Console > Cognito > User Pools > us-east-1_SuvBN0Bnc"
echo "2. Go to User Pool Properties > Lambda triggers"
echo "3. Add a Post confirmation trigger and select the postConfirmation Lambda function"
echo ""
echo "For detailed instructions, see the connect-lambda-to-cognito.md file." 