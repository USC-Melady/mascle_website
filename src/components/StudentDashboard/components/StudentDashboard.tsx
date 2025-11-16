// components/StudentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Container, Alert, Tabs, Tab, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  getAuthenticatedUser, 
  hasRequiredRole
} from '../../../utils/auth';
import { getApplications, getJobs, JobApplication } from '../../../utils/jobManagement';

// Import components
import DashboardHeader from './DashboardHeader';
import WelcomeCard from './WelcomeCard';
import ApplicationsCard from './ApplicationsCard';
import ProfileCard from './ProfileCard';
import QuickLinksCard from './QuickLinksCard';
import JobListings from './JobListings';

const StudentDashboard: React.FC = () => {
  // User state

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Resume-related state
  const [resumeUploaded, setResumeUploaded] = useState(false);
  
  // Application and position data
  const [applications, setApplications] = useState<JobApplication[]>([]);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<string>('applications');

  // Function to fetch dashboard data - defined outside useEffect so it can be reused
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user has Student role
      const hasRole = await hasRequiredRole(['Student']);
      if (!hasRole) {
        setError('You do not have access to the student dashboard.');
        setLoading(false);
        return;
      }

      // Get user info
      const user = await getAuthenticatedUser();
      if (!user) {
        throw new Error('User not authenticated');
      }
      

      
      // Set actual email
      const userEmail = user.attributes?.email as string || '';
      setEmail(userEmail);
      
      // Get display name from user attributes
      let userDisplayName = '';
      if (user.attributes?.given_name || user.attributes?.name) {
        userDisplayName = (user.attributes.given_name as string || user.attributes.name as string);
      } else if (user.attributes?.email) {
        userDisplayName = user.attributes.email as string;
      } else {
        userDisplayName = user.username || 'Student';
      }

      // Convert to Title Case if it's not an email address
      if (!userDisplayName.includes('@')) {
        userDisplayName = userDisplayName
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
      }

      setDisplayName(userDisplayName);
      
      // Check if user has resume (placeholder for now)
      setResumeUploaded(false);

      // Fetch applications and open positions
      const [applicationsData, jobsData] = await Promise.all([
        getApplications(),
        getJobs()
      ]);

      console.log('Applications data:', applicationsData);
      console.log('Jobs data:', jobsData);

      // Filter applications for current user
      console.log('Current user object:', user);
      console.log('User username:', user.username);
      console.log('User email:', user.attributes?.email);
      
      // Try filtering by both username and email to see which one works
      const userApplicationsByUsername = applicationsData.filter(app => app.studentId === user.username);
      const userApplicationsByEmail = applicationsData.filter(app => app.studentId === user.attributes?.email);
      
      console.log('Applications by username:', userApplicationsByUsername);
      console.log('Applications by email:', userApplicationsByEmail);
      console.log('All applications studentIds:', applicationsData.map(app => ({ studentId: app.studentId, matchId: app.matchId })));
      
      // Use email-based filtering if it finds applications, otherwise use username
      const userApplications = userApplicationsByEmail.length > 0 ? userApplicationsByEmail : userApplicationsByUsername;
      console.log('Final user applications:', userApplications);
      setApplications(userApplications);

      // Normalize jobs - make sure status is uppercase for consistent comparison
      const normalizedJobs = jobsData.map(job => ({
        ...job,
        status: job.status ? job.status.toUpperCase() : 'UNKNOWN'
      }));
      
      // Log open jobs for debugging
      const openJobs = normalizedJobs.filter(job => job.status === 'OPEN');
      console.log('Open jobs:', openJobs);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);


  
  // Handle tab change
  const handleTabChange = (tab: string | null) => {
    if (tab) {
      setActiveTab(tab);
    }
  };
  
  // Handle application submission - switch to applications tab
  const handleApplicationSubmitted = () => {
    // First update data without refreshing the page
    fetchDashboardData();
    // Then switch to applications tab
    setActiveTab('applications');
  };

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
            <Alert.Link onClick={() => navigate('/login')}>
              Go to Login
            </Alert.Link>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-3 py-3">
      {/* Header */}
      <DashboardHeader />
      
      <div className="row">
        {/* Left Column */}
        <div className="col-lg-9">
          {/* Welcome Card */}
          <WelcomeCard 
            username={displayName}
            resumeUploaded={resumeUploaded}
            navigate={navigate}
          />
          
          {/* Tabbed Interface for Applications and Job Listings */}
          <div className="card mb-4 shadow-sm">
            <div className="card-header bg-transparent p-0">
              <Tabs
                id="dashboard-tabs"
                activeKey={activeTab}
                onSelect={handleTabChange}
                className="mb-0 border-bottom-0"
                fill
              >
                <Tab 
                  eventKey="applications" 
                  title={
                    <span>
                      <i className="bi bi-clipboard-check me-2"></i>
                      My Applications <Badge bg="primary" className="ms-1">{applications.length}</Badge>
                    </span>
                  }
                >
                  <div className="p-0">
                    {applications.length === 0 ? (
                      <Alert variant="light" className="m-3 mb-0">
                        You haven't applied to any positions yet. Check the "Open Positions" tab to find opportunities.
                      </Alert>
                    ) : (
                      <ApplicationsCard 
                        applications={applications}
                        onApplicationSubmitted={fetchDashboardData}
                      />
                    )}
                  </div>
                </Tab>
                
                <Tab 
                  eventKey="jobs" 
                  title={
                    <span>
                      <i className="bi bi-briefcase me-2"></i>
                      Open Positions
                    </span>
                  }
                >
                  <div className="p-0">
                    <JobListings onApplicationSubmitted={handleApplicationSubmitted} />
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
        
        {/* Right Column */}
        <div className="col-lg-3">
          {/* Profile Card */}
          <ProfileCard 
            username={displayName}
            email={email}
            resumeUploaded={resumeUploaded}
            onResumeClick={() => navigate('/student-dashboard/resume')}
          />
          
          {/* Quick Links Card */}
          <QuickLinksCard 
            quickLinks={[
              { icon: 'bi-briefcase', text: 'My Applications', onClick: () => setActiveTab('applications') },
              { icon: 'bi-search', text: 'Find Open Positions', onClick: () => setActiveTab('jobs') }
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

export default StudentDashboard;