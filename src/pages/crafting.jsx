import React, { useState, useMemo, useCallback } from 'react';
import CraftRecipes from '../database/CraftRecipes.json';
import { useGame } from '../context/GameContext';

const TIER_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
const TIER_COLOR = {
  common: 'text-zinc-400',
  uncommon: 'text-green-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

// Flatten CraftRecipes into an array with era + skill metadata
function flattenRecipes(data) {
  const list = [];
  const SKIP = ['_meta'];
  for (const [era, skills] of Object.entries(data)) {
    if (SKIP.includes(era)) continue;
    for (const [skill, recipes] of Object.entries(skills)) {
      for (const recipe of Object.values(recipes)) {
        list.push({ ...recipe, _era: era, _skill: skill });
      }
    }
  }
  return list;
}

const ALL_RECIPES = flattenRecipes(CraftRecipes);
const ALL_ERAS = [...new Set(ALL_RECIPES.map((r) => r._era))];
const ALL_SKILLS = [...new Set(ALL_RECIPES.map((r) => r._skill))].sort();

function rollDice(count) {
  const rolls = [];
  for (let i = 0; i < count; i++) rolls.push(Math.floor(Math.random() * 6) + 1);
  return rolls;
}

function canAffordMaterials(character, recipe) {
  if (!character) return false;
  const mats = character.materials || {};
  for (const req of recipe.materials || []) {
    if ((mats[req.id] || 0) < req.qty) return false;
  }
  return true;
}

export default function CraftingPage() {
  const { characters, activeCharacter, setActiveCharacter, removeMaterials, addCraftedItem, addKnowledgeTag } = useGame();

  const [filterEra, setFilterEra] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [skillLevel, setSkillLevel] = useState(1);
  const [log, setLog] = useState([{ type: 'info', text: 'Select a recipe to begin crafting.' }]);

  const appendLog = useCallback((entry) => {
    setLog((prev) => [entry, ...prev].slice(0, 40));
  }, []);

  const filteredRecipes = useMemo(() => {
    return ALL_RECIPES.filter((r) => {
      if (filterEra && r._era !== filterEra) return false;
      if (filterSkill && r._skill !== filterSkill) return false;
      if (filterTier && r.tier !== filterTier) return false;
      return true;
    });
  }, [filterEra, filterSkill, filterTier]);

  const affordable = selectedRecipe ? canAffordMaterials(activeCharacter, selectedRecipe) : false;

  const handleCraft = () => {
    if (!selectedRecipe) return appendLog({ type: 'warn', text: 'Select a recipe first.' });
    if (!activeCharacter) return appendLog({ type: 'warn', text: 'No active character selected.' });

    const lvl = parseInt(skillLevel, 10) || 1;
    if (lvl < (selectedRecipe.skill_level_required || 1)) {
      return appendLog({
        type: 'warn',
        text: `Skill level too low. This recipe requires ${selectedRecipe._skill} level ${selectedRecipe.skill_level_required}.`,
      });
    }

    const rolls = rollDice(lvl);
    const total = rolls.reduce((a, b) => a + b, 0);
    const dc = selectedRecipe.crafting_dc;
    const margin = total - dc;
    const rollStr = `[${rolls.join(',')}]=${total}`;

    if (margin >= 10) {
      // Critical success
      if (!affordable) return appendLog({ type: 'warn', text: 'Insufficient materials.' });
      consumeMaterials(activeCharacter.id, selectedRecipe);
      const item = buildItem(selectedRecipe, total, dc, lvl);
      addCraftedItem(activeCharacter.id, { ...item, quality: 'critical' });
      appendLog({
        type: 'crit',
        text: `CRITICAL SUCCESS! (${lvl}d6${rollStr} vs DC${dc}, +${margin}) — ${selectedRecipe.name} crafted. ${selectedRecipe.critical_success_effect || ''}`,
      });
    } else if (margin >= 0) {
      if (!affordable) return appendLog({ type: 'warn', text: 'Insufficient materials.' });
      consumeMaterials(activeCharacter.id, selectedRecipe);
      const item = buildItem(selectedRecipe, total, dc, lvl);
      addCraftedItem(activeCharacter.id, { ...item, quality: 'standard' });
      appendLog({
        type: 'success',
        text: `SUCCESS (${lvl}d6${rollStr} vs DC${dc}, +${margin} bonus HP) — ${selectedRecipe.name} crafted.`,
      });
    } else if (margin >= -3) {
      appendLog({
        type: 'partial',
        text: `NEAR MISS (${lvl}d6${rollStr} vs DC${dc}, missed by ${Math.abs(margin)}) — 75% materials recovered.`,
      });
      partialRecoverMaterials(activeCharacter.id, selectedRecipe, 0.75);
    } else if (margin >= -6) {
      appendLog({
        type: 'fail',
        text: `FAILURE (${lvl}d6${rollStr} vs DC${dc}, missed by ${Math.abs(margin)}) — 50% materials recovered.`,
      });
      partialRecoverMaterials(activeCharacter.id, selectedRecipe, 0.5);
    } else if (margin >= -9) {
      appendLog({
        type: 'fail',
        text: `FAILURE (${lvl}d6${rollStr} vs DC${dc}, missed by ${Math.abs(margin)}) — 25% materials recovered.`,
      });
      partialRecoverMaterials(activeCharacter.id, selectedRecipe, 0.25);
    } else {
      appendLog({
        type: 'fail',
        text: `CRITICAL FAILURE (${lvl}d6${rollStr} vs DC${dc}, missed by ${Math.abs(margin)}) — all materials lost.`,
      });
      consumeMaterials(activeCharacter.id, selectedRecipe);
    }
  };

  function consumeMaterials(charId, recipe) {
    for (const mat of recipe.materials || []) {
      removeMaterials(charId, mat.id, mat.qty);
    }
  }

  function partialRecoverMaterials(charId, recipe, recoveryRate) {
    for (const mat of recipe.materials || []) {
      const consumed = mat.qty - Math.floor(mat.qty * recoveryRate);
      removeMaterials(charId, mat.id, consumed);
    }
  }

  function buildItem(recipe, total, dc, skillLvl) {
    return {
      name: recipe.name,
      recipeId: recipe.id,
      type: recipe.output?.type || 'item',
      tier: recipe.tier,
      skill: recipe._skill,
      era: recipe._era,
      functionalMaterial: recipe.functional_material,
      bonusHp: Math.max(0, total - dc),
      craftedBy: activeCharacter?.name,
      craftedAt: new Date().toLocaleDateString(),
    };
  }

  const logColor = (type) => {
    if (type === 'crit') return 'text-yellow-300';
    if (type === 'success') return 'text-green-400';
    if (type === 'partial') return 'text-orange-400';
    if (type === 'fail') return 'text-red-400';
    if (type === 'warn') return 'text-yellow-500';
    return 'text-zinc-400';
  };

  return (
    <section className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-1">Crafting</h1>
      <p className="text-purple-200 mb-5 text-sm">
        Select a recipe, roll your crafting skill dice, and build items from your gathered materials.
      </p>

      {/* Character bar */}
      <div className="bg-zinc-800 rounded p-3 mb-5 flex items-center gap-4 flex-wrap">
        <span className="text-sm text-zinc-400 shrink-0">Active Character:</span>
        {characters.length === 0 ? (
          <span className="text-yellow-500 text-sm">No characters yet — create one on the Characters page.</span>
        ) : (
          <select
            value={activeCharacter?.id || ''}
            onChange={(e) => setActiveCharacter(e.target.value || null)}
            className="bg-zinc-700 text-white text-sm px-3 py-1.5 rounded"
          >
            <option value="">— Select character —</option>
            {characters.map((c) => (
              <option key={c.id} value={c.id}>{c.name || c.id}</option>
            ))}
          </select>
        )}
        {activeCharacter && (
          <>
            <span className="text-green-400 text-sm font-medium">{activeCharacter.name}</span>
            {Object.keys(activeCharacter.materials || {}).length > 0 && (
              <span className="text-xs text-zinc-400">
                Materials: {Object.entries(activeCharacter.materials).map(([k, v]) => `${k}×${v}`).join(', ')}
              </span>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recipe browser */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="bg-zinc-800 rounded p-4 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Era</label>
              <select
                value={filterEra}
                onChange={(e) => setFilterEra(e.target.value)}
                className="bg-zinc-700 text-white text-sm px-2 py-1.5 rounded"
              >
                <option value="">All eras</option>
                {ALL_ERAS.map((e) => (
                  <option key={e} value={e}>{e.charAt(0).toUpperCase() + e.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Skill</label>
              <select
                value={filterSkill}
                onChange={(e) => setFilterSkill(e.target.value)}
                className="bg-zinc-700 text-white text-sm px-2 py-1.5 rounded"
              >
                <option value="">All skills</option>
                {ALL_SKILLS.map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Tier</label>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-zinc-700 text-white text-sm px-2 py-1.5 rounded"
              >
                <option value="">All tiers</option>
                {TIER_ORDER.map((t) => (
                  <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <span className="text-xs text-zinc-500 self-end pb-1.5">{filteredRecipes.length} recipes</span>
          </div>

          {/* Recipe list */}
          <div className="bg-zinc-800 rounded p-4">
            <div className="space-y-1 max-h-[480px] overflow-y-auto pr-1">
              {filteredRecipes.length === 0 ? (
                <p className="text-zinc-500 text-sm italic p-2">No recipes match the current filters.</p>
              ) : (
                filteredRecipes.map((recipe) => {
                  const hasEnough = canAffordMaterials(activeCharacter, recipe);
                  return (
                    <button
                      key={recipe.id}
                      onClick={() => setSelectedRecipe(recipe)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                        selectedRecipe?.id === recipe.id
                          ? 'bg-yellow-600/20 border border-yellow-500/40'
                          : 'bg-zinc-700/50 hover:bg-zinc-700'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-medium">{recipe.name}</span>
                        <span className="flex gap-2 text-xs shrink-0 items-center">
                          {activeCharacter && (
                            <span className={hasEnough ? 'text-green-500' : 'text-red-500'}>
                              {hasEnough ? '✓' : '✗'}
                            </span>
                          )}
                          <span className={TIER_COLOR[recipe.tier]}>{recipe.tier}</span>
                          <span className="text-zinc-400">{recipe._skill.replace(/_/g, ' ')}</span>
                          <span className="text-zinc-500">DC {recipe.crafting_dc}</span>
                        </span>
                      </div>
                      {selectedRecipe?.id === recipe.id && (
                        <div className="mt-2 text-xs text-zinc-400 space-y-1">
                          <p>Materials needed: {recipe.materials.map((m) => `${m.qty} ${m.unit} ${m.id}`).join(', ')}</p>
                          {recipe.tools_required?.length > 0 && (
                            <p>Tools: {recipe.tools_required.join(', ')}</p>
                          )}
                          {recipe.time_requirement && <p>Time: {recipe.time_requirement}</p>}
                          {recipe.critical_success_effect && (
                            <p className="text-yellow-400">Crit bonus: {recipe.critical_success_effect}</p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Crafted items library */}
          {activeCharacter && (activeCharacter.craftedItems || []).length > 0 && (
            <div className="bg-zinc-800 rounded p-4">
              <h2 className="text-base font-semibold mb-3">
                {activeCharacter.name} — Crafted Items ({activeCharacter.craftedItems.length})
              </h2>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {[...(activeCharacter.craftedItems || [])].reverse().map((item) => (
                  <div key={item.id} className="flex justify-between text-sm px-3 py-1.5 bg-zinc-700/40 rounded">
                    <span>
                      <span className="font-medium">{item.name}</span>
                      {item.bonusHp > 0 && (
                        <span className="text-green-400 text-xs ml-2">+{item.bonusHp} HP</span>
                      )}
                      {item.quality === 'critical' && (
                        <span className="text-yellow-400 text-xs ml-2">★ Crit</span>
                      )}
                    </span>
                    <span className="text-xs text-zinc-500">{item.craftedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Craft action + log */}
        <div className="space-y-4">
          <div className="bg-zinc-800 rounded p-4">
            <h2 className="text-base font-semibold mb-3">Craft</h2>

            {selectedRecipe ? (
              <div className="bg-zinc-700/60 rounded p-3 mb-4 space-y-1 text-sm">
                <p className="font-medium text-white">{selectedRecipe.name}</p>
                <p className="text-zinc-400">
                  <span className={TIER_COLOR[selectedRecipe.tier]}>{selectedRecipe.tier}</span>
                  <span className="mx-2">·</span>DC {selectedRecipe.crafting_dc}
                  <span className="mx-2">·</span>L{selectedRecipe.skill_level_required}+ {selectedRecipe._skill.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-zinc-400">
                  Requires: {selectedRecipe.materials.map((m) => `${m.qty}${m.unit} ${m.id}`).join(', ')}
                </p>
                {activeCharacter && !affordable && (
                  <p className="text-red-400 text-xs">Insufficient materials in inventory.</p>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm mb-4 italic">Select a recipe from the list.</p>
            )}

            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1">
                Skill Level (1–5) — rolls {skillLevel}d6
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={skillLevel}
                onChange={(e) => setSkillLevel(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-zinc-700 text-white p-2 rounded text-sm"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Roll {skillLevel}d6 total vs DC {selectedRecipe?.crafting_dc ?? '?'}
              </p>
            </div>

            <button
              onClick={handleCraft}
              disabled={!selectedRecipe || !activeCharacter}
              className="w-full bg-yellow-700 hover:bg-yellow-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-2 rounded transition"
            >
              {!activeCharacter ? 'Select a character first' : !selectedRecipe ? 'Select a recipe' : 'Attempt Craft'}
            </button>

            {selectedRecipe && (
              <div className="mt-3 text-xs text-zinc-500 space-y-0.5">
                <p>≥DC: success (+margin as bonus HP)</p>
                <p>DC+10: critical — {selectedRecipe.critical_success_effect}</p>
                <p>miss 1-3: 75% mats back · miss 4-6: 50% · miss 7-9: 25%</p>
                <p>miss 10+: critical failure — all mats lost</p>
              </div>
            )}
          </div>

          {/* Log */}
          <div className="bg-zinc-800 rounded p-4">
            <h2 className="text-sm font-semibold mb-2 text-zinc-300">Craft Log</h2>
            <div className="bg-black/40 rounded p-2 max-h-64 overflow-y-auto space-y-1 font-mono text-xs">
              {log.map((entry, i) => (
                <p key={i} className={logColor(entry.type)}>{entry.text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
