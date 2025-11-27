import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
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
  PERCH: 'perch',
  REST: 'rest',
  IDLE: 'idle',
  BLINKING: 'blinking',
  REACTING: 'reacting',
  SPEAKING: 'speaking'
};

// Animation frame definitions for 7x8 sprite grid
const ANIMATIONS = {
  [BIRD_STATES.FLY_IN]: {
    frames: [
      // Flying (loop): row 0 col 0,1,2,1,0
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 1 },
    ],
    duration: 40, // Slower animation (was 30ms)
    loop: true
  },
  [BIRD_STATES.LANDING]: {
    frames: [
      // Landing (once): row 0 col 3,4,5
      { row: 0, col: 3 },
      { row: 0, col: 4 },
      { row: 0, col: 5 }
    ],
    duration: 100, // Slower animation (was 35ms)
    loop: false
  },
  [BIRD_STATES.PERCH]: {
    frames: [
      // Perching bounce - static frame during bounce
      { row: 1, col: 0 }
    ],
    duration: 200, // Slower animation (was 100ms)
    loop: false
  },
  [BIRD_STATES.IDLE]: {
    frames: [], // Will be set dynamically by random pattern
    duration: 200, // Slower animation (was 180ms)
    loop: false
  },
  [BIRD_STATES.BLINKING]: {
    frames: [
      // Blinking (once): row 2 col 3,4,5
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 }
    ],
    duration: 200, // Slower animation (was 35ms)
    loop: false
  },
  [BIRD_STATES.REACTING]: {
    frames: [
      // Row 6: Reaction expressions
      { row: 2, col: 3 },
      { row: 2, col: 4 },
      { row: 2, col: 5 }
    ],
    duration: 50,
    loop: false
  },
  [BIRD_STATES.SPEAKING]: {
    frames: [
      // Row 6: Speaking/mouth movements
      { row: 2, col: 5 },
      { row: 2, col: 6 },
      { row: 2, col: 5 },
      { row: 2, col: 6 }
    ],
    duration: 300,
    loop: true
  }
};

// Idle animation patterns
const IDLE_PATTERNS = [
  // Pattern A: row1 col 0,1,2,1,0
  [
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 1, col: 1 },
    { row: 1, col: 0 }
  ],
  // Pattern B: row1 col 0,3,4,3,0  
  [
    { row: 1, col: 0 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    { row: 1, col: 3 },
    { row: 1, col: 0 }
  ],
  // Pattern C: row1 col 0,5,6,5,0
  [
    { row: 1, col: 0 },
    { row: 1, col: 5 },
    { row: 1, col: 6 },
    { row: 1, col: 5 },
    { row: 1, col: 0 }
  ],
  // Pattern D: row1 col 0 → row2 col 0,1,2,1,0 → row1 col 0
  [
    { row: 1, col: 0 },
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 1 },
    { row: 2, col: 0 },
    { row: 1, col: 0 }
  ],
  // Pattern E: row1 col 0 → row3 col0,1,2,3,2,1,0 -> row1 col 0
  [
    { row: 1, col: 0 },
    { row: 3, col: 0 },
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
    { row: 3, col: 2 },
    { row: 3, col: 1 },
    { row: 3, col: 0 },
    { row: 1, col: 0 }
  ],
  // Pattern F: row1 col 0 → row3 col4,5,6 -> row4-> col0 -> row3 col 6,5,4 -> row1 col 0
  [
    { row: 1, col: 0 },
    { row: 3, col: 4 },
    { row: 3, col: 5 },
    { row: 3, col: 6 },
    { row: 4, col: 0 },
    { row: 3, col: 6 },
    { row: 3, col: 5 },
    { row: 3, col: 4 },
    { row: 1, col: 0 }
  ]
];

// Select random idle pattern
const getRandomIdlePattern = () => {
  return IDLE_PATTERNS[Math.floor(Math.random() * IDLE_PATTERNS.length)];
};

