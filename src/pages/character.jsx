import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import {
  getRankUpgradeCost,
  getRankDowngradeRefund,
  calculateVitals,
  calculatePowerRating
} from '../utils/gameCalculations';

// ─── Era availability ────────────────────────────────────────────────────────
const ERA_HIERARCHY = {
  mundane:    ['mundane'],
  industrial: ['mundane', 'industrial'],
  future:     ['mundane', 'industrial', 'future'],
  fantasy:    ['mundane', 'fantasy'],
};
const ERA_LABELS = {
  mundane:    'Mundane (Ancient – Medieval)',
  industrial: 'Industrial (Renaissance – Steam)',
  future:     'Future (Modern – Sci-Fi)',
  fantasy:    'Fantasy (Magical / Mythological)',
};
function eraAllowed(skillEra, characterEra) {
  if (!skillEra || skillEra === 'all') return true;
  return (ERA_HIERARCHY[characterEra] || ['mundane']).includes(skillEra);
}

// ─── Progression text helpers ────────────────────────────────────────────────
function levelText(entry) {
  if (!entry) return '—';
  if (typeof entry === 'string') return entry;
  const meta = [];
  if (entry.name)     meta.push(entry.name);
  if (entry.ap_cost)  meta.push(`${entry.ap_cost} AP`);
  if (entry.sp_cost)  meta.push(`${entry.sp_cost} SP`);
  if (entry.mp_cost)  meta.push(`${entry.mp_cost} MP`);
  if (entry.dc)       meta.push(`DC ${entry.dc}`);
  const header = meta.length ? `[${meta.join(' · ')}] ` : '';
  const body   = entry.effect || entry.capabilities || '';
  return header + body;
}

// ─── Per-source extractors ───────────────────────────────────────────────────
function extractCombatStyles(data) {
  if (!data) return [];
  const SKIP = ['_meta', 'template'];
  const out = [];
  for (const [era, bucket] of Object.entries(data)) {
    if (SKIP.includes(era) || typeof bucket !== 'object') continue;
    for (const [id, skill] of Object.entries(bucket)) {
      if (!skill?.name) continue;
      out.push({
        id: `combat_${era}_${id}`,
        name: skill.name,
        subtitle: skill.subtitle || '',
        category: 'Combat Style',
        era,
        governing_stat: skill.governing_stat || '—',
        description: skill.description || '',
        requirements: skill.requirements || [],
        progressions: skill.ranks || {},
      });
    }
  }
  return out;
}

function extractCraftSkills(data) {
  if (!data) return [];
  const SKIP = ['_meta', 'level_framework', 'crafter_combat_styles', 'knowledge_tag_system', 'recipe_system'];
  const out = [];
  for (const [bucket, skills] of Object.entries(data)) {
    if (SKIP.includes(bucket) || typeof skills !== 'object') continue;
    const isGathering = bucket === 'gathering';
    for (const [id, skill] of Object.entries(skills)) {
      if (!skill?.name) continue;
      out.push({
        id: `craft_${bucket}_${id}`,
        name: skill.name,
        subtitle: skill.description || '',
        category: isGathering ? 'Gathering' : 'Profession',
        era: isGathering ? 'all' : bucket,
        governing_stat: skill.governing_stat || (skill.governing_stat_options || [])[0] || '—',
        description: skill.description || '',
        requirements: [],
        progressions: skill.levels || {},
      });
    }
  }
  // Crafter combat styles (available in any era)
  const styles = data.crafter_combat_styles;
  if (styles) {
    for (const [id, style] of Object.entries(styles)) {
      if (!style?.name) continue;
      out.push({
        id: `craft_style_${id}`,
        name: style.name,
        subtitle: (style.associated_professions || []).join(', '),
        category: 'Craft Combat',
        era: 'all',
        governing_stat: style.governing_stat || (style.governing_stat_options || [])[0] || '—',
        description: `Professions: ${(style.associated_professions || []).join(', ')}`,
        requirements: [],
        progressions: style.levels || {},
      });
    }
  }
  return out;
}

