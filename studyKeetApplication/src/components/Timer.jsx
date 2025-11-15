import React from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Heading,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";
export default function Timer() {
  //default settings are pomodoro 25 min, break 5 min, 4 sessions

  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const [sessions, setSessions] = useState(4);
  const [timeLeft, setTimeLeft] = useState(focusTime * 60); // Timer in seconds
  const [isFocus, setIsFocus] = useState(true); // Track whether it's focus or break time
  const [sessionCount, setSessionCount] = useState(0); // Track completed sessions
  const [isRunning, setIsRunning] = useState(false);

  // Total duration for either focus or break
  const totalTime = isFocus ? focusTime * 60 : breakTime * 60;

  useEffect(() => {
    let timer;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isFocus) {
        setTimeLeft(breakTime * 60);
        setIsFocus(false);
      } else {
        setSessionCount((prev) => prev + 1);
        if (sessionCount < sessions) {
          setTimeLeft(focusTime * 60);
          setIsFocus(true);
        } else {
          setIsRunning(false); // All sessions complete
        }
      }
    }
    return () => clearInterval(timer);
  }, [
    isRunning,
    timeLeft,
    isFocus,
    sessionCount,
    sessions,
    focusTime,
    breakTime,
  ]);
  const startTimer = () => {
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(focusTime * 60);
    setSessionCount(0);
    setIsFocus(true);
  };
  return (
    <div>
      {/* Display timer */}
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        height="100%"
        p={5}
      >
        <Box
          borderRadius={50}
          boxShadow={"dark-lg"}
          p={10}
          bg={"gray.800"}
          w={900}
          borderColor={"white"}
          borderWidth={"5px"}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <Heading
            mt={5}
            mb={-5}
            size="2xl"
            color="yellow.100"
            textAlign="center"
          >
            ⏲️TIMER⏲️
          </Heading>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            mt={20}
          >
            <CircularProgress
              value={(timeLeft / totalTime) * 100} // Calculate progress as a percentage
              size="250px"
              thickness="10px"
              color={isFocus ? "cyan.500" : "orange.500"}
            >
              <CircularProgressLabel
                fontSize="5xl"
                color="white"
                fontWeight="bold"
              >
                {Math.floor(timeLeft / 60)}:
                {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
              </CircularProgressLabel>
            </CircularProgress>
          </Box>

          <Flex mt={5} justifyContent="center" alignItems="center" gap={4}>
            {/* Timer buttons   */}
            <Button
              onClick={startTimer}
              isDisabled={isRunning}
              m={2}
              bgColor={"orange.300"}
              _hover={{ bg: "yellow.300", color: "teal.400" }}
              color="white"
              borderRadius={10}
              p={2}
              boxShadow="xl"
              size={"lg"}
            >
              Start
            </Button>
            <Button
              onClick={resetTimer}
              m={2}
              bgColor={"orange.300"}
              _hover={{ bg: "yellow.300", color: "teal.400" }}
              color="white"
              borderRadius={10}
              p={2}
              boxShadow="xl"
              size={"lg"}
            >
              Reset
            </Button>
          </Flex>
          {/* Settings */}
          <Box mx="auto" mt={5} maxW="400px">
            <Text mt={3} color={"white"}>
              Focus Time (minutes)
            </Text>
            <NumberInput
              value={focusTime}
              min={1}
              onChange={(value) => setFocusTime(parseInt(value))}
              bg="white"
              borderRadius={10}
              mb={5}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Text mt={3} color={"white"}>
              Break Time (minutes)
            </Text>
            <NumberInput
              value={breakTime}
              min={1}
              onChange={(value) => setBreakTime(parseInt(value))}
              bg="white"
              borderRadius={10}
              mb={5}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <Text mt={3} color={"white"}>
              Sessions
            </Text>
            <Slider
              value={sessions}
              min={1}
              max={10}
              onChange={(value) => setSessions(value)}
              colorScheme="orange"
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text ml={3} color={"white"}>
              Current: {sessionCount}/{sessions}
            </Text>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
