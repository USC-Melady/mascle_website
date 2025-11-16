#!/bin/bash

# Table name
JOB_TABLE="Job-fdob2vhf5rcx5nmzeui5vspzqu-NONE"

echo "Fetching all jobs from table: $JOB_TABLE"
echo "----------------------------------------"

# Get all items from the job table
aws dynamodb scan \
  --table-name $JOB_TABLE \
  --output json

echo "----------------------------------------"
echo "Scan completed."