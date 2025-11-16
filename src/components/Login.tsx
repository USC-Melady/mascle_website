import React, { useState, useEffect } from 'react';
import { Button, Card, Form, Alert, Container, Spinner, Tabs, Tab } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { authenticateUser, registerUser, confirmRegistration, completeNewPasswordChallenge, getAuthenticatedUser } from '../utils/auth';
import styled from '@emotion/styled';

// USC Color scheme
const USC_RED = '#990000';
const USC_RED_DARK = '#7a0000';

const LoginContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem 1rem;
`;

const LogoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
  
  img {
    height: 100px;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
  }
`;

const StyledCard = styled(Card)`
  width: 100%;
  max-width: 450px;
  border: none;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
`;

const CardHeader = styled(Card.Header)`
  background-color: ${USC_RED};
  color: white;
  padding: 1.25rem;
  border-bottom: none;
`;

const StyledButton = styled(Button)`
  background-color: ${USC_RED};
  border-color: ${USC_RED};
  
  &:hover, &:focus, &:active, &:disabled {
    background-color: ${USC_RED_DARK} !important;
    border-color: ${USC_RED_DARK} !important;
  }
  
  /* Keep the button red when disabled during loading */
  &:disabled {
    opacity: 0.65;
  }
`;

const StyledSuccessButton = styled(Button)`
  background-color: ${USC_RED};
  border-color: ${USC_RED};
  
  &:hover, &:focus, &:active, &:disabled {
    background-color: ${USC_RED_DARK} !important;
    border-color: ${USC_RED_DARK} !important;
  }
  
  /* Keep the button red when disabled during loading */
  &:disabled {
    opacity: 0.65;
  }
`;

const StyledTabs = styled(Tabs)`
  .nav-link {
    color: #666;
    
    &.active {
      color: ${USC_RED};
      font-weight: 500;
    }
    
    &:hover:not(.active) {
      color: #333;
    }
  }
  
  .nav-item {
    flex: 1;
    text-align: center;
  }
`;

const DisclaimerAlert = styled(Alert)`
  margin-top: 1.5rem;
  font-size: 0.85rem;
  text-align: center;
  
  p {
    margin-bottom: 0.25rem;
  }
  
  .disclaimer-title {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-size: 0.8rem;
    color: #721c24;
  }
`;

