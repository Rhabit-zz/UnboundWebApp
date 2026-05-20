import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const GameContext = createContext(null);

export function GameProvider({ children }) {
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

  const [activeCharacterId, setActiveCharacterId] = useState(() => {
    return localStorage.getItem('unbound_active_char') || null;
  });

  useEffect(() => {
    localStorage.setItem('unbound_species', JSON.stringify(speciesPresets));
  }, [speciesPresets]);

  useEffect(() => {
    localStorage.setItem('unbound_characters', JSON.stringify(characters));
  }, [characters]);

  useEffect(() => {
    localStorage.setItem('unbound_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    if (activeCharacterId) {
      localStorage.setItem('unbound_active_char', activeCharacterId);
    } else {
      localStorage.removeItem('unbound_active_char');
    }
  }, [activeCharacterId]);

  const activeCharacter = useMemo(
    () => characters.find((c) => c.id === activeCharacterId) || null,
    [characters, activeCharacterId]
  );

  const saveNewSpecies = (newSpecies) => {
    setSpeciesPresets((prev) => [...prev, { ...newSpecies, id: crypto.randomUUID() }]);
  };

  const saveNewCharacter = (newChar) => {
    const id = crypto.randomUUID();
    setCharacters((prev) => [
      ...prev,
      {
        knowledgeTags: [],
        materials: {},
        craftedItems: [],
        ...newChar,
        id,
      },
    ]);
    return id;
  };

  const updateCharacter = (charId, updates) => {
    setCharacters((prev) =>
      prev.map((c) => (c.id === charId ? { ...c, ...updates } : c))
    );
  };

  const saveNewItem = (newItem) => {
    setInventory((prev) => ({
      ...prev,
      items: [...prev.items, { ...newItem, id: crypto.randomUUID() }],
    }));
  };

  const updateGoldAndXP = (goldChange, xpChange) => {
    setInventory((prev) => ({
      ...prev,
      gold: Math.max(0, prev.gold + goldChange),
      xp: Math.max(0, prev.xp + xpChange),
    }));
  };

  const setActiveCharacter = (id) => {
    setActiveCharacterId(id);
  };

  const addKnowledgeTag = (charId, tagId) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const tags = c.knowledgeTags || [];
        if (tags.includes(tagId)) return c;
        return { ...c, knowledgeTags: [...tags, tagId] };
      })
    );
  };

  const addMaterials = (charId, materialId, qty) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const mats = c.materials || {};
        return { ...c, materials: { ...mats, [materialId]: (mats[materialId] || 0) + qty } };
      })
    );
  };

  const removeMaterials = (charId, materialId, qty) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const mats = c.materials || {};
        const current = mats[materialId] || 0;
        const next = Math.max(0, current - qty);
        const updated = { ...mats };
        if (next === 0) {
          delete updated[materialId];
        } else {
          updated[materialId] = next;
        }
        return { ...c, materials: updated };
      })
    );
  };

  const addCraftedItem = (charId, item) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (c.id !== charId) return c;
        const items = c.craftedItems || [];
        return { ...c, craftedItems: [...items, { ...item, id: crypto.randomUUID() }] };
      })
    );
  };

  const deleteSpecies = (id) => {
    setSpeciesPresets((prev) => prev.filter((s) => s.id !== id));
  };

  const resetAllData = () => {
    setSpeciesPresets([]);
    setCharacters([]);
    setInventory({ gold: 50, xp: 15, items: [] });
    setActiveCharacterId(null);
  };

  return (
    <GameContext.Provider value={{
      speciesPresets,
      saveNewSpecies,
      deleteSpecies,
      characters,
      saveNewCharacter,
      updateCharacter,
      activeCharacter,
      activeCharacterId,
      setActiveCharacter,
      addKnowledgeTag,
      addMaterials,
      removeMaterials,
      addCraftedItem,
      inventory,
      saveNewItem,
      updateGoldAndXP,
      resetAllData,
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