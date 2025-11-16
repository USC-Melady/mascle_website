import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Button, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent,
  DialogContentText,
  Alert,
  Collapse,
  IconButton,
  Paper,
  Container
} from '@mui/material';
import { 
  ExpandMore as ExpandMoreIcon, 
  ExpandLess as ExpandLessIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  ExitToApp as LoginIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ApplicationForm from './ApplicationForm';
import { isAuthenticated, hasRequiredRole } from '../utils/auth';
import { getJobs, Job as JobFromAPI } from '../utils/jobManagement';

interface Lab {
  id?: string;
  labId?: string;
  name?: string;
  description?: string;
}

interface Job extends Omit<JobFromAPI, 'requirements' | 'lab'> {
  id?: string;
  requirements?: string[];
  isPreview?: boolean;
  lab?: Lab;
}

const PublicJobList: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [selectedJobForApplication, setSelectedJobForApplication] = useState<Job | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isProfessor, setIsProfessor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [authenticated]);

  const checkUserAuthentication = async () => {
    try {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        const studentRole = await hasRequiredRole(['Student']);
        const professorRole = await hasRequiredRole(['Professor']);
        const adminRole = await hasRequiredRole(['Admin']);
        
        setIsStudent(studentRole);
        setIsProfessor(professorRole);
        setIsAdmin(adminRole);
      }
    } catch (err) {
      console.error('Error checking authentication:', err);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);
      
      let jobsData: Job[] = [];
      
      if (authenticated) {
        // User is authenticated - get full job details from authenticated endpoint
        console.log('Fetching jobs for authenticated user');
        const apiJobs = await getJobs();
        
        // Filter to only show OPEN jobs for public viewing and transform to local Job interface
        jobsData = apiJobs
          .filter(job => {
            const isOpen = job.status?.toUpperCase() === 'OPEN';
            const isPublicVisible = !job.visibility || job.visibility === 'public';
            return isOpen && isPublicVisible;
          })
          .map((job): Job => ({
            ...job,
            id: job.jobId, // Map jobId to id for compatibility
            requirements: job.requirements ? [job.requirements] : [], // Convert string to array
            isPreview: false, // Authenticated users get full access
            lab: job.lab ? {
              id: job.labId,
              labId: job.labId,
              name: job.lab.name,
              description: job.lab.name // Use name as description if needed
            } : undefined
          }));
      } else {
        // User is not authenticated - use public endpoint with limited details
        console.log('Fetching jobs for unauthenticated user');
        const apiBaseUrl = 'https://scvh6uq7r1.execute-api.us-east-1.amazonaws.com/dev';
        const response = await fetch(`${apiBaseUrl}/public-jobs`);
        
        if (!response.ok) {
          throw new Error(`Error fetching jobs: ${response.status}`);
        }
        
        const data = await response.json();
        jobsData = data.jobs || [];
      }
      
              // Ensure requirements is always an array and all required fields have defaults
        const processedJobs = jobsData.map((job: Partial<Job>) => ({
          ...job,
          id: job.id || job.jobId || '',
          jobId: job.jobId || '',
          labId: job.labId || '',
          title: job.title || '',
          description: job.description || '',
          professorId: job.professorId || job.createdBy || '',
          requirements: Array.isArray(job.requirements) 
            ? job.requirements.filter(req => req !== 'View details by logging in') 
            : [],
          status: job.status || 'active',
          visibility: job.visibility || 'public',
          isPreview: job.isPreview || false,
          createdAt: job.createdAt || new Date().toISOString()
        }));
      
      setJobs(processedJobs);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load available jobs. Please try again later.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExpandJob = (jobId: string, job: Job) => {
    // If this is a preview (limited visibility) and user is not authenticated, redirect to login
    if (job.isPreview && !authenticated) {
      navigate('/login', { state: { from: { pathname: '/jobs/public' } } });
      return;
    }
    
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const handleApplyClick = (job: Job) => {
    if (!authenticated) {
      setShowAuthAlert(true);
      return;
    }
    
    if (!isStudent) {
      alert("Only students can apply for jobs. Please contact support if you believe this is an error.");
      return;
    }

    setSelectedJobForApplication(job);
    setApplicationDialogOpen(true);
  };

  const handleCloseApplicationDialog = () => {
    setApplicationDialogOpen(false);
  };

  const handleApplicationSuccess = () => {
    setApplicationDialogOpen(false);
    setApplicationSuccess(true);
  };

  const handleLoginRedirect = () => {
    navigate('/login', { state: { from: { pathname: '/jobs/public' } } });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
        <Button variant="outlined" sx={{ mt: 2 }} onClick={fetchJobs}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} sx={{ maxWidth: '95vw', px: 4 }}>
      {applicationSuccess && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setApplicationSuccess(false)}
        >
          Your application has been submitted successfully! You can track your application status in your student dashboard.
        </Alert>
      )}
      
      {showAuthAlert && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          onClose={() => setShowAuthAlert(false)}
          action={
            <Button color="inherit" size="small" onClick={handleLoginRedirect}>
              Log In
            </Button>
          }
        >
          You need to be logged in as a student to apply for jobs.
        </Alert>
      )}

      {jobs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No open positions available at this time. Please check back later.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {jobs.map((job) => {
            const jobId = job.id || job.jobId;
            const isExpanded = expandedJob === jobId;
            const canApply = authenticated && isStudent;
            const canViewFull = authenticated && (isStudent || isProfessor || isAdmin);
            
            return (
              <Card 
                key={jobId}
                sx={{ 
                  transition: 'all 0.3s ease',
                  width: '100%',
                  minHeight: '250px',
                  mx: 'auto',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    boxShadow: 3 
                  }
                }}
              >
                <CardContent sx={{ p: 4, '&:last-child': { pb: 4 } }}>
                  {/* Header Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" component="h2" sx={{ mb: 1, fontWeight: 600 }}>
                        {job.title || 'Untitled Position'}
                        {job.isPreview && !authenticated && (
                          <LockIcon sx={{ ml: 1, fontSize: '1rem', color: 'orange' }} />
                        )}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {job.lab?.name || 'Unknown Lab'}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Posted {formatDate(job.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    
                    <IconButton 
                      onClick={() => handleExpandJob(jobId, job)}
                      sx={{ ml: 2 }}
                    >
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>

                  {/* Preview Description */}
                  <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {job.description}
                  </Typography>

                  {/* Preview Requirements */}
                  {job.requirements && job.requirements.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                        Requirements:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {Array.isArray(job.requirements) && job.requirements.slice(0, 4).map((req, index) => (
                          <Chip 
                            key={index} 
                            label={req} 
                            size="small" 
                            variant="outlined"
                          />
                        ))}
                        {Array.isArray(job.requirements) && job.requirements.length > 4 && (
                          <Chip 
                            label={`+${job.requirements.length - 4} more`} 
                            size="small" 
                            variant="outlined"
                            sx={{ fontStyle: 'italic' }}
                          />
                        )}
                      </Box>
                    </Box>
                  )}

                  {/* Preview Notice */}
                  {job.isPreview && !authenticated && (
                    <Alert 
                      severity="info" 
                      sx={{ mb: 2 }}
                      icon={<LockIcon />}
                    >
                      <Typography variant="body2">
                        <strong>Sign in to view full details and apply.</strong>
                      </Typography>
                    </Alert>
                  )}

                  {/* Expanded Content */}
                  <Collapse in={isExpanded && canViewFull}>
                    <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                      {job.lab?.description && (
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            About the Lab
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {job.lab.description}
                          </Typography>
                        </Box>
                      )}

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        {canApply ? (
                          <Button 
                            variant="contained" 
                            size="large"
                            onClick={() => handleApplyClick(job)}
                          >
                            Apply Now
                          </Button>
                        ) : authenticated && (isProfessor || isAdmin) ? (
                          <Button 
                            variant="outlined" 
                            size="large"
                            disabled
                            startIcon={<PersonIcon />}
                          >
                            {isProfessor ? 'Faculty View Only' : 'Admin View Only'}
                          </Button>
                        ) : !authenticated ? (
                          <Button 
                            variant="contained" 
                            size="large"
                            startIcon={<LoginIcon />}
                            onClick={handleLoginRedirect}
                            color="warning"
                          >
                            Sign In to Apply
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  </Collapse>

                  {/* Quick Action for Collapsed State */}
                  {!isExpanded && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => handleExpandJob(jobId, job)}
                        endIcon={job.isPreview && !authenticated ? <LockIcon /> : <ExpandMoreIcon />}
                      >
                        {job.isPreview && !authenticated ? 'Sign In for Details' : 'View Details'}
                      </Button>
                      

                      {canApply && (
                        <Button 
                          variant="contained" 
                          onClick={() => handleApplyClick(job)}
                          size="small"
                        >
                          Apply
                        </Button>
                      )}
                      
                      {authenticated && !canApply && !isProfessor && !isAdmin && (
                        <Button 
                          variant="outlined" 
                          disabled
                          size="small"
                        >
                          View Only
                        </Button>
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
      
      <Dialog open={applicationDialogOpen} onClose={handleCloseApplicationDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Apply for {selectedJobForApplication?.title || 'Position'}
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText paragraph>
            Please fill out the application form below. Make sure to upload your resume and provide a detailed cover letter explaining why you're interested in this position.
          </DialogContentText>
          
          {selectedJobForApplication && (
            <ApplicationForm 
              jobId={selectedJobForApplication.jobId} 
              onSuccess={handleApplicationSuccess}
              onCancel={handleCloseApplicationDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default PublicJobList;