// components/PageHeader.tsx
import React from 'react';
import { Container, Breadcrumb, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PageHeaderProps } from '../types';
import { useDashboardUrl } from '../../../hooks/useDashboardUrl';

const PageHeader: React.FC<PageHeaderProps> = ({ saveResumeDetails, saving = false }) => {
  const { dashboardUrl } = useDashboardUrl();

  return (
    <div className="bg-gradient bg-primary bg-opacity-10 pt-4 pb-4 mb-4">
      <Container>
        <Breadcrumb className="mb-2">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: dashboardUrl }} style={{ cursor: 'pointer' }}>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item active>Resume Management</Breadcrumb.Item>
        </Breadcrumb>
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-0">
          <div>
            <h1 className="mb-1">Resume Management</h1>
            <p className="text-muted mb-0">Upload your resume and enter your qualifications to improve your matches</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Button 
              variant="success" 
              onClick={saveResumeDetails} 
              className="px-4"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default PageHeader;