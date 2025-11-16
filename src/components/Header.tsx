import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { getImagePath } from '../utils/imageHelper';
import {
  Navbar,
  Container,
  Row,
  Col,
  Nav,
  NavDropdown,
  Form,
  Button,
  Offcanvas
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBars, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import { getAuthenticatedUser, signOutUser } from '../utils/auth';
import { syncResumeDataToDatabase } from '../components/ResumeManagement/utils';

/** Shared color variable for USC red. */
const USC_RED = '#990000';

/** 
 * Custom styled components that override only what Bootstrap doesn't handle well. 
 * Everything else stays within Bootstrap classes for less complexity. 
 */
const StyledNavbar = styled(Navbar)`
  background-color: ${USC_RED} !important;
  min-height: 40px;
  padding: 0;

  @media (min-width: 992px) {
    min-height: 50px;
  }
`;

const MainNavbar = styled(Navbar)`
  background-color: #ffffff;
  padding: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

/**
 * Base size for MaSCle logo - change this single variable to adjust all sizes proportionally
 * Try values between 1.0 and 1.5 to find the perfect size
 */


interface LogoProps {
  size?: string;
}

const Logo = styled.img<LogoProps>`
  height: ${(props) => props.size || '40px'};

  @media (min-width: 992px) {
    height: ${(props) => (props.size === '60px' ? '60px' : '50px')};
  }
`;

const MascleLogo = styled.img`
  height: 100px;
  object-fit: contain;
  max-width: 300px;
  padding: 0 4px;
  
  @media (min-width: 992px) {
    height: 80px;
    max-width: 250px;
    padding: 0;
  }
`;

const StyledContainer = styled(Container)`
  padding: 0;
  max-width: 100% !important;
`;

const LeftSection = styled(Col)`
  padding: 1rem;
  @media (min-width: 992px) {
    padding: 1rem 2rem;
  }
`;

const RightSection = styled(Col)`
  padding: 0 1rem;
  @media (min-width: 992px) {
    padding: 0 2rem;
  }
`;

const StyledNavDropdown = styled(NavDropdown)`
  .dropdown-toggle,
  .dropdown-item {
    color: ${USC_RED} !important;
  }

  .dropdown-item {
    &:hover,
    &:focus {
      background-color: rgba(153, 0, 0, 0.1);
    }
  }
`;

/** 
 * Reusable styled Button and Nav.Link 
 * so we don't have inline color: 
 */
const RedButton = styled(Button)`
  color: ${USC_RED} !important;
`;

const RedNavLink = styled(Nav.Link)`
  color: ${USC_RED} !important;
  padding: 0.5rem 1rem;
  
  @media (max-width: 991px) {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
  }
`;

/**
 * SearchInput has a custom width that 
 * shrinks to 100% on smaller screens.
 */
const SearchInput = styled(Form.Control)`
  width: 200px;

  @media (max-width: 991px) {
    width: 100%;
  }
`;

const MenuButton = styled(Button)`
  color: ${USC_RED} !important;
  font-size: 1.25rem;
  padding: 0.5rem;
  display: block;
  
  @media (min-width: 992px) {
    display: none;
  }
`;

const StyledOffcanvas = styled(Offcanvas)`
  .offcanvas-header {
    background-color: ${USC_RED};
    color: white;
  }
`;

const MobileNav = styled(Nav)`
  @media (max-width: 991px) {
    padding: 1rem 0;
    
    .dropdown-menu {
      border: none;
      background: #f8f9fa;
      padding: 0;
      
      .dropdown-item {
        padding: 0.75rem 2rem;
        border-bottom: 1px solid #eee;
      }
    }
  }
`;

const MobileMenuSection = styled.div`
  display: none;
  padding: 0.5rem 1rem;
  border-top: 1px solid #eee;
  background: #fff;
  
  @media (max-width: 991px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const SearchSection = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const Header: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const location = useLocation();

  // Function to determine the correct dashboard URL based on user roles
  const getDashboardUrl = () => {
    if (userRoles.includes('Admin')) {
      return '/admin-dashboard';
    } else if (userRoles.includes('Professor')) {
      return '/professor-dashboard';
    } else if (userRoles.includes('LabAssistant')) {
      return '/lab-assistant-dashboard';
    } else {
      return '/student-dashboard'; // Default fallback
    }
  };

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      const user = await getAuthenticatedUser();
      console.log('Full user object:', JSON.stringify(user, null, 2));
      
      if (user) {
        setIsAuthenticated(true);
        
        // Get raw display name
        const rawDisplayName = (
          user.attributes?.given_name as string || 
          user.attributes?.name as string || 
          user.attributes?.email as string || 
          (typeof user.username === 'string' ? user.username : 'Account')
        );
        
        // Convert to Title Case if it's not an email address
        const displayName = rawDisplayName.includes('@') 
          ? rawDisplayName
          : rawDisplayName
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
        
        setUserName(displayName);
        
        // Store user roles for dashboard routing
        setUserRoles(user.roles || []);

        // Sync resume data from local storage to database
        try {
          console.log('Attempting to sync resume data to database...');
          await syncResumeDataToDatabase();
        } catch (syncError) {
          console.error('Error syncing resume data to database:', syncError);
          // Continue despite sync error - this is a background operation
        }
      } else {
        setIsAuthenticated(false);
        setUserName(null);
      }
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setUserName(null);
    }
  };

  // Check auth on mount and when location changes
  useEffect(() => {
    checkAuth();
  }, [location.pathname]);

  const handleClose = () => setShowMenu(false);
  const handleShow = () => setShowMenu(true);

  const handleLogout = async () => {
    try {
      await signOutUser();
      
      // Clear local state immediately
      setIsAuthenticated(false);
      setUserName(null);
      
      // Force a complete page refresh to ensure all state is cleared
      // This ensures no stale authentication data remains
      window.location.href = '/mascle_website/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if logout fails, clear local state and redirect
      setIsAuthenticated(false);
      setUserName(null);
      window.location.href = '/mascle_website/';
    }
  };

  return (
    <StyledContainer fluid>
      {/* Top red banner with USC shield logo */}
      <StyledNavbar>
        <Container fluid>
          <div className="w-100 d-flex justify-content-end pe-4">
            <Logo src={getImagePath('/images/usc-shield.png')} alt="USC Shield" size="60px" />
          </div>
        </Container>
      </StyledNavbar>

      {/* Main header section with Viterbi logo and navigation */}
      <MainNavbar className="border-bottom">
        <Container fluid>
          <Row className="w-100 m-0">
            {/* Left column: Viterbi logo and center name */}
            <LeftSection xs={12} lg="auto">
              <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
                <Logo src={getImagePath('/images/usc-viterbi-logo1.jpg')} alt="USC Viterbi Logo" />
                <div
                  className="mx-2 mx-lg-3 bg-secondary opacity-25"
                  style={{ width: '1px', height: '50px' }}
                />
                <MascleLogo src={getImagePath('/images/mascle_logo2.png')} alt="USC Machine Learning Center (MaSCle)" />
              </Navbar.Brand>
            </LeftSection>

            {/* Right column: Search and navigation */}
            <RightSection xs={12} lg className="d-none d-lg-block">
              <Container fluid className="p-0">
                <Row className="h-100">
                  {/* Search bar section */}
                  <Col xs={12} className="py-2 border-bottom d-flex justify-content-end">
                    <Form className="d-flex">
                      <SearchInput
                        type="search"
                        placeholder="Search this site"
                        className="me-2"
                        aria-label="Search"
                      />
                      <RedButton variant="link" className="px-2">
                        <FontAwesomeIcon icon={faSearch} />
                      </RedButton>
                    </Form>
                  </Col>

                  {/* Main navigation menu */}
                  <Col xs={12} className="py-2">
                    <Nav className="justify-content-end fw-semibold">
                      <RedNavLink as={Link} to="/">Home</RedNavLink>
                      <StyledNavDropdown title="People" id="people-dropdown">
                        <NavDropdown.Item as={Link} to="/faculty">Faculty</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/students">Students</NavDropdown.Item>
                      </StyledNavDropdown>
                      <StyledNavDropdown title="Research" id="research-dropdown">
                        <NavDropdown.Item as={Link} to="/labs">Labs</NavDropdown.Item>
                        <NavDropdown.Item as={Link} to="/research-overview">Application Overview</NavDropdown.Item>
                        {!isAuthenticated && (
                          <NavDropdown.Item as={Link} to="/apply">How to Apply</NavDropdown.Item>
                        )}
                        <NavDropdown.Item as={Link} to="/jobs/public">Open Projects</NavDropdown.Item>
                      </StyledNavDropdown>
                      <RedNavLink as={Link} to="/events">Events</RedNavLink>

                      <RedNavLink as={Link} to="/education">Education</RedNavLink>
                      <RedNavLink as={Link} to="/honors">Honors</RedNavLink>
                      <RedNavLink as={Link} to="/sponsors">Sponsors</RedNavLink>
                      <RedNavLink as={Link} to="/about">About</RedNavLink>

                      {/* Apply link removed from main nav - moved/managed elsewhere when needed */}

                      
                      {/* User menu - only shown when authenticated */}
                      {isAuthenticated && (
                        <StyledNavDropdown 
                          title={<><FontAwesomeIcon icon={faUser} className="me-1" /> {userName || 'Account'}</>} 
                          id="user-dropdown"
                        >
                          <NavDropdown.Item as={Link} to={getDashboardUrl()}>Dashboard</NavDropdown.Item>
                          <NavDropdown.Divider />
                          <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                        </StyledNavDropdown>
                      )}
                      
                      {/* Login link - only shown when not authenticated */}
                      {!isAuthenticated && (
                        <RedNavLink as={Link} to="/login">Login</RedNavLink>
                      )}
                    </Nav>
                  </Col>
                </Row>
              </Container>
            </RightSection>
          </Row>
        </Container>
      </MainNavbar>

      {/* Mobile Menu Bar */}
      <MobileMenuSection>
        <SearchSection>
          <Form className="d-flex">
            <SearchInput
              type="search"
              placeholder="Search this site"
              className="me-2"
              aria-label="Search"
            />
            <RedButton variant="link" className="px-2">
              <FontAwesomeIcon icon={faSearch} />
            </RedButton>
          </Form>
        </SearchSection>
        <MenuButton variant="link" onClick={handleShow}>
          <FontAwesomeIcon icon={faBars} />
        </MenuButton>
      </MobileMenuSection>

      <StyledOffcanvas show={showMenu} onHide={handleClose} placement="end">
        <Offcanvas.Header closeButton closeVariant="white">
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <MobileNav className="flex-column">
            <RedNavLink as={Link} to="/" onClick={handleClose}>Home</RedNavLink>
            <StyledNavDropdown title="People" id="people-dropdown-mobile">
              <NavDropdown.Item as={Link} to="/faculty" onClick={handleClose}>Faculty</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/students" onClick={handleClose}>Students</NavDropdown.Item>
            </StyledNavDropdown>
            <StyledNavDropdown title="Research" id="research-dropdown-mobile">
              <NavDropdown.Item as={Link} to="/labs" onClick={handleClose}>Labs</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/research-overview" onClick={handleClose}>Application Overview</NavDropdown.Item>
            </StyledNavDropdown>
            <RedNavLink as={Link} to="/events" onClick={handleClose}>Events</RedNavLink>

            <RedNavLink as={Link} to="/education" onClick={handleClose}>Education</RedNavLink>
            <RedNavLink as={Link} to="/honors" onClick={handleClose}>Honors</RedNavLink>
            <RedNavLink as={Link} to="/about" onClick={handleClose}>About</RedNavLink>
            <RedNavLink as={Link} to="/sponsors" onClick={handleClose}>Sponsors</RedNavLink>
            
            {/* User menu items for mobile */}
            {isAuthenticated && (
              <>
                <div className="border-top my-2"></div>
                <div className="px-3 py-2 text-muted small">
                  Signed in as: {userName || 'Account'}
                </div>
                <RedNavLink as={Link} to={getDashboardUrl()} onClick={handleClose}>Dashboard</RedNavLink>
                <RedNavLink onClick={() => { handleLogout(); handleClose(); }}>Logout</RedNavLink>
              </>
            )}
            
            {/* Login link for mobile */}
            {!isAuthenticated && (
              <>
                <div className="border-top my-2"></div>
                <RedNavLink as={Link} to="/login" onClick={handleClose}>Login</RedNavLink>
              </>
            )}
          </MobileNav>
        </Offcanvas.Body>
      </StyledOffcanvas>
    </StyledContainer>
  );
};

export default Header;