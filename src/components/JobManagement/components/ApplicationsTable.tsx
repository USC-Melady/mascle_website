import React, { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Badge, Button, Dropdown, Modal, Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUserCircle, faClipboardList, faFileText, faUser, faGraduationCap, 
  faBriefcase, faCogs, faCode, faDownload, faTimes, faCalendarAlt, 
  faTrophy, faClock, faExternalLinkAlt, faAt, faPhone 
} from '@fortawesome/free-solid-svg-icons';
import { JobApplication, getApplicationsForJob, updateApplicationStatus } from '../../../utils/jobManagement';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINTS } from '../../../config';

interface ApplicationsTableProps {
  jobId: string;
}

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ jobId }) => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refreshes
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Load applications
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!jobId) {
          setError('No job ID provided. Cannot load applications.');
          setLoading(false);
          return;
        }
        
        console.log(`Loading applications for job ${jobId}...`);
        const apps = await getApplicationsForJob(jobId);
        console.log(`Loaded ${apps.length} applications`);
        
        // Sort applications: Pending first, then Approved, then Rejected, then others
        const sortedApps = [...apps].sort((a, b) => {
          const statusPriority: Record<string, number> = {
            'PENDING': 0,
            'APPROVED': 1,
            'REJECTED': 2
          };
          
          const statusA = a.status?.toUpperCase() || '';
          const statusB = b.status?.toUpperCase() || '';
          
          const priorityA = statusPriority[statusA] ?? 9;
          const priorityB = statusPriority[statusB] ?? 9;
          
          return priorityA - priorityB;
        });
        
        setApplications(sortedApps);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadApplications();
  }, [jobId, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // Trigger a refresh
  };

  const handleShowDetails = (application: JobApplication) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedApplication(null);
    setShowDetailsModal(false);
  };

  const handleViewResume = async (resumeUrl: string) => {
    console.log('🔍 ApplicationsTable handleViewResume called with:', resumeUrl);
    
    if (!resumeUrl) {
      alert('No resume available for this application');
      return;
    }

    try {
      // Check file extension to determine if it can be viewed in browser
      // Extract file extension from URL path, ignoring query parameters
      const urlPath = resumeUrl.split('?')[0]; // Remove query parameters
      const fileExtension = urlPath.split('.').pop()?.toLowerCase();
      console.log('🔍 Detected file extension:', fileExtension);
      
      // DOCX files should be auto-downloaded
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        console.log(`🔍 Auto-downloading ${fileExtension.toUpperCase()} file`);
        await handleDownloadResume(resumeUrl);
        return;
      }

      // For PDFs, get a fresh signed URL and open in new tab
      if (fileExtension === 'pdf') {
        console.log('🔍 Opening PDF in new tab with fresh signed URL');
        await handleViewPdf(resumeUrl);
        return;
      }
      
      // For other files, try direct open (fallback)
      window.open(resumeUrl, '_blank');
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert('Unable to view resume. Please try again.');
    }
  };

  const handleViewPdf = async (resumeUrl: string) => {
    console.log('🔍 ApplicationsTable handleViewPdf called with:', resumeUrl);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      // Extract S3 key from the full URL
      // Format: https://bucket.s3.region.amazonaws.com/path/to/file.pdf?params
      let s3Key = resumeUrl;
      
      if (resumeUrl.includes('amazonaws.com/')) {
        // Extract the path after the domain
        const urlParts = resumeUrl.split('amazonaws.com/');
        if (urlParts.length > 1) {
          s3Key = urlParts[1].split('?')[0]; // Remove query parameters
        }
      } else if (resumeUrl.startsWith('resumes/')) {
        // Already an S3 key
        s3Key = resumeUrl;
      }
      
      // Remove 'public/' prefix if present (Amplify adds this sometimes)
      if (s3Key.startsWith('public/')) {
        s3Key = s3Key.substring(7); // Remove 'public/' (7 characters)
      }
      
      console.log('🔍 Extracted S3 key:', s3Key);

      const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(s3Key)}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from Lambda:', data);
        throw new Error(`Failed to get PDF URL: ${response.status} - ${data.error || 'Unknown error'}`);
      }

      console.log('PDF view URL generated:', data.url);
      
      // Open PDF in new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error viewing PDF:', error);
      alert(`Unable to view PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownloadResume = async (resumeUrl: string) => {
    console.log('📥 ApplicationsTable handleDownloadResume called with:', resumeUrl);

    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }

      // Extract S3 key from the full URL
      // Format: https://bucket.s3.region.amazonaws.com/path/to/file.pdf?params
      let s3Key = resumeUrl;
      
      if (resumeUrl.includes('amazonaws.com/')) {
        // Extract the path after the domain
        const urlParts = resumeUrl.split('amazonaws.com/');
        if (urlParts.length > 1) {
          s3Key = urlParts[1].split('?')[0]; // Remove query parameters
        }
      } else if (resumeUrl.startsWith('resumes/')) {
        // Already an S3 key
        s3Key = resumeUrl;
      }
      
      // Remove 'public/' prefix if present (Amplify adds this sometimes)
      if (s3Key.startsWith('public/')) {
        s3Key = s3Key.substring(7); // Remove 'public/' (7 characters)
      }
      
      console.log('📥 Extracted S3 key:', s3Key);

      const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(s3Key)}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from Lambda:', data);
        throw new Error(`Failed to get download URL: ${response.status} - ${data.error || 'Unknown error'}`);
      }

      console.log('Resume download URL generated:', data.url);
      
      // Create a download link that forces download instead of opening in new tab
      const link = document.createElement('a');
      link.href = data.url;
      // Extract file extension properly, ignoring query parameters
      const urlPath = resumeUrl.split('?')[0];
      const fileExtension = urlPath.split('.').pop() || 'file';
      link.download = `resume.${fileExtension}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert(`Unable to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleStatusChange = async (applicationId: string, newStatus: string) => {
    try {
      console.log(`Updating application ${applicationId} status to ${newStatus}...`);
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update the application in our state
      setApplications(prev => prev.map(app => 
        app.matchId === applicationId ? { ...app, status: newStatus } : app
      ));
      
      console.log('Status updated successfully');
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application status. Please try again.');
    }
  };
  
  // Function to get status badge color
  const getStatusBadgeColor = (status: string): string => {
    const statusUpper = status.toUpperCase();
    switch (statusUpper) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'INTERVIEWED':
        return 'info';
      default:
        return 'secondary';
    }
  };
  
  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
        <p className="mt-2">Loading applications...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-primary" onClick={handleRefresh}>Try Again</Button>
        </div>
      </Alert>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div>
        <Alert variant="info">
          No applications have been submitted for this position yet.
        </Alert>
        <Button variant="outline-secondary" onClick={handleRefresh} className="mt-2">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Applications ({applications.length})</h5>
        <Button 
          variant="outline-secondary" 
          size="sm"
          onClick={handleRefresh}
        >
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </Button>
      </div>
      
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th>Resume</th>
            <th>Cover Letter</th>
            <th>Summer Availability</th>
            <th>Hours/Week</th>
            <th>Expectations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.matchId}>
              <td>
                {app.student?.email || app.studentId}
              </td>
              <td>
                {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Unknown'}
              </td>
              <td>
                <Badge bg={getStatusBadgeColor(app.status || '')}>
                  {app.status || 'PENDING'}
                </Badge>
              </td>
              <td>
                {app.resumeUrl ? (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => handleViewResume(app.resumeUrl!)}
                  >
                    View Resume
                  </Button>
                ) : app.student?.resumeUrl ? (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => handleViewResume(app.student!.resumeUrl!)}
                  >
                    View Resume
                  </Button>
                ) : (
                  <span className="text-muted">No resume</span>
                )}
              </td>
              <td>
                {app.coverLetter ? (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => alert(app.coverLetter)}
                  >
                    View Cover Letter
                  </Button>
                ) : (
                  <span className="text-muted">No cover letter</span>
                )}
              </td>
              <td>
                <small>{app.summerAvailability || 'Not specified'}</small>
              </td>
              <td>
                <small>{app.hoursPerWeek || 'Not specified'}</small>
              </td>
              <td>
                {app.expectations ? (
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => alert(app.expectations)}
                    title={app.expectations.length > 30 ? app.expectations : undefined}
                  >
                    {app.expectations.length > 30 ? `${app.expectations.substring(0, 30)}...` : app.expectations}
                  </Button>
                ) : (
                  <span className="text-muted">Not specified</span>
                )}
              </td>
              <td>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => handleShowDetails(app)}
                  >
                    View Details
                  </Button>
                  <Dropdown>
                    <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-${app.matchId}`}>
                      Update Status
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(app.matchId, 'PENDING')}
                        disabled={app.status === 'PENDING'}
                      >
                        Mark as Pending
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(app.matchId, 'APPROVED')}
                        disabled={app.status === 'APPROVED'}
                      >
                        Approve
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(app.matchId, 'REJECTED')}
                        disabled={app.status === 'REJECTED'}
                      >
                        Reject
                      </Dropdown.Item>
                      <Dropdown.Item 
                        onClick={() => handleStatusChange(app.matchId, 'INTERVIEWED')}
                        disabled={app.status === 'INTERVIEWED'}
                      >
                        Mark as Interviewed
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Enhanced Application Details Modal */}
      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="xl" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FontAwesomeIcon icon={faUserCircle} className="me-2" />
            Application Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {selectedApplication && (
            <div className="container-fluid">
              {/* Header Section with Key Info */}
              <div className="bg-light p-4 border-bottom">
                <Row>
                  <Col md={8}>
                    <h5 className="mb-1">
                      {selectedApplication.userDetails?.fullName || selectedApplication.student?.email || selectedApplication.studentId || 'Applicant'}
                    </h5>
                    <p className="text-muted mb-2">
                      <FontAwesomeIcon icon={faAt} className="me-1" />
                      {selectedApplication.student?.email || selectedApplication.userDetails?.email || selectedApplication.studentId || 'No email provided'}
                    </p>
                    {selectedApplication.userDetails?.phone && (
                      <p className="text-muted mb-0">
                        <FontAwesomeIcon icon={faPhone} className="me-1" />
                        {selectedApplication.userDetails.phone}
                      </p>
                    )}
                  </Col>
                  <Col md={4} className="text-end">
                    <Badge bg={getStatusBadgeColor(selectedApplication.status || '')} className="fs-6 mb-2">
                      {selectedApplication.status || 'PENDING'}
                    </Badge>
                    <div className="text-muted">
                      <small>Applied: {selectedApplication.createdAt ? new Date(selectedApplication.createdAt).toLocaleDateString() : 'Unknown'}</small>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="p-4">
                {/* Application Questions - Prominent Section */}
                <Card className="mb-4 border-primary">
                  <Card.Header className="bg-primary text-white">
                    <FontAwesomeIcon icon={faClipboardList} className="me-2" />
                    <strong>Application Responses</strong>
                  </Card.Header>
                  <Card.Body>
                    <Row className="gy-3">
                      <Col md={6}>
                        <div className="p-3 bg-light rounded">
                          <h6 className="text-primary mb-2">Summer Availability</h6>
                          <p className="mb-0 fs-5">{selectedApplication.summerAvailability || <em className="text-muted">Not specified</em>}</p>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="p-3 bg-light rounded">
                          <h6 className="text-primary mb-2">Hours Per Week</h6>
                          <p className="mb-0 fs-5">{selectedApplication.hoursPerWeek || <em className="text-muted">Not specified</em>}</p>
                        </div>
                      </Col>
                      <Col md={12}>
                        <div className="p-3 bg-light rounded">
                          <h6 className="text-primary mb-2">Research Expectations</h6>
                          <p className="mb-0">{selectedApplication.expectations || <em className="text-muted">Not specified</em>}</p>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>

                {/* Cover Letter Section */}
                {selectedApplication.coverLetter && (
                  <Card className="mb-4">
                    <Card.Header className="bg-secondary text-white">
                      <FontAwesomeIcon icon={faFileText} className="me-2" />
                      <strong>Cover Letter</strong>
                    </Card.Header>
                    <Card.Body>
                      <div className="p-3 bg-light rounded">
                        <p className="mb-0 lh-lg">{selectedApplication.coverLetter}</p>
                      </div>
                    </Card.Body>
                  </Card>
                )}

                {/* Resume Details */}
                {selectedApplication.resumeDetails && (
                  <Card className="mb-4">
                    <Card.Header className="bg-info text-white">
                      <FontAwesomeIcon icon={faUser} className="me-2" />
                      <strong>Academic & Professional Profile</strong>
                    </Card.Header>
                    <Card.Body>
                      {/* Education */}
                      {selectedApplication.resumeDetails.education && selectedApplication.resumeDetails.education.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-info border-bottom pb-2 mb-3">
                            <FontAwesomeIcon icon={faGraduationCap} className="me-2" />
                            Education
                          </h6>
                          {selectedApplication.resumeDetails.education.map((edu: any, index: number) => (
                            <div key={index} className="mb-3 p-3 border-start border-info border-4 bg-light">
                              <h6 className="mb-2">{edu.degree} in {edu.major}</h6>
                              <p className="mb-1 text-muted">{edu.institution}</p>
                              <div className="d-flex gap-3">
                                {edu.gpa && (
                                  <small className="text-muted">
                                    <FontAwesomeIcon icon={faTrophy} className="me-1" />
                                    GPA: {edu.gpa}
                                  </small>
                                )}
                                {edu.graduationEndYear && (
                                  <small className="text-muted">
                                    <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                    {edu.graduationEndMonth}/{edu.graduationEndYear}
                                  </small>
                                )}
                                {edu.yearsOfExperience && (
                                  <small className="text-muted">
                                    <FontAwesomeIcon icon={faClock} className="me-1" />
                                    {edu.yearsOfExperience} years experience
                                  </small>
                                )}
                                {edu.seniority && (
                                  <small className="text-muted">
                                    Level: {edu.seniority}
                                  </small>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Experience */}
                      {selectedApplication.resumeDetails.experience && selectedApplication.resumeDetails.experience.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-info border-bottom pb-2 mb-3">
                            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                            Professional Experience
                          </h6>
                          {selectedApplication.resumeDetails.experience.map((exp: any, index: number) => (
                            <div key={index} className="mb-3 p-3 border-start border-success border-4 bg-light">
                              <h6 className="mb-1">{exp.position}</h6>
                              <p className="mb-2 text-primary">{exp.company}</p>
                              <p className="mb-2 text-muted small">
                                <FontAwesomeIcon icon={faCalendarAlt} className="me-1" />
                                {exp.startDate} - {exp.endDate}
                              </p>
                              {exp.description && <p className="mb-0">{exp.description}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Skills */}
                      {selectedApplication.resumeDetails.skills && selectedApplication.resumeDetails.skills.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-info border-bottom pb-2 mb-3">
                            <FontAwesomeIcon icon={faCogs} className="me-2" />
                            Technical Skills
                          </h6>
                          <div className="p-3 bg-light rounded">
                            {selectedApplication.resumeDetails.skills.map((skill: string, index: number) => (
                              <Badge key={index} bg="primary" className="me-2 mb-2 px-3 py-2 fs-6">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {selectedApplication.resumeDetails.projects && selectedApplication.resumeDetails.projects.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-info border-bottom pb-2 mb-3">
                            <FontAwesomeIcon icon={faCode} className="me-2" />
                            Projects
                          </h6>
                          {selectedApplication.resumeDetails.projects.map((project: any, index: number) => (
                            <div key={index} className="mb-3 p-3 border-start border-warning border-4 bg-light">
                              <h6 className="mb-2">{project.title}</h6>
                              {project.description && <p className="mb-2">{project.description}</p>}
                              {project.technologies && (
                                <p className="mb-1">
                                  <strong>Technologies:</strong>
                                  <Badge bg="secondary" className="ms-2">{project.technologies}</Badge>
                                </p>
                              )}
                              {project.url && (
                                <p className="mb-0">
                                  <FontAwesomeIcon icon={faExternalLinkAlt} className="me-1" />
                                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                    View Project
                                  </a>
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <div className="d-flex justify-content-between w-100">
            <div>
              {selectedApplication?.resumeUrl && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleViewResume(selectedApplication.resumeUrl!)}
                  className="me-2"
                >
                  <FontAwesomeIcon icon={faDownload} className="me-1" />
                  View Resume
                </Button>
              )}
            </div>
            <Button variant="secondary" onClick={handleCloseDetails}>
              <FontAwesomeIcon icon={faTimes} className="me-1" />
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ApplicationsTable; 