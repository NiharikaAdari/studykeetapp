import React, { useState, useEffect, useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import InputCard from "../components/InputCard.jsx";
import NestPanel from "../components/NestPanel.jsx";
import EggGrid from "../components/EggGrid.jsx";
import AnimatedBird from "../components/AnimatedBird.jsx";
import { useNestContext } from "../components/NestContext.jsx";

export default function Home() {
  const [activeNestId, setActiveNestId] = useState(null);
  const [birdPosition, setBirdPosition] = useState({ x: 0, y: 0 });
  const inputCardRef = useRef(null);
  const { getNest } = useNestContext();

  const activeNest = activeNestId ? getNest(activeNestId) : null;

  // Calculate bird position relative to InputCard
  useEffect(() => {
    const calculateBirdPosition = () => {
      if (inputCardRef.current) {
        const rect = inputCardRef.current.getBoundingClientRect();
        setBirdPosition({
          x: rect.left + rect.width - 200, // Position on the right side of the card
          y: rect.top - 100 // Position above the card
        });
      }
    };

    // Calculate position after component mounts and on window resize
    const timer = setTimeout(calculateBirdPosition, 100);
    window.addEventListener('resize', calculateBirdPosition);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateBirdPosition);
    };
  }, [activeNest]); // Recalculate when switching between InputCard and EggGrid

  const handleNestSelect = (nestId) => {
    setActiveNestId((current) => (current === nestId ? null : nestId));
  };

  const handleBirdClick = () => {
    console.log("StudyKeet says hello! 🦜");
  };

  return (
    <Flex direction="column" minHeight="100%" gap={0} pb={0} position="relative">
      <Box flex="1 1 auto" px={{ base: 2, md: 6 }} py={{ base: 4, md: 8 }}>
        {activeNest ? (
          <EggGrid nest={activeNest} onBack={() => setActiveNestId(null)} />
        ) : (
          <Box ref={inputCardRef}>
            <InputCard />
          </Box>
        )}
      </Box>
      <Box flexShrink={0}>
        <NestPanel activeNestId={activeNestId} onSelectNest={handleNestSelect} />
      </Box>
      
      {/* Animated Bird - only show on main InputCard view */}
      {!activeNest && (
        <AnimatedBird
          targetPosition={birdPosition}
          onBirdClick={handleBirdClick}
          showTips={true}
          autoFlyIn={true}
        />
      )}
    </Flex>
  );
}
