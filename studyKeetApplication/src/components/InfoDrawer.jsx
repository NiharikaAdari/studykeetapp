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
                  Don't just review, but ensure mastery of your subject matter!
                  StudyKeet, built around the renowned
                  <Popover>
                    <PopoverTrigger>
                      <Button
                        as="span"
                        variant="outline"
                        marginLeft={2}
                        marginRight={2}
                        bgColor={"orange.300"}
                        _hover={{ bg: "orange.400" }}
                        borderRadius={50}
                      >
                        Feynman Technique
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent bgColor="orange.200" textColor="black">
                      <PopoverArrow />
                      <PopoverCloseButton />
                      <PopoverHeader>What is it?</PopoverHeader>
                      <PopoverBody>
                        The Feynman Technique is a powerful learning method that
                        involves teaching a concept to someone else in simple
                        terms to deepen your understanding of the subject. When
                        applied to a study application, this technique can be
                        leveraged to enhance learning by breaking down complex
                        topics into clear, concise explanations.
                      </PopoverBody>
                    </PopoverContent>
                  </Popover>
                  empowers you to understand and retain complex topics like
                  never before. Here's how it works:
                </Box>
              </div>

              <Divider marginTop={5} marginBottom={5} variant="brand" />
              <List spacing={3}>
                <ListItem>
                  <ListIcon as={MdOutlineMenuBook} color="green.500" />

                  <Highlight
                    query={["Input Content from Any Source:"]}
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "green.300",
                    }}
                  >
                    Input Content from Any Source: Upload PDFs or URLs
                    containing the material you need to study. Our app
                    transforms this information into an interactive learning
                    experience.
                  </Highlight>
                </ListItem>
                <ListItem>
                  <ListIcon as={MdSpatialAudioOff} color="green.500" />
                  <Highlight
                    query={["Teach What You've Learned:"]}
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "teal.300",
                    }}
                  >
                    Teach What You've Learned: Record yourself explaining the
                    content in your own words, either through audio or text.
                    This crucial step forces you to simplify and clarify the
                    concepts, revealing any gaps in your understanding.
                  </Highlight>
                </ListItem>
                <ListItem>
                  <ListIcon as={MdOutlineFactCheck} color="green.500" />
                  <Highlight
                    query={["AI-Powered Feedback:"]}
                    styles={{
                      px: "2",
                      py: "1",
                      rounded: "full",
                      bg: "cyan.300",
                    }}
                  >
                    AI-Powered Feedback: Our advanced AI analyzes your
                    explanation for two critical factors:
                  </Highlight>

                  <List>
                    <ListItem>
                      <ListIcon as={MdGpsFixed} color="green.500" />
                      <Highlight
                        query={["Coverage"]}
                        styles={{
                          px: "2",
                          py: "1",
                          rounded: "full",
                          bg: "yellow.300",
                        }}
                      >
                        Coverage: Did you touch on all the essential points from
                        the original content?
                      </Highlight>
                    </ListItem>
                    <ListItem>
                      <ListIcon as={MdGpsFixed} color="green.500" />
                      <Highlight
                        query={["Accuracy:"]}
                        styles={{
                          px: "2",
                          py: "1",
                          rounded: "full",
                          bg: "yellow.300",
                        }}
                      >
                        Accuracy: Is your explanation correct and clear?
                      </Highlight>
                    </ListItem>
                  </List>
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
