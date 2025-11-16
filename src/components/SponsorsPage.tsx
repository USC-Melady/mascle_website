import React from 'react';
import { Container } from 'react-bootstrap';

const USC_RED = '#990000';

const styles = {
  pageContainer: {
    padding: '3rem 0',
    maxWidth: '1000px',
    margin: '0 auto'
  },
  pageTitle: {
    color: USC_RED,
    textAlign: 'center' as const,
    marginBottom: '4rem',
    fontWeight: 300,
    fontSize: '2.8rem',
    letterSpacing: '-0.5px'
  },
  collageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: 'repeat(3, 150px)',
    gap: '1.5rem',
    maxWidth: '900px',
    margin: '0 auto',
    padding: '2rem',
    background: '#fafafa',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
  },
  sponsorCard: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    border: '1px solid #e9ecef'
  },
  sponsorLogo: {
    maxWidth: '100%',
    maxHeight: '100%',
    width: 'auto',
    height: 'auto',
    objectFit: 'contain' as const,
    filter: 'grayscale(20%)',
    transition: 'all 0.3s ease'
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d',
    fontWeight: 600,
    fontSize: '0.9rem',
    textAlign: 'center' as const,
    lineHeight: 1.3,
    border: '2px dashed #dee2e6'
  },
  mobileGrid: {
    '@media (max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(6, 120px)',
      gap: '1rem',
      padding: '1rem'
    }
  }
};

interface Sponsor {
  name: string;
  logo?: string;
}

const SponsorsPage: React.FC = () => {
  const sponsors: Sponsor[] = [
    {
      name: "Google",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "Microsoft",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "Amazon AWS",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "NVIDIA",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "Meta"
    },
    {
      name: "Adobe"
    },
    {
      name: "IBM"
    },
    {
      name: "Intel"
    },
    {
      name: "Salesforce",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "Apple",
      logo: "/images/sponsors/placeholder.svg"
    },
    {
      name: "OpenAI"
    },
    {
      name: "Qualcomm"
    }
  ];

  const renderSponsor = (sponsor: Sponsor) => (
    <div
      key={sponsor.name}
      style={styles.sponsorCard}
    >
      {sponsor.logo ? (
        <img
          src={sponsor.logo}
          alt={`${sponsor.name} Logo`}
          style={styles.sponsorLogo}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div
        style={{
          ...styles.placeholderLogo,
          display: sponsor.logo ? 'none' : 'flex'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.6 }}>🏢</div>
        {sponsor.name}
      </div>
    </div>
  );

  // Add mobile responsiveness
  const isMobile = window.innerWidth <= 768;
  const gridStyle = {
    ...styles.collageGrid,
    ...(isMobile && {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gridTemplateRows: 'repeat(6, 120px)',
      gap: '1rem',
      padding: '1rem'
    })
  };

  return (
    <Container style={styles.pageContainer}>
      <h1 style={styles.pageTitle}>Our Sponsors</h1>
      <div style={gridStyle}>
        {sponsors.map(renderSponsor)}
      </div>
    </Container>
  );
};

export default SponsorsPage;
