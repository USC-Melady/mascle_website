import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Container, Row, Col, Card, Badge, Form } from 'react-bootstrap';
import { students } from '../data/people';
import PeopleNav from './shared/PeopleNav';
import { Student } from '../types/people';

const PageContainer = styled.div`
  padding: 2rem 0;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  font-size: 2rem;
`;

const PageDescription = styled.p`
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
`;

const FilterContainer = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
`;

const StudentListContainer = styled(Card)`
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

const StudentsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [advisorFilter, setAdvisorFilter] = useState('');

  // Get unique advisors for filter
  const uniqueAdvisors = Array.from(new Set(students.map(student => student.advisor))).sort();

  // Filter students based on search and advisor filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.advisor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.interests && student.interests.some(interest => 
                           interest.toLowerCase().includes(searchTerm.toLowerCase())
                         ));
    
    const matchesAdvisor = advisorFilter === '' || student.advisor === advisorFilter;
    
    return matchesSearch && matchesAdvisor;
  });

  // Sort students alphabetically by name
  const sortedStudents = filteredStudents.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PageContainer>
      <Container>
        <Row>
          <Col lg={3}>
            <PeopleNav />
          </Col>
          <Col lg={9}>
            <PageTitle>Students</PageTitle>
            <PageDescription>
              Current PhD students and postdocs in the Machine Learning Center.
            </PageDescription>

            <FilterContainer>
              <Row>
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Search Students</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name, advisor, or research interests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filter by Advisor</Form.Label>
                    <Form.Select
                      value={advisorFilter}
                      onChange={(e) => setAdvisorFilter(e.target.value)}
                    >
                      <option value="">All Advisors</option>
                      {uniqueAdvisors.map(advisor => (
                        <option key={advisor} value={advisor}>{advisor}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </FilterContainer>

            <StudentListContainer>
              <Card.Body className="p-0">
                {sortedStudents.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="mb-0">No students found matching your search criteria.</p>
                  </div>
                ) : (
                  sortedStudents.map((student: Student) => (
                    <StudentItem key={student.id}>
                      <StudentInfo>
                        <StudentName>{student.name}</StudentName>
                        <AdvisorInfo>Working with {student.advisor}</AdvisorInfo>
                      </StudentInfo>
                      {student.interests && student.interests.length > 0 && (
                        <InterestBadges>
                          {student.interests.map((interest, index) => (
                            <InterestBadge key={index}>
                              {interest}
                            </InterestBadge>
                          ))}
                        </InterestBadges>
                      )}
                    </StudentItem>
                  ))
                )}
              </Card.Body>
            </StudentListContainer>
          </Col>
        </Row>
      </Container>
    </PageContainer>
  );
};

export default StudentsPage; 