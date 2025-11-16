#!/bin/bash

# This script updates the frontend with the latest backend schema

echo "Updating frontend with latest backend schema..."

# Check if the sandbox is running
if ! pgrep -f "ampx sandbox" > /dev/null; then
  echo "Amplify sandbox is not running. Starting it..."
  npx ampx sandbox &
  SANDBOX_PID=$!
  
  # Wait for the sandbox to start
  echo "Waiting for sandbox to start..."
  sleep 10
else
  echo "Amplify sandbox is already running."
  SANDBOX_PID=""
fi

# Generate TypeScript types for the frontend
echo "Generating TypeScript types..."
npx ampx generate types --output ../mascle/src/types/api.ts

# Copy the aws-exports.ts file to the frontend
if [ -f ".amplify/artifacts/aws-exports.ts" ]; then
  echo "Copying aws-exports.ts to frontend..."
  cp ".amplify/artifacts/aws-exports.ts" "../mascle/src/config/aws-exports.ts"
  echo "Done!"
else
  echo "Error: aws-exports.ts not found."
  echo "Make sure the sandbox is running and try again."
  
  # Kill the sandbox if we started it
  if [ ! -z "$SANDBOX_PID" ]; then
    echo "Stopping the sandbox..."
    kill $SANDBOX_PID
  fi
  
  exit 1
fi

echo "Frontend updated successfully!"

# If we started the sandbox, ask if we should stop it
if [ ! -z "$SANDBOX_PID" ]; then
  read -p "Do you want to stop the sandbox now? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Stopping the sandbox..."
    kill $SANDBOX_PID
    echo "Sandbox stopped."
  else
    echo "Sandbox is still running (PID: $SANDBOX_PID)."
    echo "Remember to stop it when you're done."
  fi
fi 