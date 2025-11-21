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
  background: #0a0a0a;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  margin: -2rem;
  padding: 0;
  color: white;

  @media (max-width: 991px) {
    margin: -1rem;
  }
`;

// Full-height hero section with particle animation
const HeroSection = styled.div`
  position: relative;
  height: 85vh;
  min-height: 500px;
  max-height: 700px;
  margin-top: 3rem;
  margin-bottom: 2rem;
  background: linear-gradient(180deg, #000000 0%, #1a0000 100%);
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
    color: white;
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
    color: rgba(255, 255, 255, 0.85);
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
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.5);
    }
  }
`;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  parallaxOffsetX: number;
  parallaxOffsetY: number;
  parallaxTargX: number;
  parallaxTargY: number;
  layer: number;
}

const MainContent: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles with parallax properties
    const particleCount = 100;
    const particles: Particle[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        parallaxOffsetX: 0,
        parallaxOffsetY: 0,
        parallaxTargX: 0,
        parallaxTargY: 0,
        layer: Math.ceil(Math.random() * 3)
      });
    }
    particlesRef.current = particles;

    // Track mouse movement for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.pageX, y: e.pageY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Animation loop
    const animate = () => {
      // Clear canvas completely (no blur/trail effect)
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const winW = window.innerWidth;
      const winH = window.innerHeight;
      const parallaxMultiplier = 5;

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Calculate parallax offsets with easing
        particle.parallaxTargX = (mouseRef.current.x - (winW / 2)) / (parallaxMultiplier * particle.layer);
        particle.parallaxOffsetX += (particle.parallaxTargX - particle.parallaxOffsetX) / 10; // Easing equation
        
        particle.parallaxTargY = (mouseRef.current.y - (winH / 2)) / (parallaxMultiplier * particle.layer);
        particle.parallaxOffsetY += (particle.parallaxTargY - particle.parallaxOffsetY) / 10; // Easing equation

        // Draw particle with parallax offset
        ctx.beginPath();
        ctx.arc(particle.x + particle.parallaxOffsetX, particle.y + particle.parallaxOffsetY, particle.radius * 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(153, 0, 0, 0.9)';
        ctx.fill();

        // Draw connections with parallax offset
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x;
          const dy = particles[j].y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x + particle.parallaxOffsetX, particle.y + particle.parallaxOffsetY);
            ctx.lineTo(particles[j].x + particles[j].parallaxOffsetX, particles[j].y + particles[j].parallaxOffsetY);
            ctx.strokeStyle = `rgba(153, 0, 0, ${0.6 * (1 - distance / 120)})`;
            ctx.lineWidth = 1.8;
            ctx.stroke();
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
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
    </PageWrapper>
  );
};

export default MainContent;