import React from "react";
import { Tab, Text } from "@chakra-ui/react";

export function TabButton({ children }) {
  return (
    <Tab
      bg="orange.300"
      color="white"
      borderRadius={10}
      marginBottom={-2}
      marginLeft={2}
      marginRight={2}
      _selected={{ color: "white", bg: "yellow.400" }}
      zIndex={0}
      position={"relative"}
      boxShadow="0 0 0 3px rgba(237, 137, 54)"
    >
      {/* 221, 107, 32 */}
      <Text as="b">{children}</Text>
    </Tab>
  );
}
