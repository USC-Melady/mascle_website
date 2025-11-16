import React, { useState } from 'react';
import styled from '@emotion/styled';

const FormContainer = styled.div`
  background-color: #fafafa;
  border: 1px solid #eee;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
`;

const Title = styled.h3`
  color: #333;
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #990000;
    box-shadow: 0 0 0 2px rgba(153, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  background-color: #990000;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #800000;
  }
`;

const Disclaimer = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin-top: 1rem;
`;

const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Subscription email:', email);

    setEmail('');
  };

  return (
    <FormContainer>
      <Title>Subscribe to Our Newsletter</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button type="submit">Subscribe</Button>
      </Form>
      <Disclaimer>
        This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.
      </Disclaimer>
    </FormContainer>
  );
};

export default SubscriptionForm; 