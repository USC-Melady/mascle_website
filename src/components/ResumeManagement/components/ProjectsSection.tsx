// components/ProjectsSection.tsx
import React from 'react';
import { Card, Row, Col, Form, Button, Badge } from 'react-bootstrap';
import { ProjectsSectionProps } from '../types';
import './ProjectsSection.css';

const ProjectsSection: React.FC<ProjectsSectionProps> = ({ 
  projects, 
  handleProjectChange, 
  addProject, 
  removeProject 
}) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-folder-fill me-2"></i>
          <h5 className="mb-0">Projects</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <p className="text-muted mb-4">
          Include all types of projects that showcase your skills and interests: 
          <strong>research projects</strong>, <strong>class assignments</strong>, <strong>personal projects</strong>, 
          <strong>hackathon submissions</strong>, <strong>open source contributions</strong>, <strong>capstone projects</strong>, 
          and any other work that demonstrates your technical abilities and creativity.
        </p>
        {projects.map((project, index) => (
          <div key={`project-${index}`} className="project-card mb-4">
            <div className="project-header">
              <div className="project-title-section">
                <div className="project-icon">
                  <i className="bi bi-code-square"></i>
                </div>
                <h6 className="project-title">
                  {project.title ? project.title : `Project #${index + 1}`}
                </h6>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm"
                className="delete-btn"
                onClick={() => removeProject(index)}
                disabled={projects.length <= 1}
              >
                <i className="bi bi-trash3"></i>
              </Button>
            </div>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Project Title <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={project.title}
                    onChange={(e) => handleProjectChange(index, 'title', e.target.value)}
                    placeholder="e.g., Machine Learning for Medical Imaging, USC Class Project"
                    className={!project.title ? 'border-warning' : ''}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Project URL</Form.Label>
                  <Form.Control 
                    type="url" 
                    value={project.url}
                    onChange={(e) => handleProjectChange(index, 'url', e.target.value)}
                    placeholder="e.g., https://github.com/username/project"
                  />
                  <Form.Text className="text-muted">
                    Optional: GitHub, demo, or documentation link
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <div className="mb-3">
              <Form.Label>Technologies Used</Form.Label>
              <Form.Control 
                type="text" 
                value={project.technologies}
                onChange={(e) => handleProjectChange(index, 'technologies', e.target.value)}
                placeholder="e.g., Python, TensorFlow, React, AWS (separate with commas)"
                className="mb-2"
              />
              {project.technologies && (
                <div className="tech-tags">
                  {project.technologies.split(',').map((tech, techIndex) => (
                    tech.trim() && (
                      <Badge key={techIndex} className="tech-badge me-2 mb-1">
                        {tech.trim()}
                      </Badge>
                    )
                  ))}
                </div>
              )}
            </div>
            <Form.Group className="mb-0">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                value={project.description}
                onChange={(e) => handleProjectChange(index, 'description', e.target.value)}
                placeholder="Describe the project, your contribution, methodology, and significant outcomes. Include quantifiable results when possible."
                className={!project.description ? 'border-warning' : ''}
              />

            </Form.Group>
          </div>
        ))}
        <div className="d-grid mt-3">
          <Button variant="outline-primary" onClick={addProject}>
            <i className="bi bi-plus-circle me-2"></i>Add Another Project
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProjectsSection;