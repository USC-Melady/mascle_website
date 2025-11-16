import React, { useState } from 'react';
import styled from '@emotion/styled';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  padding: 2rem 0;
`;

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-size: 3rem;
    font-weight: 700;
    color: #990000;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }
  
  p {
    font-size: 1.2rem;
    color: #6c757d;
    max-width: 600px;
    margin: 0 auto 2rem;
    line-height: 1.6;
  }
  
  .status-badge {
    background: linear-gradient(135deg, #ffd700, #ffed4e);
    color: #8b5a00;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-weight: 600;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const Panel = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.12);
  }
  
  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #990000;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

`;

const FormSection = styled.div`
  margin-bottom: 2rem;
  
  label {
    display: block;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.75rem;
    font-size: 1rem;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
    
    &:focus {
      outline: none;
      border-color: #990000;
      background: white;
      box-shadow: 0 0 0 3px rgba(153, 0, 0, 0.1);
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Tag = styled.span`
  background: linear-gradient(135deg, #990000, #cc0000);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .remove {
    cursor: pointer;
    font-size: 1.1rem;
    opacity: 0.8;
    
    &:hover {
      opacity: 1;
    }
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #990000, #cc0000);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(153, 0, 0, 0.3);
  }
  
  &:disabled {
    background: #6c757d;
    cursor: not-allowed;
    transform: none;
  }
