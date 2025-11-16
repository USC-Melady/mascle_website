import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Row, Col, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { getAuthenticatedUser } from '../../utils/auth';
import { getAllUsers } from '../../utils/userManagement';
import { getLabs, createLab, updateLab, deleteLab } from '../../utils/labManagement';
import { Lab } from '../../utils/labManagement';
import { User } from '../../types/api';

interface LabFormData {
  name: string;
  description: string;
  professorIds: string[];
  labAssistantIds: string[];
  status: string;
}

// Define the option type for react-select
interface SelectOption {
  value: string;
  label: string;
}

const LabManagementPage: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Lab | null>(null);
  const [formData, setFormData] = useState<LabFormData>({
    name: '',
    description: '',
    professorIds: [],
    labAssistantIds: [],
    status: 'ACTIVE'
  });
  // State for react-select components
  const [selectedProfessors, setSelectedProfessors] = useState<SelectOption[]>([]);
  const [selectedAssistants, setSelectedAssistants] = useState<SelectOption[]>([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentAuthUser, setCurrentAuthUser] = useState<any>(null);

  useEffect(() => {
    const fetchUserAndLabs = async () => {
      try {
        setLoading(true);
        
        // Get the authenticated user
        const user = await getAuthenticatedUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Store the current user for professor name display
        setCurrentAuthUser(user);
        
        // Set the user's primary role
        if (user.roles.includes('Admin')) {
          setUserRole('Admin');
        } else if (user.roles.includes('Professor')) {
          setUserRole('Professor');
        } else if (user.roles.includes('LabAssistant')) {
          setUserRole('LabAssistant');
        } else {
          setUserRole('Student');
        }
        
        // Get all labs (our new function will handle filtering)
        const labsData = await getLabs();
        setLabs(labsData);
        
        // Fetch all users if the user is an admin or professor (professors need it to display names)
        if (user.roles.includes('Admin') || user.roles.includes('Professor')) {
          const usersData = await getAllUsers();
          setUsers(usersData);
        }
        
      } catch (err) {
        console.error('Error fetching labs:', err);
        setError('Failed to load labs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndLabs();
  }, []);

  const getStatusBadge = (status?: string) => {
    if (!status) return <Badge bg="secondary">Unknown</Badge>;
    
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="warning">Inactive</Badge>;
      case 'archived':
        return <Badge bg="secondary">Archived</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  const handleManageLab = (labId: string) => {
    navigate(`/lab/${labId}/members`);
  };

  const handleCreateLab = () => {
    setEditingLab(null);
    setFormData({
      name: '',
      description: '',
      professorIds: [],
      labAssistantIds: [],
      status: 'ACTIVE'
    });
    // Reset the select components
    setSelectedProfessors([]);
    setSelectedAssistants([]);
    setShowModal(true);
  };

  const handleEditLab = (lab: Lab) => {
    setEditingLab(lab);
    
    // Set form data
    setFormData({
      name: lab.name,
      description: lab.description || '',
      professorIds: lab.professorIds || [lab.professorId],
      labAssistantIds: lab.labAssistantIds || [],
      status: lab.status || 'ACTIVE'
    });
    
    // Set selected professors for react-select
    const professorOptions = (lab.professorIds || [lab.professorId]).map(id => {
      const professor = users.find(u => u.userId === id);
      return {
        value: id,
        label: professor ? professor.email : id
      };
    });
    setSelectedProfessors(professorOptions);
    
    // Set selected assistants for react-select
    const assistantOptions = (lab.labAssistantIds || []).map(id => {
      const assistant = users.find(u => u.userId === id);
      return {
        value: id,
        label: assistant ? assistant.email : id
      };
    });
    setSelectedAssistants(assistantOptions);
    
    setShowModal(true);
  };

  const handleDeleteLab = (lab: Lab) => {
    setConfirmDelete(lab);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const getProfessors = () => {
    return users.filter(user => user.roles.includes('Professor'));
  };

  const getProfessorOptions = (): SelectOption[] => {
    return getProfessors().map((professor: User) => ({
      value: professor.userId,
      label: formatUserLabel(professor)
    }));
  };

  // Helper function to format user display in dropdowns
  const formatUserLabel = (user: User): string => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName} (${user.email})`;
    } else if (user.firstName) {
      return `${user.firstName} (${user.email})`;
    } else if (user.lastName) {
      return `${user.lastName} (${user.email})`;
    } else {
      return user.email;
    }
  };

  const getLabAssistants = () => {
    return users.filter(user => user.roles.includes('LabAssistant'));
  };

  const getLabAssistantOptions = (): SelectOption[] => {
    return getLabAssistants().map((assistant: User) => ({
      value: assistant.userId,
      label: formatUserLabel(assistant)
    }));
  };

  const handleProfessorChange = (selected: readonly SelectOption[] | null) => {
    const selectedItems = selected || [];
    setSelectedProfessors(selectedItems as SelectOption[]);
    setFormData({
      ...formData,
      professorIds: selectedItems.map(item => item.value)
    });
  };

  const handleAssistantChange = (selected: readonly SelectOption[] | null) => {
    const selectedItems = selected || [];
    setSelectedAssistants(selectedItems as SelectOption[]);
    setFormData({
      ...formData,
      labAssistantIds: selectedItems.map(item => item.value)
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingLab) {
        // Update existing lab
        await updateLab(editingLab.labId, {
          name: formData.name,
          description: formData.description,
          professorIds: formData.professorIds,
          labAssistantIds: formData.labAssistantIds,
          status: formData.status
        });
        
        // Update local state
        setLabs(labs.map(lab => 
          lab.labId === editingLab.labId 
            ? { 
                ...lab, 
                name: formData.name,
                description: formData.description,
                professorIds: formData.professorIds,
                professorId: formData.professorIds[0], // Update primary professor
                labAssistantIds: formData.labAssistantIds,
                status: formData.status
              } 
            : lab
        ));
      } else {
        // Create new lab
        const newLab = await createLab({
          name: formData.name,
          description: formData.description,
          professorId: formData.professorIds[0], // Use first professor as primary
          professorIds: formData.professorIds,
          labAssistantIds: formData.labAssistantIds,
          status: formData.status
        });
        
        // Add to local state
        if (newLab) {
          setLabs([...labs, newLab]);
        }
      }
      
      // Reset and close modal
      setShowModal(false);
      setEditingLab(null);
    } catch (err) {
      console.error('Error saving lab:', err);
      setError('Failed to save lab. Please try again.');
    }
  };

  const confirmDeleteLab = async () => {
    if (!confirmDelete) return;
    
    try {
      await deleteLab(confirmDelete.labId);
      
      // Update local state
      setLabs(labs.filter(lab => lab.labId !== confirmDelete.labId));
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting lab:', err);
      setError('Failed to delete lab. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading labs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  if (labs.length === 0 && userRole !== 'Admin') {
    return (
      <Alert variant="info">
        You don't have any labs assigned to you.
      </Alert>
    );
  }

  return (
    <Row className="mx-0">
      <Col>
        <Card className="mb-4 shadow-sm">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="m-0">Labs</h5>
            {userRole === 'Admin' && (
              <Button variant="primary" size="sm" onClick={handleCreateLab}>
                Create New Lab
              </Button>
            )}
          </Card.Header>
          <Card.Body className="p-0">
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Primary Professor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {labs.map(lab => (
                  <tr key={lab.labId}>
                    <td>{lab.name}</td>
                    <td>{lab.description}</td>
                    <td>
                      {(() => {
                        // First check if this is the current logged-in user's lab
                        if (currentAuthUser && (currentAuthUser.username === lab.professorId || currentAuthUser.attributes?.sub === lab.professorId)) {
                          const displayName = 
                            currentAuthUser.attributes?.given_name || 
                            currentAuthUser.attributes?.name ||
                            currentAuthUser.attributes?.email?.split('@')[0];
                          
                          if (displayName) {
                            console.log(`Using current auth user's name: ${displayName} for professor ${lab.professorId}`);
                            return displayName;
                          }
                        }
                        
                        // Try multiple ways to find the professor user in the fetched users array
                        let professor = users.find(u => u.userId === lab.professorId);
                        
                        // If not found by userId, try by email as fallback
                        if (!professor) {
                          professor = users.find(u => u.email === lab.professorId);
                        }
                        
                        console.log(`Looking for professor ${lab.professorId}`);
                        console.log('Available users:', users.length);
                        
                        if (!professor) {
                          console.log(`Professor ${lab.professorId} not found in users array`);
                          return lab.professorId;
                        }
                        
                        // Try to get a proper display name with expanded options
                        const displayName = 
                          professor.fullName || 
                          professor.givenName ||
                          (professor.firstName && professor.lastName ? `${professor.firstName} ${professor.lastName}` : null) ||
                          professor.email?.split('@')[0] ||
                          professor.email;
                        
                        console.log(`Display name for ${lab.professorId}:`, displayName);
                        return displayName || lab.professorId;
                      })()}
                    </td>
                    <td>{getStatusBadge(lab.status)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleManageLab(lab.labId)}
                      >
                        Manage Members
                      </Button>
                      {userRole === 'Admin' && (
                        <>
                          <Button 
                            variant="outline-secondary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleEditLab(lab)}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDeleteLab(lab)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      
      {/* Create/Edit Lab Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingLab ? 'Edit Lab' : 'Create New Lab'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Lab Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                name="description" 
                value={formData.description} 
                onChange={handleInputChange}
                rows={3}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Professors</Form.Label>
              <Select
                isMulti
                name="professorIds"
                value={selectedProfessors}
                onChange={handleProfessorChange}
                options={getProfessorOptions()}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Search professors by name or email..."
                isClearable
                isSearchable
                noOptionsMessage={() => "No professors found"}
                required
              />
              <Form.Text className="text-muted">
                The first selected professor will be the primary professor.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Lab Assistants</Form.Label>
              <Select
                isMulti
                name="labAssistantIds"
                value={selectedAssistants}
                onChange={handleAssistantChange}
                options={getLabAssistantOptions()}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Search lab assistants by name or email..."
                isClearable
                isSearchable
                noOptionsMessage={() => "No lab assistants found"}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                name="status" 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingLab ? 'Update Lab' : 'Create Lab'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={!!confirmDelete} onHide={() => setConfirmDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the lab "{confirmDelete?.name}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteLab}>
            Delete Lab
          </Button>
        </Modal.Footer>
      </Modal>
    </Row>
  );
};

export default LabManagementPage; 