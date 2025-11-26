import React, { useContext, useState } from "react";
import {
  Box,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { FlashcardContext } from "./FlashcardContext.jsx";
import { DeleteIcon } from "@chakra-ui/icons";
import ConfirmDelete from "./ConfirmDelete.jsx";
import "./FlashcardGrid.css";

const FlashcardGrid = ({ onEditFlashcard, questionFirst }) => {
  const { flashcards, removeFlashcard } = useContext(FlashcardContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [flashcardToDelete, setFlashcardToDelete] = React.useState(null);
  const [flippedCards, setFlippedCards] = useState({});
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

  return (
    <Box>
      <SimpleGrid columns={3} spacing={5}>
        {flashcards.map((flashcard) => {
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
              onClick={(e) => handleFlip(flashcard.id, e)}
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
      <ConfirmDelete
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default FlashcardGrid;