`;

const MatchCard = styled.div`
  background: linear-gradient(135deg, #f8f9fa, white);
  border: 2px solid #e9ecef;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #990000;
    transform: translateX(8px);
  }
  
  .match-score {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 700;
    float: right;
  }
  
  h3 {
    color: #990000;
    font-size: 1.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6c757d;
    margin-bottom: 1rem;
    line-height: 1.5;
  }
  
  .professor {
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
  }
  
  .skills {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .skill-tag {
    background: rgba(153, 0, 0, 0.1);
    color: #990000;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

const FindYourMatchPage: React.FC = () => {
  const [skills, setSkills] = useState<string[]>(['Python', 'TensorFlow', 'PyTorch']);
  const [currentSkill, setCurrentSkill] = useState('');
  const [showMatches, setShowMatches] = useState(false);

  const addSkill = () => {
    if (currentSkill && !skills.includes(currentSkill)) {
      setSkills([...skills, currentSkill]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const findMatches = () => {
    setShowMatches(true);
  };

  const mockProjects = [
    {
      title: "Deep Learning for Medical Imaging",
      professor: "Dr. Sarah Chen",
      description: "Developing CNN architectures for automated diagnosis of medical conditions from radiological images.",
      skills: ["Deep Learning", "PyTorch", "Medical Imaging", "Python"],
      match: 95
    },
    {
      title: "Reinforcement Learning for Robotics",
      professor: "Dr. Michael Rodriguez",
      description: "Creating RL algorithms for autonomous robot navigation in dynamic environments.",
      skills: ["Reinforcement Learning", "ROS", "Python", "Computer Vision"],
      match: 88
    },
    {
      title: "Natural Language Processing for Social Media",
      professor: "Dr. Lisa Wang",
      description: "Analyzing sentiment and trends in social media data using advanced NLP techniques.",
      skills: ["NLP", "BERT", "Social Media Analytics", "Python"],
      match: 82
    }
  ];

  return (
    <PageWrapper>
      <Container>
        <Header>
          <h1>Match with a Research Opportunity</h1>
          <p>
            Connect students with perfect research opportunities through intelligent matching 
            based on interests, skills, and career goals.
          </p>
          <div className="status-badge">
            ML-Powered Matching • Fully Launching Soon
          </div>
        </Header>

        <MainContent>
          <Panel>
            <h2>
              Student Profile
            </h2>
            
            <FormSection>
              <label>Academic Level</label>
              <select>
                <option>Undergraduate</option>
                <option>Master's Student</option>
                <option>PhD Student</option>
                <option>Postdoc</option>
              </select>
            </FormSection>

            <FormSection>
              <label>Research Interests</label>
              <textarea 
                placeholder="Describe your research interests, what excites you about machine learning, and areas you'd like to explore..."
                rows={4}
              />
            </FormSection>

            <FormSection>
              <label>Technical Skills</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  placeholder="Add a skill (e.g., Python, TensorFlow, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  style={{ flex: 1 }}
                />
                <Button onClick={addSkill} style={{ width: 'auto', margin: 0, padding: '0.75rem 1.5rem' }}>
                  Add
                </Button>
              </div>
              <TagsContainer>
                {skills.map((skill) => (
                  <Tag key={skill}>
                    {skill}
                    <span className="remove" onClick={() => removeSkill(skill)}>×</span>
                  </Tag>
                ))}
              </TagsContainer>
            </FormSection>

            <FormSection>
              <label>Time Commitment</label>
              <select>
                <option>Part-time (10-15 hours/week)</option>
                <option>Half-time (20-25 hours/week)</option>
                <option>Full-time (40+ hours/week)</option>
                <option>Flexible</option>
              </select>
            </FormSection>

            <FormSection>
              <label>Preferred Project Duration</label>
              <select>
                <option>Short-term (1-3 months)</option>
                <option>Medium-term (3-6 months)</option>
                <option>Long-term (6+ months)</option>
                <option>Ongoing</option>
              </select>
            </FormSection>

            <FormSection>
              <label>Career Goals</label>
              <textarea 
                placeholder="What are your long-term career aspirations? Industry, academia, startup, etc."
                rows={3}
              />
            </FormSection>

            <Button onClick={findMatches}>
              Find Matches
            </Button>
          </Panel>

          <Panel>
            <h2>
              {showMatches ? 'Recommended Projects' : 'How It Works'}
            </h2>
            
            {!showMatches ? (
              <div style={{ padding: '1rem 0' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#990000', marginBottom: '1rem', fontSize: '1.2rem' }}>AI-Powered Matching</h3>
                  <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                    Our advanced algorithm analyzes your profile, research interests, skills, and goals to find the most compatible research opportunities.
                  </p>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#990000', marginBottom: '1rem', fontSize: '1.2rem' }}>Smart Compatibility Scoring</h3>
                  <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                    Each match receives a compatibility score based on skill alignment, research area overlap, and project requirements.
                  </p>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#990000', marginBottom: '1rem', fontSize: '1.2rem' }}>Continuous Learning</h3>
                  <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                    The system learns from successful matches and feedback to improve recommendations over time.
                  </p>
                </div>
                
                <div style={{ background: 'linear-gradient(135deg, rgba(153, 0, 0, 0.1), rgba(204, 0, 0, 0.05))', padding: '1.5rem', borderRadius: '12px', marginTop: '2rem' }}>
                  <h4 style={{ color: '#990000', marginBottom: '0.75rem' }}>Integration with MCP</h4>
                  <p style={{ color: '#6c757d', fontSize: '0.95rem', margin: 0 }}>
                    Built using Model Context Protocol (MCP) for seamless integration with existing university systems and real-time data processing.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {mockProjects.map((project, index) => (
                  <MatchCard key={index}>
                    <div className="match-score">{project.match}% Match</div>
                    <h3>{project.title}</h3>
                    <div className="professor"> {project.professor}</div>
                    <p>{project.description}</p>
                    <div className="skills">
                      {project.skills.map((skill) => (
                        <span key={skill} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </MatchCard>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: '2rem', padding: '1.5rem', background: 'rgba(40, 167, 69, 0.1)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#28a745', marginBottom: '0.5rem' }}> Found {mockProjects.length} Great Matches!</h4>
                  <p style={{ color: '#6c757d', margin: 0, fontSize: '0.95rem' }}>
                    Click on any project to learn more and apply directly through the system.
                  </p>
                </div>
              </div>
            )}
          </Panel>
        </MainContent>
      </Container>
    </PageWrapper>
  );
};

export default FindYourMatchPage;