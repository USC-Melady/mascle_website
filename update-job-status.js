#!/usr/bin/env node
import { execSync } from 'child_process';

console.log('Updating job statuses to OPEN (uppercase)...');

// Get all job IDs
const getJobs = () => {
  try {
    const output = execSync('aws dynamodb scan --table-name Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE --projection-expression "#id, #st" --expression-attribute-names \'{"#id":"id", "#st":"status"}\'').toString();
    const result = JSON.parse(output);
    return result.Items.map(item => ({
      id: item.id.S,
      status: item.status?.S || 'unknown'
    }));
  } catch (error) {
    console.error('Error scanning jobs:', error.message);
    return [];
  }
};

// Update job status to OPEN
const updateJobStatus = (jobId) => {
  try {
    const command = `aws dynamodb update-item --table-name Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE --key '{"id":{"S":"${jobId}"}}' --update-expression "SET #st = :val" --expression-attribute-names '{"#st":"status"}' --expression-attribute-values '{":val":{"S":"OPEN"}}'`;
    
    console.log(`Updating job ${jobId} status to OPEN...`);
    execSync(command);
    return true;
  } catch (error) {
    console.error(`Error updating job ${jobId}:`, error.message);
    return false;
  }
};

// Main function
const main = async () => {
  // Get all jobs
  const jobs = getJobs();
  console.log(`Found ${jobs.length} jobs.`);
  
  // Filter jobs that don't have correct status
  const jobsToUpdate = jobs.filter(job => job.status !== 'OPEN');
  
  if (jobsToUpdate.length === 0) {
    console.log('All jobs already have the correct OPEN status.');
    return;
  }
  
  console.log(`Updating ${jobsToUpdate.length} jobs to OPEN status...`);
  
  // Update each job
  let successCount = 0;
  for (const job of jobsToUpdate) {
    const success = updateJobStatus(job.id);
    if (success) successCount++;
  }
  
  console.log(`Done! Updated ${successCount} out of ${jobsToUpdate.length} jobs.`);
  console.log('You should now be able to apply to these jobs.');
};

main(); 