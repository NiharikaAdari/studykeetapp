import React from "react";
import { Flex, Text, Spacer, Button, Box } from "@chakra-ui/react";
import InfoDrawer from "./InfoDrawer.jsx";

export default function Navbar() {
  return (
    <div>
      <Flex
        bg="gray.800"
        as="nav"
        p="10px"
        alignItems="center"
        gap="10px"
        boxShadow="dark-lg"
      >
        <Box mt={2} ml={0}>
          <InfoDrawer />
        </Box>
        <Spacer />
        <Text
          bgGradient="linear(to-br, gray.300, green.200, cyan.300, teal.400)"
          bgClip="text"
          fontSize="6xl"
          fontWeight="extrabold"
        >
          StudyKeet
        </Text>
      </Flex>
    </div>
  );
}
