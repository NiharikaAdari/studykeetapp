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
  HStack,
  Checkbox,
} from "@chakra-ui/react";
import { ArrowBackIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import EggCard from "./EggCard.jsx";
import { useNestContext } from "./NestContext.jsx";
import ConfirmDelete from "./ConfirmDelete.jsx";

export default function EggGrid({ nest, onBack }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { removeEgg, updateEgg } = useNestContext();
  const [editingEgg, setEditingEgg] = useState(null);
  const [newName, setNewName] = useState("");
  const [selectedEggs, setSelectedEggs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const editDisclosure = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedEggs([]);
  };

  const toggleEggSelection = (eggId) => {
    setSelectedEggs(prev => 
      prev.includes(eggId) 
        ? prev.filter(id => id !== eggId)
        : [...prev, eggId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedEggs.length === 0) {
      toast({
        title: "No eggs selected",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    onBulkOpen();
  };

  const confirmBulkDelete = () => {
    selectedEggs.forEach(eggId => removeEgg(nest.id, eggId));
    toast({
      title: `${selectedEggs.length} egg(s) deleted.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setSelectedEggs([]);
    setSelectionMode(false);
    onBulkClose();
  };

  const selectAll = () => {
    setSelectedEggs(eggs.map(egg => egg.id));
  };

  const deselectAll = () => {
    setSelectedEggs([]);
  };

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

      {/* Bulk Selection Controls */}
      <HStack mb={4} spacing={3} justify="space-between" flexWrap="wrap">
        <HStack spacing={3} flexWrap="wrap">
          <Button
            size="sm"
            colorScheme={selectionMode ? "red" : "cyan"}
            onClick={toggleSelectionMode}
          >
            {selectionMode ? "Cancel" : "Select Multiple"}
          </Button>
          
          {selectionMode && eggs.length > 0 && (
            <>
              <Button size="sm" variant="outline" bgColor="teal.300" color="teal.600" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline"  bgColor="teal.300" color="teal.600" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button
                size="sm"
                bgColor="orange.300" 
                onClick={handleBulkDelete}
                isDisabled={selectedEggs.length === 0}
                leftIcon={<DeleteIcon />}
              >
                Delete Selected ({selectedEggs.length})
              </Button>
            </>
          )}
        </HStack>
        
        {selectionMode && (
          <Text fontSize="sm" color="gray.600">
            {selectedEggs.length} of {eggs.length} selected
          </Text>
        )}
      </HStack>

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
            <GridItem key={egg.id} position="relative">
              {selectionMode && (
                <Checkbox
                  isChecked={selectedEggs.includes(egg.id)}
                  onChange={() => toggleEggSelection(egg.id)}
                  position="absolute"
                  top={2}
                  left={2}
                  size="lg"
                  colorScheme="blue"
                  zIndex={100}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              <EggCard 
                egg={egg} 
                onSelect={selectionMode ? undefined : handleSelect} 
                onEdit={selectionMode ? undefined : handleEdit} 
                onDelete={selectionMode ? undefined : handleDelete}
                isSelectable={selectionMode}
                isSelected={selectedEggs.includes(egg.id)}
              />
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

      <ConfirmDelete
        isOpen={isBulkOpen}
        onClose={onBulkClose}
        onConfirm={confirmBulkDelete}
        message={`Are you sure you want to delete ${selectedEggs.length} study material${selectedEggs.length !== 1 ? 's' : ''}?`}
      />
    </Box>
  );
}
