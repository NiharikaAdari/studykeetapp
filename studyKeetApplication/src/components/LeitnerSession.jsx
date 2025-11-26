import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  Box,
  Heading,
  Text,
  Button,
  HStack,
  VStack,
  Progress,
  Divider,
  useToast,
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon, CheckIcon, CloseIcon as XIcon } from "@chakra-ui/icons";
import { FlashcardContext } from "./FlashcardContext.jsx";
import "./FlashcardGrid.css";

const LeitnerSession = ({ isOpen, onClose, questionFirst, subjectFilter }) => {
  const { sessionCards, markFlashcard, fetchDueFlashcards } = useContext(FlashcardContext);
  const [localIndex, setLocalIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState({ again: 0, hard: 0, good: 0, easy: 0 });
  const [isComplete, setIsComplete] = useState(false);
  const [localCards, setLocalCards] = useState([]);
  const toast = useToast();

  const currentCard = localCards[localIndex];
  const totalCards = localCards.length;
  const progressPercent = totalCards > 0 ? ((localIndex / totalCards) * 100) : 0;

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalCards([...sessionCards]);
      setLocalIndex(0);
      setIsFlipped(false);
      setIsComplete(false);
      setSessionResults({ again: 0, hard: 0, good: 0, easy: 0 });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentCard) return;

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        }
      } else if (isFlipped) {
        if (e.key === '1') {
          handleAnswer('again');
        } else if (e.key === '2') {
          handleAnswer('hard');
        } else if (e.key === '3') {
          handleAnswer('good');
        } else if (e.key === '4') {
          handleAnswer('easy');
        }
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, currentCard]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleAnswer = async (result) => {
    if (!currentCard) return;

    try {
      await markFlashcard(currentCard.id, result);
      
      // Update results
      setSessionResults(prev => ({
        ...prev,
        [result]: prev[result] + 1
      }));

      // Move to next card
      if (localIndex < totalCards - 1) {
        setLocalIndex(localIndex + 1);
        setIsFlipped(false);
      } else {
        // Session complete
        setIsComplete(true);
      }
    } catch (error) {
      toast({
        title: "Error saving progress",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setLocalIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionResults({ again: 0, hard: 0, good: 0, easy: 0 });
    setLocalCards([]);
    onClose();
  };

  const handleRestart = async () => {
    const newCards = await fetchDueFlashcards(subjectFilter);
    setLocalCards([...newCards]);
    setLocalIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionResults({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  if (!isOpen) return null;

  // Session complete screen
  if (isComplete) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="teal.300" p={8} borderRadius="xl">
          <VStack spacing={6}>
            <Heading size="2xl" color="white">🎉 Learning Session Complete!</Heading>
            
            <Box bg="white" p={6} borderRadius="lg" width="100%" textAlign="center">
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold">Results</Text>
                <HStack spacing={4} justify="center" wrap="wrap">
                  <VStack>
                    <Box bg="pink.400" p={3} borderRadius="lg" minW="80px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.again}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Again</Text>
                    <Text fontSize="xs" color="gray.500">(15m)</Text>
                  </VStack>
                  <VStack>
                    <Box bg="red.400" p={3} borderRadius="lg" minW="80px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.hard}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Hard</Text>
                    <Text fontSize="xs" color="gray.500">(1d)</Text>
                  </VStack>
                  <VStack>
                    <Box bg="cyan.400" p={3} borderRadius="lg" minW="80px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.good}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Good</Text>
                    <Text fontSize="xs" color="gray.500">(2d)</Text>
                  </VStack>
                  <VStack>
                    <Box bg="green.400" p={3} borderRadius="lg" minW="80px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.easy}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Easy</Text>
                    <Text fontSize="xs" color="gray.500">(7d)</Text>
                  </VStack>
                </HStack>
                <Divider my={2} />
                <Text fontSize="lg" color="gray.700">
                  Total cards reviewed: {totalCards}
                </Text>
              </VStack>
            </Box>

            <HStack spacing={4}>
              <Button
                bgColor="orange.400"
                color="white"
                size="lg"
                onClick={handleRestart}
                _hover={{ bg: "orange.500" }}
              >
                Review More Cards
              </Button>
              <Button
                bgColor="teal.400"
                color="white"
                size="lg"
                onClick={handleClose}
                _hover={{ bg: "teal.500" }}
              >
                Back to Flashcards
              </Button>
            </HStack>
          </VStack>
        </ModalContent>
      </Modal>
    );
  }

  // No cards available
  if (totalCards === 0) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="teal.300" p={8} borderRadius="xl">
          <VStack spacing={6}>
            <Heading size="xl" color="white">No Cards Due</Heading>
            <Text fontSize="lg" color="white" textAlign="center">
              Great job! You've reviewed all cards due today. Check back later for more reviews.
            </Text>
            <Button
              colorScheme="orange"
              size="lg"
              onClick={handleClose}
            >
              Back to Flashcards
            </Button>
          </VStack>
        </ModalContent>
      </Modal>
    );
  }

  // Learning session screen

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent bg="transparent" boxShadow="none" maxW="900px" p={0}>
        <VStack spacing={6}>
          {/* Header with progress */}
          <Box bg="teal.300" p={4} borderRadius="xl" width="100%">
            <VStack spacing={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="lg" fontWeight="bold" color="white">
                  Card {localIndex + 1} of {totalCards}
                </Text>
                <Text fontSize="md" color="white">
                  🪺 Nest {currentCard?.leitner_box || 1}
                </Text>
                <IconButton
                  aria-label="Close session"
                  icon={<CloseIcon />}
                  onClick={handleClose}
                  colorScheme="red"
                  size="sm"
                />
              </HStack>
              <Progress
                value={progressPercent}
                width="100%"
                colorScheme="orange"
                borderRadius="full"
                size="lg"
              />
              <HStack spacing={4} fontSize="sm" color="white">
                <Text>✓ {sessionResults.correct}</Text>
                <Text>✗ {sessionResults.incorrect}</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Flashcard */}
          <Box
            h="450px"
            w="700px"
            onClick={!isFlipped ? handleFlip : undefined}
            cursor={!isFlipped ? "pointer" : "default"}
          >
            <Box
              p={12}
              shadow="2xl"
              borderRadius="2xl"
              bgColor={currentCard?.color || "yellow.300"}
              h="100%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <VStack spacing={4} align="stretch">
                <Text fontWeight="bold" fontSize="xl" textAlign="center">
                  {currentCard?.subject && `〘${currentCard.subject}〙`}
                </Text>
                <Divider borderColor="gray.600" />
                <Text fontWeight="bold" fontSize="2xl" color="gray.700" textAlign="center">
                  {/* When questionFirst=true: show QUESTION first, then ANSWER */}
                  {/* When questionFirst=false: show ANSWER first, then QUESTION */}
                  {questionFirst 
                    ? (isFlipped ? "ANSWER" : "QUESTION")
                    : (isFlipped ? "QUESTION" : "ANSWER")
                  }
                </Text>
                <Text fontSize="xl" lineHeight="tall" textAlign="center" mt={4}>
                  {(() => {
                    const content = questionFirst 
                      ? (isFlipped ? currentCard?.answer : currentCard?.question)
                      : (isFlipped ? currentCard?.question : currentCard?.answer);
                    console.log('Card display:', { 
                      questionFirst, 
                      isFlipped, 
                      showing: content,
                      question: currentCard?.question,
                      answer: currentCard?.answer 
                    });
                    return content;
                  })()}
                </Text>
                {!isFlipped && (
                  <Text fontSize="sm" color="gray.600" textAlign="center" mt={4}>
                    Click or press Space to flip
                  </Text>
                )}
              </VStack>
            </Box>
          </Box>

          {/* Answer buttons (only show when flipped) */}
          {isFlipped && (
            <HStack spacing={4}>
              <Button
                bgColor="purple.400"
                color="white"
                size="md"
                onClick={() => handleAnswer('again')}
                px={4}
                py={4}
                fontSize="md"
                _hover={{ bg: "purple.500" }}
              >
                Again
                <Text fontSize="xs" ml={1}>(15m)</Text>
              </Button>
              <Button
                bgColor="red.400"
                color="white"
                size="md"
                onClick={() => handleAnswer('hard')}
                px={4}
                py={4}
                fontSize="md"
                _hover={{ bg: "red.500" }}
              >
                Hard
                <Text fontSize="xs" ml={1}>(1d)</Text>
              </Button>
              <Button
                bgColor="cyan.400"
                color="white"
                size="md"
                onClick={() => handleAnswer('good')}
                px={4}
                py={4}
                fontSize="md"
                _hover={{ bg: "cyan.500" }}
              >
                Good
                <Text fontSize="xs" ml={1}>(2d)</Text>
              </Button>
              <Button
                bgColor="green.400"
                color="white"
                size="md"
                onClick={() => handleAnswer('easy')}
                px={4}
                py={4}
                fontSize="md"
                _hover={{ bg: "green.500" }}
              >
                Easy
                <Text fontSize="xs" ml={1}>(7d)</Text>
              </Button>
            </HStack>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default LeitnerSession;