// Study tips that the bird can share
const STUDY_TIPS = [
  "🐦 *Chirp!* Writing notes by hand boosts recall by up to 25 percent. Your brain remembers the motion of your feathers... I mean fingers.",

  "🖍️ *Peep!* Highlighting everything is the same as highlighting nothing. Pick only the key ideas so your brain knows where to perch.",

  "🎯 *Chirp!* Setting clear goals improves focus. Try tiny daily targets. Even small wins teach your brain to flap forward.",

  "🧠 *Peep!* Mnemonics like stories, acronyms, and silly visuals can raise memory by 20 to 50 percent. The weirder the story, the better it sticks!",

  "🌫️ *Chirp!* Brown noise helps many learners stay focused. It is deeper than white noise and hides distractions. Good for long study flights.",

  "🎧 *Peep!* Binaural beats around 8 to 12 Hz can improve concentration for some brains. Just keep the volume gentle so your ears do not molt.",

  "💧 *Chirp chirp!* Staying hydrated helps your memory and attention. Even mild dehydration can lower focus. Sip water like a responsible bird.",

  "📦 *Peep!* The Feynman Technique helps you learn faster. Teach the topic in simple words. Confusion shows you exactly what needs work.",

  "📚 *Chirp!* The Leitner System can double retention. Review easy flashcards less and tough ones more. Smart spaced learning for humans and birds.",

  "⏳ *Peep!* Spaced repetition boosts long term memory by about 60 percent. Review on day 1, day 3, day 7, then later.",

  "🧪 *Chirp!* Active recall beats passive review by around 80 percent. Quiz yourself instead of rereading. Your memory gets stronger each attempt.",

  "📖 *Peep!* Retrieval practice improves retention more than rereading by about 30 percent. Try explaining the topic with your notes closed.",

  "🔄 *Chirp!* Interleaving different topics boosts problem solving by 40 percent. Mix subjects instead of studying one giant block.",

  "🖼️ *Peep!* Dual coding helps you remember more. Pair pictures with words. Even tiny doodles become powerful memory seeds.",

  "🔥 *Chirp!* The Pomodoro Technique keeps your mind fresh. Study 25 minutes. Rest 5 minutes. Four rounds equals one strong session.",

  "🌙 *Peep!* Sleep helps your brain store memories. People remember up to 40 percent more after a good night's rest.",

  "📑 *Chirp!* Chunking makes learning easier. Break big ideas into small bites. Brains and beaks prefer snack sized info.",

  "✨ *Peep!* Pretesting boosts learning. Even wrong guesses help your brain form stronger connections when you study the right answer.",

  "🌍 *Chirp!* Switching study locations can improve recall. New perch, new cues, stronger memories.",

  "🎵 *Peep!* Soft background music can help some learners stay focused. If silence feels odd, try gentle instrumental sounds."
];



