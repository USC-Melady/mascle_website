#!/bin/bash

# Table names
JOB_TABLE="Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE"
LAB_TABLE=$(aws dynamodb list-tables --output text --query "TableNames[?starts_with(@, 'Lab-')]" | head -n1)

# Check if LAB_TABLE was found
if [ -z "$LAB_TABLE" ]; then
  echo "ERROR: Could not find Lab table!"
  exit 1
fi

echo "===== JOB DATABASE DEBUG TOOL FOR ADMINS ====="
echo ""
echo "Using job table: $JOB_TABLE"
echo "Using lab table: $LAB_TABLE"
echo ""

# Get all items from the job table
echo "Fetching all jobs..."
job_result=$(aws dynamodb scan \
  --table-name $JOB_TABLE \
  --output json)

total_jobs=$(echo $job_result | jq -r '.Count')
echo "Found $total_jobs jobs"

# Get all items from the lab table
echo "Fetching all labs..."
lab_result=$(aws dynamodb scan \
  --table-name $LAB_TABLE \
  --output json)

total_labs=$(echo $lab_result | jq -r '.Count')
echo "Found $total_labs labs"

echo ""
echo "===== LAB DETAILS ====="
echo ""

echo $lab_result | jq -r '.Items[] | {
  id: (.id.S // "<No ID>"),
  labId: (.labId.S // "<No labId>"),
  name: (.name.S // "<No Name>"),
  professorId: (.professorId.S // "<No Professor ID>"),
  professorIds: (.professorIds.L // [])
}'

echo ""
echo "===== JOB DETAILS WITH LAB VALIDATION ====="
echo ""

echo $job_result | jq -r '.Items[] | {
  jobId: (.id.S // .jobId.S // "<No ID>"),
  title: (.title.S // "<No Title>"),
  labId: (.labId.S // "<No Lab ID>"),
  professorId: (.professorId.S // "<No Professor ID>"),
  createdBy: (.createdBy.S // "<Not specified>"),
  status: (.status.S // "<No Status>")
}' > /tmp/job_details.json

# For each job, check if lab exists
cat /tmp/job_details.json | jq -c '.' | while read -r job; do
  job_id=$(echo $job | jq -r '.jobId')
  job_title=$(echo $job | jq -r '.title')
  lab_id=$(echo $job | jq -r '.labId')
  
  # Check if this lab exists in the labs table
  lab_exists=$(echo $lab_result | jq -r --arg labid "$lab_id" '.Items[] | select(.id.S == $labid or .labId.S == $labid) | .name.S')
  
  if [ -n "$lab_exists" ]; then
    echo "✅ Job: $job_title (ID: $job_id) - Lab: $lab_exists (ID: $lab_id)"
  else
    echo "❌ Job: $job_title (ID: $job_id) - Lab with ID $lab_id NOT FOUND!"
  fi
done

echo ""
echo "===== COMPLETE DATABASE EXPORT ====="
echo ""
echo "Job table data:"
echo $job_result | jq '.'
echo ""
echo "Lab table data:"
echo $lab_result | jq '.'
echo ""
echo "This information should help debugging job access issues." 