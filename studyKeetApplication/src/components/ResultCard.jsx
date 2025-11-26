import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import "./ResultCard.css";

export default function ResultCard({ title, content }) {
  const formatContent = (text) => {
    if (!text) return null;

    // Split content into lines
    const lines = text.split('\n');
    const elements = [];
    let currentSection = null;

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Skip empty lines at the start
      if (!trimmedLine && elements.length === 0) return;

      // Check for section headers (bold text with **)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        const headerText = trimmedLine.replace(/\*\*/g, '');
        elements.push(
          <Box 
            key={`header-${index}`} 
            display="inline-block"
            bg="pink.200"
            px={3}
            py={1}
            borderRadius="md"
            mt={elements.length > 0 ? 6 : 0}
            mb={3}
          >
            <Heading as="h4" size="sm" color="#1a202c" fontWeight="bold" m={0}>
              {headerText}
            </Heading>
          </Box>
        );
        currentSection = headerText;
      }
      // Check for bullet points
      else if (trimmedLine.startsWith('*') && !trimmedLine.startsWith('**')) {
        const bulletText = trimmedLine.substring(1).trim();
        elements.push(
          <Box key={`bullet-${index}`} ml={4} mb={2} display="flex" alignItems="flex-start">
            <Text as="span" mr={2} color="#2d3748">•</Text>
            <Text as="span" color="#2d3748" lineHeight="1.6">{bulletText}</Text>
          </Box>
        );
      }
      // Regular text (paragraphs)
      else if (trimmedLine) {
        elements.push(
          <Text key={`text-${index}`} mb={3} color="#2d3748" lineHeight="1.7">
            {trimmedLine}
          </Text>
        );
      }
      // Empty line for spacing
      else if (trimmedLine === '' && elements.length > 0) {
        elements.push(<Box key={`space-${index}`} h={2} />);
      }
    });

    return elements;
  };

  return (
    <Box
      className="result-card fade-slide-in"
      bg="white"
      borderRadius="12px"
      boxShadow="lg"
      p={6}
      maxH="60vh"
      overflowY="auto"
      maxW="820px"
      width="90%"
      mx="auto"
    >
      <Heading as="h3" size="md" mb={4} color="#0f172a">
        {title}
      </Heading>

      <Box>
        {formatContent(content)}
      </Box>
    </Box>
  );
}
