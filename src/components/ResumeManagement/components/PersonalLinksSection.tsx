// components/PersonalLinksSection.tsx
import React from 'react';
import { Card, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { PersonalLinksSectionProps } from '../types';
import './PersonalLinksSection.css';

const PersonalLinksSection: React.FC<PersonalLinksSectionProps> = ({ 
  personalLinks, 
  handlePersonalLinksChange 
}) => {
  const validateUrl = (url: string, type: string) => {
    if (!url) return true; // Empty is valid
    
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      
      switch (type) {
        case 'linkedin':
          return urlObj.hostname.includes('linkedin.com');
        case 'github':
          return urlObj.hostname.includes('github.com');
        default:
          return true;
      }
    } catch {
      return false;
    }
  };

  const formatUrl = (url: string) => {
    if (!url) return '';
    
    // If it already starts with http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add https:// prefix
    return `https://${url}`;
  };

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-link-45deg me-2"></i>
          <h5 className="mb-0">Personal Links</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <p className="text-muted mb-4">
          Add your professional online presence to help professors and researchers learn more about your work and connect with you.
        </p>
        
        <div className="links-container">
          {/* LinkedIn */}
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="link-label">
                  <i className="bi bi-linkedin text-primary me-2"></i>
                  LinkedIn Profile
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="link-prefix">
                    <i className="bi bi-linkedin"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    value={personalLinks.linkedin}
                    onChange={(e) => handlePersonalLinksChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/your-profile"
                    className={personalLinks.linkedin && !validateUrl(personalLinks.linkedin, 'linkedin') ? 'is-invalid' : ''}
                  />
                </InputGroup>
                {personalLinks.linkedin && !validateUrl(personalLinks.linkedin, 'linkedin') && (
                  <Form.Text className="text-danger">
                    Please enter a valid LinkedIn URL
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
          </Row>

          {/* Personal Website */}
          <Row className="mb-4">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="link-label">
                  <i className="bi bi-globe text-success me-2"></i>
                  Personal Website
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="link-prefix">
                    <i className="bi bi-globe"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    value={personalLinks.website}
                    onChange={(e) => handlePersonalLinksChange('website', e.target.value)}
                    placeholder="https://your-website.com"
                  />
                </InputGroup>
                <Form.Text className="text-muted">
                  Portfolio, blog, or personal website showcasing your work
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* GitHub */}
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="link-label">
                  <i className="bi bi-github text-dark me-2"></i>
                  GitHub Profile
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text className="link-prefix">
                    <i className="bi bi-github"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="url"
                    value={personalLinks.github}
                    onChange={(e) => handlePersonalLinksChange('github', e.target.value)}
                    placeholder="https://github.com/your-username"
                    className={personalLinks.github && !validateUrl(personalLinks.github, 'github') ? 'is-invalid' : ''}
                  />
                </InputGroup>
                {personalLinks.github && !validateUrl(personalLinks.github, 'github') && (
                  <Form.Text className="text-danger">
                    Please enter a valid GitHub URL
                  </Form.Text>
                )}
                <Form.Text className="text-muted">
                  Show your code repositories and open source contributions
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* Preview Links */}
        {(personalLinks.linkedin || personalLinks.website || personalLinks.github) && (
          <div className="links-preview mt-4">
            <h6 className="mb-3 text-muted">Preview:</h6>
            <div className="preview-links">
              {personalLinks.linkedin && validateUrl(personalLinks.linkedin, 'linkedin') && (
                <a 
                  href={formatUrl(personalLinks.linkedin)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link linkedin"
                >
                  <i className="bi bi-linkedin"></i>
                  LinkedIn
                </a>
              )}
              {personalLinks.website && (
                <a 
                  href={formatUrl(personalLinks.website)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link website"
                >
                  <i className="bi bi-globe"></i>
                  Website
                </a>
              )}
              {personalLinks.github && validateUrl(personalLinks.github, 'github') && (
                <a 
                  href={formatUrl(personalLinks.github)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="preview-link github"
                >
                  <i className="bi bi-github"></i>
                  GitHub
                </a>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PersonalLinksSection;
