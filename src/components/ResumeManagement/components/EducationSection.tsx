// components/EducationSection.tsx
import React from 'react';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { EducationSectionProps } from '../types';
import CustomDropdown from './CustomDropdown';


// Dropdown options
const ACADEMIC_LEVELS = [
  { value: '', label: 'Select Academic Level' },
  
  // Undergraduate Levels (detailed)
  { value: 'freshman', label: 'Undergrad Year 1' },
  { value: 'sophomore', label: 'Undergrad Year 2' },
  { value: 'junior', label: 'Undergrad Year 3' },
  { value: 'senior', label: 'Undergrad Year 4' },
  
  // Graduate Levels (simplified)
  { value: 'masters', label: 'Master\'s Year 1' },
  { value: 'masters-year-2', label: 'Master\'s Year 2' }
];

const USC_SCHOOLS = [
  { value: '', label: 'Select USC School/College' },
  // USC Schools and Colleges
  { value: 'USC Viterbi School of Engineering', label: 'USC Viterbi School of Engineering' },
  { value: 'USC Dornsife College of Letters, Arts and Sciences', label: 'USC Dornsife College of Letters, Arts and Sciences' },
  { value: 'USC Marshall School of Business', label: 'USC Marshall School of Business' },
  { value: 'USC Annenberg School for Communication and Journalism', label: 'USC Annenberg School for Communication and Journalism' },
  { value: 'USC Cinematic Arts', label: 'USC School of Cinematic Arts' },
  { value: 'USC Thornton School of Music', label: 'USC Thornton School of Music' },
  { value: 'USC Roski School of Art and Design', label: 'USC Roski School of Art and Design' },
  { value: 'USC School of Architecture', label: 'USC School of Architecture' },
  { value: 'USC Price School of Public Policy', label: 'USC Sol Price School of Public Policy' },
  { value: 'USC Suzanne Dworak-Peck School of Social Work', label: 'USC Suzanne Dworak-Peck School of Social Work' },
  { value: 'USC Rossier School of Education', label: 'USC Rossier School of Education' },
  { value: 'USC Gould School of Law', label: 'USC Gould School of Law' },
  { value: 'USC Keck School of Medicine', label: 'USC Keck School of Medicine' },
  { value: 'USC School of Pharmacy', label: 'USC School of Pharmacy' },
  { value: 'USC Herman Ostrow School of Dentistry', label: 'USC Herman Ostrow School of Dentistry' },
  { value: 'USC Bovard College', label: 'USC Bovard College' },
  // For transfers or previous education
  { value: 'Other Institution (Prior to USC)', label: 'Other Institution (Prior to USC)' }
];

const DEGREE_TYPES = [
  { value: '', label: 'Select Degree Type' },
  // Undergraduate Degrees
  { value: 'Bachelor of Science', label: 'Bachelor of Science (BS)' },
  { value: 'Bachelor of Arts', label: 'Bachelor of Arts (BA)' },
  { value: 'Bachelor of Engineering', label: 'Bachelor of Engineering (BE)' },
  { value: 'Bachelor of Technology', label: 'Bachelor of Technology (BTech)' },
  { value: 'Bachelor of Business Administration', label: 'Bachelor of Business Administration (BBA)' },
  // Graduate Degrees
  { value: 'Master of Science', label: 'Master of Science (MS)' },
  { value: 'Master of Arts', label: 'Master of Arts (MA)' },
  { value: 'Master of Engineering', label: 'Master of Engineering (MEng)' },
  { value: 'Master of Business Administration', label: 'Master of Business Administration (MBA)' },
  { value: 'Master of Fine Arts', label: 'Master of Fine Arts (MFA)' },
  { value: 'Master of Education', label: 'Master of Education (MEd)' },
  // Other/Professional
  { value: 'Associate Degree', label: 'Associate Degree' },
  { value: 'Certificate', label: 'Certificate/Diploma' },
  { value: 'Other', label: 'Other' }
];

