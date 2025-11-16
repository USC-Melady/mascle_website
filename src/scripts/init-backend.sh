#!/bin/bash

# This script initializes the backend and copies the aws-exports.ts file to the frontend

echo "Starting Amplify backend initialization..."

# Start the sandbox in the background
npx ampx sandbox &
SANDBOX_PID=$!

# Wait for the aws-exports.ts file to be generated
echo "Waiting for aws-exports.ts to be generated..."
MAX_ATTEMPTS=30
ATTEMPT=0

while [ ! -f ".amplify/artifacts/aws-exports.ts" ] && [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  sleep 2
  ATTEMPT=$((ATTEMPT+1))
  echo "Waiting... ($ATTEMPT/$MAX_ATTEMPTS)"
done

# Check if the file was generated
if [ -f ".amplify/artifacts/aws-exports.ts" ]; then
  echo "aws-exports.ts generated successfully!"
  
  # Copy the file to the frontend
  echo "Copying aws-exports.ts to frontend..."
  cp ".amplify/artifacts/aws-exports.ts" "../mascle/src/config/aws-exports.ts"
  echo "Done!"
  
  echo "Backend initialized and connected to frontend successfully!"
  echo "The sandbox is still running in the background (PID: $SANDBOX_PID)."
  echo "Press Ctrl+C to stop it when you're done."
else
  echo "Error: aws-exports.ts was not generated within the timeout period."
  echo "Stopping the sandbox..."
  kill $SANDBOX_PID
  exit 1
fi

# Wait for the sandbox process to complete
wait $SANDBOX_PID 