import React from 'react';
import { Form } from 'react-bootstrap';
import { JobApplication } from '../../utils/jobManagement';
import { 
  ApplicationStatusOption, 
  DEFAULT_APPLICATION_STATUS_OPTIONS, 
  EXTENDED_APPLICATION_STATUS_OPTIONS 
} from '../../utils/statusUtils';

// Re-export for backwards compatibility
export type { ApplicationStatusOption };
export const DEFAULT_STATUS_OPTIONS = DEFAULT_APPLICATION_STATUS_OPTIONS;
export const EXTENDED_STATUS_OPTIONS = EXTENDED_APPLICATION_STATUS_OPTIONS;

interface ApplicationStatusDropdownProps {
  application: JobApplication | { matchId: string; status: string };
  onStatusChange: (matchId: string, newStatus: string) => void;
  isSubmitting?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  statusOptions?: ApplicationStatusOption[];
  className?: string;
  style?: React.CSSProperties;
}

const ApplicationStatusDropdown: React.FC<ApplicationStatusDropdownProps> = ({
  application,
  onStatusChange,
  isSubmitting = false,
  disabled = false,
  size = 'sm',
  statusOptions = DEFAULT_APPLICATION_STATUS_OPTIONS,
  className = '',
  style = {}
}) => {
  const currentOption = statusOptions.find(opt => opt.value === application.status);
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== application.status) {
      onStatusChange(application.matchId, newStatus);
    }
  };

  const defaultStyle: React.CSSProperties = {
    width: size === 'sm' ? '120px' : 'auto',
    fontSize: size === 'sm' ? '0.75rem' : undefined,
    fontWeight: 'bold',
    ...style
  };

  const colorClass = `text-${currentOption?.bg === 'warning' ? 'dark' : 'white'} bg-${currentOption?.bg || 'secondary'} border-${currentOption?.bg || 'secondary'}`;

  return (
    <Form.Select
      size={size}
      value={application.status}
      onChange={handleChange}
      disabled={isSubmitting || disabled}
      style={defaultStyle}
      className={`${colorClass} ${className}`}
    >
      {statusOptions.map(option => (
        <option 
          key={option.value} 
          value={option.value}
          style={{ color: 'black', backgroundColor: 'white' }}
        >
          {option.label}
        </option>
      ))}
    </Form.Select>
  );
};

export default ApplicationStatusDropdown;