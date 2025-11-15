import React, { useEffect, useState } from "react";
import {
  SlideFade,
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Spacer,
  Heading,
  Button,
  Text,
  Highlight,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { inView } from "framer-motion";

export default function Results() {
  const [savedResults, setResults] = useState("");
  const [savedContentType, setContentType] = useState("");
  const [savedOption, setOption] = useState("");
  const [coverage, setCoverage] = useState(null);
  const [accuracy, setAccuracy] = useState(null);

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
        if (option !== "Teach" && Array.isArray(parsedResult.result)) {
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
  const renderProcessedText = (text) => {
    return text.split("\n\n").map((paragraph, index) => {
      // Check if the paragraph should be a heading
      if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
        return (
          <Heading as="h3" size="lg" key={index} mt={4} mb={2}>
            {paragraph.replace(/\*\*/g, "")}
          </Heading>
        );
      } else {
        // Process each line within the paragraph
        return paragraph.split("\n").map((line, lineIndex) => {
          // Split by '**' to apply bold styling within a line
          const parts = line.split(/\*\*(.*?)\*\*/);

          // Split by '"' to apply highlight styling within a line
          const highlightedParts = parts.flatMap((part) =>
            part.split(/"(.*?)"/).map((subPart, subIndex) =>
              subIndex % 2 === 1 ? (
                <Highlight
                  key={subIndex}
                  query={subPart}
                  styles={{ bg: "yellow.200", fontWeight: "bold" }}
                >
                  {subPart}
                </Highlight>
              ) : (
                subPart
              )
            )
          );

          return (
            <Text fontSize="lg" key={`${index}-${lineIndex}`} mt={2} mb={2}>
              {highlightedParts.map((part, partIndex) =>
                typeof part === "string" ? (
                  part
                ) : (
                  <React.Fragment key={partIndex}>{part}</React.Fragment>
                )
              )}
            </Text>
          );
        });
      }
    });
  };

  return (
    <div>
      <SlideFade in={inView} offsetY="-50px">
        <Card
          p={50}
          margin={5}
          bgColor="teal.300"
          borderRadius={50}
          boxShadow="dark-lg"
          maxH="80vh"
          overflowY="auto"
        >
          <CardHeader>
            <Heading size="2xl" color="teal.900" textAlign="center">
              {savedContentType && savedOption
                ? `Summary of Your ${savedContentType}:`
                : !savedContentType
                ? "Select your input source"
                : "Select an option"}
            </Heading>
          </CardHeader>
          <CardBody>
            {savedContentType && savedOption ? (
              savedResults || coverage !== null || accuracy !== null ? (
                <Box textAlign="center">
                  {coverage !== null && accuracy !== null ? (
                    <>
                      <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
                        <Text fontSize="lg" color="teal.800">
                          <strong>Coverage:</strong> {coverage}%
                        </Text>
                        <Text fontSize="lg" color="teal.800" mt={4}>
                          <strong>Accuracy:</strong> {accuracy}%
                        </Text>
                      </Box>
                    </>
                  ) : (
                    <Box mt={4} p={4} borderWidth="1px" borderRadius="md">
                      {renderProcessedText(savedResults)}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box textAlign="center">
                  <Heading size="md" color="teal.800">
                    No results available
                  </Heading>
                </Box>
              )
            ) : !savedContentType ? (
              <Box textAlign="center">
                <Button
                  onClick={() => navigate("/source")}
                  bgColor={"orange.300"}
                  _hover={{ bg: "yellow.300", color: "teal.400" }}
                  color="white"
                  borderRadius={10}
                  p={2}
                  boxShadow="xl"
                  marginRight={2}
                  flexShrink={0}
                  mt={4}
                >
                  Go to Source Selection
                </Button>
              </Box>
            ) : (
              <Box textAlign="center">
                <Button
                  onClick={() => navigate("/studyboard")}
                  bgColor={"orange.300"}
                  _hover={{ bg: "yellow.300", color: "teal.400" }}
                  color="white"
                  borderRadius={10}
                  p={2}
                  boxShadow="xl"
                  marginRight={2}
                  flexShrink={0}
                  mt={4}
                >
                  Go to Studyboard
                </Button>
              </Box>
            )}
          </CardBody>
          <Flex>
            <Spacer />
            <CardFooter></CardFooter>
          </Flex>
        </Card>
      </SlideFade>
    </div>
  );
}
