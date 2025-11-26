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
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import ResultCard from "../components/ResultCard.jsx";
import "./Results.css";

export default function Results() {
  const [savedResults, setResults] = useState("");
  const [savedContentType, setContentType] = useState("");
  const [savedOption, setOption] = useState("");
  const [coverage, setCoverage] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const tabs = ["Coverage", "Accuracy"];
  const prevIndex = useRef(0);

  const navigate = useNavigate();

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

  const coverageContent = coverage !== null && coverage !== undefined ? coverage : savedResults;
  const accuracyContent = accuracy !== null && accuracy !== undefined ? accuracy : savedResults;

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
              ? `Summary of Your ${savedContentType}:`
              : !savedContentType
              ? "Select your input source"
              : "Select an option"}
          </Heading>

          {/* Tab buttons with teal arrows */}
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
                (coverage || accuracy) ? (
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

          {/* Navigation buttons */}
          <Box mt={6} display="flex" justifyContent="center">
            {!savedContentType ? (
              <Button
                onClick={() => navigate("/source")}
                bgColor="orange.300"
                _hover={{ bg: "yellow.300", color: "teal.400" }}
                color="white"
                borderRadius={10}
                p={2}
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
                p={2}
                boxShadow="xl"
              >
                Go to Studyboard
              </Button>
            )}
          </Box>
        </Box>
        </Box>
      </Box>
    </div>
  );
}
