// components/SkillsSection.tsx
import React, { useState, KeyboardEvent } from 'react';
import { Card, Form, Badge, Alert, Row, Col } from 'react-bootstrap';
import { SkillsSectionProps } from '../types';
import CustomDropdown from './CustomDropdown';
import './SkillsSection.css';

// Comprehensive list of popular skills organized by category
const POPULAR_SKILLS = {
  'Programming Languages': [
    'Python', 'JavaScript', 'Java', 'C++', 'C', 'C#', 'R', 'MATLAB', 'SQL', 'HTML/CSS',
    'TypeScript', 'Swift', 'Kotlin', 'Go', 'Rust', 'PHP', 'Ruby', 'Scala', 'Perl', 'Shell/Bash'
  ],
  'Data Science & ML': [
    'Machine Learning', 'Deep Learning', 'Data Analysis', 'Statistics', 'Data Visualization',
    'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Jupyter', 'Tableau', 'Power BI',
    'Natural Language Processing', 'Computer Vision', 'Neural Networks', 'Statistical Modeling'
  ],
  'Web Development': [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot',
    'REST APIs', 'GraphQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Docker', 'AWS', 'Azure'
  ],
  'Research & Academic': [
    'Research Design', 'Literature Review', 'Academic Writing', 'Experimental Design', 
    'Data Collection', 'Survey Design', 'Qualitative Analysis', 'Quantitative Analysis',
    'Peer Review', 'Grant Writing', 'Scientific Writing', 'Research Ethics'
  ],
  'Engineering & Technical': [
    'CAD', 'SolidWorks', 'AutoCAD', 'ANSYS', 'Circuit Design', 'PCB Design', 'Arduino', 'Raspberry Pi',
    'Embedded Systems', 'Signal Processing', 'Control Systems', 'Robotics', '3D Printing', 'Prototyping'
  ],
  'Business & Analytics': [
    'Project Management', 'Business Analysis', 'Market Research', 'Financial Analysis', 
    'Strategic Planning', 'Process Improvement', 'Risk Assessment', 'Quality Assurance',
    'Agile/Scrum', 'Leadership', 'Team Management', 'Communication'
  ],
  'Design & Creative': [
    'UI/UX Design', 'Graphic Design', 'Adobe Creative Suite', 'Figma', 'Sketch', 'Photoshop',
    'Illustrator', 'InDesign', 'Video Editing', 'Animation', 'Wireframing', 'User Testing'
  ],
  'Laboratory & Sciences': [
    'Lab Techniques', 'Microscopy', 'Cell Culture', 'PCR', 'Western Blot', 'ELISA', 'Flow Cytometry',
    'Spectroscopy', 'Chromatography', 'Molecular Biology', 'Biochemistry', 'Microbiology',
    'Chemistry', 'Physics', 'Biology', 'Environmental Science'
  ]
};

const SkillsSection: React.FC<SkillsSectionProps> = ({ 
  skills, 
  handleSkillChange, 
  addSkill, 
  removeSkill 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [error, setError] = useState('');

  // Filter out empty skills
  const validSkills = skills.filter(skill => skill.trim() !== '');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      addNewSkill();
    }
  };

  const addNewSkill = (skillToAdd?: string) => {
    const newSkill = (skillToAdd || inputValue).trim();
    
    if (!newSkill) return;
    
    // Check if skill already exists
    if (validSkills.some(skill => skill.toLowerCase() === newSkill.toLowerCase())) {
      setError('This skill is already added');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Check max skills limit (15)
    if (validSkills.length >= 15) {
      setError('Maximum 15 skills allowed');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    // Add the skill
    if (validSkills.length === 0 || (validSkills.length === 1 && skills[0] === '')) {
      // Replace empty skill
      handleSkillChange(0, newSkill);
    } else {
      // Find first empty slot or add new
      const emptyIndex = skills.findIndex(s => s === '');
      if (emptyIndex !== -1) {
        handleSkillChange(emptyIndex, newSkill);
      } else {
        addSkill();
        // The parent will add an empty string, we need to update it in the next render
        setTimeout(() => {
          handleSkillChange(skills.length, newSkill);
        }, 0);
      }
    }
    
    setInputValue('');
    setSelectedSkill('');
    setError('');
  };

  const handleDropdownChange = (selectedValue: string) => {
    // Ignore category headers
    if (selectedValue.startsWith('__category_')) {
      return;
    }
    
    setSelectedSkill(selectedValue);
    
    if (selectedValue && selectedValue !== '') {
      addNewSkill(selectedValue);
    }
  };

  // Get all skills as dropdown options for the CustomDropdown
  const getAllSkillsOptions = () => {
    const allSkills: { value: string; label: string }[] = [];
    
    // Add a placeholder option
    allSkills.push({ value: '', label: 'Select a popular skill...' });
    
    // Add category headers and skills
    Object.entries(POPULAR_SKILLS).forEach(([category, skillArray]) => {
      // Add category header (disabled option)
      allSkills.push({ value: `__category_${category}`, label: `--- ${category} ---` });
      
      // Add skills from this category
      skillArray.forEach(skill => {
        allSkills.push({ value: skill, label: skill });
      });
    });
    
    return allSkills;
  };

  const removeSkillTag = (index: number) => {
    if (skills.length > 1) {
      removeSkill(index);
    } else {
      // If it's the last skill, just clear it
      handleSkillChange(0, '');
    }
  };

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex align-items-center">
          <i className="bi bi-tools me-2"></i>
          <h5 className="mb-0">Skills & Technologies</h5>
        </div>
      </Card.Header>
      <Card.Body className="p-4">
        <p className="text-muted mb-3">
          Add your technical skills, programming languages, frameworks, and tools. Choose from popular skills or add your own.
        </p>
        
        {/* Skills Tags Display */}
        <div className="skills-container mb-3">
          {validSkills.map((skill, index) => (
            <Badge 
              key={`skill-${index}`} 
              className="skill-tag me-2 mb-2"
              bg="none"
            >
              <span>{skill}</span>
              <button
                type="button"
                className="skill-remove-btn"
                onClick={() => removeSkillTag(index)}
                aria-label={`Remove ${skill}`}
              >
                <i className="bi bi-x"></i>
              </button>
            </Badge>
          ))}
        </div>

        {/* Skills Selection */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Popular Skills</strong></Form.Label>
              <CustomDropdown
                options={getAllSkillsOptions()}
                value={selectedSkill}
                onChange={handleDropdownChange}
                placeholder={validSkills.length >= 15 ? "Maximum skills reached" : "Select a popular skill..."}
                className={validSkills.length >= 15 ? "disabled-dropdown" : ""}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label><strong>Add Custom Skill</strong></Form.Label>
              <Form.Control
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={validSkills.length >= 15 ? "Maximum skills reached" : "Type custom skill and press Enter..."}
                disabled={validSkills.length >= 15}
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Text className="text-muted mb-3 d-block">
          {validSkills.length}/15 skills added. Choose from {Object.values(POPULAR_SKILLS).flat().length} popular options or add your own.
        </Form.Text>

        {/* Error Alert */}
        {error && (
          <Alert variant="warning" className="py-2 mb-3">
            <small>{error}</small>
          </Alert>
        )}
        
        {/* Category Overview */}
        <div className="mt-3">
          <small className="text-muted">
            <strong>Skill categories available:</strong> Programming Languages, Data Science & ML, Web Development, 
            Research & Academic, Engineering & Technical, Business & Analytics, Design & Creative, Laboratory & Sciences
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SkillsSection;