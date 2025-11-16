import { useState, useEffect } from 'react';
import { getAuthenticatedUser } from '../utils/auth';

export const useDashboardUrl = () => {
  const [dashboardUrl, setDashboardUrl] = useState('/student-dashboard'); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getDashboardUrl = async () => {
      try {
        const user = await getAuthenticatedUser();
        if (user?.roles) {
          if (user.roles.includes('Admin')) {
            setDashboardUrl('/admin-dashboard');
          } else if (user.roles.includes('Professor')) {
            setDashboardUrl('/professor-dashboard');
          } else if (user.roles.includes('LabAssistant')) {
            setDashboardUrl('/lab-assistant-dashboard');
          } else {
            setDashboardUrl('/student-dashboard');
          }
        }
      } catch (error) {
        console.error('Error getting dashboard URL:', error);
        // Keep default fallback
      } finally {
        setLoading(false);
      }
    };

    getDashboardUrl();
  }, []);

  return { dashboardUrl, loading };
};