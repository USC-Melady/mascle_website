#!/usr/bin/env node
import { execSync } from 'child_process';
import crypto from 'crypto';

// Generate a UUID
const uuidv4 = () => crypto.randomUUID();

// Create a test job in the DynamoDB table
const createTestJob = async () => {
  try {
    console.log('Creating a test job in the new database...');
    
    // Generate a unique ID for the job
    const jobId = uuidv4();
    
    // Get the job table name
    const tablesOutput = execSync('aws dynamodb list-tables').toString();
    const tables = JSON.parse(tablesOutput).TableNames;
    const jobTable = tables.find(name => name.startsWith('Job-orjjxp4q65gd5egbnbaae2gbhu'));
    
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

// Create the job
createTestJob(); 