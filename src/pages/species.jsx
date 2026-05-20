import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "../context/GameContext";

// Native direct import of your real database schema file
import speciesData from "../database/Species.json";

const BIOLOGY_RANKS = {
  1: { label: "Juvenile",   xp_cost: 0,  cumulative_xp: 0,  phy: 80, mnt:  0, soc: 20, arc:  0, max_tier: 1 },
  2: { label: "Adolescent", xp_cost: 2,  cumulative_xp: 2,  phy: 50, mnt: 25, soc: 25, arc:  0, max_tier: 2 },
  3: { label: "Adult",      xp_cost: 6,  cumulative_xp: 8,  phy: 33, mnt: 33, soc: 33, arc:  0, max_tier: 3 },
  4: { label: "Elder",      xp_cost: 12, cumulative_xp: 20, phy: 33, mnt: 33, soc: 33, arc:  0, max_tier: 3 },
  5: { label: "Apex",       xp_cost: 20, cumulative_xp: 40, phy: 20, mnt: 20, soc: 20, arc: 40, max_tier: 4 },
};

// Hard = mutually exclusive (block). Soft = biologically uncommon (warn, allow).
const TRAIT_CONFLICTS = {
  hard: [
    ["exoskeleton", "scales"],
    ["exoskeleton", "fur"],
    ["exoskeleton", "thick_hide"],
    ["exoskeleton", "shell"],
    ["scales", "fur"],
    ["scales", "shell"],
    ["fur", "shell"],
    ["thick_hide", "shell"],
    ["dense_bones", "hollow_bones"],
    ["avian_wings", "aerokinetic_membranes"],
    ["hooves", "digitigrade"],
    ["herd_mentality", "hive_mind"],
    ["warm_blooded", "cold_blooded"],
    // Vision spectrum: only one color channel level at a time
    ["vision_monochrome",  "vision_dichromatic"],
    ["vision_monochrome",  "vision_trichromatic"],
    ["vision_monochrome",  "vision_tetrachromatic"],
    ["vision_dichromatic", "vision_trichromatic"],
    ["vision_dichromatic", "vision_tetrachromatic"],
    ["vision_trichromatic","vision_tetrachromatic"],
  ],
  soft: [
    ["cold_blooded", "fur"],
    ["heavy_set", "aerodynamic"],
    ["heavy_set", "hollow_bones"],
    ["heavy_set", "avian_wings"],
    ["herd_mentality", "territorial"],
    ["ambusher", "heavy_set"],
    ["vision_darkvision", "vision_low_light"], // darkvision subsumes low-light; redundant but allowed
  ],
};

const getTraitConflicts = (traitId, otherTraits, type) =>
  TRAIT_CONFLICTS[type]
    .filter(([a, b]) => (traitId === a && otherTraits.includes(b)) || (traitId === b && otherTraits.includes(a)))
    .map(([a, b]) => (traitId === a ? b : a));

