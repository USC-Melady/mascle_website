import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';

interface SlideImage {
  src: string;
  alt: string;
}

interface ImageSliderProps {
  images: SlideImage[];
  autoPlay?: boolean;
  interval?: number;
  showThumbs?: boolean;
  showStatus?: boolean;
  infiniteLoop?: boolean;
}

const SliderContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  
  .carousel-root {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  
  .carousel {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  
  .carousel .slide {
    background-color: transparent;
    padding: 0;
    margin: 0;
  }

  .carousel .slide img {
    width: 100%;
    max-height: 550px;
    object-fit: cover;
    object-position: 50% 55%;
    margin: 0;
    padding: 0;
  }

  .carousel .control-dots {
    bottom: 20px;
    z-index: 2;
  }

  .carousel .control-dots .dot {
    background: #990000;
    box-shadow: 0 1px 2px rgba(0,0,0,0.5);
    width: 10px;
    height: 10px;
    margin: 0 5px;
  }

  .carousel .control-arrow {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    opacity: 0.8;
    transition: opacity 0.2s;
    z-index: 2;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    
    &:hover {
      opacity: 1;
      background: rgba(0, 0, 0, 0.4);
    }
  }
  
  .carousel .control-prev {
    left: 20px;
  }
  
  .carousel .control-next {
    right: 20px;
  }
`;

// CSS reset to ensure no margins/padding on parent elements
const GlobalReset = () => (
  <Global
    styles={css`
      body, html {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
      }
    `}
  />
);

const ImageSlider: React.FC<ImageSliderProps> = ({
  images,
  autoPlay = true,
  interval = 5000,
  showThumbs = false,
  showStatus = false,
  infiniteLoop = true,
}) => {
  return (
    <SliderContainer>
      <GlobalReset />
      <Carousel
        autoPlay={autoPlay}
        interval={interval}
        showThumbs={showThumbs}
        showStatus={showStatus}
        infiniteLoop={infiniteLoop}
        dynamicHeight={false}
        emulateTouch={true}
        showArrows={true}
        showIndicators={true}
        useKeyboardArrows={true}
        preventMovementUntilSwipeScrollTolerance={true}
        swipeScrollTolerance={50}
      >
        {images.map((image, index) => (
          <div key={index}>
            <img src={image.src} alt={image.alt} />
          </div>
        ))}
      </Carousel>
    </SliderContainer>
  );
};

export default ImageSlider; 