import React from "react";
import {
  createHashRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";
import AnimatedBackground from "./components/AnimatedBackground.jsx";

//pages
import Home from "./layout/Home.jsx";
import StudyBoard from "./layout/StudyBoard.jsx";
import Results from "./layout/Results.jsx";
import Notesboard from "./layout/Notesboard.jsx";
import Flashcardsboard from "./layout/Flashcardsboard.jsx";
import TimeArea from "./layout/TimeArea.jsx";
import { NoteProvider } from "./components/NoteContext.jsx";
import { FlashcardProvider } from "./components/FlashcardContext.jsx";

//layout
import RootLayout from "./layout/RootLayout.jsx";
import { NestProvider } from "./components/NestContext.jsx";

const router = createHashRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route path="source" element={<Home />} />
      <Route path="studyboard" element={<StudyBoard />} />
      <Route path="results" element={<Results />} />
      <Route path="timer" element={<TimeArea />} />
      <Route
        path="notes"
        element={
          <NoteProvider>
            {" "}
            <Notesboard />
          </NoteProvider>
        }
      />
      <Route
        path="flashcards"
        element={
          <FlashcardProvider>
            {" "}
            <Flashcardsboard />
          </FlashcardProvider>
        }
      />
    </Route>
  )
);

export default function App() {
  return (
    <NestProvider>
      <div>
        <AnimatedBackground />
        <RouterProvider router={router} />
      </div>
    </NestProvider>
  );
}
