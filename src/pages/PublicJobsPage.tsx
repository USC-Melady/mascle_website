import React, { useState, useEffect } from 'react';
import PublicJobList from '../components/PublicJobList';
import { Typography, Container, Box, Button, Link } from '@mui/material';
import { isAuthenticated } from '../utils/auth';

const PublicJobsPage: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await isAuthenticated();
        setAuthenticated(authStatus);
      } catch (err) {
        console.error('Error checking authentication:', err);
      }
    };
    
    checkAuth();
  }, []);

  return (
    <Container maxWidth={false} sx={{ maxWidth: '95vw', px: 3 }}>
      <Box sx={{ my: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Research Opportunities
          </Typography>
          {!authenticated && (
            <Box>
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link}
                href="/login"
                sx={{ mr: 2 }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                component={Link}
                href="/login"
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Box>
        
        <Typography variant="body1" paragraph>
          Browse through our current openings for undergraduate research positions.
          {!authenticated && ' Some positions show limited previews - sign in to view full details and apply.'}
        </Typography>
        
        <PublicJobList />
      </Box>
    </Container>
  );
};

export default PublicJobsPage; 