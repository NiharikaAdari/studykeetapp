import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Select,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { FlashcardContext } from "./FlashcardContext.jsx";

const AddFlashcard = ({ selectedFlashcard, onFlashcardAdded }) => {
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [color, setColor] = useState("yellow.300");
  const { addFlashcard, updateFlashcard } = useContext(FlashcardContext);
  const toast = useToast();
  
  const colorGroups = {
    greens: ["green.200", "green.300", "green.400"],
    teals: ["teal.200", "teal.300", "teal.400"],
    cyans: ["cyan.300", "cyan.400", "cyan.500"],
    blues: ["blue.200", "blue.300", "blue.400"],
    purples: ["purple.200", "purple.300", "purple.400"],
    pinks: ["pink.200", "pink.300", "pink.400"],
    reds: ["red.300", "red.400", "red.500"],
    oranges: ["orange.200", "orange.300", "orange.400"],
    yellows: ["yellow.200", "yellow.300", "yellow.400"],
  };

  useEffect(() => {
    if (selectedFlashcard) {
      setSubject(selectedFlashcard.subject);
      setQuestion(selectedFlashcard.question);
      setAnswer(selectedFlashcard.answer);
      setColor(selectedFlashcard.color);
    } else {
      setSubject("");
      setQuestion("");
      setAnswer("");
      setColor("yellow.300");
    }
  }, [selectedFlashcard]);

  const handleSubmit = () => {
    if (selectedFlashcard) {
      updateFlashcard({
        ...selectedFlashcard,
        subject,
        question,
        answer,
        color,
      });
      toast({
        title: "Flashcard updated.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      addFlashcard({
        subject,
        question,
        answer,
        color,
      });
      toast({
        title: "Flashcard added.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
    onFlashcardAdded();
  };

  return (
    <Box>
      <FormControl mb={4}>
        <FormLabel>Subject</FormLabel>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
          bgColor="white"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Question</FormLabel>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter question"
          bgColor="white"
          minH="100px"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Answer</FormLabel>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter answer"
          bgColor="white"
          minH="100px"
        />
      </FormControl>
      <FormControl mb={4}>
        <FormLabel>Color</FormLabel>
        <Box
          bg="black"
          p={5}
          borderRadius="400px"
          mr={5}
          w={300}
          maxW="100%"
          display="flex"
          overflowX="scroll"
          scrollSnapType="x mandatory"
          __css={{
            "&::-webkit-scrollbar": {
              w: "2",
            },
            "&::-webkit-scrollbar-track": {
              w: "6",
              bg: `teal.300`,
              borderRadius: "10",
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: "5",
              bg: `gray.200`,
            },
          }}
        >
          {/* Scroll Snap Groups */}
          <Flex>
            {Object.keys(colorGroups).map((group) => (
              <Box
                key={group}
                display="flex"
                flexDirection="row"
                scrollSnapAlign="center"
                mr={4}
              >
                {colorGroups[group].map((clr) => (
                  <Box
                    key={clr}
                    width="30px"
                    height="30px"
                    borderRadius="full"
                    bg={clr}
                    cursor="pointer"
                    border={
                      color === clr
                        ? "2px solid black"
                        : "2px solid transparent"
                    }
                    onClick={() => setColor(clr)}
                    mr={2}
                  />
                ))}
              </Box>
            ))}
          </Flex>
        </Box>
      </FormControl>
      <Button
        bgColor={"orange.300"}
        _hover={{ bg: "yellow.300", color: "teal.400" }}
        color="white"
        borderRadius={10}
        p={2}
        boxShadow="xl"
        onClick={handleSubmit}
        marginRight={2}
        flexShrink={0}
      >
        {selectedFlashcard ? "Update Flashcard" : "Add Flashcard"}
      </Button>
    </Box>
  );
};

export default AddFlashcard;