const StyledSpinner = styled(Spinner)`
  border-color: #f8d7da;
  border-right-color: ${USC_RED};
`;

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [requiresNewPassword, setRequiresNewPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination from location state
  const from = location.state?.from?.pathname || null;

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const checkExistingAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (user && user.roles) {
          // User is already authenticated, redirect to appropriate dashboard
          console.log('User already authenticated, redirecting to dashboard');
          navigateAfterLogin(user);
        }
      } catch (error) {
        // User not authenticated, continue to show login form
        console.log('User not authenticated, showing login form');
      }
    };

    checkExistingAuth();
  }, []);
  
  // Helper function to get default dashboard based on user roles
  const getDefaultDashboard = (roles: string[]) => {
    if (roles.includes('Admin')) return '/admin-dashboard';
    if (roles.includes('Professor')) return '/professor-dashboard';
    if (roles.includes('LabAssistant')) return '/lab-assistant-dashboard';
    if (roles.includes('Student')) return '/student-dashboard';
    return '/';
  };
  
  // Function to navigate after successful login
  const navigateAfterLogin = (user: any) => {
    if (from) {
      // Redirect to the originally intended page
      navigate(from, { replace: true });
    } else {
      // Navigate to default dashboard
      const defaultDashboard = getDefaultDashboard(user.roles);
      if (defaultDashboard === '/') {
        setError('Your account has not been assigned a role. Please contact support.');
      } else {
        navigate(defaultDashboard);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authenticateUser(email, password);
      
      if (user.requiresNewPassword) {
        setRequiresNewPassword(true);
        setTempPassword(password);
        setSuccess('Your account requires a password change. Please set a new password.');
        setLoading(false);
        return;
      }
      
      navigateAfterLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      const user = await completeNewPasswordChallenge(email, tempPassword, newPassword);
      
      setSuccess('Password changed successfully! Redirecting...');
      
      setTimeout(() => {
        navigateAfterLogin(user);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set new password');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const attributes = {
        given_name: firstName || email.split('@')[0]
      };
      
      const { username } = await registerUser(email, password, attributes);
      setRegisteredEmail(username);
      setNeedsConfirmation(true);
      setSuccess(
        'Registration successful! Please check your email for a verification code. ' +
        'If you don\'t see it in your inbox, please check your spam folder.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await confirmRegistration(registeredEmail, verificationCode);
      setSuccess('Email verified successfully! You can now log in.');
      setNeedsConfirmation(false);
      setActiveTab('login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LogoContainer>
        <img src="/images/PrimShield_Mono.png" alt="USC Shield" />
      </LogoContainer>
      <StyledCard>
        <CardHeader>
          <h4 className="mb-0 text-center">Welcome to MASCLE</h4>
        </CardHeader>
        <Card.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success" className="mb-4">
              {success}
            </Alert>
          )}
          
          {requiresNewPassword ? (
            <Form onSubmit={handleNewPasswordSubmit}>
              <h5 className="mb-3">Set New Password</h5>
              <p className="text-muted mb-4">
                Your account requires a password change. Please set a new permanent password.
              </p>
              
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                />
                <Form.Text className="text-muted">
                  Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                />
              </Form.Group>
              
              <div className="d-grid">
                <StyledButton 
                  type="submit" 
                  disabled={loading}
                  className="py-2"
                >
                  {loading ? (
                    <>
                      <StyledSpinner as="span" animation="border" size="sm" className="me-2" />
                      Changing Password...
                    </>
                  ) : (
                    'Set New Password'
                  )}
                </StyledButton>
              </div>
            </Form>
          ) : needsConfirmation ? (
            <Form onSubmit={handleConfirmation}>
              <h5 className="mb-3">Verify Your Email</h5>
              <Form.Group className="mb-3">
                <Form.Label>Verification Code</Form.Label>
                <Form.Control
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter verification code from your email"
                  required
                  disabled={loading}
                />
              </Form.Group>
              
              <div className="d-grid">
                <StyledButton 
                  type="submit" 
                  disabled={loading}
                  className="py-2"
                >
                  {loading ? (
                    <>
                      <StyledSpinner as="span" animation="border" size="sm" className="me-2" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Email'
                  )}
                </StyledButton>
              </div>
            </Form>
          ) : (
            <StyledTabs
              activeKey={activeTab}
              onSelect={(k) => k && setActiveTab(k)}
              className="mb-4"
              justify
            >
              <Tab eventKey="login" title="Login">
                <Form onSubmit={handleLogin} className="pt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <StyledButton 
                      type="submit" 
                      disabled={loading}
                      className="py-2"
                    >
                      {loading ? (
                        <>
                          <StyledSpinner as="span" animation="border" size="sm" className="me-2" />
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </StyledButton>
                  </div>
                </Form>
              </Tab>
              
              <Tab eventKey="register" title="Register">
                <Form onSubmit={handleRegister} className="pt-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>First Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter your first name"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      required
                      disabled={loading}
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters.
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      disabled={loading}
                    />
                  </Form.Group>
                  
                  <div className="d-grid">
                    <StyledSuccessButton 
                      type="submit" 
                      disabled={loading}
                      className="py-2"
                    >
                      {loading ? (
                        <>
                          <StyledSpinner as="span" animation="border" size="sm" className="me-2" />
                          Registering...
                        </>
                      ) : (
                        'Register'
                      )}
                    </StyledSuccessButton>
                  </div>
                </Form>
              </Tab>
            </StyledTabs>
          )}
          
          <div className="mt-4">
            <Alert variant="info" className="mb-0">
              <p className="fw-bold mb-1">Welcome to MASCLE</p>
              <p className="mb-0 small">
                New users will be registered as students.
                For faculty access, please contact your department administrator after registration.
              </p>
            </Alert>
          </div>
        </Card.Body>
      </StyledCard>
      
      <DisclaimerAlert variant="warning">
        <div className="disclaimer-title">DISCLAIMER</div>
        <p>This is a trial system in development. Use at your own risk.</p>
        <p>Any data you provide may be processed by artificial intelligence systems.</p>
        <p>Do not share confidential or sensitive information.</p>
      </DisclaimerAlert>
    </LoginContainer>
  );
};

export default Login; 