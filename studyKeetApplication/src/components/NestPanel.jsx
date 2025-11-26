import React, { useState } from "react";
import {
  Box,
  Button,
  HStack,
  IconButton,
  Image,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";
import nestImage from "/assets/images/nest.png";
import NestManager from "./NestManager.jsx";
import { useNestContext } from "./NestContext.jsx";

export default function NestPanel({ activeNestId, onSelectNest }) {
  const { 
    nests, 
    addNest, 
    updateNest, 
    removeNest, 
    highlightMode, 
    setHighlightMode,
    selectNestForSaving,
    selectedNestForSaving,
    currentEggName 
  } = useNestContext();
  const toast = useToast();
  const managerDisclosure = useDisclosure();
  const [mode, setMode] = useState("create");
  const [targetNest, setTargetNest] = useState(null);

  const handleCreate = () => {
    setMode("create");
    setTargetNest(null);
    managerDisclosure.onOpen();
  };

  const handleEdit = (nest) => {
    setMode("edit");
    setTargetNest(nest);
    managerDisclosure.onOpen();
  };

  const handleDelete = (nest) => {
    const confirmDelete = window.confirm(
      `Delete the nest "${nest.name}" and all of its study materials?`
    );
    if (!confirmDelete) return;
    removeNest(nest.id);
    toast({
      title: "Nest deleted",
      status: "info",
      duration: 2500,
      isClosable: true,
    });
    if (activeNestId === nest.id) {
      onSelectNest(null);
    }
  };

  const handleNestClick = (nest) => {
    if (highlightMode) {
      // In highlight mode, check if egg has a name first
      if (!currentEggName?.trim()) {
        toast({
          title: "🥚 Name your egg first!",
          description: "Please enter a name for your study material above",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Select this nest for saving
      selectNestForSaving(nest.id);
      toast({
        title: `🪺 ${nest.name} selected!`,
        description: `Ready to save "${currentEggName.trim()}"`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      // Normal mode - just select the nest
      onSelectNest(nest.id);
    }
  };

  const handleSubmit = (name) => {
    if (mode === "edit" && targetNest) {
      updateNest(targetNest.id, { name });
      toast({ title: "Nest updated", status: "success", duration: 2500, isClosable: true });
    } else {
      addNest(name);
      toast({ title: "Nest created", status: "success", duration: 2500, isClosable: true });
    }
    managerDisclosure.onClose();
  };

  return (
    <Box 
      bg="gray.800" 
      py={4} 
      px={6} 
      boxShadow="inner"
      border={highlightMode ? "3px solid" : "none"}
      borderColor={highlightMode ? "orange.300" : "transparent"}
      transition="all 0.3s ease"
    >
      <HStack justify="space-between" mb={3}>
        <Text 
          color={highlightMode ? "orange.200" : "white"} 
          fontWeight="semibold"
          fontSize={highlightMode ? "lg" : "md"}
        >
          {highlightMode ? "🪺 Your Nests - Click to Save!" : "Your Nests"}
        </Text>
        {!highlightMode && (
          <Button size="sm" colorScheme="teal" leftIcon={<AddIcon />} onClick={handleCreate}>
            New Nest
          </Button>
        )}
      </HStack>

      <Box overflowX="auto" py={2}>
        <HStack spacing={4} align="stretch" minH="110px">
          {nests.length === 0 ? (
            <Text color="gray.300">Tap "New Nest" to start organizing your materials.</Text>
          ) : (
            nests.map((nest) => {
              const isActive = activeNestId === nest.id;
              const isSelectedForSaving = selectedNestForSaving === nest.id;
              const isClickable = highlightMode || !isActive;
              
              return (
                <Box
                  key={nest.id}
                  role="group"
                  position="relative"
                  minW="180px"
                  borderRadius="xl"
                  borderWidth={isSelectedForSaving ? "4px" : isActive ? "3px" : "2px"}
                  borderColor={
                    isSelectedForSaving 
                      ? "orange.300" 
                      : isActive 
                        ? "teal.300" 
                        : highlightMode 
                          ? "orange.500" 
                          : "gray.600"
                  }
                  bg={highlightMode ? "orange.600" : "teal.600"}
                  color="white"
                  overflow="hidden"
                  cursor={isClickable ? "pointer" : "default"}
                  onClick={() => handleNestClick(nest)}
                  transition="all 0.2s ease"
                  _hover={isClickable ? { 
                    transform: "translateY(-4px)", 
                    borderColor: highlightMode ? "orange.200" : "teal.200",
                    boxShadow: highlightMode ? "0 8px 25px rgba(255, 165, 0, 0.3)" : "lg"
                  } : {}}
                  boxShadow={isSelectedForSaving ? "0 8px 25px rgba(255, 165, 0, 0.4)" : "none"}
                >
                  <Image src={nestImage} alt="Nest" objectFit="cover" h="100px" w="100%" opacity={0.85} />
                  <Box p={3}>
                    <Text fontWeight="bold" noOfLines={1}>
                      {nest.name}
                    </Text>
                    <Text fontSize="sm" color="gray.300">
                      {(nest.eggs ?? []).length} eggs
                    </Text>
                  </Box>
                  <HStack position="absolute" top={2} right={2} spacing={1} opacity={0} _groupHover={{ opacity: 1 }}>
                    <Tooltip label="Edit nest" placement="top">
                      <IconButton
                        aria-label="Edit nest"
                        size="sm"
                        icon={<EditIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleEdit(nest);
                        }}
                      />
                    </Tooltip>
                    <Tooltip label="Delete nest" placement="top">
                      <IconButton
                        aria-label="Delete nest"
                        size="sm"
                        colorScheme="red"
                        icon={<DeleteIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(nest);
                        }}
                      />
                    </Tooltip>
                  </HStack>
                </Box>
              );
            })
          )}
        </HStack>
      </Box>

      <NestManager
        isOpen={managerDisclosure.isOpen}
        mode={mode}
        initialName={targetNest?.name ?? ""}
        onClose={managerDisclosure.onClose}
        onSubmit={handleSubmit}
      />
    </Box>
  );
}
