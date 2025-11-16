import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { User } from '../../types/api';
import { getAllUsers } from '../../utils/userManagement';
import AddUserModal from './AddUserModal';
import EditUserModal from './EditUserModal';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      setError(null);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <Badge bg="success">Active</Badge>;
      case 'DISABLED':
        return <Badge bg="danger">Disabled</Badge>;
      case 'FORCE_CHANGE_PASSWORD':
        return <Badge bg="warning">Password Change Required</Badge>;
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  return (
    <Container fluid className="px-0">
      <Card className="mb-3 w-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">User Management</h5>
          <Button variant="primary" size="sm" onClick={handleAddUser}>
            Add New User
          </Button>
        </Card.Header>
        <Card.Body className="p-3">
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <Table responsive hover size="sm" className="mb-2">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Roles</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.userId}>
                    <td>{user.email}</td>
                    <td>{user.givenName || user.fullName || user.firstName || '-'}</td>
                    <td>
                      {user.roles.map((role) => (
                        <Badge key={role} bg="info" className="me-1">
                          {role}
                        </Badge>
                      ))}
                    </td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-1"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onUserAdded={handleUserUpdated}
      />

      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </Container>
  );
};

export default UserManagementPage; 