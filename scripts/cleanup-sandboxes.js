#!/usr/bin/env node
import { execSync } from 'child_process';

// List and delete all Amplify sandbox stacks
const cleanupSandboxes = () => {
  try {
    console.log('Listing CloudFormation stacks...');
    
    // List stacks related to mascle project
    const stacksOutput = execSync(
      'aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE | grep amplify-mascle-alaba'
    ).toString();
    
    // Extract the stack names
    const stackNames = stacksOutput
      .split('\n')
      .filter(line => line.includes('"StackName":'))
      .map(line => {
        // Extract the stack name from the JSON line
        const match = line.match(/"StackName": "([^"]+)"/);
        return match ? match[1] : null;
      })
      .filter(Boolean); // Remove nulls
    
    // Find root stacks (parents without a parent)
    const rootStacks = stackNames
      .filter(name => !name.includes('-apistack') && !name.includes('-data'))
      .filter(name => {
        // Only get stacks with these patterns
        return name === 'amplify-mascle-alaba-sandbox-2814070a21' || 
               name === 'amplify-mascle-alaba245c8b7f-sandbox-dd71fc3c6c';
      });
    
    if (rootStacks.length === 0) {
      console.log('No Amplify sandbox stacks found.');
      return;
    }
    
    console.log(`Found ${rootStacks.length} Amplify sandbox stacks:`);
    rootStacks.forEach(stack => console.log(`- ${stack}`));
    
    // Delete each stack
    for (const stack of rootStacks) {
      console.log(`\nDeleting stack: ${stack}`);
      try {
        execSync(`aws cloudformation delete-stack --stack-name ${stack}`);
        console.log(`Initiated deletion of stack: ${stack}`);
        console.log('This will take several minutes to complete...');
      } catch (deleteError) {
        console.error(`Error deleting stack ${stack}:`, deleteError.message);
      }
    }
    
    console.log('\nStack deletion initiated for all sandboxes.');
    console.log('Check the AWS CloudFormation console to monitor deletion progress.');
    console.log('After deletion completes, you can deploy a fresh sandbox with:');
    console.log('  npx ampx sandbox');
    
  } catch (error) {
    console.error('Error cleaning up sandboxes:', error.message);
  }
};

// Run the cleanup
cleanupSandboxes(); 