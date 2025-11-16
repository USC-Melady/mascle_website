import React, { useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Link } from 'react-router-dom';

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

const PageWrapper = styled.div`
  min-height: 100vh;
  background: #ffffff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: -2rem;
  padding: 0;
  color: #111;

  @media (max-width: 991px) {
    margin: -1rem;
  }
`;

// Full-height hero section with particle animation
const HeroSection = styled.div`
  position: relative;
  height: 100vh;
  min-height: 600px;
  background: linear-gradient(180deg, #ffffff 0%, #fff5f5 100%);
  overflow: hidden;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  display: flex;
  align-items: center;
  justify-content: center;

  canvas {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .hero-content {
    position: relative;
    z-index: 10;
    text-align: center;
    padding: 2rem;
    max-width: 900px;
  }

  h1 {
    font-size: 4.5rem;
    font-weight: 700;
    color: #111;
    margin-bottom: 1.5rem;
    line-height: 1.1;
    letter-spacing: -0.02em;
    animation: ${fadeIn} 1s ease-out;

    @media (max-width: 768px) {
      font-size: 2.8rem;
    }
  }

  .subtitle {
  font-size: 1.4rem;
  color: rgba(0, 0, 0, 0.75);
    margin-bottom: 2.5rem;
    line-height: 1.6;
    font-weight: 300;
    animation: ${fadeIn} 1s ease-out 0.2s both;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }
  }

  .cta-buttons {
    display: flex;
    gap: 1.5rem;
    justify-content: center;
    animation: ${fadeIn} 1s ease-out 0.4s both;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
    }
  }
`;

const CTAButton = styled(Link)`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: inline-block;

  &.primary {
    background: linear-gradient(135deg, #990000, #cc0000);
    color: white;
    box-shadow: 0 4px 15px rgba(153, 0, 0, 0.4);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(153, 0, 0, 0.6);
    }
  }

  &.secondary {
    background: transparent;
    color: #111;
    border: 2px solid rgba(0, 0, 0, 0.08);

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      border-color: rgba(0, 0, 0, 0.12);
    }
  }
`;

const ContentWrapper = styled.div`
  background: #ffffff;
  color: #111;
`;

const Section = styled.section`
  max-width: 1400px;
  margin: 0 auto;
  padding: 6rem 3rem;

  @media (max-width: 768px) {
    padding: 4rem 1.5rem;
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
  }

    h2 {
    font-size: 3rem;
    font-weight: 700;
    color: #111;
    margin: 0;
    line-height: 1.2;

    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }

  .description {
  font-size: 1.2rem;
  color: rgba(0, 0, 0, 0.65);
    margin-top: 1rem;
    max-width: 800px;
    margin-left: auto;
    margin-right: auto;

    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 3rem;
  text-align: center;
  padding: 4rem 0;
`;

const StatCard = styled.div`
  padding: 2rem;
  background: rgba(153, 0, 0, 0.06);
  border: 1px solid rgba(153, 0, 0, 0.12);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: rgba(153, 0, 0, 0.08);
    border-color: rgba(153, 0, 0, 0.18);
  }

  .number {
    font-size: 3.5rem;
    font-weight: 700;
    color: #990000;
    margin-bottom: 0.5rem;
    line-height: 1;
  }

  .label {
    color: rgba(0, 0, 0, 0.7);
    font-weight: 400;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
`;

const ResearchGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ResearchCard = styled.div`
  padding: 2.5rem;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    background: #fff7f7;
    border-color: rgba(153, 0, 0, 0.12);
    box-shadow: 0 8px 30px rgba(153, 0, 0, 0.06);
  }

  h3 {
    color: #990000;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-weight: 600;
  }

  p {
    color: rgba(0, 0, 0, 0.7);
    line-height: 1.7;
    margin: 0;
    font-size: 1.05rem;
  }
`;

const NewsGrid = styled.div`
  display: grid;
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const NewsItem = styled.div`
  background: #ffffff;
  padding: 2rem;
  border-left: 4px solid #990000;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(10px);
    background: #fff7f7;
    box-shadow: 0 4px 20px rgba(153, 0, 0, 0.06);
  }

  .date {
    color: #990000;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .title {
    color: #111;
    font-size: 1.2rem;
    font-weight: 500;
    margin: 0;
    line-height: 1.5;
  }
