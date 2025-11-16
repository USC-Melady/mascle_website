import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner, Badge, Card } from 'react-bootstrap';
import { Job } from '../../../utils/jobManagement';
import { createApplication } from '../../../utils/jobManagement';
import { 
  getResumeDataForApplication, 
  isResumeComplete,
  getAuthenticatedUser 
} from '../../../components/ResumeManagement/utils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ResumeDetails } from '../../../components/ResumeManagement/types';
import { debugStudentRoleCheck, formatDebugInfo } from '../../../utils/debugUtils';

interface JobApplicationModalProps {
  show: boolean;
  onHide: () => void;
  job: Job;
  onApplicationSubmitted: () => void;
  onSubmitSuccess?: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  show,
  onHide,
  job,
  onApplicationSubmitted,
  onSubmitSuccess
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [summerAvailability, setSummerAvailability] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [expectations, setExpectations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [resumeData, setResumeData] = useState<{
    resumeDetails: ResumeDetails | null;
    resumeFileName: string | null;
    userEmail: string | null;
    fullName: string | null;
    resumeFileUrl?: string | null;
  } | null>(null);
  const [resumeComplete, setResumeComplete] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [userInfo, setUserInfo] = useState<{roles?: string[]; email?: string} | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Reset form when modal opens with a new job
  useEffect(() => {
    if (show) {
      setCoverLetter('');
      setSummerAvailability('');
      setHoursPerWeek('');
      setExpectations('');
      setError(null);
      setSuccess(false);
      setDebugInfo(null);
      setAlreadyApplied(false);
      
      // Load resume data when modal opens
      const loadResumeData = async () => {
        const data = await getResumeDataForApplication();
        setResumeData(data);
        
        // Check if resume is complete enough for application
        const complete = await isResumeComplete();
        setResumeComplete(complete);
        
        if (!complete) {
          setDebugInfo('Your resume is incomplete. Please complete your resume profile before applying.');
        }
        
        // Check user roles with our debug utility
        try {
          const roleCheckResult = await debugStudentRoleCheck();
          setUserInfo({
            roles: roleCheckResult.roles || [],
            email: roleCheckResult.username
          });
          
          if (!roleCheckResult.hasStudentRole) {
            setDebugInfo(prev => `${prev ? prev + ' | ' : ''}WARNING: You do not have the Student role required to apply.`);
          }
          
          // Get the user from resume management utils as backup
          const user = await getAuthenticatedUser();
          if (user?.attributes?.email && (!userInfo?.email)) {
            setUserInfo(prev => ({
              ...prev || {},
              email: user?.attributes?.email
            }));
          }
          
          // Get user roles from tokens
          let userRoles: string[] = [];
          try {
            const { tokens } = await fetchAuthSession();
            if (tokens?.accessToken?.payload['cognito:groups']) {
              userRoles = tokens.accessToken.payload['cognito:groups'] as string[];
              
              // Update user info with these roles if we didn't get them from the debug utility
              if (!userInfo?.roles?.length && userRoles.length) {
                setUserInfo(prev => ({
                  ...prev || {},
                  roles: userRoles
                }));
              }
            }
          } catch (error) {
            console.error('Error getting user roles from tokens:', error);
          }
          
          // Log detailed debug information
          console.log('Role check result:', roleCheckResult);
          console.log('User authentication info:', {
            username: user?.username,
            email: user?.attributes?.email,
            roles: userRoles
          });
          
          // Log additional session information that might help debug auth issues
          const sessionStr = localStorage.getItem('amplify-auth-session');
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              console.log('Auth session tokens:', {
                idToken: session.tokens?.idToken ? 'Present' : 'Missing',
                accessToken: session.tokens?.accessToken ? 'Present' : 'Missing',
                refreshToken: session.tokens?.refreshToken ? 'Present' : 'Missing',
              });
            } catch {
              console.log('Could not parse auth session');
            }
          }
        } catch (error) {
          console.error('Error getting user auth info:', error);
          setDebugInfo(prev => `${prev ? prev + ' | ' : ''}Error checking user roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      
      loadResumeData();
    }
  }, [show, job.jobId]);

  // When modal opens, log job details for debugging
  useEffect(() => {
    if (show && job) {
      console.log('Modal opened for job:', job);
      setDebugInfo(prev => `${prev ? prev + ' | ' : ''}Job ID: ${job.jobId}, Status: ${job.status}`);
      
      // Check job status - pre-emptively show error if job is not open
      if (job.status !== 'OPEN') {
        setError(`This position is not currently accepting applications. Status: ${job.status}`);
      } else {
        setError(null);
      }
    }
  }, [show, job]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resumeComplete) {
      alert('Please complete your resume profile before applying. You need education information and a resume upload.');
      return;
    }
    
    if (alreadyApplied) {
      alert('You have already applied for this position.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      setSuccess(false);
      
      // Verify we have resume data
      if (!resumeData) {
        const data = await getResumeDataForApplication();
        setResumeData(data);
        
        if (!data || !data.resumeDetails) {
          throw new Error('Could not load your resume data. Please ensure your resume is complete before applying.');
        }
      }
      
      // Get job ID
      const jobId = job.jobId;
      if (!jobId) {
        throw new Error('Missing job ID. Cannot submit application.');
      }
      
      // Debug information
      setDebugInfo(`Preparing to submit application to job: ${job.title} (${jobId})`);
      
      // Try to get role information again as a double-check
      let roleCheckResult: {hasStudentRole: boolean; roles: string[]} = { 
        hasStudentRole: false, 
        roles: [] 
      };

      try {
        const result = await debugStudentRoleCheck();
        roleCheckResult = {
          hasStudentRole: result.hasStudentRole || false,
          roles: result.roles || []
        };
        
        setDebugInfo(prev => `${prev}\nRole check result: ${formatDebugInfo(roleCheckResult)}`);
        
        // Additional check for tokens
        try {
          const session = await fetchAuthSession();
          const accessToken = session.tokens?.accessToken;
          if (accessToken && accessToken.payload) {
            setDebugInfo(prev => `${prev}\nAccess token found: ${!!accessToken}`);
            
            // Try to extract roles from the token
            const jwtCognito = accessToken.payload['cognito:groups'] as string[] || [];
            if (jwtCognito.includes('Student')) {
              setDebugInfo(prev => `${prev}\nFound Student role in token`);
            } else {
              setDebugInfo(prev => `${prev}\nStudent role NOT found in token. Groups: ${jwtCognito.join(', ')}`);
            }
          }
        } catch (tokenError) {
          console.error('Token access error:', tokenError);
          setDebugInfo(prev => `${prev}\nError accessing token: ${tokenError}`);
        }
      } catch (roleError) {
        console.error('Role check error:', roleError);
        setDebugInfo(prev => `${prev}\nRole check error: ${roleError}`);
      }
      
      // Check if user has Student role
      if (!roleCheckResult.hasStudentRole) {
        throw new Error('You need to have a Student role to apply for positions. Please contact support.');
      }
      
      // Format education data for the application
      const educationData = resumeData?.resumeDetails?.education
        .filter(edu => edu.institution && edu.degree)
        .map(edu => `${edu.degree} in ${edu.major} at ${edu.institution} (${edu.graduationEndYear || 'Ongoing'})`)
        .join('\n');
      
      // Format skills data
      const skillsData = resumeData?.resumeDetails?.skills
        .filter(skill => skill.trim() !== '')
        .join(', ');
      
      // Prepare application data with structured resume format
      const userData = {
        fullName: resumeData?.fullName || '',
        phone: '',  // Not collected in our resume form
        education: educationData || '',
        skills: skillsData || '',
        resumeFileName: resumeData?.resumeFileName || '',
        resumeUrl: resumeData?.resumeFileUrl || '',
        email: userInfo?.email || resumeData?.userEmail || '',
        // Include the complete resume details in both formats
        resumeDetails: resumeData?.resumeDetails || null,
        // Include structured resume data
        resume: resumeData?.resumeDetails || null,
        // Include new application questions
        summerAvailability,
        hoursPerWeek,
        expectations
      };
      
      setDebugInfo(prev => `${prev}\nSubmitting application with cover letter (${coverLetter.length} chars) and resume data`);
      
      // Submit the application
      const response = await createApplication(jobId, coverLetter, userData);
      
      if (response) {
        setSuccess(true);
        setDebugInfo(prev => `${prev}\nApplication submitted successfully!`);
        
        // Notify parent component about the successful submission
        onApplicationSubmitted();
        
        // Call additional success callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        
        // Close the modal after 2 seconds
        setTimeout(() => {
          onHide();
        }, 2000);
      } else {
        throw new Error('Failed to submit application. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToResumeEdit = () => {
    window.location.href = '/student-dashboard/resume';
  };

  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };
  
  // Handle close without page refresh
  const handleClose = () => {
    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    } else {
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Apply for {job.title}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant={alreadyApplied ? "info" : "danger"}>
              {error}
              {alreadyApplied && (
                <div className="mt-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => {
                      if (onSubmitSuccess) {
                        onSubmitSuccess();
                      } else {
                        onHide();
                      }
                    }}
                  >
                    View My Applications
                  </Button>
                </div>
              )}
            </Alert>
          )}
          
          {success && (
            <Alert variant="success">
              <Alert.Heading>Application Submitted Successfully!</Alert.Heading>
              <p>Your application has been submitted and added to your applications list.</p>
              <hr />
              <p className="mb-0 small">
                Application ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
                <br />
                Submitted: {new Date().toLocaleString()}
              </p>
            </Alert>
          )}
          
          {/* Debug info collapsible section */}
          {debugInfo && (
            <div className="mb-3">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                onClick={toggleDebugInfo}
                className="mb-2"
              >
                {showDebugInfo ? 'Hide' : 'Show'} Diagnostic Info
              </Button>
              
              {showDebugInfo && (
                <Alert variant="info" className="small">
                  <pre className="mb-0" style={{ whiteSpace: 'pre-wrap', fontSize: '0.8rem' }}>
                    {debugInfo}
                  </pre>
                </Alert>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <h6>Position Details</h6>
            <p className="mb-1"><strong>Lab:</strong> {job.lab?.name || 'Unknown Lab'}</p>
            <p className="mb-1"><strong>Professor:</strong> {job.professor?.email || 'Unknown Professor'}</p>
            <p className="mb-0">
              <strong>Status:</strong>{' '}
              <Badge bg={job.status === 'OPEN' ? 'success' : 'secondary'}>
                {job.status || 'UNKNOWN'}
              </Badge>
              {job.status !== 'OPEN' && (
                <Alert variant="warning" className="mt-2 mb-0 py-2">
                  <small>This position is not currently accepting applications. Status: {job.status}</small>
                </Alert>
              )}
            </p>
            <p className="mb-0"><strong>Job ID:</strong> {job.jobId || 'Unknown'}</p>
          </div>
          
          {!resumeComplete && (
            <Alert variant="warning" className="mb-4">
              <Alert.Heading>Resume Incomplete</Alert.Heading>
              <p>
                Your resume profile is incomplete. A complete resume profile is required to apply for positions.
              </p>
              <div className="d-flex justify-content-end">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={navigateToResumeEdit}
                >
                  Complete Your Resume
                </Button>
              </div>
            </Alert>
          )}
          
          {resumeComplete && resumeData?.resumeDetails && !alreadyApplied && (
            <Card className="mb-4 bg-light">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Your Resume Information</h6>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={navigateToResumeEdit}
                  >
                    Edit Resume
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <small className="text-muted">
                  The following information from your resume will be shared with the professor when you apply:
                </small>
                
                <div className="mt-3">
                  <h6 className="mb-2">Education</h6>
                  <ul className="mb-3 ps-4">
                    {resumeData.resumeDetails.education
                      .filter(edu => edu.institution && edu.degree)
                      .map((edu, index) => (
                        <li key={index}>
                          <strong>{edu.degree}</strong> in {edu.major} at {edu.institution}
                          {edu.graduationEndYear && ` (${edu.graduationEndYear})`}
                          {edu.gpa && `, GPA: ${edu.gpa}`}
                        </li>
                      ))}
                  </ul>
                  
                  {resumeData.resumeDetails.experience.some(exp => exp.company && exp.position) && (
                    <>
                      <h6 className="mb-2">Experience</h6>
                      <ul className="mb-3 ps-4">
                        {resumeData.resumeDetails.experience
                          .filter(exp => exp.company && exp.position)
                          .map((exp, index) => (
                            <li key={index}>
                              <strong>{exp.position}</strong> at {exp.company}
                              {(exp.startDate || exp.endDate) && 
                                ` (${exp.startDate || ''} - ${exp.endDate || 'Present'})`}
                            </li>
                          ))}
                      </ul>
                    </>
                  )}
                  
                  <h6 className="mb-2">Skills</h6>
                  <p>
                    {resumeData.resumeDetails.skills
                      .filter(skill => skill.trim() !== '')
                      .join(', ')}
                  </p>
                  
                  {resumeData.resumeFileName && (
                    <p className="mb-0">
                      <strong>Resume File:</strong> {resumeData.resumeFileName}
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}
          
          {userInfo && userInfo.roles && !userInfo.roles.includes('Student') && (
            <Alert variant="danger">
              <Alert.Heading>Student Role Required</Alert.Heading>
              <p>You must have a Student role to apply for positions. Your current roles: {userInfo.roles.join(', ') || 'None'}</p>
            </Alert>
          )}
          
          {!alreadyApplied && !success && (
            <Form.Group className="mb-3">
              <Form.Label>Cover Letter</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Write your cover letter here... Explain why you're interested in this position and what skills you can bring to the lab."
                required
                disabled={isSubmitting || !resumeComplete || job.status !== 'OPEN'}
              />
              <Form.Text className="text-muted">
                Your cover letter helps the professor understand your interest and qualifications.
              </Form.Text>
            </Form.Group>
          )}

          {!alreadyApplied && !success && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Are you available over the summer to start/continue the project?</Form.Label>
                <Form.Select
                  value={summerAvailability}
                  onChange={(e) => setSummerAvailability(e.target.value)}
                  required
                  disabled={isSubmitting || !resumeComplete || job.status !== 'OPEN'}
                >
                  <option value="">Select your summer availability</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="no">No</option>
                  <option value="tbd">To be determined (TBD)</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>How many hours per week would you usually commit to the project?</Form.Label>
                <Form.Select
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(e.target.value)}
                  required
                  disabled={isSubmitting || !resumeComplete || job.status !== 'OPEN'}
                >
                  <option value="">Select hours per week</option>
                  <option value="1-7">1-7 hours</option>
                  <option value="8-12">8-12 hours</option>
                  <option value="13-19">13-19 hours</option>
                  <option value="20+">20+ hours</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>What are your expectations for this research opportunity?</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={expectations}
                  onChange={(e) => setExpectations(e.target.value)}
                  placeholder="Please describe what you hope to gain from this research experience..."
                  required
                  disabled={isSubmitting || !resumeComplete || job.status !== 'OPEN'}
                />
                <Form.Text className="text-muted">
                  Describe your goals, what you hope to learn, and how this fits your career plans.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleClose} 
            disabled={isSubmitting}
          >
            {success ? 'Close' : (alreadyApplied ? 'Close' : 'Cancel')}
          </Button>
          
          {!alreadyApplied && !success && (
            <Button 
              variant="primary" 
              type="submit" 
              disabled={isSubmitting || !coverLetter.trim() || !summerAvailability || !hoursPerWeek || !expectations.trim() || !resumeComplete || job.status !== 'OPEN'}
            >
              {isSubmitting ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Submitting...
                </>
              ) : (
                'Submit Application'
              )}
            </Button>
          )}
          
          {success && (
            <Button 
              variant="primary" 
              onClick={() => {
                if (onSubmitSuccess) {
                  onSubmitSuccess();
                } else {
                  onHide();
                }
              }}
            >
              View My Applications
            </Button>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default JobApplicationModal;