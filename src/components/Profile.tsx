import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthenticatedUser, hasRequiredRole } from '../utils/auth';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Check roles in order of hierarchy
        if (await hasRequiredRole(['Admin'])) {
          navigate('/admin-dashboard');
        } else if (await hasRequiredRole(['Professor'])) {
          navigate('/professor-dashboard');
        } else if (await hasRequiredRole(['LabAssistant'])) {
          navigate('/lab-assistant-dashboard');
        } else if (await hasRequiredRole(['Student'])) {
          navigate('/student-dashboard');
        } else {
          // If no role is assigned, redirect to login
          navigate('/login');
        }
      } catch (error) {
        console.error('Error checking role:', error);
        navigate('/login');
      }
    };

    checkRoleAndRedirect();
  }, [navigate]);

  return null; // This component only handles redirection
};

export default Profile; 