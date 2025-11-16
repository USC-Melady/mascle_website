// components/WelcomeCard.tsx
import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, ProgressBar } from 'react-bootstrap';
import { WelcomeCardProps } from '../types';
import { isResumeComplete } from '../../../components/ResumeManagement/utils';

const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  username, 
  resumeUploaded, 
  navigate 
}) => {
  const [resumeStatus, setResumeStatus] = useState({
    isComplete: resumeUploaded,
    completionPercentage: resumeUploaded ? 100 : 0
  });
  
  // Check resume completion status when component mounts
  useEffect(() => {
    const checkResumeStatus = async () => {
      const complete = await isResumeComplete();
      let percentage = 0;
      
      if (complete) {
        percentage = 100;
      } else if (resumeUploaded) {
        percentage = 70; // Has uploaded resume but missing other details
      } else {
        try {
          const resumeDetails = localStorage.getItem('resumeDetails');
          if (resumeDetails) {
            // Has some resume details but not complete
            percentage = 50;
          } else {
            // No resume data at all
            percentage = 0;
          }
        } catch {
          // Ignore localStorage errors - just treat as no resume data
          percentage = 0;
        }
      }
      
      setResumeStatus({
        isComplete: complete,
        completionPercentage: percentage
      });
    };

    checkResumeStatus();
  }, [resumeUploaded]);
  
  // Display name is already formatted in Title Case from the parent component
  const displayName = username || 'Student';
  
  const handleOpenPositionsClick = () => {
    // Use the global function if available, otherwise try DOM selection
    if (typeof window !== 'undefined' && window.switchToJobsTab) {
      window.switchToJobsTab();
    } else {
      // Fallback to the previous method
      const jobsTab = document.querySelector('button[data-rr-ui-event-key="jobs"]');
      if (jobsTab) {
        (jobsTab as HTMLElement).click();
      }
    }
  };
  
  return (
    <Card className="mb-4 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #990000, #cc3333)',
                    color: 'white',
                    fontSize: '1.5rem'
                  }}
                >
                  <i className="bi bi-person-check"></i>
                </div>
              </div>
              <div>
                <h3 className="mb-1">Welcome, {displayName}!</h3>
                <p className="text-muted mb-0">
                  Your research opportunities dashboard
                </p>
              </div>
            </div>
            
            <div className="d-flex flex-wrap gap-2">
              <Button 
                variant="primary" 
                onClick={handleOpenPositionsClick}
                className="px-4"
              >
                <i className="bi bi-search me-2"></i>
                Browse Positions
              </Button>
              
              <Button 
                variant="outline-primary" 
                onClick={() => navigate('/student-dashboard/resume')}
                className="px-4"
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Manage Resume
              </Button>
            </div>
          </Col>
          
          <Col md={4} className="text-center mt-3 mt-md-0">
            <div className="p-3 rounded" style={{ backgroundColor: resumeStatus.isComplete ? '#d1e7dd' : '#fff3cd' }}>
              <div className="mb-2">
                <i 
                  className={`bi ${resumeStatus.isComplete ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-warning'}`}
                  style={{ fontSize: '2rem' }}
                ></i>
              </div>
              <h6 className="mb-2">
                {resumeStatus.isComplete ? 'Profile Complete' : 'Profile Incomplete'}
              </h6>
              <div className="small text-muted mb-2">
                {resumeStatus.completionPercentage}% Complete
              </div>
              <ProgressBar 
                now={resumeStatus.completionPercentage} 
                variant={resumeStatus.completionPercentage < 50 ? "danger" : 
                        resumeStatus.completionPercentage < 100 ? "warning" : "success"}
                style={{ height: '8px' }}
              />
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

// Add type declaration to avoid TypeScript errors
declare global {
  interface Window {
    switchToJobsTab?: () => void;
  }
}

export default WelcomeCard;