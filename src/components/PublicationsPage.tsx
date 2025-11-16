import React from 'react';
import styled from '@emotion/styled';
import { Container } from 'react-bootstrap';

const PageWrapper = styled.div`
  min-height: 100vh;
  background: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
`;

const HeroSection = styled.div`
  background: linear-gradient(135deg, #990000 0%, #7a0000 100%);
  color: white;
  padding: 4rem 0;
  margin-bottom: 3rem;
  text-align: center;

  h1 {
    font-size: 3rem;
    font-weight: 300;
    margin-bottom: 1rem;
    letter-spacing: -0.02em;
  }

  p {
    font-size: 1.2rem;
    max-width: 800px;
    margin: 0 auto;
    opacity: 0.95;
    line-height: 1.6;
  }

  @media (max-width: 768px) {
    padding: 3rem 1rem;

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }
  }
`;

const ContentSection = styled.section`
  padding: 2rem 0;

  h2 {
    font-size: 2rem;
    font-weight: 600;
    color: #990000;
    margin-bottom: 2rem;
    margin-top: 3rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #990000;

    &:first-of-type {
      margin-top: 0;
    }
  }

  h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #333;
    margin-top: 2rem;
    margin-bottom: 1rem;
  }

  @media (max-width: 768px) {
    h2 {
      font-size: 1.5rem;
    }

    h3 {
      font-size: 1.1rem;
    }
  }
`;

const PublicationItem = styled.div`
  margin-bottom: 1.5rem;
  padding-left: 1.5rem;
  position: relative;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #990000;
    font-weight: bold;
  }

  .pub-title {
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .pub-authors {
    color: #666;
    font-size: 0.95rem;
    margin-bottom: 0.25rem;
  }

  .pub-venue {
    color: #888;
    font-size: 0.9rem;
    font-style: italic;
  }
`;

