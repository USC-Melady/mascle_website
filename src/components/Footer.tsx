import React from 'react';
import { Container, Nav, Row, Col } from 'react-bootstrap';
import { FooterWrapper, StyledNav, BottomBar } from '../styles/footer.styles';

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <Container>
        <Row>
          <Col className="px-0">
            <StyledNav>
              <Nav.Link href="#news">News & Events</Nav.Link>
              <Nav.Link href="#careers">Careers</Nav.Link>
              <Nav.Link href="https://we-are.usc.edu/student-resources/">Student Resources</Nav.Link>
              <Nav.Link href="#faq">FAQ</Nav.Link>
              <Nav.Link href="https://www.usc.edu/privacy-notice/">Privacy Notice</Nav.Link>
              <Nav.Link href="https://eeotix.usc.edu/notice-of-non-discrimination/">Notice of Non-Discrimination</Nav.Link>
              <Nav.Link href="https://accessibility.usc.edu/accessibility-at-usc/digital-accessibility/">Digital Accessibility</Nav.Link>
            </StyledNav>
          </Col>
        </Row>
        <BottomBar>
          © {new Date().getFullYear()} USC Machine Learning Center. All rights reserved.
        </BottomBar>
      </Container>
    </FooterWrapper>
  );
};

export default Footer; 