`;

interface BinaryStream {
  x: number;
  y: number;
  speed: number;
  color: string;
  digits: string;
  opacity: number;
  fontSize: number;
}

interface FlowLine {
  x: number;
  y: number;
  length: number;
  speed: number;
  color: string;
  opacity: number;
  sourceStream: number; // Which stream this line came from
}

interface Neuron {
  x: number;
  y: number;
  color: string;
  opacity: number;
  pulse: number; // For pulsing animation
  radius: number;
  flicker: number; // For flicker effect when pulse hits
}

interface ConnectionLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  controlPoint1X: number;
  controlPoint1Y: number;
  controlPoint2X: number;
  controlPoint2Y: number;
  pulsePosition: number; // 0 to 1, position of pulse along the curve
}

// Palette inspired by neural network visualization
const STREAM_COLORS = [
  '#00FFD1', // Cyan
  '#FF00FF', // Magenta
  '#FFD700', // Gold/Yellow
  '#00D4FF', // Light Blue
  '#FF1493', // Deep Pink
  '#7B68EE', // Medium Slate Blue
];

function hexToRgb(hex: string) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

const MainContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamsRef = useRef<BinaryStream[]>([]);
  const flowLinesRef = useRef<FlowLine[]>([]);
  const neuronsRef = useRef<Neuron[]>([]);
  const connectionLinesRef = useRef<ConnectionLine[]>([]);
  const animationFrameRef = useRef<number>();
  const pulseTimerRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Generate random binary string
    const generateBinaryString = (length: number): string => {
      return Array.from({ length }, () => Math.random() > 0.5 ? '1' : '0').join('');
    };

    const streamCount = 3;
    const streamColors = [STREAM_COLORS[0], STREAM_COLORS[1], STREAM_COLORS[4]]; // Cyan, Magenta, Deep Pink
    const verticalPositions = [0.25, 0.5, 0.75]; // Top, middle, bottom
  const inputSpeed = 0.4; // slower input binary speed (was 1.0)
  const outputSpeed = 0.25; // slower output binary speed
    const binaryStringLength = 150; // Fixed length for all streams
    const neuronLayers = 5;
    const neuronsPerLayer = 24;

    // Function to initialize/reinitialize all elements based on canvas size
    const initializeElements = () => {
      const oneThirdWidth = canvas.width / 3;
      
      // Initialize input binary streams
      const streams: BinaryStream[] = [];
      for (let i = 0; i < streamCount; i++) {
        streams.push({
          x: i === 0 ? 0 : (i === 1 ? oneThirdWidth * 0.33 : oneThirdWidth * 0.66),
          y: canvas.height * verticalPositions[i],
          speed: inputSpeed,
          color: streamColors[i],
          digits: generateBinaryString(binaryStringLength),
          opacity: 0.7,
          fontSize: 16,
        });
      }
      streamsRef.current = streams;
      
      flowLinesRef.current = [];

      // Initialize neurons - using relative positioning
      const initialNeurons: Neuron[] = [];
      const neuronStartX = oneThirdWidth + canvas.width * 0.15; // Relative to canvas width
      const totalLayerWidth = canvas.width * 0.08; // 8% of canvas width
      const layerSpacing = totalLayerWidth / (neuronLayers - 1);
      const verticalSpacing = canvas.height / (neuronsPerLayer + 1);
      
      for (let layer = 0; layer < neuronLayers; layer++) {
        const x = neuronStartX + (layer * layerSpacing);
        
        for (let row = 0; row < neuronsPerLayer; row++) {
          const y = verticalSpacing * (row + 1);
          const colorIdx = Math.floor(Math.random() * streamColors.length);
          
          initialNeurons.push({
            x: x,
            y: y,
            color: streamColors[colorIdx],
            opacity: 0.7 + Math.random() * 0.3,
            pulse: Math.random() * Math.PI * 2,
            radius: 1.5 + Math.random() * 0.3,
            flicker: 0
          });
        }
      }
      neuronsRef.current = initialNeurons;
      
      // Create output streams from final layer
      const outputStreams: BinaryStream[] = [];
      const finalLayerX = neuronStartX + totalLayerWidth;
      const finalLayerNeurons = initialNeurons.filter((_, idx) => {
        const layer = Math.floor(idx / neuronsPerLayer);
        return layer === neuronLayers - 1;
      });
      
      finalLayerNeurons.forEach((neuron) => {
        outputStreams.push({
          x: finalLayerX + canvas.width * 0.05, // Relative gap
          y: neuron.y,
    speed: outputSpeed,
          color: neuron.color,
          digits: generateBinaryString(binaryStringLength),
          opacity: 0.5,
          fontSize: 12,
        });
      });
      
      // Create connection lines
      const connectionLines: ConnectionLine[] = [];
      const firstLayerNeurons = initialNeurons.filter((_, idx) => idx < neuronsPerLayer);
      const binaryStreamEndX = oneThirdWidth + canvas.width * 0.05; // Relative
      
      for (let streamIdx = 0; streamIdx < streamCount; streamIdx++) {
        const streamY = canvas.height * verticalPositions[streamIdx];
        const streamColor = streamColors[streamIdx];
        const startX = binaryStreamEndX;
        
        const neuronsToConnect = 12;
        const startNeuronIdx = Math.floor(streamIdx * neuronsPerLayer / streamCount);
        
        for (let i = 0; i < neuronsToConnect; i++) {
          const neuronIdx = (startNeuronIdx + i) % neuronsPerLayer;
          const neuron = firstLayerNeurons[neuronIdx];
          
          const distance = neuron.x - startX;
          const verticalDiff = neuron.y - streamY;
          const curvature = distance * 0.4;
          const verticalCurvature = Math.abs(verticalDiff) * 0.6;
          
          connectionLines.push({
            startX: startX,
            startY: streamY,
            endX: neuron.x,
            endY: neuron.y,
            color: streamColor,
            controlPoint1X: startX + curvature,
            controlPoint1Y: streamY + verticalDiff * 0.3 + (Math.random() - 0.5) * verticalCurvature,
            controlPoint2X: neuron.x - curvature,
            controlPoint2Y: neuron.y - verticalDiff * 0.3 + (Math.random() - 0.5) * verticalCurvature,
            pulsePosition: Math.random()
          });
        }
      }
      connectionLinesRef.current = connectionLines;
      
      return { outputStreams, finalLayerX };
    };

    // Set canvas size and initialize elements
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const { outputStreams, finalLayerX } = initializeElements();
      (window as any).outputStreams = outputStreams;
      (window as any).finalLayerX = finalLayerX;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      const oneThirdWidth = canvas.width / 3;
      const streams = streamsRef.current;
      const neurons = neuronsRef.current;
      const connectionLines = connectionLinesRef.current;
  const outputStreams: BinaryStream[] = (window as any).outputStreams || [];
      const finalLayerX = (window as any).finalLayerX || canvas.width * 0.8;
      
      // Update pulse timer (60 fps, so 600 frames = 10 seconds)
      pulseTimerRef.current += 1;
      if (pulseTimerRef.current >= 600) {
        pulseTimerRef.current = 0;
      }
      
      // Light background with slight fade for trail effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw static curved connection lines with pulses
      connectionLines.forEach(line => {
        const { r, g, b } = hexToRgb(line.color);
        
        // Draw the static curved line
        ctx.beginPath();
        ctx.moveTo(line.startX, line.startY);
        ctx.bezierCurveTo(
          line.controlPoint1X, line.controlPoint1Y,
          line.controlPoint2X, line.controlPoint2Y,
          line.endX, line.endY
        );
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw pulse every 10 seconds
        if (pulseTimerRef.current < 120) { // Pulse lasts 2 seconds out of every 10
          const pulseProgress = pulseTimerRef.current / 360; // Divide by 360 instead of 120 to make it 1/3rd speed
          
          // Calculate position on bezier curve
          const t = (line.pulsePosition + pulseProgress) % 1;
          const mt = 1 - t;
          const mt2 = mt * mt;
          const mt3 = mt2 * mt;
          const t2 = t * t;
          const t3 = t2 * t;
          
          const pulseX = mt3 * line.startX + 
                        3 * mt2 * t * line.controlPoint1X + 
                        3 * mt * t2 * line.controlPoint2X + 
                        t3 * line.endX;
          const pulseY = mt3 * line.startY + 
                        3 * mt2 * t * line.controlPoint1Y + 
                        3 * mt * t2 * line.controlPoint2Y + 
                        t3 * line.endY;
          
          // When pulse reaches the end (t > 0.9), trigger flicker on target neuron
          if (t > 0.9) {
            // Find the neuron at the end of this line
            const targetNeuron = neurons.find(n => 
              Math.abs(n.x - line.endX) < 1 && Math.abs(n.y - line.endY) < 1
            );
            if (targetNeuron && targetNeuron.flicker === 0) {
              targetNeuron.flicker = 1; // Trigger flicker
            }
          }
          
          // Draw small thin pulse - similar to line thickness
          const gradient = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 3);
          gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
          gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.6)`);
          gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Update and draw binary streams - continuous flow without breaks
      streams.forEach((stream) => {
  // Move stream to the right using stream-specific speed
  stream.x += stream.speed;

        // Draw the binary digits
        ctx.font = `${stream.fontSize}px "Courier New", monospace`;
        ctx.textBaseline = 'middle';
        
        const { r, g, b } = hexToRgb(stream.color);
        
        // Draw glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = stream.color;
        
        // Draw each digit with slight spacing - create infinite loop by wrapping
        const charSpacing = stream.fontSize * 0.6;
        const stringWidth = stream.digits.length * charSpacing;
        
        // Wrap position to create seamless loop
        const wrappedX = stream.x % stringWidth;
        
        // Draw the string multiple times to ensure seamless coverage
        for (let offset = -1; offset <= 1; offset++) {
          const baseX = wrappedX + (offset * stringWidth);
          
          for (let i = 0; i < stream.digits.length; i++) {
            const charX = baseX + i * charSpacing;
            
            // Only draw if on screen and in first 1/3 (using relative calculation)
            if (charX > -50 && charX < oneThirdWidth + canvas.width * 0.05) {
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${stream.opacity})`;
              ctx.fillText(stream.digits[i], charX, stream.y);
            }
          }
        }
        
        ctx.shadowBlur = 0;
      });

      // Draw neurons with flicker effect
      neurons.forEach(neuron => {
        // Update pulse animation - slower and more subtle
        neuron.pulse += 0.02;
        const pulseFactor = 0.9 + Math.sin(neuron.pulse) * 0.1; // Reduced pulse range
        
        // Update flicker effect
        if (neuron.flicker > 0) {
          neuron.flicker -= 0.05; // Fade out flicker
          if (neuron.flicker < 0) neuron.flicker = 0;
        }
        
        const { r, g, b } = hexToRgb(neuron.color);
        
        // Apply flicker boost to opacity and size
        const flickerBoost = neuron.flicker * 0.5;
        const effectiveOpacity = Math.min(1, neuron.opacity + flickerBoost);
        const effectiveRadius = neuron.radius * (1 + flickerBoost);
        
        // Create radial gradient for glow effect - adjusted for smaller neurons
        const gradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, effectiveRadius * 2.5
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${effectiveOpacity})`);
        gradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${effectiveOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        // Draw outer glow
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, effectiveRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw core - more stable, less pulsing
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${effectiveOpacity})`;
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, effectiveRadius * pulseFactor, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw output binary streams from final neuron layer
      outputStreams.forEach((stream) => {
  // Move stream to the right using stream-specific speed
  stream.x += stream.speed;

        // Draw the binary digits
        ctx.font = `${stream.fontSize}px "Courier New", monospace`;
        ctx.textBaseline = 'middle';
        
        const { r, g, b } = hexToRgb(stream.color);
        
        // Draw glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = stream.color;
        
        // Draw each digit with slight spacing
        const charSpacing = stream.fontSize * 0.6;
        const stringWidth = stream.digits.length * charSpacing;
        
        // Wrap position to create seamless loop
        const wrappedX = stream.x % stringWidth;
        
        // Draw the string multiple times to ensure seamless coverage
        for (let offset = -1; offset <= 1; offset++) {
          const baseX = wrappedX + (offset * stringWidth);
          
          for (let i = 0; i < stream.digits.length; i++) {
            const charX = baseX + i * charSpacing;
            
            // Draw if on screen (from final layer to right edge)
            if (charX > finalLayerX && charX < canvas.width + 50) {
              ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${stream.opacity})`;
              ctx.fillText(stream.digits[i], charX, stream.y);
            }
          }
        }
        
        ctx.shadowBlur = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <PageWrapper>
      <HeroSection>
        <canvas ref={canvasRef} />
        <div className="hero-content">
          <h1>USC Machine Learning Center</h1>
          <p className="subtitle">
            Advancing the frontiers of machine learning research through interdisciplinary
            collaboration and innovative computational approaches to society's greatest challenges.
          </p>
          <div className="cta-buttons">
            <CTAButton to="/about" className="primary">Learn More</CTAButton>
            <CTAButton to="/labs" className="secondary">Research Labs</CTAButton>
          </div>
        </div>
      </HeroSection>

      <ContentWrapper>
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
      </ContentWrapper>
    </PageWrapper>
  );
};

export default MainContent;
