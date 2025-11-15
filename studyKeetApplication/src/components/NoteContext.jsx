import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const NoteContext = createContext();

export const NoteProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch all notes or filtered notes by subject
  const fetchNotes = async (subject = "") => {
    try {
      let url = `http://127.0.0.1:8000/notes`;
      if (subject) {
        url += `?subject=${subject}`;
      }

      const response = await axios.get(url);
      setNotes(response.data);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  // Fetch unique subjects for filtering
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/notes/subjects`);
      setSubjects(response.data); // Set the unique subjects
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Add a new note
  const addNote = async (note) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/notes`, note);
      const newNote = response.data;

      setNotes((prevNotes) => [...prevNotes, newNote]); // Add the newly created note
      fetchSubjects();
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };

  // Update an existing note
  const updateNote = async (updatedNote) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/notes/${updatedNote.id}`, // Ensure the ID is present here
        updatedNote
      );
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === updatedNote.id ? updatedNote : note
        )
      );
      fetchSubjects();
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  // Remove a note
  const removeNote = async (noteId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/notes/${noteId}`);
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  useEffect(() => {
    fetchNotes(); // Fetch all notes on initial load
    fetchSubjects();
  }, []);
  useEffect(() => {
    console.log("Notes updated:", notes);
  }, [notes]);

  useEffect(() => {
    console.log("Subjects updated:", subjects);
  }, [subjects]);

  return (
    <NoteContext.Provider
      value={{ notes, addNote, updateNote, removeNote, fetchNotes, subjects }}
    >
      {children}
    </NoteContext.Provider>
  );
};
