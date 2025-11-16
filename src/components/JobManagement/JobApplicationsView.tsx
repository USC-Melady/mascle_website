import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faDownload, faUserCircle, faClipboardList, faSync } from '@fortawesome/free-solid-svg-icons';
import { getApplicationsForJob, JobApplication, updateApplicationStatus } from '../../utils/jobManagement';
import { getUrl } from 'aws-amplify/storage';
import ApplicationStatusDropdown, { EXTENDED_STATUS_OPTIONS } from '../shared/ApplicationStatusDropdown';
import { 
  refreshApplicationsResumeData, 
  getFormattedEducationString, 
  getFormattedSkillsString, 
  StructuredResume,
  Experience,
  Project
} from './utils/applicationUtils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINTS } from '../../config';

// Extend JobApplication interface to include resume details
interface ExtendedJobApplication extends Omit<JobApplication, 'resumeDetails' | 'student'> {
  matchId: string;
  studentId: string;
  hasResumeUrl?: boolean;
  resume?: StructuredResume; // New structured resume format
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

interface JobApplicationsViewProps {
  jobId: string;
  jobTitle: string;
}

const JobApplicationsView: React.FC<JobApplicationsViewProps> = ({ jobId, jobTitle }) => {
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
    fetchApplications();
  }, [jobId]);

  const fetchApplications = async () => {
    try {
      console.log(`Fetching applications for job ${jobId}...`);
      setLoading(true);
      setError(null);
      
      const applicationsData = await getApplicationsForJob(jobId);
      console.log(`Received ${applicationsData.length} applications:`, applicationsData);
      
      // Enhanced debug logging for resume data
      console.log("Detailed application resume data:");
      applicationsData.forEach((app, index) => {
        console.log(`Application ${index + 1} (${app.matchId}):`);
        console.log(` - studentId: ${app.studentId}`);
        console.log(` - hasResumeUrl: ${!!app.resumeUrl}`);
        console.log(` - resumeUrl: ${app.resumeUrl || 'not provided'}`);
        console.log(` - hasResumeDetails: ${!!app.resumeDetails}`);
        console.log(` - userDetails:`, app.userDetails || 'none');
        
        if (app.resumeDetails) {
          try {
            // Check if resumeDetails is a string that needs parsing
            let parsedDetails;
            if (typeof app.resumeDetails === 'string') {
              parsedDetails = JSON.parse(app.resumeDetails);
            } else {
              parsedDetails = app.resumeDetails;
            }
            
            console.log(` - education count: ${parsedDetails.education?.length || 0}`);
            console.log(` - skills count: ${parsedDetails.skills?.length || 0}`);
            console.log(` - experience count: ${parsedDetails.experience?.length || 0}`);
          } catch (error) {
            console.error(` - Error parsing resumeDetails:`, error);
          }
        }
      });
      
      // Check if any applications have resumeUrl field
      const appsWithResume = applicationsData.filter(app => app.resumeUrl);
      console.log(`Applications with resume URLs: ${appsWithResume.length}`);
      appsWithResume.forEach(app => {
        console.log(`User ${app.studentId} has resume URL: ${app.resumeUrl}`);
      });
      
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
    
    // Enhanced debug logging for resume data
    if (application.resume) {
      console.log('Structured resume found:', application.resume);
    } else {
      console.log('No structured resume found in application');
    }
    
    // Extract the user details
    const userDetails = application.userDetails || { fullName: '', email: '', phone: '' };
    
    // Format education and skills data
    let educationString = '';
    let skillsString = '';
    
    // First try to use the structured resume format
    if (application.resume) {
      educationString = getFormattedEducationString(application.resume);
      skillsString = getFormattedSkillsString(application.resume);
    }
    
    // Set the application data
    setSelectedApplication({
      ...application,
      name: userDetails.fullName || 'Not provided',
      email: userDetails.email || application.student?.email || 'Not provided',
      phone: userDetails.phone || 'Not provided',
      education: educationString || 'Not provided',
      skills: skillsString || 'Not provided',
      resumeUrl: application.resumeUrl || 'No Resume Uploaded'
    });
    
    console.log('Formatted application data:', {
      education: educationString,
      skills: skillsString,
      resumeUrl: application.resumeUrl
    });
    
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleViewResume = async (application: ExtendedJobApplication) => {
    if (!application.resumeUrl) {
      console.error('No resume URL available for applicant');
      alert('This applicant has not uploaded a resume');
      return;
    }
    
    setDownloadingResume(true);
    try {
      console.log('Resume URL found:', application.resumeUrl);
      
      // Get auth session to get auth headers
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();
      
      if (!idToken) {
        throw new Error('Not authenticated');
      }
      
      // Check file extension to determine if it can be viewed in browser
      const fileExtension = application.resumeUrl.split('.').pop()?.toLowerCase();
      
      // DOCX files should be auto-downloaded
      if (fileExtension === 'docx' || fileExtension === 'doc') {
        console.log(`Auto-downloading ${fileExtension.toUpperCase()} file as it cannot be previewed in browser`);
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
      
      // Use the Lambda endpoint to get a pre-signed URL
      console.log(`Calling Lambda endpoint: ${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`);
      const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`, {
        method: 'GET',
        headers: {
          'Authorization': idToken,
          'Content-Type': 'application/json'
        }
      });
      
      // Parse response even if not OK to get error details
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error response from Lambda:', data);
        
        if (data && data.debug && data.debug.filesInBucket) {
          console.log('Available files in bucket:', data.debug.filesInBucket);
          
          // Show message with available files
          if (data.debug.filesInBucket.length === 0) {
            alert('No resume files found in the storage bucket. The file may have been deleted or not properly uploaded.');
          } else {
            alert(`Resume file not found. Available resume files: ${data.debug.filesInBucket.length}`);
          }
        } else {
          throw new Error(`Failed to get download URL: ${response.status} - ${data.error || 'Unknown error'}`);
        }
        return;
      }
      
      console.log('Resume view URL generated:', data.url);
      
      // Set the URL and show the modal
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
    if (!application.resumeUrl) {
      console.error('No resume URL available for applicant');
      alert('This applicant has not uploaded a resume');
      return;
    }
    
    setDownloadingResume(true);
    try {
      console.log('Resume URL found:', application.resumeUrl);
      
      // Extract user ID from the resume URL path
      // Format is typically: resumes/USER_ID/timestamp.extension
      const urlParts = application.resumeUrl.split('/');
      if (urlParts.length >= 2) {
        console.log(`Attempting to download resume from S3 with key: ${application.resumeUrl}`);
        
        try {
          // Get auth session to get auth headers
          const session = await fetchAuthSession();
          const idToken = session.tokens?.idToken?.toString();
          
          if (!idToken) {
            throw new Error('Not authenticated');
          }
          
          // Use the Lambda endpoint to get a pre-signed URL
          console.log(`Calling Lambda endpoint: ${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`);
          const response = await fetch(`${API_ENDPOINTS.GET_RESUME_URL}?key=${encodeURIComponent(application.resumeUrl)}`, {
            method: 'GET',
            headers: {
              'Authorization': idToken,
              'Content-Type': 'application/json'
            }
          });
          
          // Parse response even if not OK to get error details
          const data = await response.json();
          
          if (!response.ok) {
            console.error('Error response from Lambda:', data);
            
            if (data && data.debug && data.debug.filesInBucket) {
              console.log('Available files in bucket:', data.debug.filesInBucket);
              
              // Show message with available files
              if (data.debug.filesInBucket.length === 0) {
                alert('No resume files found in the storage bucket. The file may have been deleted or not properly uploaded.');
              } else {
                alert(`Resume file not found. Available resume files: ${data.debug.filesInBucket.length}`);
              }
            } else {
              throw new Error(`Failed to get download URL: ${response.status} - ${data.error || 'Unknown error'}`);
            }
            return;
          }
          
          console.log('Resume download URL generated:', data.url);
          console.log('Debug data:', data.debug);
          
          // Create a download link that forces download instead of opening in new tab
          const link = document.createElement('a');
          link.href = data.url;
          link.download = `${application.userDetails?.fullName || 'applicant'}_resume.${application.resumeUrl.split('.').pop()}`;
          link.style.display = 'none'; // Hide the link
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.warn('Error with primary download method, trying fallback approach', error);
          
          // Fallback to Amplify's getUrl function
          try {
            // Check if the error is due to file not found
            if (error instanceof Error && error.message.includes('NoSuchKey')) {
              alert('The resume file does not exist in storage. It may have been deleted.');
              return;
            }
            
            const url = await getUrl({ 
              key: application.resumeUrl,
              options: {
                expiresIn: 3600,
                validateObjectExistence: true
              }
            });
            
            console.log('Fallback resume download URL generated:', url.url.href);
            window.open(url.url.href, '_blank');
          } catch (fallbackError) {
            console.error('Failed with fallback approach as well:', fallbackError);
            alert(`Unable to download resume: ${fallbackError instanceof Error ? fallbackError.message : 'File not found'}`);
          }
        }
      } else {
        console.error('Invalid resume URL format:', application.resumeUrl);
        alert('Unable to download resume: Invalid file reference');
      }
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


  const getStatusBadge = (status: string): 'success' | 'warning' | 'danger' | 'secondary' | 'info' | 'primary' => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      case 'reviewed':
        return 'info';
      case 'shortlisted':
        return 'primary';
      case 'interviewed':
        return 'info';
      default:
        return 'secondary';
    }
  };

  const handleRefreshResumeData = async () => {
    if (refreshingResume) return;
    
    try {
      setRefreshingResume(true);
      
      const result = await refreshApplicationsResumeData(jobId);
      
      if (result.success) {
        alert(result.message);
        // Reload applications after refreshing resume data
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

  if (loading) {
    return (
      <Container fluid className="px-0">
        <Alert variant="info">Loading applications...</Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="px-0">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      <Row className="mx-0 mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h1>Applications for {jobTitle}</h1>
              <p className="text-muted">Review and manage applications for this position.</p>
            </div>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleRefreshResumeData}
              disabled={refreshingResume}
            >
              <FontAwesomeIcon icon={faSync} spin={refreshingResume} className="me-2" />
              {refreshingResume ? 'Refreshing Resume Data...' : 'Refresh Resume Data'}
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mx-0">
        <Col md={12}>
          <Card className="mb-4">
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Applicant</th>
                    <th>Submission Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length > 0 ? (
                    applications.map(app => (
                      <tr key={app.matchId}>
                        <td>
                          <div className="fw-bold">{app.userDetails?.fullName || 'Unknown'}</div>
                          <small className="text-muted">{app.student?.email || app.userDetails?.email || 'No email'}</small>
                        </td>
                        <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <ApplicationStatusDropdown
                            application={app}
                            onStatusChange={handleStatusChange}
                            isSubmitting={isSubmitting}
                            statusOptions={EXTENDED_STATUS_OPTIONS}
                          />
                        </td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleViewApplication(app)}
                            className="me-1"
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </Button>
                          {app.resumeUrl && (
                            <>
                              <Button 
                                variant="outline-info" 
                                size="sm"
                                className="me-1"
                                onClick={() => handleViewResume(app)}
                                disabled={downloadingResume}
                                title="View Resume"
                              >
                                <FontAwesomeIcon icon={faEye} />
                              </Button>
                              <Button 
                                variant="outline-success" 
                                size="sm"
                                onClick={() => handleDownloadResume(app)}
                                disabled={downloadingResume}
                                title="Download Resume"
                              >
                                <FontAwesomeIcon icon={faDownload} />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        No applications found for this position.
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
                          <Badge bg={getStatusBadge(selectedApplication.status)}>
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

              {/* Show experience section if available */}
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

              {/* Show projects section if available */}
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
          <Modal.Title>Resume Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {resumeUrl && (
            <iframe
              src={resumeUrl}
              style={{ width: '100%', height: '80vh', border: 'none' }}
              title="Resume Preview"
            />
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumeModal(false)}>
            Close
          </Button>
          {selectedApplication && (
            <Button 
              variant="primary" 
              onClick={() => handleDownloadResume(selectedApplication)}
              disabled={downloadingResume}
            >
              <FontAwesomeIcon icon={faDownload} className="me-1" />
              Download Resume
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobApplicationsView; 