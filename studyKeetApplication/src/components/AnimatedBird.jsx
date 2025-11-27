import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useToast } from '@chakra-ui/react';
import './AnimatedBird.css';
import birdSprite from '/assets/images/studykeet_sprite.png';
import parrotFallback from '/assets/images/parrot.png';

// Sprite sheet grid dimensions (456x521 = 7 cols x 8 rows)
const SPRITE_COLS = 7;
const SPRITE_ROWS = 8;

// Bird animation states
const BIRD_STATES = {
  FLY_IN: 'fly-in',
  LANDING: 'landing', 
  IDLE: 'idle',
  BLINKING: 'blinking',
  REACTING: 'reacting',
  SPEAKING: 'speaking'
};

// Animation frame definitions for 7x8 sprite grid
const ANIMATIONS = {
  [BIRD_STATES.FLY_IN]: {
    frames: [
      // Row 0: Flying wing flaps (7 columns max)
      ...Array(7).map((_, i) => ({ row: 0, col: i })),
      // Row 5: Additional flying transitions  
      ...Array(7).map((_, i) => ({ row: 5, col: i }))
    ],
    duration: 60,
    loop: true
  },
  [BIRD_STATES.LANDING]: {
    frames: [
      // Row 0: Landing sequence (adjust for 7 cols)
      { row: 0, col: 4 },
      { row: 0, col: 5 },
      { row: 0, col: 6 }
    ],
    duration: 80,
    loop: false
  },
  [BIRD_STATES.IDLE]: {
    frames: [
      // Row 1: Idle looking forward
      { row: 1, col: 0 },
      { row: 1, col: 1 },
      { row: 1, col: 2 },
      // Row 2: Idle shifting
      { row: 2, col: 0 },
      { row: 2, col: 1 },
      { row: 2, col: 2 }
    ],
    duration: 400,
    loop: true
  },
  [BIRD_STATES.BLINKING]: {
    frames: [
      // Row 2: Blink sequence
      { row: 2, col: 2 },
      { row: 2, col: 3 },
      { row: 2, col: 2 }
    ],
    duration: 80,
    loop: false
  },
  [BIRD_STATES.REACTING]: {
    frames: [
      // Row 6: Reaction expressions
      { row: 6, col: 0 },
      { row: 6, col: 1 },
      { row: 6, col: 2 }
    ],
    duration: 300,
    loop: false
  },
  [BIRD_STATES.SPEAKING]: {
    frames: [
      // Row 6: Speaking/mouth movements
      { row: 6, col: 3 },
      { row: 6, col: 4 },
      { row: 6, col: 5 },
      { row: 6, col: 6 }
    ],
    duration: 400,
    loop: true
  }
};

// Study tips that the bird can share
const STUDY_TIPS = [
  "💡 Take breaks every 25 minutes for better focus!",
  "🧠 Try explaining concepts out loud - it helps memory!",
  "📝 Writing notes by hand improves retention!",
  "🎯 Set specific goals for each study session!",
  "🔄 Review materials within 24 hours to strengthen memory!",
  "🌟 Find your peak focus hours and use them wisely!",
  "🎵 Some people focus better with background music!",
  "💤 Get enough sleep - your brain consolidates memories while you rest!"
];

