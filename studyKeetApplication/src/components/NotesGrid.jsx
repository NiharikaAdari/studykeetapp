import React, { useContext } from "react";
import {
  Box,
  SimpleGrid,
  IconButton,
  useDisclosure,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { NoteContext } from "./NoteContext.jsx";
import { DeleteIcon } from "@chakra-ui/icons";
import ConfirmDelete from "./ConfirmDelete.jsx";

const NotesGrid = ({ onEditNote }) => {
  const { notes, removeNote } = useContext(NoteContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [noteToDelete, setNoteToDelete] = React.useState(null);
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

  return (
    <Box>
      <SimpleGrid columns={3} spacing={5}>
        {notes.map((note) => (
          <Box
            key={note.id}
            p={5}
            shadow="md"
            // borderWidth="1px"
            borderRadius="md"
            h={"auto"}
            minH={{ base: "200px", md: "200px", xl: "200px" }}
            w={"auto"}
            bgColor={note.color}
            onClick={() => onEditNote(note)}
            position="relative"
            boxShadow="dark-lg"
          >
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
      <ConfirmDelete
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmDelete}
      />
    </Box>
  );
};

export default NotesGrid;
