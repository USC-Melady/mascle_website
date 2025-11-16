#!/bin/bash

# This script cleans up old Amplify backend files from the frontend

echo "Cleaning up old Amplify backend files from the frontend..."

# Navigate to the frontend directory
cd ../mascle

# Run the cleanup script in the frontend
if [ -f "cleanup-frontend.sh" ]; then
  echo "Running cleanup script in the frontend..."
  ./cleanup-frontend.sh
else
  echo "Error: cleanup-frontend.sh not found in the frontend directory."
  echo "Creating the script..."
  
  # Create the cleanup script in the frontend
  cat > cleanup-frontend.sh << 'EOF'
#!/bin/bash

# This script cleans up old Amplify backend files from the frontend

echo "Cleaning up old Amplify backend files from the frontend..."

# Remove the amplify directory
if [ -d "amplify" ]; then
  echo "Removing amplify directory..."
  rm -rf amplify
fi

# Remove the .amplify directory
if [ -d ".amplify" ]; then
  echo "Removing .amplify directory..."
  rm -rf .amplify
fi

# Remove any old aws-exports files (not the one in src/config)
if [ -f "src/aws-exports.js" ]; then
  echo "Removing src/aws-exports.js..."
  rm src/aws-exports.js
fi

if [ -f "src/aws-exports.ts" ]; then
  echo "Removing src/aws-exports.ts..."
  rm src/aws-exports.ts
fi

# Remove amplify-related files in the root directory
if [ -f "amplify.ts" ]; then
  echo "Removing amplify.ts..."
  rm amplify.ts
fi

if [ -f "amplify_outputs.json" ]; then
  echo "Removing amplify_outputs.json..."
  rm amplify_outputs.json
fi

# Check for any remaining Amplify-related files
echo "Checking for any remaining Amplify-related files..."
find . -name "*amplify*" -not -path "./src/config/*" -not -path "./node_modules/*" -not -path "./cleanup-frontend.sh"

echo "Cleanup complete!"
EOF
  
  # Make the script executable
  chmod +x cleanup-frontend.sh
  
  # Run the script
  ./cleanup-frontend.sh
fi

echo "Frontend cleanup complete!" 