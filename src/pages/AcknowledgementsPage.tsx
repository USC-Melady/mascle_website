import React from 'react';
import styled from '@emotion/styled';
import { Container } from 'react-bootstrap';
import { getImagePath } from '../utils/imageHelper';

const USC_RED = '#990000';

const PageContainer = styled.div`
  padding: 0;
  background: #ffffff;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #990000 0%, #cc0000 100%);
  color: white;
  padding: 6rem 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: -1px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  font-weight: 300;
  margin: 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ContentSection = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 5rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  font-weight: 700;
  color: ${USC_RED};
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const DecorLine = styled.div`
  width: 60px;
  height: 3px;
  background: ${USC_RED};
  margin-bottom: 2rem;
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 3rem;
`;

const ContributorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
`;

const TeamMemberCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(153, 0, 0, 0.1);
    transform: translateY(-4px);
  }
`;

const TeamMemberImage = styled.div`
  width: 100%;
  aspect-ratio: 1;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: #ccc;
  border-bottom: 2px solid #ddd;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const TeamMemberInfo = styled.div`
  padding: 1.5rem;
  text-align: center;

  h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    font-size: 0.9rem;
    color: #666;
    line-height: 1.5;
    margin: 0.25rem 0;

    &:last-child {
      margin-bottom: 0;
    }

    &.role {
      font-weight: 600;
      color: ${USC_RED};
      margin-top: 0.5rem;
    }
  }
`;

const ContributorCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 2rem;
  border-left: 4px solid ${USC_RED};
  transition: all 0.3s ease;
  
  &:hover {
    background: #fff;
    box-shadow: 0 8px 24px rgba(153, 0, 0, 0.1);
    transform: translateY(-4px);
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 0.5rem;
    margin-top: 0;
  }

  p {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.6;
    margin: 0 0 0.75rem 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0.75rem 0 0 0;

    li {
      font-size: 0.95rem;
      color: #666;
      line-height: 1.6;
      padding-left: 1.25rem;
      position: relative;
      margin-bottom: 0.5rem;

      &::before {
        content: '→';
        position: absolute;
        left: 0;
        color: ${USC_RED};
        font-weight: bold;
      }
    }
  }
`;

const TimelineSection = styled.div`
  background: linear-gradient(135deg, rgba(153, 0, 0, 0.05) 0%, rgba(153, 0, 0, 0.02) 100%);
  border-radius: 12px;
  padding: 3rem 2rem;
  margin: 4rem 0;
`;

const TimelineTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin-bottom: 2.5rem;
  margin-top: 0;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  position: relative;

  &:last-child {
    margin-bottom: 0;
  }

  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    width: 2px;
    height: calc(100% + 2rem);
    background: #ddd;
  }

  &:last-child::before {
    display: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;

    &::before {
      display: none;
    }
  }
`;

const TimelineYear = styled.div`
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  background: ${USC_RED};
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  position: relative;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-top: 0.5rem;

  h4 {
    font-size: 1.2rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.5rem 0;
  }

  p {
    font-size: 0.95rem;
    color: #666;
    line-height: 1.6;
    margin: 0;
  }
