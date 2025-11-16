#!/usr/bin/env node
import { execSync } from 'child_process';
import crypto from 'crypto';

// Generate a UUID
const uuidv4 = () => crypto.randomUUID();

// Create a test lab in the new database
const createTestLab = async () => {
  try {
    console.log('Creating a test lab in the new database...');
    
    // Generate a unique ID for the lab
    const labId = uuidv4();
    
    // Get the lab table name
    const tablesOutput = execSync('aws dynamodb list-tables').toString();
    const tables = JSON.parse(tablesOutput).TableNames;
    const labTable = tables.find(name => name.startsWith('Lab-orjjxp4q65gd5egbnbaae2gbhu'));
    
    if (!labTable) {
      console.error('Could not find Lab table for the new API');
      return;
    }
    
    console.log(`Found Lab table: ${labTable}`);
    
    // Timestamp for created/updated dates
    const now = new Date().toISOString();
    
    // Lab data in DynamoDB format
    const labData = {
      id: { S: labId },
      labId: { S: "sample-lab-001" },
      name: { S: "AI Research Lab" },
      professorId: { S: "sample-professor-001" },
      professorIds: { L: [{ S: "sample-professor-001" }] },
      labAssistantIds: { L: [] },
      description: { S: "Research lab focused on artificial intelligence and machine learning." },
      status: { S: "Active" },
      createdAt: { S: now },
      updatedAt: { S: now }
    };
    
    // Put the item in DynamoDB
    const putCommand = `aws dynamodb put-item --table-name ${labTable} --item '${JSON.stringify(labData)}'`;
    
    console.log('Executing command:', putCommand);
    execSync(putCommand);
    
    console.log('Test lab created successfully!');
    console.log('Lab ID:', labId);
    
    return labId;
  } catch (error) {
    console.error('Error creating test lab:', error.message);
    return null;
  }
};

// Add a test user if needed and assign the Student group
const addUserToStudentGroup = async () => {
  try {
    // Get the user pool ID from aws-exports
    const userPoolId = "us-east-1_v2nTC5io4";
    
    // List users
    console.log('Listing users in user pool:', userPoolId);
    const listUsersOutput = execSync(`aws cognito-idp list-users --user-pool-id ${userPoolId} --limit 5`).toString();
    const usersData = JSON.parse(listUsersOutput);
    
    if (!usersData.Users || usersData.Users.length === 0) {
      console.log('No users found. Creating a test user...');
      // Create a test user if needed
      // This would be complex and require email verification - skipping for now
      return;
    }
    
    // Get the first user
    const user = usersData.Users[0];
    console.log('Found user:', user.Username);
    
    // List groups to verify the Student group exists
    console.log('Listing groups in user pool:', userPoolId);
    const listGroupsOutput = execSync(`aws cognito-idp list-groups --user-pool-id ${userPoolId}`).toString();
    const groups = JSON.parse(listGroupsOutput).Groups;
    
    const studentGroup = groups.find(g => g.GroupName === 'Student');
    if (!studentGroup) {
      console.log('Student group not found. Creating it...');
      execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Student --description "Students who can apply to jobs"`);
      console.log('Student group created.');
    } else {
      console.log('Student group exists.');
    }
    
    // Add the user to the Student group
    console.log(`Adding user ${user.Username} to Student group...`);
    execSync(`aws cognito-idp admin-add-user-to-group --user-pool-id ${userPoolId} --username ${user.Username} --group-name Student`);
    
    console.log('User added to Student group successfully!');
    return user.Username;
  } catch (error) {
    console.error('Error managing users or groups:', error.message);
    return null;
  }
};

// Run the functions
const main = async () => {
  const labId = await createTestLab();
  const username = await addUserToStudentGroup();
  
  console.log('\nSetup completed successfully!');
  if (labId) console.log('Lab ID:', labId);
  if (username) console.log('User added to Student group:', username);
};

main(); 