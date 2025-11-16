import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { createApplication } from '../utils/jobManagement';
import { uploadData } from 'aws-amplify/storage';
import { fetchAuthSession } from 'aws-amplify/auth';
import { v4 as uuidv4 } from 'uuid';

const FormContainer = styled.div`
  margin-top: 2rem;
`;

const FormGroup = styled(Form.Group)`
  margin-bottom: 1.5rem;
`;

const SubmitButton = styled(Button)`
  margin-top: 1rem;
  background-color: #990000;
  border-color: #990000;
  
  &:hover, &:focus {
    background-color: #7a0000;
    border-color: #7a0000;
  }
`;

interface ApplicationFormProps {
  jobId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export interface ApplicationFormData {
  fullName: string;
  email: string;
  phone: string;
  education: string;
  resume: File | null;
  coverLetter: string;
  summerAvailability: string;
  hoursPerWeek: string;
  expectations: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ jobId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState<ApplicationFormData>({
    fullName: '',
    email: '',
    phone: '',
    education: '',
    resume: null,
    coverLetter: '',
    summerAvailability: '',
    hoursPerWeek: '',
    expectations: ''
  });
  
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({
        ...prev,
        resume: e.target.files![0]
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setError('Please fill out all required fields correctly.');
      setValidated(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // *** Added Check: Log authentication status ***
      try {
        const session = await fetchAuthSession();
        if (!session.tokens?.idToken) {
          console.error('ApplicationForm: User not authenticated before submitting application.');
          throw new Error('You must be logged in to submit an application.');
        } else {
          console.log('ApplicationForm: User is authenticated. Proceeding with submission.');
        }
      } catch (authError) {
        console.error('ApplicationForm: Error checking authentication status:', authError);
        throw new Error('Could not verify authentication status. Please try signing in again.');
      }
      // *** End Added Check ***

      // 1. Upload resume to S3 if present
      let resumeUrl = '';
      let resumeFileName = '';
      if (formData.resume) {
        resumeFileName = formData.resume.name;
        try {
          const fileExtension = formData.resume.name.split('.').pop();
          const fileName = `resumes/${uuidv4()}.${fileExtension}`;
          
          console.log('Attempting S3 upload of file:', fileName);
          
          // Upload file using the new uploadData API
          const result = await uploadData({
            key: fileName,
            data: formData.resume,
            options: {
              contentType: formData.resume.type,
              onProgress: (progress) => {
                console.log(`Upload progress: ${progress.transferredBytes}/${progress.totalBytes}`);
              }
            }
          });
          
          console.log('S3 upload completed:', result);
          resumeUrl = fileName;
        } catch (uploadError) {
          console.error('Error uploading to S3:', uploadError);
          throw new Error(`File upload failed: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
        }
      }
      
      // 2. Submit application with resume URL
      console.log('Submitting application for job:', jobId);
      const result = await createApplication(
        jobId,
        formData.coverLetter,
        {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          education: formData.education,
          skills: '', // TODO: Add a skills field to the form
          resumeFileName,
          resumeUrl,
          summerAvailability: formData.summerAvailability,
          hoursPerWeek: formData.hoursPerWeek,
          expectations: formData.expectations
        }
      );
      
      if (result) {
        console.log('Application submitted successfully');
        onSuccess();
      } else {
        console.error('Application submission returned null result');
        setError('Failed to submit application. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      // Provide a more specific error message depending on the error
      if (err instanceof Error) {
        // Handle specific error messages first
        if (err.message.includes('already applied')) {
          setError('You have already applied for this job.');
        } else if (err.message.includes('logged in') || err.message.includes('No credentials')) {
          setError('Authentication error. Please sign in again.');
        } else if (err.message.includes('Storage module is not configured')) {
          setError('Storage is not properly configured. Please contact support.');
        } else if (err.message.includes('NetworkError') || err.message.includes('Network Error')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          // Generic error message for other cases
          setError(err.message || 'An unexpected error occurred while submitting your application.');
        }
      } else {
        setError('An unexpected error occurred while submitting your application.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <FormGroup controlId="fullName">
          <Form.Label>Full Name</Form.Label>
          <Form.Control
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide your full name.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="email">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid email address.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="phone">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide a valid phone number.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="education">
          <Form.Label>Education Level</Form.Label>
          <Form.Select
            name="education"
            value={formData.education}
            onChange={handleChange}
            required
          >
            <option value="">Select your education level</option>
            <option value="undergraduate">Undergraduate</option>
            <option value="masters">Master's</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Please select your education level.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="resume">
          <Form.Label>Resume/CV</Form.Label>
          <Form.Control
            type="file"
            name="resume"
            onChange={handleFileChange}
            required
          />
          <Form.Text className="text-muted">
            Upload your resume or CV (PDF format preferred).
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            Please upload your resume or CV.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="coverLetter">
          <Form.Label>Cover Letter</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            placeholder="Tell us why you're interested in this position..."
            required
          />
          <Form.Control.Feedback type="invalid">
            Please provide a cover letter.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="summerAvailability">
          <Form.Label>Are you available over the summer to start/continue the project?</Form.Label>
          <Form.Select
            name="summerAvailability"
            value={formData.summerAvailability}
            onChange={handleChange}
            required
          >
            <option value="">Select your summer availability</option>
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="no">No</option>
            <option value="tbd">To be determined (TBD)</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Please indicate your summer availability.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="hoursPerWeek">
          <Form.Label>How many hours per week would you usually commit to the project?</Form.Label>
          <Form.Select
            name="hoursPerWeek"
            value={formData.hoursPerWeek}
            onChange={handleChange}
            required
          >
            <option value="">Select hours per week</option>
            <option value="1-7">1-7 hours</option>
            <option value="8-12">8-12 hours</option>
            <option value="13-19">13-19 hours</option>
            <option value="20+">20+ hours</option>
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            Please select your weekly time commitment.
          </Form.Control.Feedback>
        </FormGroup>

        <FormGroup controlId="expectations">
          <Form.Label>What are your expectations for this research opportunity?</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="expectations"
            value={formData.expectations}
            onChange={handleChange}
            placeholder="Please describe what you hope to gain from this research experience..."
            required
          />
          <Form.Control.Feedback type="invalid">
            Please describe your expectations.
          </Form.Control.Feedback>
        </FormGroup>

        <div className="d-flex justify-content-end">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            className="me-2"
            disabled={loading}
          >
            Cancel
          </Button>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? (
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
          </SubmitButton>
        </div>
      </Form>
    </FormContainer>
  );
};

export default ApplicationForm; 