// Centralized status management utilities
// This file consolidates all status-related logic to eliminate redundancy

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'secondary' | 'info' | 'primary' | 'light' | 'dark';

// Application Status Types and Options
export interface ApplicationStatusOption {
  value: string;
  label: string;
  bg: BadgeVariant;
}

export const APPLICATION_STATUSES = {
  PENDING: 'Pending',
  REVIEWED: 'Reviewed', 
  REVIEWING: 'Reviewing',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW: 'Interview',
  APPROVED: 'Approved',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected'
} as const;

export const DEFAULT_APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] = [
  { value: APPLICATION_STATUSES.PENDING, label: 'Pending', bg: 'warning' },
  { value: APPLICATION_STATUSES.REVIEWED, label: 'Reviewed', bg: 'info' },
  { value: APPLICATION_STATUSES.APPROVED, label: 'Approved', bg: 'success' },
  { value: APPLICATION_STATUSES.REJECTED, label: 'Rejected', bg: 'danger' }
];

export const EXTENDED_APPLICATION_STATUS_OPTIONS: ApplicationStatusOption[] = [
  { value: APPLICATION_STATUSES.PENDING, label: 'Pending', bg: 'warning' },
  { value: APPLICATION_STATUSES.REVIEWING, label: 'Reviewing', bg: 'info' },
  { value: APPLICATION_STATUSES.SHORTLISTED, label: 'Shortlisted', bg: 'primary' },
  { value: APPLICATION_STATUSES.INTERVIEW, label: 'Interview', bg: 'info' },
  { value: APPLICATION_STATUSES.ACCEPTED, label: 'Accepted', bg: 'success' },
  { value: APPLICATION_STATUSES.APPROVED, label: 'Approved', bg: 'success' },
  { value: APPLICATION_STATUSES.REJECTED, label: 'Rejected', bg: 'danger' }
];

// Job Status Types and Options
export const JOB_STATUSES = {
  OPEN: 'Open',
  CLOSED: 'Closed', 
  FILLED: 'Filled',
  PENDING: 'Pending'
} as const;

export const JOB_STATUS_OPTIONS = [
  { value: JOB_STATUSES.OPEN, label: 'Open', bg: 'success' as BadgeVariant },
  { value: JOB_STATUSES.CLOSED, label: 'Closed', bg: 'danger' as BadgeVariant },
  { value: JOB_STATUSES.FILLED, label: 'Filled', bg: 'info' as BadgeVariant },
  { value: JOB_STATUSES.PENDING, label: 'Pending', bg: 'warning' as BadgeVariant }
];

// User Status Types
export const USER_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  PENDING: 'Pending'
} as const;

export const USER_STATUS_OPTIONS = [
  { value: USER_STATUSES.ACTIVE, label: 'Active', bg: 'success' as BadgeVariant },
  { value: USER_STATUSES.INACTIVE, label: 'Inactive', bg: 'danger' as BadgeVariant },
  { value: USER_STATUSES.PENDING, label: 'Pending', bg: 'warning' as BadgeVariant }
];

// Lab Status Types  
export const LAB_STATUSES = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive'
} as const;

export const LAB_STATUS_OPTIONS = [
  { value: LAB_STATUSES.ACTIVE, label: 'Active', bg: 'success' as BadgeVariant },
  { value: LAB_STATUSES.INACTIVE, label: 'Inactive', bg: 'secondary' as BadgeVariant }
];

// Centralized Badge Color Functions
export const getApplicationStatusBadge = (status: string): BadgeVariant => {
  const option = EXTENDED_APPLICATION_STATUS_OPTIONS.find(
    opt => opt.value.toLowerCase() === status?.toLowerCase()
  );
  return option?.bg || 'secondary';
};

export const getJobStatusBadge = (status: string): BadgeVariant => {
  const option = JOB_STATUS_OPTIONS.find(
    opt => opt.value.toLowerCase() === status?.toLowerCase()
  );
  return option?.bg || 'secondary';
};

export const getUserStatusBadge = (status?: string): BadgeVariant => {
  if (!status) return 'secondary';
  const option = USER_STATUS_OPTIONS.find(
    opt => opt.value.toLowerCase() === status.toLowerCase()
  );
  return option?.bg || 'secondary';
};

export const getLabStatusBadge = (status?: string): BadgeVariant => {
  if (!status) return 'secondary';
  const option = LAB_STATUS_OPTIONS.find(
    opt => opt.value.toLowerCase() === status.toLowerCase()
  );
  return option?.bg || 'secondary';
};

// Generic status badge function
export const getStatusBadge = (status: string, statusType: 'application' | 'job' | 'user' | 'lab'): BadgeVariant => {
  switch (statusType) {
    case 'application':
      return getApplicationStatusBadge(status);
    case 'job':
      return getJobStatusBadge(status);
    case 'user':
      return getUserStatusBadge(status);
    case 'lab':
      return getLabStatusBadge(status);
    default:
      return 'secondary';
  }
};

// Status validation functions
export const isValidApplicationStatus = (status: string): boolean => {
  return EXTENDED_APPLICATION_STATUS_OPTIONS.some(
    opt => opt.value.toLowerCase() === status?.toLowerCase()
  );
};

export const isValidJobStatus = (status: string): boolean => {
  return JOB_STATUS_OPTIONS.some(
    opt => opt.value.toLowerCase() === status?.toLowerCase()
  );
};

// Helper to get status option by value
export const getApplicationStatusOption = (status: string): ApplicationStatusOption | undefined => {
  return EXTENDED_APPLICATION_STATUS_OPTIONS.find(
    opt => opt.value.toLowerCase() === status?.toLowerCase()
  );
};

// Helper to format status display
export const formatStatusDisplay = (status: string): string => {
  return status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase() || 'Unknown';
};