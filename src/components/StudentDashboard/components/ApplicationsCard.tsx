// components/ApplicationsCard.tsx
import React from 'react';
import { ListGroup, Alert, Badge, Button } from 'react-bootstrap';
import { JobApplication } from '../../../utils/jobManagement';

interface ApplicationsCardProps {
  applications: JobApplication[];
  onApplicationSubmitted: () => void;
}

const ApplicationsCard: React.FC<ApplicationsCardProps> = ({ applications, onApplicationSubmitted }) => {
  return (
    <div className="applications-list">
      {applications.length === 0 ? (
        <Alert variant="light" className="m-3">
          You haven't applied to any positions yet. Check the "Open Positions" tab to find opportunities.
        </Alert>
      ) : (
        <>
          <ListGroup variant="flush">
            {applications.map((app) => (
              <ListGroup.Item key={app.matchId} className="py-3 px-4 border-bottom">
                <div className="d-sm-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">{app.job?.title || 'Unknown Position'}</h6>
                    <p className="text-muted mb-0 small">
                      {app.job?.labId || 'Unknown Lab'} • Prof. {app.job?.professorId || 'Unknown Professor'} • Applied: {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown'}
                    </p>
                  </div>
                  <Badge 
                    bg={getStatusBadge(app.status)} 
                    className="mt-2 mt-sm-0"
                  >
                    {app.status}
                  </Badge>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
          <div className="p-3 border-top d-flex justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
              </small>
            </div>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => onApplicationSubmitted()}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

// Helper function to get status badge color
const getStatusBadge = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'danger';
    case 'reviewed':
      return 'info';
    default:
      return 'secondary';
  }
};

export default ApplicationsCard;