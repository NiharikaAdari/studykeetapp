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
  HStack,
  Button,
  Checkbox,
  Text,
} from "@chakra-ui/react";
import { FlashcardContext } from "./FlashcardContext.jsx";
import { DeleteIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, EditIcon } from "@chakra-ui/icons";
import ConfirmDelete from "./ConfirmDelete.jsx";
import "./FlashcardGrid.css";

const FlashcardGrid = ({ onEditFlashcard, questionFirst }) => {
  const { flashcards, removeFlashcard } = useContext(FlashcardContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
  const [flashcardToDelete, setFlashcardToDelete] = useState(null);
  const [flippedCards, setFlippedCards] = useState({});
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [expandedFlipped, setExpandedFlipped] = useState(false);
  const [selectedCards, setSelectedCards] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
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

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedCards([]);
  };

  const toggleCardSelection = (cardId) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedCards.length === 0) {
      toast({
        title: "No flashcards selected",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    onBulkOpen();
  };

  const confirmBulkDelete = () => {
    selectedCards.forEach(cardId => removeFlashcard(cardId));
    toast({
      title: `${selectedCards.length} flashcard(s) deleted.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setSelectedCards([]);
    setSelectionMode(false);
    onBulkClose();
  };

  const selectAll = () => {
    setSelectedCards(flashcards.map(card => card.id));
  };

  const deselectAll = () => {
    setSelectedCards([]);
  };

  const handleFlip = (id, e) => {
    // Prevent flip when clicking delete button or in selection mode
    if (e.target.closest('button') || selectionMode) return;
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCardClick = (index, e) => {
    // Prevent opening modal when clicking delete button or in selection mode
    if (e.target.closest('button') || selectionMode) return;
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

  const handleEdit = () => {
    if (expandedIndex !== null) {
      onEditFlashcard(flashcards[expandedIndex]);
      handleCloseExpanded();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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

  return (
    <Box>
      {/* Bulk Selection Controls */}
      <HStack mb={4} spacing={3} justify="space-between">
        <HStack spacing={3}>
          <Button
            size="sm"
            colorScheme={selectionMode ? "red" : "cyan"}
            onClick={toggleSelectionMode}
          >
            {selectionMode ? "Cancel" : "Select Multiple"}
          </Button>
          
          {selectionMode && (
            <>
              <Button size="sm" variant="outline" color="white" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" color="white" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={handleBulkDelete}
                isDisabled={selectedCards.length === 0}
                leftIcon={<DeleteIcon />}
              >
                Delete Selected ({selectedCards.length})
              </Button>
            </>
          )}
        </HStack>
        
        {selectionMode && (
          <Text fontSize="sm" color="gray.400">
            {selectedCards.length} of {flashcards.length} selected
          </Text>
        )}
      </HStack>

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
              onClick={(e) => {
                if (selectionMode) {
                  toggleCardSelection(flashcard.id);
                } else {
                  handleCardClick(index, e);
                }
              }}
              cursor="pointer"
              borderWidth={selectedCards.includes(flashcard.id) ? "4px" : "0px"}
              borderColor={selectedCards.includes(flashcard.id) ? "blue.500" : "transparent"}
              borderRadius="md"
              transition="all 0.2s"
            >
              {selectionMode && (
                <Checkbox
                  isChecked={selectedCards.includes(flashcard.id)}
                  onChange={() => toggleCardSelection(flashcard.id)}
                  position="absolute"
                  top={2}
                  left={2}
                  size="lg"
                  colorScheme="blue"
                  zIndex={100}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
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
                    icon={<EditIcon />}
                    aria-label="Edit Flashcard"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditFlashcard(flashcard);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    position="absolute"
                    top={1}
                    right={9}
                    h={6}
                    w={6}
                    minW={6}
                    zIndex="10"
                  />
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
                    minW={6}
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
                  {!selectionMode && (
                    <>
                      <IconButton
                        icon={<EditIcon />}
                        aria-label="Edit Flashcard"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFlashcard(flashcard);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        position="absolute"
                        top={1}
                        right={9}
                        h={6}
                        w={6}
                        minW={6}
                        zIndex="10"
                      />
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
                        minW={6}
                        zIndex="10"
                      />
                    </>
                  )}
                  <Box>
                    <Box fontWeight="bold">
                      {flashcard.subject && `〘${flashcard.subject}〙`}
                    </Box>
                    <Divider variant="postit" />
                    <Box ml={2} mr={2} mt={2} fontWeight="semibold" fontSize="sm" color="gray.600">
                      {questionFirst ? "ANSWER:" : "QUESTION:"}
                    </Box>
                    <Box ml={2} mr={2} mt={1}>
                      {showingQuestion ? flashcard.question : flashcard.answer}
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
            {/* Navigation and Action buttons */}
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
              <Button
                leftIcon={<EditIcon />}
                onClick={handleEdit}
                colorScheme="orange"
                size="lg"
                borderRadius="full"
              >
                Edit
              </Button>
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
            {expandedIndex !== null && flashcards[expandedIndex] && (
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
                    bgColor={flashcards[expandedIndex].color}
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box>
                      <Box fontWeight="bold" fontSize="md" mb={1}>
                        {flashcards[expandedIndex].subject && `〘${flashcards[expandedIndex].subject}〙`}
                      </Box>
                      <Divider variant="postit" mb={2} />
                      <Box fontWeight="semibold" fontSize="sm" color="gray.600" mb={2}>
                        {questionFirst ? "QUESTION:" : "ANSWER:"}
                      </Box>
                      <Box fontSize="lg" lineHeight="tall">
                        {questionFirst ? flashcards[expandedIndex].question : flashcards[expandedIndex].answer}
                      </Box>
                    </Box>
                  </Box>

                  {/* Back side */}
                  <Box
                    className="flashcard-back"
                    p={10}
                    shadow="2xl"
                    borderRadius="xl"
                    bgColor={flashcards[expandedIndex].color}
                    position="absolute"
                    width="100%"
                    height="100%"
                    display="flex"
                    flexDirection="column"
                  >
                    <Box>
                      <Box fontWeight="bold" fontSize="md" mb={1}>
                        {flashcards[expandedIndex].subject && `〘${flashcards[expandedIndex].subject}〙`}
                      </Box>
                      <Divider variant="postit" mb={2} />
                      <Box fontWeight="semibold" fontSize="sm" color="gray.600" mb={2}>
                        {questionFirst ? "ANSWER:" : "QUESTION:"}
                      </Box>
                      <Box fontSize="lg" lineHeight="tall">
                        {questionFirst ? flashcards[expandedIndex].answer : flashcards[expandedIndex].question}
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

      <ConfirmDelete
        isOpen={isBulkOpen}
        onClose={onBulkClose}
        onConfirm={confirmBulkDelete}
        message={`Are you sure you want to delete ${selectedCards.length} flashcard${selectedCards.length !== 1 ? 's' : ''}?`}
      />
    </Box>
  );
};

export default FlashcardGrid;
