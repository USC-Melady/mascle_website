import React from 'react';
import { Badge } from 'react-bootstrap';
import { 
  getApplicationStatusBadge, 
  getJobStatusBadge, 
  getUserStatusBadge, 
  getLabStatusBadge,
  BadgeVariant 
} from '../../utils/statusUtils';

interface StatusBadgeProps {
  status: string;
  statusType: 'application' | 'job' | 'user' | 'lab';
  size?: 'sm' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  statusType, 
  size,
  className = '',
  style = {}
}) => {
  const getBadgeVariant = (): BadgeVariant => {
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

  const badgeVariant = getBadgeVariant();
  
  // Add size-specific classes
  const sizeClass = size === 'sm' ? 'px-2 py-1' : size === 'lg' ? 'px-4 py-2' : 'px-3 py-2';

  return (
    <Badge 
      bg={badgeVariant} 
      className={`${sizeClass} ${className}`}
      style={style}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;