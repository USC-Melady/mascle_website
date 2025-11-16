import styled from '@emotion/styled';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: linear-gradient(180deg, #f5f7fa 0%, #e8ecf1 50%, #f5f7fa 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a1a2e;
`;

const Section = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 3rem;

  @media (max-width: 1024px) {
    padding: 5rem 2.5rem;
  }

  @media (max-width: 768px) {
    padding: 3.5rem 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 2.5rem 1rem;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;

  .label {
    color: #990000;
    font-size: 0.9rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
      font-size: 0.8rem;
      margin-bottom: 0.75rem;
    }
  }

  h2 {
    font-size: 3rem;
    font-weight: 700;
    color: #111;
    margin: 0;
    line-height: 1.2;

    @media (max-width: 1024px) {
      font-size: 2.5rem;
    }

    @media (max-width: 768px) {
      font-size: 2rem;
      line-height: 1.3;
    }

    @media (max-width: 480px) {
      font-size: 1.5rem;
    }
  }

  .description {
    font-size: 1.2rem;
    color: rgba(0, 0, 0, 0.65);
    margin-top: 1rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 1024px) {
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      font-size: 1rem;
      margin-top: 0.75rem;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
  padding: 4rem 0;

  @media (max-width: 1024px) {
    gap: 2.5rem;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    padding: 3rem 0;
  }

  @media (max-width: 768px) {
    gap: 2rem;
    grid-template-columns: repeat(2, 1fr);
    padding: 2rem 0;
  }

  @media (max-width: 480px) {
    gap: 1.5rem;
    grid-template-columns: 1fr;
    padding: 1.5rem 0;
  }
`;

const StatCard = styled.div`
  padding: 2rem;
  background: rgba(153, 0, 0, 0.06);
  border: 1px solid rgba(153, 0, 0, 0.12);
  border-radius: 12px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
  }

  &:hover {
    transform: translateY(-5px);
    background: rgba(153, 0, 0, 0.08);
    border-color: rgba(153, 0, 0, 0.18);

    @media (max-width: 480px) {
      transform: translateY(-3px);
    }
  }

  .number {
    font-size: 3.5rem;
    font-weight: 700;
    color: #990000;
    margin-bottom: 0.5rem;
    line-height: 1;

    @media (max-width: 1024px) {
      font-size: 2.8rem;
    }

    @media (max-width: 768px) {
      font-size: 2.3rem;
    }

    @media (max-width: 480px) {
      font-size: 1.8rem;
      margin-bottom: 0.35rem;
    }
  }

  .label {
    color: rgba(0, 0, 0, 0.7);
    font-weight: 400;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;

    @media (max-width: 768px) {
      font-size: 0.9rem;
    }

    @media (max-width: 480px) {
      font-size: 0.8rem;
      letter-spacing: 0.05em;
    }
  }
`;

const ResearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.75rem;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
`;

const ResearchCard = styled.div`
  padding: 2.5rem;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.75rem;
  }

  @media (max-width: 480px) {
    padding: 1.5rem;
  }

  &:hover {
    transform: translateY(-5px);
    background: #fff7f7;
    border-color: rgba(153, 0, 0, 0.12);
    box-shadow: 0 8px 30px rgba(153, 0, 0, 0.06);

    @media (max-width: 480px) {
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(153, 0, 0, 0.04);
    }
  }

  h3 {
    color: #990000;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;

    @media (max-width: 768px) {
      font-size: 1.3rem;
      margin-bottom: 0.75rem;
    }

    @media (max-width: 480px) {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
  }

  p {
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
    margin: 0;
    font-size: 1.05rem;

    @media (max-width: 768px) {
      font-size: 0.95rem;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      font-size: 0.9rem;
      line-height: 1.5;
    }
  }
`;

const NewsGrid = styled.div`
  display: grid;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    gap: 1.75rem;
  }

  @media (max-width: 768px) {
    gap: 1.5rem;
  }

  @media (max-width: 480px) {
    gap: 1.25rem;
  }
