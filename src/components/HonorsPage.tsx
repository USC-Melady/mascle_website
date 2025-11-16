import React from 'react';
import { Container } from 'react-bootstrap';
import styled from '@emotion/styled';

const USC_RED = '#990000';

const PageContainer = styled(Container)`
  padding: 3rem 0;
  max-width: 1000px;
`;

const PageTitle = styled.h1`
  color: ${USC_RED};
  text-align: center;
  margin-bottom: 4rem;
  font-weight: 300;
  font-size: 2.8rem;
  letter-spacing: -0.5px;
`;

const SectionContainer = styled.div`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 2.5rem;
  font-weight: 400;
  font-size: 1.6rem;
  position: relative;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 2px;
    background: ${USC_RED};
    margin-top: 0.5rem;
  }
`;

const HonorItem = styled.div`
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: #fafafa;
    padding-left: 1rem;
    margin-left: -1rem;
    margin-right: -1rem;
  }
`;

const HonorTitle = styled.h3`
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.8rem;
  line-height: 1.4;
`;

const RecipientsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
`;

const RecipientName = styled.span`
  color: ${USC_RED};
  font-weight: 500;
  font-size: 0.95rem;
`;

const YearText = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-left: 0.3rem;
`;

const Separator = styled.span`
  color: #bdc3c7;
  margin: 0 0.5rem;
`;

interface Honor {
  title: string;
  recipients: Array<{
    name: string;
    year: string;
  }>;
}

const HonorsPage: React.FC = () => {
  const careerHonors: Honor[] = [
    {
      title: "AAAI New Faculty Highlights",
      recipients: [{ name: "Yue Zhao", year: "2024" }]
    },
    {
      title: "Google Research Scholar",
      recipients: [{ name: "Robin Jia", year: "2023" }]
    },
    {
      title: "NSF CAREER",
      recipients: [{ name: "Vatsal Sharan", year: "2023" }]
    },
    {
      title: "COLT Best Paper Award",
      recipients: [{ name: "Vatsal Sharan", year: "2023" }]
    },
    {
      title: "Forbes' Asia 30 Under 30",
      recipients: [{ name: "Xiang Ren", year: "2019" }]
    },
    {
      title: "Institute of Mathematical Statistics Fellow",
      recipients: [{ name: "Jinchi Lv", year: "2019" }]
    },
    {
      title: "American Statistical Association Fellow",
      recipients: [{ name: "Yingying Fan", year: "2019" }]
    },
    {
      title: "Royal Statistical Society Guy Medal in Bronze",
      recipients: [
        { name: "Yingying Fan", year: "2017" },
        { name: "Jinchi Lv", year: "2015" }
      ]
    },
    {
      title: "Adobe Data Science Research Award",
      recipients: [{ name: "Jinchi Lv", year: "2017" }]
    },
    {
      title: "Gödel Prize",
      recipients: [
        { name: "Shang-Hua Teng", year: "2015" },
        { name: "Shang-Hua Teng", year: "2008" }
      ]
    },
    {
      title: "Simons Investigators Award",
      recipients: [{ name: "Shang-Hua Teng", year: "2014" }]
    },
    {
      title: "American Statistical Association Noether Young Scholar Award",
      recipients: [{ name: "Yingying Fan", year: "2013" }]
    },
    {
      title: "Okawa Foundation Research Award",
      recipients: [{ name: "Yan Liu", year: "2013" }]
    },
    {
      title: "NSF CAREER Award",
      recipients: [
        { name: "Yan Liu", year: "2013" },
        { name: "Yingying Fan", year: "2012" },
        { name: "Jinchi Lv", year: "2010" },
        { name: "Shang-Hua Teng", year: "1996" }
      ]
    },
    {
      title: "Sloan Research Fellow",
      recipients: [
        { name: "Fei Sha", year: "2013" },
        { name: "Shang-Hua Teng", year: "1996" }
      ]
    },
    {
      title: "Army Young Investigator Award",
      recipients: [{ name: "Fei Sha", year: "2012" }]
    },
    {
      title: "ACM Fellow",
      recipients: [{ name: "Shang-Hua Teng", year: "2010" }]
    },
    {
      title: "Fulkerson Prize",
      recipients: [{ name: "Shang-Hua Teng", year: "2009" }]
    }
  ];

  const bestPaperAwards: Honor[] = [
    {
      title: "SIGKDD Dissertation Award",
      recipients: [{ name: "Xiang Ren", year: "2018" }]
    },
    {
      title: "NIPS Best Paper Award",
      recipients: [
        { name: "Haipeng Luo", year: "2016" },
        { name: "Fei Sha", year: "2007" }
      ]
    },
    {
      title: "ICML Best Paper Award",
      recipients: [
        { name: "Haipeng Luo", year: "2015" },
        { name: "Fei Sha", year: "2004" }
      ]
    },
    {
      title: "STOC Best Paper Award",
      recipients: [{ name: "Shanghua Teng", year: "2011" }]
    },
    {
      title: "SDM Best Paper Award",
      recipients: [{ name: "Yan Liu", year: "2007" }]
    },
    {
      title: "Signal Processing Society Young Author Best Paper Award",
      recipients: [{ name: "Meisam Razaviyayn", year: "2014" }]
    }
  ];

  const renderHonorItem = (honor: Honor) => (
    <HonorItem key={honor.title}>
      <HonorTitle>{honor.title}</HonorTitle>
      <RecipientsContainer>
        {honor.recipients.map((recipient, index) => (
          <React.Fragment key={`${recipient.name}-${recipient.year}`}>
            <RecipientName>{recipient.name}</RecipientName>
            <YearText>({recipient.year})</YearText>
            {index < honor.recipients.length - 1 && <Separator>•</Separator>}
          </React.Fragment>
        ))}
      </RecipientsContainer>
    </HonorItem>
  );

  return (
    <PageContainer>
      <PageTitle>Honors & Awards</PageTitle>
      
      <SectionContainer>
        <SectionTitle>Career Honors</SectionTitle>
        <div>
          {careerHonors.map(renderHonorItem)}
        </div>
      </SectionContainer>

      <SectionContainer>
        <SectionTitle>Best Paper Awards</SectionTitle>
        <div>
          {bestPaperAwards.map(renderHonorItem)}
        </div>
      </SectionContainer>
    </PageContainer>
  );
};

export default HonorsPage;