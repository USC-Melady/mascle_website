import React from 'react';
import styled from '@emotion/styled';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const SideNav = styled.div`
  position: sticky;
  top: 2rem;
  padding: 1rem;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-right: 2rem;

  @media (max-width: 991px) {
    position: relative;
    top: 0;
    margin-bottom: 2rem;
  }
`;

const NavTitle = styled.h4`
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: block;
  padding: 0.5rem 1rem;
  color: ${props => props.$active ? '#990000' : '#666'};
  text-decoration: none;
  border-left: 3px solid ${props => props.$active ? '#990000' : 'transparent'};
  background-color: ${props => props.$active ? 'rgba(153, 0, 0, 0.05)' : 'transparent'};
  transition: all 0.2s;

  &:hover {
    color: #990000;
    border-left-color: #990000;
    background-color: rgba(153, 0, 0, 0.05);
    text-decoration: none;
  }
`;

const PeopleNav: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <SideNav>
      <NavTitle>Categories</NavTitle>
      <Nav className="flex-column">
        <NavLink to="/people" $active={currentPath === '/people'}>
          All People
        </NavLink>
        <NavLink to="/faculty" $active={currentPath === '/faculty'}>
          Faculty
        </NavLink>
        <NavLink to="/students" $active={currentPath === '/students'}>
          Students
        </NavLink>
      </Nav>
    </SideNav>
  );
};

export default PeopleNav; 