import React, { useState, useEffect, useContext } from "react";
import {
  Heading,
  SlideFade,
  Box,
  Flex,
  useDisclosure,
  Select,
  Switch,
  FormControl,
  FormLabel,
  HStack,
  Button,
  useToast,
  Tooltip,
  VStack,
  Text,
} from "@chakra-ui/react";
import { inView } from "framer-motion";

import AddFlashcard from "../components/AddFlashcard.jsx";
import FlashcardGrid from "../components/FlashcardGrid.jsx";
import LeitnerSession from "../components/LeitnerSession.jsx";
import ReviewSession from "../components/ReviewSession.jsx";
import { FlashcardContext, FlashcardProvider } from "../components/FlashcardContext.jsx";

export default function Flashcardsboard() {
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const { isOpen: isSessionOpen, onOpen: onSessionOpen, onClose: onSessionClose } = useDisclosure();
  const { isOpen: isReviewOpen, onOpen: onReviewOpen, onClose: onReviewClose } = useDisclosure();
  const [subjectFilter, setSubjectFilter] = useState("");
  const [questionFirst, setQuestionFirst] = useState(true);
  const [sessionPreview, setSessionPreview] = useState({});
  const { flashcards, fetchFlashcards, subjects, fetchDueFlashcards, sessionStats, fetchSessionStats, fetchSessionPreview } = useContext(FlashcardContext);
  const toast = useToast();

  const handleSubjectChange = (e) => {
    setSubjectFilter(e.target.value);
    fetchFlashcards(e.target.value);
    loadPreview();
  };

  useEffect(() => {
    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
    fetchSessionStats();
    loadPreview();
  }, []);

  const loadPreview = async () => {
    const preview = await fetchSessionPreview();
    setSessionPreview(preview);
  };

  const handleStartSession = async () => {
    const dueCards = await fetchDueFlashcards(subjectFilter);
    if (dueCards.length === 0) {
      toast({
        title: "No cards due",
        description: `You've reviewed all ${subjectFilter || 'cards'} for today!`,
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      onSessionOpen();
    }
  };

  const handleStartReview = () => {
    if (flashcards.length === 0) {
      toast({
        title: "No cards to review",
        description: "Add some flashcards or adjust your filters.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } else {
      onReviewOpen();
    }
  };

  return (
    <div>
      {/* Filter by subject and toggle question/answer first */}
      <SlideFade
        in={inView}
        offsetY="-50px"
        transition={{ enter: { delay: 0.15 } }}
      >
        <Box
          bg={"cyan.400"}
          p={5}
          ml={10}
          mr={10}
          borderRadius={50}
          display="flex"
          alignItems="center"
          gap={4}
        >
          <Select
            placeholder="Filter by subject"
            onChange={handleSubjectChange}
            bg={"white"}
            borderRadius={50}
            flex={1}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
          
          <FormControl display="flex" alignItems="center" w="auto">
            <FormLabel htmlFor="question-first" mb="0" color="white" fontWeight="bold">
              Question First
            </FormLabel>
            <Switch
              id="question-first"
              colorScheme="orange"
              size="lg"
              isChecked={questionFirst}
              onChange={(e) => setQuestionFirst(e.target.checked)}
            />
          </FormControl>

          <Tooltip
            label={
              <VStack align="start" spacing={1} p={2}>
                <Text fontWeight="bold" fontSize="md">
                  {subjectFilter || "All Subjects"}
                </Text>
                <Text fontSize="sm">
                  📊 {sessionPreview[subjectFilter || "All"]?.due_count || 0} cards due
                </Text>
                <HStack spacing={2} fontSize="xs">
                  <Text>🪺 N1: {sessionPreview[subjectFilter || "All"]?.box_1 || 0}</Text>
                  <Text>🪺 N2: {sessionPreview[subjectFilter || "All"]?.box_2 || 0}</Text>
                  <Text>🪺 N3: {sessionPreview[subjectFilter || "All"]?.box_3 || 0}</Text>
                  <Text>🪺 N4: {sessionPreview[subjectFilter || "All"]?.box_4 || 0}</Text>
                </HStack>
              </VStack>
            }
            bg="gray.800"
            color="white"
            borderRadius="lg"
            hasArrow
            placement="bottom"
          >
            <Button
              bgColor="green.300"
              size="lg"
              onClick={handleStartSession}
              borderRadius={50}
              px={8}
              fontWeight="bold"
              boxShadow="xl"
              _hover={{ bg: "yellow.200" }}
            >
              🎯 Start Learning Session
            </Button>
          </Tooltip>

          <Tooltip
            label={
              <VStack align="start" spacing={1} p={2}>
                <Text fontWeight="bold" fontSize="md">
                  {subjectFilter || "All Subjects"}
                </Text>
                <Text fontSize="sm">
                  📝 {flashcards.length} cards available
                </Text>
                <Text fontSize="xs" color="gray.300">
                  Practice without affecting Leitner progress
                </Text>
              </VStack>
            }
            bg="gray.800"
            color="white"
            borderRadius="lg"
            hasArrow
            placement="bottom"
          >
            <Button
              bgColor="green.300"
              size="lg"
              onClick={handleStartReview}
              borderRadius={50}
              px={8}
              fontWeight="bold"
              boxShadow="xl"
              _hover={{ bg: "yellow.200" }}
            >
              📝 Start Review Session
            </Button>
          </Tooltip>
        </Box>
      </SlideFade>

      {/* Leitner Learning Session Modal */}
      <LeitnerSession 
        isOpen={isSessionOpen} 
        onClose={onSessionClose} 
        questionFirst={questionFirst}
        subjectFilter={subjectFilter}
      />

      {/* Review Session Modal */}
      <ReviewSession 
        isOpen={isReviewOpen} 
        onClose={onReviewClose} 
        cards={flashcards}
        questionFirst={questionFirst}
      />
      
      <Flex
        direction={{ base: "column", md: "row" }}
        p={5}
      >
        <SlideFade
          in={inView}
          offsetX="-50px"
          transition={{ enter: { delay: 0.3 } }}
        >
          <Box
            flex={{ base: "none", md: "1" }}
            w={{ base: "100%", md: "auto" }}
            bgColor="teal.300"
            p={{ base: 5, md: 50 }}
            borderRadius={50}
            boxShadow="dark-lg"
            mb={{ base: 5, md: 0 }}
            margin={{ md: 5 }}
          >
            <Heading mb={4}>🃏 Add a Flashcard</Heading>
            <AddFlashcard
              selectedFlashcard={selectedFlashcard}
              onFlashcardAdded={() => setSelectedFlashcard(null)}
            />
          </Box>
        </SlideFade>

        <SlideFade
          in={inView}
          offsetX="50px"
          transition={{ enter: { delay: 0.45 } }}
        >
          <Box
            flex={{ base: "none", md: "2" }}
            w={{ base: "90vw", md: "50vw", xl: "60vw" }}
            h={{ base: "auto", md: "auto" }}
            minH={{ base: "200px", md: "300px", xl: "650px" }}
            boxShadow="dark-lg"
            ml={{ base: 0, md: 10 }}
            mt={5}
            borderRadius={50}
            p={{ base: 5, md: 50 }}
            bg={"gray.800"}
          >
            <FlashcardGrid
              onEditFlashcard={(flashcard) => {
                setSelectedFlashcard(flashcard);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              questionFirst={questionFirst}
            />
          </Box>
        </SlideFade>
      </Flex>
    </div>
  );
}
