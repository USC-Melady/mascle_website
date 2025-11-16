#!/usr/bin/env node

/**
 * This script configures CORS for the S3 bucket used by the application
 * to allow access from the local development server and other origins.
 * 
 * Run with: node scripts/configure-s3-cors.js
 */

import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get bucket name from configuration
const getBucketNameFromConfig = () => {
  try {
    const configPath = path.join(__dirname, '..', 'src', 'config', 'aws-exports.ts');
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    const bucketMatch = configContent.match(/bucket: ['"]([^'"]+)['"]/);
    if (bucketMatch && bucketMatch[1]) {
      return bucketMatch[1];
    }
    
    throw new Error('Bucket name not found in aws-exports.ts');
  } catch (error) {
    console.error('Error getting bucket name:', error.message);
    return null;
  }
};

// Create CORS configuration file
const createCorsConfigFile = () => {
  const corsConfig = {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
        AllowedOrigins: [
          "http://localhost:5173",   // Vite dev server
          "http://localhost:3000",   // Alternative dev port
          "https://*.amplifyapp.com", // Amplify deployments
          "https://*.mascle.app"    // Production domain
        ],
        ExposeHeaders: [],
        MaxAgeSeconds: 3000
      }
    ]
  };
  
  const corsConfigPath = path.join(__dirname, 'cors-config.json');
  fs.writeFileSync(corsConfigPath, JSON.stringify(corsConfig, null, 2));
  
  return corsConfigPath;
};

// Apply CORS configuration to bucket
const configureBucketCors = (bucketName, configPath) => {
  const command = `aws s3api put-bucket-cors --bucket ${bucketName} --cors-configuration file://${configPath}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error configuring CORS: ${error.message}`);
      console.error(stderr);
      return;
    }
    
    console.log(`Successfully configured CORS for bucket: ${bucketName}`);
    console.log(`CORS configuration allows access from: localhost:5173, localhost:3000, *.amplifyapp.com, and *.mascle.app`);
    
    // Clean up the temporary config file
    fs.unlinkSync(configPath);
  });
};

// Main function
const main = () => {
  // Get bucket name from config
  const bucketName = getBucketNameFromConfig();
  if (!bucketName) {
    console.error('Could not determine bucket name. Please check your aws-exports.ts file.');
    process.exit(1);
  }
  
  console.log(`Configuring CORS for bucket: ${bucketName}`);
  
  // Create CORS config file
  const corsConfigPath = createCorsConfigFile();
  
  // Apply CORS configuration
  configureBucketCors(bucketName, corsConfigPath);
};

// Run the script
main(); 