function extractAffinities(data) {
  if (!data?.affinities) return [];
  const NON_SKILL = new Set(['description', 'opposing_pairs', 'unlock_rule', 'affinities']);
  const out = [];
  // emotional + primal_elemental: skills are direct children of the domain
  for (const domain of ['emotional', 'primal_elemental']) {
    const bucket = data.affinities[domain];
    if (!bucket) continue;
    const label = domain === 'primal_elemental' ? 'Elemental' : 'Emotional';
    for (const [id, item] of Object.entries(bucket)) {
      if (NON_SKILL.has(id) || !item?.name) continue;
      out.push({
        id: `aff_${domain}_${id}`,
        name: item.name,
        subtitle: item.theme || item.alignment || '',
        category: `Affinity — ${label}`,
        era: 'fantasy',
        governing_stat: item.governing_stat || 'MND',
        description: item.theme || '',
        requirements: item.requirements || [],
        progressions: item.levels || item.ranks || {},
      });
    }
  }
  // arcane has an extra nesting level: affinities.arcane.affinities.{skill}
  const arcane = data.affinities.arcane?.affinities;
  if (arcane) {
    for (const [id, item] of Object.entries(arcane)) {
      if (!item?.name) continue;
      out.push({
        id: `aff_arcane_${id}`,
        name: item.name,
        subtitle: 'Arcane',
        category: 'Affinity — Arcane',
        era: 'fantasy',
        governing_stat: item.governing_stat || 'MND',
        description: '',
        requirements: item.requirements || [],
        progressions: item.levels || item.ranks || {},
      });
    }
  }
  return out;
}

function extractProficiencies(data) {
  if (!data) return [];
  const SKIP = new Set(['_meta']);
  const out = [];
  for (const [bucket, skills] of Object.entries(data)) {
    if (SKIP.has(bucket) || typeof skills !== 'object') continue;
    const label = bucket.charAt(0).toUpperCase() + bucket.slice(1);
    for (const [id, skill] of Object.entries(skills)) {
      if (!skill?.name) continue;
      out.push({
        id: `prof_${bucket}_${id}`,
        name: skill.name,
        subtitle: '',
        category: `Proficiency — ${label}`,
        era: 'all',
        governing_stat: skill.governing_stat || 'highest',
        description: '',
        requirements: skill.requirements || [],
        progressions: skill.levels || {},
      });
    }
  }
  return out;
}

function extractSocialSkills(data) {
  if (!data) return [];
  const TIER_BUCKETS = ['tier_1_skills', 'tier_2_skills', 'tier_3_skills', 'mystical_skills'];
  const out = [];
  for (const bucket of TIER_BUCKETS) {
    if (!data[bucket]) continue;
    for (const [id, skill] of Object.entries(data[bucket])) {
      if (!skill?.name) continue;
      out.push({
        id: `social_${bucket}_${id}`,
        name: skill.name,
        subtitle: skill.subtitle || '',
        category: 'Social',
        era: 'all',
        governing_stat: skill.governing_stat || 'SPT',
        description: skill.domain || skill.description || '',
        requirements: skill.requirements || [],
        progressions: skill.levels || {},
      });
    }
  }
  return out;
}

