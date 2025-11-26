import React from "react";
import { Box, HStack, IconButton, Image, Text, Tooltip } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import eggImage from "/assets/images/dinosaur-egg.png";

export default function EggCard({ egg, onSelect, onEdit, onDelete, isSelectable = false, isSelected = false }) {
  return (
    <Box
      role="group"
      position="relative"
      cursor={isSelectable ? "default" : "pointer"}
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
      px={2}
      py={6}
      transition="transform 0.2s ease"
      onClick={() => !isSelectable && onSelect?.(egg)}
      _hover={{ transform: isSelectable ? "none" : "translateY(-6px)" }}
      borderWidth={isSelected ? "3px" : "0"}
      borderColor={isSelected ? "blue.500" : "transparent"}
      borderRadius="md"
    >
      <Image
        src={eggImage}
        alt="Study material egg"
        maxW="220px"
        w="100%"
        h="auto"
        pointerEvents="none"
        transition="filter 0.2s ease"
        filter={
          [
            "drop-shadow(0 0 0 rgba(56, 178, 172, 1))",
            "drop-shadow(0 0 2px rgba(56, 178, 172, 0.95))",
            "drop-shadow(1px 0 0 rgba(56, 178, 172, 0.9))",
            "drop-shadow(-1px 0 0 rgba(56, 178, 172, 0.9))",
            "drop-shadow(0 1px 0 rgba(56, 178, 172, 0.9))",
            "drop-shadow(0 -1px 0 rgba(56, 178, 172, 0.9))",
            "drop-shadow(18px 28px 40px rgba(15, 23, 42, 0.65))",
          ].join(" ")
        }
        _groupHover={{
          filter: [
            "drop-shadow(0 0 0 rgba(56, 178, 172, 1))",
            "drop-shadow(0 0 4px rgba(56, 178, 172, 1))",
            "drop-shadow(1.2px 0 0 rgba(56, 178, 172, 1))",
            "drop-shadow(-1.2px 0 0 rgba(56, 178, 172, 1))",
            "drop-shadow(0 1.2px 0 rgba(56, 178, 172, 1))",
            "drop-shadow(0 -1.2px 0 rgba(56, 178, 172, 1))",
            "drop-shadow(22px 34px 50px rgba(15, 23, 42, 0.78))",
          ].join(" ") + " brightness(1.12)",
        }}
      />

      <Box mt={4} px={4} maxW="240px">
        <Text fontWeight="bold" fontSize="lg" noOfLines={2}>
          {egg.name}
        </Text>
        <Text fontSize="sm" color="gray.600">
          {egg.type}
        </Text>
      </Box>

      {!isSelectable && (
        <HStack position="absolute" top={3} right={3} spacing={1}>
          <Tooltip label="Edit egg" placement="top">
            <IconButton
              aria-label="Edit egg"
              size="sm"
              icon={<EditIcon />}
              onClick={(event) => {
                event.stopPropagation();
                onEdit?.(egg);
              }}
            />
          </Tooltip>
          <Tooltip label="Delete egg" placement="top">
            <IconButton
              aria-label="Delete egg"
              size="sm"
              colorScheme="red"
              icon={<DeleteIcon />}
              onClick={(event) => {
                event.stopPropagation();
                onDelete?.(egg);
              }}
            />
          </Tooltip>
        </HStack>
      )}
    </Box>
  );
}
