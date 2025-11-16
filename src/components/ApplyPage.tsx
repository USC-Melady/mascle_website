import React from 'react';
import styled from '@emotion/styled';
import { getImagePath } from '../utils/imageHelper';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const PageContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  color: #000;
  padding: 4rem 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1rem;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 2rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const LeftSection = styled.div`
  animation: ${fadeIn} 1s ease-out;
`;

const Label = styled.p`
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: #990000;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #000;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 2rem;
  line-height: 1.8;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RightSection = styled.div`
  animation: ${fadeIn} 1s ease-out 0.2s both;
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
`;

const HowToApplySection = styled.div`
  max-width: 1200px;
  margin: 6rem auto 0;
  padding: 0 2rem;

  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: #000;
  margin-bottom: 0.5rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 3rem;
  font-weight: 500;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4rem;
  margin-bottom: 4rem;
`;

const StepRow = styled.div<{ reverse?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
  padding: 2rem;
  background: #fff;
  border-radius: 8px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const StepCard = styled.div`
  padding: 0;
  background: transparent;
  border-left: none;
  border-radius: 0;
  animation: ${fadeIn} 0.6s ease-out forwards;

  h3 {
    font-size: 1.2rem;
    font-weight: 600;
    color: #990000;
    margin-bottom: 1rem;
  }

  p {
    font-size: 0.95rem;
    color: #333;
    line-height: 1.6;
    margin: 0;
  }
`;

const StepImage = styled.img`
  width: 100%;
  height: auto;
  max-height: 400px;
  border-radius: 8px;
  object-fit: contain;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.6s ease-out forwards;
`;

const NoteSection = styled.div`
  background: #fff3f3;
  border-left: 4px solid #990000;
  padding: 2rem;
  border-radius: 8px;
  margin-top: 3rem;

  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: #990000;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    font-size: 0.95rem;
    color: #333;
    margin: 0.75rem 0;
    line-height: 1.7;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 1rem 0 0 0;

    li {
      font-size: 0.95rem;
      color: #333;
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
      position: relative;
      line-height: 1.6;

      &:before {
        content: "✓";
        color: #990000;
        font-weight: bold;
        position: absolute;
        left: 0;
      }
    }
  }
`;


const ApplyPage: React.FC = () => {
  return (
    <PageContainer>
      <ContentWrapper>
        <LeftSection>
          <Title>Join Us!</Title>
          <Description>
            Thank you for your interest in MASCLE! Before diving into how to apply, we'd recommend exploring what we work on, what to expect from our application process, and our upcoming events. We encourage students from all levels and backgrounds. We're excited to connect with you soon!
          </Description>
        </LeftSection>

        <RightSection>
          <Image src={getImagePath('.\\public\\images\\ApplyPage%20images\\IMG_6993.jpg')} alt="MASCLE Team" />
        </RightSection>
      </ContentWrapper>

      <HowToApplySection>
        <SectionTitle>How to Apply for a Research Position</SectionTitle>
        <SectionSubtitle>Follow these steps to submit your application.</SectionSubtitle>

        <StepsContainer>
          <StepRow>
            <StepCard>
              <h3>Step 1: Create an Account & Log In</h3>
              <p>Begin by registering on the MASCLE research portal and logging in with your USC credentials.</p>
            </StepCard>
            <StepImage src={getImagePath('/images/ApplyPageSteps%20images/Screenshot%202025-10-22%20182812.png')} alt="Step 1" />
          </StepRow>

          <StepRow>
            <StepCard>
              <h3>Step 2: Complete Your Profile</h3>
              <p>Complete 100% of your profile. Upload your resume (PDF preferred) and fill in the required personal and academic information.</p>
            </StepCard>
            <StepImage src={getImagePath('/images/ApplyPageSteps%20images/Screenshot%202025-10-22%20182032.png')} alt="Step 2" />
          </StepRow>

          <StepRow>
            <StepCard>
              <h3>Step 3: Browse Research Opportunities</h3>
              <p>Navigate to the Research Opportunities tab to explore available positions and explore several active projects. You may apply to a maximum of three (3) projects.</p>
            </StepCard>
            <StepImage src={getImagePath('/images/ApplyPageSteps%20images/Screenshot%202025-10-22%20183908.png')} alt="Step 3" />
          </StepRow>

          <StepRow>
            <StepCard>
              <h3>Step 4: Submit Your Application(s)</h3>
              <p><strong>You are allowed to submit applications for 3 projects per semester.</strong><br></br>For each position, you will be asked to provide the required information and materials listed below:</p>
              <ul style={{ marginTop: '1.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>Education Level</strong> (select from list)
                </li>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>Completed Profile including Resume/CV upload</strong> (PDF preferred)
                </li>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>Cover Letter</strong> — briefly explain your interest in the position
                </li>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>Summer Availability</strong> (select option)
                </li>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>Weekly Availability</strong> — realistic hours per week you can commit
                </li>
                <li style={{ fontSize: '0.95rem', color: '#333', marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative', lineHeight: '1.6' }}>
                  <span style={{ position: 'absolute', left: 0, color: '#990000', fontWeight: 'bold' }}>•</span>
                  <strong>200–250 word Statement of Expectations</strong> — What do you hope to gain from this research opportunity?
                </li>
              </ul>
              <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: '#666', fontSize: '0.9rem' }}>
                Note: If a mentor has multiple projects and you are applying to more than one, only submit one application per mentor, and indicate your project preference within your cover letter.
              </p>

            </StepCard>
            <StepImage src={getImagePath('/images/ApplyPageSteps%20images/Screenshot%202025-10-22%20183246.png')} alt="Step 4" />
          </StepRow>
        </StepsContainer>

        <NoteSection>
          <h4>📌 After Submission — Important Guidelines</h4>
          
          <p> Mentors will reach out to you via email. You will be notified about your application status by email — check your email frequently.</p>

          <h4 style={{ marginTop: '1.5rem' }}>Interview & Selection Process</h4>
          <ul>
            <li>If you are selected for an interview, schedule a meeting with the mentor immediately</li>
            <li>Respond promptly to any email communication</li>
            <li>Have your unofficial transcript(s) ready for the first interview (community college and USC transcripts included)</li>
            <li>Interviews may be held in person or via Zoom</li>
          </ul>

          <h4 style={{ marginTop: '1.5rem' }}>If Not Selected</h4>
          <p>
            Check back often for new openings, or watch the Announcements section — some projects may reopen or be newly added.
          </p>

          <h4 style={{ marginTop: '1.5rem' }}>⚠️ Special Instruction</h4>
          <p>
            Should you be invited to join more than one project, you need to make a decision and inform the mentors quickly.
          </p>
          <p>
          Questions? Please contact <strong>mascle@usc.edu</strong>.
          </p>
        </NoteSection>
      </HowToApplySection>
    </PageContainer>
  );
};

export default ApplyPage;
