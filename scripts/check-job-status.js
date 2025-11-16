#!/usr/bin/env node
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Job Status Checker & Fixer');
console.log('=========================');
console.log('This script will check job statuses in DynamoDB and update them to "OPEN" if needed.');

// List DynamoDB tables to find the Job table
const findJobTable = () => {
  try {
    console.log('\nListing DynamoDB tables...');
    const tablesOutput = execSync('aws dynamodb list-tables').toString();
    const tables = JSON.parse(tablesOutput).TableNames;
    
    const jobTables = tables.filter(name => name.startsWith('Job-'));
    
    if (jobTables.length === 0) {
      console.log('No Job tables found. Please check your AWS region and credentials.');
      return null;
    }
    
    console.log(`Found ${jobTables.length} Job table(s):`);
    jobTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });
    
    return jobTables;
  } catch (error) {
    console.error('Error listing tables:', error.message);
    return null;
  }
};

// Scan the Job table for all jobs
const scanJobs = (tableName) => {
  try {
    console.log(`\nScanning jobs in table ${tableName}...`);
    const jobsOutput = execSync(`aws dynamodb scan --table-name ${tableName}`).toString();
    const jobs = JSON.parse(jobsOutput).Items;
    
    if (!jobs || jobs.length === 0) {
      console.log('No jobs found in this table.');
      return [];
    }
    
    const parsedJobs = jobs.map(job => {
      const parsed = {};
      
      // Parse each attribute from DynamoDB format
      Object.keys(job).forEach(key => {
        const valueObj = job[key];
        const firstType = Object.keys(valueObj)[0]; // S, N, BOOL, etc.
        parsed[key] = valueObj[firstType];
      });
      
      return parsed;
    });
    
    return parsedJobs;
  } catch (error) {
    console.error(`Error scanning jobs: ${error.message}`);
    return [];
  }
};

// Display jobs with their status
const displayJobs = (jobs) => {
  console.log(`\nFound ${jobs.length} jobs:`);
  jobs.forEach((job, index) => {
    const status = job.status || 'UNKNOWN';
    const statusColor = status === 'OPEN' ? '\x1b[32m' : (status === 'CLOSED' ? '\x1b[31m' : '\x1b[33m');
    const resetColor = '\x1b[0m';
    
    console.log(`${index + 1}. ${job.title || 'Untitled'}`);
    console.log(`   ID: ${job.id}`);
    console.log(`   Status: ${statusColor}${status}${resetColor}`);
    if (job.labId) console.log(`   Lab ID: ${job.labId}`);
    console.log(`   Created At: ${job.createdAt || 'Unknown'}`);
    console.log('');
  });
  
  return jobs;
};

// Update job status to "OPEN"
const updateJobStatus = (tableName, jobId, currentStatus) => {
  try {
    console.log(`\nUpdating job ${jobId} status from "${currentStatus}" to "OPEN"...`);
    
    const updateCmd = `aws dynamodb update-item \
      --table-name ${tableName} \
      --key '{"id":{"S":"${jobId}"}}' \
      --update-expression "SET #s = :val" \
      --expression-attribute-names '{"#s":"status"}' \
      --expression-attribute-values '{":val":{"S":"OPEN"}}' \
      --return-values ALL_NEW`;
    
    const updateOutput = execSync(updateCmd).toString();
    const result = JSON.parse(updateOutput);
    
    console.log('\nJob updated successfully!');
    console.log(`New status: ${result.Attributes.status.S}`);
    
    return true;
  } catch (error) {
    console.error(`Error updating job: ${error.message}`);
    return false;
  }
};

// Main function
const main = async () => {
  // Find Job tables
  const jobTables = findJobTable();
  if (!jobTables || jobTables.length === 0) {
    rl.close();
    return;
  }
  
  let selectedTable;
  
  if (jobTables.length === 1) {
    selectedTable = jobTables[0];
    console.log(`\nSelected table: ${selectedTable}`);
  } else {
    const selectTable = () => {
      return new Promise(resolve => {
        rl.question('\nEnter the number of the table to use: ', (answer) => {
          const index = parseInt(answer) - 1;
          if (index >= 0 && index < jobTables.length) {
            resolve(jobTables[index]);
          } else {
            console.log('Invalid selection. Please try again.');
            selectTable().then(resolve);
          }
        });
      });
    };
    
    selectedTable = await selectTable();
    console.log(`Selected table: ${selectedTable}`);
  }
  
  // Scan for jobs
  const jobs = scanJobs(selectedTable);
  if (jobs.length === 0) {
    rl.close();
    return;
  }
  
  // Display jobs
  displayJobs(jobs);
  
  // Ask which job to update
  const askJobToUpdate = () => {
    return new Promise(resolve => {
      rl.question('\nEnter the number of the job to update (or "all" to update all jobs to OPEN): ', answer => {
        if (answer.toLowerCase() === 'all') {
          resolve({ updateAll: true });
        } else {
          const index = parseInt(answer) - 1;
          if (index >= 0 && index < jobs.length) {
            resolve({ index, updateAll: false });
          } else {
            console.log('Invalid selection. Please try again.');
            askJobToUpdate().then(resolve);
          }
        }
      });
    });
  };
  
  const { index, updateAll } = await askJobToUpdate();
  
  if (updateAll) {
    const nonOpenJobs = jobs.filter(job => job.status !== 'OPEN');
    
    if (nonOpenJobs.length === 0) {
      console.log('\nAll jobs are already marked as OPEN.');
    } else {
      console.log(`\nUpdating ${nonOpenJobs.length} jobs to OPEN status...`);
      
      for (const job of nonOpenJobs) {
        await updateJobStatus(selectedTable, job.id, job.status || 'UNKNOWN');
      }
      
      console.log('\nAll jobs have been updated to OPEN status.');
    }
  } else {
    const selectedJob = jobs[index];
    
    if (selectedJob.status === 'OPEN') {
      console.log('\nThis job is already marked as OPEN.');
      rl.question('\nWould you like to select another job? (y/n): ', answer => {
        if (answer.toLowerCase() === 'y') {
          askJobToUpdate().then(({ index }) => {
            if (index !== undefined) {
              updateJobStatus(selectedTable, jobs[index].id, jobs[index].status || 'UNKNOWN');
            }
            rl.close();
          });
        } else {
          rl.close();
        }
      });
    } else {
      await updateJobStatus(selectedTable, selectedJob.id, selectedJob.status || 'UNKNOWN');
      rl.close();
    }
  }
};

main(); 