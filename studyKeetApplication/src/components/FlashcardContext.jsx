import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
export const FlashcardContext = createContext();

export const FlashcardProvider = ({ children }) => {
  const [flashcards, setFlashcards] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Fetch all flashcards or filtered flashcards by subject
  const fetchFlashcards = async (subject = "") => {
    try {
      let url = `http://127.0.0.1:8000/flashcards`;
      if (subject) {
        url += `?subject=${subject}`;
      }

      const response = await axios.get(url);
      setFlashcards(response.data);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    }
  };

  // Fetch unique subjects for filtering
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:8000/flashcards/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Add a new flashcard
  const addFlashcard = async (flashcard) => {
    try {
      const response = await axios.post(`http://127.0.0.1:8000/flashcards`, flashcard);
      const newFlashcard = response.data;

      setFlashcards((prevFlashcards) => [...prevFlashcards, newFlashcard]);
      fetchSubjects();
    } catch (error) {
      console.error("Error adding flashcard:", error);
    }
  };

  // Update an existing flashcard
  const updateFlashcard = async (updatedFlashcard) => {
    try {
      await axios.put(
        `http://127.0.0.1:8000/flashcards/${updatedFlashcard.id}`,
        updatedFlashcard
      );
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((flashcard) =>
          flashcard.id === updatedFlashcard.id ? updatedFlashcard : flashcard
        )
      );
      fetchSubjects();
    } catch (error) {
      console.error("Error updating flashcard:", error);
    }
  };

  // Remove a flashcard
  const removeFlashcard = async (flashcardId) => {
    try {
      await axios.delete(`http://127.0.0.1:8000/flashcards/${flashcardId}`);
      setFlashcards((prevFlashcards) => prevFlashcards.filter((flashcard) => flashcard.id !== flashcardId));
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting flashcard:", error);
    }
  };

  useEffect(() => {
    fetchFlashcards();
    fetchSubjects();
  }, []);

  useEffect(() => {
    console.log("Flashcards updated:", flashcards);
  }, [flashcards]);

  useEffect(() => {
    console.log("Subjects updated:", subjects);
  }, [subjects]);

  return (
    <FlashcardContext.Provider
      value={{ flashcards, addFlashcard, updateFlashcard, removeFlashcard, fetchFlashcards, subjects }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};
