// bird-animations.js - Animation utility functions and constants

// Sprite sheet dimensions (based on studykeet_sprite.jpg analysis)
export const SPRITE_CONFIG = {
  frameWidth: 128,
  frameHeight: 128,
  totalCols: 7,
  totalRows: 8,
  sheetWidth: 896, // 7 * 128
  sheetHeight: 1024 // 8 * 128
};

// Animation timing constants
export const TIMING = {
  FLY_DURATION: 2500,     // Time to fly across screen
  LANDING_DURATION: 500,   // Landing animation
  BLINK_MIN: 3000,        // Minimum time between blinks
  BLINK_MAX: 8000,        // Maximum time between blinks
  TIP_INTERVAL: 15000,    // Study tip frequency
  TIP_CHANCE: 0.3,        // 30% chance of tip per interval
  REACTION_DELAY: 800     // Delay before speaking after react
};

// Calculate background position for sprite frame
export const getFramePosition = (row, col) => ({
  x: -col * SPRITE_CONFIG.frameWidth,
  y: -row * SPRITE_CONFIG.frameHeight
});

// Get random number within range
export const getRandomDelay = (min, max) => {
  return Math.random() * (max - min) + min;
};

// Calculate responsive sprite size
export const getResponsiveSize = () => {
  const isMobile = window.innerWidth <= 768;
  return {
    frameWidth: isMobile ? 96 : 128,
    frameHeight: isMobile ? 96 : 128,
    sheetWidth: isMobile ? 672 : 896,
    sheetHeight: isMobile ? 768 : 1024
  };
};

// Easing functions for smooth animations
export const easing = {
  easeInOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  easeOut: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
};

// Animation state validation
export const validateAnimationState = (state, validStates) => {
  return validStates.includes(state);
};

// Calculate optimal bird position based on container
export const calculateBirdPosition = (containerElement, offset = { x: 50, y: 50 }) => {
  if (!containerElement) {
    return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }
  
  const rect = containerElement.getBoundingClientRect();
  return {
    x: rect.left + offset.x,
    y: rect.top + offset.y
  };
};

// Speech bubble positioning
export const calculateBubblePosition = (birdPosition, bubbleWidth = 300) => {
  const screenWidth = window.innerWidth;
  const birdRight = birdPosition.x + SPRITE_CONFIG.frameWidth;
  
  // Position bubble to the right if there's space, otherwise to the left
  if (birdRight + bubbleWidth < screenWidth - 20) {
    return {
      x: birdRight + 20,
      y: birdPosition.y - 20,
      direction: 'right'
    };
  } else {
    return {
      x: birdPosition.x - bubbleWidth - 20,
      y: birdPosition.y - 20,
      direction: 'left'
    };
  }
};

// Performance optimization utilities
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};