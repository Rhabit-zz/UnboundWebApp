import React, { useState, useMemo, useEffect } from "react";
import { useGame } from "../context/GameContext";

// Native direct import of your real database schema file
import speciesData from "../database/Species.json";

export default function SpeciesPage() {
  const { saveNewSpecies, speciesPresets = [] } = useGame() || {};

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
  
  // Custom State Loops for Custom Dropdown Add/Remove Trait List
  const [activeCustomTraits, setActiveCustomTraits] = useState([]);
  const [dropdownSelectedTrait, setDropdownSelectedTrait] = useState("");

  // Exchange State: Track how many extra trait points the user manually bought with starting XP
  const [purchasedTraitPoints, setPurchasedTraitPoints] = useState(0);

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
    setPurchasedTraitPoints(0);  

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

  // 4. BALANCING LEDGER (2 FREE CUSTOM POINT BUDGET SEPARATE FROM BASELINE BIOLOGY PACKAGES)
  const computedXpAndBudgetMetrics = useMemo(() => {
    const BASE_STARTING_XP = 16;       
    const BASE_FREE_CUSTOM_TRAIT_POINTS = 2; 

    const totalCustomPointsPool = BASE_FREE_CUSTOM_TRAIT_POINTS + purchasedTraitPoints;
    const usedCustomPoints = activeCustomTraits.length;
    const remainingTraitPointsBudget = totalCustomPointsPool - usedCustomPoints;
    const manualConversionXpCost = purchasedTraitPoints * 0.5;
    const finalStartingXpBudget = Math.max(0, BASE_STARTING_XP - manualConversionXpCost);

    return {
      baseAllotmentXp: BASE_STARTING_XP,
      freeTraitsAllowance: BASE_FREE_CUSTOM_TRAIT_POINTS,
      totalCustomPointsPool,
      usedCustomPoints,
      remainingTraitPointsBudget,
      manualConversionXpCost,
      finalXpPool: finalStartingXpBudget
    };
  }, [activeCustomTraits, purchasedTraitPoints]);

  // Derived Equipment Slots matching your exact JSON array variable property string: "equipment_slots"
  const architecturalEquipmentSlots = useMemo(() => {
    return jsonMorphotypes[selectedMorphoKey]?.equipment_slots || jsonMorphotypes[selectedMorphoKey]?.slots || [];
  }, [selectedMorphoKey, jsonMorphotypes]);

  // Filters the selectable dropdown list items to prevent duplicate insertions
  const availableDropdownTraits = useMemo(() => {
    let unselected = {};
    Object.keys(flatTraitsDatabase).forEach(key => {
      if (!totalCombinedTraitsList.includes(key)) {
        unselected[key] = flatTraitsDatabase[key];
      }
    });
    return unselected;
  }, [flatTraitsDatabase, totalCombinedTraitsList]);

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
    
    if (computedXpAndBudgetMetrics.remainingTraitPointsBudget <= 0) {
      alert("❌ Trait Refused: Insufficient Custom Trait Points available. Purchase more points at the Exchange Terminal above.");
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
      purchased_trait_points: purchasedTraitPoints,
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
      morphotype: selectedMorphoKey,
      size: selectedSizeKey,
      diet: selectedDietKey,
      lore: loreNotesText,
      core_traits: totalCombinedTraitsList,
      equipment_slots: architecturalEquipmentSlots,
      starting_xp_modifier: computedXpAndBudgetMetrics.finalXpPool
    });

    alert(`✅ Sync Complete: ${speciesName} saved cleanly to global memory nodes.`);
    setSpeciesName("New Species");
    setLoreNotesText("");
    setPurchasedTraitPoints(0);
    setActiveCustomTraits([]);
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

            {/* REBUILT: MORPHOTYPE DERIVED EQUIPMENT SLOTS POPULATED ABOVE LORE NOTES */}
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
                    <span 
                      key={i} 
                      className="bg-zinc-800 text-zinc-300 font-mono text-[11px] font-bold px-2.5 py-1 rounded border border-zinc-700 shadow-sm capitalize tracking-wide"
                    >
                      🛡️ {slot}
                    </span>
                  ))}
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
              
              <p className="text-xs text-zinc-400 font-sans max-w-md border-t border-zinc-800/80 pt-2 w-full">
                Exchange Terminal: <strong>Convert 1 XP to receive 2 Trait Points.</strong>
              </p>

              {/* Conversion Controls */}
              <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 p-1.5 rounded-lg shadow-inner">
                <button 
                  type="button" 
                  onClick={() => setPurchasedTraitPoints(prev => Math.max(0, prev - 2))}
                  className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-md font-mono font-black text-zinc-200 transition text-sm"
                >
                  -
                </button>
                <div className="px-4 font-mono text-xs text-zinc-300 font-semibold">
                  Exchanged: <span className="text-purple-400 font-bold">+{purchasedTraitPoints}</span> Trait Pts
                </div>
                <button 
                  type="button"
                  onClick={() => setPurchasedTraitPoints(prev => prev + 2)}
                  className="w-8 h-8 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-md font-mono font-black text-zinc-200 transition text-sm"
                >
                  +
                </button>
              </div>
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
                    Object.keys(availableDropdownTraits).map(key => (
                      <option key={key} value={key}>{availableDropdownTraits[key]?.name || key}</option>
                    ))
                  ) : (
                    <option value="">— All Dictionary Options Assigned —</option>
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
                  return (
                    <div key={traitId} className={`border p-3 rounded flex flex-col justify-between items-start gap-2 ${isCore ? "bg-purple-950/20 border-purple-900/30" : "bg-zinc-800/50 border-zinc-800"}`}>
                      <div className="w-full">
                        <div className="flex justify-between items-center w-full border-b border-zinc-800/60 pb-1 mb-1">
                          <span className="font-bold text-sm text-yellow-500">
                            {traitDetails?.name || traitId} {isCore && <span className="text-[10px] text-purple-400 font-normal italic ml-1">(Core Package)</span>}
                          </span>
                          {!isCore && (
                            <button 
                              type="button"
                              onClick={() => handleRemoveTraitFromList(traitId)}
                              className="text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded hover:bg-red-500 hover:text-white transition font-mono font-bold"
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
                  <div className="flex justify-between"><span>Base Standard Starter Pool:</span> <span className="text-zinc-300 font-bold">{computedXpAndBudgetMetrics.baseAllotmentXp} XP</span></div>
                  <div className="flex justify-between"><span>Baseline Free Trait Pool:</span> <span className="text-zinc-300 font-bold">{computedXpAndBudgetMetrics.freeTraitsAllowance} Pts</span></div>
                  <div className="flex justify-between"><span>Purchased Trait Upgrades:</span> <span className="text-purple-400 font-bold">+{purchasedTraitPoints} Pts</span></div>
                  
                  <div className="border-t border-zinc-800/60 my-1 pt-1 flex justify-between">
                    <span>Total Custom Trait Pool:</span> 
                    <span className="text-zinc-200 font-bold">{computedXpAndBudgetMetrics.totalCustomPointsPool} Pts</span>
                  </div>
                  <div className="flex justify-between"><span>Used Custom Trait Points:</span> <span className="text-blue-400 font-bold">{computedXpAndBudgetMetrics.usedCustomPoints} / {computedXpAndBudgetMetrics.totalCustomPointsPool}</span></div>
                  <div className="flex justify-between"><span>Unspent Custom Points:</span> <span className="text-zinc-300 font-bold">{computedXpAndBudgetMetrics.remainingTraitPointsBudget} Pts</span></div>
                  
                  {purchasedTraitPoints > 0 && (
                    <div className="flex justify-between text-purple-400 pt-1 border-t border-zinc-800/60"><span className="font-sans">XP Spent on Exchange:</span> <span>-{computedXpAndBudgetMetrics.manualConversionXpCost} XP</span></div>
                  )}
                  <div className="flex justify-between text-yellow-500 font-bold pt-1.5 border-t border-zinc-800/80 text-sm">
                    <span className="font-sans">Final Starter Skill XP:</span> 
                    <span>{computedXpAndBudgetMetrics.finalXpPool} XP</span>
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
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400">Saved Profile</span>
                </div>
                <div className="text-xs text-zinc-400 space-y-1 font-sans">
                  <div>Morphotype: <span className="text-zinc-300 font-mono capitalize">{jsonMorphotypes[preset.morphotype]?.name || preset.morphotype}</span></div>
                  <div>Biology Base: <span className="text-zinc-300 font-mono capitalize">{flatBiologiesDatabase[preset.biology]?.name || preset.biology}</span></div>
                  <div>Size: <span className="text-zinc-300 font-mono">{sizeCategories[preset.size]?.name || preset.size}</span> | Diet: <span className="text-zinc-300 font-mono">{dietTypes[preset.diet]?.name || preset.diet}</span></div>
                </div>
                <div className="text-[10px] text-yellow-500 font-mono font-bold pt-1 border-t border-zinc-800/80">Final Starter Skill Budget: {preset.starting_xp_modifier} XP</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </section>
  );
}
