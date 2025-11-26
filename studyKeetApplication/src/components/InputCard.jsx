import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Tabs,
  TabList,
  TabPanels,
  TabIndicator,
  SlideFade,
  Heading,
  Flex,
  Spacer,
  useToast,
  Button,
  FormControl,
  FormLabel,
  Collapse,
  Select,
  Input,
  VStack,
  Text,
  Box,
  HStack,
  IconButton,
  Tooltip,
  ScaleFade,
  keyframes,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { inView } from "framer-motion";
import { TabButton } from "./TabButton.jsx";
import { TabContent } from "./TabContent.jsx";
import { useNavigate } from "react-router-dom";
import { useNestContext } from "./NestContext.jsx";

export default function InputCard() {
  const [contentType, setContentType] = useState("Text");
  const [content, setContent] = useState("");
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [showNestSelector, setShowNestSelector] = useState(false);
  const [selectedNestId, setSelectedNestId] = useState("");
  const [eggName, setEggName] = useState("");
  const [isAnimatingEgg, setIsAnimatingEgg] = useState(false);
  const [highlightNests, setHighlightNests] = useState(false);
  const eggAnimationRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();
  const { nests, addEgg, setHighlightMode, highlightMode, selectedNestForSaving, setSelectedNestForSaving, currentEggName, setCurrentEggName } = useNestContext();

  const hasNests = nests.length > 0;

  useEffect(() => {
    if (!showNestSelector) {
      setSelectedNestId("");
      setEggName("");
      setHighlightNests(false);
      if (setHighlightMode) {
        setHighlightMode(false);
      }
      return;
    }

    if (!hasNests) {
      setSelectedNestId("");
      setEggName("");
      return;
    }
  }, [showNestSelector, hasNests, nests, setHighlightMode]);

  const toggleNestSelector = () => {
    const newState = !showNestSelector;
    setShowNestSelector(newState);
    
    if (newState) {
      // Highlight the nest panel at the bottom
      if (setHighlightMode) {
        setHighlightMode(true);
      }
      setHighlightNests(true);
      
      toast({
        title: "🪺 Choose a nest below",
        description: "Click on a nest at the bottom to save your study material",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      setHighlightNests(false);
      if (setHighlightMode) {
        setHighlightMode(false);
      }
    }
  };

  // Listen for nest selection from the panel below
  useEffect(() => {
    if (showNestSelector && highlightMode && selectedNestForSaving && eggName.trim()) {
      // Only trigger egg drop if we have both nest selection and egg name
      handleEggDrop();
    }
  }, [selectedNestForSaving, showNestSelector, highlightMode, eggName]);

  const handleEggDrop = async () => {
    if (!content || !selectedNestForSaving || !eggName.trim()) return;
    
    setIsAnimatingEgg(true);
    
    // Animate egg dropping
    await new Promise((resolve) => {
      setTimeout(() => {
        setIsAnimatingEgg(false);
        resolve();
      }, 1200);
    });

    // Save to nest
    const persistAndSave = (payload) => {
      try {
        localStorage.setItem("contentType", contentType);
        localStorage.setItem("content", payload);

        addEgg(selectedNestForSaving, {
          name: eggName.trim(),
          type: contentType,
          content: payload,
        });
        
        toast({
          title: "🥚➡️🪺 Egg delivered!",
          description: "Your study material is safely stored in the nest.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Reset states but don't navigate
        setShowNestSelector(false);
        setSelectedNestId("");
        setEggName("");
        setSelectedNestForSaving(null);
        setCurrentEggName("");
        if (setHighlightMode) {
          setHighlightMode(false);
        }
        
        // Don't navigate here - let user decide when to submit
      } catch (error) {
        toast({
          title: "Failed to save egg",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (contentType === "PDF") {
      const reader = new FileReader();
      reader.onloadend = () => {
        persistAndSave(reader.result);
      };
      reader.onerror = () => {
        toast({
          title: "Unable to read PDF",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(content);
    } else {
      persistAndSave(content);
    }
  };

  const handleContentChange = (type, data) => {
    setContentType(type);
    if (type === "PDF") {
      setContent(data);
      setIsSubmitDisabled(!data);
      return;
    }

    const value = typeof data === "string" ? data : "";
    setContent(value);
    setIsSubmitDisabled(!value.trim());
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!content) {
      toast({
        title: "Submission failed. Enter content.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Regular submission without nest saving
    const persistAndNavigate = (payload) => {
      try {
        localStorage.setItem("contentType", contentType);
        localStorage.setItem("content", payload);
        navigate("/studyboard");
      } catch (error) {
        toast({
          title: "Submission failed",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    if (contentType === "PDF") {
      const reader = new FileReader();
      reader.onloadend = () => {
        persistAndNavigate(reader.result);
      };
      reader.onerror = () => {
        toast({
          title: "Unable to read PDF",
          status: "error",
          duration: 4000,
          isClosable: true,
        });
      };
      reader.readAsDataURL(content);
    } else {
      persistAndNavigate(content);
    }
  };

  return (
    <div>
      <SlideFade in={inView} offsetY="-50px">
        <Card p={50} margin={5} bgColor="teal.300" borderRadius={50} boxShadow="dark-lg">
          <CardHeader>
            <Heading size="2xl" color="teal.900" textAlign="center">
              What Will You Study?
            </Heading>
          </CardHeader>
          <CardBody>
            <Tabs variant="unstyled">
              <TabList>
                <TabButton>Text</TabButton>
                <TabButton>URL</TabButton>
                <TabButton>PDF</TabButton>
              </TabList>
              <TabIndicator mt="-1.5px" height="2px" bg="orange.500" borderRadius="1px" zIndex={2} position="relative" />
              <TabPanels>
                <TabContent type="Text" onChange={handleContentChange} />
                <TabContent type="URL" onChange={handleContentChange} />
                <TabContent type="PDF" onChange={handleContentChange} />
              </TabPanels>
            </Tabs>
          </CardBody>
          <CardFooter>
            <Flex w="100%" align="center" justify="center" position="relative">
              {/* Submit button - Positioned absolutely on the right */}
              <Button
                onClick={handleSubmit}
                bgColor="orange.300"
                _hover={{ bg: "yellow.300", color: "teal.400" }}
                color="white"
                borderRadius={10}
                p={2}
                boxShadow="xl"
                isDisabled={isSubmitDisabled}
                size="lg"
                position="absolute"
                right="0"
                top="0"
              >
                Submit
              </Button>
              
              {/* Save to Nest section - Perfectly centered */}
              <VStack align="center" spacing={4}>
                {/* Nest saving trigger button */}
                <Box
                  bg="green.300"
                  borderRadius="xl"
                  p={4}
                  boxShadow="xl"
                  border="2px solid"
                  borderColor="cyan.300"
                  position="relative"
                  overflow="hidden"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  _before={{
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    animation: showNestSelector ? "shimmer 2s infinite" : "none",
                  }}
                  sx={{
                    "@keyframes shimmer": {
                      "0%": { left: "-100%" },
                      "100%": { left: "100%" }
                    }
                  }}
              >
                <VStack spacing={2} align="center" justify="center">
                  <HStack spacing={3} justify="center" align="center">
                    <Box textAlign="center">
                      <Text fontSize="lg" fontWeight="bold" color="white" textShadow="0 1px 2px rgba(0,0,0,0.3)">
                        🪺 Save to Nest
                      </Text>
                      <Text fontSize="m" color="green.800" fontWeight="medium">
                        Organize your study materials
                      </Text>
                    </Box>
                    {isAnimatingEgg && (
                      <Box
                        as={motion.div}
                        animate={{ 
                          y: [0, 30, 60, 100],
                          scale: [1, 0.9, 0.7, 0.5],
                          opacity: [1, 0.8, 0.5, 0],
                          rotate: [0, 10, -10, 0]
                        }}
                        transition={{ duration: 1.2, ease: "easeIn" }}
                        fontSize="2xl"
                      >
                        🥚
                      </Box>
                    )}
                  </HStack>
                  
                  <VStack spacing={1} align="center">
                    {showNestSelector && !isAnimatingEgg && !selectedNestForSaving && (
                      <Text fontSize="s" color="yellow.200" fontWeight="bold" textAlign="center">
                        👇 Name your egg, then click a nest below
                      </Text>
                    )}
                    {selectedNestForSaving && !isAnimatingEgg && eggName.trim() && (
                      <Text fontSize="xs" color="green.200" fontWeight="bold" textAlign="center">
                        ✅ Ready to drop!
                      </Text>
                    )}
                    <Tooltip 
                      label={showNestSelector ? "Cancel nest selection" : "Choose a nest to save your study material"}
                      placement="top"
                    >
                      <IconButton
                        icon={<ChevronDownIcon />}
                        size="md"
                        variant="solid"
                        bg="yellow.300"
                        color="green.300"
                        _hover={{ bg: "yellow.400", transform: "scale(1.15)", boxShadow: "lg" }}
                        onClick={toggleNestSelector}
                        transition="all 0.2s"
                        isDisabled={!hasNests}
                        boxShadow="0 4px 12px rgba(0,0,0,0.2)"
                      />
                    </Tooltip>
                  </VStack>
                </VStack>
              </Box>

              {/* Egg naming input when in nest selection mode */}
              <Collapse in={showNestSelector} animateOpacity>
                <ScaleFade in={showNestSelector} initialScale={0.9}>
                  <VStack 
                    align="stretch" 
                    spacing={3} 
                    bg="yellow.100" 
                    p={6} 
                    borderRadius="xl" 
                    border="3px solid" 
                    borderColor="orange.300"
                    boxShadow="xl"
                    position="relative"
                  >
                    <FormControl>
                      <FormLabel 
                        color="orange.300" 
                        fontWeight="bold" 
                        fontSize="md"
                        display="flex"
                        alignItems="center"
                        gap={2}
                      >
                        <Text as="span" fontSize="lg">🥚</Text>
                        Name your study material
                      </FormLabel>
                      <Input
                        placeholder="e.g. Chapter 3 Notes, Biology Quiz, Math Formulas..."
                        value={eggName}
                        onChange={(event) => {
                          const newName = event.target.value;
                          setEggName(newName);
                          setCurrentEggName(newName);
                        }}
                        bg="white"
                        borderColor="orange.200"
                        borderWidth="2px"
                        _focus={{ 
                          borderColor: "orange.400", 
                          boxShadow: "0 0 0 3px rgba(251, 146, 60, 0.1)",
                          transform: "scale(1.02)"
                        }}
                        _hover={{ borderColor: "orange.400" }}
                        fontSize="md"
                        h="12"
                        transition="all 0.2s"
                      />
                    </FormControl>
                    
                    {selectedNestForSaving && (
                      <Box 
                        bg="green.100" 
                        p={3} 
                        borderRadius="lg" 
                        border="2px solid" 
                        borderColor="green.300"
                      >
                        <Text fontSize="sm" color="green.800" textAlign="center" fontWeight="bold">
                          🪺 Selected nest: <Text as="span" color="green.600">{nests.find(n => n.id === selectedNestForSaving)?.name}</Text>
                        </Text>
                      </Box>
                    )}
                    
                    {!selectedNestForSaving && eggName.trim() && (
                      <Box 
                        bg="pink.50" 
                        p={3} 
                        borderRadius="lg" 
                        border="2px dashed" 
                        borderColor="pink.200"
                      >
                        <Text fontSize="sm" color="pink.500" textAlign="center" fontWeight="medium">
                          ✨ Now click a nest below to save "<Text as="span" fontWeight="bold" color="purple.300">{eggName.trim()}</Text>"
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </ScaleFade>
              </Collapse>
              
              {!hasNests && (
                <Box 
                  bg="gradient(linear, to-r, gray.100, gray.200)" 
                  p={4} 
                  borderRadius="lg" 
                  border="2px dashed" 
                  borderColor="gray.400"
                >
                  <Text fontSize="sm" color="gray.600" fontStyle="italic" textAlign="center" fontWeight="medium">
                    💡 Create a nest at the bottom to start organizing your study materials
                  </Text>
                </Box>
              )}
              </VStack>
            </Flex>
          </CardFooter>
        </Card>
      </SlideFade>
    </div>
  );
}
