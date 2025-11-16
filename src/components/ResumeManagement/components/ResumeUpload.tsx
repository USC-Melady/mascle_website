// components/ResumeUpload.tsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge, Alert, ProgressBar } from 'react-bootstrap';
import { saveResumeFile, getResumeFileUrl } from '../utils';
import { fetchAuthSession } from 'aws-amplify/auth';
import { API_ENDPOINTS } from '../../../config';

interface ResumeUploadProps {
  resumeFile: File | null;
  resumeFileName: string | null;
  resumeUploaded: boolean;
  handleResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitResumeUpload: () => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ 
  resumeFile, 
  resumeFileName,
  resumeUploaded, 
  handleResumeUpload, 
  submitResumeUpload 
}) => {
  const [uploadStatus, setUploadStatus] = useState<{
    uploading: boolean;
    progress: number;
    error: string | null;
    success: boolean;
  }>({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });
  
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Get the URL for the already uploaded file when component mounts
  useEffect(() => {
    const getExistingFileUrl = async () => {
      if (resumeFileName && resumeUploaded) {
        try {
          const url = await getResumeFileUrl(resumeFileName);
          setFileUrl(url);
        } catch (error) {
          console.error('Error getting file URL:', error);
        }
      }
    };
    
    getExistingFileUrl();
  }, [resumeFileName, resumeUploaded]);
  
  const handleUpload = async () => {
    if (!resumeFile) return;
    
    try {
      // Reset upload status
      setUploadStatus({
        uploading: true,
        progress: 0,
        error: null,
        success: false
      });
      
      console.log('Starting resume upload process...');
      
      // First step: Validate the file on the client side
      if (resumeFile.size > 10 * 1024 * 1024) { // 10MB
        throw new Error('File too large. Maximum size is 10MB.');
      }
      
      const extension = resumeFile.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'doc', 'docx'];
      if (!extension || !allowedExtensions.includes(extension)) {
        throw new Error(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`);
      }
      
      setUploadStatus(prev => ({ ...prev, progress: 10 }));
      
      // Second step: Get a pre-signed URL from the server
      setUploadStatus(prev => ({ ...prev, progress: 20 }));
      
      // Use the saveResumeFile utility which now handles the entire pre-signed URL flow
      const fileName = await saveResumeFile(resumeFile);
      
      // If we get here, the file was successfully uploaded to S3
      setUploadStatus(prev => ({ ...prev, progress: 95 }));
      
      if (fileName) {
        // Get the URL for the uploaded file
        const url = await getResumeFileUrl(fileName);
        setFileUrl(url);
        
        setUploadStatus({
          uploading: false,
          progress: 100,
          error: null,
          success: true
        });
        
        // Call the parent component's submitResumeUpload function
        submitResumeUpload();
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Failed to upload file',
        success: false
      });
    }
  };
  
  const getFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${Math.round(size / (1024 * 1024) * 10) / 10} MB`;
  };

  const handleViewResume = async (resumeUrl: string) => {
    console.log('🔍 ResumeUpload handleViewResume called with:', resumeUrl);
    
    if (!resumeUrl) {
      alert('No resume available');
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
    console.log('🔍 ResumeUpload handleViewPdf called with:', resumeUrl);

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
    console.log('📥 ResumeUpload handleDownloadResume called with:', resumeUrl);

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
  
  // Validate file before enabling upload button
  const isValidFile = resumeFile && 
    resumeFile.size <= 10 * 1024 * 1024 && // 10MB limit
    ['pdf', 'doc', 'docx'].includes(resumeFile.name.split('.').pop()?.toLowerCase() || '');

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-cloud-upload me-2"></i>
          <h5 className="mb-0">Resume Upload</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {uploadStatus.error && (
          <Alert variant="danger" dismissible onClose={() => setUploadStatus(prev => ({ ...prev, error: null }))}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {uploadStatus.error}
          </Alert>
        )}
        
        {uploadStatus.success && (
          <Alert variant="success" dismissible onClose={() => setUploadStatus(prev => ({ ...prev, success: false }))}>
            <i className="bi bi-check-circle me-2"></i>
            Resume uploaded successfully!
          </Alert>
        )}
        
        <Row>
          <Col md={8}>
            <p className="mb-3">
              Upload your resume to help us match you with relevant positions. Your resume will be shared with professors when you apply for positions.
            </p>
            
            {uploadStatus.uploading && (
              <div className="mb-3">
                <ProgressBar 
                  animated 
                  now={uploadStatus.progress} 
                  label={`${uploadStatus.progress}%`} 
                />
                <div className="text-center mt-2">
                  <small>
                    {uploadStatus.progress < 20 ? 'Preparing upload...' : 
                     uploadStatus.progress < 30 ? 'Generating secure upload link...' :
                     uploadStatus.progress < 90 ? 'Uploading resume...' : 
                     'Processing upload...'}
                  </small>
                </div>
              </div>
            )}
            
            <div className="d-flex align-items-center mb-3">
              <Form.Control 
                type="file" 
                accept=".pdf,.doc,.docx" 
                onChange={handleResumeUpload}
                placeholder="Select a PDF, DOC, or DOCX file (Max 10MB)"
                disabled={uploadStatus.uploading}
              />
              <Button 
                variant="primary" 
                onClick={handleUpload}
                disabled={!isValidFile || uploadStatus.uploading}
                className="ms-2"
              >
                {uploadStatus.uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
            <Form.Text className="text-muted">
              Accepted formats: PDF, DOC, DOCX (Max 10MB)
            </Form.Text>
            
            {resumeUploaded && (fileUrl || resumeFileName) && (
              <div className="mt-3">
                <Button 
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => handleViewResume(fileUrl || resumeFileName || '')}
                >
                  <i className="bi bi-file-earmark-text me-2"></i>
                  View Uploaded Resume
                </Button>
              </div>
            )}
          </Col>
          <Col md={4} className="text-center d-flex flex-column justify-content-center">
            {resumeFile ? (
              <div className="border rounded p-3 bg-light">
                <i className={`bi bi-file-earmark${isValidFile ? '-check text-success' : '-x text-danger'}`} style={{ fontSize: '2rem' }}></i>
                <p className="mb-0 mt-2">{resumeFile.name}</p>
                <small className={`${resumeFile.size > 10 * 1024 * 1024 ? 'text-danger' : 'text-muted'}`}>
                  {getFileSize(resumeFile.size)}
                  {resumeFile.size > 10 * 1024 * 1024 ? ' (too large)' : ''}
                </small>
                <Badge bg={isValidFile ? (uploadStatus.uploading ? 'warning' : 'success') : 'danger'} className="d-block mx-auto mt-2 w-75">
                  {!isValidFile ? 'Invalid File' : 
                   (uploadStatus.uploading ? 'Uploading...' : (resumeUploaded ? 'Ready to Replace' : 'Ready to Upload'))}
                </Badge>
              </div>
            ) : resumeUploaded && resumeFileName ? (
              <div className="border rounded p-3 bg-light">
                <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '2rem' }}></i>
                <p className="mb-0 mt-2">{resumeFileName.split('/').pop() || 'Resume'}</p>
                <Badge bg="success" className="d-block mx-auto mt-2 w-75">
                  Current Resume
                </Badge>
              </div>
            ) : (
              <div className="border rounded p-3 bg-light">
                <i className="bi bi-file-earmark-text text-secondary" style={{ fontSize: '2rem' }}></i>
                <p className="mb-0 mt-2">No file selected</p>
                <Badge bg="secondary" className="d-block mx-auto mt-2 w-75">
                  {resumeUploaded ? 'Replace Existing' : 'Upload Required'}
                </Badge>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default ResumeUpload;