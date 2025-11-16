import React from 'react';
import styled from '@emotion/styled';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { facultyMembers } from '../data/people';
import PeopleNav from './shared/PeopleNav';
import DefaultProfileImage from './shared/DefaultProfileImage';
import { Faculty } from '../types/people';

const PageContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
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

const FacultyPage: React.FC = () => {
  const renderPersonImage = (person: Faculty) => {
    if (person.image && person.image !== '') {
      return <PersonImage variant="top" src={person.image} alt={person.name} />;
    }
    return <DefaultProfileImage name={person.name} />;
  };

  const getPersonUrl = (person: Faculty): string => {
    return person.website || `mailto:${person.email}`;
  };

  return (
    <PageContainer>
      <Container>
        <Row>
          <Col lg={3}>
            <PeopleNav />
          </Col>
          <Col lg={9}>
            <PageTitle>Faculty</PageTitle>
            <Row className="g-3">
              {facultyMembers.map((person: Faculty, index: number) => (
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
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
};

export default FacultyPage; 