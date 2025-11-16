import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

// Animated wrapper component
interface AnimatedDivProps {
  isVisible: boolean;
}

const AnimatedDiv = styled.div<AnimatedDivProps>`
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transform: ${props => (props.isVisible ? 'translateY(0)' : 'translateY(30px)')};
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
`;

const HeroSection = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  margin-left: calc(-50vw + 50%);
  background-image: 
    radial-gradient(ellipse at center, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.4) 70%, rgba(255, 255, 255, 0.6) 100%),
    url('public/images/ApplyPage images/IMG_2361.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: scroll;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }

  @media (max-width: 768px) {
    height: 70vh;
    background-attachment: scroll;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 2rem;

  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
    line-height: 1.2;
  }

  p {
    font-size: 1.3rem;
    margin-bottom: 0;
    text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.5);
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 2.5rem;
    }

    p {
      font-size: 1.1rem;
    }
  }
`;

const CallToActionBar = styled.div`
  position: relative;
  width: calc(100% - 2rem);
  height: 120px;
  margin: 1.5rem auto;
  background: linear-gradient(90deg, #990000 0%, #990000 35%, #ffc107 70%, #ffc107 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  overflow: visible;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  max-width: 1200px;

  @media (max-width: 768px) {
    height: 240px;
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
    padding: 1.5rem;
    clip-path: none;
    width: calc(100% - 3rem);
    margin: 1rem auto;
  }
`;

const LeftSection = styled.div`
  flex: 0 0 35%;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;

    h2 {
      font-size: 1.75rem;
    }
  }
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    justify-content: center;
    gap: 1.5rem;
  }
`;

const RightContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.25rem;

  p {
    font-size: 0.95rem;
    color: #333;
    margin: 0;
    line-height: 1.4;
    font-weight: 500;
    text-align: right;
  }

  @media (max-width: 768px) {
    text-align: center;
    gap: 0.25rem;

    p {
      font-size: 0.9rem;
    }
  }
`;

const HowToApplyButton = styled.button`
  background: #000;
  color: white;
  padding: 0.6rem 1.75rem;
  font-size: 0.85rem;
  font-weight: 700;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;

  &:hover {
    background: #333;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.6rem 1.5rem;
    font-size: 0.85rem;
  }
`;

const AboutUsSection = styled.div`
  background: #ffffff;
  padding: 3rem 1rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem 0.5rem;
  }
`;

const AboutUsContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  align-items: start;
  padding: 0 1rem;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0 0.5rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
    padding: 0 0.5rem;
  }
`;

const AboutUsLeft = styled.div`
  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #000;
    margin: 0 0 1.5rem 0;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.6rem;
      margin-bottom: 1rem;
    }
  }
`;

const AboutUsLeftText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  p {
    font-size: 0.95rem;
    color: #333;
    line-height: 1.7;
    margin: 0;

    strong {
      color: #990000;
      font-weight: 600;
    }
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    li {
      font-size: 0.95rem;
      color: #333;
      line-height: 1.7;
      padding-left: 1.5rem;
      position: relative;

      &::before {
        content: '•';
        position: absolute;
        left: 0;
        color: #990000;
        font-weight: bold;
      }
    }
  }

  @media (max-width: 768px) {
    gap: 1rem;

    p {
      font-size: 0.9rem;
    }

    ul li {
      font-size: 0.9rem;
    }
  }
`;

const CheckProjectsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;

  span {
    font-size: 0.95rem;
    color: #333;
    font-weight: 500;
  }

  a {
    color: #990000;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #ffc107;
    }
  }
`;

const ApprenticeCardsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-top: 1.5rem;

  @media (max-width: 968px) {
    gap: 1.5rem;
  }

  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const ApprenticeRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  @media (max-width: 768px) {
    gap: 1.5rem;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    object-fit: cover;
    max-height: 400px;
  }

  @media (max-width: 968px) {
    img {
      max-height: 300px;
    }
  }

  @media (max-width: 768px) {
    img {
      max-height: 250px;
    }
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #000;
    margin: 0;
  }

  p {
    font-size: 1rem;
    color: #333;
    line-height: 1.8;
    margin: 0;

    strong {
      color: #990000;
      font-weight: 600;
    }
  }

  @media (max-width: 768px) {
    gap: 1rem;

    h3 {
      font-size: 1.1rem;
    }

    p {
      font-size: 0.95rem;
    }
  }
`;

const TextItem = styled.div`
  background: #ede2e7;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: left;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-height: 100px;
  display: flex;
  align-items: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }

  p {
    font-size: 0.95rem;
    color: #333;
    line-height: 1.6;
    margin: 0;
  }

  @media (max-width: 1200px) {
    padding: 1.25rem;
    min-height: 90px;

    p {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem;
    min-height: 80px;

    p {
      font-size: 0.85rem;
    }
  }
`;

const ApprenticeSection = styled.div`
  background: #ffffff;
  padding: 3rem 1rem;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1.5rem 0.5rem;
  }
`;

const ApprenticeContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: 768px) {
    padding: 0 0.5rem;
  }
`;

const ApprenticeHeading = styled.div`
  h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #000;
    margin: 0 0 2rem 0;
    text-align: center;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.6rem;
      margin-bottom: 1.5rem;
    }
  }
`;

const ApprenticeRowWrapper = styled.div`
  margin-bottom: 2rem;
`;

const ContactUsSection = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 280px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

const ContactLeftSide = styled.div`
  background: #990000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;

  h2 {
    font-size: 2.2rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-align: center;
  }

  @media (max-width: 968px) {
    h2 {
      font-size: 1.8rem;
    }
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.6rem;
    }

    min-height: 140px;
  }
`;

const ContactRightSide = styled.div`
  background: #ffc107;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem;
`;

const ContactContent = styled.div`
  max-width: 500px;
  width: 100%;

  h3 {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 0.75rem 0;
  }

  p {
    font-size: 0.9rem;
    color: #333;
    line-height: 1.5;
    margin: 0 0 0.5rem 0;

    &:last-child {
      margin-bottom: 0;
    }
  }

  a {
    color: #333;
    text-decoration: underline;
    font-weight: 600;
    transition: color 0.3s ease;

    &:hover {
      color: #990000;
    }
  }

  @media (max-width: 968px) {
    h3 {
      font-size: 1.2rem;
    }

    p {
      font-size: 0.85rem;
    }
  }

  @media (max-width: 768px) {
    h3 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    p {
      font-size: 0.8rem;
    }
  }
`;

const ResearchOverviewPage: React.FC = () => {
  const navigate = useNavigate();
  const [visibleSections, setVisibleSections] = useState({
    aboutUs: false,
    apprenticeRow1: false,
    apprenticeRow2: false,
  });

  const aboutUsRef = useRef<HTMLDivElement>(null);
  const apprenticeRow1Ref = useRef<HTMLDivElement>(null);
  const apprenticeRow2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === aboutUsRef.current) {
            setVisibleSections((prev) => ({ ...prev, aboutUs: true }));
          } else if (entry.target === apprenticeRow1Ref.current) {
            setVisibleSections((prev) => ({ ...prev, apprenticeRow1: true }));
          } else if (entry.target === apprenticeRow2Ref.current) {
            setVisibleSections((prev) => ({ ...prev, apprenticeRow2: true }));
          }
        }
      });
    }, observerOptions);

    if (aboutUsRef.current) observer.observe(aboutUsRef.current);
    if (apprenticeRow1Ref.current) observer.observe(apprenticeRow1Ref.current);
    if (apprenticeRow2Ref.current) observer.observe(apprenticeRow2Ref.current);

    return () => {
      if (aboutUsRef.current) observer.unobserve(aboutUsRef.current);
      if (apprenticeRow1Ref.current) observer.unobserve(apprenticeRow1Ref.current);
      if (apprenticeRow2Ref.current) observer.unobserve(apprenticeRow2Ref.current);
    };
  }, []);

  const handleExploreClick = () => {
    navigate('/apply');
  };

  return (
    <>
      <HeroSection>
        <HeroContent>
          <h1>Forging the Future of Machine Learning</h1>
          <p>Connecting USC's top undergraduate and Master's students with cutting-edge faculty research</p>
        </HeroContent>
      </HeroSection>

      <AnimatedDiv isVisible={visibleSections.aboutUs}>
        <AboutUsSection ref={aboutUsRef}>
        <AboutUsContent>
          <AboutUsLeft>
            <h2>About MASCLE Applications</h2>
            <AboutUsLeftText>
              <p>
                The <strong>MASCLE Applications System</strong> serves as the dynamic bridge connecting USC students with cutting-edge, faculty-led research teams across all ML-oriented domains.
              </p>

              <p>
                Our system goes beyond simple listings: it utilizes a <strong>powerful recommendation engine</strong> to suggest projects that best fit a student's existing skillset, academic background, and declared research interests. This assists students in finding high-impact opportunities where they are most likely to succeed and contribute.              
              </p>

              <p>
                Compensation (if any) is decided by the individual research lab, and positions are generally unpaid, though some may offer course credit. Students are limited to participation in one project per semester to ensure focus and depth of contribution. Each semester, projects from a wide range of disciplines are open to new applicants, and faculty and students from all schools and colleges at USC are welcome to participate.
              </p>

              <CheckProjectsContainer>
                <span>See the open project listings</span>
                <a href="/jobs/public">here</a>
              </CheckProjectsContainer>
            </AboutUsLeftText>
          </AboutUsLeft>
        </AboutUsContent>
      </AboutUsSection>
      </AnimatedDiv>

      <CallToActionBar>
        <LeftSection>
          <h2>Work with us!</h2>
        </LeftSection>
        <RightSection>
          <RightContent>
            <p>We're looking for excellent student leaders, researchers and builders in the ML space.</p>
            <p>We want to work with you!</p>
          </RightContent>
          <HowToApplyButton onClick={handleExploreClick}>
            How to Apply
          </HowToApplyButton>
        </RightSection>
      </CallToActionBar>

      <ApprenticeSection>
        <ApprenticeContent>
          <ApprenticeHeading>
            <h2>As a MASCLE Apprentice, students will:</h2>
          </ApprenticeHeading>
          <ApprenticeCardsGrid>
            <ApprenticeRowWrapper ref={apprenticeRow1Ref}>
              <AnimatedDiv isVisible={visibleSections.apprenticeRow1}>
                <ApprenticeRow>
                  <ImageContainer>
                    <img src="/images/ApplyPage images/att.RNwVxSs2-VhoXCtdhz_tTL-LThFB-Bd83cz3nESYZ8U.jpeg" alt="Award winning research" />
                  </ImageContainer>

                  <TextContent>
                    <TextItem>
                      <p><strong>Hands-On Projects:</strong> Work on real-world ML challenges and build a robust portfolio.</p>
                    </TextItem>
                    <TextItem>
                      <p><strong>Advanced Skills:</strong> Master cutting-edge tools like PyTorch and production-level ML techniques.</p>
                    </TextItem>
                    <TextItem>
                      <p><strong>Direct Mentorship:</strong> Learn from PhD students, post-docs, and leading faculty researchers.</p>
                    </TextItem>
                  </TextContent>
                </ApprenticeRow>
              </AnimatedDiv>
            </ApprenticeRowWrapper>

            <ApprenticeRowWrapper ref={apprenticeRow2Ref}>
              <AnimatedDiv isVisible={visibleSections.apprenticeRow2}>
                <ApprenticeRow>
                  <TextContent>
                    <TextItem>
                      <p><strong>Professional Networks:</strong> Connect with lab members and industry partners for recommendations and opportunities.</p>
                    </TextItem>
                    <TextItem>
                      <p><strong>Explore Interests:</strong> Discover career paths like ML Engineer, Research Scientist, or Data Scientist.</p>
                    </TextItem>
                    <TextItem>
                      <p><strong>Communication Skills:</strong> Present findings in lab meetings and contribute to research papers.</p>
                    </TextItem>
                  </TextContent>

                  <ImageContainer>
                    <img src="/images/ApplyPage images/IMG_6746.jpg" alt="Research presentation" />
                  </ImageContainer>
                </ApprenticeRow>
              </AnimatedDiv>
            </ApprenticeRowWrapper>
          </ApprenticeCardsGrid>
        </ApprenticeContent>
      </ApprenticeSection>

      <ContactUsSection>
        <ContactLeftSide>
          <h2>Contact</h2>
        </ContactLeftSide>
        <ContactRightSide>
          <ContactContent>
            <h3>MASCLE Research Program Office</h3>
            <p>MASCLE Research Program</p>
            <p>Ginsburg Hall</p>
            <p>University of Southern California</p>
            <p>Los Angeles, CA 90007</p>
            <p style={{ marginTop: '1.5rem' }}><strong>Drop-In Office Hours:</strong></p>
            <p>Please e-mail at <a href="mailto:mascle@usc.edu">mascle@usc.edu</a>.</p>
          </ContactContent>
        </ContactRightSide>
      </ContactUsSection>
    </>
  );
};

export default ResearchOverviewPage;
