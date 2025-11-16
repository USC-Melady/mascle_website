import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../config';

const SetupTools: React.FC = () => {
  const [endpoints, setEndpoints] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load initial values from localStorage or use defaults
    const savedEndpoints = localStorage.getItem('api_endpoints');
    if (savedEndpoints) {
      try {
        setEndpoints(JSON.parse(savedEndpoints));
      } catch (e) {
        console.error('Error loading saved endpoints:', e);
        setEndpoints({ ...API_ENDPOINTS });
      }
    } else {
      setEndpoints({ ...API_ENDPOINTS });
    }
  }, []);

  const handleChange = (key: string, value: string) => {
    setEndpoints({
      ...endpoints,
      [key]: value
    });
    setSaved(false);
  };

  const saveEndpoints = () => {
    try {
      localStorage.setItem('api_endpoints', JSON.stringify(endpoints));
      setSaved(true);
      setError('');
      
      // Update the runtime configuration
      window.API_ENDPOINTS = endpoints;
      
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save configuration');
    }
  };

  return (
    <Card className="mb-4 shadow-sm">
      <Card.Header className="bg-dark text-white">
        <h5 className="mb-0">API Configuration</h5>
      </Card.Header>
      <Card.Body>
        {saved && <Alert variant="success">Configuration saved successfully!</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}
        
        <p className="text-muted mb-3">
          Configure the API endpoints for different services. Changes will apply on reload.
        </p>
        
        {Object.keys(endpoints).map(key => (
          <Form.Group key={key} className="mb-3">
            <Form.Label>{key.replace(/_/g, ' ')}</Form.Label>
            <Form.Control 
              type="text" 
              value={endpoints[key]} 
              onChange={(e) => handleChange(key, e.target.value)}
              placeholder={`Enter ${key} endpoint`}
            />
          </Form.Group>
        ))}
        
        <div className="d-grid">
          <Button variant="primary" onClick={saveEndpoints}>
            Save Configuration
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SetupTools; 