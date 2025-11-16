// components/ResumeManagement.tsx
import React, { useState, useEffect } from 'react';
import { Container, Alert, Row, Col, Button, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { 
  getAuthenticatedUser, 
  loadResumeDetailsFromStorage, 
  hasUploadedResume,
  saveResumeDetailsToStorage,
  getDefaultResumeDetails,
  isResumeComplete
} from '../utils';
import { ResumeDetails } from '../types';

// Import components
import PageHeader from './PageHeader';
import ProfileSummary from './ProfileSummary';
import ResumeUpload from './ResumeUpload';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';
import SkillsSection from './SkillsSection';
import ProjectsSection from './ProjectsSection';
import PersonalLinksSection from './PersonalLinksSection';

const ResumeManagement: React.FC = () => {
  // Loading and error state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Resume-related state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Resume details state
  const [resumeDetails, setResumeDetails] = useState<ResumeDetails>(getDefaultResumeDetails());
  
  // Resume completion status
  const [completionStatus, setCompletionStatus] = useState({
    isComplete: false,
    educationComplete: false,
    skillsComplete: false,
    resumeFileUploaded: false
  });
  
  // Load user and resume data
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Get user info
        const user = await getAuthenticatedUser();
        if (!user) {
          setError('Authentication error. Please log in again.');
          setLoading(false);
          return;
        }
        
        // Store user info in console for debugging
        if (user.username) {
          console.log(`Authenticated user: ${user.username}`);
        }
        if (user.attributes?.email) {
          console.log(`User email: ${user.attributes.email}`);
        }
        
        // Check if user has resume
        const hasResume = await hasUploadedResume();
        setResumeUploaded(hasResume);
        
        // Load resume details
        let savedDetails = await loadResumeDetailsFromStorage();
        
        // If no details found and we're in an error state, try localStorage fallback
        if (!savedDetails) {
          try {
            const localDetails = localStorage.getItem('resumeDetails');
            if (localDetails) {
              savedDetails = JSON.parse(localDetails);
              console.log('Loaded resume details from localStorage fallback');
            }
          } catch (localError) {
            console.error('Error reading from localStorage:', localError);
          }
        }
        
        if (savedDetails) {
          setResumeDetails(savedDetails);
        }
        
        // Get resume filename
        if (hasResume) {
          const storedFileName = localStorage.getItem('userResume');
          if (storedFileName) {
            setResumeFileName(storedFileName);
          }
        }
        
      } catch (err) {
        setError('Error loading your resume data. Some features may be limited.');
        console.error('Error loading resume data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Properly handle the async function call
    checkAuth().catch((error) => {
      console.error('Unhandled error in checkAuth:', error);
      setError('Failed to initialize resume management. Please refresh the page.');
      setLoading(false);
    });
  }, []);
  
  // Check completion status when resumeDetails changes
  useEffect(() => {
    // Check education completeness
    const educationComplete = resumeDetails.education.some(
      edu => edu.institution && edu.degree && edu.major
    );
    
    // Check skills completeness
    const skillsComplete = resumeDetails.skills.some(
      skill => skill.trim() !== ''
    );
    
    // Overall completeness
    const isComplete = educationComplete && skillsComplete && resumeUploaded;
    
    setCompletionStatus({
      isComplete,
      educationComplete,
      skillsComplete,
      resumeFileUploaded: resumeUploaded
    });
  }, [resumeDetails, resumeUploaded]);

  // Resume upload handlers
  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };

  const submitResumeUpload = async () => {
    // This function is called from the ResumeUpload component after successful upload
    console.log('Resume uploaded successfully, updating application state');
    setResumeUploaded(true);
    
    // After successful upload, check for resume completion
    const complete = await isResumeComplete();
    if (complete) {
      console.log('Resume is now complete');
    }
  };
  
  // Education handlers
  const handleEducationChange = (index: number, field: string, value: string) => {
    const updatedEducation = [...resumeDetails.education];
    updatedEducation[index] = { ...updatedEducation[index], [field]: value };
    setResumeDetails({ ...resumeDetails, education: updatedEducation });
  };
  
  const addEducation = () => {
    setResumeDetails({
      ...resumeDetails,
      education: [...resumeDetails.education, { 
        institution: '', 
        degree: '', 
        major: '', 
        graduationStartMonth: '',
        graduationStartYear: '',
        graduationEndMonth: '',
        graduationEndYear: '',
        gpa: '',
        yearsOfExperience: '',
        seniority: ''
      }]
    });
  };
  
  const removeEducation = (index: number) => {
    if (resumeDetails.education.length <= 1) return;
    const updatedEducation = resumeDetails.education.filter((_, i) => i !== index);
    setResumeDetails({ ...resumeDetails, education: updatedEducation });
  };
  
  // Experience handlers
  const handleExperienceChange = (index: number, field: string, value: string | boolean) => {
    const updatedExperience = [...resumeDetails.experience];
    updatedExperience[index] = { ...updatedExperience[index], [field]: value };
    setResumeDetails({ ...resumeDetails, experience: updatedExperience });
  };
  
  const addExperience = () => {
    setResumeDetails({
      ...resumeDetails,
      experience: [...resumeDetails.experience, { 
        company: '', 
        position: '', 
        startDate: '', 
        endDate: '', 
        description: '',
        startMonth: '',
        startYear: '',
        endMonth: '',
        endYear: '',
        isCurrent: false
      }]
    });
  };
  
  const removeExperience = (index: number) => {
    if (resumeDetails.experience.length <= 1) return;
    const updatedExperience = resumeDetails.experience.filter((_, i) => i !== index);
    setResumeDetails({ ...resumeDetails, experience: updatedExperience });
  };
  
  // Skills handlers
  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = [...resumeDetails.skills];
    updatedSkills[index] = value;
    setResumeDetails({ ...resumeDetails, skills: updatedSkills });
  };
  
  const addSkill = () => {
    setResumeDetails({
      ...resumeDetails,
      skills: [...resumeDetails.skills, '']
    });
  };
  
  const removeSkill = (index: number) => {
    if (resumeDetails.skills.length <= 1) return;
    const updatedSkills = resumeDetails.skills.filter((_, i) => i !== index);
    setResumeDetails({ ...resumeDetails, skills: updatedSkills });
  };
  
  // Project handlers
  const handleProjectChange = (index: number, field: string, value: string) => {
    const updatedProjects = [...resumeDetails.projects];
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    setResumeDetails({ ...resumeDetails, projects: updatedProjects });
  };
  
  const addProject = () => {
    setResumeDetails({
      ...resumeDetails,
      projects: [...resumeDetails.projects, { title: '', description: '', technologies: '', url: '' }]
    });
  };
  
  const removeProject = (index: number) => {
    if (resumeDetails.projects.length <= 1) return;
    const updatedProjects = resumeDetails.projects.filter((_, i) => i !== index);
    setResumeDetails({ ...resumeDetails, projects: updatedProjects });
  };
  
  // Personal Links handlers
  const handlePersonalLinksChange = (field: string, value: string) => {
    setResumeDetails({
      ...resumeDetails,
      personalLinks: {
        ...resumeDetails.personalLinks,
        [field]: value
      }
    });
  };
  
  // Save all resume details
  const saveResumeDetails = async () => {
    try {
      setSaving(true);
      
      // Log for debugging
      console.log('Saving resume details to both localStorage and database...');
      console.log('Resume data to save:', JSON.stringify(resumeDetails));
      
      // First save to localStorage as backup in case database save fails
      try {
        localStorage.setItem('resumeDetails', JSON.stringify(resumeDetails));
        console.log('Saved resume details to localStorage successfully');
      } catch (storageError) {
        console.warn('Could not save to localStorage:', storageError);
      }
      
      // Save to database with improved error handling
      let success = false;
      try {
        success = await saveResumeDetailsToStorage(resumeDetails);
        
        if (success) {
          console.log('Successfully saved resume details to database');
        } else {
          console.warn('Database save function returned false');
          // We still consider it a partial success since localStorage save worked
          success = true;
        }
      } catch (dbError) {
        console.error('Error saving to database:', dbError);
        // Still consider it a partial success if we saved to localStorage
        success = true;
      }
      
      if (success) {
        // Check completion
        const complete = await isResumeComplete();
        setCompletionStatus({
          ...completionStatus,
          isComplete: complete
        });
        
        // Show success alert
        setError(null);
        setSuccess('Resume details saved successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError('There was a problem saving your resume data. Please try again.');
      }
    } catch (error) {
      console.error('Error in saveResumeDetails:', error);
      setError('There was a problem saving your resume data. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Alert variant="info">
          <div className="d-flex align-items-center">
            <Spinner animation="border" size="sm" className="me-2" />
            Loading resume information...
          </div>
        </Alert>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          {error}
          <div className="mt-2">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="px-0">
      {/* Header Section */}
      <PageHeader 
        saveResumeDetails={saveResumeDetails}
        saving={saving}
      />
      
      {/* Main Content */}
      <Container>
        {/* Success Message */}
        {success && (
          <Alert variant="success" className="mb-4" dismissible onClose={() => setSuccess(null)}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </Alert>
        )}
        
        <Alert variant="success" className="mb-4 d-flex align-items-start">
          <i className="bi bi-lightbulb-fill me-2 mt-1"></i>
          <div>
            <p className="mb-0">
              <strong>Pro tip:</strong> The more details you provide, the better our system can match you with 
              relevant lab positions. Be specific about your skills, coursework, and experience.
            </p>
            <p className="mt-2 mb-0 small">
              <strong>Note:</strong> When you apply for a position, your resume information (education, experience, skills, and uploaded resume)
              will be shared with the professors reviewing your application.
            </p>
          </div>
        </Alert>
        
        {/* Resume Completion Status */}
        <Alert 
          variant={completionStatus.isComplete ? "success" : "warning"} 
          className="mb-4"
        >
          <Alert.Heading>
            {completionStatus.isComplete 
              ? "Your Resume is Complete!" 
              : "Resume Completion Status"}
          </Alert.Heading>
          
          <p>
            {completionStatus.isComplete 
              ? "Your profile is ready for job applications." 
              : "Please complete all sections below to ensure your application stands out to professors."}
          </p>
          
          <ul className="mb-0">
            <li className={completionStatus.educationComplete ? "text-success" : "text-danger"}>
              {completionStatus.educationComplete 
                ? "✓ Education information provided" 
                : "✗ Education information needed"}
            </li>
            <li className={completionStatus.skillsComplete ? "text-success" : "text-danger"}>
              {completionStatus.skillsComplete 
                ? "✓ Skills information provided" 
                : "✗ Skills information needed"}
            </li>
            <li className={completionStatus.resumeFileUploaded ? "text-success" : "text-danger"}>
              {completionStatus.resumeFileUploaded 
                ? "✓ Resume file uploaded" 
                : "✗ Resume file upload needed"}
            </li>
          </ul>
        </Alert>

        
        <Row>
          {/* Desktop Profile Summary */}
          <Col xl={3} className="mb-4 d-none d-xl-block">
            <ProfileSummary 
              resumeUploaded={resumeUploaded}
              resumeDetails={resumeDetails}
              saveResumeDetails={saveResumeDetails}
              saving={saving}
            />
          </Col>
          
          <Col xl={9}>
            {/* Main Form */}
            <Form>
              {/* Resume Upload */}
              <ResumeUpload 
                resumeFile={resumeFile}
                resumeFileName={resumeFileName}
                resumeUploaded={resumeUploaded}
                handleResumeUpload={handleResumeUpload}
                submitResumeUpload={submitResumeUpload}
              />

              {/* Education Section */}
              <EducationSection 
                education={resumeDetails.education}
                handleEducationChange={handleEducationChange}
                addEducation={addEducation}
                removeEducation={removeEducation}
              />
              
              {/* Experience Section */}
              <ExperienceSection 
                experience={resumeDetails.experience}
                handleExperienceChange={handleExperienceChange}
                addExperience={addExperience}
                removeExperience={removeExperience}
              />
              
              {/* Skills Section */}
              <SkillsSection 
                skills={resumeDetails.skills}
                handleSkillChange={handleSkillChange}
                addSkill={addSkill}
                removeSkill={removeSkill}
              />
              
              {/* Projects Section */}
              <ProjectsSection 
                projects={resumeDetails.projects}
                handleProjectChange={handleProjectChange}
                addProject={addProject}
                removeProject={removeProject}
              />
              
              {/* Personal Links Section */}
              <PersonalLinksSection 
                personalLinks={resumeDetails.personalLinks}
                handlePersonalLinksChange={handlePersonalLinksChange}
              />
              
              {/* Mobile Save Button */}
              <div className="d-xl-none mb-4">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-100"
                  onClick={saveResumeDetails}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : 'Save Resume Profile'}
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default ResumeManagement;