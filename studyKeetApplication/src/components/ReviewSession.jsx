import React, { useState, useEffect } from "react";
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
  IconButton,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import "./FlashcardGrid.css";

const ReviewSession = ({ isOpen, onClose, cards, questionFirst }) => {
  const [localIndex, setLocalIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState({ correct: 0, incorrect: 0 });
  const [isComplete, setIsComplete] = useState(false);

  const currentCard = cards[localIndex];
  const totalCards = cards.length;
  const progressPercent = totalCards > 0 ? ((localIndex / totalCards) * 100) : 0;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalIndex(0);
      setIsFlipped(false);
      setIsComplete(false);
      setSessionResults({ correct: 0, incorrect: 0 });
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen || !currentCard || isComplete) return;

    const handleKeyDown = (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!isFlipped) {
          handleFlip();
        }
      } else if (isFlipped) {
        if (e.key === '1' || e.key.toLowerCase() === 'c') {
          handleAnswer('correct');
        } else if (e.key === '2' || e.key.toLowerCase() === 'i') {
          handleAnswer('incorrect');
        }
      }
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipped, currentCard, isComplete]);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleAnswer = (result) => {
    if (!currentCard) return;

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
  };

  const handleClose = () => {
    setLocalIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionResults({ correct: 0, incorrect: 0 });
    onClose();
  };

  const handleRestart = () => {
    setLocalIndex(0);
    setIsFlipped(false);
    setIsComplete(false);
    setSessionResults({ correct: 0, incorrect: 0 });
  };

  if (!isOpen) return null;

  // Session complete screen
  if (isComplete) {
    const accuracy = totalCards > 0 ? ((sessionResults.correct / totalCards) * 100).toFixed(1) : 0;
    
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="cyan.400" p={8} borderRadius="xl">
          <VStack spacing={6}>
            <Heading size="2xl" color="white">🎉 Review Complete!</Heading>
            
            <Box bg="white" p={6} borderRadius="lg" width="100%" textAlign="center">
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold">Results</Text>
                <HStack spacing={6} justify="center" wrap="wrap">
                  <VStack>
                    <Box bg="green.400" p={3} borderRadius="lg" minW="100px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.correct}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Correct</Text>
                  </VStack>
                  <VStack>
                    <Box bg="red.400" p={3} borderRadius="lg" minW="100px">
                      <Text fontSize="3xl" color="white" fontWeight="bold">
                        {sessionResults.incorrect}
                      </Text>
                    </Box>
                    <Text fontSize="md" color="gray.600">Incorrect</Text>
                  </VStack>
                </HStack>
                <Divider my={2} />
                <VStack spacing={1}>
                  <Text fontSize="lg" color="gray.700">
                    Total cards reviewed: {totalCards}
                  </Text>
                  <Text fontSize="xl" fontWeight="bold" color="purple.600">
                    Accuracy: {accuracy}%
                  </Text>
                </VStack>
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
                Review Again
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
        <ModalContent bg="cyan.400" p={8} borderRadius="xl">
          <VStack spacing={6}>
            <Heading size="xl" color="white">No Cards Available</Heading>
            <Text fontSize="lg" color="white" textAlign="center">
              There are no cards to review. Try adjusting your filters or adding more flashcards.
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

  // Review session screen
  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full" isCentered>
      <ModalOverlay bg="blackAlpha.900" />
      <ModalContent bg="transparent" boxShadow="none" maxW="900px" p={0}>
        <VStack spacing={6}>
          {/* Header with progress */}
          <Box bg="cyan.400" p={4} borderRadius="xl" width="100%">
            <VStack spacing={3}>
              <HStack justify="space-between" width="100%">
                <Text fontSize="lg" fontWeight="bold" color="white">
                  Card {localIndex + 1} of {totalCards}
                </Text>
                <Text fontSize="md" color="white" fontWeight="bold">
                  📝 Review Session
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
                colorScheme="teal"
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
                  {questionFirst 
                    ? (isFlipped ? "ANSWER" : "QUESTION")
                    : (isFlipped ? "QUESTION" : "ANSWER")
                  }
                </Text>
                <Text fontSize="xl" lineHeight="tall" textAlign="center" mt={4}>
                  {questionFirst 
                    ? (isFlipped ? currentCard?.answer : currentCard?.question)
                    : (isFlipped ? currentCard?.question : currentCard?.answer)
                  }
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
            <HStack spacing={6}>
              <Button
                bgColor="green.400"
                color="white"
                size="lg"
                onClick={() => handleAnswer('correct')}
                px={8}
                py={6}
                fontSize="lg"
                leftIcon={<Text fontSize="2xl">✓</Text>}
                _hover={{ bg: "green.500" }}
              >
                Correct
                <Text fontSize="xs" ml={2}>(1 or C)</Text>
              </Button>
              <Button
                bgColor="red.400"
                color="white"
                size="lg"
                onClick={() => handleAnswer('incorrect')}
                px={8}
                py={6}
                fontSize="lg"
                leftIcon={<Text fontSize="2xl">✗</Text>}
                _hover={{ bg: "red.500" }}
              >
                Incorrect
                <Text fontSize="xs" ml={2}>(2 or I)</Text>
              </Button>
            </HStack>
          )}
        </VStack>
      </ModalContent>
    </Modal>
  );
};

export default ReviewSession;
