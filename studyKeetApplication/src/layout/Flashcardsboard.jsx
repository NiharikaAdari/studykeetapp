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
} from "@chakra-ui/react";
import { inView } from "framer-motion";

import AddFlashcard from "../components/AddFlashcard.jsx";
import FlashcardGrid from "../components/FlashcardGrid.jsx";
import { FlashcardContext, FlashcardProvider } from "../components/FlashcardContext.jsx";

export default function Flashcardsboard() {
  const [selectedFlashcard, setSelectedFlashcard] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [subjectFilter, setSubjectFilter] = useState("");
  const [questionFirst, setQuestionFirst] = useState(true);
  const { fetchFlashcards, subjects } = useContext(FlashcardContext);

  const handleSubjectChange = (e) => {
    setSubjectFilter(e.target.value);
    fetchFlashcards(e.target.value);
  };

  useEffect(() => {
    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
  }, []);

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
        </Box>
      </SlideFade>
      
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
                onOpen();
              }}
              questionFirst={questionFirst}
            />
          </Box>
        </SlideFade>
      </Flex>
    </div>
  );
}
