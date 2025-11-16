import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { createUser } from '../../utils/userManagement';

interface AddUserModalProps {
  show: boolean;
  onHide: () => void;
  onUserAdded: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ show, onHide, onUserAdded }) => {
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [password, setPassword] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRoleChange = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      if (!givenName) {
        throw new Error('Name is required');
      }

      if (roles.length === 0) {
        throw new Error('At least one role must be selected');
      }

      await createUser(email, password, roles, givenName);
      setSuccess('User created successfully');
      setEmail('');
      setGivenName('');
      setPassword('');
      setRoles([]);
      onUserAdded();
      
      // Close modal after a short delay
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="User's name"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Temporary Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Temporary password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Form.Text className="text-muted">
              User will be prompted to change this on first login
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Roles</Form.Label>
            <div>
              <Form.Check
                type="checkbox"
                label="Admin"
                checked={roles.includes('Admin')}
                onChange={() => handleRoleChange('Admin')}
                className="mb-2"
              />
              <Form.Check
                type="checkbox"
                label="Professor"
                checked={roles.includes('Professor')}
                onChange={() => handleRoleChange('Professor')}
                className="mb-2"
              />
              <Form.Check
                type="checkbox"
                label="Lab Assistant"
                checked={roles.includes('LabAssistant')}
                onChange={() => handleRoleChange('LabAssistant')}
                className="mb-2"
              />
              <Form.Check
                type="checkbox"
                label="Student"
                checked={roles.includes('Student')}
                onChange={() => handleRoleChange('Student')}
              />
            </div>
          </Form.Group>
          
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddUserModal; 