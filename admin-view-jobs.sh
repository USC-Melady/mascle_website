#!/bin/bash

# Table name for jobs
JOB_TABLE="Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE"

echo "Directly fetching all jobs from table: $JOB_TABLE"
echo "=============================================="

# Get all items from the job table
result=$(aws dynamodb scan \
  --table-name $JOB_TABLE \
  --output json)

# Extract count and items
total_count=$(echo $result | jq -r '.Count')

echo "Found $total_count jobs in database:"
echo ""

# Display job details in a structured format
echo $result | jq -r '.Items[] | {
  id: (.id.S // .jobId.S // "<No ID>"),
  title: (.title.S // "<No Title>"),
  labId: (.labId.S // "<No Lab ID>"),
  professorId: (.professorId.S // "<No Professor ID>"),
  createdBy: (.createdBy.S // "<Not specified>"),
  status: (.status.S // "<No Status>"),
  createdAt: (.createdAt.S // "<No Creation Date>")
}'

echo ""
echo "=============================================="
echo "Total jobs in database: $total_count"
echo ""
echo "This script bypasses the permissions system and directly queries the database."
echo "If you can see jobs here but not in the application, there is likely an issue with"
echo "the permissions system or with how lab information is being attached to jobs." 