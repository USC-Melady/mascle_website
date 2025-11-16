// components/ProfileSummary.tsx
import React from 'react';
import { Card, Badge, ListGroup, Button, Spinner } from 'react-bootstrap';
import { ProfileSummaryProps } from '../types';


const ProfileSummary: React.FC<ProfileSummaryProps> = ({ 
  resumeUploaded, 
  resumeDetails, 
  saveResumeDetails,
  isMobile = false,
  saving = false
}) => {
  // Calculate completion percentages
  const calculateEducationCompletion = () => {
    const edu = resumeDetails.education[0];
    const fields = [edu.institution, edu.degree, edu.major, edu.seniority];
    return (fields.filter(field => field && field.trim() !== '').length / fields.length) * 100;
  };

  const calculateExperienceCompletion = () => {
    const exp = resumeDetails.experience[0];
    const fields = [exp.company, exp.position, exp.description];
    return (fields.filter(field => field && field.trim() !== '').length / fields.length) * 100;
  };

  const calculateSkillsCompletion = () => {
    const validSkills = resumeDetails.skills.filter(skill => skill && skill.trim() !== '');
    return validSkills.length > 0 ? Math.min((validSkills.length / 5) * 100, 100) : 0;
  };

  const calculateProjectsCompletion = () => {
    const project = resumeDetails.projects[0];
    const fields = [project.title, project.description];
    return (fields.filter(field => field && field.trim() !== '').length / fields.length) * 100;
  };

  const overallCompletion = Math.round(
    (calculateEducationCompletion() + 
     calculateExperienceCompletion() + 
     calculateSkillsCompletion() + 
     calculateProjectsCompletion() + 
     (resumeUploaded ? 100 : 0)) / 5
  );

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getCompletionText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 50) return 'Good Progress';
    return 'Needs Attention';
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="py-3" style={{ backgroundColor: '#990000', color: 'white' }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-person-badge me-2"></i>
            Profile Completion
          </h5>
          <Badge bg={getCompletionColor(overallCompletion)} className="fs-6">
            {overallCompletion}%
          </Badge>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {/* Overall Progress Bar */}
        <div className="px-4 py-3 bg-light border-bottom">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="fw-bold">Overall Progress</span>
            <span className="text-muted">{getCompletionText(overallCompletion)}</span>
          </div>
          <div className="progress" style={{ height: '8px' }}>
            <div 
              className={`progress-bar bg-${getCompletionColor(overallCompletion)}`} 
              style={{ width: `${overallCompletion}%` }}
            ></div>
          </div>
        </div>

        <ListGroup variant="flush">
          <ListGroup.Item className="px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Resume Document</div>
              <small className="text-muted">Upload your current resume (PDF format)</small>
            </div>
            <div className="text-end">
              {resumeUploaded ? (
                <Badge bg="success" pill>
                  <i className="bi bi-check-circle me-1"></i>Uploaded
                </Badge>
              ) : (
                <Badge bg="danger" pill>
                  <i className="bi bi-exclamation-circle me-1"></i>Missing
                </Badge>
              )}
            </div>
          </ListGroup.Item>
          
          <ListGroup.Item className="px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Education</div>
              <small className="text-muted">Institution, degree, major, academic level</small>
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div 
                  className={`progress-bar bg-${getCompletionColor(calculateEducationCompletion())}`} 
                  style={{ width: `${calculateEducationCompletion()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-end ms-3">
              <Badge bg={getCompletionColor(calculateEducationCompletion())} pill>
                {Math.round(calculateEducationCompletion())}%
              </Badge>
            </div>
          </ListGroup.Item>
          
          <ListGroup.Item className="px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Experience</div>
              <small className="text-muted">Work history with descriptions</small>
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div 
                  className={`progress-bar bg-${getCompletionColor(calculateExperienceCompletion())}`} 
                  style={{ width: `${calculateExperienceCompletion()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-end ms-3">
              <Badge bg={getCompletionColor(calculateExperienceCompletion())} pill>
                {Math.round(calculateExperienceCompletion())}%
              </Badge>
            </div>
          </ListGroup.Item>
          
          <ListGroup.Item className="px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Skills & Technologies</div>
              <small className="text-muted">
                {resumeDetails.skills.filter(s => s && s.trim() !== '').length} skills selected (recommend 5+)
              </small>
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div 
                  className={`progress-bar bg-${getCompletionColor(calculateSkillsCompletion())}`} 
                  style={{ width: `${calculateSkillsCompletion()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-end ms-3">
              <Badge bg={getCompletionColor(calculateSkillsCompletion())} pill>
                {Math.round(calculateSkillsCompletion())}%
              </Badge>
            </div>
          </ListGroup.Item>
          
          <ListGroup.Item className="px-4 py-3 d-flex justify-content-between align-items-center">
            <div className="flex-grow-1">
              <div className="fw-bold">Projects</div>
              <small className="text-muted">Portfolio items with descriptions</small>
              <div className="progress mt-2" style={{ height: '4px' }}>
                <div 
                  className={`progress-bar bg-${getCompletionColor(calculateProjectsCompletion())}`} 
                  style={{ width: `${calculateProjectsCompletion()}%` }}
                ></div>
              </div>
            </div>
            <div className="text-end ms-3">
              <Badge bg={getCompletionColor(calculateProjectsCompletion())} pill>
                {Math.round(calculateProjectsCompletion())}%
              </Badge>
            </div>
          </ListGroup.Item>
        </ListGroup>
      </Card.Body>
      {!isMobile && (
        <Card.Footer className="bg-light p-3">
          <div className="d-grid">
            <Button 
              variant="primary" 
              onClick={saveResumeDetails}
              disabled={saving}
              size="lg"
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <i className="bi bi-save me-2"></i>Save All Details
                </>
              )}
            </Button>
          </div>
          {overallCompletion < 80 && (
            <div className="text-center mt-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Complete your profile to improve job matching accuracy
              </small>
            </div>
          )}
        </Card.Footer>
      )}
    </Card>
  );
};

export default ProfileSummary;