export default function AnimatedBird({ 
  onBirdClick, 
  showTips = true,
  autoFlyIn = true 
}) {
  const [currentState, setCurrentState] = useState(BIRD_STATES.FLY_IN);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [flyInX, setFlyInX] = useState(autoFlyIn ? window.innerWidth + 100 : 60);
  const [isVisible, setIsVisible] = useState(true); // Start visible for fly-in
  const [showMessage, setShowMessage] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [useFallback, setUseFallback] = useState(false);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [isPerchBouncing, setIsPerchBouncing] = useState(false);
  const [perchBounceY, setPerchBounceY] = useState(0);
  const [isWaitingBetweenIdle, setIsWaitingBetweenIdle] = useState(false);
  const [idleFrames, setIdleFrames] = useState([]);
  const [pendingInteraction, setPendingInteraction] = useState(false);
  const restTimeoutRef = useRef(null);
  const speechTimeoutRef = useRef(null);
  const pendingInteractionRef = useRef(false);

  useEffect(() => {
    pendingInteractionRef.current = pendingInteraction;
  }, [pendingInteraction]);

  const currentAnimation = useMemo(() => {
    if (currentState === BIRD_STATES.IDLE) {
      return {
        ...ANIMATIONS[BIRD_STATES.IDLE],
        frames: idleFrames
      };
    }

    if (currentState === BIRD_STATES.REST) {
      return {
        frames: [{ row: 1, col: 0 }],
        duration: 1000,
        loop: false
      };
    }

    return ANIMATIONS[currentState];
  }, [currentState, idleFrames]);

  const canReactFromState = useCallback((state) => {
    return (
      state === BIRD_STATES.IDLE ||
      state === BIRD_STATES.BLINKING ||
      state === BIRD_STATES.REST
    );
  }, []);

  const startReactionSequence = useCallback(() => {
    if (currentState === BIRD_STATES.REACTING || currentState === BIRD_STATES.SPEAKING) {
      return;
    }

    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }

    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }

    const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
    setCurrentMessage(randomTip);
    setShowMessage(true);
    setPendingInteraction(false);
    pendingInteractionRef.current = false;
    setIsWaitingBetweenIdle(false);
    setCurrentState(BIRD_STATES.REACTING);
    setCurrentFrame(0);

    speechTimeoutRef.current = setTimeout(() => {
      speechTimeoutRef.current = null;
      setCurrentState(BIRD_STATES.SPEAKING);
      setCurrentFrame(0);
    }, 800);
  }, [currentState]);

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

  // Schedule random blink
  const scheduleRandomBlink = useCallback(() => {
    if (isWaitingBetweenIdle || pendingInteraction) return;
    if (currentState !== BIRD_STATES.IDLE && currentState !== BIRD_STATES.PERCH) return;

    const randomDelay = Math.random() * 4000 + 3000; // 3-7 seconds
    setTimeout(() => {
      if (!isWaitingBetweenIdle && !pendingInteraction && currentState === BIRD_STATES.IDLE) {
        setCurrentState(BIRD_STATES.BLINKING);
        setCurrentFrame(0);
      }
    }, randomDelay);
  }, [currentState, isWaitingBetweenIdle, pendingInteraction]);

  useEffect(() => {
    if (currentState === BIRD_STATES.IDLE && !isWaitingBetweenIdle && !pendingInteraction) {
      scheduleRandomBlink();
    }
  }, [currentState, isWaitingBetweenIdle, pendingInteraction, scheduleRandomBlink]);

  useEffect(() => {
    if (pendingInteraction && canReactFromState(currentState)) {
      startReactionSequence();
    }
  }, [pendingInteraction, currentState, canReactFromState, startReactionSequence]);

  // Perching bounce animation
  const startPerchBounce = useCallback(() => {
    console.log('Starting perch bounce');
    setIsPerchBouncing(true);
    
    // Bounce animation: y-4 → y+4 → y0
    const bounceSequence = [
      { y: -4, duration: 150 },
      { y: 4, duration: 150 },
      { y: 0, duration: 100 }
    ];
    
    let bounceIndex = 0;
    const executeBounce = () => {
      if (bounceIndex < bounceSequence.length) {
        const bounce = bounceSequence[bounceIndex];
        console.log('Bounce step:', bounceIndex, 'y:', bounce.y);
        setPerchBounceY(bounce.y);
        bounceIndex++;
        
        setTimeout(executeBounce, bounce.duration);
      } else {
        // Bounce finished - transition to idle (only once)
        console.log('Bounce finished, transitioning to idle');
        setIsPerchBouncing(false);
        setPerchBounceY(0);
        
        // Go directly to idle state with first idle pattern
        setTimeout(() => {
          const randomPattern = getRandomIdlePattern();
          console.log('Setting first idle pattern:', randomPattern);
          setIdleFrames(randomPattern);
          setIsWaitingBetweenIdle(false);
          setCurrentState(BIRD_STATES.IDLE);
          setCurrentFrame(0);
        }, 500); // Small delay before starting idle
      }
    };
    
    executeBounce();
  }, []);

  // Handle animation state transitions
  const handleAnimationEnd = useCallback(() => {
    console.log('handleAnimationEnd called for:', currentState);
    switch (currentState) {
      case BIRD_STATES.LANDING:
        // After landing, do perching bounce
        setCurrentState(BIRD_STATES.PERCH);
        setCurrentFrame(0);
        // Start perch bounce after a brief delay
        setTimeout(() => {
          startPerchBounce();
        }, 100);
        break;
      case BIRD_STATES.IDLE:
        // After idle pattern finishes, set to rest frame (row 1 col 0) and wait
        console.log('Idle animation finished, going to rest frame and waiting for next pattern');
        if (pendingInteractionRef.current) {
          startReactionSequence();
          break;
        }
        setIsWaitingBetweenIdle(true);
        setCurrentState(BIRD_STATES.REST);
        setCurrentFrame(0); // Rest frame (row 1 col 0)
        // Wait, then set new pattern and restart
        if (restTimeoutRef.current) {
          clearTimeout(restTimeoutRef.current);
        }
        restTimeoutRef.current = setTimeout(() => {
          restTimeoutRef.current = null;
          const newRandomPattern = getRandomIdlePattern();
          console.log('Setting new idle pattern after rest:', newRandomPattern);
          setIdleFrames(newRandomPattern);
          setCurrentFrame(0);
          setIsWaitingBetweenIdle(false);
          setCurrentState(BIRD_STATES.IDLE);
        }, 3000); // 3 second rest between idle patterns
        break;
      case BIRD_STATES.BLINKING:
        // After blinking, return to idle with random pattern
        const blinkIdlePattern = getRandomIdlePattern();
        console.log('Setting blink idle pattern:', blinkIdlePattern);
        setIdleFrames(blinkIdlePattern);
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
        break;
      case BIRD_STATES.REACTING:
        const reactIdlePattern = getRandomIdlePattern();
        console.log('Setting react idle pattern:', reactIdlePattern);
        setIdleFrames(reactIdlePattern);
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
        break;
      case BIRD_STATES.SPEAKING:
        setShowMessage(false);
        setTimeout(() => {
          const speakIdlePattern = getRandomIdlePattern();
          console.log('Setting speak idle pattern:', speakIdlePattern);
          setIdleFrames(speakIdlePattern);
          setCurrentState(BIRD_STATES.IDLE);
          setCurrentFrame(0);
        }, 500);
        break;
      default:
        break;
    }
  }, [currentState, startPerchBounce, startReactionSequence]);

  // Frame animation effect
  useEffect(() => {
    if (!currentAnimation) return;

    console.log('Frame animation effect for state:', currentState);

    // Skip frame handling for fly-in (handled by position) and rest (static frame)
    if (currentState === BIRD_STATES.FLY_IN || currentState === BIRD_STATES.REST) {
      console.log('Skipping frame animation for fly-in/rest state');
      return;
    }

    if (currentState === BIRD_STATES.IDLE && currentAnimation.frames.length === 0) {
      console.log('No idle frames set, skipping until pattern is assigned');
      return;
    }

    console.log('Starting frame animation for:', currentState, 'with frames:', currentAnimation.frames.length, currentAnimation.frames);

    const interval = setInterval(() => {
      setCurrentFrame(prev => {
        const nextFrame = prev + 1;
        console.log('Frame transition:', currentState, prev, '->', nextFrame, '/', currentAnimation.frames.length);
        if (nextFrame >= currentAnimation.frames.length) {
          if (currentAnimation.loop) {
            return 0;
          }

          console.log('Animation finished for:', currentState);
          clearInterval(interval);
          handleAnimationEnd();
          return prev;
        }
        return nextFrame;
      });
    }, currentAnimation.duration);

    return () => {
      console.log('Cleaning up animation for:', currentState);
      clearInterval(interval);
    };
  }, [currentState, currentAnimation, handleAnimationEnd]);

  // Initialize fly-in animation
  useEffect(() => {
    console.log('Initializing bird with autoFlyIn:', autoFlyIn);
    
    if (autoFlyIn) {
      console.log('Starting fly-in animation');
      
      // Set initial flying frame
      setCurrentFrame(0);
      
      // Start fly-in animation from off-screen right to left position
      const flyTimer = setTimeout(() => {
        console.log('Starting position transition');
        setFlyInX(60); // Animate to final position
      }, 500);
      
      // Cycle through flying frames during flight using the proper animation pattern
      let frameIndex = 0;
      const flyFrames = ANIMATIONS[BIRD_STATES.FLY_IN].frames;
      const flyFrameInterval = setInterval(() => {
        frameIndex = (frameIndex + 1) % flyFrames.length; // Cycle through all flying frames (0,1,2,1,0)
        console.log('Flying frame:', frameIndex, 'frame data:', flyFrames[frameIndex]);
        setCurrentFrame(frameIndex);
      }, 250); // Slower frame cycling during flight (was 150ms)
      
      // After flying animation, switch to landing
      const landingTimer = setTimeout(() => {
        console.log('Switching to landing');
        clearInterval(flyFrameInterval);
        setCurrentState(BIRD_STATES.LANDING);
        setCurrentFrame(0);
      }, 3500); // Longer flight duration (was 2500ms)
      
      return () => {
        clearTimeout(flyTimer);
        clearTimeout(landingTimer);
        clearInterval(flyFrameInterval);
      };
    } else {
      // If autoFlyIn is false, skip directly to idle state
      console.log('Skipping fly-in, going directly to idle');
      setTimeout(() => {
        const randomPattern = getRandomIdlePattern();
        setIdleFrames(randomPattern);
        setIsWaitingBetweenIdle(false);
        setCurrentState(BIRD_STATES.IDLE);
        setCurrentFrame(0);
      }, 500);
    }
  }, [autoFlyIn]);

  // Schedule random study tips
  useEffect(() => {
    if (!showTips || !isVisible) return;

    const tipInterval = setInterval(() => {
      if (!pendingInteraction && currentState === BIRD_STATES.IDLE && Math.random() < 0.3) { // 30% chance
        const randomTip = STUDY_TIPS[Math.floor(Math.random() * STUDY_TIPS.length)];
        setCurrentMessage(randomTip);
        setShowMessage(true);
        setCurrentState(BIRD_STATES.SPEAKING);
        setCurrentFrame(0);
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(tipInterval);
  }, [currentState, isVisible, pendingInteraction, showTips]);

  // Handle bird click
  const handleBirdClick = () => {
    setPendingInteraction(true);
    pendingInteractionRef.current = true;

    if (canReactFromState(currentState)) {
      startReactionSequence();
    }

    if (onBirdClick) onBirdClick();
  };

  useEffect(() => () => {
    if (restTimeoutRef.current) {
      clearTimeout(restTimeoutRef.current);
      restTimeoutRef.current = null;
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  }, []);

  // Don't render until we know the sprite dimensions
  if (!isVisible || (!frameWidth && !useFallback)) return null;

  const animation = currentAnimation;
  const frameList = animation?.frames || [];
  const safeIndex = frameList.length ? Math.min(currentFrame, frameList.length - 1) : 0;
  const frame = frameList[safeIndex] || { row: 1, col: 0 };
  
  // Calculate trimmed positioning - add 4px offset to remove grid borders completely
  const trimOffset = 4;
  const bgPosX = useFallback ? 'center' : `-${(frame.col * frameWidth) + trimOffset}px`;
  const bgPosY = useFallback ? 'center' : `-${(frame.row * frameHeight) + trimOffset}px`;
  const backgroundPosition = useFallback ? 'center' : `${bgPosX} ${bgPosY}`;
  

  
  return (
    <>


      {/* Bird + Speech Bubble wrapper for relative positioning */}
      <Box
        position="absolute"
        top={`${-105 + perchBounceY}px`}
        left={currentState === BIRD_STATES.FLY_IN ? `${flyInX}px` : "60px"}
        style={{
          transition: currentState === BIRD_STATES.FLY_IN ? 'left 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
          zIndex: 99999
        }}
      >
        {/* Bird Sprite */}
        <Box
          className={`animated-bird ${currentState}`}
          width={useFallback ? "64px" : `${Math.round(frameWidth)}px`}
          height={useFallback ? "64px" : `${Math.round(frameHeight)}px`}
          cursor="pointer"
          onClick={handleBirdClick}
          style={{
            backgroundImage: useFallback ? `url(${parrotFallback})` : `url(${birdSprite})`,
            backgroundPosition: backgroundPosition,
            backgroundSize: useFallback ? 'contain' : `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
            backgroundRepeat: 'no-repeat',
            imageRendering: 'pixelated',
            border: 'none',
            outline: 'none'
          }}
          _hover={{
            transform: 'none',
            transition: 'none'
          }}
          onError={() => {
            console.log('Bird sprite failed to load, using fallback');
            setUseFallback(true);
          }}
        />

        {/* Speech Bubble - top left relative to bird */}
        {showMessage && (
          <Box
            position="absolute"
            right="-250px"
            top="-20px"
            maxWidth="280px"
            bg="white"
            border="2px solid"
            borderColor="teal.300"
            borderRadius="md"
            p={3}
            boxShadow="md"
            zIndex={10000}
          >
            <Text fontSize="sm" color="gray.700">
              {currentMessage}
            </Text>
          </Box>
        )}
      </Box>
    </>
  );
}