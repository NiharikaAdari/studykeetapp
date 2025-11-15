import React from "react";
import axios from "axios";
import {
  Grid,
  GridItem,
  SlideFade,
  Fade,
  Box,
  useToast,
  Heading,
  Text,
  Spinner,
  Input,
  Button,
} from "@chakra-ui/react";
import { inView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function StudyBoard() {
  //question
  const [query, setQuery] = useState("");
  //adudio
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const mediaRecorderRef = useRef(null);
  //util
  const [selectedOption, setSelectedOption] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
  }, []);

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    localStorage.setItem("selectedOption", option);
  };

  //audio recording
  const startRecording = async () => {
    // Stop and clean up any existing recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setAudioBlob(null);
    setAudioUrl(null); // Clear the previous audio URL
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        setAudioBlob(audioBlob);
        //for audio file playback
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);

        toast({
          title: "Recording saved.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: "Error accessing microphone",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  // Stop audio recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    const contentType = localStorage.getItem("contentType");
    const content = localStorage.getItem("content");
    const option = localStorage.getItem("selectedOption");
    // localStorage.clear();
    console.log(
      "contentType:",
      contentType,
      "content:",
      content,
      "option:",
      option
    );

    if (option === "Timer") {
      navigate("/timer");
      return;
    }
    if (option === "Notes") {
      navigate("/notes");
      return;
    }
    if (!contentType || !content || !option) {
      toast({
        title: "Submission failed",
        description: "Please ensure all fields are filled out.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (option === "Teach" && !audioBlob) {
      toast({
        title: "Audio required",
        description: "Please record an explanation before submitting.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      let url = "";
      let formData = new FormData();

      if (contentType === "PDF") {
        formData.append("content_type", contentType);
        const response = await fetch(content);
        const blob = await response.blob();
        formData.append("file", blob, "file.pdf");
      } else {
        formData.append("content", content);
      }

      formData.append("content_type", contentType);
      if (option === "Summary") {
        url = "/summarize";
      } else if (option === "Teach") {
        url = "/grade";
        formData.append("audio", audioBlob, "explanation.wav");
      } else if (option === "Query") {
        url = "/answer_question";
        formData.append("question", query); // Append the question for the Query option
      }

      const response = await axios.post(
        `http://127.0.0.1:8000${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast({
        title: "Submission successful",
        description: "Your data has been sent.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Parsing the nested JSON string
      const parsedData = JSON.parse(response.data);
      const result = parsedData.result;

      console.log("response", result);
      localStorage.setItem("result", result);
      navigate("/results");
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Box
        position="relative"
        width="100%"
        maxWidth="1200px"
        mx="auto" // Centers the box horizontally
        height="100vh"
      >
        <Box
          position="relative"
          top={0}
          left={0}
          width="100%"
          height="100%"
          padding={5}
        >
          <Grid templateColumns="repeat(6, 1fr)" gap={10} p={5}>
            {/* Summary */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={2}
              h={{ base: 300, md: 300, xl: 300 }}
              w="300"
              onClick={() => handleOptionClick("Summary")}
            >
              <SlideFade
                in={inView}
                offsetX="-50px"
                transition={{ enter: { delay: 0.15 } }}
              >
                <Box
                  backgroundColor={
                    selectedOption === "Summary" ? "cyan.400" : "cyan.300"
                  }
                  h={{ base: 300, md: 300, xl: 300 }}
                  w="300"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Summary"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "cyan.400" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, cyan.500, gray.800)"
                    bgClip="text"
                  >
                    Summary
                  </Heading>
                  <Text fontSize={{ base: "md", md: "md", lg: "lg" }}>
                    📒Quickly distill complex information into concise summaries
                    that highlight key points and concepts. Perfect for
                    reviewing material efficiently and reinforcing your
                    understanding!
                  </Text>
                </Box>
              </SlideFade>
            </GridItem>

            {/* Quiz Me */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={2}
              h={{ base: 300, md: 300, xl: 300 }}
              w="300"
              onClick={() => handleOptionClick("Quiz")}
            >
              <SlideFade
                in={inView}
                offsetY="-50px"
                transition={{ enter: { delay: 0.3 } }}
              >
                <Box
                  backgroundColor={
                    selectedOption === "Quiz" ? "teal.300" : "teal.200"
                  }
                  h={{ base: 300, md: 300, xl: 300 }}
                  w="300"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Quiz"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "teal.300" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, teal.400, gray.800)"
                    bgClip="text"
                    mb={10}
                  >
                    Progress Tracker
                  </Heading>
                  <Text fontSize="2xl">
                    ✍️Monitor your learning journey with ease! Track your
                    progress through various chapters and topics, and stay
                    motivated by visualizing your achievements.
                  </Text>
                </Box>
              </SlideFade>
            </GridItem>

            {/* Notes */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={2}
              h={{ base: 300, md: 300, xl: 300 }}
              w="300"
              onClick={() => handleOptionClick("Notes")}
            >
              <SlideFade
                in={inView}
                offsetX="50px"
                transition={{ enter: { delay: 0.45 } }}
              >
                <Box
                  bg={selectedOption === "Notes" ? "cyan.400" : "cyan.300"}
                  h={{ base: 300, md: 300, xl: 300 }}
                  w="300"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Notes"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "cyan.400" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, cyan.500, gray.800)"
                    bgClip="text"
                    mb={10}
                  >
                    Notes
                  </Heading>
                  <Text fontSize="2xl">
                    📝Keep all your study notes in one place. Easily create,
                    edit, and organize notes with custom colors to enhance your
                    study experience and make information retrieval a breeze.
                  </Text>
                </Box>
              </SlideFade>
            </GridItem>

            {/* Teach */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={4}
              h="600"
              w="300"
              onClick={() => handleOptionClick("Teach")}
            >
              <SlideFade
                in={inView}
                offsetX="-50px"
                transition={{ enter: { delay: 0.9 } }}
              >
                <Box
                  bgColor={selectedOption === "Teach" ? "teal.300" : "teal.200"}
                  h="600"
                  w="300"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Teach"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "teal.300" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, teal.400, gray.800)"
                    bgClip="text"
                    mb={10}
                  >
                    Teach
                  </Heading>
                  <Text fontSize="2xl">
                    🎓 Apply the Feynman Technique by recording yourself
                    teaching the material. Refine your understanding and receive
                    feedback on your explanations to master the subject matter
                  </Text>
                  {isRecording ? (
                    <Button
                      onClick={stopRecording}
                      bg={
                        selectedOption === "Teach" ? "orange.400" : "orange.300"
                      }
                      _hover={{ bg: "yellow.300", color: "teal.400" }}
                      color="white"
                      size="lg"
                      mt={4}
                    >
                      🛑 Stop Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={startRecording}
                      bg={
                        selectedOption === "Teach" ? "orange.400" : "orange.300"
                      }
                      _hover={{ bg: "yellow.300", color: "teal.400" }}
                      color="white"
                      size="lg"
                      mt={4}
                    >
                      🗣️ Start Recording
                    </Button>
                  )}

                  {audioUrl && (
                    <Box mt={4}>
                      <audio controls>
                        <source src={audioUrl} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>
                    </Box>
                  )}
                </Box>
              </SlideFade>
            </GridItem>

            {/* Submit */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={2}
              h="250"
              w="250"
              marginTop={25}
            >
              <Fade in={inView} transition={{ enter: { delay: 1.05 } }}>
                <Box
                  bg="green.200"
                  h="250"
                  w="250"
                  borderRadius={50}
                  boxShadow="dark-lg"
                  cursor="pointer"
                  onClick={handleSubmit}
                  _hover={{ bg: "green.300" }}
                  display={"flex"}
                  alignContent={"center"}
                  alignItems={"center"}
                  justifyContent={"center"}
                  justifyItems={"center"}
                >
                  {isLoading ? (
                    <Spinner size="xl" thickness="10px" color="white" /> // Show Spinner if loading
                  ) : (
                    <Heading
                      bgGradient="linear(to-b, green.400, green.800)"
                      bgClip="text"
                    >
                      Go!
                    </Heading> // Show text if not loading
                  )}
                </Box>
              </Fade>
            </GridItem>

            {/*Timer*/}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 2 }}
              rowSpan={2}
              h={{ base: 300, md: 300, xl: 300 }}
              w="300"
              onClick={() => handleOptionClick("Timer")}
            >
              <SlideFade
                in={inView}
                offsetX="50px"
                transition={{ enter: { delay: 0.6 } }}
              >
                <Box
                  backgroundColor={
                    selectedOption === "Timer" ? "teal.300" : "teal.200"
                  }
                  h={{ base: 300, md: 300, xl: 300 }}
                  w="300"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Timer"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "teal.300" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, teal.400, gray.800)"
                    bgClip="text"
                    mb={10}
                  >
                    Timer
                  </Heading>
                  <Text fontSize="2xl">
                    ⏲️Boost your productivity with customizable timers. Use the
                    Pomodoro technique or set your own intervals to enhance
                    focus and manage study sessions effectively.
                  </Text>
                </Box>
              </SlideFade>
            </GridItem>

            {/* Query */}
            <GridItem
              colSpan={{ base: 6, md: 3, xl: 4 }}
              rowSpan={2}
              h="250"
              w="600"
              onClick={() => handleOptionClick("Query")}
            >
              <SlideFade
                in={inView}
                offsetY="50px"
                transition={{ enter: { delay: 0.75 } }}
              >
                <Box
                  bg={selectedOption === "Query" ? "cyan.400" : "cyan.300"}
                  h="250"
                  w="600"
                  borderRadius={50}
                  boxShadow={
                    selectedOption === "Query"
                      ? "2px 2px 2px gray"
                      : "5px 5px 5px gray"
                  }
                  cursor="pointer"
                  _hover={{ bg: "cyan.400" }}
                  display="flex"
                  flexDirection="column"
                  alignContent="center"
                  p={10}
                >
                  <Heading
                    bgGradient="linear(to-b, cyan.400, gray.800)"
                    bgClip="text"
                    mb={10}
                  >
                    Query
                  </Heading>
                  <Input
                    placeholder="❔Got questions? Ask Away!❔"
                    bgColor="white"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    size="lg"
                    mb={4}
                  />
                  <Button
                    onClick={handleSubmit}
                    bg={
                      selectedOption === "Query" ? "orange.400" : "orange.300"
                    }
                    _hover={{ bg: "yellow.300", color: "teal.400" }}
                    size="lg"
                    color={"white"}
                  >
                    Submit
                  </Button>
                </Box>
              </SlideFade>
            </GridItem>
          </Grid>
        </Box>
      </Box>
    </div>
  );
}