`;

const AcknowledgementsPage: React.FC = () => {
  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>Our Team & Acknowledgements</HeroTitle>
        <HeroSubtitle>
          Celebrating the faculty, staff, students, and partners who make MaSCle possible
        </HeroSubtitle>
      </HeroSection>

      <ContentSection>
        <div style={{ background: 'linear-gradient(135deg, rgba(153, 0, 0, 0.05) 0%, rgba(153, 0, 0, 0.02) 100%)', borderRadius: '12px', padding: '2.5rem', marginBottom: '3rem', borderLeft: '4px solid #990000' }}>
          <p style={{ fontSize: '1.15rem', color: '#333', lineHeight: 1.8, marginBottom: 0, fontWeight: 500 }}>
            The MASCLE Application System is an initiative of the USC Machine Learning Center dedicated to improving student research access.
          </p>
        </div>

        <SectionTitle>Leadership & Faculty</SectionTitle>
        <DecorLine />
        <SectionDescription>
          MaSCle's vision is guided by dedicated faculty members and program directors who 
          are committed to advancing machine learning education and research at USC.
        </SectionDescription>

        <ContributorsGrid>
          <ContributorCard>
            <h3>Program Directors</h3>
            <p>Faculty leaders guiding MaSCle's strategic direction and research initiatives.</p>
            <ul>
              <li>Vision & Mission Leadership</li>
              <li>Curriculum Development</li>
              <li>Research Partnerships</li>
            </ul>
          </ContributorCard>

          <ContributorCard>
            <h3>Core Team</h3>
            <p>Dedicated staff and coordinators managing day-to-day operations and student support.</p>
            <ul>
              <li>Program Coordination</li>
              <li>Student Advising</li>
              <li>Event Management</li>
            </ul>
          </ContributorCard>

          <ContributorCard>
            <h3>Faculty Mentors</h3>
            <p>Research lab leaders providing mentorship and supervision to our apprentices.</p>
            <ul>
              <li>Individual Lab Direction</li>
              <li>Research Supervision</li>
              <li>Career Guidance</li>
            </ul>
          </ContributorCard>
        </ContributorsGrid>
      </ContentSection>

      <ContentSection>
        <SectionTitle>Development Team</SectionTitle>
        <DecorLine />
        <SectionDescription>
          Meet the talented individuals behind the MASCLE Application System, working to 
          connect students with cutting-edge research opportunities.
        </SectionDescription>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          {/* Director */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Yan%20Liu.jpg')} alt="Prof. Yan Liu" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Prof. Yan Liu</h3>
              <p className="role">MASCLE Director</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>

          {/* Project Lead */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Emily%20N.jpg')} alt="Emily Nguyen" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Emily Nguyen</h3>
              <p className="role">Project Lead</p>
              <p>PhD Student</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>

          {/* Full-Stack Developer 1 */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Alaba.jpeg')} alt="Alaba Alabaweh" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Alaba Alabaweh</h3>
              <p className="role">Full-Stack Developer</p>
              <p>CS Undergraduate</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>

          {/* Full-Stack Developer 2 */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Harsh%20T.jpg')} alt="Harsh Toshniwal" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Harsh Toshniwal</h3>
              <p className="role">Full-Stack Developer</p>
              <p>CS Masters</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>

          {/* ML Engineer */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Bryce%20Kan.jpeg')} alt="Bryce Kan" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Bryce Kan</h3>
              <p className="role">ML Engineer</p>
              <p>CS Masters</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>

          {/* UI Designer */}
          <TeamMemberCard>
            <TeamMemberImage>
              <img src={getImagePath('/images/developers%20images/Zhou%20Joyce.jpeg')} alt="Joyce Zhou" />
            </TeamMemberImage>
            <TeamMemberInfo>
              <h3>Joyce Zhou</h3>
              <p className="role">UI Designer</p>
              <p>CS Undergraduate</p>
              <p>USC Melady Lab</p>
            </TeamMemberInfo>
          </TeamMemberCard>
        </div>
      </ContentSection>

      <ContentSection style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
        <SectionTitle>Our Partners</SectionTitle>
        <DecorLine />
        <SectionDescription>
          We're grateful for the support of industry leaders and organizations that make 
          our mission possible through partnerships, sponsorships, and collaborative opportunities.
        </SectionDescription>

        <ContributorsGrid>
          <ContributorCard>
            <h3>Industry Partners</h3>
            <p>Leading companies investing in ML talent and innovation through partnerships.</p>
            <ul>
              <li>Sponsorships & Funding</li>
              <li>Guest Lectures</li>
              <li>Career Opportunities</li>
            </ul>
          </ContributorCard>

          <ContributorCard>
            <h3>Academic Collaborators</h3>
            <p>Universities and research institutions advancing the ML community together.</p>
            <ul>
              <li>Research Collaboration</li>
              <li>Knowledge Sharing</li>
              <li>Student Exchange</li>
            </ul>
          </ContributorCard>

          <ContributorCard>
            <h3>University Support</h3>
            <p>USC Viterbi School of Engineering and university resources supporting our growth.</p>
            <ul>
              <li>Facility Access</li>
              <li>Administrative Support</li>
              <li>Strategic Resources</li>
            </ul>
          </ContributorCard>
        </ContributorsGrid>
      </ContentSection>

      <ContentSection>
        <div style={{ background: 'linear-gradient(135deg, rgba(153, 0, 0, 0.05) 0%, rgba(153, 0, 0, 0.02) 100%)', borderRadius: '12px', padding: '3rem', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#333', marginBottom: '1rem', marginTop: 0 }}>Special Thanks</h3>
          <p style={{ fontSize: '1.1rem', color: '#666', lineHeight: 1.8, marginBottom: 0 }}>
            To every student who has contributed their passion and talent, every faculty member who has mentored our apprentices, 
            and every partner who has believed in our mission to advance machine learning education and research at USC. 
            Together, we are building the future of ML.
          </p>
        </div>
      </ContentSection>
    </PageContainer>
  );
};

export default AcknowledgementsPage;
