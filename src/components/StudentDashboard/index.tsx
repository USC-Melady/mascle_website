import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Alert, Spinner, Tabs, Tab, Button } from 'react-bootstrap';
import { getApplications } from '../../utils/jobManagement';
import ApplicationsCard from './components/ApplicationsCard';
import JobListings from './components/JobListings';
import { JobApplication } from '../../utils/jobManagement';
import { isResumeComplete } from '../../components/ResumeManagement/utils';
import { useNavigate } from 'react-router-dom';

// Define the global window type extension to avoid type errors
declare global {
  interface Window {
    switchToJobsTab?: () => void;
  }
}

const StudentDashboard: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('applications');
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [resumeComplete, setResumeComplete] = useState(false);
  const jobsTabRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();

  // Function to expose tab control to parent components
  const switchToJobsTab = () => {
    setActiveTab('jobs');
  };

  // Expose the function to window for WelcomeCard to access
  useEffect(() => {
    // Set the global function
    window.switchToJobsTab = switchToJobsTab;
    
    // Check resume completion status
    const isComplete = isResumeComplete();
    setResumeComplete(isComplete);
    
    return () => {
      // Clean up the global function when component unmounts
      delete window.switchToJobsTab;
    };
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Loading applications...');
      
      console.log('Fetching applications...');
      const apps = await getApplications();
      console.log('Applications fetched:', apps);
      
      setApplications(apps);
      setDebugInfo(`Loaded ${apps.length} applications`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load applications: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
      console.error('Error loading applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApplicationSubmitted = () => {
    console.log('Application submitted, refreshing applications list...');
    loadApplications();
    // Switch to applications tab after submitting
    setActiveTab('applications');
  };

  if (loading && applications.length === 0) {
    return (
      <Container fluid className="py-4">
        <Row className="justify-content-center">
          <Col xs="auto">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            {debugInfo && <div className="mt-2 text-muted small">{debugInfo}</div>}
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Resume Completion Banner */}
      {!resumeComplete && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex flex-column flex-md-row justify-content-between align-items-md-center py-3">
              <div className="mb-3 mb-md-0">
                <Alert.Heading>Complete Your Resume Profile</Alert.Heading>
                <p className="mb-0">
                  You need to complete your resume profile before you can apply for positions.
                  Having a complete profile also increases your chances of being selected.
                </p>
              </div>
              <div className="d-grid" style={{ minWidth: '200px' }}>
                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={() => navigate('/student-dashboard/resume')}
                >
                  Complete Now
                </Button>
              </div>
            </Alert>
          </Col>
        </Row>
      )}
    
      <Row>
        <Col>
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          {debugInfo && (
            <Alert variant="info" className="mb-4">
              {debugInfo}
            </Alert>
          )}
          
          <div className="d-flex justify-content-end mb-3">
            <Button 
              variant="outline-primary"
              size="sm"
              onClick={loadApplications}
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </Button>
          </div>
          
          <Tabs
            id="student-dashboard-tabs"
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="applications" title="My Applications">
              <ApplicationsCard 
                applications={applications} 
                onApplicationSubmitted={handleApplicationSubmitted}
              />
            </Tab>
            <Tab 
              eventKey="jobs" 
              title={
                <span className="d-flex align-items-center" ref={jobsTabRef as React.RefObject<HTMLSpanElement>}>
                  Open Positions
                </span>
              }
            >
              {!resumeComplete && (
                <Alert variant="warning" className="mt-3 mb-3">
                  <Alert.Heading>Resume Profile Required</Alert.Heading>
                  <p>
                    You can view available positions, but you'll need to complete your resume profile
                    before you can apply. A complete profile helps professors evaluate your application.
                  </p>
                  <div className="d-flex justify-content-end">
                    <Button 
                      variant="primary" 
                      onClick={() => navigate('/student-dashboard/resume')}
                    >
                      Complete Resume
                    </Button>
                  </div>
                </Alert>
              )}
              <JobListings onApplicationSubmitted={handleApplicationSubmitted} />
            </Tab>
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export default StudentDashboard; 