import React from 'react';
import styled from '@emotion/styled';

const ImagePlaceholder = styled.div`
  background-color: #f8f8f8;
  height: 250px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #eee;
`;

const Initials = styled.div`
  width: 120px;
  height: 120px;
  background-color: #990000;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 500;
`;

interface DefaultProfileImageProps {
  name: string;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const DefaultProfileImage: React.FC<DefaultProfileImageProps> = ({ name }) => {
  const initials = getInitials(name);

  return (
    <ImagePlaceholder>
      <Initials>{initials}</Initials>
    </ImagePlaceholder>
  );
};

export default DefaultProfileImage; 