// components/ExperienceSection.tsx
import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { ExperienceSectionProps } from '../types';
import CustomDropdown from './CustomDropdown';

// Dropdown options for dates
const MONTHS = [
  { value: '', label: 'Month' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

// Generate years from 1990 to current year + 2
const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'Year' },
  ...Array.from({ length: currentYear - 1990 + 3 }, (_, i) => {
    const year = 1990 + i;
    return { value: year.toString(), label: year.toString() };
  }).reverse()
];



const ExperienceSection: React.FC<ExperienceSectionProps> = ({ 
  experience, 
  handleExperienceChange, 
  addExperience, 
  removeExperience 
}) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-briefcase me-2"></i>
          <h5 className="mb-0">Experience</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <p className="text-muted mb-4">
          Include all relevant experiences: internships, research positions, campus jobs, part-time work, volunteer work, 
          leadership roles, and any other activities that demonstrate your skills and interests.
        </p>
        {experience.map((exp, index) => (
          <div key={`experience-${index}`} className="mb-4 p-3 border rounded bg-light">
            <div className="d-flex justify-content-between mb-3">
              <h6 className="mb-0">
                <i className="bi bi-building me-2 text-primary"></i>
                {exp.company ? `${exp.company} - ${exp.position}` : `Experience #${index + 1}`}
              </h6>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => removeExperience(index)}
                disabled={experience.length <= 1}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Company/Organization <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={exp.company}
                    onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                    placeholder="Enter company/organization name"
                    className={!exp.company ? 'border-warning' : ''}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Position <span className="text-danger">*</span></Form.Label>
                  <Form.Control 
                    type="text" 
                    value={exp.position}
                    onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                    placeholder="Enter position title"
                    className={!exp.position ? 'border-warning' : ''}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            {/* Start Date Row */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Label>Start Date <span className="text-danger">*</span></Form.Label>
                <Row>
                  <Col md={6}>
                    <Form.Group>
                      <CustomDropdown
                        options={MONTHS}
                        value={exp.startMonth || ''}
                        onChange={(value) => handleExperienceChange(index, 'startMonth', value)}
                        placeholder="Month"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <CustomDropdown
                        options={YEARS}
                        value={exp.startYear || ''}
                        onChange={(value) => handleExperienceChange(index, 'startYear', value)}
                        placeholder="Year"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Col>
              <Col md={6}>
                <Form.Label>End Date</Form.Label>
                <div className="mb-2">
                  <Form.Check 
                    type="checkbox"
                    label="Currently working here"
                    checked={exp.isCurrent || false}
                    onChange={(e) => {
                      handleExperienceChange(index, 'isCurrent', e.target.checked);
                      if (e.target.checked) {
                        handleExperienceChange(index, 'endMonth', '');
                        handleExperienceChange(index, 'endYear', '');
                      }
                    }}
                  />
                </div>
                {!exp.isCurrent && (
                  <Row>
                    <Col md={6}>
                      <Form.Group>
                        <CustomDropdown
                          options={MONTHS}
                          value={exp.endMonth || ''}
                          onChange={(value) => handleExperienceChange(index, 'endMonth', value)}
                          placeholder="Month"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <CustomDropdown
                          options={YEARS}
                          value={exp.endYear || ''}
                          onChange={(value) => handleExperienceChange(index, 'endYear', value)}
                          placeholder="Year"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>
            <Form.Group className="mb-0">
              <Form.Label>Description <span className="text-danger">*</span></Form.Label>
              <Form.Control 
                as="textarea" 
                rows={4}
                value={exp.description}
                onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                placeholder="Describe your responsibilities, achievements, and relevant skills. Include specific technologies used and quantifiable results when possible."
                className={!exp.description ? 'border-warning' : ''}
              />
              <Form.Text className="text-muted">
                Include specific achievements, technologies used, and quantifiable results (e.g., "Improved model accuracy by 15%")
              </Form.Text>
            </Form.Group>
          </div>
        ))}
        <div className="d-grid mt-3">
          <Button variant="outline-primary" onClick={addExperience}>
            <i className="bi bi-plus-circle me-2"></i>Add Another Experience
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExperienceSection;