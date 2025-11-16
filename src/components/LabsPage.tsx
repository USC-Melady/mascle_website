import React, { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { Container } from 'react-bootstrap';

const USC_RED = '#990000';

const PageContainer = styled.div`
  padding: 2rem 0;
  min-height: 80vh;
  background: linear-gradient(to bottom, #fafafa 0%, #ffffff 50%, #f8f8f8 100%);
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
  font-size: 2rem;
  text-align: center;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const LabsGridSection = styled.div`
  margin: 2rem auto 6rem; /* reduced bottom margin to bring navbar closer */
  /* increase max width so cards can be larger on wide screens */
  max-width: 1200px;
  /* enable 3D perspective for cards to appear in front */
  perspective: 1400px;
`;

const LabsGrid = styled.div`
  display: grid;
  /* ensure cards have consistent width but are responsive */
  grid-template-columns: repeat(2, minmax(320px, 1fr));
  gap: 5.5rem; /* increased spacing between cards */
  margin-bottom: 3.5rem;
  align-items: center;
  justify-items: center; /* center children horizontally */

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(280px, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const LabCard = styled.div<{ $isVisible?: boolean }>`
  background: #ffffff;
  border-radius: 14px;
  padding: 2.25rem 1.75rem;
  width: 100%;
  max-width: 520px;
  height: 340px; /* fixed height to keep cards uniform */
  display: flex;
  align-items: center; /* vertical center */
  justify-content: center; /* horizontal center for the inner column */
  box-shadow: ${props => (props.$isVisible ? '0 10px 30px rgba(0,0,0,0.12)' : '0 6px 18px rgba(0,0,0,0.06)')};
  transform-style: preserve-3d;
  backface-visibility: hidden;
  transition: opacity 900ms ease, transform 900ms ease, box-shadow 700ms ease;
  opacity: ${props => (props.$isVisible ? 1 : 0)};
  transform: ${props => (props.$isVisible ? 'translateZ(30px) translateY(0) scale(1)' : 'translateZ(0) translateY(18px) scale(0.99)')};
  cursor: pointer;
  border: 1px solid rgba(153, 0, 0, 0.08);

  &:hover {
    box-shadow: 0 15px 40px rgba(153, 0, 0, 0.18);
    transform: translateZ(40px) translateY(-8px) scale(1.02);
  }

  @media (max-width: 1200px) {
    height: 320px;
    padding: 2rem 1.5rem;
  }

  @media (max-width: 768px) {
    height: 280px;
    padding: 1.5rem 1rem;
  }
`;

const LabCardLogo = styled.img`
  width: 120px;
  height: auto;
  object-fit: contain;
  margin-bottom: 0.6rem;

  @media (max-width: 768px) {
    width: 100px;
  }
`;

const LabCardName = styled.h3`
  color: ${USC_RED};
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0.6rem 0;
  letter-spacing: 0.3px;
`;

const LabCardDescription = styled.p`
  color: #666;
  font-size: 1.05rem;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const NavBarContainer = styled.div`
  display: flex;
  justify-content: center;
  /* reduce top margin to bring navbar closer to the grid */
  margin: 4rem auto 3rem;
  width: 100%;
  scroll-margin-top: 2rem;
`;

const CurvedNavBar = styled.nav`
  display: flex;
  background: linear-gradient(135deg, ${USC_RED} 0%, #770000 100%);
  border-radius: 50px;
  /* increase horizontal padding to make navbar longer and more prominent */
  padding: 1.2rem 8rem;
  box-shadow: 0 8px 25px rgba(153, 0, 0, 0.35);
  width: 98%;
  max-width: 2200px;
  justify-content: space-around;
  align-items: center;
  gap: 4rem;

  @media (max-width: 1200px) {
    width: 93%;
    padding: 0.9rem 4rem;
    gap: 3rem;
  }

  @media (max-width: 991px) {
    width: 95%;
    padding: 0.8rem 2.5rem;
    flex-wrap: wrap;
    border-radius: 30px;
    gap: 2rem;
  }

  @media (max-width: 576px) {
    width: 98%;
    padding: 0.6rem 1.5rem;
    gap: 1.5rem;
  }
`;

const NavButton = styled.button<{ $active: boolean }>`
  background: transparent;
  color: #ffffff;
  border: none;
  border-radius: 0;
  padding: 0.75rem 1rem;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  position: relative;
  letter-spacing: 0.5px;
  
  /* Active state - underline with glow */
  ${props => props.$active && `
    color: #ffffff;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.6);
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 3px;
      background: linear-gradient(90deg, transparent, #ffffff, transparent);
      border-radius: 2px;
      box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
    }
  `}
  
  /* Hover effect - underline and glow */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 2px;
    transition: width 0.3s ease;
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.5);
  }
  
  &:hover::before {
    width: 80%;
  }
  
  &:hover {
    color: #ffffff;
    transform: scale(1.08);
    text-shadow: 0 2px 12px rgba(255, 255, 255, 0.5);
  }

  &:active {
    transform: scale(1.05);
  }

  @media (max-width: 991px) {
    padding: 0.6rem 0.8rem;
    font-size: 1.1rem;
  }

  @media (max-width: 576px) {
    padding: 0.5rem 0.6rem;
    font-size: 1rem;
    flex: 1 1 calc(33.333% - 1rem);
    text-align: center;
  }
`;

const ContentSection = styled.div`
  margin-top: 2rem;
  padding: 2.5rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  min-height: 400px;
  display: flex;
  gap: 3rem;
  align-items: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(153, 0, 0, 0.05);

  @media (max-width: 1200px) {
    padding: 2rem;
    gap: 2.5rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    gap: 1.5rem;
  }
`;

const LogoContainer = styled.div`
  flex-shrink: 0;
  width: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;

  @media (max-width: 1200px) {
    width: 240px;
    padding: 1.25rem;
  }

  @media (max-width: 768px) {
    width: 200px;
    padding: 1rem;
  }

  @media (max-width: 576px) {
    width: 180px;
  }
`;

const LabLogo = styled.img`
  display: block;
  margin: 0 auto;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  object-position: center;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const LabTitle = styled.h2`
  color: ${USC_RED};
  margin-bottom: 1.5rem;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0.3px;

  @media (max-width: 1200px) {
    font-size: 2rem;
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    text-align: center;
  }

  @media (max-width: 576px) {
    font-size: 1.5rem;
  }
`;

const LabDescription = styled.p`
  color: #666;
  font-size: 1.15rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  letter-spacing: 0.2px;

  @media (max-width: 1200px) {
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    font-size: 1.05rem;
    text-align: center;
  }

  @media (max-width: 576px) {
    font-size: 1rem;
  }
`;

const LabPI = styled.div`
  color: #555;
  font-size: 0.95rem;
  margin-bottom: 0.8rem;
  font-weight: 600;

  span {
    color: #333;
    font-weight: 700;
    margin-left: 0.4rem;
  }
`;

const ComingSoon = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
  font-size: 1.2rem;
  font-style: italic;
`;

const LearnMoreButton = styled.button`
  background: linear-gradient(135deg, ${USC_RED} 0%, #770000 100%);
  border: 2px solid transparent;
  color: #ffffff;
  padding: 0.75rem 1.75rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(153, 0, 0, 0.3);
  letter-spacing: 0.3px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(153, 0, 0, 0.4);
    background: linear-gradient(135deg, #aa0000 0%, #880000 100%);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 3px 10px rgba(153, 0, 0, 0.3);
  }
`;

interface Lab {
  id: string;
  name: string;
  fullName: string;
  description: string;
  logo: string;
  url?: string;
  pi?: string;
}

const labs: Lab[] = [
  {
    id: 'melady',
    name: 'Melady',
    fullName: 'Machine Learning and Data Mining Lab',
    description: 'The USC Melady Lab is a leading research group in core machine learning and AI models as well as applications in health and sustainability. Recent research thrusts include foundation models for time series, interpretable machine learning, physics-informed AI, and so on.',
    pi: 'Yan Liu',
    logo: '/images/labs/Melady_Lab.png',
    url: 'https://usc-melady.github.io/melady_website/'
  },
  {
    id: 'ink',
    name: 'INK',
    fullName: 'Intelligence and Knowledge Discovery',
    description: 'The Intelligence and Knowledge Discovery (INK) Lab is a group of researchers working on next-generation machine intelligence techniques for label-efficient machine learning, knowledge-guided natural language processing, and graph-structured reasoning. Our research spans machine learning, natural language processing, and data mining, with a focus on weak-supervision methods for modeling natural-language text data and graph-structured data.',
    pi: 'Xiang Ren',
    logo: '/images/labs/INK Lab.png',
    url: 'https://inklab.usc.edu/'
  },
  {
    id: 'dill',
    name: 'DILL',
    fullName: 'Data, Interpretability, Language and Learning Lab',
    description: 'DILL is dedicated to the study of Data, Interpretability, Language and Learning. We focus on automatically estimating dataset difficulty for models, efficient pretraining, and semi-automatically building datasets that help models learn better. We also emphasize measuring how interpretable model decisions are to human users.',
    pi: 'Swabha Swayamdipta',
    logo: '/images/labs/DILL Lab.png',
    url: 'https://dill-lab.github.io/'
  },
  {
    id: 'glamor',
    name: 'GLAMOR',
    fullName: 'Grounding Language in Actions, Multimodal Observations and Robots',
    description: 'We bring together natural language processing and robotics to connect language to the world (RoboNLP). Our lab is broadly interested in connecting language to agent perception and action, and lifelong learning through interaction.',
    pi: 'Jesse Thomason',
    logo: '/images/labs/GLAMOR Lab.png',
    url: 'https://glamor-usc.github.io/'
  },
  {
    id: 'lime',
    name: 'LIME',
    fullName: 'Language, Intelligence, and Model Evaluation/Ethics',
    description: 'We delve into the realms of language, intelligence, and model ethics. Our team focuses on creating trustworthy NLP models and rigorously investigating the ethical consequences and broader societal effects of NLP systems, striving to ensure language technologies are developed and used in ways that align with ethical guidelines and uphold human values.',
    pi: 'Jieyu Zhao',
    logo: '/images/labs/LIME LAB.png',
    url: 'https://jyzhao.net/lab.html'
  },
  {
    id: 'allegro',
    name: 'ALLeGRo',
    fullName: 'AI, Language, Learning, Generalization, and Robustness Lab',
    description: 'The AI, Language, Learning, Generalization, and Robustness (ALLeGRo) Lab studies natural language processing and machine learning with a focus on building reliable NLP systems for a wide range of scenarios. We aim for a deeper understanding of how NLP systems work, when they fail, and how they can be improved.',
    pi: 'Robin Jia',
    logo: '/images/labs/logo-vertical-hires.png',
    url: 'https://allegro-lab.github.io/'
  }
];

const LabsPage: React.FC = () => {
  const [activeLab, setActiveLab] = useState<string>('melady');
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeLabData = labs.find(lab => lab.id === activeLab);

  useEffect(() => {
    // thresholds include both the normal and the higher value for last-row cards
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px',
      threshold: [0, 0.25, 0.6]
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const index = cardRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index === -1) return;

        // Determine current column count (1 on small screens, 2 otherwise)
        const columns = window.innerWidth <= 768 ? 1 : 2;
        const lastRowStart = Math.floor((labs.length - 1) / columns) * columns;
        const isLastRow = index >= lastRowStart;

        // Required visible ratio: higher for last row
        const requiredRatio = isLastRow ? 0.6 : 0.25;

        setVisibleCards(prev => {
          const next = new Set(prev);
          if (entry.intersectionRatio >= requiredRatio) {
            next.add(index);
          } else {
            if (next.has(index)) next.delete(index);
          }
          return next;
        });
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    cardRefs.current.forEach(card => {
      if (card) observer.observe(card);
    });

    // Re-observe on resize to account for column changes
    const handleResize = () => {
      cardRefs.current.forEach(card => {
        if (card) observer.unobserve(card);
      });
      cardRefs.current.forEach(card => {
        if (card) observer.observe(card);
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cardRefs.current.forEach(card => {
        if (card) observer.unobserve(card);
      });
    };
  }, []);

  const handleLabCardClick = (labId: string) => {
    setActiveLab(labId);
    // Scroll to navbar smoothly
    const navbarElement = document.getElementById('labs-navbar');
    if (navbarElement) {
      navbarElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <PageContainer>
      <Container>
        <PageTitle>Research Labs</PageTitle>
        
        <LabsGridSection>
          <LabsGrid>
            {labs.map((lab, index) => (
              <LabCard 
                key={lab.id} 
                ref={el => cardRefs.current[index] = el}
                $isVisible={visibleCards.has(index)}
                onClick={() => handleLabCardClick(lab.id)}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'}}>
                  <LabCardLogo src={lab.logo} alt={`${lab.name} Lab Logo`} />
                  <LabCardName>{lab.name}</LabCardName>
                  <LabCardDescription>{lab.fullName}</LabCardDescription>
                </div>
              </LabCard>
            ))}
          </LabsGrid>
        </LabsGridSection>
        
        <NavBarContainer id="labs-navbar">
          <CurvedNavBar>
            {labs.map(lab => (
              <NavButton
                key={lab.id}
                $active={activeLab === lab.id}
                onClick={() => setActiveLab(lab.id)}
              >
                {lab.id === 'allegro' ? 'ALLEGRO' : lab.name}
              </NavButton>
            ))}
          </CurvedNavBar>
        </NavBarContainer>

        <ContentSection>
          {activeLabData ? (
            <>
              <LogoContainer>
                <LabLogo src={activeLabData.logo} alt={`${activeLabData.name} Lab Logo`} />
              </LogoContainer>
              <ContentWrapper>
                <LabTitle>{activeLabData?.fullName}</LabTitle>
                {activeLabData?.pi && (
                  <LabPI>
                    PI: <span>{activeLabData.pi}</span>
                  </LabPI>
                )}
                <LabDescription>{activeLabData?.description}</LabDescription>

                <div style={{ marginTop: '2rem' }}>
                  {activeLabData?.url && (
                    <a
                      href={activeLabData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                    >
                      <LearnMoreButton
                        aria-label={`Learn more about ${activeLabData.name}`}
                      >
                        Learn more
                      </LearnMoreButton>
                    </a>
                  )}

                  <em style={{ color: '#999', marginTop: '2rem', display: 'block' }}>
                    
                  </em>
                </div>
              </ContentWrapper>
            </>
          ) : (
            <ComingSoon>Select a lab to view details</ComingSoon>
          )}
        </ContentSection>
      </Container>
    </PageContainer>
  );
};

export default LabsPage;
