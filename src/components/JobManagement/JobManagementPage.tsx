import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert, Form, InputGroup, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faPlus, faEdit, faTrash, faBriefcase } from '@fortawesome/free-solid-svg-icons';
import { getCurrentUser } from '@aws-amplify/auth';
import { Job, getJobs, createJob, updateJob, deleteJob } from '../../utils/jobManagement';
import { getLabs } from '../../utils/labManagement';
import { useNavigate } from 'react-router-dom';
import { getJobStatusBadge } from '../../utils/statusUtils';

const JobManagementPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [labOptions, setLabOptions] = useState<{value: string, label: string}[]>([]);
  const navigate = useNavigate();

  // Form state for editing/creating a job
  const [formData, setFormData] = useState<Partial<Job>>({
    title: '',
    description: '',
    labId: '',
    professorId: '',
    requirements: '',
    status: 'Open',
    visibility: 'public'
  });

  useEffect(() => {
    const fetchUserAndJobs = async () => {
      try {
        // Get the current user
        const user = await getCurrentUser();
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        console.log('Current user:', user);
        setUserId(user.username);

        // Load labs for dropdown options
        const labsData = await getLabs();
        console.log('Labs data:', labsData);
        
        // Create lab options for dropdown
        const options = labsData.map(lab => ({
          value: lab.labId,
          label: lab.name
        }));
        setLabOptions(options);

        // Fetch jobs from the backend
        // The backend will handle permissions and only return jobs this user should see
        const jobsData = await getJobs();
        console.log('Jobs data:', jobsData);
        
        setJobs(jobsData);
        setFilteredJobs(jobsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load jobs. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserAndJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search term and status filter
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.lab?.name && job.lab.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.requirements && job.requirements.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(job => job.status.toLowerCase() === statusFilter.toLowerCase());
    }

    setFilteredJobs(filtered);
  }, [searchTerm, statusFilter, jobs]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
  };

  const handleEditJob = (job: Job) => {
    setFormData({
      title: job.title,
      description: job.description,
      labId: job.labId,
      professorId: job.professorId,
      requirements: job.requirements,
      status: job.status,
      visibility: job.visibility || 'public'
    });
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const handleDeleteClick = (jobId: string) => {
    setJobToDelete(jobId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;

    setIsSubmitting(true);
    try {
      await deleteJob(jobToDelete);
      // Force refresh the jobs list to ensure deleted jobs are removed
      const refreshedJobs = await getJobs(true);
      setJobs(refreshedJobs);
      setFilteredJobs(refreshedJobs);
      setShowDeleteModal(false);
      setJobToDelete(null);
    } catch (error) {
      console.error('Error deleting job:', error);
      setError('Failed to delete job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add a helper function to find lab name by labId
  const getLabNameById = (labId: string): string => {
    const lab = labOptions.find(option => option.value === labId);
    return lab ? lab.label : 'Unknown Lab';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Clear any previous errors

    try {
      const jobDataToSubmit = { ...formData };
      
      // Ensure professorId is set to current user if not already set
      if (!jobDataToSubmit.professorId || jobDataToSubmit.professorId.trim() === '') {
        console.log('Setting professor ID to current user:', userId);
        jobDataToSubmit.professorId = userId;
      }
      
      // Validate required fields
      if (!jobDataToSubmit.title || !jobDataToSubmit.description || !jobDataToSubmit.labId || !jobDataToSubmit.professorId) {
        console.error('Missing required fields for job creation');
        setError('Please fill in all required fields: title, description, lab, and professor.');
        setIsSubmitting(false);
        return;
      }
      
      console.log('Submitting job data:', jobDataToSubmit);

      if (selectedJob) {
        // Update existing job
        console.log('Updating job with ID:', selectedJob.jobId);
        const updatedJob = await updateJob(selectedJob.jobId, jobDataToSubmit);
        if (updatedJob) {
          console.log('Job updated successfully:', updatedJob);
          // Ensure lab name is set for display
          if (updatedJob.labId && !updatedJob.lab?.name) {
            updatedJob.lab = {
              name: getLabNameById(updatedJob.labId)
            };
          }
          setJobs(jobs.map(job => job.jobId === selectedJob.jobId ? updatedJob : job));
        } else {
          console.error('Failed to update job - returned null');
          setError('Failed to update job. Please try again.');
        }
      } else {
        // Create new job
        console.log('Creating new job with data:', jobDataToSubmit);
        
        const newJob = await createJob(jobDataToSubmit as Omit<Job, 'jobId' | 'createdAt' | 'updatedAt'>);
        if (newJob) {
          console.log('Job created successfully:', newJob);
          // Ensure lab name is set for display
          if (newJob.labId && !newJob.lab?.name) {
            newJob.lab = {
              name: getLabNameById(newJob.labId)
            };
          }
          setJobs([...jobs, newJob]);
        } else {
          console.error('Failed to create job - returned null');
          setError('Failed to create job. Please check the console for details and try again.');
        }
      }
      
      setShowEditModal(false);
      setSelectedJob(null);
      setFormData({
        title: '',
        description: '',
        labId: '',
        professorId: '',
        requirements: '',
        status: 'Open',
        visibility: 'public'
      });
    } catch (error) {
      console.error('Error submitting job:', error);
      setError('Failed to save job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleViewApplications = (jobId: string, jobTitle: string) => {
    // Navigate to Applications tab with job filter applied
    navigate(`/professor-dashboard?tab=applications&fromJob=${encodeURIComponent(jobId)}&jobTitle=${encodeURIComponent(jobTitle)}`);
  };

  if (loading) {
    return (
      <Container>
        <Alert variant="info">Loading jobs...</Alert>
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
      <Row className="mx-0 mb-4">
        <Col>
          <h1>
            <FontAwesomeIcon icon={faBriefcase} className="me-2" />
            Job Management
          </h1>
          <p className="text-muted">Manage job postings, review applications, and track hiring status.</p>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="bg-light">
          <Row className="align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select 
                value={statusFilter}
                onChange={handleStatusFilter}
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="filled">Filled</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button 
                variant="primary"
                onClick={() => {
                  setSelectedJob(null);
                  setFormData({
                    title: '',
                    description: '',
                    labId: '',
                    professorId: userId, // Auto-set current user as professor
                    requirements: '',
                    status: 'Open',
                    visibility: 'public'
                  });
                  setShowEditModal(true);
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-1" />
                New Job
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Title</th>
                <th>Lab</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length > 0 ? (
                filteredJobs.map(job => (
                  <tr key={job.jobId}>
                    <td>{job.title}</td>
                    <td>{job.lab?.name || 'Unknown Lab'}</td>
                    <td>
                      <Badge bg={getJobStatusBadge(job.status)}>
                        {job.status}
                      </Badge>
                    </td>
                    <td>
                      {(job.applicantsCount ?? 0) > 0 ? (
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleViewApplications(job.jobId, job.title)}
                        >
                          {job.applicantsCount} application{(job.applicantsCount ?? 0) !== 1 ? 's' : ''}
                        </Button>
                      ) : (
                        'No applications'
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleViewJob(job)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleEditJob(job)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteClick(job.jobId)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-3">
                    {searchTerm || statusFilter !== 'all' ? 
                      'No jobs match your search criteria' : 
                      'No jobs found. Create a new job to get started.'}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Job Details Modal */}
      <Modal show={!!selectedJob && !showEditModal} onHide={() => setSelectedJob(null)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedJob?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedJob && (
            <div>
              <h5>Lab</h5>
              <p>{selectedJob.lab?.name || 'Unknown Lab'}</p>

              <h5>Status</h5>
              <p>
                <Badge bg={getJobStatusBadge(selectedJob.status)}>
                  {selectedJob.status}
                </Badge>
              </p>

              <h5>Description</h5>
              <p>{selectedJob.description}</p>

              <h5>Requirements</h5>
              <p>{selectedJob.requirements || 'No specific requirements'}</p>

              {selectedJob.applicantsCount !== undefined && (
                <>
                  <h5>Applications</h5>
                  <p>
                    {selectedJob.applicantsCount > 0 ? (
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => {
                          setSelectedJob(null);
                          handleViewApplications(selectedJob.jobId, selectedJob.title);
                        }}
                      >
                        View {selectedJob.applicantsCount} application{selectedJob.applicantsCount !== 1 ? 's' : ''}
                      </Button>
                    ) : (
                      'No applications yet'
                    )}
                  </p>
                </>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelectedJob(null)}>
            Close
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedJob) {
                handleEditJob(selectedJob);
              }
            }}
          >
            Edit Job
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Job Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>{selectedJob ? 'Edit Job' : 'Create New Job'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title*</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Lab*</Form.Label>
              <Form.Select
                name="labId"
                value={formData.labId}
                onChange={handleFormChange}
                required
              >
                <option value="">Select a lab</option>
                {labOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleFormChange}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Filled">Filled</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Visibility</Form.Label>
              <Form.Select
                name="visibility"
                value={formData.visibility}
                onChange={handleFormChange}
              >
                <option value="public">Public - Visible to everyone</option>
                <option value="private">Private - Login required to view</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Public jobs are visible to all visitors. Private jobs require users to login to view details.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description*</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Requirements</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="requirements"
                value={formData.requirements}
                onChange={handleFormChange}
              />
              <Form.Text className="text-muted">
                Optional: Include any specific skills, qualifications, or experience required.
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (selectedJob ? 'Update Job' : 'Create Job')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this job? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete Job'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobManagementPage; 