const USC_MAJORS = [
  { value: '', label: 'Select Major' },
  
  // USC Viterbi School of Engineering
  { value: 'Aerospace and Mechanical Engineering', label: 'Aerospace and Mechanical Engineering' },
  { value: 'Astronautical Engineering', label: 'Astronautical Engineering' },
  { value: 'Biomedical Engineering', label: 'Biomedical Engineering' },
  { value: 'Chemical Engineering', label: 'Chemical Engineering' },
  { value: 'Civil Engineering', label: 'Civil Engineering' },
  { value: 'Computer Engineering', label: 'Computer Engineering' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Computer Science (Games)', label: 'Computer Science (Games)' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Electrical Engineering', label: 'Electrical Engineering' },
  { value: 'Environmental Engineering', label: 'Environmental Engineering' },
  { value: 'Industrial and Systems Engineering', label: 'Industrial and Systems Engineering' },
  { value: 'Materials Engineering', label: 'Materials Engineering' },
  { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
  { value: 'Petroleum Engineering', label: 'Petroleum Engineering' },
  
  // USC Dornsife College of Letters, Arts and Sciences
  { value: 'Applied Mathematics', label: 'Applied Mathematics' },
  { value: 'Biochemistry', label: 'Biochemistry' },
  { value: 'Biology', label: 'Biology' },
  { value: 'Biophysics', label: 'Biophysics' },
  { value: 'Chemistry', label: 'Chemistry' },
  { value: 'Cognitive Science', label: 'Cognitive Science' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Environmental Studies', label: 'Environmental Studies' },
  { value: 'Geophysics', label: 'Geophysics' },
  { value: 'Linguistics', label: 'Linguistics' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Neuroscience', label: 'Neuroscience' },
  { value: 'Physics', label: 'Physics' },
  { value: 'Physics/Computer Science', label: 'Physics/Computer Science' },
  { value: 'Political Science', label: 'Political Science' },
  { value: 'Psychology', label: 'Psychology' },
  { value: 'Quantitative Biology', label: 'Quantitative Biology' },
  { value: 'Statistics', label: 'Statistics' },
  
  // USC Marshall School of Business
  { value: 'Business Administration', label: 'Business Administration' },
  { value: 'Accounting', label: 'Accounting' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Management', label: 'Management' },
  { value: 'Information Systems', label: 'Information Systems' },
  
  // USC Annenberg School
  { value: 'Communication', label: 'Communication' },
  { value: 'Journalism', label: 'Journalism' },
  { value: 'Public Relations', label: 'Public Relations' },
  
  // USC School of Cinematic Arts
  { value: 'Cinematic Arts', label: 'Cinematic Arts' },
  { value: 'Animation and Digital Arts', label: 'Animation and Digital Arts' },
  { value: 'Interactive Media and Games', label: 'Interactive Media and Games' },
  
  // USC Other Schools
  { value: 'Architecture', label: 'Architecture' },
  { value: 'Music', label: 'Music' },
  { value: 'Fine Arts', label: 'Fine Arts' },
  { value: 'Social Work', label: 'Social Work' },
  { value: 'Education', label: 'Education' },
  { value: 'Public Policy', label: 'Public Policy' },
  
  // Graduate Programs
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence (Graduate)' },
  { value: 'Machine Learning', label: 'Machine Learning (Graduate)' },
  { value: 'Robotics', label: 'Robotics (Graduate)' },
  { value: 'Cybersecurity', label: 'Cybersecurity (Graduate)' },
  
  { value: 'Other', label: 'Other USC Major' }
];


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

// Generate years from current year - 10 to current year + 10
const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'Year' },
  ...Array.from({ length: 21 }, (_, i) => {
    const year = currentYear - 10 + i;
    return { value: year.toString(), label: year.toString() };
  })
];

const EducationSection: React.FC<EducationSectionProps> = ({ 
  education, 
  handleEducationChange, 
  addEducation, 
  removeEducation 
}) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-mortarboard me-2"></i>
          <h5 className="mb-0">Education</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        {education.map((edu, index) => (
          <div key={`education-${index}`} className="mb-4 p-4 border rounded bg-light">
            <div className="d-flex justify-content-between mb-3">
              <h6 className="mb-0">
                <i className="bi bi-book me-2 text-primary"></i>
                {edu.institution ? edu.institution : `Education #${index + 1}`}
              </h6>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => removeEducation(index)}
                disabled={education.length <= 1}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </div>

            {/* Institution and Degree Row */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>USC School/College <span className="text-danger">*</span></Form.Label>
                  <CustomDropdown
                    options={USC_SCHOOLS}
                    value={edu.institution}
                    onChange={(value) => handleEducationChange(index, 'institution', value)}
                    placeholder="Select USC School/College"
                    required
                  />
                  {edu.institution === 'Other Institution (Prior to USC)' && (
                    <Form.Control 
                      type="text" 
                      className="mt-2"
                      placeholder="Please specify institution name (for transfer students)"
                      onChange={(e) => handleEducationChange(index, 'customInstitution', e.target.value)}
                    />
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Degree Type <span className="text-danger">*</span></Form.Label>
                  <CustomDropdown
                    options={DEGREE_TYPES}
                    value={edu.degree}
                    onChange={(value) => handleEducationChange(index, 'degree', value)}
                    placeholder="Select Degree Type"
                    required
                  />
                  {edu.degree === 'Other' && (
                    <Form.Control 
                      type="text" 
                      className="mt-2"
                      placeholder="Please specify degree type"
                      onChange={(e) => handleEducationChange(index, 'customDegree', e.target.value)}
                    />
                  )}
                </Form.Group>
              </Col>
            </Row>

            {/* Major and Seniority Row */}
            <Row className="mb-3">
              <Col md={7}>
                <Form.Group>
                  <Form.Label>Major <span className="text-danger">*</span></Form.Label>
                  <CustomDropdown
                    options={USC_MAJORS}
                    value={edu.major}
                    onChange={(value) => handleEducationChange(index, 'major', value)}
                    placeholder="Select Major"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label>Academic Level <span className="text-danger">*</span></Form.Label>
                  <CustomDropdown
                    options={ACADEMIC_LEVELS}
                    value={edu.seniority}
                    onChange={(value) => handleEducationChange(index, 'seniority', value)}
                    placeholder="Select Academic Level"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Graduation Start Date Row */}
            <Row className="mb-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Month</Form.Label>
                  <CustomDropdown
                    options={MONTHS}
                    value={edu.graduationStartMonth}
                    onChange={(value) => handleEducationChange(index, 'graduationStartMonth', value)}
                    placeholder="Month"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Start Year</Form.Label>
                  <CustomDropdown
                    options={YEARS}
                    value={edu.graduationStartYear}
                    onChange={(value) => handleEducationChange(index, 'graduationStartYear', value)}
                    placeholder="Year"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Month</Form.Label>
                  <CustomDropdown
                    options={MONTHS}
                    value={edu.graduationEndMonth}
                    onChange={(value) => handleEducationChange(index, 'graduationEndMonth', value)}
                    placeholder="Month"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>End Year</Form.Label>
                  <CustomDropdown
                    options={YEARS}
                    value={edu.graduationEndYear}
                    onChange={(value) => handleEducationChange(index, 'graduationEndYear', value)}
                    placeholder="Year"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* GPA and YoE Row */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>GPA</Form.Label>
                  <Form.Control 
                    type="number" 
                    step="0.01"
                    min="0"
                    max="4"
                    value={edu.gpa}
                    onChange={(e) => handleEducationChange(index, 'gpa', e.target.value)}
                    placeholder="e.g., 3.75"
                  />
                  <Form.Text className="text-muted">On a 4.0 scale</Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Years of Experience (YoE)</Form.Label>
                  <Form.Control 
                    type="number" 
                    min="0"
                    max="50"
                    value={edu.yearsOfExperience}
                    onChange={(e) => handleEducationChange(index, 'yearsOfExperience', e.target.value)}
                    placeholder="e.g., 2"
                  />
                  <Form.Text className="text-muted">Total years of relevant experience</Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </div>
        ))}
        <div className="d-grid mt-3">
          <Button variant="outline-primary" onClick={addEducation}>
            <i className="bi bi-plus-circle me-2"></i>Add Another Education
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default EducationSection;