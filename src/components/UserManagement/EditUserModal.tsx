import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { User } from '../../types/api';
import { updateUserRoles, updateUserStatus } from '../../utils/userManagement';

interface EditUserModalProps {
  show: boolean;
  onHide: () => void;
  user: User | null;
  onUserUpdated: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ 
  show, 
  onHide, 
  user, 
  onUserUpdated 
}) => {
  const [roles, setRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<string>('CONFIRMED');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setRoles(user.roles || []);
      setStatus(user.status || 'CONFIRMED');
    }
  }, [user]);

  const handleRoleChange = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (roles.length === 0) {
        throw new Error('At least one role must be selected');
      }

      // Update user roles
      await updateUserRoles(user.userId, roles);
      
      // Update user status
      await updateUserStatus(user.userId, status);
      
      setSuccess('User updated successfully');
      onUserUpdated();
      
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
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        {user && (
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={user.email}
                disabled
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="CONFIRMED">Active</option>
                <option value="DISABLED">Disabled</option>
                <option value="FORCE_CHANGE_PASSWORD">Force Password Change</option>
              </Form.Select>
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
                />
              </div>
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={onHide} className="me-2">
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default EditUserModal; 