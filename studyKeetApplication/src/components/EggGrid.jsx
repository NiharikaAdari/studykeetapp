import React, { useState } from "react";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Heading,
  Input,
  Text,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import EggCard from "./EggCard.jsx";
import { useNestContext } from "./NestContext.jsx";

export default function EggGrid({ nest, onBack }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { removeEgg, updateEgg } = useNestContext();
  const [editingEgg, setEditingEgg] = useState(null);
  const [newName, setNewName] = useState("");
  const editDisclosure = useDisclosure();

  const eggs = nest?.eggs ?? [];

  const handleDelete = (egg) => {
    const confirmDelete = window.confirm(`Delete the egg "${egg.name}"?`);
    if (!confirmDelete) return;

    removeEgg(nest.id, egg.id);
    toast({
      title: "Egg deleted",
      status: "info",
      duration: 2500,
      isClosable: true,
    });
  };

  const handleEdit = (egg) => {
    setEditingEgg(egg);
    setNewName(egg.name ?? "");
    editDisclosure.onOpen();
  };

  const handleSaveEdit = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      toast({
        title: "Egg name required",
        description: "Please provide a name for your study material.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    updateEgg(nest.id, editingEgg.id, { name: trimmed });
    editDisclosure.onClose();
    toast({
      title: "Egg updated",
      status: "success",
      duration: 2500,
      isClosable: true,
    });
  };

  const handleSelect = (egg) => {
    localStorage.setItem("contentType", egg.type);
    localStorage.setItem("content", egg.content);
    navigate("/studyboard");
  };

  return (
    <Box p={8}>
      <Button leftIcon={<ArrowBackIcon />} mb={6} variant="outline" onClick={onBack}>
        Back to study inputs
      </Button>

      <Heading size="lg" color="teal.900" mb={2}>
        {nest.name}
      </Heading>
      <Text color="gray.600" mb={6}>
        {eggs.length} {eggs.length === 1 ? "study material" : "study materials"}
      </Text>

      {eggs.length === 0 ? (
        <Box
          borderRadius="xl"
          border="2px dashed"
          borderColor="gray.300"
          p={10}
          textAlign="center"
          bg="whiteAlpha.600"
        >
          <Heading size="md" color="gray.700" mb={2}>
            This nest is empty
          </Heading>
          <Text color="gray.600">Add materials from the study input panel to hatch new eggs.</Text>
        </Box>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(220px, 1fr))" gap={6}>
          {eggs.map((egg) => (
            <GridItem key={egg.id}>
              <EggCard egg={egg} onSelect={handleSelect} onEdit={handleEdit} onDelete={handleDelete} />
            </GridItem>
          ))}
        </Grid>
      )}

      <Modal isOpen={editDisclosure.isOpen} onClose={editDisclosure.onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Egg</ModalHeader>
          <ModalBody>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input value={newName} onChange={(event) => setNewName(event.target.value)} />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} variant="ghost" onClick={editDisclosure.onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSaveEdit}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
