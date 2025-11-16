import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Spinner } from 'react-bootstrap';
import { getAuthenticatedUser, hasRequiredRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  allowGuests?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [], 
  allowGuests = false 
}) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        if (user) {
          setIsAuthenticated(true);
          
          if (requiredRoles.length > 0) {
            const permission = await hasRequiredRole(requiredRoles);
            setHasPermission(permission);
          } else {
            setHasPermission(true);
          }
        } else {
          setIsAuthenticated(false);
          setHasPermission(allowGuests);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setHasPermission(allowGuests);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [requiredRoles, allowGuests]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" />
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !allowGuests) {
    // Store the intended destination for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isAuthenticated && !hasPermission) {
    return (
      <Alert variant="danger" className="m-4">
        <Alert.Heading>Access Denied</Alert.Heading>
        <p>You don't have permission to access this page.</p>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;