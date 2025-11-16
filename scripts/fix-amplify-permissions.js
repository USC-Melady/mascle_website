#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec, execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Amplify Deployment Permissions Fixer');
console.log('===================================');
console.log('This script will help you fix AWS AppSync permissions for Amplify deployment');

// Check if AWS CLI is installed
const checkAwsCli = () => {
  try {
    execSync('aws --version');
    return true;
  } catch (error) {
    console.error('AWS CLI is not installed or not in PATH.');
    console.log('Please install AWS CLI: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
    return false;
  }
};

// Get the current AWS user name
const getCurrentUser = () => {
  try {
    const userOutput = execSync('aws sts get-caller-identity').toString();
    const userData = JSON.parse(userOutput);
    
    console.log('\nCurrent AWS Identity:');
    console.log(`Account ID: ${userData.Account}`);
    console.log(`User ARN: ${userData.Arn}`);
    
    // Extract username from ARN
    const userArn = userData.Arn;
    const userMatch = userArn.match(/user\/(.*?)$/);
    return userMatch ? userMatch[1] : null;
  } catch (error) {
    console.error('Error getting current AWS user:', error.message);
    console.log('Please make sure you have valid AWS credentials configured.');
    return null;
  }
};

// Create policy file if it doesn't exist
const ensurePolicyFile = () => {
  const policyFilePath = path.join(__dirname, 'aws-amplify-permissions.json');
  
  if (!fs.existsSync(policyFilePath)) {
    console.log('\nPolicy file not found, creating one...');
    
    const policy = {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "appsync:StartSchemaCreation",
            "appsync:GetSchemaCreationStatus",
            "appsync:GetIntrospectionSchema",
            "appsync:ListFunctions",
            "appsync:CreateFunction",
            "appsync:UpdateFunction",
            "appsync:DeleteFunction",
            "appsync:CreateResolver",
            "appsync:UpdateResolver",
            "appsync:DeleteResolver",
            "appsync:GetResolver",
            "appsync:ListResolvers",
            "appsync:CreateApiKey",
            "appsync:UpdateApiKey",
            "appsync:DeleteApiKey",
            "appsync:CreateType",
            "appsync:DeleteType",
            "appsync:UpdateType",
            "appsync:StartSchemaCreation",
            "appsync:GetSchemaCreationStatus",
            "appsync:GetIntrospectionSchema"
          ],
          "Resource": [
            "arn:aws:appsync:*:*:apis/*"
          ]
        }
      ]
    };
    
    fs.writeFileSync(policyFilePath, JSON.stringify(policy, null, 2));
  }
  
  console.log(`Policy file located at: ${policyFilePath}`);
  return policyFilePath;
};

// Create and attach the policy
const createAndAttachPolicy = (username, policyFilePath, appId) => {
  try {
    // Create a unique policy name
    const policyName = `AmplifyAppsync-${username}-${Date.now()}`;
    
    // Read policy file
    const policyDocument = fs.readFileSync(policyFilePath, 'utf8');
    
    // If an AppSync ID is provided, update the resource to be more specific
    let updatedPolicy = policyDocument;
    if (appId) {
      const policy = JSON.parse(policyDocument);
      policy.Statement[0].Resource = [`arn:aws:appsync:*:*:apis/${appId}`];
      updatedPolicy = JSON.stringify(policy);
    }
    
    console.log(`\nCreating policy "${policyName}"...`);
    
    // Create the policy
    const createCmd = `aws iam create-policy --policy-name ${policyName} --policy-document '${updatedPolicy}'`;
    const createOutput = execSync(createCmd).toString();
    const policyData = JSON.parse(createOutput);
    const policyArn = policyData.Policy.Arn;
    
    console.log(`Policy created with ARN: ${policyArn}`);
    
    // Attach the policy to the user
    console.log(`\nAttaching policy to user ${username}...`);
    const attachCmd = `aws iam attach-user-policy --user-name ${username} --policy-arn ${policyArn}`;
    execSync(attachCmd);
    
    console.log('\nPolicy successfully attached!');
    console.log('\nYou should now have the necessary permissions to deploy Amplify with AppSync resources.');
    console.log('Please try running your Amplify deployment command again.');
    
    return true;
  } catch (error) {
    console.error('Error creating or attaching policy:', error.message);
    return false;
  }
};

// Extract AppSync IDs from error message
const extractAppSyncId = (errorMsg) => {
  const arnMatch = errorMsg.match(/arn:aws:appsync:[^:]+:[^:]+:\/v1\/apis\/([^\/]+)/);
  return arnMatch ? arnMatch[1] : null;
};

// Main function
const main = async () => {
  // Check if AWS CLI is installed
  if (!checkAwsCli()) {
    rl.close();
    return;
  }
  
  // Get current AWS user
  const username = getCurrentUser();
  if (!username) {
    rl.close();
    return;
  }
  
  // Ask for the AppSync ID if available
  const askForAppSyncId = () => {
    return new Promise(resolve => {
      rl.question('\nIf you have an AppSync API ID from the error message, enter it (or press Enter to skip): ', answer => {
        resolve(answer.trim() || null);
      });
    });
  };
  
  const appId = await askForAppSyncId();
  
  // Create policy file
  const policyFilePath = ensurePolicyFile();
  
  // Ask to proceed
  rl.question('\nProceed with creating and attaching the policy? (y/n): ', answer => {
    if (answer.toLowerCase() === 'y') {
      createAndAttachPolicy(username, policyFilePath, appId);
    } else {
      console.log('Operation canceled.');
    }
    rl.close();
  });
};

main(); 