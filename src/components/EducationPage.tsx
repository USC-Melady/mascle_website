import React from 'react';
import { Container, Card, Badge, Row, Col } from 'react-bootstrap';
import styled from '@emotion/styled';

const USC_RED = '#990000';
const USC_GOLD = '#FFCC00';

const PageContainer = styled(Container)`
  padding: 2rem 0;
  max-width: 1200px;
`;

const PageTitle = styled.h1`
  color: ${USC_RED};
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 700;
  font-size: 2.5rem;
`;

const LevelSection = styled.div`
  margin-bottom: 3rem;
`;

const LevelTitle = styled.h2`
  color: ${USC_RED};
  border-bottom: 3px solid ${USC_RED};
  padding-bottom: 0.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  font-size: 1.8rem;
`;

const CourseCard = styled(Card)`
  margin-bottom: 1.5rem;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const CourseHeader = styled(Card.Header)`
  background: linear-gradient(135deg, ${USC_RED}, #B22222);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
`;

const CourseTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
`;

const InstructorBadge = styled(Badge)`
  background-color: ${USC_GOLD};
  color: #333;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  padding: 0.4rem 0.8rem;
`;

const CourseBody = styled(Card.Body)`
  padding: 1.5rem;
`;

const CourseDescription = styled.p`
  color: #444;
  line-height: 1.6;
  margin: 0;
`;

interface Course {
  code: string;
  title: string;
  instructor: string;
  description: string;
}

const EducationPage: React.FC = () => {
  const undergraduateCourses: Course[] = [
    {
      code: "DSO 499",
      title: "Deep Learning and Business Applications",
      instructor: "Jinchi Lv",
      description: ""
    }
  ];

  const level500Courses: Course[] = [
    {
      code: "CSCI 566",
      title: "Deep Learning and its Applications",
      instructor: "Joseph Lim",
      description: "Deep learning research in computer vision, natural language processing and robotics; neural networks; deep learning algorithms, tools and software."
    },
    {
      code: "CSCI 567",
      title: "Machine Learning",
      instructor: "Yan Liu, Fei Sha",
      description: "Statistical methods for building intelligent and adaptive systems that improve performance from experiences; Focus on theoretical understanding of these methods and their computational implications."
    },
    {
      code: "CSCI 573x",
      title: "Graphical Model",
      instructor: "Fei Sha, Ram Nevatia",
      description: "Reasoning under uncertainty, statistical directed and undirected graphical models, temporal modeling, inference in graphical models, parameter learning, decisions under uncertainty."
    },
    {
      code: "EE 588",
      title: "Optimization for the Information and Data Sciences",
      instructor: "Mahdi Soltanolkotabi",
      description: "This course focuses on optimization problems and algorithms that arise in many science and engineering applications. Fundamental topics include convex sets, convex functions, generalized inequalities, least-squares, linear and quadratic programs, semidefinite programming, optimality conditions and duality theory. The course also covers optimization methodology with a focus on first order methods. Sample topics include efficient first-order algorithms for smooth and non-smooth optimization, accelerated schemes, Newton and quasi-Newton methods, iterative algorithms and non-convex optimization. Some applications to machine learning, statistics, signal processing and control will be presented."
    },
    {
      code: "ISE 599",
      title: "Large Scale Optimization for Machine Learning",
      instructor: "Meisam Razaviyayn",
      description: "The objective of the course is to introduce large-scale optimization algorithms that arise in modern data science and machine learning applications."
    },
    {
      code: "EE 599",
      title: "Mathematics of High-dimensional Data",
      instructor: "Mahdi Soltanolkotabi",
      description: "Modern data sets are noisy and unstructured and often contain corrupted or incomplete information. At the confluence of optimization, signal processing, statistics and computer science a new discipline is emerging to address these challenges. In this course, we will explore the foundations of this area. The main goal is to expose students to modern methods that model data through vectors and matrices, efficient algorithms for representing and extracting information from such data as well as new theory explaining the success of these algorithms. A special focus will be on novel methods and mathematical tools that allow us to glean useful information from seemingly incomplete data sets."
    }
  ];

  const level600Courses: Course[] = [
    {
      code: "DSO 607",
      title: "High-Dimensional Statistics and Big Data Problems",
      instructor: "Jinchi Lv",
      description: "Overview of cutting-edge developments of methodologies, theory, and algorithms in high-dimensional statistical learning and big data problems; their applications to business and many other disciplines."
    },
    {
      code: "CSCI 658",
      title: "Introduction to Online Learning",
      instructor: "Haipeng Luo",
      description: "This course focuses on the foundation and advances of the theory of online learning/online convex optimization/sequential decision making, which has been playing a crucial role in machine learning and many real-life applications. The main theme of the course is to study algorithms whose goal is to minimize \"regret\" when facing against a possibly adversarial environment, and to understand their theoretical guarantees. Special attention is paid to more adaptive, efficient, and practical algorithms. Some connections to game theory, boosting and other learning problems are also covered."
    },
    {
      code: "CSCI 670",
      title: "Advance Analysis of Algorithm",
      instructor: "Shang-Hua Teng",
      description: "Fundamental techniques for design and analysis of algorithms. Dynamic programming; network flows; theory of NP-completeness; linear programming; approximation, randomized, and online algorithms; basic cryptography."
    },
    {
      code: "CSCI 686",
      title: "Advanced Big Data Analytics",
      instructor: "Yan Liu",
      description: "Advanced statistical inference and data mining techniques for data analytics, including topic modeling, structure learning, time-series analysis, learning with less supervision, and massive-scale data analytics."
    },
    {
      code: "CSCI 699",
      title: "Machine Learning for Knowledge Extraction and Reasoning",
      instructor: "Xiang Ren",
      description: "In today's computerized and information-based society, people are inundated with vast amounts of text data, ranging from news articles, social media posts, scientific publications, to a wide range of textual information from various vertical domains (e.g., corporate reports, advertisements, legal acts, medical reports). How to turn such massive and unstructured text data into structured, actionable knowledge, and how to enable effective and user-friendly access to such knowledge is a grand challenge to the research community. This course will introduce and discuss many of the sub-problems and machine learning approaches for knowledge extraction and reasoning, including use of language features, sequence learning models, rule learning, relational learning, and deep learning techniques. We will discuss segmentation of text sequences, classification of segments into types, clustering and de-duplication of records, knowledge graph embedding, knowledge reasoning."
    }
  ];

  const renderCourseCard = (course: Course) => (
    <CourseCard key={course.code}>
      <CourseHeader>
        <CourseTitle>{course.code}: {course.title}</CourseTitle>
        <InstructorBadge>Instructor: {course.instructor}</InstructorBadge>
      </CourseHeader>
      {course.description && (
        <CourseBody>
          <CourseDescription>{course.description}</CourseDescription>
        </CourseBody>
      )}
    </CourseCard>
  );

  return (
    <PageContainer>
      <PageTitle>Class Listings</PageTitle>
      
      <LevelSection>
        <LevelTitle>100-400 Level Courses</LevelTitle>
        <Row>
          <Col>
            {undergraduateCourses.map(renderCourseCard)}
          </Col>
        </Row>
      </LevelSection>

      <LevelSection>
        <LevelTitle>500 Level Courses</LevelTitle>
        <Row>
          <Col>
            {level500Courses.map(renderCourseCard)}
          </Col>
        </Row>
      </LevelSection>

      <LevelSection>
        <LevelTitle>600 Level Courses</LevelTitle>
        <Row>
          <Col>
            {level600Courses.map(renderCourseCard)}
          </Col>
        </Row>
      </LevelSection>
    </PageContainer>
  );
};

export default EducationPage;