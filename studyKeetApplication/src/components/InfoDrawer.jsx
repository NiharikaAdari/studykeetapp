import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Highlight,
  useDisclosure,
  Popover,
  PopoverHeader,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverCloseButton,
  PopoverBody,
  Text,
  Container,
  List,
  ListItem,
  ListIcon,
  Divider,
  Box,
  Img,
  IconButton,
} from "@chakra-ui/react";

// icons
import {
  MdOutlineFactCheck,
  MdSpatialAudioOff,
  MdOutlineMenuBook,
  MdGpsFixed,
} from "react-icons/md";
import parrotImage from "/assets/images/parrot.png";
import parrotHoverImage from "/assets/images/parrotclick.png";

import thotharam from "/assets/images/titleparrot1.png";
import thotharamclick from "/assets/images/titleparrot2.png";
import thotharamhover from "/assets/images/titleparrot3.png";

import React from "react";
import { useState } from "react";

export default function InfoDrawer() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const [imageSrc, setImageSrc] = useState(thotharam);

  const handleMouseDown = () => {
    setImageSrc(thotharamclick);
  };
  const handleMouseUp = () => {
    setTimeout(() => {
      setImageSrc(thotharam);
      onOpen(); // Open the drawer after resetting the image
    }, 100); // Delay of 100 milliseconds (adjust as needed)
  };
  return (
    <div>
      <IconButton
        ref={btnRef}
        aria-label="Open info drawer"
        icon={
          <Img
            src={imageSrc}
            alt="Parrot"
            boxSize="275"
            objectFit="cover"
            mb={-10}
            ml={-5}
          />
        }
        bg="transparent"
        _hover={{ bg: "transparent" }}
        _active={{ bg: "transparent" }}
        _focus={{ boxShadow: "none" }}
        borderRadius={400}
        h={200}
        w={220}
        m={0}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setImageSrc(thotharamhover)}
        onMouseLeave={() => setImageSrc(thotharam)}
      />

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />

        <DrawerContent
          w={500}
          maxW={500}
          bgColor="gray.800"
          textColor="gray.50"
          fontWeight="bold"
        >
          <DrawerCloseButton />
          <DrawerHeader>Unlock Your True Learning Potential!</DrawerHeader>
          <Divider colorScheme="green" variant="thick" marginBottom={5} />
          <DrawerBody p={0}>
            <Container p={5}>
              <div>
<Box>
  Don't just review — **master** your subjects with a system built
  for deep understanding and long-term memory! StudyKeet combines two
  powerful learning frameworks:

  {/* --- FEYNMAN TECHNIQUE POPOVER --- */}
  <Popover>
    <PopoverTrigger>
      <Button
        as="span"
        variant="outline"
        mx={1}
        my={1}
        bgColor={"teal.300"}
        _hover={{ bg: "teal.400" }}
        borderRadius={50}
      >
        Feynman Technique
      </Button>
    </PopoverTrigger>
    <PopoverContent bgColor="orange.200" textColor="black">
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader fontWeight="bold">
        What is the Feynman Technique?
      </PopoverHeader>
      <PopoverBody>
        A clarity-boosting method where you explain a concept simply —
        forcing your brain to identify gaps and rebuild understanding
        from the ground up.
      </PopoverBody>
    </PopoverContent>
  </Popover>

  and the

  {/* --- LEITNER SYSTEM POPOVER (Rule of Three) --- */}
  <Popover>
    <PopoverTrigger>
      <Button
        as="span"
        variant="outline"
        mx={1}
        my={1}
        bgColor={"cyan.300"}
        _hover={{ bg: "cyan.400" }}
        borderRadius={50}
      >
        Leitner System (4 Nests)
      </Button>
    </PopoverTrigger>
    <PopoverContent bgColor="cyan.200" textColor="black">
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader fontWeight="bold">
        What is the Leitner System?
      </PopoverHeader>
      <PopoverBody>
        A smart spaced-repetition method that moves each flashcard through
        four nests based on how confidently you answer:
        <br /><br />
        <strong>🪺 Nest 1 — Again:</strong> Review in 15 minutes for difficult cards.<br />
        <strong>🪺 Nest 2 — Hard:</strong> Review tomorrow (1 day).<br />
        <strong>🪺 Nest 3 — Good:</strong> Review in 2 days.<br />
        <strong>🪺 Nest 4 — Easy:</strong> Review weekly (7 days).<br /><br />
        This progressive nesting keeps your learning cycle natural and effective.
      </PopoverBody>
    </PopoverContent>
  </Popover>

  to help you understand, retain, and recall complex topics effortlessly.
  Here's how the system works:
