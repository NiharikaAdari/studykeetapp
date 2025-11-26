import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const NestContext = createContext(null);
const STORAGE_KEY = "studykeet.nests.v1";

const createId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 8)}`;
};

const ensureEgg = (egg, overrides = {}) => ({
  id: overrides.id ?? egg.id ?? createId(),
  name: overrides.name ?? egg.name,
  type: overrides.type ?? egg.type,
  content: overrides.content ?? egg.content,
  createdAt: overrides.createdAt ?? egg.createdAt ?? new Date().toISOString(),
});

export const NestProvider = ({ children }) => {
  const [nests, setNests] = useState([]);
  const [activeNest, setActiveNest] = useState(null);
  const [highlightMode, setHighlightMode] = useState(false);
  const [selectedNestForSaving, setSelectedNestForSaving] = useState(null);
  const [currentEggName, setCurrentEggName] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setNests(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load nests from storage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nests));
    } catch (error) {
      console.error("Failed to persist nests to storage", error);
    }
  }, [nests]);

  const addNest = (name) => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    setNests((prev) => [
      ...prev,
      { id: createId(), name: trimmed, eggs: [], createdAt: new Date().toISOString() },
    ]);
  };

  const updateNest = (nestId, updates) => {
    setNests((prev) =>
      prev.map((nest) =>
        nest.id === nestId ? { ...nest, ...updates, name: updates.name?.trim() ?? nest.name } : nest
      )
    );
  };

  const removeNest = (nestId) => {
    setNests((prev) => prev.filter((nest) => nest.id !== nestId));
  };

  const addEgg = (nestId, egg) => {
    if (!nestId || !egg?.name || !egg?.type || !egg?.content) return;
    setNests((prev) =>
      prev.map((nest) => {
        if (nest.id !== nestId) return nest;
        const preparedEgg = ensureEgg(egg);
        return { ...nest, eggs: [...(nest.eggs ?? []), preparedEgg] };
      })
    );
  };

  const updateEgg = (nestId, eggId, updates) => {
    setNests((prev) =>
      prev.map((nest) => {
        if (nest.id !== nestId) return nest;
        const updatedEggs = (nest.eggs ?? []).map((egg) =>
          egg.id === eggId ? ensureEgg(egg, updates) : egg
        );
        return { ...nest, eggs: updatedEggs };
      })
    );
  };

  const removeEgg = (nestId, eggId) => {
    setNests((prev) =>
      prev.map((nest) => {
        if (nest.id !== nestId) return nest;
        return { ...nest, eggs: (nest.eggs ?? []).filter((egg) => egg.id !== eggId) };
      })
    );
  };

  const getNest = (nestId) => nests.find((nest) => nest.id === nestId) ?? null;

  const selectNestForSaving = (nestId) => {
    setSelectedNestForSaving(nestId);
  };

  const value = useMemo(
    () => ({ 
      nests, 
      addNest, 
      updateNest, 
      removeNest, 
      addEgg, 
      updateEgg, 
      removeEgg, 
      getNest,
      activeNest,
      setActiveNest,
      highlightMode,
      setHighlightMode,
      selectedNestForSaving,
      selectNestForSaving,
      setSelectedNestForSaving,
      currentEggName,
      setCurrentEggName
    }),
    [nests, activeNest, highlightMode, selectedNestForSaving, currentEggName]
  );

  return <NestContext.Provider value={value}>{children}</NestContext.Provider>;
};

export const useNestContext = () => {
  const context = useContext(NestContext);
  if (!context) {
    throw new Error("useNestContext must be used within a NestProvider");
  }
  return context;
};
