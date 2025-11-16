import styled from '@emotion/styled';
import { Nav } from 'react-bootstrap';


export const FooterWrapper = styled.footer`
  background-color: #990000;
  padding: 1rem 0;
  color: #ffffff;
`;

// Navigation menu
export const StyledNav = styled(Nav)`
  justify-content: center;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 0.75rem;

  // Links styling
  .nav-link {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.8rem;
    padding: 0;
    transition: color 0.2s;
    white-space: nowrap;

    // Subtle hover effect
    &:hover {
      color: #ffffff;
      text-decoration: underline;
    }
  }

  // Tighter spacing on mobile
  @media (max-width: 991px) {
    gap: 1rem;
  }
`;

//Copyright section 
export const BottomBar = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.75rem;
`; 