export default function SpeciesPage() {
  const { saveNewSpecies, deleteSpecies, speciesPresets = [] } = useGame() || {};

  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // Parse general collections out of your live JSON schema
  const sizeCategories = useMemo(() => speciesData?.size_categories || {}, []);
  const dietTypes = useMemo(() => speciesData?.diet_types || {}, []);
  const jsonMorphotypes = useMemo(() => speciesData?.morphotypes || {}, []);

  // 1. DYNAMIC TAXONOMY FLATTENER FOR BIOLOGY TYPES
  const flatBiologiesDatabase = useMemo(() => {
    if (!speciesData || !speciesData.biology_types) return {};
    let aggregated = {};

    Object.keys(speciesData.biology_types).forEach(groupKey => {
      const groupContent = speciesData.biology_types[groupKey];
      if (groupContent && typeof groupContent === "object") {
        Object.keys(groupContent).forEach(biologyId => {
          aggregated[biologyId] = {
            id: biologyId,
            group: groupKey,
            ...groupContent[biologyId]
          };
        });
      }
    });
    return aggregated;
  }, []);

  // Isolate initial dictionary keys safely
  const initialMorphoKey = useMemo(() => Object.keys(jsonMorphotypes)[0] || "", [jsonMorphotypes]);
  const initialBiologyKey = useMemo(() => Object.keys(flatBiologiesDatabase)[0] || "", [flatBiologiesDatabase]);

  // 2. COMPONENT CONTROL FORM STATES
  const [speciesName, setSpeciesName] = useState("New Species");
  const [selectedMorphoKey, setSelectedMorphoKey] = useState("");
  const [selectedBiologyKey, setSelectedBiologyKey] = useState("");
  const [selectedSizeKey, setSelectedSizeKey] = useState("medium");
  const [selectedDietKey, setSelectedDietKey] = useState("omnivore");
  const [loreNotesText, setLoreNotesText] = useState("");
  
  // Biology Rank (1–5 life stages)
  const [biologyRank, setBiologyRank] = useState(1);

  // Custom State Loops for Custom Dropdown Add/Remove Trait List
  const [activeCustomTraits, setActiveCustomTraits] = useState([]);
  const [dropdownSelectedTrait, setDropdownSelectedTrait] = useState("");

  // Sync initial keys when your local database module loads up
  useEffect(() => {
    if (initialMorphoKey) setSelectedMorphoKey(initialMorphoKey);
    if (initialBiologyKey) setSelectedBiologyKey(initialBiologyKey);
  }, [initialMorphoKey, initialBiologyKey]);

  // Flattens out your nested database category (traits.anatomy_defense)
  const flatTraitsDatabase = useMemo(() => {
    if (!speciesData || !speciesData.traits) return {};
    let aggregated = {};
    
    Object.keys(speciesData.traits).forEach(categoryKey => {
      const subCategory = speciesData.traits[categoryKey];
      if (subCategory && typeof subCategory === "object") {
        Object.keys(subCategory).forEach(traitId => {
          aggregated[traitId] = {
            id: traitId,
            ...subCategory[traitId]
          };
        });
      }
    });
    return aggregated;
  }, []);

  // Isolate what traits were naturally inherited from the Biology Type package
  const biologyPackageTraits = useMemo(() => {
    if (!selectedBiologyKey || !flatBiologiesDatabase[selectedBiologyKey]) return [];
    const biologyPackage = flatBiologiesDatabase[selectedBiologyKey];
    return biologyPackage.core_traits || biologyPackage.traits || [];
  }, [selectedBiologyKey, flatBiologiesDatabase]);

  // 3. AUTOFILL ENGINE FOR DIET/SIZE (LEAVES TRAITS UNTOUCHED)
  useEffect(() => {
    if (!selectedBiologyKey || !flatBiologiesDatabase[selectedBiologyKey]) return;
    
    const biologyPackage = flatBiologiesDatabase[selectedBiologyKey];
    setActiveCustomTraits([]);
    setBiologyRank(1);

    // Autofill Diet
    if (biologyPackage.diet) {
      setSelectedDietKey(String(biologyPackage.diet).toLowerCase().trim());
    }

    // Autofill Size
    if (biologyPackage.size_range) {
      if (Array.isArray(biologyPackage.size_range) && biologyPackage.size_range.length > 0) {
        const hasMedium = biologyPackage.size_range.map(s => String(s).toLowerCase().trim()).includes("medium");
        setSelectedSizeKey(hasMedium ? "medium" : String(biologyPackage.size_range).toLowerCase().trim());
      } else {
        setSelectedSizeKey(String(biologyPackage.size_range).toLowerCase().trim());
      }
    }
  }, [selectedBiologyKey, flatBiologiesDatabase]);

  // Combined full trait registry list (Free Biology Core Package + Your Custom Additions)
  const totalCombinedTraitsList = useMemo(() => {
    return [...new Set([...biologyPackageTraits, ...activeCustomTraits])];
  }, [biologyPackageTraits, activeCustomTraits]);

  // Rank-derived values
  const currentRankData = BIOLOGY_RANKS[biologyRank];

  // Compensation pool: free TP from morphotype structural complexity
  const compensationPool = useMemo(() => {
    return jsonMorphotypes[selectedMorphoKey]?.compensation_pool ?? 12;
  }, [selectedMorphoKey, jsonMorphotypes]);

  // Sense organs from morphotype; traits grouped by sense_type for display
  const morphotypeSenseOrgans = useMemo(() =>
    jsonMorphotypes[selectedMorphoKey]?.sense_organs || [],
  [selectedMorphoKey, jsonMorphotypes]);

  const senseTraitsByOrgan = useMemo(() => {
    const map = {};
    totalCombinedTraitsList.forEach(id => {
      const t = flatTraitsDatabase[id];
      if (!t?.sense_type) return;
      const organ = t.sense_type.replace('_mode', ''); // vision_mode -> vision
      if (!map[organ]) map[organ] = [];
      map[organ].push({ id, ...t });
    });
    return map;
  }, [totalCombinedTraitsList, flatTraitsDatabase]);

  // 4. BALANCING LEDGER
  //
  // Base XP and free TP are formula-derived per-species, calibrated so that
  // Humanoid + Primate + Medium = exactly 16 XP + 2 free TP (per v4.3 document).
  //
  //   available_tp  = 54 + compensation_pool + biology_tp_mod + size_tp_mod
  //   base_xp       = floor(available_tp / 4)
  //   free_trait_tp = available_tp % 4     ← always 0–3; floor(≤3/4)=0 so it never auto-converts
  //
  // The 54 offset: Grand_TP(118) − score_offset(64) = 54, where score_offset comes from v4.3's
  // Pool = 64 − Score formula. Biology and size tp_modifier fields default to 0 until defined.
  const computedXpAndBudgetMetrics = useMemo(() => {
    const biologyTpMod = flatBiologiesDatabase[selectedBiologyKey]?.tp_modifier ?? 0;
    const sizeTpMod = sizeCategories[selectedSizeKey]?.tp_modifier ?? 0;
    const availableTp = 54 + compensationPool + biologyTpMod + sizeTpMod;
    const baseStartingXp = Math.floor(availableTp / 4);
    const freeTraitTp = availableTp % 4; // 0–3 TP; mathematically cannot convert to XP

    // Rank-up TP grants: 4 TP per XP spent on each rank-up
    let rankTpGrants = 0;
    for (let r = 2; r <= biologyRank; r++) {
      rankTpGrants += BIOLOGY_RANKS[r].xp_cost * 4;
    }

    const rankXpCost = currentRankData.cumulative_xp;
    const totalTpPool = freeTraitTp + rankTpGrants;

    const usedTp = activeCustomTraits.reduce((sum, id) => {
      return sum + (flatTraitsDatabase[id]?.tier || 1);
    }, 0);

    const tpBalance = totalTpPool - usedTp;
    const overdraft = Math.max(0, -tpBalance);
    const xpFromOverdraft = Math.ceil(overdraft / 4);
    const remainingTp = Math.max(0, tpBalance);
    const xpFromUnspentTp = Math.floor(remainingTp / 4);

    const finalXpPool = Math.max(0, baseStartingXp - rankXpCost - xpFromOverdraft + xpFromUnspentTp);

    return {
      baseStartingXp,
      freeTraitTp,
      rankTpGrants,
      rankXpCost,
      totalTpPool,
      usedTp,
      overdraft,
      xpFromOverdraft,
      remainingTp,
      xpFromUnspentTp,
      finalXpPool,
    };
  }, [
    activeCustomTraits, compensationPool, flatTraitsDatabase,
    biologyRank, currentRankData, flatBiologiesDatabase, selectedBiologyKey,
    sizeCategories, selectedSizeKey,
  ]);

  // Derived Equipment Slots matching your exact JSON array variable property string: "equipment_slots"
  const architecturalEquipmentSlots = useMemo(() => {
    return jsonMorphotypes[selectedMorphoKey]?.equipment_slots || jsonMorphotypes[selectedMorphoKey]?.slots || [];
  }, [selectedMorphoKey, jsonMorphotypes]);

  // Filters dropdown: no duplicates, tier unlocked by rank, hard conflicts excluded
  const availableDropdownTraits = useMemo(() => {
    let unselected = {};
    Object.keys(flatTraitsDatabase).forEach(key => {
      const trait = flatTraitsDatabase[key];
      const tier = trait.tier || 1;
      if (!totalCombinedTraitsList.includes(key) && tier <= currentRankData.max_tier) {
        const hardConflicted = TRAIT_CONFLICTS.hard.some(
          ([a, b]) => (key === a && totalCombinedTraitsList.includes(b)) || (key === b && totalCombinedTraitsList.includes(a))
        );
        if (!hardConflicted) unselected[key] = trait;
      }
    });
    return unselected;
  }, [flatTraitsDatabase, totalCombinedTraitsList, currentRankData]);

  // Set default selection key value whenever dropdown contents filter
  useEffect(() => {
    const remainingKeys = Object.keys(availableDropdownTraits);
    if (remainingKeys.length > 0) {
      setDropdownSelectedTrait(remainingKeys[0]); 
    } else {
      setDropdownSelectedTrait("");
    }
  }, [availableDropdownTraits]);

  // 5. DROPDOWN ACTIONS INTERCEPTORS
  const handleAppendTraitToList = () => {
    if (!dropdownSelectedTrait) return;
    const traitTier = flatTraitsDatabase[dropdownSelectedTrait]?.tier || 1;

    const hardConflicts = getTraitConflicts(dropdownSelectedTrait, totalCombinedTraitsList, "hard");
    if (hardConflicts.length > 0) {
      const names = hardConflicts.map(id => flatTraitsDatabase[id]?.name || id).join(", ");
      alert(`❌ Trait Refused: Incompatible with ${names}. These traits cannot coexist.`);
      return;
    }

    const softConflicts = getTraitConflicts(dropdownSelectedTrait, totalCombinedTraitsList, "soft");
    if (softConflicts.length > 0) {
      const names = softConflicts.map(id => flatTraitsDatabase[id]?.name || id).join(", ");
      if (!window.confirm(`⚠️ Rare Combination: "${flatTraitsDatabase[dropdownSelectedTrait]?.name}" alongside ${names} is biologically uncommon. Proceed anyway?`)) return;
    }

    const { baseStartingXp, rankXpCost, totalTpPool, usedTp } = computedXpAndBudgetMetrics;
    const newUsedTp = usedTp + traitTier;
    const newTpBalance = totalTpPool - newUsedTp;
    const newXpFromOverdraft = Math.ceil(Math.max(0, -newTpBalance) / 4);
    const newXpFromUnspentTp = Math.floor(Math.max(0, newTpBalance) / 4);
    if (baseStartingXp - rankXpCost - newXpFromOverdraft + newXpFromUnspentTp < 0) {
      alert(`❌ Trait Refused: Insufficient XP to auto-convert for this T${traitTier} trait.`);
      return;
    }

    setActiveCustomTraits(prev => [...prev, dropdownSelectedTrait]);
  };

  const handleRemoveTraitFromList = (traitId) => {
    setActiveCustomTraits(prev => prev.filter(id => id !== traitId));
  };

  const handleDisplayJsonPayload = () => {
    const payload = {
      name: speciesName,
      morphotype: selectedMorphoKey,
      biology_type: selectedBiologyKey,
      size: selectedSizeKey,
      diet: selectedDietKey,
      lore: loreNotesText,
      core_biology_traits: biologyPackageTraits,
      custom_traits: activeCustomTraits,
      total_compiled_traits: totalCombinedTraitsList,
      equipment_slots: architecturalEquipmentSlots,
      starting_xp_allocation: computedXpAndBudgetMetrics.finalXpPool
    };

    const previewBox = document.getElementById("sb-json");
    if (previewBox) {
      previewBox.textContent = JSON.stringify(payload, null, 2);
      previewBox.style.display = previewBox.style.display === "none" ? "block" : "none";
    }
  };

  const handleSaveProfileRecord = () => {
    if (!speciesName.trim()) return alert("❌ Build Refused: System designation name parameter blank.");

    saveNewSpecies({
      name: speciesName,
      biology: selectedBiologyKey,
      biology_rank: biologyRank,
      morphotype: selectedMorphoKey,
      size: selectedSizeKey,
      diet: selectedDietKey,
      lore: loreNotesText,
      core_traits: totalCombinedTraitsList,
      equipment_slots: architecturalEquipmentSlots,
      compensation_pool: compensationPool,
      starting_xp_modifier: computedXpAndBudgetMetrics.finalXpPool
    });

    alert(`✅ Sync Complete: ${speciesName} saved cleanly to global memory nodes.`);
    setSpeciesName("New Species");
    setLoreNotesText("");
    setActiveCustomTraits([]);
    setBiologyRank(1);
    if (initialBiologyKey) setSelectedBiologyKey(initialBiologyKey);
  };

  return (
    <section className="p-8 text-white max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black mb-2 tracking-wide text-zinc-100">Species Builder</h1>
        <p className="text-purple-200 text-sm">Configure morphotypes, balance trait packages, and evaluate starting skill development XP via 2-to-1 conversion matrices.</p>
      </div>

      <div id="speciesbuilder" className="panel grid grid-cols-1 lg:grid-cols-3 gap-6 !block md:!grid">
        
        {/* LEFT COLUMN: WORKSPACE FORMS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="card-title text-base font-bold text-yellow-500 border-b border-zinc-800 pb-2">Anatomical & Biological Core Framework</div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Species Designation Name</label>
                <input 
                  type="text" 
                  value={speciesName}
                  onChange={(e) => setSpeciesName(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none focus:border-zinc-600" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Anatomical Morphotype Structure</label>
                <select value={selectedMorphoKey} onChange={(e) => setSelectedMorphoKey(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none">
                  {Object.keys(jsonMorphotypes).map(key => (
                    <option key={key} value={key}>{jsonMorphotypes[key]?.name || key}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Biology Type Heritage Package</label>
                <select value={selectedBiologyKey} onChange={(e) => setSelectedBiologyKey(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none">
                  {Object.keys(flatBiologiesDatabase).map(key => (
                    <option key={key} value={key}>
                      {flatBiologiesDatabase[key]?.name || key} ({flatBiologiesDatabase[key]?.group})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Volumetric Size Bracket (Autofilled)</label>
                <select value={selectedSizeKey} onChange={(e) => setSelectedSizeKey(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none">
                  {selectedBiologyKey && flatBiologiesDatabase[selectedBiologyKey] && Array.isArray(flatBiologiesDatabase[selectedBiologyKey].size_range) ? (
                    flatBiologiesDatabase[selectedBiologyKey].size_range.map(sRangeKey => (
                      <option key={sRangeKey} value={sRangeKey}>{sizeCategories[sRangeKey]?.name || sRangeKey} (Mod: {sizeCategories[sRangeKey]?.size_modifier || 0})</option>
                    ))
                  ) : (
                    Object.keys(sizeCategories).map(key => (
                      <option key={key} value={key}>{sizeCategories[key]?.name || key} (Mod: {sizeCategories[key]?.size_modifier || 0})</option>
                    ))
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Dietary Category Mode (Autofilled)</label>
                <select value={selectedDietKey} onChange={(e) => setSelectedDietKey(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none">
                  {selectedBiologyKey && flatBiologiesDatabase[selectedBiologyKey] && Array.isArray(flatBiologiesDatabase[selectedBiologyKey].diet) ? (
                    flatBiologiesDatabase[selectedBiologyKey].diet.map(dKey => (
                      <option key={dKey} value={dKey}>{dietTypes[dKey]?.name || dKey}</option>
                    ))
                  ) : selectedBiologyKey && flatBiologiesDatabase[selectedBiologyKey] && typeof flatBiologiesDatabase[selectedBiologyKey].diet === "string" ? (
                    <option value={flatBiologiesDatabase[selectedBiologyKey].diet}>
                      {dietTypes[flatBiologiesDatabase[selectedBiologyKey].diet]?.name || flatBiologiesDatabase[selectedBiologyKey].diet}
                    </option>
                  ) : (
                    Object.keys(dietTypes).map(key => (
                      <option key={key} value={key}>{dietTypes[key].name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* MORPHOTYPE DERIVED EQUIPMENT SLOTS */}
            <div className="border-t border-zinc-800/80 pt-3">
              <label className="block text-xs font-bold text-purple-400 uppercase tracking-wider mb-2">
                Morphotype Derived Equipment Slots ({architecturalEquipmentSlots.length})
              </label>
              {architecturalEquipmentSlots.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-2 bg-black/20 rounded border border-zinc-800/60">
                  No core item configurations designated for this structural body framework.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-black/20 rounded border border-zinc-800/60 shadow-inner">
                  {architecturalEquipmentSlots.map((slot, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-zinc-700 shadow-sm capitalize tracking-wide">
                      {slot}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* MORPHOTYPE DERIVED SENSES */}
            <div className="border-t border-zinc-800/80 pt-3">
              <label className="block text-xs font-bold text-teal-500 uppercase tracking-wider mb-2">
                Morphotype Derived Senses ({morphotypeSenseOrgans.length})
              </label>
              {morphotypeSenseOrgans.length === 0 ? (
                <p className="text-xs text-zinc-500 italic p-2 bg-black/20 rounded border border-zinc-800/60">
                  No conventional sense organs defined for this morphotype.
                </p>
              ) : (
                <div className="space-y-1.5 p-2.5 bg-black/20 rounded border border-zinc-800/60">
                  {morphotypeSenseOrgans.map(organ => {
                    const organLabel = { vision: 'Vision', hearing: 'Hearing', olfaction: 'Smell', touch: 'Touch', taste: 'Taste' }[organ] || organ;
                    const activeTraits = senseTraitsByOrgan[organ] || [];
                    return (
                      <div key={organ} className="flex items-start gap-2 text-xs">
                        <span className="text-zinc-500 font-mono font-bold w-14 shrink-0 pt-0.5 uppercase text-[10px]">{organLabel}</span>
                        <div className="flex flex-wrap gap-1">
                          {activeTraits.length > 0 ? (
                            activeTraits.map(t => (
                              <span key={t.id} title={t.effect} className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border bg-teal-900/30 border-teal-700/50 text-teal-300 cursor-help">
                                {t.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[10px] text-zinc-600 font-mono italic">— Base</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Physiological Descriptions & Lore Notes</label>
              <textarea 
                rows="2"
                value={loreNotesText}
                onChange={(e) => setLoreNotesText(e.target.value)}
                placeholder="Document species mechanical constraints, movement limits, or environmental features..."
                className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded focus:outline-none resize-y text-white focus:border-zinc-600"
              />
            </div>
          </div>

          {/* BIOLOGY RANK CARD */}
          <div className="card bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="card-title text-sm font-bold text-yellow-500 tracking-wider uppercase border-b border-zinc-800 pb-2">Biology Rank — Life Stage Progression</div>

            {/* Rank selector buttons */}
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setBiologyRank(r)}
                  className={`flex-1 py-2 rounded font-mono font-black text-sm transition ${biologyRank === r ? "bg-yellow-600 text-black shadow" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"}`}
                >
                  R{r}
                </button>
              ))}
            </div>

            {/* Life stage info row */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs bg-black/20 p-3 rounded border border-zinc-800/60">
              <div className="flex justify-between">
                <span className="text-zinc-500">Life Stage:</span>
                <span className="text-yellow-400 font-bold font-mono">{currentRankData.label}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Max Trait Tier:</span>
                <span className="text-purple-400 font-bold font-mono">T{currentRankData.max_tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">XP Cost to Here:</span>
                <span className="text-red-400 font-mono font-bold">
                  {currentRankData.cumulative_xp > 0 ? `−${currentRankData.cumulative_xp} XP` : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">TP Granted:</span>
                <span className="text-green-400 font-mono font-bold">
                  {currentRankData.cumulative_xp > 0 ? `+${currentRankData.cumulative_xp * 4} TP` : "None"}
                </span>
              </div>
              <div className="flex justify-between col-span-2 border-t border-zinc-800/40 pt-1 mt-0.5">
                <span className="text-zinc-500">Cost to Advance:</span>
                <span className="text-zinc-300 font-mono font-bold">
                  {biologyRank < 5 ? `−${BIOLOGY_RANKS[biologyRank + 1].xp_cost} XP → +${BIOLOGY_RANKS[biologyRank + 1].xp_cost * 4} TP` : "— Max Rank —"}
                </span>
              </div>
            </div>

            {/* PHY / MNT / SOC / ARC distribution bars */}
            <div>
              <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Trait Pool Distribution at This Rank</span>
              <div className="space-y-1.5">
                {[
                  { label: "PHY", key: "phy", color: "bg-red-500" },
                  { label: "MNT", key: "mnt", color: "bg-blue-500" },
                  { label: "SOC", key: "soc", color: "bg-green-500" },
                  { label: "ARC", key: "arc", color: "bg-purple-500" },
                ].map(({ label, key, color }) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 w-8">{label}</span>
                    <div className="flex-1 bg-zinc-800 rounded h-2 overflow-hidden">
                      <div className={`${color} h-full rounded transition-all duration-300`} style={{ width: `${currentRankData[key]}%` }} />
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">{currentRankData[key]}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRAITS MANAGER CARD */}
          <div className="card bg-zinc-900 border border-zinc-800 p-5 rounded-lg space-y-4">
            <div className="card-title text-sm font-bold text-zinc-400 tracking-wider uppercase border-b border-zinc-800 pb-2">Traits Module Manager</div>
            
            {/* STARTING XP VALUE Readout Dashboard Panel */}
            <div className="p-5 bg-zinc-950/60 border border-purple-900/40 rounded-lg flex flex-col items-center justify-center text-center space-y-3">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black tracking-widest text-zinc-500 uppercase">Available Starting Budget</span>
                <div className="text-4xl font-black font-mono text-yellow-500 tracking-tight">
                  {computedXpAndBudgetMetrics.finalXpPool} <span className="text-xs font-bold text-zinc-400 font-sans uppercase">XP</span>
                </div>
              </div>
              
              <p className="text-xs text-zinc-500 font-sans max-w-md border-t border-zinc-800/80 pt-2 w-full">
                Trait Points insufficient? XP auto-converts at <strong className="text-zinc-400">4 TP / 1 XP</strong>.
              </p>
            </div>

            {/* Trait Picker Controls */}
            <div className="flex flex-col sm:flex-row items-end gap-3 bg-black/20 p-4 rounded border border-zinc-800/60">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide mb-1">Select Available Dictionary Trait</label>
                <select 
                  value={dropdownSelectedTrait}
                  onChange={(e) => setDropdownSelectedTrait(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 p-2 text-sm rounded text-white focus:outline-none"
                >
                  {Object.keys(availableDropdownTraits).length > 0 ? (
                    Object.keys(availableDropdownTraits).map(key => {
                      const t = availableDropdownTraits[key];
                      return (
                        <option key={key} value={key}>[T{t?.tier || 1} — {t?.tier || 1} TP] {t?.name || key}</option>
                      );
                    })
                  ) : (
                    <option value="">— All T1–T{currentRankData.max_tier} Traits Assigned —</option>
                  )}
                </select>
              </div>
              <button 
                type="button"
                onClick={handleAppendTraitToList}
                disabled={!dropdownSelectedTrait}
                className="w-full sm:w-auto bg-purple-700 hover:bg-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm px-5 py-2 rounded shadow transition shrink-0"
              >
                + Append Trait
              </button>
            </div>

            {/* Compiled Active Display List Row */}
            <div className="space-y-2 pt-1">
              <span className="block text-xs font-bold text-zinc-500 uppercase tracking-wider">Active Possessed Traits List ({totalCombinedTraitsList.length})</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {totalCombinedTraitsList.map(traitId => {
                  const traitDetails = flatTraitsDatabase[traitId];
                  const isCore = biologyPackageTraits.includes(traitId);
                  const softConflictsWith = !isCore ? getTraitConflicts(traitId, totalCombinedTraitsList.filter(id => id !== traitId), "soft") : [];
                  return (
                    <div key={traitId} className={`border p-3 rounded flex flex-col justify-between items-start gap-2 ${isCore ? "bg-purple-950/20 border-purple-900/30" : "bg-zinc-800/50 border-zinc-800"}`}>
                      <div className="w-full">
                        <div className="flex justify-between items-center w-full border-b border-zinc-800/60 pb-1 mb-1">
                          <div className="flex items-center gap-1.5 flex-1 min-w-0">
                            <span className="font-bold text-sm text-yellow-500 truncate">
                              {traitDetails?.name || traitId}
                            </span>
                            {isCore ? (
                              <span className="text-[9px] text-purple-400 font-mono font-bold bg-purple-900/30 border border-purple-800/40 px-1.5 py-0.5 rounded shrink-0">CORE</span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded shrink-0 text-zinc-400">
                                T{traitDetails?.tier || 1}
                              </span>
                            )}
                            {softConflictsWith.length > 0 && (
                              <span title={`Rare combination with: ${softConflictsWith.map(id => flatTraitsDatabase[id]?.name || id).join(", ")}`} className="text-[9px] font-mono font-bold bg-amber-900/30 border border-amber-700/50 text-amber-400 px-1.5 py-0.5 rounded shrink-0 cursor-help">
                                RARE
                              </span>
                            )}
                          </div>
                          {!isCore && (
                            <button
                              type="button"
                              onClick={() => handleRemoveTraitFromList(traitId)}
                              className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500 hover:text-white transition font-mono font-bold ml-1 shrink-0"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                          {traitDetails?.effect || "No structural mechanics summary text verified."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREVIEW HUB AND LEDGER (SPAN 1) */}
        <div className="space-y-4 md:col-span-1">
          <div className="card bg-zinc-900 border border-zinc-800 p-5 rounded-lg flex flex-col justify-between h-full min-h-[500px]">
            <div className="space-y-4">
              <div className="card-title text-base font-bold text-zinc-300 border-b border-zinc-800 pb-2 uppercase tracking-wide">Genotype Live Preview</div>
              
              <div className="bg-black/20 p-4 rounded border border-zinc-800/60 space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-yellow-500 tracking-wide">{speciesName || "Unnamed Archetype"}</h2>
                  <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 mt-1 inline-block">
                    Unified Framework Profile
                  </span>
                </div>

                {/* Live Selection Readouts */}
                <div className="text-xs text-zinc-300 space-y-1.5 border-t border-zinc-800/80 pt-3">
                  <div className="flex justify-between"><span className="text-zinc-500">Morphotype / Limbs:</span> <span className="font-mono text-zinc-200 font-bold capitalize">{jsonMorphotypes[selectedMorphoKey]?.name || selectedMorphoKey}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Biology Base Package:</span> <span className="font-mono text-zinc-200 font-bold capitalize">{flatBiologiesDatabase[selectedBiologyKey]?.name || selectedBiologyKey}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Size Classification:</span> <span className="font-mono text-zinc-200 font-bold">{sizeCategories[selectedSizeKey]?.name || selectedSizeKey}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Dietary Vector Mode:</span> <span className="font-mono text-zinc-200 font-bold">{dietTypes[selectedDietKey]?.name || selectedDietKey}</span></div>
                </div>

                {/* System Ledger Overview */}
                <div className="pt-2 border-t border-zinc-800/80 text-xs space-y-1.5 font-mono bg-black/30 p-3 rounded border border-zinc-800">
                  <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider font-sans mb-1">System Budget Ledger</span>
                  <div className="flex justify-between"><span>Base Species XP:</span> <span className="text-zinc-300 font-bold">{computedXpAndBudgetMetrics.baseStartingXp} XP</span></div>
                  {computedXpAndBudgetMetrics.rankXpCost > 0 && (
                    <div className="flex justify-between text-red-400"><span>Rank Cost (R{biologyRank}):</span> <span className="font-bold">−{computedXpAndBudgetMetrics.rankXpCost} XP</span></div>
                  )}
                  {computedXpAndBudgetMetrics.xpFromOverdraft > 0 && (
                    <div className="flex justify-between text-orange-400"><span>Trait Overdraft (÷4↑):</span> <span className="font-bold">−{computedXpAndBudgetMetrics.xpFromOverdraft} XP</span></div>
                  )}
                  {computedXpAndBudgetMetrics.xpFromUnspentTp > 0 && (
                    <div className="flex justify-between text-green-400"><span>Unspent TP → XP (÷4):</span> <span className="font-bold">+{computedXpAndBudgetMetrics.xpFromUnspentTp} XP</span></div>
                  )}

                  <div className="border-t border-zinc-700/60 my-1 pt-1 flex justify-between text-yellow-500 font-bold text-sm">
                    <span className="font-sans">Final Starter Skill XP:</span>
                    <span>{computedXpAndBudgetMetrics.finalXpPool} XP</span>
                  </div>

                  <div className="border-t border-zinc-800/60 mt-2 pt-2">
                    <span className="block text-[10px] font-bold text-purple-400 uppercase tracking-wider font-sans mb-1.5">Trait Point Budget</span>
                    <div className="flex justify-between"><span>Free Species TP:</span> <span className="text-zinc-300 font-bold">{computedXpAndBudgetMetrics.freeTraitTp} TP</span></div>
                    {computedXpAndBudgetMetrics.rankTpGrants > 0 && (
                      <div className="flex justify-between text-yellow-400"><span>Rank-Up Grants (4×XP):</span> <span className="font-bold">+{computedXpAndBudgetMetrics.rankTpGrants} TP</span></div>
                    )}
                    <div className="flex justify-between border-t border-zinc-800/40 mt-1 pt-1"><span>Total TP Pool:</span> <span className="text-zinc-200 font-bold">{computedXpAndBudgetMetrics.totalTpPool} TP</span></div>
                    <div className="flex justify-between"><span>Spent on Traits:</span> <span className="text-blue-400 font-bold">−{computedXpAndBudgetMetrics.usedTp} TP</span></div>
                    {computedXpAndBudgetMetrics.overdraft > 0 ? (
                      <div className="flex justify-between text-orange-400"><span>Overdraft (auto XP):</span> <span className="font-bold">−{computedXpAndBudgetMetrics.overdraft} TP</span></div>
                    ) : (
                      <div className="flex justify-between"><span>Remaining TP:</span>
                        <span className={`font-bold ${computedXpAndBudgetMetrics.remainingTp >= 4 ? "text-green-400" : "text-zinc-400"}`}>
                          {computedXpAndBudgetMetrics.remainingTp} TP
                          {computedXpAndBudgetMetrics.xpFromUnspentTp > 0 && <span className="text-zinc-500 font-normal text-[9px] ml-1">(→ +{computedXpAndBudgetMetrics.xpFromUnspentTp} XP)</span>}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Base pools specifications notes */}
                <div className="pt-2 border-t border-zinc-800/80 text-xs text-zinc-400 space-y-1">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">Baseline Engine Vitals</span>
                  <div className="flex justify-between"><span>Base Health Points:</span> <span className="font-mono text-zinc-300 font-bold">8 HP</span></div>
                  <div className="flex justify-between"><span>Base Stamina Points:</span> <span className="font-mono text-zinc-300 font-bold">8 SP</span></div>
                  <div className="flex justify-between"><span>Base Mana Points:</span> <span className="font-mono text-zinc-300 font-bold">8 MP</span></div>
                </div>

              </div>
            </div>

            {/* Actions Panel Footer */}
            <div className="pt-4 border-t border-zinc-800 mt-4 space-y-2">
              <button onClick={handleSaveProfileRecord} className="w-full btn bg-yellow-600 text-black p-2.5 rounded font-black hover:bg-yellow-500 text-sm shadow-md transition">
                Commit Framework to Save Node Registry
              </button>
              <button onClick={handleDisplayJsonPayload} className="w-full btn bg-zinc-800 border border-zinc-700 text-zinc-300 p-1.5 rounded text-xs font-bold hover:bg-zinc-700 transition">
                Toggle Raw JSON Payload Structure
              </button>
              <pre id="sb-json" className="hidden p-3 bg-black/90 font-mono text-xs text-green-400 rounded max-h-40 overflow-y-auto whitespace-pre-wrap border border-zinc-800"></pre>
            </div>
          </div>
        </div>

      </div>

      {/* Persistent Registry Table Listing View */}
      <div className="pt-4">
        <h2 className="text-xl font-bold text-zinc-300 uppercase mb-3 tracking-wide">Saved Species Catalog Registry ({speciesPresets.length})</h2>
        {speciesPresets.length === 0 ? (
          <div className="text-xs text-zinc-500 bg-zinc-900 p-6 rounded-lg border border-zinc-800/60 text-center italic">
            No active templates in global localStorage node vectors.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {speciesPresets.map((preset) => (
              <div key={preset.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-yellow-500">{preset.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">Saved Profile</span>
                    {pendingDeleteId === preset.id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-red-400 font-mono font-bold">Delete?</span>
                        <button
                          type="button"
                          onClick={() => { deleteSpecies(preset.id); setPendingDeleteId(null); }}
                          className="text-[10px] bg-red-600 hover:bg-red-500 text-white px-2 py-0.5 rounded font-mono font-bold transition"
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="text-[10px] bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2 py-0.5 rounded font-mono font-bold transition"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(preset.id)}
                        className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500 hover:text-white transition font-mono font-bold"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-xs text-zinc-400 space-y-1 font-sans">
                  <div>Morphotype: <span className="text-zinc-300 font-mono capitalize">{jsonMorphotypes[preset.morphotype]?.name || preset.morphotype}</span></div>
                  <div>Biology Base: <span className="text-zinc-300 font-mono capitalize">{flatBiologiesDatabase[preset.biology]?.name || preset.biology}</span></div>
                  <div>Size: <span className="text-zinc-300 font-mono">{sizeCategories[preset.size]?.name || preset.size}</span> | Diet: <span className="text-zinc-300 font-mono">{dietTypes[preset.diet]?.name || preset.diet}</span></div>
                  {preset.biology_rank && (
                    <div>Biology Rank: <span className="text-yellow-400 font-mono font-bold">R{preset.biology_rank} — {BIOLOGY_RANKS[preset.biology_rank]?.label}</span></div>
                  )}
                </div>
                <div className="text-[10px] text-yellow-500 font-mono font-bold pt-1 border-t border-zinc-800/80">Starter Skill XP: {preset.starting_xp_modifier} XP | Comp. Pool: {preset.compensation_pool ?? "—"} TP</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
