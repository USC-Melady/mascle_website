import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, Row, Col, ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthenticatedUser, hasRequiredRole } from '../utils/auth';
import UserManagementPage from './UserManagement/UserManagementPage';
import LabManagementPage from './LabManagement/LabManagementPage';
import { getLabs } from '../utils/labManagement';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faGraduationCap, 
  faBriefcase,
  faUserTie,
  faClipboardList,
  faDatabase,
  faShieldAlt,
  faServer,
  faEnvelope
} from '@fortawesome/free-solid-svg-icons';
import styled from '@emotion/styled';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// Styled components for the control panel
const ControlPanelCard = styled(Card)`
  margin-bottom: 1.5rem;
`;

const ControlPanelItem = styled(ListGroup.Item)`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  
  &:hover {
    background-color: rgba(153, 0, 0, 0.05);
  }
  
  .icon {
    color: #990000;
    margin-right: 1rem;
    width: 20px;
    text-align: center;
  }
`;

const StatusItem = styled(ListGroup.Item)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
`;

// Interface for control panel options
interface ControlPanelOption {
  id: string;
  title: string;
  icon: IconDefinition;
  path: string;
  roles: string[];
  action?: () => void;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');

  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  // Add state for labs selection
  const [labsList, setLabsList] = useState<Array<{labId: string; name: string; description?: string}>>([]);
  const [loadingLabs, setLoadingLabs] = useState(false);
  const [labError, setLabError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has Admin role
        const hasRole = await hasRequiredRole(['Admin']);
        if (!hasRole) {
          setError('You do not have access to the admin dashboard.');
          return;
        }

        // Get user info
        const user = await getAuthenticatedUser();
        setUsername(user?.username || 'Administrator');
        setUserRoles(user?.roles || ['Admin']);
        
        // Get name or email from user attributes
        let displayName = '';
        if (user?.attributes?.given_name || user?.attributes?.name) {
          displayName = (user.attributes.given_name as string || user.attributes.name as string);
        } else if (user?.attributes?.email) {
          displayName = user.attributes.email as string;
        } else {
          displayName = username;
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



  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  // Define all possible control panel options
  const allOptions: ControlPanelOption[] = [
    {
      id: 'user-management',
      title: 'User Management',
      icon: faUsers,
      path: '/admin/users',
      roles: ['Admin'],
      action: () => handleSectionChange('user-management')
    },
    {
      id: 'lab-management',
      title: 'Lab Management',
      icon: faGraduationCap,
      path: '/labs/manage',
      roles: ['Admin', 'Professor'],
      action: () => handleSectionChange('lab-management')
    },
    {
      id: 'lab-members',
      title: 'Manage Lab Members',
      icon: faUserTie,
      path: '/labs',
      roles: ['Admin', 'Professor', 'LabAssistant'],
      action: () => handleSectionChange('lab-selection')
    },
    {
      id: 'job-management',
      title: 'Manage Jobs',
      icon: faBriefcase,
      path: '/jobs/manage',
      roles: ['Admin', 'Professor', 'LabAssistant'],
      action: () => navigate('/jobs/manage')
    },
    {
      id: 'applications',
      title: 'Review Applications',
      icon: faClipboardList,
      path: '/applications/review',
      roles: ['Admin', 'Professor', 'LabAssistant'],
      action: () => navigate('/applications/review')
    }
  ];

  // Filter options based on user roles
  const filteredOptions = allOptions.filter(option => 
    option.roles.some(role => userRoles.includes(role))
  );

  // Group options by category
  const userManagementOption = filteredOptions.find(option => option.id === 'user-management');

  const labOptions = filteredOptions.filter(option => 
    option.id.includes('lab-management') || 
    option.id.includes('lab-members')
  );

  const jobOptions = filteredOptions.filter(option => 
    option.id.includes('job-management') || 
    option.id.includes('applications')
  );

  // Add useEffect for fetching labs when needed
  useEffect(() => {
    if (activeSection === 'lab-selection') {
      const fetchLabs = async () => {
        try {
          setLoadingLabs(true);
          const allLabs = await getLabs();
          setLabsList(allLabs);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to load labs';
          setLabError(errorMessage);
        } finally {
          setLoadingLabs(false);
        }
      };
      
      fetchLabs();
    }
  }, [activeSection]);

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

  // Render the active section if one is selected
  if (activeSection === 'user-management') {
    return (
      <Container fluid className="px-0">
        <Row className="mx-0 mb-3">
          <Col>
            <h1>Admin Dashboard</h1>
            <div className="d-flex justify-content-start align-items-center">
              <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>
                Back to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
        <UserManagementPage />
      </Container>
    );
  }

  if (activeSection === 'lab-management') {
    return (
      <Container fluid className="px-0">
        <Row className="mx-0 mb-3">
          <Col>
            <h1>Admin Dashboard</h1>
            <div className="d-flex justify-content-start align-items-center">
              <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>
                Back to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
        <LabManagementPage />
      </Container>
    );
  }

  if (activeSection === 'lab-selection') {
    return (
      <Container fluid className="px-0">
        <Row className="mx-0 mb-3">
          <Col>
            <h1>Select Lab</h1>
            <div className="d-flex justify-content-start align-items-center">
              <Button variant="outline-secondary" onClick={() => setActiveSection(null)}>
                Back to Dashboard
              </Button>
            </div>
          </Col>
        </Row>
        
        {labError && <Alert variant="danger">{labError}</Alert>}
        
        {loadingLabs ? (
          <div className="text-center my-5">
            <Spinner animation="border" />
            <p className="mt-2">Loading labs...</p>
          </div>
        ) : (
          <Row className="mx-0">
            {labsList.length === 0 ? (
              <Alert variant="info">
                No labs available. Please create a lab first.
              </Alert>
            ) : (
              labsList.map(lab => (
                <Col md={6} lg={4} className="mb-4" key={lab.labId}>
                  <Card>
                    <Card.Body>
                      <Card.Title>{lab.name}</Card.Title>
                      <Card.Text>
                        {lab.description || 'No description available'}
                      </Card.Text>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate(`/lab/${lab.labId}/members`)}
                      >
                        Manage Members
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))
            )}
          </Row>
        )}
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      <Row className="mx-0 mb-3">
        <Col>
          <h1>Admin Dashboard</h1>
          <Alert variant="success" className="py-2 mb-3">
            <h4>Welcome, {username}!</h4>
            <p className="mb-0">This is your admin dashboard where you can manage users, labs, and system settings.</p>
          </Alert>
        </Col>
      </Row>

      <Row className="mx-0">
        <Col md={8} className="px-2">
          {/* User Management - Admin Tools */}
          {userManagementOption && (
            <ControlPanelCard>
              <Card.Header as="h5">Manage Users</Card.Header>
              <ListGroup variant="flush">
                <ControlPanelItem 
                  key={userManagementOption.id}
                  action 
                  onClick={userManagementOption.action}
                >
                  <span className="icon">
                    <FontAwesomeIcon icon={userManagementOption.icon} />
                  </span>
                  {userManagementOption.title}
                </ControlPanelItem>
              </ListGroup>
            </ControlPanelCard>
          )}

          {/* Lab Management Tools - Only shown if user has access */}
          {labOptions.length > 0 && (
            <ControlPanelCard>
              <Card.Header as="h5">Lab Management</Card.Header>
              <ListGroup variant="flush">
                {labOptions.map((option) => (
                  <ControlPanelItem 
                    key={option.id}
                    action 
                    onClick={option.action}
                  >
                    <span className="icon">
                      <FontAwesomeIcon icon={option.icon} />
                    </span>
                    {option.title}
                  </ControlPanelItem>
                ))}
              </ListGroup>
            </ControlPanelCard>
          )}

          {/* Job Management Tools - Only shown if user has access */}
          {jobOptions.length > 0 && (
            <ControlPanelCard>
              <Card.Header as="h5">Job Management</Card.Header>
              <ListGroup variant="flush">
                {jobOptions.map((option) => (
                  <ControlPanelItem 
                    key={option.id}
                    action 
                    onClick={option.action}
                  >
                    <span className="icon">
                      <FontAwesomeIcon icon={option.icon} />
                    </span>
                    {option.title}
                  </ControlPanelItem>
                ))}
              </ListGroup>
            </ControlPanelCard>
          )}
        </Col>

        <Col md={4} className="px-2">
          <Card className="mb-3 w-100">
            <Card.Header as="h5">System Status</Card.Header>
            <Card.Body className="p-0">
              <ListGroup variant="flush">
                <StatusItem>
                  <div>
                    <FontAwesomeIcon icon={faDatabase} className="me-2 text-secondary" />
                    Database
                  </div>
                  <Badge bg="success">Online</Badge>
                </StatusItem>
                <StatusItem>
                  <div>
                    <FontAwesomeIcon icon={faShieldAlt} className="me-2 text-secondary" />
                    Authentication Service
                  </div>
                  <Badge bg="success">Online</Badge>
                </StatusItem>
                <StatusItem>
                  <div>
                    <FontAwesomeIcon icon={faServer} className="me-2 text-secondary" />
                    Storage Service
                  </div>
                  <Badge bg="success">Online</Badge>
                </StatusItem>
                <StatusItem>
                  <div>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-secondary" />
                    Email Service
                  </div>
                  <Badge bg="success">Online</Badge>
                </StatusItem>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="mb-3 w-100">
            <Card.Header as="h5">Recent Activity</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="py-2">
                <small className="text-muted">Today, 10:23 AM</small>
                <p className="mb-0">New user registered: john.doe@example.com</p>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <small className="text-muted">Today, 9:45 AM</small>
                <p className="mb-0">Role updated: jane.smith@example.com (Student → LabAssistant)</p>
              </ListGroup.Item>
              <ListGroup.Item className="py-2">
                <small className="text-muted">Yesterday, 4:30 PM</small>
                <p className="mb-0">New lab created: AI Ethics Research Lab</p>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 