#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying Public Jobs Feature${NC}"

# Step 1: Deploy the backend changes (API Gateway and Lambda function)
echo -e "${GREEN}Step 1: Deploying backend changes${NC}"
cd amplify
npx ampx sandbox push
cd ..

# Step 2: Build the frontend
echo -e "${GREEN}Step 2: Building frontend${NC}"
npm run build

# Step 3: Deploy the frontend to Amplify hosting
echo -e "${GREEN}Step 3: Deploying frontend to Amplify hosting${NC}"
npx ampx publish

echo -e "${GREEN}Deployment complete!${NC}"
echo "Your public jobs page should now be accessible at: https://[your-amplify-domain]/jobs/public"
echo "The API endpoint is available at: https://[your-api-gateway-url]/dev/public-jobs" 