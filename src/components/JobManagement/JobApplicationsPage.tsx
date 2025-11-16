import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Form, InputGroup, Modal, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faCheck, faTimes, faEye, faClipboardList, faDownload, faUserCircle, faHome, faBriefcase, faUsers } from '@fortawesome/free-solid-svg-icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { hasRequiredRole, getAuthenticatedUser } from '../../utils/auth';
import { JobApplication, getApplications, getApplicationsForJob, updateApplicationStatus } from '../../utils/jobManagement';
import { getUrl } from 'aws-amplify/storage';
import ApplicationStatusDropdown from '../shared/ApplicationStatusDropdown';

interface JobApplicationsPageProps {
  filterJobId?: string | null;
  filterJobTitle?: string | null;
}

const JobApplicationsPage: React.FC<JobApplicationsPageProps> = ({ filterJobId, filterJobTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobFilter, setJobFilter] = useState<string>(filterJobId || 'all');
  const [selectedJobs, setSelectedJobs] = useState<string[]>(filterJobId ? [filterJobId] : []);
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to update URL with current filter state
  const updateURL = (newSearchTerm?: string, newStatusFilter?: string, newSelectedJobs?: string[]) => {
    const params = new URLSearchParams(location.search);
    
    // Update search parameter
    const searchValue = newSearchTerm !== undefined ? newSearchTerm : searchTerm;
    if (searchValue) {
      params.set('search', searchValue);
    } else {
      params.delete('search');
    }

    // Update status parameter
    const statusValue = newStatusFilter !== undefined ? newStatusFilter : statusFilter;
    if (statusValue && statusValue !== 'all') {
      params.set('status', statusValue);
    } else {
      params.delete('status');
    }

    // Update jobs parameter
    const jobsValue = newSelectedJobs !== undefined ? newSelectedJobs : selectedJobs;
    if (jobsValue.length > 0) {
      params.set('jobs', jobsValue.join(','));
    } else {
      params.delete('jobs');
    }

    // Keep existing tab parameter
    const currentParams = new URLSearchParams(location.search);
    if (currentParams.get('tab')) {
      params.set('tab', currentParams.get('tab')!);
    }
    if (currentParams.get('fromJob')) {
      params.delete('fromJob'); // Remove fromJob after initial filter is applied
    }
    if (currentParams.get('jobTitle')) {
      params.delete('jobTitle'); // Remove jobTitle after initial filter is applied
    }

    // Navigate to new URL without triggering a full page reload
    const newSearch = params.toString();
    const newUrl = `${location.pathname}${newSearch ? '?' + newSearch : ''}`;
    navigate(newUrl, { replace: true });
  };

  // Clear filters on page refresh (detect by checking navigation type)
  useEffect(() => {
    // Clear filters when page is refreshed (not when navigating)
    const clearFiltersOnRefresh = () => {
      // Check if this is a page refresh by looking at performance navigation API
      if (performance.navigation && performance.navigation.type === 1) { // TYPE_RELOAD
        clearAllFilters();
      } else if (window.performance.getEntriesByType("navigation")[0]) {
        const navEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
        if (navEntry.type === 'reload') {
          clearAllFilters();
        }
      }
    };

    clearFiltersOnRefresh();
  }, []); // Only run on component mount

  // Initialize state from URL parameters on component mount (after potential refresh clearing)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    const searchParam = params.get('search');
    const statusParam = params.get('status');
    const jobsParam = params.get('jobs');
    
    if (searchParam) {
      setSearchTerm(searchParam);
    }
    
    if (statusParam) {
      setStatusFilter(statusParam);
    }
    
    if (jobsParam) {
      const jobIds = jobsParam.split(',').filter(Boolean);
      setSelectedJobs(jobIds);
      setJobFilter('all'); // Clear single filter when multiple jobs are selected
    }
  }, [location.search]);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // Check if user has required roles
        const hasRole = await hasRequiredRole(['Admin', 'Professor', 'LabAssistant']);
        if (!hasRole) {
          setError('You do not have permission to access application reviews.');
          setLoading(false);
          return;
        }

        // Get current user to filter applications
        const user = await getAuthenticatedUser();

        // Fetch applications from the backend
        let applicationsData: JobApplication[] = [];
        
        if (filterJobId) {
          // If we have a specific job filter, get applications for that job
          applicationsData = await getApplicationsForJob(filterJobId);
          console.log(`Found ${applicationsData.length} applications for job ${filterJobId}`);
        } else {
          // Get applications for all jobs in user's labs
          if (user?.roles?.includes('Admin')) {
            // Admins see all applications - use the original getApplications function
            console.log('Admin user: attempting to get all applications via getApplications');
            applicationsData = await getApplications();
          } else {
            // For Professors and Lab Assistants, get jobs in their labs first
            console.log('Professor/Lab Assistant: getting applications for lab jobs');
            try {
              // Import functions to get user's jobs
              const { getJobsForLabs } = await import('../../utils/jobManagement');
              const { getUserLabs } = await import('../../utils/labManagement');
              
              const userLabs = await getUserLabs();
              console.log('User labs:', userLabs);
              
              if (userLabs.length > 0) {
                const userLabIds = userLabs.map(lab => lab.labId);
                console.log('Getting jobs for lab IDs:', userLabIds);
                
                // Get all jobs for user's labs
                const labJobs = await getJobsForLabs(userLabIds);
                console.log(`Found ${labJobs.length} jobs in user's labs`);
                
                // Get applications for each job
                const allJobApplications = await Promise.all(
                  labJobs.map(async (job) => {
                    console.log(`Getting applications for job: ${job.title} (${job.jobId})`);
                    const jobApps = await getApplicationsForJob(job.jobId);
                    console.log(`Job ${job.title} has ${jobApps.length} applications`);
                    return jobApps;
                  })
                );
                
                // Flatten all applications into single array
                applicationsData = allJobApplications.flat();
                console.log(`Total applications from all lab jobs: ${applicationsData.length}`);
              } else {
                console.log('User has no associated labs');
                applicationsData = [];
              }
            } catch (error) {
              console.error('Error getting lab applications:', error);
              // Fallback to empty array
              applicationsData = [];
            }
          }
        }

        console.log(`Final applications count: ${applicationsData.length}`);
        setApplications(applicationsData);
        setFilteredApplications(applicationsData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications. Please try again later.');
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filterJobId]); // Re-fetch when filterJobId changes

  // Update job filter and selected jobs when filterJobId prop changes
  useEffect(() => {
    if (filterJobId) {
      setJobFilter(filterJobId);
      setSelectedJobs([filterJobId]);
    } else {
      setJobFilter('all');
      setSelectedJobs([]);
    }
  }, [filterJobId]);

  useEffect(() => {
    // Filter applications based on search term, status filter, and job filter
    let filtered = applications;

    if (searchTerm) {
      filtered = filtered.filter(app => 
        (app.student?.email && app.student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.job?.title && app.job.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (app.userDetails?.fullName && app.userDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Support both single job filter and multiple job selections
    if (selectedJobs.length > 0) {
      filtered = filtered.filter(app => selectedJobs.includes(app.jobId));
    } else if (jobFilter !== 'all') {
      filtered = filtered.filter(app => app.jobId === jobFilter);
    }

    setFilteredApplications(filtered);
  }, [searchTerm, statusFilter, jobFilter, selectedJobs, applications]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    updateURL(newSearchTerm);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatusFilter = e.target.value;
    setStatusFilter(newStatusFilter);
    updateURL(undefined, newStatusFilter);
  };

  const handleJobFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newJobFilter = e.target.value;
    setJobFilter(newJobFilter);
    
    // Clear multiple selections when using single filter
    const newSelectedJobs = newJobFilter !== 'all' ? [newJobFilter] : [];
    setSelectedJobs(newSelectedJobs);
    updateURL(undefined, undefined, newSelectedJobs);
  };

  const handleJobToggle = (jobId: string) => {
    const newSelectedJobs = selectedJobs.includes(jobId)
      ? selectedJobs.filter(id => id !== jobId)
      : [...selectedJobs, jobId];
    
    setSelectedJobs(newSelectedJobs);
    setJobFilter('all'); // Clear single filter when using multiple selections
    updateURL(undefined, undefined, newSelectedJobs);
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setJobFilter('all');
    setSelectedJobs([]);
    updateURL('', 'all', []);
  };

  const clearJobFilters = () => {
    setJobFilter('all');
    setSelectedJobs([]);
    updateURL(undefined, undefined, []);
  };

  // Breadcrumb navigation handlers
  const navigateToDashboard = () => {
    clearAllFilters();
    navigate('/professor-dashboard');
  };

  const navigateToJobs = () => {
    clearAllFilters();
    navigate('/professor-dashboard?tab=jobs');
  };

  const navigateToApplicationsClean = () => {
    clearAllFilters();
    navigate('/professor-dashboard?tab=applications');
  };

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleUpdateStatus = async (matchId: string, newStatus: string) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log(`Updating application ${matchId} status to ${newStatus}`);
      
      const updatedApplication = await updateApplicationStatus(matchId, newStatus);
      
      if (updatedApplication) {
        // Update the applications list with the updated application
        setApplications(applications.map(app => 
          app.matchId === matchId ? updatedApplication : app
        ));
        
        // Update filtered applications as well
        setFilteredApplications(filteredApplications.map(app => 
          app.matchId === matchId ? updatedApplication : app
        ));
        
        // If the application is currently selected, update the selected application
        if (selectedApplication && selectedApplication.matchId === matchId) {
          setSelectedApplication(updatedApplication);
        }
        
        console.log(`Successfully updated application ${matchId} to ${newStatus}`);
      } else {
        console.error('Failed to update application - no data returned');
        setError('Failed to update application status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };


  const handleDownloadResume = async (application: JobApplication) => {
    if (!application.resumeUrl) {
      alert('No resume available for this application.');
      return;
    }
    
    try {
      setDownloadingResume(true);
      
      // Get the file from S3 using getUrl from aws-amplify/storage
      const result = await getUrl({
        key: application.resumeUrl,
        options: {
          accessLevel: 'private'
        }
      });
      
      // Create a temporary link and click it to download
      const link = document.createElement('a');
      link.href = result.url.toString();
      link.target = '_blank';
      
      // Extract filename from the path
      const fileName = application.resumeUrl.split('/').pop() || 'resume.pdf';
      const applicantName = application.userDetails?.fullName || 'applicant';
      const safeName = applicantName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      
      link.download = `${safeName}_${fileName}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setDownloadingResume(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'Reviewed':
        return <Badge bg="info">Reviewed</Badge>;
      case 'Approved':
        return <Badge bg="success">Approved</Badge>;
      case 'Rejected':
        return <Badge bg="danger">Rejected</Badge>;
      default:
        return <Badge bg="light">Unknown</Badge>;
    }
  };

  const handleStatusChange = async (matchId: string, newStatus: string) => {
    if (isSubmitting) return;
    await handleUpdateStatus(matchId, newStatus);
  };

  if (loading) {
    return (
      <Container>
        <Alert variant="info">Loading applications...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      {/* Breadcrumb Navigation */}
      <Row className="mx-0 mb-3">
        <Col>
          <Breadcrumb className="bg-light p-3 rounded-3 shadow-sm">
            <Breadcrumb.Item onClick={navigateToDashboard} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faHome} className="me-1" />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item onClick={navigateToJobs} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faBriefcase} className="me-1" />
              Job Management
            </Breadcrumb.Item>
            <Breadcrumb.Item active>
              <FontAwesomeIcon icon={faUsers} className="me-1" />
              Applications
            </Breadcrumb.Item>
          </Breadcrumb>
        </Col>
      </Row>

      <Row className="mx-0 mb-4">
        <Col>
          <h1>
            <FontAwesomeIcon icon={faClipboardList} className="me-2" />
            Review Applications
          </h1>
          <p className="text-muted">
            Review and manage job applications from students. 
            {(selectedJobs.length > 0 || searchTerm || statusFilter !== 'all') && (
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 ms-2"
                onClick={navigateToApplicationsClean}
              >
                Clear all filters to see all applications
              </Button>
            )}
          </p>
        </Col>
      </Row>

      <Row className="mx-0">
        <Col md={12}>
          <Card className="mb-4">
            <Card.Header className="bg-light">
              {/* Active Filters Display */}
              {(selectedJobs.length > 0 || filterJobTitle || searchTerm || statusFilter !== 'all') && (
                <Row className="mb-2">
                  <Col>
                    <Alert variant="info" className="mb-0">
                      <div className="d-flex align-items-center justify-content-between">
                        <div>
                          <strong>Active Filters:</strong>
                          {selectedJobs.length > 0 && (
                            <span className="ms-2">
                              Jobs: {selectedJobs.length > 1 ? `${selectedJobs.length} selected` : 
                                applications.find(app => app.jobId === selectedJobs[0])?.job?.title || 'Unknown'}
                            </span>
                          )}
                          {filterJobTitle && !selectedJobs.length && (
                            <span className="ms-2">Job: {filterJobTitle}</span>
                          )}
                          {statusFilter !== 'all' && (
                            <span className="ms-2">Status: {statusFilter}</span>
                          )}
                          {searchTerm && (
                            <span className="ms-2">Search: "{searchTerm}"</span>
                          )}
                        </div>
                        <div>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={clearJobFilters}
                          >
                            Clear Job Filters
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={clearAllFilters}
                          >
                            Clear All
                          </Button>
                        </div>
                      </div>
                    </Alert>
                  </Col>
                </Row>
              )}
              <Row className="align-items-center">
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <FontAwesomeIcon icon={faSearch} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select 
                    value={jobFilter}
                    onChange={handleJobFilter}
                  >
                    <option value="all">All Jobs</option>
                    {[...new Set(applications.map(app => app.job?.title).filter(Boolean))].map(jobTitle => {
                      const jobId = applications.find(app => app.job?.title === jobTitle)?.jobId;
                      return (
                        <option key={jobId} value={jobId}>
                          {jobTitle}
                        </option>
                      );
                    })}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select 
                    value={statusFilter}
                    onChange={handleStatusFilter}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Col>
              </Row>
              
              {/* Advanced Job Filter Section */}
              <Row className="mt-3">
                <Col>
                  <div className="border-top pt-3">
                    <h6 className="mb-2">
                      <FontAwesomeIcon icon={faSearch} className="me-2" />
                      Multiple Job Selection
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {[...new Set(applications.map(app => app.job?.title).filter(Boolean))].map(jobTitle => {
                        const jobId = applications.find(app => app.job?.title === jobTitle)?.jobId;
                        const isSelected = selectedJobs.includes(jobId!);
                        const appCount = applications.filter(app => app.jobId === jobId).length;
                        
                        return (
                          <Button
                            key={jobId}
                            variant={isSelected ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => handleJobToggle(jobId!)}
                            className="mb-1"
                          >
                            <Form.Check
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by button click
                              className="d-inline me-2"
                              style={{ pointerEvents: 'none' }}
                            />
                            {jobTitle} ({appCount})
                          </Button>
                        );
                      })}
                    </div>
                    {selectedJobs.length > 0 && (
                      <small className="text-muted mt-2 d-block">
                        {selectedJobs.length} job{selectedJobs.length > 1 ? 's' : ''} selected • 
                        {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} shown
                      </small>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Applicant</th>
                    <th>Job Title</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map(app => (
                      <tr key={app.matchId}>
                        <td>
                          <div className="fw-bold">{app.userDetails?.fullName || 'Unknown'}</div>
                          <small className="text-muted">{app.student?.email || app.userDetails?.email || 'No email'}</small>
                        </td>
                        <td>{app.job?.title || 'Unknown Job'}</td>
                        <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <ApplicationStatusDropdown
                            application={app}
                            onStatusChange={handleStatusChange}
                            isSubmitting={isSubmitting}
                          />
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleViewApplication(app)}
                              title="View Application"
                            >
                              <FontAwesomeIcon icon={faEye} />
                            </Button>
                            
                            {app.resumeUrl && (
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                onClick={() => handleDownloadResume(app)}
                                disabled={downloadingResume}
                                title="Download Resume"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4">
                        <div className="text-muted">
                          <FontAwesomeIcon icon={faClipboardList} size="3x" className="mb-3 opacity-25" />
                          <h5>No Applications Found</h5>
                          <p className="mb-0">
                            {selectedJobs.length > 0 || filterJobId || filterJobTitle
                              ? `No applications match your current filter criteria. Try adjusting or clearing filters to see more results.`
                              : searchTerm 
                                ? `No applications match "${searchTerm}". Try a different search term.`
                                : statusFilter !== 'all'
                                  ? `No applications with "${statusFilter}" status found.`
                                  : 'No students have applied to jobs in your labs yet. Applications will appear here once students submit them to job postings in labs you manage.'
                            }
                          </p>
                          {(selectedJobs.length > 0 || searchTerm || statusFilter !== 'all') && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="mt-3"
                              onClick={clearAllFilters}
                            >
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Application Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Application Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <>
              <Row>
                <Col md={6}>
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                    Applicant Information
                  </h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <th style={{ width: '120px' }}>Name:</th>
                        <td>{selectedApplication.userDetails?.fullName || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <th>Email:</th>
                        <td>{selectedApplication.student?.email || selectedApplication.userDetails?.email || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <th>Phone:</th>
                        <td>{selectedApplication.userDetails?.phone || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <th>Education:</th>
                        <td>{selectedApplication.userDetails?.education || 'Not provided'}</td>
                      </tr>
                      <tr>
                        <th>Resume:</th>
                        <td>
                          {selectedApplication.resumeUrl ? (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleDownloadResume(selectedApplication)}
                              disabled={downloadingResume}
                            >
                              <FontAwesomeIcon icon={faDownload} className="me-1" />
                              Download Resume
                            </Button>
                          ) : (
                            'No resume provided'
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <h5 className="mb-3">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    Application Details
                  </h5>
                  <Table borderless size="sm">
                    <tbody>
                      <tr>
                        <th style={{ width: '120px' }}>Job:</th>
                        <td>{selectedApplication.job?.title || 'Unknown Job'}</td>
                      </tr>
                      <tr>
                        <th>Status:</th>
                        <td>{getStatusBadge(selectedApplication.status)}</td>
                      </tr>
                      <tr>
                        <th>Applied:</th>
                        <td>
                          {selectedApplication.createdAt 
                            ? new Date(selectedApplication.createdAt).toLocaleDateString() 
                            : 'N/A'}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <h5 className="mt-3">Cover Letter</h5>
              <Card className="bg-light mb-3">
                <Card.Body>
                  <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                    {selectedApplication.coverLetter || 'No cover letter provided.'}
                  </pre>
                </Card.Body>
              </Card>

              {/* Application Questions Section */}
              <h5 className="mt-4">
                <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                Application Questions
              </h5>
              <Card className="bg-light mb-3">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <Table borderless size="sm">
                        <tbody>
                          <tr>
                            <th style={{ width: '180px' }}>Summer Availability:</th>
                            <td>
                              <strong>{selectedApplication.summerAvailability || 'Not specified'}</strong>
                            </td>
                          </tr>
                          <tr>
                            <th>Hours Per Week:</th>
                            <td>
                              <strong>{selectedApplication.hoursPerWeek || 'Not specified'}</strong>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      <div>
                        <strong>Research Expectations:</strong>
                        <div className="mt-2">
                          {selectedApplication.expectations || <em className="text-muted">Not specified</em>}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <h5 className="mt-4">Update Application Status</h5>
              <Row className="mt-2">
                <Col md={6}>
                  <Form.Label>Status:</Form.Label>
                  <ApplicationStatusDropdown
                    application={selectedApplication}
                    onStatusChange={handleStatusChange}
                    isSubmitting={isSubmitting}
                    size="sm"
                  />
                </Col>
                <Col md={6} className="d-flex align-items-end">
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleUpdateStatus(selectedApplication.matchId, 'Approved')}
                    >
                      <FontAwesomeIcon icon={faCheck} className="me-1" />
                      Quick Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={isSubmitting}
                      onClick={() => handleUpdateStatus(selectedApplication.matchId, 'Rejected')}
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-1" />
                      Quick Reject
                    </Button>
                  </div>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobApplicationsPage; 