export default function AnimatedBird({ 
  targetPosition = { x: 400, y: 200 }, 
  onBirdClick, 
  showTips = true,
  autoFlyIn = true 
}) {
  const [currentState, setCurrentState] = useState(BIRD_STATES.FLY_IN);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [position, setPosition] = useState({ x: window.innerWidth + 100, y: targetPosition.y });
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const toast = useToast();

  // Measure the sprite sheet once to get correct frame dimensions
  useEffect(() => {
    const img = new Image();
    img.src = birdSprite;
    img.onload = () => {
      console.log('Sprite loaded:', img.width, 'x', img.height);
      setFrameWidth(img.width / SPRITE_COLS);  // 12 columns
      setFrameHeight(img.height / SPRITE_ROWS); // 8 rows
    };
    img.onerror = () => {
      console.log('Sprite failed to load, using fallback');
      setUseFallback(true);
      setFrameWidth(64); // Fallback size
      setFrameHeight(64);
    };
  }, []);

  // Frame animation effect
  useEffect(() => {
    const animation = ANIMATIONS[currentState];
    if (!animation) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1;
        if (nextFrame >= animation.frames.length) {
          if (animation.loop) {
            return 0;
          } else {
            // Animation finished, transition to next state
            clearInterval(interval);
            handleAnimationEnd();
            return prev;
          }
        }
        return nextFrame;
      });
    }, animation.duration);

    return () => clearInterval(interval);
  }, [currentState]);

  // Handle animation state transitions
  const handleAnimationEnd = useCallback(() => {
    switch (currentState) {
      case BIRD_STATES.LANDING:
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
        scheduleRandomBlink();
        break;
      case BIRD_STATES.BLINKING:
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
        scheduleRandomBlink();
        break;
      case BIRD_STATES.REACTING:
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
        scheduleRandomBlink();
        break;
      case BIRD_STATES.SPEAKING:
        setShowMessage(false);
        setTimeout(() => {
          setCurrentState(BIRD_STATES.IDLE);
          setCurrentFrame(0);
          scheduleRandomBlink();
        }, 1000);
        break;
      default:
        break;
    }
  }, [currentState]);

  // Schedule random blink
  const scheduleRandomBlink = useCallback(() => {
    if (currentState !== BIRD_STATES.IDLE) return;
    
    const randomDelay = Math.random() * 5000 + 3000; // 3-8 seconds
    setTimeout(() => {
      if (currentState === BIRD_STATES.IDLE) {
        setCurrentState(BIRD_STATES.BLINKING);
        setCurrentFrame(0);
      }
    }, randomDelay);
  }, [currentState]);

  // Schedule random study tips
  useEffect(() => {
    if (!showTips || !isVisible) return;

    const tipInterval = setInterval(() => {
      if (currentState === BIRD_STATES.IDLE && Math.random() < 0.3) { // 30% chance
        const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
        setCurrentMessage(randomTip);
        setShowMessage(true);
        setCurrentState(BIRD_STATES.SPEAKING);
        setCurrentFrame(0);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(tipInterval);
  }, [currentState, isVisible, showTips]);

  // Fly in animation
  useEffect(() => {
    if (autoFlyIn) {
      // Start immediately for testing
      setIsVisible(true);
      setPosition({ x: targetPosition.x, y: targetPosition.y });
      setCurrentState(BIRD_STATES.IDLE);
    } else {
      setIsVisible(true);
    }
  }, [autoFlyIn, targetPosition]);

  // Handle bird click
  const handleBirdClick = () => {
    if (currentState === BIRD_STATES.IDLE || currentState === BIRD_STATES.BLINKING) {
      setCurrentState(BIRD_STATES.REACTING);
      setCurrentFrame(0);
      
      // Show a random study tip
      const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
      setCurrentMessage(randomTip);
      setShowMessage(true);
      
      setTimeout(() => {
        setCurrentState(BIRD_STATES.SPEAKING);
        setCurrentFrame(0);
      }, 800);
      
      if (onBirdClick) onBirdClick();
    }
  };

  // Don't render until we know the sprite dimensions
  if (!isVisible || (!frameWidth && !useFallback)) return null;

  const animation = ANIMATIONS[currentState];
  const frame = animation?.frames[currentFrame] || { row: 0, col: 0 };
  
  // Calculate trimmed positioning - add 2px offset to remove grid borders
  const trimOffset = 2;
  const bgPosX = useFallback ? 'center' : `-${(frame.col * frameWidth) + trimOffset}px`;
  const bgPosY = useFallback ? 'center' : `-${(frame.row * frameHeight) + trimOffset}px`;
  const backgroundPosition = useFallback ? 'center' : `${bgPosX} ${bgPosY}`;
  
  // Add some debugging
  console.log('AnimatedBird rendering:', { 
    isVisible, 
    currentState, 
    position, 
    frame,
    useFallback 
  });
  
  return (
    <Box position="relative">
      {/* Debug text */}
      <Box
        position="absolute"
        left="50px"
        top="50px"
        bg="yellow"
        p={2}
        zIndex={2000}
        borderRadius="md"
        fontSize="sm"
      >
        Bird Debug: {currentState} | Pos: {position.x},{position.y} | Visible: {isVisible.toString()}
      </Box>
      
      {/* Bird Sprite - with fallback */}
      <Box
        className={`animated-bird ${currentState}`}
        position="absolute"
        width={useFallback ? "64px" : `${Math.round(frameWidth)}px`}
        height={useFallback ? "64px" : `${Math.round(frameHeight)}px`}
        cursor="pointer"
        onClick={handleBirdClick}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          backgroundImage: useFallback ? `url(${parrotFallback})` : `url(${birdSprite})`,
          backgroundPosition: backgroundPosition,
          backgroundSize: useFallback ? 'contain' : `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`, // 7 cols × 8 rows
          backgroundRepeat: 'no-repeat',
          transition: currentState === BIRD_STATES.FLY_IN ? 'left 2.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          zIndex: 1000,
          imageRendering: 'pixelated', // For crisp sprite rendering
          border: 'none', // Remove any borders that cause shifting
          outline: 'none' // Remove outline too
        }}
        _hover={{
          transform: 'scale(1.05)',
          transition: 'transform 0.2s ease'
        }}
        onError={() => {
          console.log('Bird sprite failed to load, using fallback');
          setUseFallback(true);
        }}
      />
      
      {/* Speech Bubble - positioned below bird when it's at top */}
      {showMessage && (
        <Box
          position="absolute"
          left={`${position.x + 140}px`}
          top={`${position.y + 130}px`}
          maxWidth="300px"
          bg="white"
          border="2px solid"
          borderColor="teal.300"
          borderRadius="xl"
          p={3}
          boxShadow="lg"
          zIndex={1001}
          _before={{
            content: '""',
            position: 'absolute',
            left: '-10px',
            top: '20px',
            width: 0,
            height: 0,
            borderTop: '10px solid transparent',
            borderBottom: '10px solid transparent',
            borderRight: '10px solid',
            borderRightColor: 'teal.300'
          }}
          _after={{
            content: '""',
            position: 'absolute',
            left: '-8px',
            top: '22px',
            width: 0,
            height: 0,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid white'
          }}
        >
          <Text fontSize="sm" color="gray.700" fontWeight="medium">
            {currentMessage}
          </Text>
        </Box>
      )}
    </Box>
  );
}