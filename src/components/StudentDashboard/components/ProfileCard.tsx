// components/ProfileCard.tsx
import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { ProfileCardProps } from '../types';

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  email, 
  username, 
  onResumeClick
}) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header 
        className="py-3"
        style={{ 
          background: 'linear-gradient(135deg, #990000, #cc3333)',
          color: 'white',
          borderRadius: '0.375rem 0.375rem 0 0'
        }}
      >
        <div className="d-flex align-items-center">
          <i className="bi bi-person-circle me-2"></i>
          <h5 className="mb-0">Student Profile</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center py-2">
            <span className="text-muted">Role</span>
            <Badge bg="primary">Student</Badge>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-top">
            <span className="text-muted">Name</span>
            <span className="fw-medium">{username || 'Student'}</span>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-top">
            <span className="text-muted">Email</span>
            <span className="fw-medium">{email || 'Not provided'}</span>
          </div>
        </div>
        
        <div className="d-grid gap-2">
          <Button 
            variant="outline-primary" 
            onClick={onResumeClick}
            className="d-flex align-items-center justify-content-center"
          >
            <i className="bi bi-file-earmark-text me-2"></i>
            Manage Resume
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;