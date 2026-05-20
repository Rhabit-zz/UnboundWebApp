import React, { useState, useCallback } from 'react';
import Gatherables from '../database/Gatherables.json';
import { useGame } from '../context/GameContext';

const ZONE_KEYS = Object.keys(Gatherables.zones);

const TIER_COLOR = {
  1: 'text-zinc-400',
  2: 'text-green-400',
  3: 'text-blue-400',
  4: 'text-purple-400',
  5: 'text-yellow-400',
};

function rollYield(notation) {
  const match = String(notation).match(/^(\d+)d(\d+)$/);
  if (!match) return parseInt(notation, 10) || 1;
  const [, count, sides] = match.map(Number);
  let total = 0;
  for (let i = 0; i < count; i++) total += Math.floor(Math.random() * sides) + 1;
  return total;
}

export default function GatheringPage() {
  const { characters, activeCharacter, setActiveCharacter, addMaterials, addKnowledgeTag } = useGame();

  const [selectedZone, setSelectedZone] = useState(ZONE_KEYS[0]);
  const [selectedMat, setSelectedMat] = useState(null);
  const [skillLevel, setSkillLevel] = useState(1);
  const [log, setLog] = useState([{ type: 'info', text: 'Select a zone and material to begin gathering.' }]);

  const zone = Gatherables.zones[selectedZone];

  const appendLog = useCallback((entry) => {
    setLog((prev) => [entry, ...prev].slice(0, 40));
  }, []);

  const handleZoneChange = (key) => {
    setSelectedZone(key);
    setSelectedMat(null);
  };

  const handleGather = () => {
    if (!selectedMat) return appendLog({ type: 'warn', text: 'Select a material first.' });
    if (!activeCharacter) return appendLog({ type: 'warn', text: 'No active character selected.' });

    const dieRoll = Math.floor(Math.random() * 6) + 1;
    const total = dieRoll + parseInt(skillLevel, 10);
    const dc = selectedMat.gather_dc;
    const margin = total - dc;

    if (margin >= 0) {
      const qty = rollYield(selectedMat.yield);
      addMaterials(activeCharacter.id, selectedMat.id, qty);

      const newTags = [];
      for (const tag of selectedMat.knowledge_tags_earned || []) {
        if (!(activeCharacter.knowledgeTags || []).includes(tag)) {
          addKnowledgeTag(activeCharacter.id, tag);
          newTags.push(tag);
        }
      }

      const tagNote = newTags.length > 0 ? ` · Learned: ${newTags.join(', ')}.` : '';
      appendLog({
        type: 'success',
        text: `SUCCESS (1d6[${dieRoll}]+${skillLevel}=${total} vs DC ${dc}) — ${qty} ${selectedMat.unit} of ${selectedMat.name} gathered.${tagNote}`,
      });
    } else {
      const miss = Math.abs(margin);
      const note = miss <= 3 ? 'Close miss — nothing recovered.' : miss <= 6 ? 'Clear failure.' : 'Critical failure.';
      appendLog({
        type: 'fail',
        text: `FAIL (1d6[${dieRoll}]+${skillLevel}=${total} vs DC ${dc}, miss by ${miss}) — ${note}`,
      });
    }
  };

  const logColor = (type) => {
    if (type === 'success') return 'text-green-400';
    if (type === 'fail') return 'text-red-400';
    if (type === 'warn') return 'text-yellow-400';
    return 'text-zinc-400';
  };

  return (
    <section className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-1">Gathering</h1>
      <p className="text-purple-200 mb-5 text-sm">
        Select a zone, choose a material, and attempt a skill check to gather resources.
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
          <span className="text-green-400 text-sm font-medium">{activeCharacter.name}</span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Zone + Material list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-800 rounded p-4">
            <label className="block text-sm text-zinc-400 mb-2">Gathering Zone</label>
            <select
              value={selectedZone}
              onChange={(e) => handleZoneChange(e.target.value)}
              className="w-full bg-zinc-700 text-white p-2 rounded mb-3"
            >
              {ZONE_KEYS.map((key) => (
                <option key={key} value={key}>{Gatherables.zones[key].name}</option>
              ))}
            </select>
            <p className="text-xs text-zinc-400 italic mb-2">{zone.description}</p>
            <p className="text-xs text-zinc-500">
              Primary: <span className="text-zinc-300">{zone.primary_skill}</span>
              {zone.secondary_skill && (
                <> · Secondary: <span className="text-zinc-300">{zone.secondary_skill}</span></>
              )}
            </p>
          </div>

          <div className="bg-zinc-800 rounded p-4">
            <h2 className="text-base font-semibold mb-3">Zone Materials</h2>
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 text-xs text-zinc-500 px-3 mb-2 hidden sm:grid">
              <span>Material</span><span>Tier</span><span>Skill</span><span>DC</span><span>Yield</span>
            </div>
            <div className="space-y-1">
              {zone.materials.map((mat, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedMat(mat)}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition ${
                    selectedMat === mat
                      ? 'bg-yellow-600/20 border border-yellow-500/40'
                      : 'bg-zinc-700/50 hover:bg-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2 flex-wrap">
                    <span className="font-medium">{mat.name}</span>
                    <span className="flex gap-3 text-xs text-zinc-400 shrink-0">
                      <span className={TIER_COLOR[mat.tier]}>T{mat.tier}</span>
                      <span>{mat.skill}</span>
                      <span>DC {mat.gather_dc}</span>
                      <span className="text-zinc-300">{mat.yield} {mat.unit}</span>
                    </span>
                  </div>
                  {selectedMat === mat && mat.knowledge_tags_earned?.length > 0 && (
                    <p className="text-xs text-purple-300 mt-1">
                      Tags: {mat.knowledge_tags_earned.join(', ')}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action + sidebar */}
        <div className="space-y-4">
          {/* Gather action panel */}
          <div className="bg-zinc-800 rounded p-4">
            <h2 className="text-base font-semibold mb-3">Attempt Gather</h2>

            {selectedMat ? (
              <div className="bg-zinc-700/60 rounded p-3 mb-4 text-sm space-y-1">
                <p className="font-medium text-white">{selectedMat.name}</p>
                <p className="text-zinc-400">
                  Skill: <span className="text-yellow-300">{selectedMat.skill}</span>
                  <span className="mx-2">·</span>
                  DC: <span className="text-yellow-300">{selectedMat.gather_dc}</span>
                </p>
                <p className="text-zinc-400">
                  Yield: <span className="text-yellow-300">{selectedMat.yield} {selectedMat.unit}</span>
                </p>
              </div>
            ) : (
              <p className="text-zinc-500 text-sm mb-4 italic">Select a material from the list.</p>
            )}

            <div className="mb-4">
              <label className="block text-xs text-zinc-400 mb-1">Skill Level (1–5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={skillLevel}
                onChange={(e) => setSkillLevel(Math.min(5, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full bg-zinc-700 text-white p-2 rounded text-sm"
              />
              <p className="text-xs text-zinc-500 mt-1">Roll: 1d6 + level vs material DC</p>
            </div>

            <button
              onClick={handleGather}
              disabled={!selectedMat || !activeCharacter}
              className="w-full bg-green-700 hover:bg-green-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-2 rounded transition"
            >
              {!activeCharacter ? 'Select a character first' : !selectedMat ? 'Select a material' : 'Attempt Gather'}
            </button>
          </div>

          {/* Character materials */}
          {activeCharacter && (
            <div className="bg-zinc-800 rounded p-4">
              <h2 className="text-sm font-semibold mb-2 text-zinc-300">
                {activeCharacter.name} — Materials
              </h2>
              {Object.keys(activeCharacter.materials || {}).length === 0 ? (
                <p className="text-xs text-zinc-500 italic">None gathered yet.</p>
              ) : (
                <div className="space-y-1 text-xs max-h-36 overflow-y-auto">
                  {Object.entries(activeCharacter.materials || {}).map(([id, qty]) => (
                    <div key={id} className="flex justify-between text-zinc-300">
                      <span>{id}</span>
                      <span className="text-yellow-400 font-medium">{qty}</span>
                    </div>
                  ))}
                </div>
              )}
              {(activeCharacter.knowledgeTags || []).length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-zinc-500 mb-1">Knowledge Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {activeCharacter.knowledgeTags.map((tag) => (
                      <span key={tag} className="bg-purple-900/40 text-purple-300 text-xs px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gather log */}
          <div className="bg-zinc-800 rounded p-4">
            <h2 className="text-sm font-semibold mb-2 text-zinc-300">Gather Log</h2>
            <div className="bg-black/40 rounded p-2 max-h-52 overflow-y-auto space-y-1 font-mono text-xs">
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
