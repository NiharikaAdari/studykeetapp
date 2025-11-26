import React, { useContext, useState } from "react";
import {
  Box,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Divider,
  useToast,
  Button,
  HStack,
  Checkbox,
  Text,
} from "@chakra-ui/react";
import { NoteContext } from "./NoteContext.jsx";
import { DeleteIcon } from "@chakra-ui/icons";
import ConfirmDelete from "./ConfirmDelete.jsx";

const NotesGrid = ({ onEditNote }) => {
  const { notes, removeNote } = useContext(NoteContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isBulkOpen, onOpen: onBulkOpen, onClose: onBulkClose } = useDisclosure();
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const toast = useToast();

  const handleDelete = (note) => {
    setNoteToDelete(note);
    onOpen();
  };

  const confirmDelete = () => {
    removeNote(noteToDelete.id);
    toast({
      title: "Note deleted.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    onClose();
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedNotes([]);
  };

  const toggleNoteSelection = (noteId) => {
    setSelectedNotes(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleBulkDelete = () => {
    if (selectedNotes.length === 0) {
      toast({
        title: "No notes selected",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      return;
    }
    onBulkOpen();
  };

  const confirmBulkDelete = () => {
    selectedNotes.forEach(noteId => removeNote(noteId));
    toast({
      title: `${selectedNotes.length} note(s) deleted.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
    setSelectedNotes([]);
    setSelectionMode(false);
    onBulkClose();
  };

  const selectAll = () => {
    setSelectedNotes(notes.map(note => note.id));
  };

  const deselectAll = () => {
    setSelectedNotes([]);
  };

  return (
    <Box>
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
          
          {selectionMode && (
            <>
              <Button size="sm" variant="outline" color="white" onClick={selectAll}>
                Select All
              </Button>
              <Button size="sm" variant="outline" color="white" onClick={deselectAll}>
                Deselect All
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                onClick={handleBulkDelete}
                isDisabled={selectedNotes.length === 0}
                leftIcon={<DeleteIcon />}
              >
                Delete Selected ({selectedNotes.length})
              </Button>
            </>
          )}
        </HStack>
        
        {selectionMode && (
          <Text fontSize="sm" color="gray.400">
            {selectedNotes.length} of {notes.length} selected
          </Text>
        )}
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} spacing={5}>
        {notes.map((note) => (
          <Box
            key={note.id}
            p={5}
            shadow="md"
            borderRadius="md"
            h={"auto"}
            minH={{ base: "200px", md: "200px", xl: "200px" }}
            w={"auto"}
            bgColor={note.color}
            onClick={(e) => {
              if (selectionMode) {
                toggleNoteSelection(note.id);
              } else {
                onEditNote(note);
              }
            }}
            position="relative"
            boxShadow="dark-lg"
            cursor={selectionMode ? "pointer" : "pointer"}
            borderWidth={selectedNotes.includes(note.id) ? "4px" : "0px"}
            borderColor={selectedNotes.includes(note.id) ? "white" : "transparent"}
            transition="all 0.2s"
          >
            {selectionMode && (
              <Checkbox
                isChecked={selectedNotes.includes(note.id)}
                onChange={() => toggleNoteSelection(note.id)}
                position="absolute"
                top={2}
                left={2}
                size="lg"
                colorScheme="whiteAlpha"
                zIndex="docked"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            
            {!selectionMode && (
              <IconButton
                icon={<DeleteIcon />}
                aria-label="Delete Note"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(note);
                }}
                position="absolute"
                top={1}
                right={1}
                h={6}
                w={6}
                zIndex="docked"
              />
            )}
            
            <Box>
              <Box fontWeight="bold">
                {note.subject && `〘${note.subject}〙`} {note.title}
              </Box>
              <Divider variant="postit" />

              <Box ml={2} mr={2}>
                {note.content}
              </Box>
            </Box>
          </Box>
        ))}
      </SimpleGrid>
      
      {/* Single Delete Confirmation */}
      <ConfirmDelete
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmDelete}
      />
      
      {/* Bulk Delete Confirmation */}
      <ConfirmDelete
        isOpen={isBulkOpen}
        onClose={onBulkClose}
        onConfirm={confirmBulkDelete}
        message={`Are you sure you want to delete ${selectedNotes.length} note(s)?`}
      />
    </Box>
  );
};

export default NotesGrid;
