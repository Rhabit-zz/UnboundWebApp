import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  // 1. Initialize state from localStorage (or fallback to defaults if empty)
  const [speciesPresets, setSpeciesPresets] = useState(() => {
    const saved = localStorage.getItem('unbound_species');
    return saved ? JSON.parse(saved) : [];
  });

  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('unbound_characters');
    return saved ? JSON.parse(saved) : [];
  });

  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem('unbound_inventory');
    return saved ? JSON.parse(saved) : { gold: 50, xp: 15, items: [] };
  });

  // 2. Automatically sync with localStorage whenever a state variable changes
  useEffect(() => {
    localStorage.setItem('unbound_species', JSON.stringify(speciesPresets));
  }, [speciesPresets]);

  useEffect(() => {
    localStorage.setItem('unbound_characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('unbound_inventory', JSON.stringify(inventory));
  }, [inventory]);

  // 3. Helper functions to update state from any page component
  const saveNewSpecies = (newSpecies) => {
    setSpeciesPresets((prev) => [...prev, { ...newSpecies, id: crypto.randomUUID() }]);
  };

  const saveNewCharacter = (newChar) => {
    setCharacters((prev) => [...prev, { ...newChar, id: crypto.randomUUID() }]);
  };

  const updateGoldAndXP = (goldChange, xpChange) => {
    setInventory((prev) => ({
      ...prev,
      gold: Math.max(0, prev.gold + goldChange),
      xp: Math.max(0, prev.xp + xpChange),
    }));
  };

  const resetAllData = () => {
    setSpeciesPresets([]);
    setCharacters([]);
    setInventory({ gold: 50, xp: 15, items: [] });
  };

  return (
    <GameContext.Provider value={{
      speciesPresets,
      saveNewSpecies,
      characters,
      saveNewCharacter,
      inventory,
      updateGoldAndXP,
      resetAllData
    }}>
      {children}
    </GameContext.Provider>
  );
}

// Custom hook for clean usage inside components
export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
}