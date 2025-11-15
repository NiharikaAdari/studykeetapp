import React, { useState, useEffect, useContext } from "react";
import {
  Heading,
  SlideFade,
  Box,
  Flex,
  useDisclosure,
  Select,
} from "@chakra-ui/react";
import { inView } from "framer-motion";

import AddNote from "../components/AddNote.jsx";
import NotesGrid from "../components/NotesGrid.jsx";
import { NoteContext, NoteProvider } from "../components/NoteContext.jsx";

export default function Notesboard() {
  const [selectedNote, setSelectedNote] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [subjectFilter, setSubjectFilter] = useState("");
  const { fetchNotes, subjects } = useContext(NoteContext);

  const handleSubjectChange = (e) => {
    setSubjectFilter(e.target.value);
    fetchNotes(e.target.value); // Fetch notes based on subject
  };
  useEffect(() => {
    window.scrollTo({
      top: 350,
      behavior: "smooth",
    });
  }, []);
  return (
    <div>
      {/* Filter by subject */}
      <SlideFade
        in={inView}
        offsetY="-50px"
        transition={{ enter: { delay: 0.15 } }}
      >
        <Box
          bg={"cyan.400"}
          p={5}
          ml={10}
          mr={10}
          borderRadius={50}
          display="flex"
          alignContent={"center"}
        >
          <Select
            placeholder="Filter by subject"
            onChange={handleSubjectChange}
            bg={"white"}
            borderRadius={50}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </Select>
        </Box>
      </SlideFade>
      <Flex
        direction={{ base: "column", md: "row" }}
        p={5}
        // align="center"
      >
        <SlideFade
          in={inView}
          offsetX="-50px"
          transition={{ enter: { delay: 0.3 } }}
        >
          <Box
            flex={{ base: "none", md: "1" }}
            w={{ base: "100%", md: "auto" }}
            bgColor="teal.300"
            p={{ base: 5, md: 50 }}
            borderRadius={50}
            boxShadow="dark-lg"
            mb={{ base: 5, md: 0 }}
            margin={{ md: 5 }}
          >
            <Heading mb={4}>📌Add a Note</Heading>
            <AddNote
              selectedNote={selectedNote}
              onNoteAdded={() => setSelectedNote(null)}
            />
          </Box>
        </SlideFade>

        <SlideFade
          in={inView}
          offsetX="50px"
          transition={{ enter: { delay: 0.45 } }}
        >
          <Box
            flex={{ base: "none", md: "2" }}
            w={{ base: "90vw", md: "50vw", xl: "60vw" }}
            h={{ base: "auto", md: "auto" }}
            minH={{ base: "200px", md: "300px", xl: "650px" }}
            boxShadow="dark-lg"
            ml={{ base: 0, md: 10 }}
            mt={5}
            borderRadius={50}
            p={{ base: 5, md: 50 }}
            bg={"gray.800"}
          >
            <NotesGrid
              onEditNote={(note) => {
                setSelectedNote(note);
                onOpen();
              }}
            />
          </Box>
        </SlideFade>
      </Flex>
    </div>
  );
}
