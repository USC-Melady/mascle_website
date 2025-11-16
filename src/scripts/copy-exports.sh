#!/bin/bash

# This script copies the aws-exports.ts file from the backend to the frontend

# Path to the backend aws-exports.ts file
BACKEND_EXPORTS=".amplify/artifacts/aws-exports.ts"

# Path to the frontend aws-exports.ts file
FRONTEND_EXPORTS="../mascle/src/config/aws-exports.ts"

# Check if the backend aws-exports.ts file exists
if [ -f "$BACKEND_EXPORTS" ]; then
  echo "Copying aws-exports.ts from backend to frontend..."
  cp "$BACKEND_EXPORTS" "$FRONTEND_EXPORTS"
  echo "Done!"
else
  echo "Error: Backend aws-exports.ts file not found at $BACKEND_EXPORTS"
  echo "Make sure you've run 'npm run dev' to generate the file first."
  exit 1
fi 