</Box>

              </div>

              <Divider marginTop={5} marginBottom={5} variant="brand" />
              <List spacing={6}>

  {/* --- FEYNMAN TECHNIQUE SECTION --- */}
  <Text fontSize="xl" color="teal.300" mt={4}>
    Feynman Technique
  </Text>
  <Divider borderColor="teal.400" mb={2} />

  <ListItem>
    <ListIcon as={MdOutlineMenuBook} color="green.500" />
    <Highlight
      query={["Input Content from Any Source:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "green.300" }}
    >
      Input Content from Any Source: Upload PDFs or URLs containing the
      material you need to study. Our app transforms this information
      into an interactive learning experience.
    </Highlight>
  </ListItem>

  <ListItem>
    <ListIcon as={MdSpatialAudioOff} color="green.500" />
    <Highlight
      query={["Teach What You've Learned:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "teal.300" }}
    >
      Teach What You've Learned: Record yourself explaining the content
      in your own words. This forces clarity, revealing any gaps in
      understanding.
    </Highlight>
  </ListItem>

  <ListItem>
    <ListIcon as={MdOutlineFactCheck} color="green.500" />
    <Highlight
      query={["AI-Powered Feedback:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "cyan.300" }}
    >
      AI-Powered Feedback: Automatically checks for coverage and accuracy.
    </Highlight>

    <List spacing={2} mt={2} ml={6}>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.500" />
        <Highlight
          query={["Coverage"]}
          styles={{ px: "2", py: "1", rounded: "full", bg: "yellow.300" }}
        >
          Coverage: Did you include the key ideas?
        </Highlight>
      </ListItem>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.500" />
        <Highlight
          query={["Accuracy:"]}
          styles={{ px: "2", py: "1", rounded: "full", bg: "yellow.300" }}
        >
          Accuracy: Did you explain everything correctly?
        </Highlight>
      </ListItem>
    </List>
  </ListItem>

  {/* --- FLASHCARDS SECTION --- */}
  <Text fontSize="xl" color="pink.300" mt={4}>
    Flashcards System
  </Text>
  <Divider borderColor="pink.400" mb={2} />

  <ListItem>
    <ListIcon as={MdOutlineMenuBook} color="green.500" />
    <Highlight
      query={["Build Your Own Flashcards Board:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "pink.300" }}
    >
      Build Your Own Flashcards Board: Create clear, focused flashcards —
      one idea per card. Edit, filter, and study them index-card style.
    </Highlight>
  </ListItem>

  <ListItem>
    <ListIcon as={MdSpatialAudioOff} color="green.500" />
    <Highlight
      query={["Automatic Flashcard Generation:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "purple.300" }}
    >
      Automatic Flashcard Generation: The AI extracts strong question-answer
      flashcards from your explanations. Save them directly into your deck.
    </Highlight>
  </ListItem>

  {/* --- LEITNER SYSTEM SECTION --- */}
  <Text fontSize="xl" color="cyan.300" mt={4}>
    Leitner System (Rule of Three)
  </Text>
  <Divider borderColor="cyan.400" mb={2} />

  <ListItem>
    <ListIcon as={MdOutlineFactCheck} color="green.500" />
    <Highlight
      query={["Master with the Leitner System:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "cyan.300" }}
    >
      Master with the Leitner System: Smart spaced repetition simplified
      into 3 adaptive boxes for powerful learning.
    </Highlight>

    <List spacing={2} mt={2} ml={6}>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        <Highlight
          query={["Box 1 — Learning"]}
          styles={{ px: "2", py: "1", rounded: "full", bg: "yellow.300" }}
        >
         🪺 Nest 1 — Again: Review in 15 minutes for difficult cards.
        </Highlight>
      </ListItem>
        
        
       
        
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        <Highlight
          query={["Box 2 — Reviewing"]}
          styles={{ px: "2", py: "1", rounded: "full", bg: "yellow.300" }}
        >
          🪺 Nest 2 — Hard: Review tomorrow (1 day).
        </Highlight>
      </ListItem>

      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        <Highlight
          query={["Box 3 — Mastered"]}
          styles={{ px: "2", py: "1", rounded: "full", bg: "yellow.300" }}
        >
           🪺 Nest 3 — Good: Review in 2 days.
        </Highlight>
      </ListItem>
    </List>
  </ListItem>

  {/* --- LEARNING SESSION SECTION --- */}
  <Text fontSize="xl" color="teal.300" mt={4}>
    Learning Sessions
  </Text>
  <Divider borderColor="teal.400" mb={2} />

  <ListItem>
    <ListIcon as={MdOutlineFactCheck} color="green.500" />
    <Highlight
      query={["Start a Learning Session:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "teal.300" }}
    >
      Start a Learning Session: StudyKeet shows only the cards due today
      based on your personalized Leitner schedule.
    </Highlight>

    <List spacing={2} mt={2} ml={6}>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        Flip the card (tap or press Space).
      </ListItem>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        Mark Correct or Incorrect (or use arrows).
      </ListItem>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        Cards automatically move to the right Leitner box.
      </ListItem>
      <ListItem>
        <ListIcon as={MdGpsFixed} color="green.400" />
        Progress + next review date saved instantly.
      </ListItem>
    </List>
  </ListItem>

  {/* --- SESSION SUMMARY SECTION --- */}
  <Text fontSize="xl" color="blue.300" mt={4}>
    Session Summary
  </Text>
  <Divider borderColor="blue.400" mb={2} />

  <ListItem>
    <ListIcon as={MdOutlineFactCheck} color="green.500" />
    <Highlight
      query={["Session Summary:"]}
      styles={{ px: "2", py: "1", rounded: "full", bg: "blue.300" }}
    >
      Session Summary: Get a breakdown of how many cards you mastered,
      improved, or reset — track your progress over time.
    </Highlight>
  </ListItem>

</List>

            </Container>
          </DrawerBody>

          <DrawerFooter>
            <Button
              variant="outline"
              bgColor={"orange.300"}
              color={"white"}
              _hover={{ bg: "yellow.300", color: "teal.400" }}
              borderRadius={50}
              mr={3}
              onClick={onClose}
            >
              Get Started!
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
