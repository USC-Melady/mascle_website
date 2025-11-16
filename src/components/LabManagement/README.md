# Lab Management Components

This directory contains components related to lab management functionality for professors and lab assistants.

## Components

### LabManagementPage

The main component for managing labs. It displays a list of labs associated with the current user and provides functionality to manage each lab.

## Features

- View labs associated with the current user
- Filter labs based on user role (Admin, Professor, LabAssistant)
- Display lab details including name, description, number of assistants, and status
- Manage lab functionality (to be implemented)

## Usage

```jsx
import { LabManagementPage } from '../components/LabManagement';

// In your component
return (
  <div>
    <h1>Lab Management</h1>
    <LabManagementPage />
  </div>
);
```

## API Integration

The components in this directory use the following API functions:

- `getAllLabs()` - Fetches all labs from the API
- `getLabsForUser(userId)` - Fetches labs associated with a specific user

These functions are defined in `src/utils/userManagement.ts`.

## Backend Integration

The lab management functionality is supported by the following backend resources:

- `getLabs` Lambda function - Retrieves lab information from DynamoDB
- Lab table in DynamoDB - Stores lab data

## Future Enhancements

- Add ability to create new labs
- Add ability to edit lab details
- Add ability to manage lab members (add/remove students and assistants)
- Add ability to view lab activity and statistics 