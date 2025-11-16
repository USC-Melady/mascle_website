import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { getJobById, Job } from '../../utils/jobManagement';

const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) {
        setError('Job ID is missing');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const jobData = await getJobById(jobId);
        
        if (!jobData) {
          setError('Job not found');
        } else {
          setJob(jobData);
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);
  
  const getBadgeColor = (status: string) => {
    const statusUpperCase = status.toUpperCase();
    switch (statusUpperCase) {
      case 'OPEN':
        return 'success';
      case 'CLOSED':
        return 'secondary';
      case 'FILLED':
        return 'info';
      case 'DRAFT':
        return 'warning';
      default:
        return 'primary';
    }
  };
  
  const handleBackClick = () => {
    navigate('/jobs/manage');
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
        <Button variant="outline-danger" onClick={handleBackClick}>
          Back to Jobs
        </Button>
      </Alert>
    );
  }
  
  if (!job) {
    return (
      <Alert variant="warning" className="my-4">
        <Alert.Heading>Job Not Found</Alert.Heading>
        <p>The requested job could not be found.</p>
        <Button variant="outline-primary" onClick={handleBackClick}>
          Back to Jobs
        </Button>
      </Alert>
    );
  }
  
  return (
    <div className="job-detail-container my-4">
      <Button 
        variant="outline-primary" 
        onClick={handleBackClick}
        className="mb-3"
      >
        &larr; Back to Jobs
      </Button>
      
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2>{job.title}</h2>
          <Badge bg={getBadgeColor(job.status || 'DRAFT')}>
            {job.status || 'DRAFT'}
          </Badge>
        </Card.Header>
        
        <Card.Body>
          <Row>
            <Col md={8}>
              <Card.Title>Job Description</Card.Title>
              <Card.Text style={{ whiteSpace: 'pre-line' }}>
                {job.description}
              </Card.Text>
            </Col>
            
            <Col md={4}>
              <Card className="mb-3">
                <Card.Header>Job Details</Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Lab:</strong> {job.lab?.name || 'Not specified'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Professor:</strong> {job.professor?.email || 'Not specified'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Created:</strong> {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Last Updated:</strong> {job.updatedAt ? new Date(job.updatedAt).toLocaleDateString() : 'N/A'}
                  </ListGroup.Item>
                </ListGroup>
              </Card>
              
              <Card>
                <Card.Header>Requirements</Card.Header>
                <Card.Body>
                  <Card.Text style={{ whiteSpace: 'pre-line' }}>
                    {job.requirements || 'No specific requirements listed.'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default JobDetail; 