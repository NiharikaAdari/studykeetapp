import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import InputCard from "../components/InputCard.jsx";
import NestPanel from "../components/NestPanel.jsx";
import EggGrid from "../components/EggGrid.jsx";
import { useNestContext } from "../components/NestContext.jsx";

export default function Home() {
  const [activeNestId, setActiveNestId] = useState(null);
  const { getNest } = useNestContext();

  const activeNest = activeNestId ? getNest(activeNestId) : null;

  const handleNestSelect = (nestId) => {
    setActiveNestId((current) => (current === nestId ? null : nestId));
  };

  return (
    <Flex direction="column" minHeight="100%" gap={0} pb={0}>
      <Box flex="1 1 auto" px={{ base: 2, md: 6 }} py={{ base: 4, md: 8 }}>
        {activeNest ? (
          <EggGrid nest={activeNest} onBack={() => setActiveNestId(null)} />
        ) : (
          <InputCard />
        )}
      </Box>
      <Box flexShrink={0}>
        <NestPanel activeNestId={activeNestId} onSelectNest={handleNestSelect} />
      </Box>
    </Flex>
  );
}
