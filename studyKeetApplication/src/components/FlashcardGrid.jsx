import React, { useContext, useState, useEffect } from "react";
import {
  Box,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Divider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  HStack,
} from "@chakra-ui/react";
import { FlashcardContext } from "./FlashcardContext.jsx";
import { DeleteIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@chakra-ui/icons";
import ConfirmDelete from "./ConfirmDelete.jsx";
import "./FlashcardGrid.css";

const FlashcardGrid = ({ onEditFlashcard, questionFirst }) => {
  const { flashcards, removeFlashcard } = useContext(FlashcardContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [flashcardToDelete, setFlashcardToDelete] = React.useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedFlipped, setExpandedFlipped] = useState(false);
  const toast = useToast();

  const handleDelete = (flashcard) => {
    setFlashcardToDelete(flashcard);
    onOpen();
  };

  const confirmDelete = () => {
    removeFlashcard(flashcardToDelete.id);
    toast({
      title: "Flashcard deleted.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    onClose();
  };

  const handleFlip = (id, e) => {
    // Prevent flip when clicking delete button
    if (e.target.closest('button')) return;
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCardClick = (index, e) => {
    // Prevent opening modal when clicking delete button
    if (e.target.closest('button')) return;
    setExpandedIndex(index);
    setExpandedFlipped(false);
  };

  const handleExpandedFlip = () => {
    setExpandedFlipped(prev => !prev);
  };

  const handleCloseExpanded = () => {
    setExpandedIndex(null);
    setExpandedFlipped(false);
  };

  const handleNavigate = (direction) => {
    if (expandedIndex === null) return;
    const newIndex = (expandedIndex + direction + flashcards.length) % flashcards.length;
    setExpandedIndex(newIndex);
    setExpandedFlipped(false);
  };

  useEffect(() => {
    if (expandedIndex === null) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleNavigate(-1);
      } else if (e.key === 'ArrowRight') {
        handleNavigate(1);
      } else if (e.key === 'Escape') {
        handleCloseExpanded();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleExpandedFlip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedIndex, flashcards.length]);

  const expandedFlashcard = expandedIndex !== null ? flashcards[expandedIndex] : null;
  const showingQuestionExpanded = expandedFlashcard && (questionFirst ? !expandedFlipped : expandedFlipped);

  return (
    <Box>
      <SimpleGrid columns={3} spacing={5}>
        {flashcards.map((flashcard, index) => {
          const isFlipped = flippedCards[flashcard.id];
          // If questionFirst is true: show question on front (!isFlipped), answer on back (isFlipped)
          // If questionFirst is false: show answer on front (!isFlipped), question on back (isFlipped)
          const showingQuestion = questionFirst ? !isFlipped : isFlipped;
          
          return (
            <Box
              key={flashcard.id}
              className="flashcard-container"
              h={"auto"}
              minH={{ base: "200px", md: "200px", xl: "200px" }}
              w={"auto"}
              position="relative"
              onClick={(e) => handleCardClick(index, e)}
              cursor="pointer"
            >
              <Box
                className={`flashcard ${isFlipped ? 'flipped' : ''}`}
                h="100%"
              >
                {/* Front side */}
                <Box
                  className="flashcard-front"
                  p={5}
                  shadow="md"
                  borderRadius="md"
                  bgColor={flashcard.color}
                  position="absolute"
                  width="100%"
                  height="100%"
                  boxShadow="dark-lg"
                  display="flex"
                  flexDirection="column"
                >
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete Flashcard"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(flashcard);
                    }}
                    position="absolute"
                    top={1}
                    right={1}
                    h={6}
                    w={6}
                    zIndex="10"
                  />
                  <Box>
                    <Box fontWeight="bold">
                      {flashcard.subject && `〘${flashcard.subject}〙`}
                    </Box>
                    <Divider variant="postit" />
                    <Box ml={2} mr={2} mt={2} fontWeight="semibold" fontSize="sm" color="gray.600">
                      {questionFirst ? "QUESTION:" : "ANSWER:"}
                    </Box>
                    <Box ml={2} mr={2} mt={1}>
                      {showingQuestion ? flashcard.question : flashcard.answer}
                    </Box>
                  </Box>
                </Box>

                {/* Back side */}
                <Box
                  className="flashcard-back"
                  p={5}
                  shadow="md"
                  borderRadius="md"
                  bgColor={flashcard.color}
                  position="absolute"
                  width="100%"
                  height="100%"
                  boxShadow="dark-lg"
                  display="flex"
                  flexDirection="column"
                >
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete Flashcard"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(flashcard);
                    }}
                    position="absolute"
                    top={1}
                    right={1}
                    h={6}
                    w={6}
                    zIndex="10"
                  />
                  <Box>
                    <Box fontWeight="bold">
                      {flashcard.subject && `〘${flashcard.subject}〙`}
                    </Box>
                    <Divider variant="postit" />
                    <Box ml={2} mr={2} mt={2} fontWeight="semibold" fontSize="sm" color="gray.600">
                      {questionFirst ? "ANSWER:" : "QUESTION:"}
                    </Box>
                    <Box ml={2} mr={2} mt={1}>
                      {showingQuestion ? flashcard.answer : flashcard.question}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Expanded Flashcard Modal */}
      <Modal isOpen={expandedIndex !== null} onClose={handleCloseExpanded} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent
          bg="transparent"
          boxShadow="none"
          maxW="600px"
          p={0}
        >
          <Box position="relative">
            {/* Navigation and Close buttons */}
            <HStack
              position="absolute"
              top="-60px"
              left="50%"
              transform="translateX(-50%)"
              spacing={4}
              zIndex={20}
            >
              <IconButton
                aria-label="Previous flashcard"
                icon={<ChevronLeftIcon />}
                onClick={() => handleNavigate(-1)}
                colorScheme="teal"
                size="lg"
                borderRadius="full"
              />
              <IconButton
                aria-label="Close"
                icon={<CloseIcon />}
                onClick={handleCloseExpanded}
                colorScheme="red"
                size="lg"
                borderRadius="full"
              />
              <IconButton
                aria-label="Next flashcard"
                icon={<ChevronRightIcon />}
                onClick={() => handleNavigate(1)}
                colorScheme="teal"
                size="lg"
                borderRadius="full"
              />
            </HStack>

            {/* Expanded Flashcard */}
            {expandedFlashcard && (
              <Box
                className="flashcard-container-expanded"
                h="400px"
                w="600px"
                position="relative"
                onClick={handleExpandedFlip}
                cursor="pointer"
              >
                <Box
                  className={`flashcard ${expandedFlipped ? 'flipped' : ''}`}
                  h="100%"
                >
                  {/* Front side */}
                  <Box
                    className="flashcard-front"
                    p={10}
                    shadow="2xl"
                    borderRadius="xl"
                    bgColor={expandedFlashcard.color}
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                  >
                    <Box>
                      <Box fontWeight="bold" fontSize="xl" mb={4}>
                        {expandedFlashcard.subject && `〘${expandedFlashcard.subject}〙`}
                      </Box>
                      <Divider variant="postit" mb={4} />
                      <Box fontWeight="bold" fontSize="lg" color="gray.700" mb={3}>
                        {questionFirst ? "QUESTION:" : "ANSWER:"}
                      </Box>
                      <Box fontSize="lg" lineHeight="tall">
                        {showingQuestionExpanded ? expandedFlashcard.question : expandedFlashcard.answer}
                      </Box>
                    </Box>
                  </Box>

                  {/* Back side */}
                  <Box
                    className="flashcard-back"
                    p={10}
                    shadow="2xl"
                    borderRadius="xl"
                    bgColor={expandedFlashcard.color}
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                  >
                    <Box>
                      <Box fontWeight="bold" fontSize="xl" mb={4}>
                        {expandedFlashcard.subject && `〘${expandedFlashcard.subject}〙`}
                      </Box>
                      <Divider variant="postit" mb={4} />
                      <Box fontWeight="bold" fontSize="lg" color="gray.700" mb={3}>
                        {questionFirst ? "ANSWER:" : "QUESTION:"}
                      </Box>
                      <Box fontSize="lg" lineHeight="tall">
                        {showingQuestionExpanded ? expandedFlashcard.answer : expandedFlashcard.question}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
        </ModalContent>
      </Modal>

      <ConfirmDelete
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default FlashcardGrid;
