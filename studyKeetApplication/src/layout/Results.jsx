import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Flex,
  Spacer,
  Heading,
  Button,
  Text,
  IconButton,
  HStack,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  VStack,
  Input,
  Textarea,
  useDisclosure,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon, DeleteIcon, EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard.jsx";
import axios from "axios";
import "./Results.css";

export default function Results() {
  const [savedResults, setResults] = useState("");
  const [savedContentType, setContentType] = useState("");
  const [savedOption, setOption] = useState("");
  const [coverage, setCoverage] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewFlashcards, setPreviewFlashcards] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const tabs = ["Coverage", "Accuracy"];
  const prevIndex = useRef(0);

  const { isOpen: isPreviewOpen, onOpen: onPreviewOpen, onClose: onPreviewClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // Retrieve the saved data from local storage
    const results = localStorage.getItem("result");

    const contentType = localStorage.getItem("contentType");
    const option = localStorage.getItem("selectedOption");
    localStorage.clear();
    if (contentType) setContentType(contentType);
    if (option) setOption(option);
    if (results) {
      console.log("Raw results data:", results);
      try {
        const parsedResult = JSON.parse(results);
        // adapt to new backend shape if present
        if (parsedResult.coverage || parsedResult.accuracy) {
          setCoverage(parsedResult.coverage ?? "");
          setAccuracy(parsedResult.accuracy ?? "");
        } else if (option !== "Teach" && Array.isArray(parsedResult.result)) {
          setCoverage(parsedResult.result[0]);
          setAccuracy(parsedResult.result[1]);
        } else if (parsedResult.result) {
          // For Summarize/Question modes - extract the result string
          setResults(parsedResult.result);
        } else {
          setResults(results);
        }
      } catch (error) {
        // console.error("Error parsing results:", error);
        setResults(results); // Fall back to the original results
      }
    }
  }, []);
  
  useEffect(() => {
    function onKey(e) {
      if (e.key === "ArrowLeft") {
        setActiveIndex((s) => (s - 1 + tabs.length) % tabs.length);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((s) => (s + 1) % tabs.length);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  // We display the content inside <pre> (via ResultCard) to preserve bullets and paragraph breaks.

  const showResults = savedContentType && savedOption;
  const showTabs = savedOption === "Teach"; // Only show tabs for Teach mode
  const isSingleResult = savedOption === "Summary" || savedOption === "Query";

  const coverageContent = coverage !== null && coverage !== undefined ? coverage : savedResults;
  const accuracyContent = accuracy !== null && accuracy !== undefined ? accuracy : savedResults;

  // Debug logging
  console.log("Display state:", {
    savedOption,
    showResults,
    showTabs,
    isSingleResult,
    savedResults: savedResults ? `${savedResults.substring(0, 50)}...` : null,
    coverage: coverage ? `${coverage.substring(0, 50)}...` : null,
    accuracy: accuracy ? `${accuracy.substring(0, 50)}...` : null,
    coverageContent: coverageContent ? `${coverageContent.substring(0, 50)}...` : null
  });

  const handleGenerateFlashcards = async () => {
    setIsGenerating(true);
    try {
      let sourceType = "";
      let content = "";
      
      // Determine source type based on current view and savedOption
      if (savedOption === "Summary") {
        sourceType = "summary";
        content = savedResults || coverageContent;
      } else if (savedOption === "Teach") {
        // For Teach mode, use Coverage or Accuracy based on active tab
        if (activeIndex === 0) {
          sourceType = "coverage";
          content = coverageContent;
        } else {
          sourceType = "accuracy";
          content = accuracyContent;
        }
      } else if (savedOption === "Query") {
        sourceType = "qa_answer";
        content = savedResults || coverageContent;
      } else {
        throw new Error("Unknown option type");
      }

      // Call LLM to generate flashcards (don't save yet)
      const llmResponse = await axios.post("http://127.0.0.1:8000/flashcards/generate-preview", {
        source_type: sourceType,
        content: content
      });

      if (llmResponse.data.flashcards && llmResponse.data.flashcards.length > 0) {
        // Store flashcards for preview with subject
        setPreviewFlashcards(llmResponse.data.flashcards.map(card => ({
          ...card,
          subject: savedContentType || "General"
        })));
        onPreviewOpen();
      } else {
        toast({
          title: "No flashcards generated",
          description: "The AI couldn't extract flashcards from this content.",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }

    } catch (error) {
      console.error("Error generating flashcards:", error);
      const errorMessage = error.response?.data?.detail || error.message || "Failed to generate flashcards";
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFlashcards = async () => {
    setIsSaving(true);
    try {
      // Save all approved flashcards
      const colors = ["yellow.300", "pink.300", "blue.300", "green.300", "purple.300"];
      
      for (let i = 0; i < previewFlashcards.length; i++) {
        const card = previewFlashcards[i];
        await axios.post("http://127.0.0.1:8000/flashcards", {
          subject: card.subject,
          question: card.q || card.question,
          answer: card.a || card.answer,
          color: colors[i % colors.length]
        });
      }

      toast({
        title: "Flashcards Saved!",
        description: `Saved ${previewFlashcards.length} flashcards. Redirecting...`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onPreviewClose();
      
      // Navigate to flashcards page after 1 second
      setTimeout(() => {
        navigate("/flashcards");
      }, 1000);

    } catch (error) {
      console.error("Error saving flashcards:", error);
      toast({
        title: "Error",
        description: "Failed to save flashcards. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCard = (index) => {
    setPreviewFlashcards(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditCard = (index, field, value) => {
    setPreviewFlashcards(prev => prev.map((card, i) => {
      if (i === index) {
        return { ...card, [field]: value };
      }
      return card;
    }));
  };

  return (
    <div className="results-wrap">
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
        p={5}
      >
        {/* Outer teal box */}
        <Box
          borderRadius={50}
          boxShadow="dark-lg"
          p={8}
          bg="teal.300"
          width="100%"
          maxW="1100px"
          display="flex"
          justifyContent="center"
        >
          {/* Inner gray box with white border (like Timer) */}
          <Box
            borderRadius={50}
            boxShadow="dark-lg"
            p={10}
            bg="gray.800"
            width="100%"
            maxW="900px"
            borderColor="white"
            borderWidth="5px"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
          {/* Title - white color */}
          <Heading size="xl" textAlign="center" mb={6} color="yellow.100">
            {savedContentType && savedOption
              ? savedOption === "Summary"
                ? `Summary of Your ${savedContentType}`
                : savedOption === "Query"
                ? `Answer from Your ${savedContentType}`
                : savedOption === "Teach"
                ? `Evaluation of Your ${savedContentType}`
                : `Results from Your ${savedContentType}`
              : !savedContentType
              ? "Select your input source"
              : "Select an option"}
          </Heading>

          {/* Tab buttons with teal arrows - only show for Teach mode */}
          {showTabs && (
            <HStack justify="center" spacing={3} className="segment-row" mb={6}>
              <IconButton
                aria-label="previous"
                icon={<ChevronLeftIcon />}
                onClick={() => setActiveIndex((s) => (s - 1 + tabs.length) % tabs.length)}
                colorScheme="teal"
                variant="solid"
                size="sm"
              />

              {tabs.map((t, i) => (
                <Button
                  key={t}
                  onClick={() => setActiveIndex(i)}
                  bg={i === activeIndex ? "yellow.400" : "orange.300"}
                  color="white"
                  borderRadius={10}
                  boxShadow="0 0 0 3px rgba(237, 137, 54)"
                  px={6}
                  fontWeight="bold"
                  _hover={{ bg: i === activeIndex ? "yellow.500" : "orange.400" }}
                >
                  {t}
                </Button>
              ))}

              <IconButton
                aria-label="next"
                icon={<ChevronRightIcon />}
                onClick={() => setActiveIndex((s) => (s + 1) % tabs.length)}
                colorScheme="teal"
                variant="solid"
                size="sm"
              />
            </HStack>
          )}

          {/* White card for results */}
          <Box
            bg="white"
            borderRadius={20}
            p={6}
            boxShadow="md"
            width="100%"
            maxW="820px"
          >
            <Box>
              {showResults ? (
                isSingleResult ? (
                  // For Summarize and Question - show single result without tabs
                  <div className="card-stage">
                    <ResultCard 
                      key="single" 
                      title={savedOption === "Summary" ? "Summary" : "Answer"} 
                      content={coverageContent || "No content available"} 
                    />
                  </div>
                ) : savedOption === "Teach" && (coverage || accuracy) ? (
                  // For Teach mode - show Coverage/Accuracy tabs
                  <div className="card-stage">
                    {activeIndex === 0 ? (
                      <ResultCard key={0} title="Coverage" content={coverageContent || "No coverage content"} />
                    ) : (
                      <ResultCard key={1} title="Accuracy" content={accuracyContent || "No accuracy content"} />
                    )}
                  </div>
                ) : (
                  <Box textAlign="center">
                    <Heading size="md" color="#0f172a">
                      No results available
                    </Heading>
                  </Box>
                )
              ) : (
                <Box textAlign="center">
                  <Text color="#64748b">Choose a source and option to see results here.</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Navigation and Action buttons */}
          <Box mt={6} display="flex" justifyContent="center" gap={4}>
            {showResults && (
              <Button
                onClick={handleGenerateFlashcards}
                bgColor="purple.400"
                _hover={{ bg: "purple.500" }}
                color="white"
                borderRadius={10}
                px={6}
                py={2}
                boxShadow="xl"
                isLoading={isGenerating}
                loadingText="Generating..."
                leftIcon={isGenerating ? <Spinner size="sm" /> : null}
              >
                🃏 Make Flashcards
              </Button>
            )}
            
            {!savedContentType ? (
              <Button
                onClick={() => navigate("/source")}
                bgColor="orange.300"
                _hover={{ bg: "yellow.300", color: "teal.400" }}
                color="white"
                borderRadius={10}
                px={6}
                py={2}
                boxShadow="xl"
              >
                Go to Source Selection
              </Button>
            ) : (
              <Button
                onClick={() => navigate("/studyboard")}
                bgColor="orange.300"
                _hover={{ bg: "yellow.300", color: "teal.400" }}
                color="white"
                borderRadius={10}
                px={6}
                py={2}
                boxShadow="xl"
              >
                Go to Studyboard
              </Button>
            )}
          </Box>
        </Box>
        </Box>
      </Box>

      {/* Flashcard Preview Modal */}
      <Modal isOpen={isPreviewOpen} onClose={onPreviewClose} size="3xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="teal.300" maxH="90vh">
          <ModalHeader color="white" fontSize="2xl">
            Review Generated Flashcards ({previewFlashcards.length})
          </ModalHeader>
          <ModalBody bg="white" borderRadius="lg" mx={4} my={2} maxH="60vh" overflowY="auto">
            <VStack spacing={4} align="stretch">
              {previewFlashcards.map((card, index) => (
                <Box
                  key={index}
                  p={4}
                  bg="gray.50"
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor="gray.200"
                  position="relative"
                >
                  <HStack justify="space-between" mb={3}>
                    <Text fontWeight="bold" color="teal.600">
                      Card {index + 1}
                    </Text>
                    <HStack spacing={2}>
                      {editingIndex === index ? (
                        <IconButton
                          icon={<CheckIcon />}
                          size="sm"
                          colorScheme="green"
                          onClick={() => setEditingIndex(null)}
                          aria-label="Done editing"
                        />
                      ) : (
                        <IconButton
                          icon={<EditIcon />}
                          size="sm"
                          colorScheme="blue"
                          onClick={() => setEditingIndex(index)}
                          aria-label="Edit card"
                        />
                      )}
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleRemoveCard(index)}
                        aria-label="Remove card"
                      />
                    </HStack>
                  </HStack>

                  <VStack spacing={3} align="stretch">
                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={1}>
                        Question:
                      </Text>
                      {editingIndex === index ? (
                        <Textarea
                          value={card.q || card.question}
                          onChange={(e) => handleEditCard(index, 'q', e.target.value)}
                          size="sm"
                          bg="white"
                        />
                      ) : (
                        <Text fontSize="md" p={2} bg="white" borderRadius="md">
                          {card.q || card.question}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={1}>
                        Answer:
                      </Text>
                      {editingIndex === index ? (
                        <Textarea
                          value={card.a || card.answer}
                          onChange={(e) => handleEditCard(index, 'a', e.target.value)}
                          size="sm"
                          bg="white"
                        />
                      ) : (
                        <Text fontSize="md" p={2} bg="white" borderRadius="md">
                          {card.a || card.answer}
                        </Text>
                      )}
                    </Box>

                    <Box>
                      <Text fontWeight="bold" fontSize="sm" color="gray.600" mb={1}>
                        Subject:
                      </Text>
                      {editingIndex === index ? (
                        <Input
                          value={card.subject}
                          onChange={(e) => handleEditCard(index, 'subject', e.target.value)}
                          size="sm"
                          bg="white"
                        />
                      ) : (
                        <Text fontSize="sm" color="teal.600" fontWeight="semibold">
                          {card.subject}
                        </Text>
                      )}
                    </Box>
                  </VStack>
                </Box>
              ))}

              {previewFlashcards.length === 0 && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500">No flashcards to preview. All cards were removed.</Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button
                colorScheme="red"
                variant="outline"
                onClick={onPreviewClose}
                borderWidth="2px"
              >
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleSaveFlashcards}
                isDisabled={previewFlashcards.length === 0}
                isLoading={isSaving}
                loadingText="Saving..."
                px={8}
              >
                Save All ({previewFlashcards.length})
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
