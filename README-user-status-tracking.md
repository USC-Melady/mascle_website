# User Status Tracking Implementation

This document explains how user status tracking is implemented in the application.

## Overview

User status tracking ensures that changes to a user's status in AWS Cognito (such as email verification, account confirmation, etc.) are properly reflected in the application's database.

## Components

1. **Cognito Triggers**: Lambda functions that are triggered by specific events in the Cognito user lifecycle
2. **DynamoDB User Table**: Stores user data including the current status
3. **Lambda Function**: Processes the Cognito events and updates the database

## Implemented Triggers

The following Cognito triggers have been implemented:

- **Post Confirmation**: Fires when a user confirms their signup or resets their password
- **Pre Sign-up**: Fires when a user attempts to sign up
- **Post Authentication**: Fires when a user successfully authenticates

## How it Works

1. When a user registers, the pre-signup trigger captures their initial state
2. Once they confirm their account, the post-confirmation trigger:
   - Checks if the user already exists in the database
   - If they exist, updates their status
   - If they don't exist, creates a new record with the correct status
3. Every time the user logs in, the post-authentication trigger:
   - Updates their last login timestamp
   - Ensures their current status is accurately reflected in the database

## Status Values

The following status values are tracked:

- `UNCONFIRMED`: User has registered but not confirmed their account
- `CONFIRMED`: User has confirmed their account
- `RESET_REQUIRED`: User needs to reset their password
- `FORCE_CHANGE_PASSWORD`: User must change their password (typically after admin creation)
- `EXTERNAL_PROVIDER`: User authenticated via a third-party provider (Google, Facebook, etc.)

## Setup and Configuration

1. **Environment Variables**:
   - `USER_TABLE_NAME`: The name of the DynamoDB user table

2. **Required Permissions**:
   - The Lambda function requires permissions to:
     - Read and write to the User DynamoDB table
     - Add users to Cognito groups

3. **Deployment**:
   - The Lambda function is deployed as part of the Amplify backend
   - Triggers are configured in the `amplify/auth/resource.ts` file

## Testing User Status Changes

To test status updates:
1. Register a new user (Pre Sign-up trigger)
2. Confirm the account (Post Confirmation trigger)
3. Log in with the user (Post Authentication trigger)
4. Check the DynamoDB table to ensure status is correctly updated

## Troubleshooting

- Check CloudWatch logs for the Lambda function
- Verify environment variables are set correctly
- Ensure the Lambda has proper permissions to access DynamoDB and Cognito 