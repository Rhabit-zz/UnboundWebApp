import React, { useState } from "react";
import statusData from "../database/StatusEffects.json";
import personaData from "../database/Personas.json";
import affinityData from "../database/Affinities.json";
import socialData from "../database/SocialSkills.json";

// ── Status Effect helpers ──────────────────────────────────────────────────────
const STATUS_CATS = {
  State_Changes:            { label:"State Changes",    border:"border-red-800",     header:"text-red-400",     tab:"border-red-500 text-red-400" },
  Action_Status_Effects:    { label:"Action Effects",   border:"border-blue-800",    header:"text-blue-400",    tab:"border-blue-500 text-blue-400" },
  Resource_Pool_Effects:    { label:"Resource Pools",   border:"border-emerald-800", header:"text-emerald-400", tab:"border-emerald-500 text-emerald-400" },
  Combat_Enhancement_Effects:{ label:"Combat",          border:"border-yellow-800",  header:"text-yellow-400",  tab:"border-yellow-500 text-yellow-400" },
  Damage_Modifier_Effects:  { label:"Damage Modifiers", border:"border-purple-800",  header:"text-purple-400",  tab:"border-purple-500 text-purple-400" },
};
const stacksScale = e => /per stack|equal to stacks|by stacks|stacks per|\d stacks/.test(e.toLowerCase());

