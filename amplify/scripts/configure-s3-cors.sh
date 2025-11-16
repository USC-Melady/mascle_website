#!/bin/bash

# Replace this with your S3 bucket name
S3_BUCKET="amplify-mascle-alaba-sand-amplifydataamplifycodege-rmtqu2x4u31t"

# CORS configuration
CORS_CONFIG='{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3000
    }
  ]
}'

# Save CORS configuration to a file
echo "$CORS_CONFIG" > cors.json

# Apply the CORS configuration to the bucket
aws s3api put-bucket-cors --bucket $S3_BUCKET --cors-configuration file://cors.json

# Clean up
rm cors.json

echo "S3 CORS configuration has been applied to bucket: $S3_BUCKET" 