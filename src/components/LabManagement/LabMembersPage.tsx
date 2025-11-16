import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Spinner, Alert, Row, Col, Modal, Form, Tabs, Tab } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getAllUsers, addUserToLab, removeUserFromLab } from '../../utils/userManagement';
import { getLabs, Lab } from '../../utils/labManagement';
import { getAuthenticatedUser } from '../../utils/auth';
import { User } from '../../types/api';

const LabMembersPage: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  
  const [lab, setLab] = useState<Lab | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [labAssistants, setLabAssistants] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('Student');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  
  useEffect(() => {
    const fetchLabDetails = async () => {
      try {
        // Get current user
        const user = await getAuthenticatedUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Set the primary role
        if (user.roles.includes('Admin')) {
          setUserRole('Admin');
        } else if (user.roles.includes('Professor')) {
          setUserRole('Professor');
        } else {
          setUserRole('LabAssistant');
        }
        
        // Get the current user's full details
        const users = await getAllUsers();
        const currentUserDetails = users.find(u => u.userId === user.username);
        setCurrentUser(currentUserDetails || null);
        setAllUsers(users);
        
        // Get all labs
        const labs = await getLabs();
        const currentLab = labs.find(l => l.labId === labId);
        
        if (!currentLab) {
          throw new Error('Lab not found');
        }
        
        setLab(currentLab);
        
        // Check if current user has permission to manage this lab
        const canManageLab = user.roles.includes('Admin') || 
          currentLab.professorId === user.username || 
          (currentLab.professorIds && currentLab.professorIds.includes(user.username)) ||
          (currentLab.labAssistantIds && currentLab.labAssistantIds.includes(user.username));
        
        if (!canManageLab) {
          throw new Error('You do not have permission to manage this lab');
        }
        
        // Get lab assistants
        const assistantIds = currentLab.labAssistantIds || [];
        const assistants = users.filter(user => assistantIds.includes(user.userId));
        setLabAssistants(assistants);
        
        // Get students
        // In the real implementation, you would get the student IDs from the lab
        // For now, we'll simulate this
        const studentUsers = users.filter(user => 
          user.roles.includes('Student') && 
          user.labIds && 
          labId && 
          user.labIds.includes(labId)
        );
        setStudents(studentUsers);
        
      } catch (err) {
        console.error('Error fetching lab details:', err);
        setError('Failed to load lab details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    if (labId) {
      fetchLabDetails();
    } else {
      setError('Lab ID is required');
      setLoading(false);
    }
  }, [labId]);
  
  const handleBack = () => {
    navigate('/professor-dashboard');
  };
  
  const getEligibleUsers = () => {
    const currentMembers = [...labAssistants, ...students].map(user => user.userId);
    
    if (selectedRole === 'LabAssistant') {
      // Return users who aren't already assistants in this lab
      return allUsers.filter(user => 
        !currentMembers.includes(user.userId) && 
        (user.roles.includes('LabAssistant') || user.roles.includes('Professor') || user.roles.includes('Student'))
      );
    }
    
    return allUsers.filter(user => 
      !currentMembers.includes(user.userId) && 
      user.roles.includes('Student')
    );
  };
  
  const canManageAssistants = () => {
    if (!currentUser || !lab) return false;
    
    // Admins and professors can manage assistants
    return currentUser.roles.includes('Admin') || 
      lab.professorId === currentUser.userId ||
      (lab.professorIds && lab.professorIds.includes(currentUser.userId));
  };
  
  const canManageStudents = () => {
    if (!currentUser || !lab) return false;
    
    // Admins, professors, and lab assistants can manage students
    return currentUser.roles.includes('Admin') || 
      lab.professorId === currentUser.userId || 
      (lab.professorIds && lab.professorIds.includes(currentUser.userId)) ||
      (lab.labAssistantIds && lab.labAssistantIds.includes(currentUser.userId));
  };
  
  const handleAddMember = async () => {
    if (!selectedUserId || !labId) return;
    
    setIsProcessing(true);
    try {
      await addUserToLab(selectedUserId, labId, selectedRole);
      
      // Update the local state based on the role
      const userToAdd = allUsers.find(user => user.userId === selectedUserId);
      
      if (userToAdd) {
        if (selectedRole === 'LabAssistant') {
          setLabAssistants([...labAssistants, userToAdd]);
        } else {
          setStudents([...students, userToAdd]);
        }
      }
      
      // Reset form
      setSelectedUserId('');
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding member:', err);
      setError('Failed to add member. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleRemoveMember = async (userId: string, role: string) => {
    if (!labId) return;
    
    setIsProcessing(true);
    try {
      await removeUserFromLab(userId, labId);
      
      // Update the local state based on the role
      if (role === 'LabAssistant') {
        setLabAssistants(labAssistants.filter(user => user.userId !== userId));
      } else {
        setStudents(students.filter(user => user.userId !== userId));
      }
    } catch (err) {
      console.error('Error removing member:', err);
      setError('Failed to remove member. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading lab details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="danger">
        {error}
        <div className="mt-2">
          <Button variant="outline-primary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Labs
          </Button>
        </div>
      </Alert>
    );
  }
  
  if (!lab) {
    return (
      <Alert variant="warning">
        Lab not found
        <div className="mt-2">
          <Button variant="outline-primary" onClick={handleBack}>
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Back to Labs
          </Button>
        </div>
      </Alert>
    );
  }
  
  return (
    <div>
      <div className="mb-3">
        <Button variant="outline-primary" onClick={handleBack}>
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Labs
        </Button>
      </div>
      
      <Card className="mb-4">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Lab Members: {lab.name}</h5>
        </Card.Header>
        <Card.Body>
          <Tabs defaultActiveKey="assistants" id="lab-members-tabs" className="mb-3">
            <Tab eventKey="assistants" title="Lab Assistants">
              <Row className="mb-3">
                <Col>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Lab Assistants</h6>
                    {canManageAssistants() && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          setSelectedRole('LabAssistant');
                          setShowAddModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Add Assistant
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
              
              {labAssistants.length === 0 ? (
                <Alert variant="info">No lab assistants assigned to this lab.</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      {canManageAssistants() && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {labAssistants.map(assistant => (
                      <tr key={assistant.userId}>
                        <td>{assistant.firstName} {assistant.lastName}</td>
                        <td>{assistant.email}</td>
                        <td>
                          <Badge bg={assistant.status === 'CONFIRMED' ? 'success' : 'warning'}>
                            {assistant.status === 'CONFIRMED' ? 'Active' : assistant.status}
                          </Badge>
                        </td>
                        {canManageAssistants() && (
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveMember(assistant.userId, 'LabAssistant')}
                              disabled={isProcessing}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
            
            <Tab eventKey="students" title="Students">
              <Row className="mb-3">
                <Col>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Students</h6>
                    {canManageStudents() && (
                      <Button 
                        variant="outline-success" 
                        size="sm"
                        onClick={() => {
                          setSelectedRole('Student');
                          setShowAddModal(true);
                        }}
                      >
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Add Student
                      </Button>
                    )}
                  </div>
                </Col>
              </Row>
              
              {students.length === 0 ? (
                <Alert variant="info">No students assigned to this lab.</Alert>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Status</th>
                      {canManageStudents() && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.userId}>
                        <td>{student.firstName} {student.lastName}</td>
                        <td>{student.email}</td>
                        <td>
                          <Badge bg={student.status === 'CONFIRMED' ? 'success' : 'warning'}>
                            {student.status === 'CONFIRMED' ? 'Active' : student.status}
                          </Badge>
                        </td>
                        {canManageStudents() && (
                          <td>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleRemoveMember(student.userId, 'Student')}
                              disabled={isProcessing}
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
      
      {/* Add Member Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Member to {lab.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User</Form.Label>
              <Form.Select 
                value={selectedUserId} 
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user</option>
                {getEligibleUsers().map(user => (
                  <option key={user.userId} value={user.userId}>
                    {user.email}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select 
                value={selectedRole} 
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="Student">Student</option>
                {/* Only admins and professors can add lab assistants */}
                {(userRole === 'Admin' || userRole === 'Professor') && (
                  <option value="LabAssistant">Lab Assistant</option>
                )}
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddMember}
            disabled={!selectedUserId || isProcessing}
          >
            {isProcessing ? 'Adding...' : 'Add Member'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LabMembersPage; 