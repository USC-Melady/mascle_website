import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Modal, Form, Spinner, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faEye, 
  faDownload, 
  faUserCircle, 
  faClipboardList, 
  faSync, 
  faArrowLeft, 
  faBriefcase,
  faUsers,
  faFileAlt,
  faHome,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { getApplicationsForJob, JobApplication, updateApplicationStatus } from '../utils/jobManagement';
import { 
  refreshApplicationsResumeData, 
  getFormattedEducationString, 
  getFormattedSkillsString, 
  StructuredResume,
  Experience,
  Project
} from '../components/JobManagement/utils/applicationUtils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINTS } from '../config';
import ApplicationStatusDropdown, { EXTENDED_STATUS_OPTIONS } from '../components/shared/ApplicationStatusDropdown';
import { getApplicationStatusBadge } from '../utils/statusUtils';

// Extend JobApplication interface to include resume details
interface ExtendedJobApplication extends Omit<JobApplication, 'resumeDetails' | 'student'> {
  matchId: string;
  studentId: string;
  hasResumeUrl?: boolean;
  resume?: StructuredResume;
  student?: {
    userId: string;
    email: string;
    resumeUrl?: string;
  };
  userDetails?: {
    fullName?: string;
    email?: string;
    phone?: string;
    education?: string;
    skills?: string;
  };
  // Formatted fields for the view
  name?: string;
  email?: string;
  phone?: string;
  education?: string;
  skills?: string;
}

const JobApplicationsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobTitle = searchParams.get('title') || 'Unknown Job';
  
  const [applications, setApplications] = useState<ExtendedJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<ExtendedJobApplication | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshingResume, setRefreshingResume] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string>('');

  useEffect(() => {
    if (jobId) {
      fetchApplications();
    }
  }, [jobId]);

  const fetchApplications = async () => {
    if (!jobId) return;
    
    try {
      console.log(`Fetching applications for job ${jobId}...`);
      setLoading(true);
      setError(null);
      
      const applicationsData = await getApplicationsForJob(jobId);
      console.log(`Received ${applicationsData.length} applications:`, applicationsData);
      
      const extendedApplications: ExtendedJobApplication[] = applicationsData.map(app => {
        let resume: StructuredResume | undefined = undefined;
        if (app.resumeDetails) {
          if (typeof app.resumeDetails === 'string') {
            try {
              resume = JSON.parse(app.resumeDetails);
            } catch (e) {
              console.error("Failed to parse resumeDetails", e);
            }
          } else {
            resume = app.resumeDetails as StructuredResume;
          }
        }
        return {
          ...app,
          resume: resume,
        };
      });
      
      setApplications(extendedApplications);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewApplication = (application: ExtendedJobApplication) => {
    console.log('Viewing application:', application);
    
    const userDetails = application.userDetails || { fullName: '', email: '', phone: '' };
    
    let educationString = '';
    let skillsString = '';
    
    if (application.resume) {
      educationString = getFormattedEducationString(application.resume);
      skillsString = getFormattedSkillsString(application.resume);
    }
    
    setSelectedApplication({
      ...application,
      name: userDetails.fullName || 'Not provided',
      email: userDetails.email || application.student?.email || 'Not provided',
      phone: userDetails.phone || 'Not provided',
      education: educationString || 'Not provided',
      skills: skillsString || 'Not provided',
      resumeUrl: application.resumeUrl || 'No Resume Uploaded'
    });
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewResume = async (application: ExtendedJobApplication) => {
    console.log('🔍 handleViewResume called with application:', application);
    console.log('🔍 Resume URL:', application.resumeUrl);
    
    if (!application.resumeUrl) {
      console.error('No resume URL available for applicant');
      alert('This applicant has not uploaded a resume');
      return;
    }
    
    setDownloadingResume(true);
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      // Check file extension to determine if it can be viewed in browser
      const fileExtension = application.resumeUrl.split('.').pop()?.toLowerCase();
      console.log('🔍 Detected file extension:', fileExtension);
      
      // DOCX files should be auto-downloaded
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        console.log(`🔍 Auto-downloading ${fileExtension.toUpperCase()} file as it cannot be previewed in browser`);
        await handleDownloadResume(application);
        return;
      }
      
      // PDFs and images should be viewable in browser
      const viewableExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'txt'];
      if (!viewableExtensions.includes(fileExtension || '')) {
        alert(`${fileExtension?.toUpperCase()} files cannot be previewed in the browser. The file will be downloaded instead.`);
        await handleDownloadResume(application);
        return;
      }
      
      const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`, {
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
      
      console.log('Resume view URL generated:', data.url);
      setResumeUrl(data.url);
      setShowResumeModal(true);
    } catch (error) {
      console.error('Error viewing resume:', error);
      alert(`Unable to view resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleDownloadResume = async (application: ExtendedJobApplication) => {
    console.log('📥 handleDownloadResume called with application:', application);
    console.log('📥 Resume URL for download:', application.resumeUrl);
    
    if (!application.resumeUrl) {
      alert('This applicant has not uploaded a resume');
      return;
    }
    
    setDownloadingResume(true);
    try {
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`, {
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
      link.download = `${application.userDetails?.fullName || 'applicant'}_resume.${application.resumeUrl.split('.').pop()}`;
      link.style.display = 'none'; // Hide the link
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert(`Unable to download resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloadingResume(false);
    }
  };

  const handleStatusChange = async (matchId: string, newStatus: string) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      console.log(`Updating application ${matchId} status to ${newStatus}`);
      
      const updatedApplication = await updateApplicationStatus(matchId, newStatus);
      
      if (updatedApplication) {
        // Update the applications list with the updated application
        setApplications(applications.map(app => 
          app.matchId === matchId ? { ...app, status: newStatus } : app
        ));
        
        // If the application is currently selected, update the selected application
        if (selectedApplication && selectedApplication.matchId === matchId) {
          setSelectedApplication({ ...selectedApplication, status: newStatus });
        }
        
        console.log(`Successfully updated application ${matchId} to ${newStatus}`);
      } else {
        console.error('Failed to update application - no data returned');
        alert('Failed to update application status. Please try again.');
      }
    } catch (err) {
      console.error('Error updating application status:', err);
      alert('Failed to update application status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleRefreshResumeData = async () => {
    if (refreshingResume || !jobId) return;
    
    try {
      setRefreshingResume(true);
      const result = await refreshApplicationsResumeData(jobId);
      
      if (result.success) {
        alert(result.message);
        await fetchApplications();
      } else {
        alert(`Failed to refresh resume data: ${result.message}`);
      }
    } catch (error) {
      console.error('Error refreshing resume data:', error);
      alert('Error refreshing resume data. Please try again.');
    } finally {
      setRefreshingResume(false);
    }
  };

  const handleBackToJobs = () => {
    navigate('/professor-dashboard?tab=jobs');
  };

  if (loading) {
    return (
      <Container fluid className="px-4 py-4">
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Spinner animation="border" variant="primary" className="mb-3" />
            <h5 className="text-muted">Loading applications...</h5>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-4 py-4">
        <Alert variant="danger" className="d-flex align-items-center">
          <FontAwesomeIcon icon={faClipboardList} className="me-2" />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-4 py-4">
      {/* Enhanced Breadcrumb Navigation */}
      <Row className="mb-4">
        <Col>
          <Breadcrumb className="bg-light p-3 rounded-3 shadow-sm">
            <Breadcrumb.Item onClick={() => navigate('/professor-dashboard')} style={{ cursor: 'pointer' }}>
              <FontAwesomeIcon icon={faHome} className="me-1" />
              Dashboard
            </Breadcrumb.Item>
            <Breadcrumb.Item onClick={handleBackToJobs} style={{ cursor: 'pointer' }}>
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

      {/* Enhanced Header Section */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col>
                  <div className="d-flex align-items-center mb-2">
                    <Button 
                      variant="light" 
                      size="sm" 
                      onClick={handleBackToJobs}
                      className="me-3 shadow-sm"
                    >
                      <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
                      Back to Jobs
                    </Button>
                    <h1 className="text-white mb-0">
                      <FontAwesomeIcon icon={faUsers} className="me-2" />
                      Applications
                    </h1>
                  </div>
                  <h4 className="text-white-50 mb-0">
                    <FontAwesomeIcon icon={faBriefcase} className="me-2" />
                    {jobTitle}
                  </h4>
                  <p className="text-white-50 mb-0 mt-2">
                    {applications.length} {applications.length === 1 ? 'application' : 'applications'} received
                  </p>
                </Col>
                <Col xs="auto">
                  <Button
                    variant="light"
                    size="sm"
                    onClick={handleRefreshResumeData}
                    disabled={refreshingResume}
                    className="shadow-sm"
                  >
                    <FontAwesomeIcon icon={faSync} spin={refreshingResume} className="me-2" />
                    {refreshingResume ? 'Refreshing...' : 'Refresh Data'}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Applications Table */}
      <Row>
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {applications.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead style={{ backgroundColor: '#f8f9fa' }}>
                    <tr>
                      <th className="border-0 px-4 py-3 fw-semibold text-muted">
                        <FontAwesomeIcon icon={faUserCircle} className="me-2" />
                        Applicant
                      </th>
                      <th className="border-0 px-4 py-3 fw-semibold text-muted">Submission Date</th>
                      <th className="border-0 px-4 py-3 fw-semibold text-muted">Status</th>
                      <th className="border-0 px-4 py-3 fw-semibold text-muted">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app.matchId} className="border-bottom">
                        <td className="px-4 py-3">
                          <div>
                            <div className="fw-semibold text-dark">
                              {app.userDetails?.fullName || 'Unknown Applicant'}
                            </div>
                            <small className="text-muted">
                              <FontAwesomeIcon icon={faFileAlt} className="me-1" />
                              {app.student?.email || app.userDetails?.email || 'No email'}
                            </small>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-muted">
                            {app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <ApplicationStatusDropdown
                            application={app}
                            onStatusChange={handleStatusChange}
                            isSubmitting={isSubmitting}
                            statusOptions={EXTENDED_STATUS_OPTIONS}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleViewApplication(app)}
                              className="shadow-sm"
                            >
                              <FontAwesomeIcon icon={faEye} className="me-1" />
                              View
                            </Button>
                            {app.resumeUrl && (
                              <>
                                <Button 
                                  variant="outline-info" 
                                  size="sm"
                                  onClick={() => handleViewResume(app)}
                                  disabled={downloadingResume}
                                  title="View Resume"
                                  className="shadow-sm"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                </Button>
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleDownloadResume(app)}
                                  disabled={downloadingResume}
                                  title="Download Resume"
                                  className="shadow-sm"
                                >
                                  <FontAwesomeIcon icon={faDownload} />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-5">
                  <FontAwesomeIcon icon={faUsers} size="3x" className="text-muted mb-3" />
                  <h4 className="text-muted">No Applications Yet</h4>
                  <p className="text-muted">
                    No applications have been submitted for this position yet.
                  </p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Application Details Modal - keeping the existing modal implementation */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faUserCircle} className="me-2" />
            Application Details
          </Modal.Title>
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
                        <td>{selectedApplication.name}</td>
                      </tr>
                      <tr>
                        <th>Email:</th>
                        <td>{selectedApplication.email}</td>
                      </tr>
                      <tr>
                        <th>Phone:</th>
                        <td>{selectedApplication.phone}</td>
                      </tr>
                      <tr>
                        <th>Education:</th>
                        <td style={{ whiteSpace: 'pre-line' }}>
                          {selectedApplication.education}
                        </td>
                      </tr>
                      <tr>
                        <th>Skills:</th>
                        <td>
                          {selectedApplication.skills}
                        </td>
                      </tr>
                      <tr>
                        <th>Resume:</th>
                        <td>
                          {selectedApplication.resumeUrl === 'No Resume Uploaded' ? (
                            'No Resume Uploaded'
                          ) : (
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleViewResume(selectedApplication)}
                                disabled={downloadingResume}
                              >
                                <FontAwesomeIcon icon={faEye} className="me-1" />
                                View Resume
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleDownloadResume(selectedApplication)}
                                disabled={downloadingResume}
                              >
                                <FontAwesomeIcon icon={faDownload} className="me-1" />
                                Download
                              </Button>
                            </div>
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
                        <th style={{ width: '120px' }}>Status:</th>
                        <td>
                          <Badge bg={getApplicationStatusBadge(selectedApplication.status)}>
                            {selectedApplication.status}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <th>Applied:</th>
                        <td>
                          {selectedApplication.createdAt ? 
                            new Date(selectedApplication.createdAt).toLocaleString() : 
                            'Unknown'
                          }
                        </td>
                      </tr>
                      <tr>
                        <th>Last Updated:</th>
                        <td>
                          {selectedApplication.updatedAt ? 
                            new Date(selectedApplication.updatedAt).toLocaleString() : 
                            'Not updated'
                          }
                        </td>
                      </tr>
                    </tbody>
                  </Table>

                  <div className="mt-3">
                    <Form.Label>Update Status</Form.Label>
                    <ApplicationStatusDropdown
                      application={selectedApplication}
                      onStatusChange={handleStatusChange}
                      isSubmitting={isSubmitting}
                      statusOptions={EXTENDED_STATUS_OPTIONS}
                      size="sm"
                      style={{ width: '200px' }}
                    />
                  </div>
                </Col>
              </Row>

              <Row className="mt-4">
                <Col>
                  <h5 className="mb-3">Cover Letter</h5>
                  <Card className="bg-light">
                    <Card.Body>
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {selectedApplication.coverLetter || 'No cover letter provided'}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Experience and Projects sections remain the same */}
              {selectedApplication.resume?.experience && 
               selectedApplication.resume.experience.filter(exp => exp.company && exp.position).length > 0 && (
                <Row className="mt-4">
                  <Col>
                    <h5 className="mb-3">Work Experience</h5>
                    {selectedApplication.resume.experience
                      .filter((exp: Experience) => exp.company && exp.position)
                      .map((exp: Experience, index: number) => (
                        <div key={index} className="mb-3">
                          <Card className="bg-light">
                            <Card.Body>
                              <h6>{exp.position} at {exp.company}</h6>
                              <p className="text-muted mb-2">
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </p>
                              <div style={{ whiteSpace: 'pre-line' }}>
                                {exp.description || 'No description provided'}
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                    ))}
                  </Col>
                </Row>
              )}

              {selectedApplication.resume?.projects && 
               selectedApplication.resume.projects.filter(proj => proj.title).length > 0 && (
                <Row className="mt-4">
                  <Col>
                    <h5 className="mb-3">Projects</h5>
                    {selectedApplication.resume.projects
                      .filter((proj: Project) => proj.title)
                      .map((project: Project, index: number) => (
                        <div key={index} className="mb-3">
                          <Card className="bg-light">
                            <Card.Body>
                              <h6>{project.title}</h6>
                              {project.technologies && (
                                <p className="text-muted mb-2">
                                  <strong>Technologies:</strong> {project.technologies}
                                </p>
                              )}
                              <div style={{ whiteSpace: 'pre-line' }}>
                                {project.description || 'No description provided'}
                              </div>
                              {project.url && (
                                <a 
                                  href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="btn btn-sm btn-outline-primary mt-2"
                                >
                                  View Project
                                </a>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
                      ))}
                  </Col>
                </Row>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Resume Viewing Modal */}
      <Modal show={showResumeModal} onHide={() => setShowResumeModal(false)} size="xl" fullscreen="lg-down">
        <Modal.Header closeButton>
          <Modal.Title>
            <FontAwesomeIcon icon={faFileAlt} className="me-2" />
            Resume Preview
            {selectedApplication && (
              <small className="text-muted ms-2">
                - {selectedApplication.userDetails?.fullName || 'Applicant'}
              </small>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {resumeUrl ? (
            <div style={{ position: 'relative' }}>
              <iframe
                src={resumeUrl}
                style={{ width: '100%', height: '80vh', border: 'none' }}
                title="Resume Preview"
                onLoad={() => {
                  console.log('Resume iframe loaded successfully');
                }}
                onError={(e) => {
                  console.error('Error loading resume in iframe:', e);
                  alert('Unable to display this file in the browser. Please download it to view.');
                }}
              />
              <div className="position-absolute top-0 end-0 p-2" style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '5px' }}>
                <small className="text-muted">
                  PDF Preview • Download for best experience
                </small>
              </div>
            </div>
          ) : (
            <div className="text-center p-5">
              <FontAwesomeIcon icon={faFileAlt} size="3x" className="text-muted mb-3" />
              <p>Loading resume preview...</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
            <FontAwesomeIcon icon={faTimes} className="me-1" />
            Close
          </Button>
          {selectedApplication && (
            <Button 
              variant="primary" 
              onClick={() => handleDownloadResume(selectedApplication)}
              disabled={downloadingResume}
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              {downloadingResume ? 'Downloading...' : 'Download Resume'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobApplicationsPage;
