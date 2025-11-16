import React, { useState, useEffect } from 'react';
import { Container, Alert, Row, Col, Button, Nav, Tab } from 'react-bootstrap';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAuthenticatedUser, hasRequiredRole } from '../utils/auth';
import LabManagementPage from './LabManagement/LabManagementPage';
import JobManagementPage from './JobManagement/JobManagementPage';
import JobApplicationsPage from './JobManagement/JobApplicationsPage';
import JobApplicationsView from './JobManagement/JobApplicationsView';

const ProfessorDashboard: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('labs');
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has Professor role
        const hasRole = await hasRequiredRole(['Professor']);
        if (!hasRole) {
          setError('You do not have access to the professor dashboard.');
          return;
        }

        // Get user info
        const user = await getAuthenticatedUser();
        setUsername(user?.username || 'Professor');
        
        // Get name or email from user attributes
        let displayName = '';
        if (user?.attributes?.given_name || user?.attributes?.name) {
          displayName = (user.attributes.given_name as string || user.attributes.name as string);
        } else if (user?.attributes?.email) {
          displayName = user.attributes.email as string;
        } else {
          displayName = username || 'Professor';
        }

        // Convert to Title Case if it's not an email address
        if (!displayName.includes('@')) {
          displayName = displayName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }


        setUsername(displayName);
      } catch (err) {
        setError('Authentication error. Please log in again.');
        console.error('Auth error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Handle tab selection
  const handleTabSelect = (selectedTab: string) => {
    setActiveTab(selectedTab);
  };

  // Handle automatic tab switching when coming from job management or other navigation
  useEffect(() => {
    const fromJob = searchParams.get('fromJob');
    const jobTitle = searchParams.get('jobTitle');
    const tab = searchParams.get('tab');
    
    if (fromJob && jobTitle) {
      setActiveTab('applications');
    } else if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);



  if (loading) {
    return (
      <Container fluid className="px-0">
        <Alert variant="info">Loading dashboard...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-0">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // If we're viewing applications for a specific job, show the JobApplicationsView
  if (jobId) {
    return <JobApplicationsView jobId={jobId} jobTitle="Job Applications" />;
  }

  return (
    <Container fluid className="px-0">
      <Row className="mx-0 mb-3">
        <Col>
          <h1>Professor Dashboard</h1>
          <Alert variant="success" className="py-2 mb-3">
            <h4>Welcome, {username}!</h4>
            <p className="mb-0">This is your professor dashboard where you can manage your labs, research positions, and student applications.</p>
          </Alert>
        </Col>
      </Row>

      <Tab.Container id="professor-dashboard-tabs" activeKey={activeTab} onSelect={(k) => handleTabSelect(k || 'labs')}>
        <Row className="mx-0 mb-3">
          <Col>
            <Nav variant="tabs">
              <Nav.Item>
                <Nav.Link eventKey="labs">Lab Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="jobs">Job Management</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="applications">Applications</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        <Row className="mx-0">
          <Col>
            <Tab.Content>
              <Tab.Pane eventKey="labs">
                <LabManagementPage />
              </Tab.Pane>
              <Tab.Pane eventKey="jobs">
                <JobManagementPage />
              </Tab.Pane>
              <Tab.Pane eventKey="applications">
                <JobApplicationsPage 
                  filterJobId={searchParams.get('fromJob')} 
                  filterJobTitle={searchParams.get('jobTitle')} 
                />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
};

export default ProfessorDashboard; 