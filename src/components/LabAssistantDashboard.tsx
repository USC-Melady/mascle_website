import React, { useState, useEffect } from 'react';
import { Container, Alert, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getAuthenticatedUser, hasRequiredRole } from '../utils/auth';
import LabManagementPage from './LabManagement/LabManagementPage';

const LabAssistantDashboard: React.FC = () => {
  const [username, setUsername] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user has LabAssistant role
        const hasRole = await hasRequiredRole(['LabAssistant']);
        if (!hasRole) {
          setError('You do not have access to the lab assistant dashboard.');
          return;
        }

        // Get user info
        const user = await getAuthenticatedUser();
        setUsername(user?.username || 'Lab Assistant');
        
        // Get name or email from user attributes
        let displayName = '';
        if (user?.attributes?.given_name || user?.attributes?.name) {
          displayName = (user.attributes.given_name as string || user.attributes.name as string);
        } else if (user?.attributes?.email) {
          displayName = user.attributes.email as string;
        } else {
          displayName = username || 'Lab Assistant';
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

  return (
    <Container fluid className="px-0">
      <Row className="mx-0 mb-3">
        <Col>
          <h1>Lab Assistant Dashboard</h1>
          <Alert variant="success" className="py-2 mb-3">
            <h4>Welcome, {username}!</h4>
            <p className="mb-0">This is your lab assistant dashboard where you can manage lab students and activities.</p>
          </Alert>
        </Col>
      </Row>

      <Row className="mx-0">
        <Col>
          <LabManagementPage />
        </Col>
      </Row>
    </Container>
  );
};

export default LabAssistantDashboard; 