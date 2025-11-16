import React from 'react';
import styled from '@emotion/styled';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { facultyMembers as faculty, students } from '../data/people';
import { getImagePath } from '../utils/imageHelper';
import PeopleNav from './shared/PeopleNav';
import DefaultProfileImage from './shared/DefaultProfileImage';
import { Faculty, Student } from '../types/people';

const PageContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
`;

const SectionTitle = styled.h2`
  color: #666;
  margin: 2rem 0 1.5rem;
  font-size: 1.5rem;
`;

const PersonCard = styled(Card)`
  margin-bottom: 1.5rem;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
  height: 100%;

  &:hover {
    transform: translateY(-5px);
  }
`;

const PersonImage = styled(Card.Img)`
  height: 250px;
  width: 100%;
  object-fit: cover;
`;

const PersonInfo = styled(Card.Body)`
  padding: 1rem;
  text-align: center;
`;

const PersonName = styled.h3`
  margin-bottom: 0.5rem;
  font-weight: 600;
  
  a {
    color: #990000;
    font-size: 1.1rem;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #660000;
      text-decoration: underline;
    }
  }
`;

const PersonTitle = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0;
`;

// Student list styles
const StudentListContainer = styled(Card)`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const StudentItem = styled.div`
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.span`
  font-weight: 500;
  color: #990000;
  font-size: 1rem;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AdvisorInfo = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.2rem;
`;

const InterestBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
`;

const InterestBadge = styled(Badge)`
  background-color: #990000;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
`;

const PeoplePage: React.FC = () => {
  const renderPersonImage = (person: Faculty | Student) => {
    if (person.image && person.image !== '') {
      return <PersonImage variant="top" src={getImagePath(person.image)} alt={person.name} />;
    }
    return <DefaultProfileImage name={person.name} />;
  };

  const getPersonUrl = (person: Faculty | Student): string => {
    if (person.type === 'faculty') {
      return person.website || `mailto:${person.email}`;
    }
    return `/students/${person.id}`;
  };

  return (
    <PageContainer>
      <Container>
        <Row>
          <Col lg={3}>
            <PeopleNav />
          </Col>
          <Col lg={9}>
            <PageTitle>People</PageTitle>
            
            <SectionTitle>Faculty</SectionTitle>
            <Row className="g-3">
              {faculty.map((person: Faculty, index: number) => (
                <Col xs={4} sm={4} md={4} lg={3} key={index}>
                  <PersonCard>
                    {renderPersonImage(person)}
                    <PersonInfo>
                      <PersonName>
                        <a href={getPersonUrl(person)} target="_blank" rel="noopener noreferrer">
                          {person.name}
                        </a>
                      </PersonName>
                      <PersonTitle>{person.title}</PersonTitle>
                    </PersonInfo>
                  </PersonCard>
                </Col>
              ))}
            </Row>

            <SectionTitle>Students</SectionTitle>
            <StudentListContainer>
              <Card.Body className="p-0">
                {students
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((student: Student, index: number) => (
                    <StudentItem key={index}>
                      <StudentInfo>
                        <StudentName>{student.name}</StudentName>
                        <AdvisorInfo>Working with {student.advisor}</AdvisorInfo>
                      </StudentInfo>
                      {student.interests && student.interests.length > 0 && (
                        <InterestBadges>
                          {student.interests.map((interest, idx) => (
                            <InterestBadge key={idx}>
                              {interest}
                            </InterestBadge>
                          ))}
                        </InterestBadges>
                      )}
                    </StudentItem>
                  ))}
              </Card.Body>
            </StudentListContainer>
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
};

export default PeoplePage; 