// ─── Category ordering for tabs ──────────────────────────────────────────────
const CATEGORY_ORDER = [
  'Combat Style',
  'Profession',
  'Gathering',
  'Craft Combat',
  'Affinity — Emotional',
  'Affinity — Elemental',
  'Affinity — Arcane',
  'Proficiency — Weapon',
  'Proficiency — Armor',
  'Social',
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function CharacterPage() {
  const { speciesPresets, characters, saveNewCharacter, resetAllData } = useGame();

  const [personasDatabase, setPersonasDatabase] = useState([]);
  const [craftSkillsData, setCraftSkillsData]   = useState(null);
  const [combatStylesData, setCombatStylesData] = useState(null);
  const [affinitiesData, setAffinitiesData]     = useState(null);
  const [proficienciesData, setProficienciesData] = useState(null);
  const [socialSkillsData, setSocialSkillsData] = useState(null);

  const [selectedSpecies, setSelectedSpecies]   = useState(null);
  const [selectedPersona, setSelectedPersona]   = useState(null);
  const [characterName, setCharacterName]       = useState('');
  const [selectedEra, setSelectedEra]           = useState('mundane');

  const [startingXp, setStartingXp]   = useState(16);
  const [xpRemaining, setXpRemaining] = useState(16);
  const [personaRank, setPersonaRank] = useState(1);
  const [stats, setStats]             = useState({ BDY: 1, SPT: 1, MND: 1 });
  const [skills, setSkills]           = useState([]);
  const [traits, setTraits]           = useState([]);

  const [selectedCategory, setSelectedCategory] = useState('Combat Style');
  const [selectedSkillId, setSelectedSkillId]   = useState('');

  useEffect(() => {
    Promise.all([
      fetch('/src/database/Personas.json').then(r => r.json()),
      fetch('/src/database/CraftSkills.json').then(r => r.json()),
      fetch('/src/database/CombatStyles.json').then(r => r.json()),
      fetch('/src/database/Affinities.json').then(r => r.json()),
      fetch('/src/database/Proficiencies.json').then(r => r.json()),
      fetch('/src/database/SocialSkills.json').then(r => r.json()),
    ]).then(([personas, craft, combat, affinities, prof, social]) => {
      setPersonasDatabase(personas.personas || []);
      setCraftSkillsData(craft);
      setCombatStylesData(combat);
      setAffinitiesData(affinities);
      setProficienciesData(prof);
      setSocialSkillsData(social);
    }).catch(err => console.error('DB load error:', err));
  }, []);

  // Full skill pool (flat, deduplicated by id)
  const allSkills = useMemo(() => [
    ...extractCombatStyles(combatStylesData),
    ...extractCraftSkills(craftSkillsData),
    ...extractAffinities(affinitiesData),
    ...extractProficiencies(proficienciesData),
    ...extractSocialSkills(socialSkillsData),
  ], [combatStylesData, craftSkillsData, affinitiesData, proficienciesData, socialSkillsData]);

  // Skills visible given current era + selected category
  const visibleSkills = useMemo(() => {
    return allSkills.filter(s =>
      eraAllowed(s.era, selectedEra) && s.category === selectedCategory
    );
  }, [allSkills, selectedEra, selectedCategory]);

  // Categories available for the current era
  const availableCategories = useMemo(() => {
    const seen = new Set(
      allSkills.filter(s => eraAllowed(s.era, selectedEra)).map(s => s.category)
    );
    return CATEGORY_ORDER.filter(c => seen.has(c));
  }, [allSkills, selectedEra]);

  const activeSkillDef = useMemo(
    () => allSkills.find(s => s.id === selectedSkillId) || null,
    [allSkills, selectedSkillId]
  );
  const activeSkillLevel = skills.find(s => s.id === selectedSkillId)?.level || 0;

  // ── Species / Persona reset effects ────────────────────────────────────────
  useEffect(() => {
    if (selectedSpecies) {
      const xp = selectedSpecies.leftoverXp ?? 16;
      setStartingXp(xp); setXpRemaining(xp);
      setTraits(selectedSpecies.traits || []);
    } else {
      setStartingXp(16); setXpRemaining(16); setTraits([]);
    }
    setStats({ BDY: 1, SPT: 1, MND: 1 });
    setPersonaRank(1); setSkills([]); setSelectedPersona(null); setSelectedSkillId('');
  }, [selectedSpecies]);

  useEffect(() => {
    if (selectedPersona) {
      const s = { BDY: 1, SPT: 1, MND: 1 };
      if (selectedPersona.stat in s) s[selectedPersona.stat] += 1;
      setStats(s);
      setPersonaRank(1); setXpRemaining(startingXp); setSkills([]);
    }
  }, [selectedPersona, startingXp]);

  // Reset category when era changes to avoid empty tab
  useEffect(() => {
    if (!availableCategories.includes(selectedCategory)) {
      setSelectedCategory(availableCategories[0] || 'Combat Style');
    }
    setSelectedSkillId('');
  }, [selectedEra, availableCategories]);

  // ── Stat / Persona / Skill adjusters ───────────────────────────────────────
  const handleAdjustStat = (key, dir) => {
    if (!selectedPersona) return;
    const cur = stats[key];
    const baseline = key === selectedPersona.stat ? 2 : 1;
    if (dir === 1 && cur < 5) {
      const cost = getRankUpgradeCost(cur);
      if (xpRemaining >= cost) {
        setStats(p => ({ ...p, [key]: cur + 1 }));
        setXpRemaining(p => p - cost);
      }
    } else if (dir === -1 && cur > baseline) {
      const refund = getRankDowngradeRefund(cur);
      setStats(p => ({ ...p, [key]: cur - 1 }));
      setXpRemaining(p => p + refund);
    }
  };

  const handleAdjustPersonaRank = (dir) => {
    if (dir === 1 && personaRank < 5) {
      const cost = getRankUpgradeCost(personaRank);
      if (xpRemaining >= cost) {
        setPersonaRank(p => p + 1);
        setXpRemaining(p => p - cost);
      }
    } else if (dir === -1 && personaRank > 1) {
      const refund = getRankDowngradeRefund(personaRank);
      setPersonaRank(p => p - 1);
      setXpRemaining(p => p + refund);
    }
  };

  const handleAdjustSkill = (skillDef, dir) => {
    if (!skillDef) return;
    const existing = skills.find(s => s.id === skillDef.id);
    const cur = existing?.level || 0;
    if (dir === 1) {
      const cost = cur + 1;
      if (xpRemaining >= cost) {
        setSkills(p => existing
          ? p.map(s => s.id === skillDef.id ? { ...s, level: s.level + 1 } : s)
          : [...p, { id: skillDef.id, name: skillDef.name, level: 1, category: skillDef.category, era: skillDef.era }]
        );
        setXpRemaining(p => p - cost);
      }
    } else if (dir === -1 && cur > 0) {
      setSkills(p => cur === 1
        ? p.filter(s => s.id !== skillDef.id)
        : p.map(s => s.id === skillDef.id ? { ...s, level: s.level - 1 } : s)
      );
      setXpRemaining(p => p + cur);
    }
  };

  const vitals = calculateVitals({
    bdy: stats.BDY, spt: stats.SPT, mnd: stats.MND,
    persona: selectedPersona, personaRank, skills
  });
  const powerRating = calculatePowerRating({
    bdy: stats.BDY, spt: stats.SPT, mnd: stats.MND,
    personaRank, speciesRank: selectedSpecies?.rank || 1,
    skills, traitsCount: traits.length
  });

  const handleSaveCharacter = () => {
    if (!characterName.trim()) return;
    saveNewCharacter({
      name: characterName,
      era: selectedEra,
      speciesId: selectedSpecies?.id || 'unknown',
      speciesName: selectedSpecies?.name || 'Unknown',
      personaName: selectedPersona?.name || 'None',
      personaRank,
      stats,
      skills: skills.map(s => ({ id: s.id, name: s.name, level: s.level, category: s.category, era: s.era })),
      traits,
      vitals,
      powerRating,
    });
    setCharacterName(''); setSelectedSpecies(null); setSelectedPersona(null);
    setSelectedSkillId(''); setSelectedEra('mundane');
  };

  const handleExportJson = () => {
    if (!characters.length) return alert('No characters saved yet.');
    const blob = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(characters, null, 2));
    const a = document.createElement('a');
    a.href = blob; a.download = 'unbound_characters.json';
    document.body.appendChild(a); a.click(); a.remove();
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 max-w-7xl mx-auto bg-slate-900 text-white rounded-lg border border-slate-800 space-y-6">
      <header className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-indigo-400">Character Sandbox Editor</h1>
          <p className="text-xs text-slate-400 font-mono">Dynamic Creation System</p>
        </div>
        <div className="flex space-x-4 font-mono text-sm bg-slate-950 p-3 rounded-md border border-slate-800">
          <div>Remaining XP: <span className="text-green-400 font-bold">{xpRemaining}</span></div>
          <div className="border-l border-slate-800 pl-4">PR: <span className="text-amber-400 font-bold">{powerRating}</span></div>
        </div>
      </header>

      {/* ── Identity + Era ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-lg border border-slate-800">
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">Character Name</label>
          <input
            type="text"
            className="w-full p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            placeholder="e.g., Kira Ashenwold"
            value={characterName}
            onChange={e => setCharacterName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">1. Species Blueprint</label>
          <select
            className="w-full p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 focus:outline-none"
            onChange={e => setSelectedSpecies(speciesPresets.find(s => s.id === e.target.value) || null)}
            value={selectedSpecies?.id || ''}
          >
            <option value="" disabled>— Select Ancestry —</option>
            {speciesPresets.map(s => (
              <option key={s.id} value={s.id}>{s.name} (XP: {s.leftoverXp ?? 16})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">2. Innate Persona</label>
          <select
            className="w-full p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 focus:outline-none"
            disabled={!selectedSpecies}
            onChange={e => setSelectedPersona(personasDatabase.find(p => p.name === e.target.value) || null)}
            value={selectedPersona?.name || ''}
          >
            <option value="" disabled>— Select Persona —</option>
            {personasDatabase.map(p => (
              <option key={p.name} value={p.name}>{p.name} (+1 {p.stat})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-mono uppercase text-slate-400 mb-1">3. Setting Era</label>
          <select
            className="w-full p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 focus:outline-none"
            value={selectedEra}
            onChange={e => setSelectedEra(e.target.value)}
          >
            {Object.entries(ERA_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedSpecies && selectedPersona && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">

            {/* Persona Rank */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-indigo-300">{selectedPersona.name} Rank</h3>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Next: {personaRank < 5 ? `${getRankUpgradeCost(personaRank)} XP` : 'MAX'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => handleAdjustPersonaRank(-1)} className="px-3 py-1 bg-slate-800 rounded text-xs">−</button>
                <span className="font-mono font-bold text-indigo-400 w-6 text-center">{personaRank}</span>
                <button onClick={() => handleAdjustPersonaRank(1)} className="px-3 py-1 bg-slate-800 rounded text-xs">+</button>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400 border-b border-slate-800 pb-1">Attributes</h3>
              {Object.keys(stats).map(key => (
                <div key={key} className="flex justify-between items-center bg-slate-900/50 p-2 rounded border border-slate-800/40">
                  <span className="font-mono text-xs">{key} {selectedPersona.stat === key && '⭐'}</span>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleAdjustStat(key, -1)} className="px-2 py-0.5 bg-slate-800 rounded text-xs">−</button>
                    <span className="font-mono text-xs w-4 text-center">{stats[key]}</span>
                    <button onClick={() => handleAdjustStat(key, 1)} className="px-2 py-0.5 bg-slate-800 rounded text-xs">+</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Skills Section ─────────────────────────────────────────── */}
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono uppercase text-slate-400 border-b border-slate-800 pb-2">
                4. Skills &amp; Capabilities
                <span className="ml-2 normal-case text-indigo-400 font-normal">[{ERA_LABELS[selectedEra]}]</span>
              </h3>

              {/* Category tabs */}
              <div className="flex flex-wrap gap-1">
                {availableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setSelectedSkillId(''); }}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono transition ${
                      selectedCategory === cat
                        ? 'bg-indigo-700 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Skill dropdown */}
              <select
                className="w-full p-2 bg-slate-900 border border-slate-800 rounded font-mono text-xs text-slate-300 focus:outline-none"
                value={selectedSkillId}
                onChange={e => setSelectedSkillId(e.target.value)}
              >
                <option value="">— Select {selectedCategory} —</option>
                {visibleSkills.map(s => {
                  const charSkill = skills.find(cs => cs.id === s.id);
                  const lvl = charSkill?.level || 0;
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name}{lvl > 0 ? ` [L${lvl}]` : ''}
                      {s.governing_stat !== '—' ? ` · ${s.governing_stat}` : ''}
                    </option>
                  );
                })}
              </select>

              {/* Skill detail card */}
              {activeSkillDef && (
                <div className="bg-slate-900 p-4 rounded border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-400">{activeSkillDef.name}</h4>
                      {activeSkillDef.subtitle && (
                        <p className="text-[10px] text-slate-500 mt-0.5 italic">{activeSkillDef.subtitle}</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {activeSkillDef.category} · {activeSkillDef.governing_stat}
                        {activeSkillDef.era !== 'all' && (
                          <span className="ml-2 text-indigo-400">[{activeSkillDef.era}]</span>
                        )}
                      </p>
                      {activeSkillDef.description && (
                        <p className="text-[10px] text-slate-500 mt-1 max-w-sm leading-relaxed">{activeSkillDef.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded border border-slate-800 shrink-0">
                      <button
                        onClick={() => handleAdjustSkill(activeSkillDef, -1)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px]"
                      >
                        L−
                      </button>
                      <span className="text-emerald-400 font-bold px-1 w-10 text-center">
                        L{activeSkillLevel} / 5
                      </span>
                      <button
                        onClick={() => handleAdjustSkill(activeSkillDef, 1)}
                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px]"
                      >
                        L+
                      </button>
                    </div>
                  </div>

                  {/* Requirements */}
                  {activeSkillDef.requirements?.length > 0 && (
                    <div className="text-[10px] text-yellow-600">
                      Requires: {activeSkillDef.requirements.map(r =>
                        r.stat ? `${r.stat} ${r.value}+` : r.description || r.type
                      ).join(', ')}
                    </div>
                  )}

                  {/* Level progressions */}
                  {Object.keys(activeSkillDef.progressions).length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-wide">Level Progression</span>
                      {Object.entries(activeSkillDef.progressions).map(([lvlKey, entry]) => {
                        const lvlNum = parseInt(lvlKey, 10);
                        const unlocked = activeSkillLevel >= lvlNum;
                        const text = levelText(entry);
                        return (
                          <div
                            key={lvlKey}
                            className={`p-1.5 rounded text-[11px] leading-snug ${
                              unlocked
                                ? 'bg-emerald-950/30 border border-emerald-900/30 text-slate-200'
                                : 'text-slate-600'
                            }`}
                          >
                            <span className={`font-bold mr-1.5 ${unlocked ? 'text-emerald-400' : 'text-slate-700'}`}>
                              L{lvlKey}
                            </span>
                            {text}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Skills taken so far */}
              {skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono text-slate-500 mb-1.5 uppercase">Invested Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setSelectedSkillId(s.id); setSelectedCategory(s.category); }}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 rounded px-2 py-1 text-[11px] font-mono transition"
                      >
                        <span className="text-slate-200">{s.name}</span>
                        <span className="text-emerald-400 font-bold">L{s.level}</span>
                        <span className="text-slate-600 text-[9px]">{s.era !== 'all' ? s.era : ''}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right column ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2 font-mono text-xs">
              <h3 className="uppercase text-slate-400 border-b border-slate-800 pb-1">Calculated Vitals</h3>
              <div className="flex justify-between p-1.5 bg-slate-900 rounded">
                <span className="text-red-400">MAX HP</span>
                <span>{vitals.maxHp} (HPR +{vitals.hpr})</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-900 rounded">
                <span className="text-green-400">MAX SP</span>
                <span>{vitals.maxSp} (SPR +{vitals.spr})</span>
              </div>
              <div className="flex justify-between p-1.5 bg-slate-900 rounded">
                <span className="text-blue-400">MAX MP</span>
                <span>{vitals.maxMp} (MPR +{vitals.mpr})</span>
              </div>
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
              <h3 className="text-xs font-mono uppercase text-slate-400 border-b border-slate-800 pb-1">Persona Unlocks</h3>
              <div className="space-y-2 text-xs font-mono">
                {selectedPersona.Ranks.map((rankObj, idx) => {
                  const rankKey = (idx + 1).toString();
                  const unlocked = personaRank >= (idx + 1);
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded border ${
                        unlocked
                          ? 'bg-indigo-950/20 border-indigo-500/30 text-slate-200'
                          : 'bg-slate-900/40 border-slate-900 text-slate-600'
                      }`}
                    >
                      <div className="font-bold text-[9px] text-indigo-400">RANK {rankKey} {unlocked && '✔'}</div>
                      <p className="mt-0.5 text-[11px] leading-tight">{rankObj[rankKey]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-800 pt-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-950/40 p-4 rounded-lg">
        <div className="text-xs font-mono text-slate-400">
          Saved Characters: <span className="text-indigo-400 font-bold">{characters.length}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={resetAllData}
            className="px-4 py-2 border border-red-900 hover:bg-red-950/40 text-red-400 rounded text-xs font-mono transition"
          >
            [DELETE DATABASE]
          </button>
          <button
            onClick={handleExportJson}
            className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-200 rounded text-xs font-mono transition"
          >
            Export DB to File
          </button>
          <button
            onClick={handleSaveCharacter}
            disabled={!characterName.trim() || !selectedSpecies || !selectedPersona}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:pointer-events-none rounded text-xs font-mono transition"
          >
            Save Character
          </button>
        </div>
      </footer>
    </div>
  );
}
