import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import styled from '@emotion/styled';

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
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 2rem;
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${USC_RED};
  margin-bottom: 1rem;
  letter-spacing: -0.5px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #555;
  line-height: 1.8;
  margin-bottom: 3rem;
  max-width: 800px;
`;

const DecorLine = styled.div`
  width: 60px;
  height: 3px;
  background: ${USC_RED};
  margin-bottom: 2rem;
`;

const PartnersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin-top: 3rem;
  max-width: 750px;
  margin-left: auto;
  margin-right: auto;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }
`;

const PartnerCard = styled.div<{ isHovered?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-8px);
  }
`;

const LogoPlaceholder = styled.div<{ isHovered?: boolean }>`
  width: 100%;
  aspect-ratio: 1.2;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
  overflow: hidden;
  
  &:hover {
    border-color: ${USC_RED};
    box-shadow: 0 8px 20px rgba(153, 0, 0, 0.1);
  }
`;

const PartnerName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
`;

const ConsultingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  margin-top: 3rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const ServiceCard = styled.div`
  padding: 2.5rem;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid ${USC_RED};
  transition: all 0.3s ease;
  
  &:hover {
    background: #fff;
    box-shadow: 0 8px 24px rgba(153, 0, 0, 0.1);
    transform: translateY(-4px);
  }
`;

const ServiceIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const ServiceTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.75rem;
`;

const ServiceDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const TestimonialSection = styled.div`
  background: linear-gradient(135deg, rgba(153, 0, 0, 0.05) 0%, rgba(153, 0, 0, 0.02) 100%);
  padding: 4rem;
  border-radius: 16px;
  border-left: 6px solid ${USC_RED};
  margin: 5rem 0;
  
  @media (max-width: 768px) {
    padding: 2rem;
  }
`;

const TestimonialText = styled.p`
  font-size: 1.2rem;
  font-style: italic;
  color: #333;
  margin-bottom: 1.5rem;
  line-height: 1.8;
`;

const TestimonialAuthor = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const AuthorLogo = styled.div`
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
`;

const AuthorText = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.p`
  font-weight: 700;
  color: #333;
  margin: 0;
  font-size: 0.95rem;
`;

const AuthorRole = styled.p`
  color: #999;
  margin: 0.25rem 0 0 0;
  font-size: 0.85rem;
`;

const CTA = styled.div`
  text-align: center;
  padding: 3rem 0;
  background: linear-gradient(135deg, rgba(153, 0, 0, 0.02) 0%, rgba(153, 0, 0, 0.05) 100%);
  border-radius: 12px;
  margin-top: 5rem;
`;

const CTATitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: ${USC_RED};
  margin-bottom: 1rem;
`;

const CTAButton = styled.a`
  display: inline-block;
  background: ${USC_RED};
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background: #750000;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(153, 0, 0, 0.3);
    color: white;
  }
`;

interface Partner {
  name: string;
  logo: string;
}

const SponsorsPage: React.FC = () => {
  const [hoveredPartner, setHoveredPartner] = useState<string | null>(null);

  const featuredPartners: Partner[] = [
    { name: "Chase", logo: "/mascle_website/images/sponsors/chase.jpeg" },
    { name: "Google", logo: "/mascle_website/images/sponsors/google.png" },
    { name: "KDDI", logo: "/mascle_website/images/sponsors/kddi.png" },
    { name: "Microsoft Research", logo: "/mascle_website/images/sponsors/microsoft-research.png" },
    { name: "NVIDIA", logo: "/mascle_website/images/sponsors/nvidia.jpeg" },
    { name: "OBASE", logo: "/mascle_website/images/sponsors/obase-1.png" },
    { name: "Samsung", logo: "/mascle_website/images/sponsors/samsung.png" },
    { name: "US Bank", logo: "/mascle_website/images/sponsors/usbank.png" },
    { name: "Visa", logo: "/mascle_website/images/sponsors/visa.png" },
    { name: "Viterbi", logo: "/mascle_website/images/sponsors/viterbi.jpg" },
    { name: "WeWork", logo: "/mascle_website/images/sponsors/wework.png" },
    { name: "Yahoo", logo: "/mascle_website/images/sponsors/yahoo.jpg" }
  ];

  const services = [
    {
      icon: '🔍',
      title: 'Industry Collaboration',
      description: 'Work directly with MaSCle members on real-world machine learning projects and research initiatives.'
    },
    {
      icon: '👥',
      title: 'Talent Pipeline',
      description: 'Connect with top ML talent from USC Viterbi and engage with future industry leaders.'
    },
    {
      icon: '🎓',
      title: 'Campus Engagement',
      description: 'Increase brand presence through tech talks, workshops, and career fairs with the ML community.'
    }
  ];

  return (
    <PageContainer>
      <HeroSection>
        <HeroTitle>Partner With MaSCle</HeroTitle>
        <HeroSubtitle>
          Join industry leaders in supporting machine learning innovation and education at USC
        </HeroSubtitle>
      </HeroSection>

      <ContentSection>
        <SectionTitle>Featured Partners</SectionTitle>
        <DecorLine />
        <SectionDescription>
          We're proud to work with innovative companies and organizations that are 
          committed to advancing machine learning research and education.
        </SectionDescription>
        
        <PartnersGrid>
          {featuredPartners.map((partner) => (
            <PartnerCard
              key={partner.name}
              onMouseEnter={() => setHoveredPartner(partner.name)}
              onMouseLeave={() => setHoveredPartner(null)}
            >
              <LogoPlaceholder isHovered={hoveredPartner === partner.name}>
                <img 
                  src={partner.logo} 
                  alt={`${partner.name} Logo`}
                  style={{
                    maxWidth: '90%',
                    maxHeight: '90%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    filter: 'grayscale(15%)',
                    transition: 'all 0.3s ease',
                    transform: hoveredPartner === partner.name ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
              </LogoPlaceholder>
              <PartnerName>{partner.name}</PartnerName>
            </PartnerCard>
          ))}
        </PartnersGrid>
      </ContentSection>

      <ContentSection style={{ borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
        <SectionTitle>How We Partner</SectionTitle>
        <DecorLine />
        <SectionDescription>
          MaSCle works with partners through multiple engagement models to support 
          mutual goals in advancing machine learning research and talent development.
        </SectionDescription>

        <ConsultingGrid>
          {services.map((service, index) => (
            <ServiceCard key={index}>
              <ServiceIcon>{service.icon}</ServiceIcon>
              <ServiceTitle>{service.title}</ServiceTitle>
              <ServiceDescription>{service.description}</ServiceDescription>
            </ServiceCard>
          ))}
        </ConsultingGrid>
      </ContentSection>

      <ContentSection>
        <CTA>
          <CTATitle>Interested in Partnering?</CTATitle>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            Get in touch to explore partnership opportunities with MaSCle
          </p>
          <CTAButton href="mailto:contact@mascle.usc.edu">Contact Us</CTAButton>
        </CTA>
      </ContentSection>
    </PageContainer>
  );
};

export default SponsorsPage;