`;

const NewsItem = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-left: 4px solid #990000;
  border-radius: 8px;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  @media (max-width: 480px) {
    padding: 1.25rem;
    border-left-width: 3px;
  }

  &:hover {
    transform: translateX(10px);
    background: #fff7f7;
    box-shadow: 0 4px 20px rgba(153, 0, 0, 0.06);

    @media (max-width: 768px) {
      transform: translateX(8px);
      box-shadow: 0 2px 12px rgba(153, 0, 0, 0.04);
    }

    @media (max-width: 480px) {
      transform: translateX(5px);
      box-shadow: 0 2px 8px rgba(153, 0, 0, 0.03);
    }
  }

  .date {
    color: #990000;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;

    @media (max-width: 768px) {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }

  .title {
    color: #111;
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.5;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
      line-height: 1.4;
    }
  }
`;

const AboutPage: React.FC = () => {
  return (
    <PageWrapper>
      <Section>
        <SectionHeader>
          <div className="label">About MaSCle</div>
          <h2>Machine Learning Center at USC</h2>
          <p className="description">
            The <strong>USC Machine Learning Center</strong>, <strong>MaSCle</strong> for short, is a research center dedicated to fundamental
            machine learning research and education. Established in 2016, our mission is to advance convergent and
            synergistic activities between researchers in core machine learning across USC campus.
          </p>
        </SectionHeader>

        <StatsGrid>
          <StatCard>
            <div className="number">200+</div>
            <div className="label">Publications</div>
          </StatCard>
          <StatCard>
            <div className="number">50+</div>
            <div className="label">Researchers</div>
          </StatCard>
          <StatCard>
            <div className="number">15+</div>
            <div className="label">Active Projects</div>
          </StatCard>
          <StatCard>
            <div className="number">8</div>
            <div className="label">Years of Excellence</div>
          </StatCard>
        </StatsGrid>
      </Section>

      <Section>
        <SectionHeader>
          <div className="label">Our Work</div>
          <h2>Research Areas</h2>
          <p className="description">
            We serve as the main hub for building interdisciplinary research applying machine learning to critical
            societal challenges, including sustainability, biology, health and medicine, and business innovation.
          </p>
        </SectionHeader>

        <ResearchGrid>
          <ResearchCard>
            <h3>Deep Learning</h3>
            <p>Neural network architectures, optimization methods, and theoretical foundations of deep learning systems for next-generation AI applications.</p>
          </ResearchCard>
          <ResearchCard>
            <h3>Computer Vision</h3>
            <p>Advanced image recognition, object detection, and visual understanding using cutting-edge machine learning techniques.</p>
          </ResearchCard>
          <ResearchCard>
            <h3>Natural Language Processing</h3>
            <p>Language understanding, text generation, and computational linguistics research for human-AI interaction.</p>
          </ResearchCard>
          <ResearchCard>
            <h3>AI for Science</h3>
            <p>Transformative applications in healthcare, biology, sustainability, and interdisciplinary scientific research.</p>
          </ResearchCard>
        </ResearchGrid>
      </Section>

      <Section>
        <SectionHeader>
          <div className="label">Latest Updates</div>
          <h2>Recent Developments</h2>
        </SectionHeader>

        <NewsGrid>
          <NewsItem>
            <div className="date">May 2024</div>
            <div className="title">MaSCle researchers receive Best Paper Award at International Conference on Machine Learning</div>
          </NewsItem>
          <NewsItem>
            <div className="date">April 2024</div>
            <div className="title">New PhD and undergraduate research positions available for Fall 2024 admission</div>
          </NewsItem>
          <NewsItem>
            <div className="date">March 2024</div>
            <div className="title">Workshop on AI for Healthcare Innovation — Registration now open for industry partners</div>
          </NewsItem>
        </NewsGrid>
      </Section>
    </PageWrapper>
  );
};

export default AboutPage;
