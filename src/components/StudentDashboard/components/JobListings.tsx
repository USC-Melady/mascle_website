import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Collapse, Badge, Alert, Spinner, Form, InputGroup } from 'react-bootstrap';
import { Job, getJobs, getApplications, JobApplication } from '../../../utils/jobManagement';
import JobApplicationModal from './JobApplicationModal';

interface JobListingsProps {
  onApplicationSubmitted: () => void;
}

const JobListings: React.FC<JobListingsProps> = ({ onApplicationSubmitted }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [userApplications, setUserApplications] = useState<JobApplication[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);

  // Convert loadJobs to useCallback to prevent recreation on each render
  const loadJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setDebugInfo('Loading job listings...');
      
      console.log('Fetching jobs...');
      const availableJobs = await getJobs();
      console.log('Jobs fetched:', availableJobs);
      
      // Make sure jobs have the correct case for status (OPEN, not Open)
      const normalizedJobs = availableJobs.map(job => ({
        ...job,
        // Normalize status to uppercase if it exists
        status: job.status ? job.status.toUpperCase() : 'UNKNOWN'
      }));
      
      setJobs(normalizedJobs);
      setFilteredJobs(normalizedJobs);
      setDebugInfo(`Loaded ${normalizedJobs.length} job listings`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to load job listings: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
      console.error('Error loading jobs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Convert loadApplications to useCallback to prevent recreation on each render
  const loadApplications = useCallback(async () => {
    try {
      setLoadingApplications(true);
      setDebugInfo('Loading your applications...');
      
      console.log('Fetching user applications...');
      const applications = await getApplications();
      console.log('User applications fetched:', applications);
      
      // Log each application for debugging
      applications.forEach(app => {
        console.log(`Application for job ${app.jobId}: Status ${app.status}`);
      });
      
      setUserApplications(applications);
      setDebugInfo(prev => `${prev || ''} | Found ${applications.length} of your applications`);
    } catch (err) {
      console.error('Error loading user applications:', err);
      setDebugInfo(prev => `${prev || ''} | Error loading applications: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoadingApplications(false);
    }
  }, []);

  // Initial load of jobs and applications
  useEffect(() => {
    loadJobs();
    loadApplications();
  }, [loadJobs, loadApplications]);

  // Improved hasAppliedToJob function with more robust checking
  const hasAppliedToJob = useCallback((jobId: string): boolean => {
    if (!jobId || userApplications.length === 0) return false;
    
    // Enhanced logging for debugging
    const matchingApplications = userApplications.filter(app => app.jobId === jobId);
    if (matchingApplications.length > 0) {
      console.log(`Found ${matchingApplications.length} existing applications for job ${jobId}:`, matchingApplications);
      return true;
    }
    
    return false;
  }, [userApplications]);

  // Filter jobs when search term or filter status changes
  useEffect(() => {
    if (jobs.length === 0) return;
    
    let filtered = [...jobs];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(term) || 
        job.description.toLowerCase().includes(term) ||
        job.lab?.name?.toLowerCase().includes(term) ||
        job.professor?.email?.toLowerCase().includes(term)
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterStatus]);

  const handleJobClick = (jobId: string) => {
    console.log('Job clicked:', jobId);
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const handleApplyClick = (job: Job) => {
    console.log('Apply clicked for job:', job);
    setApplicationError(null);
    
    // Log detailed job information for debugging
    console.log('Job details:', {
      id: job.jobId,
      title: job.title,
      status: job.status,
      rawStatus: job.status,
      statusType: typeof job.status
    });
    
    // First check - Check if user has already applied by checking the applications list
    if (hasAppliedToJob(job.jobId)) {
      const errorMsg = 'You have already applied for this position.';
      setApplicationError(errorMsg);
      setDebugInfo(`Cannot apply: ${errorMsg}`);
      // Refresh applications list to ensure we have the latest data
      loadApplications();
      return;
    }
    
    // Second check - Check if job is open for applications
    if (job.status !== 'OPEN') {
      const errorMsg = `This position is currently ${job.status?.toLowerCase() || 'unavailable'}. Applications are not being accepted at this time.`;
      setApplicationError(errorMsg);
      setDebugInfo(`Cannot apply: ${errorMsg} (Status: ${job.status})`);
      return;
    }
    
    // Third check - Check if job ID exists
    if (!job.jobId) {
      const errorMsg = 'Job ID is missing. Cannot submit application.';
      setApplicationError(errorMsg);
      setDebugInfo(`Cannot apply: ${errorMsg}`);
      return;
    }
    
    setDebugInfo(`Opening application modal for job: ${job.title} (${job.jobId})`);
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  // Function to get the appropriate badge color based on job status
  const getStatusBadgeColor = (status: string): string => {
    switch (status) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'danger';
      case 'FILLED':
        return 'info';
      case 'PENDING':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Function to handle manual refresh of applications
  const handleRefreshApplications = () => {
    loadApplications();
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        {debugInfo && <div className="mt-2 text-muted small">{debugInfo}</div>}
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Alert variant="danger">{error}</Alert>
        {debugInfo && <Alert variant="info">{debugInfo}</Alert>}
      </>
    );
  }

  if (jobs.length === 0) {
    return <Alert variant="info">No positions available at this time.</Alert>;
  }

  return (
    <>
      <Card className="mb-4 shadow-sm" style={{ width: '100%' }}>
        <Card.Header className="bg-transparent py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Open Positions</h5>
          <div className="d-flex align-items-center">
            <Badge bg="primary" className="me-2">{jobs.filter(job => job.status === 'OPEN').length} Open</Badge>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRefreshApplications}
              disabled={loadingApplications}
              title="Refresh your applications"
            >
              {loadingApplications ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <i className="bi bi-arrow-clockwise"></i>
              )}
            </Button>
          </div>
        </Card.Header>
        
        <div className="p-3 border-bottom">
          <Form>
            <div className="d-md-flex">
              <div className="flex-grow-1 mb-2 mb-md-0 me-md-2">
                <InputGroup>
                  <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search positions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="bi bi-x"></i>
                    </Button>
                  )}
                </InputGroup>
              </div>
              <div>
                <Form.Select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="OPEN">Open Positions</option>
                  <option value="CLOSED">Closed</option>
                  <option value="FILLED">Filled</option>
                  <option value="PENDING">Pending</option>
                </Form.Select>
              </div>
            </div>
          </Form>
        </div>
        
        <Card.Body className="p-0">
          {debugInfo && (
            <Alert variant="info" className="m-3">
              {debugInfo}
            </Alert>
          )}
          
          {applicationError && (
            <Alert variant="warning" className="m-3">
              {applicationError}
            </Alert>
          )}
          
          {filteredJobs.length === 0 ? (
            <Alert variant="light" className="m-3">
              No positions match your search criteria. Try adjusting your filters.
            </Alert>
          ) : (
            filteredJobs.map((job) => {
              const applied = hasAppliedToJob(job.jobId);
              return (
                <div key={job.jobId} className="border-bottom position-relative" style={{ minHeight: '100px' }}>
                  <div 
                    className="p-4 cursor-pointer d-flex justify-content-between align-items-center"
                    onClick={() => handleJobClick(job.jobId)}
                    style={{ cursor: 'pointer', minHeight: '80px' }}
                  >
                    <div className="me-3">
                      <h6 className="mb-1 d-flex align-items-center">
                        {job.title}
                        {job.status === 'OPEN' && (
                          <Badge bg="success" pill className="ms-2 fs-7">Open</Badge>
                        )}
                        {applied && (
                          <Badge bg="info" pill className="ms-2 fs-7">Applied</Badge>
                        )}
                      </h6>
                      <p className="text-muted mb-0 small">
                        <strong>Lab:</strong> {job.lab?.name || 'Unknown Lab'} • 
                        <strong> Professor:</strong> {job.professor?.email || 'Unknown Professor'}
                      </p>
                    </div>
                    <div className="d-flex align-items-center">
                      <Badge 
                        bg={getStatusBadgeColor(job.status)}
                        className="me-2"
                      >
                        {job.status || 'UNKNOWN'}
                      </Badge>
                      {applied && (
                        <Badge bg="success" className="ms-2">
                          Applied
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <Collapse in={expandedJobId === job.jobId}>
                    <div className="p-4 bg-light border-top">
                      <h6>Description</h6>
                      <p className="whitespace-pre-wrap">{job.description}</p>
                      
                      {job.requirements && (
                        <>
                          <h6>Requirements</h6>
                          <p className="whitespace-pre-wrap">{job.requirements}</p>
                        </>
                      )}
                      
                      <div className="d-flex justify-content-between mt-3 align-items-center">
                        <div>
                          {job.updatedAt && (
                            <Badge bg="info">
                              Updated: {new Date(job.updatedAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        
                        <Button 
                          variant="primary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(job);
                          }}
                          disabled={applied || job.status !== 'OPEN'}
                        >
                          {applied ? 'Applied' : 'Apply Now'}
                        </Button>
                      </div>
                    </div>
                  </Collapse>
                </div>
              );
            })
          )}
        </Card.Body>
      </Card>

      {selectedJob && (
        <JobApplicationModal
          show={showApplyModal}
          onHide={() => {
            setShowApplyModal(false);
            // Refresh applications list when modal is closed, but don't reload the page
            loadApplications();
          }}
          job={selectedJob}
          onApplicationSubmitted={() => {
            // Just update the applications list, don't close the modal
            loadApplications();
          }}
          onSubmitSuccess={() => {
            // When the "View My Applications" button is clicked, close the modal and switch tabs
            setShowApplyModal(false);
            // Call the parent function which will switch to the applications tab
            onApplicationSubmitted();
          }}
        />
      )}
    </>
  );
};

export default JobListings; 