function StatusCard({ name, data, border, header }) {
  const scales = stacksScale(data.Effect);
  return (
    <div className={`bg-zinc-800/40 p-4 rounded border ${border} flex flex-col gap-2`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className={`font-bold text-sm ${header}`}>{name}</h3>
        <span className={`text-xs px-2 py-0.5 rounded font-mono shrink-0 ${scales ? "bg-yellow-900/40 text-yellow-300" : "bg-zinc-700/60 text-zinc-400"}`}>
          {scales ? "Scales" : "Duration"}
        </span>
      </div>
      <p className="text-zinc-300 text-xs leading-relaxed">{data.Effect}</p>
      {data.Upkeep !== "N/A" && <div className="text-xs text-zinc-500 border-t border-zinc-700/60 pt-2"><span className="text-zinc-400 font-semibold">Upkeep: </span>{data.Upkeep}</div>}
      {data.EndofTurn !== "N/A" && <div className="text-xs text-zinc-500 border-t border-zinc-700/60 pt-2"><span className="text-zinc-400 font-semibold">End of Turn: </span>{data.EndofTurn}</div>}
    </div>
  );
}

// ── Affinity helpers ───────────────────────────────────────────────────────────
const AFF_ALIGN_COLOR = { virtue:"text-yellow-400", vice:"text-red-400", Light:"text-amber-300", Shadow:"text-purple-400" };
function AffinityCard({ aff }) {
  const levels = aff.levels || {};
  const lks = Object.keys(levels).sort((a,b)=>Number(a)-Number(b));
  const col = AFF_ALIGN_COLOR[aff.alignment] || "text-blue-300";
  const themeStr = typeof aff.theme === "string" ? aff.theme : (Array.isArray(aff.theme) ? aff.theme.join(", ") : "");
  return (
    <div className="bg-zinc-800/40 border border-zinc-700 rounded p-3 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-1">
        <div>
          <h3 className={`font-bold text-sm ${col}`}>{aff.name}</h3>
          {themeStr && <p className="text-zinc-500 text-xs italic leading-tight">{themeStr}</p>}
        </div>
        {aff.governing_pool && <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 font-mono shrink-0">{aff.governing_pool}</span>}
      </div>
      <div className="space-y-1">
        {lks.map(lk => {
          const lv = levels[lk];
          const txt = typeof lv === "string" ? lv : `${lv?.cost ? lv.cost + " — " : ""}${lv?.effect || ""}`;
          return txt ? (
            <div key={lk} className="flex gap-2 text-xs">
              <span className="text-zinc-500 font-mono w-4 shrink-0">{lk}</span>
              <span className="text-zinc-400 leading-relaxed">{txt}</span>
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
}

// ── Persona helpers ────────────────────────────────────────────────────────────
const P_STAT_COL = { BDY:"text-red-400", SPT:"text-blue-400", MND:"text-purple-400" };
function PersonaCard({ p }) {
  const col = P_STAT_COL[p.stat] || "text-zinc-300";
  return (
    <div className="bg-zinc-800/40 border border-zinc-700 rounded p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-zinc-100">{p.name}</h3>
          <p className="text-zinc-500 text-xs">{p.theme?.join(" · ")}</p>
        </div>
        <span className={`text-sm font-black px-2 py-0.5 rounded bg-zinc-700 ${col}`}>{p.stat}</span>
      </div>
      <div className="space-y-1">
        {p.Ranks?.map((rankObj, idx) => {
          const n = idx + 1;
          const txt = rankObj[n] ?? Object.values(rankObj)[0];
          return (
            <div key={n} className="flex gap-2 text-xs">
              <span className="text-zinc-500 font-mono w-4 shrink-0 font-bold">{n}</span>
              <span className="text-zinc-400 leading-relaxed">{txt}</span>
            </div>
          );
        })}
      </div>
      <p className="text-zinc-600 text-xs italic border-t border-zinc-700/60 pt-2">{p["spirit forms"]?.join(", ")}</p>
    </div>
  );
}

// ── Static data ────────────────────────────────────────────────────────────────
const CRAFT_LEVELS = [
  { rank:1, title:"Novice",     bridge:"10%", writing:"—",        recipes:1,  tools:1   },
  { rank:2, title:"Apprentice", bridge:"20%", writing:"Common",   recipes:4,  tools:8   },
  { rank:3, title:"Journeyman", bridge:"30%", writing:"Uncommon", recipes:9,  tools:27  },
  { rank:4, title:"Master",     bridge:"40%", writing:"Epic",     recipes:16, tools:64  },
  { rank:5, title:"Artisan",    bridge:"50%", writing:"Legendary",recipes:25, tools:125 },
];

const TABS = [
  { id:"rules",    label:"📜 Core Rules" },
  { id:"combat",   label:"⚔️ Combat" },
  { id:"status",   label:"✨ Status Effects" },
  { id:"species",  label:"🧬 Species" },
  { id:"aff",      label:"🌀 Affinities" },
  { id:"social",   label:"🗣️ Social" },
  { id:"crafting", label:"⚒️ Crafting" },
  { id:"personas", label:"🔮 Personas" },
];

// ── Main component ─────────────────────────────────────────────────────────────
export default function ReferencePage() {
  const [tab, setTab]             = useState("rules");
  const [statusFilter, setStatusF]= useState("all");
  const [affFilter, setAffFilter] = useState("emotional");

  const effects  = statusData.Status_Effects;
  const personas = personaData.personas;
  const baseActions = Object.entries(socialData.base_actions || {});
  const emoBase    = affinityData?.emotional?.universal  || {};
  const primalBase = affinityData?.primal?.fantasy       || {};
  const arcaneBase = affinityData?.arcane?.fantasy       || {};

  const emotionalT1 = Object.entries(emoBase?.tier1 || {});
  const emotionalT2 = Object.entries(emoBase?.tier2 || {});
  const emotionalT3 = Object.entries(emoBase?.tier3 || {});
  const emotionalT4 = Object.entries(emoBase?.tier4 || {});
  const emotionalT5 = Object.entries(emoBase?.tier5 || {});

  const primalTier1 = Object.entries(primalBase?.tier1 || {});
  const primalTier2 = Object.entries(primalBase?.tier2 || {});
  const primalTier3 = Object.entries(primalBase?.tier3 || {});
  const primalTier4 = Object.entries(primalBase?.tier4 || {});
  const primalTier5 = Object.entries(primalBase?.tier5 || {});

  const arcaneT1 = Object.entries(arcaneBase?.tier1 || {});
  const arcaneT2 = Object.entries(arcaneBase?.tier2 || {});
  const arcaneT3 = Object.entries(arcaneBase?.tier3 || {});
  const arcaneT4 = Object.entries(arcaneBase?.tier4 || {});
  const arcaneT5 = Object.entries(arcaneBase?.tier5 || {});
  const arcaneAll = [...arcaneT1, ...arcaneT2, ...arcaneT3, ...arcaneT4, ...arcaneT5];

  // Cross-domain bridge affinities: bridge:true entries whose prerequisites reference another domain
  const crossDomainBridges = [
    ...primalTier1, ...primalTier2, ...primalTier3, ...primalTier4, ...primalTier5,
    ...arcaneT1, ...arcaneT2, ...arcaneT3, ...arcaneT4, ...arcaneT5,
    ...emotionalT1, ...emotionalT2, ...emotionalT3, ...emotionalT4, ...emotionalT5,
  ].filter(([, aff]) =>
    aff.bridge === true &&
    Array.isArray(aff.prerequisite) &&
    aff.prerequisite.some(p => p.domain)
  );

  const filteredStatus = Object.entries(STATUS_CATS).flatMap(([catKey, meta]) => {
    if (statusFilter !== "all" && statusFilter !== catKey) return [];
    return Object.entries(effects[catKey] || {}).map(([name, data]) => ({
      name, data, border: meta.border, header: meta.header,
    }));
  });

  // shared card section header
  const SectionHead = ({ title, sub }) => (
    <div className="border-b border-zinc-800 pb-3 mb-4">
      <h2 className="text-xl font-black text-yellow-500">{title}</h2>
      {sub && <p className="text-xs text-zinc-400 font-mono tracking-wider uppercase mt-1">{sub}</p>}
    </div>
  );

  return (
    <section className="p-6 text-white max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-3xl font-black mb-1 tracking-wide text-zinc-100">System Reference Document</h1>
        <p className="text-purple-200 text-sm">Official Unbound TTRPG rulebook — mechanics, systems, and tables.</p>
      </div>

      {/* Tab bar */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-zinc-800 pb-px">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-bold border-b-2 transition whitespace-nowrap ${tab === t.id ? "border-yellow-500 text-yellow-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════════ CORE RULES ══════════════════ */}
      {tab === "rules" && (
        <div className="space-y-8 max-w-4xl">
          <SectionHead title="Core Rules" sub="Section 1.0 — System Fundamentals" />

          {/* Stats */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">1.1 — Primary Stats</h3>
            <p className="text-zinc-400 text-sm mb-4">Every character has three stats. Each stat has a <strong className="text-zinc-200">Rank</strong> that defines its d6 dice pool and governs one resource pool.</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { stat:"BDY", full:"Body",   pool:"HP", regen:"HPR", desc:"Physical strength and endurance. Used for brute force, melee, and withstanding pain." },
                { stat:"SPT", full:"Spirit", pool:"SP", regen:"SPR", desc:"Vitality, willpower, and resilience. Used for stamina, persistence, and emotional power." },
                { stat:"MND", full:"Mind",   pool:"MP", regen:"MPR", desc:"Mental acuity, knowledge, and arcane capacity. Used for tactics, magic, and perception." },
              ].map(s => (
                <div key={s.stat} className="bg-zinc-800/50 border border-zinc-700 p-3 rounded">
                  <div className="text-yellow-400 font-black text-lg">{s.stat}</div>
                  <div className="text-zinc-300 text-xs font-semibold mb-1">{s.full}</div>
                  <div className="text-zinc-500 text-xs mb-2">{s.desc}</div>
                  <div className="text-xs font-mono text-zinc-400">Pool: <span className="text-zinc-200">{s.pool}</span> · Regen: <span className="text-zinc-200">{s.regen}</span></div>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 font-mono">
              Base pools: <span className="text-zinc-200">8 HP · 8 SP · 8 MP</span> before traits, diet, or skill modifiers.
              When a pool hits 0: HP → incapacitated · SP → exhausted · MP → mentally drained.
            </div>
          </div>

          {/* Checks */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">1.2 — The Universal Resolution Rule</h3>
            <p className="text-zinc-400 text-sm mb-3">
              <strong className="text-zinc-200">d6s are the only die in the system.</strong> Every check, attack, defense, social action, and skill use is resolved by rolling a number of d6s equal to the <strong className="text-zinc-200">governing stat's Rank</strong>, then adding flat bonuses from skill levels or abilities. This is how the system works — always.
            </p>
            <div className="bg-zinc-800/30 border border-yellow-800 rounded p-3 text-xs font-mono text-zinc-300 space-y-1.5 mb-3">
              <div><span className="text-yellow-400">Roll</span> = (Governing Stat Rank × d6) + Flat Bonuses</div>
              <div><span className="text-yellow-400">Win</span> = Roll ≥ DC &nbsp;<span className="text-zinc-500">for skill checks</span></div>
              <div><span className="text-yellow-400">Hit</span> = Attack Roll {">"} Defense Roll &nbsp;<span className="text-zinc-500">→ full damage + on-hit effects</span></div>
              <div><span className="text-yellow-400">Graze</span> = Attack Roll = Defense Roll &nbsp;<span className="text-zinc-500">→ 0 base damage, but on-hit effects and passive bonuses still apply</span></div>
              <div><span className="text-yellow-400">Miss</span> = Attack Roll {"<"} Defense Roll &nbsp;<span className="text-zinc-500">→ no damage, no effects</span></div>
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><strong className="text-zinc-200">Attack:</strong> Roll attacker's governing stat rank × d6, add skill level. Defender rolls their defense stat rank × d6. Higher roll wins.</p>
              <p><strong className="text-zinc-200">Social:</strong> Roll governing stat (SPT for emotional, MND for logical) × d6. Defender rolls the defense pool stat × d6.</p>
              <p><strong className="text-zinc-200">Craft/Gather:</strong> Roll governing stat × d6, add skill level, vs a static DC.</p>
              <p className="text-zinc-500 text-xs pt-1 border-t border-zinc-700/60"><span className="text-zinc-400">L</span> in ability text = current skill level (flat bonus to the roll). &nbsp;<span className="text-zinc-400">R</span> in Persona/Biology text = current Rank (also a flat bonus).</p>
            </div>
          </div>

          {/* XP Economy */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">1.3 — XP Economy</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Upgrade</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Formula</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Example</th>
                </tr></thead>
                <tbody>
                  {[
                    { up:"Stat Rank",     formula:"Current × Next",          ex:"1→2 = 2 · 2→3 = 6 · 3→4 = 12" },
                    { up:"Skill Level",   formula:"Equal to new level",       ex:"→L2 = 2 · →L3 = 3 · max 15 total" },
                    { up:"Biology Rank",  formula:"Same as Stat Rank curve",  ex:"R × (R+1)" },
                    { up:"Persona Rank",  formula:"Same as Stat Rank curve",  ex:"R × (R+1)" },
                  ].map(r => (
                    <tr key={r.up} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-zinc-200 font-semibold text-sm">{r.up}</td>
                      <td className="py-2 px-3 text-zinc-400 text-sm">{r.formula}</td>
                      <td className="py-2 px-3 text-zinc-500 font-mono text-xs">{r.ex}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 space-y-1 text-xs text-zinc-400 font-mono">
              <p><span className="text-zinc-200">Skill cap:</span> Skill Level may never exceed its governing stat Rank.</p>
              <p><span className="text-zinc-200">CR:</span> BDY Rank + SPT Rank + MND Rank + ⌈(Σ skill levels ÷ 5)⌉</p>
            </div>
          </div>

          {/* Pool Formula */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">1.4 — Resource Pool Formula</h3>
            <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs font-mono text-zinc-300 space-y-1.5">
              <div><span className="text-yellow-400">Max Pool</span> = (Stat Rank × 4) + Diet Bonus + (Skill Level²) + Trait Bonuses</div>
              <div><span className="text-yellow-400">Regen Rate</span> = Affinity/Proficiency bonuses + Biology Trait bonuses</div>
            </div>
          </div>

          {/* Skill Level Cap Rule */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">1.5 — Skill Types</h3>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-400">
              {[
                { name:"Combat Styles",  desc:"5-rank martial techniques. Each rank unlocks a named ability. Must meet stat/equipment requirements." },
                { name:"Weapon Skills",  desc:"Weapon category proficiency. 5 levels. Governs bonus to hit, blocking, and crit effects." },
                { name:"Affinities",     desc:"Elemental, emotional, or arcane alignment. 5 levels. All share the same XP pool as combat skills." },
                { name:"Profession Skills", desc:"Crafting, gathering, and trade expertise. 5 levels. Determines recipe memory and tag bridge." },
                { name:"Social Skills",  desc:"Tiered social action specializations. Tier 1–3+. Built from 8 universal base actions." },
                { name:"Personas",       desc:"Soul archetype. 5 ranks. Passive and reactive abilities tied to spirit animal archetypes." },
              ].map(s => (
                <div key={s.name} className="bg-zinc-800/40 border border-zinc-700 p-3 rounded">
                  <div className="text-zinc-200 font-semibold mb-1">{s.name}</div>
                  <div className="text-zinc-500 text-xs">{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ COMBAT ══════════════════ */}
      {tab === "combat" && (
        <div className="space-y-8 max-w-4xl">
          <SectionHead title="Combat Rules" sub="Section 2.0 — Turn Structure & Resolution" />

          {/* Turn phases */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.1 — Turn Structure</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { phase:"Upkeep", col:"text-blue-400", desc:"Status stacks tick. DoT/HoT effects trigger. AP is allocated. Effects tagged 'Upkeep' resolve here." },
                { phase:"Action", col:"text-yellow-400", desc:"Spend AP on actions: Move, Attack, Use Abilities, Cast Spells, Defend actively, Interact." },
                { phase:"Reaction", col:"text-emerald-400", desc:"Spend DT (Defense Tokens) out of turn to intercept attacks, protect allies, or trigger reactive effects." },
              ].map(ph => (
                <div key={ph.phase} className="bg-zinc-800/50 border border-zinc-700 p-3 rounded">
                  <div className={`font-bold text-sm ${ph.col} mb-1`}>{ph.phase}</div>
                  <div className="text-zinc-400 text-xs leading-relaxed">{ph.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-sm">Effects tagged <strong className="text-zinc-200">End of Turn</strong> resolve after the Action phase, before the next character acts.</p>
          </div>

          {/* AP & DT */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.2 — Action Points & Defense Tokens</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-800/40 border border-yellow-800 p-4 rounded">
                <div className="text-yellow-400 font-bold text-sm mb-2">Action Points (AP)</div>
                <ul className="text-zinc-400 text-xs space-y-1 leading-relaxed">
                  <li>Allocated at the start of your Upkeep phase each round.</li>
                  <li>Spent to perform any action: attack, move, use abilities, cast spells.</li>
                  <li>Hasten gains +1 AP on Upkeep; Slowed loses 1 AP on Upkeep.</li>
                  <li>Unused AP does not carry over to the next round.</li>
                </ul>
              </div>
              <div className="bg-zinc-800/40 border border-emerald-800 p-4 rounded">
                <div className="text-emerald-400 font-bold text-sm mb-2">Defense Tokens (DT)</div>
                <ul className="text-zinc-400 text-xs space-y-1 leading-relaxed">
                  <li>Spent during other characters' turns to take reactive actions.</li>
                  <li>Common uses: defend an ally, counter-attack on a miss, block incoming effects.</li>
                  <li>Earned through Persona abilities, skills, and certain status effects.</li>
                  <li>The Visionary persona can transfer DT to allies as an action.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Initiative */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.3 — Initiative & Turn Order</h3>
            <p className="text-zinc-400 text-sm mb-3">Characters act in initiative order from highest to lowest. Hasten and Slowed status effects directly modify initiative value. If Hasten would push a character above one who already acted this round, that character does not gain an extra turn.</p>
            <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 font-mono space-y-1">
              <p><span className="text-zinc-200">Hasten:</span> +stacks to initiative. Gains +1 AP on Upkeep, loses 1 stack.</p>
              <p><span className="text-zinc-200">Slowed:</span> −stacks to initiative. Loses 1 AP on Upkeep, loses 1 stack.</p>
            </div>
          </div>

          {/* Defense Actions */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.4 — Defense Actions</h3>
            <p className="text-zinc-400 text-sm mb-3"><strong className="text-zinc-200">Block, Dodge, and Deflect are the three innate defenses</strong> — every character has them, no skill required. Each is rolled as that stat's rank in d6s. Defenses also cost a resource from the linked pool. Skills may unlock additional defense options beyond these three.</p>
            <div className="overflow-x-auto mb-3">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Defense</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Stat (Roll)</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Pool Cost</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Description</th>
                </tr></thead>
                <tbody>
                  {[
                    { def:"Block",   stat:"BDY rank × d6", pool:"HP", desc:"Use body or shield to absorb the blow. Reduces incoming physical damage." },
                    { def:"Dodge",   stat:"SPT rank × d6", pool:"SP", desc:"Evade the attack entirely through movement. A tie still results in 0 base damage but on-hit effects apply." },
                    { def:"Deflect", stat:"MND rank × d6", pool:"MP", desc:"Redirect or negate damage through technique or magical resistance." },
                  ].map(r => (
                    <tr key={r.def} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-zinc-200 font-semibold">{r.def}</td>
                      <td className="py-2 px-3 text-yellow-400 font-mono text-xs">{r.stat}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono text-xs">{r.pool}</td>
                      <td className="py-2 px-3 text-zinc-400 text-xs">{r.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-zinc-500 text-xs">Off-balanced adds +1 cost to each defense pool; Anticipated reduces defense cost by 1. Alert gives +4 to Block/Dodge; Foresight gives +4 to Dodge/Deflect.</p>
          </div>

          {/* Damage Types */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.5 — Damage Types</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Physical</p>
                <div className="space-y-1">
                  {[
                    { type:"Slashing",    color:"text-red-400",    status:"Weathered",   desc:"Blades and edged weapons." },
                    { type:"Bludgeoning", color:"text-orange-400", status:"Crushed",     desc:"Blunt force — hammers, clubs." },
                    { type:"Piercing",    color:"text-rose-400",   status:"—",           desc:"Thrusts and ranged projectiles." },
                    { type:"Physical",    color:"text-zinc-300",   status:"Brittle/Grit",desc:"Generic untyped physical damage." },
                  ].map(d => (
                    <div key={d.type} className="flex items-start gap-2 text-xs">
                      <span className={`font-bold w-24 shrink-0 ${d.color}`}>{d.type}</span>
                      <span className="text-zinc-400">{d.desc}</span>
                      {d.status !== "—" && <span className="text-zinc-600 font-mono ml-auto">{d.status}</span>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">Energy / Arcane</p>
                <div className="space-y-1">
                  {[
                    { type:"Fire",     color:"text-orange-400", status:"Burned",      desc:"Heat and combustion." },
                    { type:"Cold",     color:"text-blue-400",   status:"Chilled",     desc:"Ice and freezing." },
                    { type:"Shadow",   color:"text-purple-400", status:"Cursed",      desc:"Abyssal dark energy." },
                    { type:"Void",     color:"text-indigo-400", status:"Vile Mark",   desc:"Entropic anti-matter energy." },
                    { type:"Light",    color:"text-amber-300",  status:"Grace",       desc:"Radiant divine energy; heals undead." },
                    { type:"Energy",   color:"text-cyan-400",   status:"Protection",  desc:"Generic untyped magical energy." },
                  ].map(d => (
                    <div key={d.type} className="flex items-start gap-2 text-xs">
                      <span className={`font-bold w-24 shrink-0 ${d.color}`}>{d.type}</span>
                      <span className="text-zinc-400">{d.desc}</span>
                      <span className="text-zinc-600 font-mono ml-auto">{d.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Weapon Weights */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.6 — Weapon Weight & Damage Bonus</h3>
            <p className="text-zinc-400 text-sm mb-3">Weapon weight sets the flat damage bonus added to a successful hit. These are <strong className="text-zinc-200">flat numbers, not dice</strong>. A skilled crafter can increase a weapon's bonus beyond the base value.</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { w:"Light",  bonus:"+1", ex:"Daggers, short swords, hand axes",    training:"Small Weapons Training" },
                { w:"Medium", bonus:"+2", ex:"Longswords, maces, standard spears",  training:"Medium Weapons Training" },
                { w:"Reach",  bonus:"+3", ex:"Polearms, naginata, glaives, halberds",training:"Reach Weapons Training" },
                { w:"Heavy",  bonus:"+4", ex:"Greatswords, mauls, greataxes",       training:"Heavy Weapons Training" },
              ].map(r => (
                <div key={r.w} className="bg-zinc-800/40 border border-zinc-700 p-3 rounded flex gap-3">
                  <div className="text-yellow-400 font-black text-xl w-10 shrink-0">{r.bonus}</div>
                  <div>
                    <div className="text-zinc-200 font-bold text-sm">{r.w}</div>
                    <div className="text-zinc-500 text-xs mb-1">{r.ex}</div>
                    <div className="text-zinc-600 text-xs">{r.training}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 space-y-1">
              <p><span className="text-zinc-200 font-semibold">Ranged weapons:</span> Damage bonus is determined by projectile weight, not the weapon itself. A heavier bolt deals more than a light arrow from the same bow.</p>
              <p><span className="text-zinc-200 font-semibold">Crafter upgrades:</span> A skilled crafter can increase a weapon's base damage bonus beyond the weight-class default.</p>
            </div>
          </div>

          {/* Attack Resolution */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.7 — Attack Resolution</h3>
            <div className="bg-zinc-800/30 border border-yellow-800 rounded p-3 text-xs font-mono text-zinc-300 mb-4 space-y-1">
              <div><span className="text-yellow-400">Attacker</span> rolls Governing Stat Rank × d6 + Skill Level</div>
              <div><span className="text-yellow-400">Defender</span> rolls Defense Stat Rank × d6 + any flat bonuses</div>
              <div className="pt-1 space-y-0.5">
                <div><span className="text-green-400">Hit</span> = Atk {">"} Def &nbsp;→ full base damage + weight bonus + on-hit effects</div>
                <div><span className="text-yellow-400">Graze</span> = Atk = Def &nbsp;→ 0 base damage, but on-hit effects and passive bonuses still apply</div>
                <div><span className="text-red-400">Miss</span> = Atk {"<"} Def &nbsp;→ no damage, no effects</div>
              </div>
            </div>
            <ol className="space-y-2 text-sm text-zinc-400">
              {[
                "Attacker spends AP and declares the attack (melee or ranged) and target.",
                "Attacker rolls their governing stat rank in d6s (e.g. SPT 3 = 3d6 for a spirit-driven strike) and adds any flat skill bonus.",
                "Defender chooses Block, Dodge, or Deflect and rolls that stat's rank in d6s, plus any flat defense bonuses.",
                "Hit: attacker total > defender total. Damage = weight bonus + damage modifiers. Graze: totals are equal — 0 base damage but all on-hit effects and passive damage bonuses still apply.",
                "On-hit status effects (Bleeding, Burned, etc.) resolve after damage.",
                "A critical hit occurs when the attack significantly exceeds the defense roll. Crits trigger bonus skill effects and may restore resources.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-yellow-500 font-black w-5 shrink-0">{i+1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Grappling */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.8 — Grappling</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>To initiate a grapple, spend AP to make an opposing BDY check. On success, the Grappled status is applied to the target.</p>
              <p><strong className="text-zinc-200">Grappler constraints:</strong> The appendages used to hold the target cannot perform other actions. The grappler may release as a free reaction.</p>
              <p><strong className="text-zinc-200">Target escape:</strong> On the target's Upkeep, they make an opposing BDY or SPT check. If they succeed, the grapple breaks and they act normally.</p>
              <p><strong className="text-zinc-200">Constrain (2 AP):</strong> While grappling, squeeze the target for STR physical damage.</p>
              <p><strong className="text-zinc-200">Chokehold:</strong> Once a target is Grappled, some combat styles allow applying Immobilized + ongoing damage per round (BDY DC to escape).</p>
            </div>
          </div>

          {/* Movement */}
          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">2.9 — Movement & Range</h3>
            <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs font-mono text-zinc-400 mb-3">
              <span className="text-yellow-400">1 Space = 4 ft.</span> All distances in the system use spaces as the base unit. Feet values are the conversion.
            </div>
            <div className="space-y-2 text-sm text-zinc-400">
              <p><strong className="text-zinc-200">SPD (Speed):</strong> Determines how many spaces you can move per Move action. Crippled halves SPD; Hindered reduces SPD per stack; Quickened and Momentum increase SPD.</p>
              <p><strong className="text-zinc-200">Melee range:</strong> 1 space (4 ft). Standard weapon attacks require you to be within reach of your target.</p>
              <p><strong className="text-zinc-200">Reach weapons:</strong> Polearms, spears, and reach-category weapons extend melee range to 2+ spaces (8+ ft).</p>
              <p><strong className="text-zinc-200">Ranged attacks:</strong> Require a ranged weapon. Suffer penalties when used in melee (Blinded: −8 to ranged vs −4 to melee). Moving out of melee range may trigger opportunity effects.</p>
              <p><strong className="text-zinc-200">Prone:</strong> 1 AP to stand. Melee attacks against a Prone character gain +4; ranged attacks against them gain −2.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ STATUS EFFECTS ══════════════════ */}
      {tab === "status" && (
        <div className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <h2 className="text-xl font-black text-yellow-500 mb-1">Status Condition Dictionary</h2>
            <p className="text-zinc-400 text-sm mb-3">All status effects use a stack system. Additional applications either extend duration or increase magnitude.</p>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded font-mono bg-yellow-900/40 text-yellow-300">Scales</span><span className="text-zinc-400">More stacks = stronger effect</span></div>
              <div className="flex items-center gap-2"><span className="px-2 py-0.5 rounded font-mono bg-zinc-700/60 text-zinc-400">Duration</span><span className="text-zinc-400">More stacks = longer duration</span></div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setStatusF("all")} className={`px-3 py-1.5 text-xs font-bold rounded border transition ${statusFilter === "all" ? "border-zinc-400 text-zinc-200 bg-zinc-700/40" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"}`}>
              All ({Object.values(effects).reduce((s, cat) => s + Object.keys(cat).length, 0)})
            </button>
            {Object.entries(STATUS_CATS).map(([key, meta]) => (
              <button key={key} onClick={() => setStatusF(key)} className={`px-3 py-1.5 text-xs font-bold rounded border transition ${statusFilter === key ? `${meta.tab} border-current bg-zinc-800/60` : "border-zinc-700 text-zinc-500 hover:text-zinc-300"}`}>
                {meta.label} ({Object.keys(effects[key] || {}).length})
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredStatus.map(({ name, data, border, header }) => (
              <StatusCard key={name} name={name} data={data} border={border} header={header} />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════ SPECIES ══════════════════ */}
      {tab === "species" && (
        <div className="space-y-8 max-w-4xl">
          <SectionHead title="Species Construction" sub="Section 4.0 — Biology & Trait System" />

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">4.1 — The Six Layers</h3>
            <p className="text-zinc-400 text-sm mb-4">Species are built as a layered system. Each layer adds capabilities and constraints. All layers combined form the full species template.</p>
            <div className="space-y-3">
              {[
                { n:1, name:"Morphotype",        col:"text-yellow-400", desc:"The physical body plan. Determines available equipment slots (hands, mouth, tail, etc.), locomotion types, and base body capabilities. Examples: Biped, Quadruped, Serpentine, Avian, Aquatic." },
                { n:2, name:"Biology Type",       col:"text-orange-400", desc:"The taxonomic family (Felidae, Canidae, Arthropoda, etc.). Purchased at the Stat Rank XP curve. Ranks 1–5. Each rank grants biology-specific traits, passive bonuses, and may unlock new Traits." },
                { n:3, name:"Lineage Archetype",  col:"text-blue-400",   desc:"Cultural and ancestral heritage. Suggests Rank 1 Trait tendencies and flavor. Does not grant mechanical bonuses directly but shapes which Traits are thematically available." },
                { n:4, name:"Traits",             col:"text-emerald-400",desc:"Discrete abilities purchased with Trait Points (TP) from the Compensation Pool. Traits cover racial abilities, special senses, natural weapons, resistances, and more." },
                { n:5, name:"Size Category",      col:"text-purple-400", desc:"Tiny / Small / Medium / Large / Huge / Gigantic. Size affects HP pools, equipment compatibility, movement capabilities, and combat interactions." },
                { n:6, name:"Diet",               col:"text-rose-400",   desc:"Filtered by biological kingdom tag (herbivore, carnivore, omnivore, etc.). Grants Max HP / SP / MP bonuses and may restrict or unlock certain traits." },
              ].map(l => (
                <div key={l.n} className="bg-zinc-800/40 border border-zinc-700 p-4 rounded flex gap-4">
                  <div className={`text-2xl font-black w-8 shrink-0 ${l.col}`}>{l.n}</div>
                  <div>
                    <div className={`font-bold text-sm ${l.col} mb-1`}>{l.name}</div>
                    <div className="text-zinc-400 text-xs leading-relaxed">{l.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">4.2 — Size Categories</h3>
            <div className="grid grid-cols-3 gap-2">
              {["Tiny","Small","Medium","Large","Huge","Gigantic"].map(s => (
                <div key={s} className="bg-zinc-800/40 border border-zinc-700 px-3 py-2 rounded text-sm text-center">
                  <div className="text-zinc-200 font-semibold">{s}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">4.3 — Trait Points & Compensation Pool</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>Characters receive a <strong className="text-zinc-200">Compensation Pool</strong> of Trait Points (TP) during character creation. TP is spent on Traits from the species Trait list.</p>
              <p>Traits represent passive species abilities: natural weapons, enhanced senses, elemental resistances, flight, burrowing, venom, bioluminescence, and many more.</p>
              <p>TP is separate from XP and does not cross-fund skill ranks or stat ranks.</p>
              <p>More powerful Traits cost more TP. Some Traits have prerequisite Ranks or other Traits as requirements.</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">4.4 — Diet Bonuses</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>Diet type is filtered by the biological kingdom tags of the species' Biology Type.</p>
              <p>Choosing a Diet grants a bonus to one or more of the base resource pools (Max HP, Max SP, Max MP).</p>
              <p>Diet also affects what food sources a character can consume during rest and recovery.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ AFFINITIES ══════════════════ */}
      {tab === "aff" && (
        <div className="space-y-5">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg">
            <h2 className="text-xl font-black text-yellow-500 mb-2">Affinities</h2>
            <p className="text-zinc-400 text-sm mb-1">Affinities represent metaphysical, elemental, and arcane alignments. All share the same XP pool as combat skills. <strong className="text-zinc-200">Level 2 of every affinity</strong> grants Max Pool +L² and Pool Regen +L for the governing pool.</p>
            <p className="text-zinc-500 text-xs">L = current level of the affinity. Opposing Emotional Affinities are mutually exclusive unless a Bridge Affinity is learned.</p>
          </div>

          {/* Domain filter */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id:"emotional", label:`Emotional (${emotionalT1.length + emotionalT2.length + emotionalT3.length + emotionalT4.length + emotionalT5.length})` },
              { id:"primal",    label:`Primal (${primalTier1.length + primalTier2.length + primalTier3.length + primalTier4.length + primalTier5.length})` },
              { id:"arcane",    label:`Arcane (${arcaneAll.length})` },
              { id:"bridge",    label:"Bridge Affinities" },
            ].map(f => (
              <button key={f.id} onClick={() => setAffFilter(f.id)} className={`px-3 py-1.5 text-xs font-bold rounded border transition ${affFilter === f.id ? "border-yellow-500 text-yellow-400 bg-zinc-800/60" : "border-zinc-700 text-zinc-500 hover:text-zinc-300"}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Emotional */}
          {affFilter === "emotional" && (() => {
            // Categorize entries by key naming convention
            const emoLvlCard = (k, aff, borderCol, nameCol, badge, badgeBg) => (
              <div key={k} className={`bg-zinc-800/40 border ${borderCol} rounded p-3 flex flex-col gap-2`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className={`font-bold text-sm ${nameCol}`}>{aff.name}</h3>
                    {aff.theme && <p className="text-zinc-500 text-xs italic leading-tight">{aff.theme}</p>}
                    {aff.alignment && <p className="text-zinc-600 text-xs">Bridges: {Array.isArray(aff.alignment) ? aff.alignment.join(" + ") : aff.alignment}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {aff.governing_pool && <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 font-mono">{aff.governing_pool}</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${badgeBg} font-mono`}>{badge}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {Object.entries(aff.levels || {}).map(([lk, lv]) => {
                    const cost = typeof lv === "object" ? lv?.cost : null;
                    const txt  = typeof lv === "string" ? lv : lv?.effect || "";
                    return txt ? (
                      <div key={lk} className="flex gap-2 text-xs">
                        <span className="text-zinc-500 font-mono w-4 shrink-0">{lk}</span>
                        <span className="text-zinc-400 leading-relaxed">{cost ? <span className="text-zinc-500">[{cost}] </span> : null}{txt}</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
            const t2Bridges   = emotionalT2.filter(([k]) => !k.includes('_initiate'));
            const t2Initiates = emotionalT2.filter(([k]) =>  k.includes('_initiate'));
            const t3Adepts    = emotionalT3.filter(([k]) =>  k.includes('_adept'));
            const t3Bridges   = emotionalT3.filter(([,a]) => a.bridge === true);
            const t3Compounds = emotionalT3.filter(([k, a]) => !k.includes('_adept') && !a.bridge);
            const t4Masters   = emotionalT4.filter(([k]) =>  k.includes('_master'));
            const t4Compounds = emotionalT4.filter(([k]) => !k.includes('_master'));
            const t5Paragons  = emotionalT5.filter(([k]) =>  k.includes('_paragon'));
            const t5Special   = emotionalT5.filter(([k]) => !k.includes('_paragon'));
            return (
              <div className="space-y-8">
                {/* T1 */}
                <div>
                  <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 mb-3">
                    <strong className="text-zinc-200">Opposing Pairs:</strong> Chastity↔Lust · Temperance↔Gluttony · Charity↔Greed · Patience↔Wrath · Diligence↔Sloth · Generosity↔Envy · Humility↔Pride.
                    Opposing affinities are mutually exclusive — you cannot hold both without a Tier 2 Bridge Affinity.
                  </div>
                  <h3 className="text-sm font-bold text-zinc-300 mb-3">Tier 1 — Virtues &amp; Vices ({emotionalT1.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {emotionalT1.map(([k, aff]) => <AffinityCard key={k} aff={aff} />)}
                  </div>
                </div>
                {/* T2 */}
                <div className="space-y-4">
                  <div className="bg-zinc-800/30 border border-amber-900/40 rounded p-3 text-xs text-zinc-400">
                    <strong className="text-zinc-200">Tier 2</strong> — Two paths: <strong className="text-amber-300">Bridge Affinities</strong> resolve opposing pairs (requires L2 in both); <strong className="text-yellow-300">Solo Initiates</strong> deepen a single virtue or vice (requires L3 in its T1).
                  </div>
                  {t2Bridges.length > 0 && <>
                    <h3 className="text-sm font-bold text-amber-400">Tier 2 — Bridges ({t2Bridges.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {t2Bridges.map(([k,a]) => emoLvlCard(k,a,"border-amber-900/60","text-amber-400","Bridge","bg-amber-900/40 text-amber-300"))}
                    </div>
                  </>}
                  {t2Initiates.length > 0 && <>
                    <h3 className="text-sm font-bold text-yellow-400">Tier 2 — Initiates ({t2Initiates.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {t2Initiates.map(([k,a]) => emoLvlCard(k,a,"border-yellow-900/40","text-yellow-300","Initiate","bg-yellow-900/30 text-yellow-400"))}
                    </div>
                  </>}
                </div>
                {/* T3 */}
                {emotionalT3.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-zinc-800/30 border border-green-900/40 rounded p-3 text-xs text-zinc-400">
                      <strong className="text-zinc-200">Tier 3</strong> — Three paths: <strong className="text-green-300">Solo Adepts</strong> continue the solo chain; <strong className="text-teal-300">Bridge Deepenings</strong> evolve T2 bridges into full affinities; <strong className="text-cyan-300">Compound States</strong> emerge from crossing two different virtue/vice lines.
                    </div>
                    {t3Adepts.length > 0 && <>
                      <h3 className="text-sm font-bold text-green-400">Tier 3 — Adepts ({t3Adepts.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t3Adepts.map(([k,a]) => emoLvlCard(k,a,"border-green-900/40","text-green-300","Adept","bg-green-900/30 text-green-400"))}
                      </div>
                    </>}
                    {t3Bridges.length > 0 && <>
                      <h3 className="text-sm font-bold text-teal-400">Tier 3 — Bridge Deepenings ({t3Bridges.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t3Bridges.map(([k,a]) => emoLvlCard(k,a,"border-teal-900/50","text-teal-300","Bridge+","bg-teal-900/30 text-teal-400"))}
                      </div>
                    </>}
                    {t3Compounds.length > 0 && <>
                      <h3 className="text-sm font-bold text-cyan-400">Tier 3 — Compound States ({t3Compounds.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t3Compounds.map(([k,a]) => emoLvlCard(k,a,"border-cyan-900/50","text-cyan-300","Compound","bg-cyan-900/30 text-cyan-400"))}
                      </div>
                    </>}
                  </div>
                )}
                {/* T4 */}
                {emotionalT4.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-zinc-800/30 border border-purple-900/40 rounded p-3 text-xs text-zinc-400">
                      <strong className="text-zinc-200">Tier 4</strong> — Near-transcendence: <strong className="text-purple-300">Masters</strong> approach the divine archetype of their alignment; <strong className="text-fuchsia-300">Compound States</strong> fuse emotional lines into something beyond individual virtue or vice.
                    </div>
                    {t4Masters.length > 0 && <>
                      <h3 className="text-sm font-bold text-purple-400">Tier 4 — Masters ({t4Masters.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t4Masters.map(([k,a]) => emoLvlCard(k,a,"border-purple-900/50","text-purple-300","Master","bg-purple-900/30 text-purple-400"))}
                      </div>
                    </>}
                    {t4Compounds.length > 0 && <>
                      <h3 className="text-sm font-bold text-fuchsia-400">Tier 4 — Near-Transcendent ({t4Compounds.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t4Compounds.map(([k,a]) => emoLvlCard(k,a,"border-fuchsia-900/50","text-fuchsia-300","T4 Compound","bg-fuchsia-900/30 text-fuchsia-400"))}
                      </div>
                    </>}
                  </div>
                )}
                {/* T5 */}
                {emotionalT5.length > 0 && (
                  <div className="space-y-4">
                    <div className="bg-zinc-800/30 border border-orange-900/40 rounded p-3 text-xs text-zinc-400">
                      <strong className="text-zinc-200">Tier 5</strong> — The pinnacle: <strong className="text-orange-300">Paragons</strong> are the divine archetype of a single virtue or vice, named for their mythological counterpart. <strong className="text-rose-300">Transcendence</strong> requires breadth across the full emotional spectrum.
                    </div>
                    {t5Paragons.length > 0 && <>
                      <h3 className="text-sm font-bold text-orange-400">Tier 5 — Paragons ({t5Paragons.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t5Paragons.map(([k,a]) => emoLvlCard(k,a,"border-orange-900/60","text-orange-300","Paragon","bg-orange-900/40 text-orange-400"))}
                      </div>
                    </>}
                    {t5Special.length > 0 && <>
                      <h3 className="text-sm font-bold text-rose-400">Tier 5 — Transcendence ({t5Special.length})</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {t5Special.map(([k,a]) => emoLvlCard(k,a,"border-rose-900/60","text-rose-300","Bridge","bg-rose-900/40 text-rose-400"))}
                      </div>
                    </>}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Bridge */}
          {affFilter === "bridge" && (
            <div className="space-y-6">
              <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-zinc-400 space-y-2">
                <p className="text-sm"><strong className="text-zinc-200">Bridge Affinities</strong> are cross-domain affinities that fuse two or more affinity lines from different domains into something that could not exist within a single domain alone.</p>
                <p className="text-sm">Unlike Emotional T2 bridges (which fuse two Emotional affinities), these require deep investment across <strong className="text-zinc-200">Emotional, Primal, and/or Arcane</strong> domains simultaneously.</p>
              </div>
              {crossDomainBridges.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">No cross-domain bridges found.</p>
              ) : (
                crossDomainBridges.map(([k, aff]) => {
                  const domainLabels = Array.isArray(aff.prerequisite)
                    ? [...new Set(aff.prerequisite.flatMap(p =>
                        p.domain ? [p.domain]
                        : p.options ? ['primal'] : []
                      ))]
                    : [];
                  const prereqSummary = Array.isArray(aff.prerequisite)
                    ? aff.prerequisite.map(p => p.note || (p.affinity ? `${p.affinity} L${p.level}` : p.type)).join(' · ')
                    : '';
                  return (
                    <div key={k} className="bg-zinc-800/40 border border-violet-900/60 rounded p-4 flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-base text-violet-300">{aff.name}</h3>
                          {aff.theme && <p className="text-zinc-400 text-xs italic leading-relaxed mt-1 max-w-2xl">{aff.theme}</p>}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded bg-violet-900/50 text-violet-300 font-mono font-bold">Cross-Domain</span>
                          {domainLabels.length > 0 && (
                            <span className="text-xs text-zinc-500 font-mono">{domainLabels.join(' + ')}</span>
                          )}
                        </div>
                      </div>
                      {prereqSummary && (
                        <div className="bg-zinc-900/60 border border-zinc-700/60 rounded px-3 py-2 text-xs text-zinc-400">
                          <span className="text-zinc-300 font-semibold">Prerequisites: </span>{prereqSummary}
                        </div>
                      )}
                      <div className="space-y-1.5">
                        {Object.entries(aff.levels || {}).map(([lk, lv]) => {
                          const cost = typeof lv === "object" ? lv?.cost : null;
                          const txt  = typeof lv === "string" ? lv : lv?.effect || "";
                          return txt ? (
                            <div key={lk} className="flex gap-2 text-xs">
                              <span className="text-zinc-500 font-mono w-4 shrink-0 font-bold">{lk}</span>
                              <span className="text-zinc-300 leading-relaxed">{cost ? <span className="text-zinc-500">[{cost}] </span> : null}{txt}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Primal */}
          {affFilter === "primal" && (
            <div className="space-y-6">
              <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 space-y-1">
                <p><strong className="text-zinc-200">Unlock Rule:</strong> MND + SPT {">"} total Arcane Affinities known.</p>
                <p><strong className="text-zinc-200">Resource:</strong> MP to construct · HP targeted · Available in fantasy settings.</p>
                <p><strong className="text-zinc-200">Tier Structure:</strong> T1 = pure elements · T2 = two-element combos + solo deepenings · T3 = three-element Fluxes + T2 deepenings · T4 = PrimalFlux (all four) · T5 = capstones.</p>
              </div>
              {[
                { label:"Tier 1 — Pure Elements",          entries:primalTier1, col:"text-blue-400"   },
                { label:"Tier 2 — Combinations",           entries:primalTier2, col:"text-emerald-400" },
                { label:"Tier 3 — Flux Combinations",      entries:primalTier3, col:"text-purple-400"  },
                { label:"Tier 4 — PrimalFlux",             entries:primalTier4, col:"text-yellow-400"  },
                { label:"Tier 5 — Capstones & Bridge",     entries:primalTier5, col:"text-orange-400"  },
              ].map(tier => tier.entries.length > 0 && (
                <div key={tier.label}>
                  <h3 className={`text-sm font-bold mb-3 ${tier.col}`}>{tier.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tier.entries.map(([k, aff]) => (
                      aff?.levels ? <AffinityCard key={k} aff={{ ...aff, name: aff.name || k }} /> : null
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Arcane */}
          {affFilter === "arcane" && (
            <div className="space-y-6">
              <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400 space-y-1">
                <strong className="text-zinc-200">Arcane Affinities</strong> — manipulation of universal constants through constructed thought. Each known Arcane Affinity counts against the Primal unlock check. Available in fantasy settings.
                <p className="mt-1"><strong className="text-zinc-200">T5 capstones:</strong> Time and Space — accessible via broad investment across lower tiers, not a single chain.</p>
              </div>
              {[
                { label:"Tier 1 — Observable Constants",  entries:arcaneT1, col:"text-cyan-400"    },
                { label:"Tier 2 — Emergent Constants",    entries:arcaneT2, col:"text-blue-400"    },
                { label:"Tier 3 — Structural Constants",  entries:arcaneT3, col:"text-purple-400"  },
                { label:"Tier 4 — Deep Manipulation",     entries:arcaneT4, col:"text-yellow-400"  },
                { label:"Tier 5 — Universal Constants",   entries:arcaneT5, col:"text-orange-400"  },
              ].map(tier => tier.entries.length > 0 && (
                <div key={tier.label}>
                  <h3 className={`text-sm font-bold mb-3 ${tier.col}`}>{tier.label}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tier.entries.map(([k, aff]) => <AffinityCard key={k} aff={{ ...aff, name: aff.name || k }} />)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════ SOCIAL ══════════════════ */}
      {tab === "social" && (
        <div className="space-y-8 max-w-4xl">
          <SectionHead title="Social System" sub="Section 6.0 — Social Actions & Skills" />

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">6.1 — System Overview</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>The social system uses the same action economy as combat. Social attacks target another character's SP or MP pool, and the defender can respond in kind. All social actions use AP and resource costs.</p>
              <p><strong className="text-zinc-200">Rapport</strong> — A currency generated through successful social interactions. Accumulated Rapport gives leverage in negotiations and social contests. Failed deceptions consume Rapport when discovered.</p>
              <p><strong className="text-zinc-200">Social Skills</strong> are organized into tiers aligned to a seven-chakra framework. Tier 1 skills each cover two of the eight base actions. Tier 2 specializes one base action further. Tier 3+ unlocks advanced social capabilities (Leadership is the only confirmed Tier 3 block).</p>
              <p><strong className="text-zinc-200">Virtue/Vice switching</strong> unlocks at Tier 2 when both chakra expressions have been developed — allowing the character to shift between a virtue and vice approach to the same social domain.</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">6.2 — Eight Base Actions</h3>
            <p className="text-zinc-400 text-sm mb-4">These eight actions are available to <em>every character</em> with no skill investment. Social skills significantly improve their potency.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {baseActions.map(([key, action]) => (
                <div key={key} className="bg-zinc-800/40 border border-zinc-700 p-4 rounded flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-zinc-100 font-bold text-sm">{action.name}</h3>
                      <p className="text-zinc-500 text-xs italic">{action.subtitle}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-yellow-400">{action.action_cost}</div>
                      <div className="text-xs font-mono text-zinc-500">{action.resource_cost}</div>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="text-zinc-400"><span className="text-zinc-300 font-semibold">Governing Stat: </span>{action.governing_stat}</p>
                    {action.defense_pool && <p className="text-zinc-400"><span className="text-zinc-300 font-semibold">Defense Pool: </span>{action.defense_pool}</p>}
                    <p className="text-zinc-400 leading-relaxed"><span className="text-zinc-300 font-semibold">Basic: </span>{action.basic_effect}</p>
                    <p className="text-zinc-500 leading-relaxed"><span className="text-zinc-400 font-semibold">Critical: </span>{action.critical_effect}</p>
                    {action.notes && <p className="text-zinc-600 italic leading-relaxed border-t border-zinc-700/60 pt-2">{action.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">6.3 — Social Skill Tier Structure</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Tier</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Access</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Structure</th>
                </tr></thead>
                <tbody>
                  {[
                    { tier:"Base Actions", access:"No investment",            structure:"8 universal actions available to all characters." },
                    { tier:"Tier 1",       access:"XP",                       structure:"7 skills aligned to the seven-chakra framework. Each covers 2 base actions." },
                    { tier:"Tier 2",       access:"Tier 1 Level 2",           structure:"Specializations branching from one base action. Virtue/Vice switching unlocks here." },
                    { tier:"Tier 3+",      access:"Tier 2 requirements",      structure:"Advanced social mastery. Leadership is the confirmed Tier 3 block." },
                  ].map(r => (
                    <tr key={r.tier} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-yellow-400 font-semibold">{r.tier}</td>
                      <td className="py-2 px-3 text-zinc-400 text-xs">{r.access}</td>
                      <td className="py-2 px-3 text-zinc-400 text-xs">{r.structure}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CRAFTING ══════════════════ */}
      {tab === "crafting" && (
        <div className="space-y-8 max-w-4xl">
          <SectionHead title="Crafting & Knowledge System" sub="Section 7.0 — Profession Skills & Recipes" />

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.1 — Core Principles</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>Crafting is governed by <strong className="text-zinc-200">Knowledge Tags</strong> (qualifications, not bonuses) and <strong className="text-zinc-200">Profession Skill Levels</strong> (governing execution). These are separate systems that interact.</p>
              <p>Missing a required tag means operating at the edge of your knowledge — the Tag Bridge percentage lets you attempt recipes above your tag coverage at increasing risk.</p>
              <p>Profession Skills use the same XP pool as combat skills. They compete for the same resources as your combat build.</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.2 — Skill Level Framework</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead><tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Rank</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Title</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Tag Bridge</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Pattern Writing</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Recipe Memory</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-mono text-xs">Tool Memory</th>
                </tr></thead>
                <tbody>
                  {CRAFT_LEVELS.map(r => (
                    <tr key={r.rank} className="border-b border-zinc-800 hover:bg-zinc-800/30">
                      <td className="py-2 px-3 text-yellow-400 font-black">{r.rank}</td>
                      <td className="py-2 px-3 text-zinc-200 font-semibold">{r.title}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono">{r.bridge}</td>
                      <td className="py-2 px-3 text-zinc-400">{r.writing}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono">{r.recipes}</td>
                      <td className="py-2 px-3 text-zinc-400 font-mono">{r.tools}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3 text-xs text-zinc-500 space-y-1 font-mono">
              <p>Recipe Memory = Level² · Tool Memory = Level³ · XP cost to raise = new level</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.3 — Knowledge Tags</h3>
            <p className="text-zinc-400 text-sm mb-3">Tags are earned through play — not purchased with XP. They represent acquired knowledge from successful crafting, trainer instruction, material examination, and deconstruction.</p>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {["Material","Technique","Formula"].map(d => (
                <div key={d} className="bg-zinc-800/50 border border-zinc-700 p-3 rounded text-center">
                  <div className="text-emerald-400 font-bold text-sm">{d}</div>
                  <div className="text-zinc-500 text-xs mt-1">Tag domain</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {[
                { tier:"T1", label:"Common",    col:"text-zinc-300 border-zinc-600" },
                { tier:"T2", label:"Uncommon",  col:"text-green-400 border-green-800" },
                { tier:"T3", label:"Rare",      col:"text-blue-400 border-blue-800" },
                { tier:"T4", label:"Epic",      col:"text-purple-400 border-purple-800" },
                { tier:"T5", label:"Legendary", col:"text-yellow-400 border-yellow-700" },
              ].map(t => (
                <div key={t.tier} className={`bg-zinc-800/40 border rounded p-2 text-center ${t.col}`}>
                  <div className="font-black text-sm">{t.tier}</div>
                  <div className="text-xs opacity-80">{t.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-800/30 border border-zinc-700 rounded p-3 text-xs text-zinc-400">
              <strong className="text-zinc-200">Tag Bridge:</strong> Missing tags can be bridged by skill level (L1=10% … L5=50% of recipe tags). Operating outside tag coverage increases DC and risk of failure or adverse outcomes.
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.4 — Recipe Structure</h3>
            <p className="text-zinc-400 text-sm mb-3">All recipes in the system include the following fields.</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { field:"required_tags",          desc:"Knowledge tags the crafter must possess" },
                { field:"materials",              desc:"Input materials and quantities" },
                { field:"crafting_dc",            desc:"Target number for the skill check" },
                { field:"required_skills",        desc:"Minimum profession skill levels" },
                { field:"tool_requirement",       desc:"Tools needed to attempt the recipe" },
                { field:"time_requirement",       desc:"Time to complete one crafting attempt" },
                { field:"functional_material",    desc:"Primary material that defines item function" },
                { field:"critical_success_effect",desc:"Bonus result on critical success" },
              ].map(r => (
                <div key={r.field} className="bg-zinc-800/40 border border-zinc-700 px-3 py-2 rounded">
                  <div className="text-zinc-300">{r.field}</div>
                  <div className="text-zinc-500 font-sans mt-0.5">{r.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.5 — Skill Eras</h3>
            <p className="text-zinc-400 text-sm mb-3">Each profession skill is tagged with the eras in which it exists. Settings restrict which era skills are available.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { era:"Mundane",    range:"Ancient–Medieval",    ex:"Alchemy, Smithing, Bonecraft, Weaving, Cooking, Herbalism" },
                { era:"Industrial", range:"Renaissance–Steam",   ex:"Gunsmithing, Clockwork, Printing, Engineering" },
                { era:"Future",     range:"Modern–Sci-Fi",       ex:"Electronics, Biotech, Nanocraft, Cybernetics" },
                { era:"Fantasy",    range:"Magical/Mythological", ex:"Runeforging, Golemcraft, Soul Binding, Spellscribing" },
              ].map(e => (
                <div key={e.era} className="bg-zinc-800/40 border border-zinc-700 p-3 rounded">
                  <div className="text-emerald-400 font-bold mb-0.5">{e.era}</div>
                  <div className="text-zinc-500 text-xs mb-1">{e.range}</div>
                  <div className="text-zinc-400 text-xs">{e.ex}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-zinc-100 mb-3">7.6 — Dual-Skill Crafting</h3>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>Some recipes require <strong className="text-zinc-200">two profession skills</strong> to complete — for example, an alchemically-treated armor piece might require both Alchemy and Armorsmithing.</p>
              <p>Both skills' tag bridges apply independently. Both skill levels contribute to the DC check (typically the lower of the two governs the primary DC).</p>
              <p><strong className="text-zinc-200">Affinity Styles</strong> function as Profession Skills for spell formula work — an Evocation Affinity can serve as the formula skill for magical recipe components.</p>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ PERSONAS ══════════════════ */}
      {tab === "personas" && (
        <div className="space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg max-w-4xl">
            <h2 className="text-xl font-black text-yellow-500 mb-2">Personas</h2>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>A Persona is a soul archetype — the mythic identity at the core of a character. It manifests as a spirit animal and grants passive, reactive, and active abilities based on Rank.</p>
              <p>Personas are purchased at the Stat Rank XP curve (same as Biology Types). Each Persona has a <strong className="text-zinc-200">governing stat</strong> (BDY / SPT / MND) whose rank caps the Persona Rank.</p>
              <p><strong className="text-zinc-200">R in effect text</strong> = current Persona Rank. <strong className="text-zinc-200">DT</strong> = Defense Tokens. Rank 2 of every Persona expands the governing stat's resource pool (Max Pool +R² · Regen +R).</p>
            </div>
            <div className="flex gap-4 mt-3 text-xs">
              {[{stat:"BDY",col:"text-red-400"},{stat:"SPT",col:"text-blue-400"},{stat:"MND",col:"text-purple-400"}].map(s => (
                <span key={s.stat} className={`font-bold ${s.col}`}>{s.stat}: {personas.filter(p=>p.stat===s.stat).length} Personas</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personas.map(p => <PersonaCard key={p.name} p={p} />)}
          </div>
        </div>
      )}
    </section>
  );
}