const PublicationsPage: React.FC = () => {
  return (
    <PageWrapper>
      <HeroSection>
        <Container>
          <h1>Publications</h1>
          <p>
            Research output from the USC Machine Learning Center spans cutting-edge
            machine learning theory, applications, and interdisciplinary collaborations
            across conferences and journals.
          </p>
        </Container>
      </HeroSection>

      <Container>
        <ContentSection>
          <h2>Conferences</h2>

          <h3>2024</h3>
          <PublicationItem>
            <div className="pub-title">
              Uncertainty Quantification for Forward and Inverse Problems of PDEs via Latent Global Evolution
            </div>
            <div className="pub-authors">Tailin Wu, Willie Neiswanger, Hongtao Zheng, Stefano Ermon, Jure Leskovec</div>
            <div className="pub-venue">AAAI Conference on Artificial Intelligence (AAAI), 2024</div>
          </PublicationItem>

          <h3>2023</h3>
          <PublicationItem>
            <div className="pub-title">
              Large Scale Financial Time Series Forecasting with Multi-faceted Model
            </div>
            <div className="pub-authors">Defu Cao, Furong Jia, Sercan Arik, Tomas Pfister, Yixiang Zheng, Wen Ye, Yan Liu</div>
            <div className="pub-venue">International Conference on AI in Finance (ICAIF), 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Hierarchical Gaussian Mixture based Task Generative Model for Robust Meta-Learning
            </div>
            <div className="pub-authors">Yizhou Zhang, Jingchao Ni, Wei Cheng, Zhengzhang Chen, Liang Tao, Haifeng Chen, Yan Liu</div>
            <div className="pub-venue">Conference on Neural Information Processing Systems (NeurIPS), 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              SVGformer: Representation Learning for Continuous Vector Graphics using Transformers
            </div>
            <div className="pub-authors">Pradyumna Reddy, Michael Gharbi, Michal Lukáč, Niloy J. Mitra</div>
            <div className="pub-venue">IEEE/CVF Conference on Computer Vision and Pattern Recognition (CVPR), 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Coupled Multiwavelet Neural Operator Learning for Coupled Partial Differential Equations
            </div>
            <div className="pub-authors">Xiaoyu Xie, Saviz Mowlavi, Mouhacine Benosman, Anima Anandkumar, Kamyar Azizzadenesheli, Samir Khurram</div>
            <div className="pub-venue">International Conference on Learning Representations (ICLR), 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Chain-of-Questions Training with Latent Answers for Robust Multistep Question Answering
            </div>
            <div className="pub-authors">Wang Zhu, Jesse Thomason, Robin Jia</div>
            <div className="pub-venue">Conference on Empirical Methods in Natural Language Processing (EMNLP), 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Estimating Large Language Model Capabilities without Labeled Test Data
            </div>
            <div className="pub-authors">Harvey Yiyun Fu, Qinyuan Ye, Albert Xu, Xiang Ren, Robin Jia</div>
            <div className="pub-venue">EMNLP Findings, 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Learning to Solve PDE-constrained Inverse Problems with Graph Networks
            </div>
            <div className="pub-authors">Zhao Chen, Liu Yang, Tao Du, Chuang Gan, Wojciech Matusik, Joshua B. Tenenbaum</div>
            <div className="pub-venue">International Conference on Machine Learning (ICML), 2023</div>
          </PublicationItem>

          <h3>2022</h3>
          <PublicationItem>
            <div className="pub-title">
              Physics-Informed Neural Operator for Learning Partial Differential Equations
            </div>
            <div className="pub-authors">Zongyi Li, Hongkai Zheng, Nikola Kovachki, David Jin, Haoxuan Chen, Burigede Liu, Kamyar Azizzadenesheli, Anima Anandkumar</div>
            <div className="pub-venue">AAAI Conference on Artificial Intelligence (AAAI), 2022</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Pre-training Graph Neural Networks for Few-Shot Analog Circuit Modeling and Design
            </div>
            <div className="pub-authors">Kourosh Hakhamaneshi, Marcel Nassar, Mariano Phielipp, Pieter Abbeel, Vladimir Stojanovic</div>
            <div className="pub-venue">Neural Information Processing Systems (NeurIPS), 2022</div>
          </PublicationItem>

          <h2>Journals</h2>

          <h3>2023</h3>
          <PublicationItem>
            <div className="pub-title">
              Interpretability and fairness evaluation of deep learning models on MIMIC-IV dataset
            </div>
            <div className="pub-authors">Chuizheng Meng, Loc Trinh, Nan Zhang, Jiangtao Wu, Yan Liu, Thanh N. Tran</div>
            <div className="pub-venue">Scientific Reports, 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Artificial intelligence foundation for therapeutic science
            </div>
            <div className="pub-authors">Kexin Huang, Tianfan Fu, Wenhao Gao, Yue Zhao, Yusuf Roohani, Jure Leskovec, Connor W. Coley, Cao Xiao, Jimeng Sun, Marinka Zitnik</div>
            <div className="pub-venue">Nature Chemical Biology, 2023</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Scalable interpretable multi-response regression via SEED
            </div>
            <div className="pub-authors">Jinzhu Jia, Karl Rohe, Bin Yu</div>
            <div className="pub-venue">Journal of Machine Learning Research, 2023</div>
          </PublicationItem>

          <h3>2022</h3>
          <PublicationItem>
            <div className="pub-title">
              RANK: large-scale inference with graphical nonlinear knockoffs
            </div>
            <div className="pub-authors">Yingying Fan, Emre Demirkaya, Gaorong Li, Jinchi Lv</div>
            <div className="pub-venue">Journal of the American Statistical Association, 2022</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Nonuniformity of p-values can occur early in diverging dimensions
            </div>
            <div className="pub-authors">Yingying Fan, Jinchi Lv, Mahrad Sharifvaghefi, Yoshimasa Uematsu</div>
            <div className="pub-venue">Journal of Machine Learning Research, 2022</div>
          </PublicationItem>

          <PublicationItem>
            <div className="pub-title">
              Deep learning for multi-messenger astrophysics: A gateway for discovery in the big data era
            </div>
            <div className="pub-authors">Gabriella Contardo, Michael Auge, Zhongyi Han, Juhan Frank, Todd Thompson, Alexis Lioutas, Shirley Ho, Patrick Huber, Eren Kocaman, Elham E. Khoda</div>
            <div className="pub-venue">Physics Reports, 2022</div>
          </PublicationItem>

          <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ color: '#666', fontSize: '0.95rem', margin: 0 }}>
              For a complete and up-to-date list of publications, please visit{' '}
              <a href="https://mascle.usc.edu/research/publications/" style={{ color: '#990000', textDecoration: 'none', fontWeight: 500 }}>
                mascle.usc.edu/research/publications
              </a>
            </p>
          </div>
        </ContentSection>
      </Container>
    </PageWrapper>
  );
};

export default PublicationsPage;
