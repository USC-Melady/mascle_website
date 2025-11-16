import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthenticatedUser } from '../utils/auth';
import MainContent from './MainContent';

// Helper function to get default dashboard based on user roles
const getDefaultDashboard = (roles: string[]) => {
  if (roles.includes('Admin')) return '/admin-dashboard';
  if (roles.includes('Professor')) return '/professor-dashboard';
  if (roles.includes('LabAssistant')) return '/lab-assistant-dashboard';
  if (roles.includes('Student')) return '/student-dashboard';
  return null; // Not authenticated or no roles
};

const DashboardRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const user = await getAuthenticatedUser();
        
        if (user && user.roles && user.roles.length > 0) {
          // User is authenticated and has roles, redirect to appropriate dashboard
          const dashboard = getDefaultDashboard(user.roles);
          if (dashboard) {
            console.log(`Redirecting authenticated user with roles ${user.roles.join(', ')} to ${dashboard}`);
            navigate(dashboard, { replace: true });
            return;
          }
        }
      } catch (error) {
        // User is not authenticated, continue to show MainContent
        console.log('User not authenticated, showing homepage');
      }
    };

    checkAuthAndRedirect();
  }, [navigate]);

  // Show the main content while checking authentication
  // If user is authenticated, they'll be redirected before this renders much
  return <MainContent />;
};

export default DashboardRedirect;