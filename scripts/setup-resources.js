#!/usr/bin/env node
import { execSync } from 'child_process';
import crypto from 'crypto';

// Generate a UUID
const uuidv4 = () => crypto.randomUUID();

// Create a test job with correct OPEN status
const createTestJob = async () => {
  try {
    console.log('Creating a test job in the new database...');
    
    // Generate a unique ID for the job
    const jobId = uuidv4();
    
    // Get the job table name
    const tablesOutput = execSync('aws dynamodb list-tables').toString();
    const tables = JSON.parse(tablesOutput).TableNames;
    const jobTable = tables.find(name => name.startsWith('Job-3izs4njl3bfj5m7mmysz2zbwz4'));
    
    if (!jobTable) {
      console.error('Could not find Job table for the new API');
      return;
    }
    
    console.log(`Found Job table: ${jobTable}`);
    
    // Timestamp for created/updated dates
    const now = new Date().toISOString();
    
    // Job data in DynamoDB format
    const jobData = {
      id: { S: jobId },
      jobId: { S: jobId },
      title: { S: "Research Assistant - Machine Learning" },
      description: { S: "Help with a machine learning research project. Tasks include data preprocessing, model training, and result analysis." },
      labId: { S: "sample-lab-001" },
      professorId: { S: "sample-professor-001" },
      requirements: { S: "Python, TensorFlow, and data science experience required." },
      status: { S: "OPEN" }, // This is important - uppercase "OPEN"
      createdAt: { S: now },
      updatedAt: { S: now }
    };
    
    // Put the item in DynamoDB
    const putCommand = `aws dynamodb put-item --table-name ${jobTable} --item '${JSON.stringify(jobData)}'`;
    
    console.log('Executing command:', putCommand);
    execSync(putCommand);
    
    console.log('Test job created successfully!');
    console.log('Job ID:', jobId);
    console.log('Job Status: OPEN');
    
    return jobId;
  } catch (error) {
    console.error('Error creating test job:', error.message);
    return null;
  }
};

// Create a test lab in the new database
const createTestLab = async () => {
  try {
    console.log('Creating a test lab in the new database...');
    
    // Generate a unique ID for the lab
    const labId = uuidv4();
    
    // Get the lab table name
    const tablesOutput = execSync('aws dynamodb list-tables').toString();
    const tables = JSON.parse(tablesOutput).TableNames;
    const labTable = tables.find(name => name.startsWith('Lab-3izs4njl3bfj5m7mmysz2zbwz4'));
    
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

// Add a Student group in Cognito
const setupStudentGroup = async () => {
  try {
    // Get the user pool ID from aws-exports
    const userPoolId = "us-east-1_30fproRll";
    
    console.log('Working with user pool:', userPoolId);
    
    // List groups to verify the Student group exists
    console.log('Listing groups in user pool:', userPoolId);
    
    try {
      const listGroupsOutput = execSync(`aws cognito-idp list-groups --user-pool-id ${userPoolId}`).toString();
      const groups = JSON.parse(listGroupsOutput).Groups;
      
      const studentGroup = groups.find(g => g.GroupName === 'Student');
      if (!studentGroup) {
        console.log('Student group not found. Creating it...');
        execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Student --description "Students who can apply to jobs" --precedence 3`);
        console.log('Student group created.');
      } else {
        console.log('Student group exists.');
      }
    } catch (error) {
      console.log('Error checking groups, creating Student group...');
      execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Student --description "Students who can apply to jobs" --precedence 3`);
      console.log('Student group created.');
    }
    
    // Create other required groups if needed
    try {
      execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Professor --description "Professors who can create labs and jobs" --precedence 1`);
      console.log('Professor group created.');
    } catch (error) {
      console.log('Professor group already exists or error creating it');
    }
    
    try {
      execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name Admin --description "Administrators with full access" --precedence 0`);
      console.log('Admin group created.');
    } catch (error) {
      console.log('Admin group already exists or error creating it');
    }
    
    try {
      execSync(`aws cognito-idp create-group --user-pool-id ${userPoolId} --group-name LabAssistant --description "Lab assistants who can help manage labs" --precedence 2`);
      console.log('LabAssistant group created.');
    } catch (error) {
      console.log('LabAssistant group already exists or error creating it');
    }
    
    console.log('All groups are set up!');
    return true;
  } catch (error) {
    console.error('Error setting up Cognito groups:', error.message);
    return false;
  }
};

// Run the functions
const main = async () => {
  const jobId = await createTestJob();
  const labId = await createTestLab();
  const groupsSetup = await setupStudentGroup();
  
  console.log('\nSetup completed successfully!');
  if (jobId) console.log('Job ID:', jobId);
  if (labId) console.log('Lab ID:', labId);
  if (groupsSetup) console.log('Cognito groups set up successfully');
  
  console.log('\nYou should now be able to:');
  console.log('1. Register a new user');
  console.log('2. Log in with the new user');
  console.log('3. Apply for the job');
};

main(); 