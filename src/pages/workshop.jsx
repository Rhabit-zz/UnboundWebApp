import React, { useState, useEffect, useMemo } from "react";
import combatData    from "../database/CombatStyles.json";
import profData      from "../database/Proficiencies.json";
import craftData     from "../database/CraftSkills.json";
import affinityData  from "../database/Affinities.json";
import socialData    from "../database/SocialSkills.json";

// ── Shared constants ───────────────────────────────────────────────────────────
const SKILL_TYPES = [
  { value:"combat_style",     label:"Style",              color:"text-red-400",    border:"border-red-800",    bg:"bg-red-900/20" },
  { value:"social_skill",     label:"Social Skill",       color:"text-green-400",  border:"border-green-800",  bg:"bg-green-900/20" },
  { value:"craft_profession", label:"Craft / Profession", color:"text-yellow-400", border:"border-yellow-800", bg:"bg-yellow-900/20" },
  { value:"weapon",           label:"Weapon Proficiency", color:"text-orange-400", border:"border-orange-800", bg:"bg-orange-900/20" },
  { value:"armor",            label:"Armor Proficiency",  color:"text-blue-400",   border:"border-blue-800",   bg:"bg-blue-900/20" },
];
const STATS    = ["highest", "BDY", "SPT", "MND"];
const POOL_MAP = { BDY:{ pool:"HP", regen:"HPR" }, SPT:{ pool:"SP", regen:"SPR" }, MND:{ pool:"MP", regen:"MPR" } };
const REQ_TYPES = [
  { value:"stat_min",  label:"Stat Minimum" },
  { value:"skill_min", label:"Skill Prerequisite" },
  { value:"affinity",  label:"Affinity" },
  { value:"equipment", label:"Equipment" },
  { value:"trait",     label:"Trait" },
  { value:"style",     label:"Style Prerequisite" },
];
const LS_KEY = "unbound_workshop_skills";
const genId  = () => `skill_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
const isCombatType = t => t === "combat_style" || t === "social_skill";
const BLANK_LEVEL  = { name:"", ap_cost:"", sp_cost:"", mp_cost:"", effect:"" };

function blankSkill() {
  return {
    id: genId(), name:"", subtitle:"", description:"", skill_type:"combat_style",
    governing_stat:"highest", notes:"", requirements:[],
    levels: { 1:{...BLANK_LEVEL}, 2:{...BLANK_LEVEL}, 3:{...BLANK_LEVEL}, 4:{...BLANK_LEVEL}, 5:{...BLANK_LEVEL} },
  };
}
function loadSkills() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
  catch { return []; }
}

// ════════════════════════════════════════════════════════════════════════════
// PUZZLE CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const PUZZLE_CATEGORIES = [
  { id:"style",       label:"Style",              icon:"🌀",
    desc:"HOW you use your skills in action — martial traditions, affinity delivery forms, and cross-skill specializations. All styles share the named-ability-per-level format.",
    color:"text-red-400",     border:"border-red-800",     bg:"bg-red-900/20",    skillType:"combat_style" },
  { id:"affinity",    label:"Affinity",           icon:"✨",
    desc:"Attunement to emotional, elemental, or arcane energy. Status-based. L1 applies stacks. No AP cost — the energy IS the action.",
    color:"text-purple-400",  border:"border-purple-800",  bg:"bg-purple-900/20", skillType:"combat_style" },
  { id:"social",      label:"Social Skill",       icon:"🗣️",
    desc:"Interpersonal actions that drain SP or MP. Works in combat (resource warfare) and social encounters (diplomacy, negotiations, interrogation).",
    color:"text-green-400",   border:"border-green-800",   bg:"bg-green-900/20",  skillType:"social_skill" },
  { id:"proficiency", label:"Proficiency",        icon:"🛡️",
    desc:"Familiarity with an object — weapons or armor. Scaling bonuses to equipment use. No named abilities.",
    color:"text-blue-400",    border:"border-blue-800",    bg:"bg-blue-900/20",   skillType:"weapon" },
  { id:"craft",       label:"Craft / Profession", icon:"⚒️",
    desc:"Familiarity with creating objects. Recipe memory scales with level². Knowledge Tags earned through play.",
    color:"text-yellow-400",  border:"border-yellow-800",  bg:"bg-yellow-900/20", skillType:"craft_profession" },
];

const MARTIAL_ARCHS = new Set(["swing","stab","grappler","defender","skirmisher"]);

const PUZZLE_ARCHETYPES = {
  affinity: [
    { id:"emo_virtue", label:"Virtue",       icon:"☀️", desc:"Charity, patience, diligence… — MP or HP governed" },
    { id:"emo_vice",   label:"Vice",         icon:"🌑", desc:"Wrath, greed, lust… — SP or HP governed" },
    { id:"emo_bridge", label:"Bridge",       icon:"🌉", desc:"Synthesis of two opposing emotional forces" },
    { id:"primal",     label:"Primal",       icon:"🔥", desc:"Elemental forces: fire, water, earth, air and combos" },
    { id:"arcane",     label:"Arcane",       icon:"🔮", desc:"Constructed thought: force, mind, time, space, void…" },
  ],
  proficiency: [
    { id:"weapon_light",  label:"Light Weapon",  icon:"🗡️", desc:"Daggers, shortswords — speed and finesse" },
    { id:"weapon_medium", label:"Medium Weapon", icon:"⚔️", desc:"Longswords, axes — balanced offense/defense" },
    { id:"weapon_heavy",  label:"Heavy Weapon",  icon:"🔨", desc:"Greatswords, warhammers — raw power" },
    { id:"weapon_reach",  label:"Reach Weapon",  icon:"⚡", desc:"Spears, polearms — zone and reach" },
    { id:"weapon_ranged", label:"Ranged Weapon", icon:"🏹", desc:"Bows, firearms — distance attacks" },
    { id:"armor_light",   label:"Light Armor",   icon:"🧥", desc:"Leather, cloth — speed-focused defense" },
    { id:"armor_medium",  label:"Medium Armor",  icon:"🔗", desc:"Chain, scale — balanced protection" },
    { id:"armor_heavy",   label:"Heavy Armor",   icon:"🛡️", desc:"Plate — maximum damage reduction" },
    { id:"shield",        label:"Shield",        icon:"🔵", desc:"Active blocking and reactive cover" },
  ],
  craft: [
    { id:"smithing",   label:"Smithing",     icon:"🔨", desc:"Weapons, armor, metalwork" },
    { id:"alchemy",    label:"Alchemy",      icon:"⚗️", desc:"Potions, poisons, transmutation" },
    { id:"enchanting", label:"Enchanting",   icon:"✨", desc:"Infusing items with magical properties" },
    { id:"tailoring",  label:"Tailoring",    icon:"🧵", desc:"Armor, clothing, and textiles" },
    { id:"cooking",    label:"Cooking",      icon:"🍖", desc:"Meals, buffs, and sustenance" },
    { id:"tinkering",  label:"Tinkering",    icon:"⚙️", desc:"Devices, traps, and mechanisms" },
  ],
  style: [
    { group:"Martial",  id:"swing",        label:"Swing",         icon:"⚔️", desc:"Slash or bash — damage type set by weapon. Full weapon damage at L1." },
    { group:"Martial",  id:"stab",         label:"Stab",          icon:"🗡️", desc:"Pierce — requires a pointed weapon. Accurate, targeted strikes." },
    { group:"Martial",  id:"grappler",     label:"Grappler",      icon:"🤼", desc:"Close control, holds, ground fighting" },
    { group:"Martial",  id:"defender",     label:"Defender",      icon:"🛡️", desc:"Shield and armor reactive — block, counter, reduce incoming damage." },
    { group:"Martial",  id:"skirmisher",   label:"Skirmisher",    icon:"💨", desc:"Mobile hit-and-run, stealth, evasion" },
    { group:"Casting",  id:"bolt",         label:"Bolt",          icon:"💥", desc:"Ranged pierce — 3L spaces, L damage. L1 capable. Use Delivery hooks to add L3 form." },
    { group:"Casting",  id:"claw",         label:"Claw / Slash",  icon:"🗡️", desc:"L spaces range, L hits × ½L damage each. Slashing + affinity type. L1 capable." },
    { group:"Casting",  id:"cone",         label:"Cone",          icon:"🌬️", desc:"Forward arc — adjacent only at L1; medium range at L3." },
    { group:"Casting",  id:"line",         label:"Line",          icon:"⚡", desc:"Penetrating beam or charge path — short at L1; full range at L3." },
    { group:"Casting",  id:"area",         label:"Area Effect",   icon:"💫", desc:"Radius burst — melee-range at L1; placed at distance at L3." },
    { group:"Casting",  id:"wall",         label:"Wall / Terrain",icon:"🧱", desc:"Elemental hazard barrier — adjacent section at L1." },
    { group:"Casting",  id:"bubble",       label:"Sphere / Aegis",icon:"🔵", desc:"Protective sphere — self-centered at L1; deployed at L3." },
    { group:"Cross",    id:"craft_combat", label:"Craft Combat",  icon:"⚒️", desc:"Maker's advantage — +2L damage when using self-crafted items. Compensates for crafting skills' indirect combat function." },
  ],
  social: [
    { id:"inspire",     label:"Inspire",     icon:"✨", desc:"SPT — grant Inspiration stack; target recovers SP on next action." },
    { id:"seduce",      label:"Seduce",      icon:"💘", desc:"SPT or BDY — apply Enthralled stack; distract or charm the target." },
    { id:"persuade",    label:"Persuade",    icon:"🗣️", desc:"SPT (emotional) or MND (logical) — build Rapport equal to roll margin." },
    { id:"deceive",     label:"Deceive",     icon:"🎭", desc:"MND (construct) or SPT (conceal) — apply Disorient stack; mislead." },
    { id:"intimidate",  label:"Intimidate",  icon:"😤", desc:"Highest of BDY/SPT/MND — apply Fear stack; Demoralize on critical." },
    { id:"insight",     label:"Insight",     icon:"👁️", desc:"SPT — detect Deceive attempts; identify dominant emotional state." },
    { id:"investigate", label:"Investigate", icon:"🔍", desc:"MND or SPT — find hidden objects, concealed information, or threats." },
    { id:"resolve",     label:"Resolve",     icon:"🛡️", desc:"SPT or MND — social defense; gain Determination stack on success." },
    { id:"provoke",     label:"Provoke",     icon:"🔥", desc:"BDY or SPT — force engagement; Provoked target must spend AP on you or drain SP." },
    { id:"console",     label:"Console",     icon:"🫶", desc:"SPT — remove negative status stacks from allies; the social healer." },
  ],
};

// Multi-select mechanic hooks
const PUZZLE_HOOKS = [
  // Attack
  { id:"slash",     group:"Attack",   label:"Slash",          kw:["slash","cut","blade"] },
  { id:"pierce",    group:"Attack",   label:"Pierce / Stab",  kw:["pierce","stab","thrust","stab"] },
  { id:"bludgeon",  group:"Attack",   label:"Bludgeon",       kw:["bash","bludgeon","crush","club"] },
  { id:"unarmed",   group:"Attack",   label:"Unarmed",        kw:["unarmed","punch","kick","strike"] },
  { id:"ranged",    group:"Attack",   label:"Ranged",         kw:["ranged","shot","arrow","projectile","bolt","fire"] },
  { id:"elemental", group:"Attack",   label:"Elemental",      kw:["elemental","fire","ice","earth","air","lightning","radiant"] },
  // Control
  { id:"grapple",   group:"Control",  label:"Grapple",        kw:["grapple","clinch","hold","submit","choke"] },
  { id:"push_pull", group:"Control",  label:"Push / Pull",    kw:["push","shove","pull","reposition","knockback"] },
  { id:"stagger",   group:"Control",  label:"Stagger / Stun", kw:["stagger","stun","staggered","prone","knockdown","immob"] },
  { id:"area",      group:"Control",  label:"Area Effect",    kw:["aoe","area","radius","all adjacent","all targets","zone"] },
  { id:"condition", group:"Control",  label:"Condition Stack",kw:["bleed","bleeding","weakened","condition","status","stack"] },
  // Defense
  { id:"block",     group:"Defense",  label:"Block",          kw:["block","parry","shield"] },
  { id:"dodge",     group:"Defense",  label:"Dodge",          kw:["dodge","evade","evasion"] },
  { id:"counter",   group:"Defense",  label:"Counter / Riposte",kw:["counter","riposte","reaction","respond","redirect"] },
  // Utility
  { id:"movement",  group:"Utility",  label:"Movement / Dash",kw:["move","dash","charge","rush","step","tile","teleport"] },
  { id:"stealth",   group:"Utility",  label:"Stealth",        kw:["stealth","invisible","conceal","hidden","shadow"] },
  { id:"chain",     group:"Utility",  label:"Combo / Chain",  kw:["chain","combo","consecutive","follow-up","second attack"] },
  { id:"reaction",  group:"Utility",  label:"Reaction",       kw:["reaction","as a reaction","free attack","opportunity"] },
  { id:"ally",      group:"Utility",  label:"Ally Synergy",   kw:["ally","adjacent ally","allies","formation"] },
  // Special
  { id:"once",      group:"Special",  label:"Once / Combat",  kw:["1/combat","once per","uses:1"] },
  { id:"duration",  group:"Special",  label:"Duration / Aura",kw:["for l rounds","for 3 rounds","duration","while","aura"] },
  { id:"drain",     group:"Special",  label:"Resource Drain", kw:["drain","steal","absorb","siphon","convert","restore"] },
  { id:"creation",  group:"Special",  label:"Creation",       kw:["craft","create","recipe","forge","brew"] },
  // Social (social skill category only)
  { id:"rapport",       group:"Social",   label:"Rapport",           kw:["rapport","cordial","friendly","warm","trusted","devoted"] },
  { id:"sp_damage",     group:"Social",   label:"SP Damage",          kw:["sp damage","drain sp","exhaust","fatigue","stamina"] },
  { id:"mp_damage",     group:"Social",   label:"MP Damage",          kw:["mp damage","drain mp","mental strain","focus","mental"] },
  { id:"fear_hook",     group:"Social",   label:"Fear / Demoralize",  kw:["fear","demoralize","frightened","cowering","flee"] },
  { id:"enthralled",    group:"Social",   label:"Enthralled",         kw:["enthralled","charmed","seduced","distracted","enthrall"] },
  { id:"disorient",     group:"Social",   label:"Disorient",          kw:["disorient","confused","misled","disorient","deceive"] },
  { id:"inspire_stack", group:"Social",   label:"Inspiration Stack",  kw:["inspiration","inspired","inspire","motivated","inspiration stack"] },
  { id:"determination", group:"Social",   label:"Determination",      kw:["determination","resolute","fortified","steadfast","determination stack"] },
  { id:"group_social",  group:"Social",   label:"Group Target",       kw:["all targets","group","crowd","multiple","all enemies","all allies","all within"] },
  // Delivery forms (style/casting skills only)
  { id:"d_bolt",   group:"Delivery", label:"Bolt",          kw:["bolt","3l spaces","piercing","ranged bolt","projectile"] },
  { id:"d_claw",   group:"Delivery", label:"Claw / Slash",  kw:["claw","slash","rend","l times","l spaces range","wind slash","scythe","detached"] },
  { id:"d_cone",   group:"Delivery", label:"Cone",          kw:["cone","breath","spray","forward arc","arc"] },
  { id:"d_line",   group:"Delivery", label:"Line",          kw:["line","beam","all in","penetrate","charge path","in a line"] },
  { id:"d_area",   group:"Delivery", label:"Area Effect",   kw:["radius","placed","blizzard","meteor","storm","at any point"] },
  { id:"d_wall",   group:"Delivery", label:"Wall",          kw:["wall","barrier","terrain","hazard","section"] },
  { id:"d_bubble", group:"Delivery", label:"Sphere",        kw:["sphere","bubble","dome","aegis","ward sphere","centered on"] },
];

const HOOK_GROUPS = [...new Set(PUZZLE_HOOKS.map(h => h.group))];

// ── Template generator ────────────────────────────────────────────────────────
const CASTING_ARCHS = new Set(["bolt","claw","cone","line","area","wall","bubble"]);

function poolFromPuzzle(cat, arch, stat) {
  if (stat && POOL_MAP[stat]) return POOL_MAP[stat];
  if (cat === "affinity") {
    if (arch === "emo_virtue" || arch === "arcane" || arch === "primal") return POOL_MAP.MND;
    return POOL_MAP.SPT;
  }
  if (cat === "style") {
    if (MARTIAL_ARCHS.has(arch) || arch === "craft_combat") return { pool:"SP", regen:"SPR" };
    return POOL_MAP.MND; // casting delivery forms default to MND
  }
  if (cat === "social") return { pool:"SP", regen:"SPR" }; // MND-governed skills redirect via stat param above
  if (cat === "craft") return POOL_MAP.MND;
  return { pool:"SP", regen:"SPR" };
}

function makeL1(cat, arch, hooks) {
  const hasGrapple = hooks.some(h => h.id === "grapple");
  const hasRanged  = hooks.some(h => h.id === "ranged");
  const hasArea    = hooks.some(h => h.id === "area");
  const hasCounter = hooks.some(h => h.id === "counter");
  const hasMovement= hooks.some(h => h.id === "movement");
  const hasStealth = hooks.some(h => h.id === "stealth");

  if (cat === "affinity") {
    const pool = { emo_virtue:"MP", emo_vice:"SP", emo_bridge:"SP", primal:"MP", arcane:"MP" }[arch] || "MP";
    return { cost:`1 AP, L ${pool}`, effect:"Apply L stacks of [Status Effect] to target." };
  }
  if (cat === "proficiency") {
    const target = {
      weapon_light:"light melee weapon attacks", weapon_medium:"medium melee weapon attacks",
      weapon_heavy:"heavy melee weapon attacks", weapon_reach:"reach weapon attacks",
      weapon_ranged:"ranged weapon attacks", armor_light:"Dodge while lightly loaded",
      armor_medium:"Block while in medium armor", armor_heavy:"physical damage reduction",
      shield:"Block with a shield",
    }[arch] || "relevant attacks or defense";
    return { effect:`+L to ${target}.` };
  }
  if (cat === "craft") {
    const item = { smithing:"metal items", alchemy:"compounds and solutions", enchanting:"enchanted objects",
      tailoring:"cloth items and armor", cooking:"prepared meals", tinkering:"devices and traps" }[arch] || "crafted items";
    return { effect:`Craft ${item}. Recipe memory: L² recipes; tool memory: L³ tools.` };
  }
  if (cat === "style") {
    const hasDbolt   = hooks.some(h => h.id === "d_bolt");
    const hasDclaw   = hooks.some(h => h.id === "d_claw");
    const hasDcone   = hooks.some(h => h.id === "d_cone");
    const hasDline   = hooks.some(h => h.id === "d_line");
    const hasDarea   = hooks.some(h => h.id === "d_area");
    const hasDwall   = hooks.some(h => h.id === "d_wall");
    const haDbubble  = hooks.some(h => h.id === "d_bubble");
    // Primary delivery form (archetype wins; hooks are the secondary signal)
    const primary = arch || (hasDbolt?"bolt":hasDclaw?"claw":hasDcone?"cone":hasDline?"line":hasDarea?"area":hasDwall?"wall":haDbubble?"bubble":null);
    if (primary === "bolt")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Cast any known Affinity as a bolt: deal L [piercing] damage at 3L spaces range and apply L stacks of [Affinity Status]. Requires [Affinity] L1+." };
    if (primary === "claw")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Project L detached [Affinity] claws at L spaces range: each deals ⌊L/2⌋ [slashing] damage and applies 1 [Affinity] stack. Requires [Affinity] L1+." };
    if (primary === "cone")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Breathe or spray [Affinity] energy in a short forward arc (adjacent tiles only): deal L [Affinity] damage and apply L stacks to all targets hit. Requires [Affinity] L1+." };
    if (primary === "line")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Fire a short [Affinity] beam that pierces all targets within L spaces in a straight line: deal L [Affinity] damage and apply 1 stack each. Requires [Affinity] L1+." };
    if (primary === "area")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Detonate a burst of [Affinity] energy within 1 tile of yourself: deal L [Affinity] damage and apply L stacks to all within 1 tile of the point. Requires [Affinity] L1+." };
    if (primary === "wall")   return { name:"[Style Name]", ap_cost:"2", mp_cost:"L", effect:"Raise a section of elemental [Affinity] barrier adjacent to you (L² HP): deals L [Affinity] damage to any who touch or cross it. Lasts L rounds. Requires [Affinity] L1+." };
    if (primary === "bubble") return { name:"[Style Name]", ap_cost:"1", mp_cost:"L", effect:"Project an [Affinity] sphere centered on yourself: gain +L defense and deal L [Affinity] damage to adjacent attackers each round. Lasts L rounds. Requires [Affinity] L1+." };
    if (arch === "craft_combat") return { name:"[Style Name]", ap_cost:"1", effect:"Activate a crafted [item type] as a tactical tool: +2L damage on hit or +L to [relevant action] for L rounds. Requires [Craft] L1+." };
    // Martial archetypes
    const martialL1 = {
      swing:      { name:"[Opening Swing]",  ap_cost:"2", effect:`+L to hit. On a successful hit, deal weapon damage as [slash or bash depending on weapon type].${hasRanged?" Usable at range if wielding a ranged weapon.":""}` },
      stab:       { name:"[Stab]",           ap_cost:"2", effect:"Requires a pointed (piercing) weapon. +L to hit and deal L [piercing] damage. Roll the attack twice and keep the higher result." },
      grappler:   { name:"[Clinch Entry]",   ap_cost:"2", effect:"Grapple a target and immediately strike for L damage. The grapple check and attack resolve simultaneously." },
      defender:   { name:"[Guard Stance]",   ap_cost:"2", effect:`+L to Block or Dodge.${hasCounter?" Counter-strike for L damage on a successful defense.":""}` },
      skirmisher: { name:"[Swift Strike]",   ap_cost:"2", effect:`+L to hit${hasStealth?" when hidden or in dim light":""}${hasMovement?"; no accuracy penalty for moving before attacking":""}.` },
    };
    return martialL1[arch] || { name:"[Opening Technique]", ap_cost:"2", effect:"+L to [relevant attack or defense]." };
  }
  if (cat === "social") {
    const templates = {
      inspire:     { name:"[Inspire]",      ap_cost:"1", sp_cost:"1", effect:"SPT check vs target Resolve. 1 AP (quick): apply 1 Inspiration stack. 2 AP (committed): apply L Inspiration stacks. Inspiration: target recovers SP equal to AP spent on their next action (stack consumed on trigger, lasts L rounds). On critical (10+), apply 1 additional stack (quick) or L additional stacks (committed)." },
      seduce:      { name:"[Seduce]",       ap_cost:"1", sp_cost:"1", effect:"SPT or BDY check vs target Resolve. 1 AP (quick): apply 1 Enthralled stack. 2 AP (committed): apply L Enthralled stacks. Each Enthralled stack: drain 1 MP from target at start of their turn. While Enthralled, target cannot spend MP on actions targeting you. On critical, target also loses their next reaction." },
      persuade:    { name:"[Persuade]",     ap_cost:"1", sp_cost:"1", effect:"SPT (emotional) or MND (logical) check vs target Resolve. 1 AP (quick): generate 1 Rapport. 2 AP (committed): generate Rapport equal to roll margin. At Cordial (5+) or higher, repeat Persuade checks against this target cost 1 less SP/MP (min 0). On critical, target also gains 1 Inspiration stack." },
      deceive:     { name:"[Deceive]",      ap_cost:"1", mp_cost:"1", effect:"MND (fabricate) or SPT (conceal) check vs target Insight. 1 AP (quick): apply 1 Disorient stack. 2 AP (committed): apply L Disorient stacks. Each stack: target loses 1 AP on their next turn (max = L). On critical, target also accepts one false belief as true until they succeed Insight (DC your MND + L)." },
      intimidate:  { name:"[Intimidate]",   ap_cost:"1", sp_cost:"1", effect:"Highest of BDY/SPT/MND check vs target Resolve. 1 AP (quick): apply 1 Fear stack. 2 AP (committed): apply L Fear stacks. Each Fear stack drains 1 SP from target at start of their turn and applies -L to their rolls. On critical (10+), also apply 1 Demoralize stack (reduce target Max SP by L). Does not generate Rapport." },
      insight:     { name:"[Insight]",      ap_cost:"1", sp_cost:"1", effect:"SPT check. Free version once per scene (no roll): detect if any target is using a social skill on you or allies. Active (1 AP): identify target's emotional state and Rapport feelings. On success by 5+: detect all active Deceive attempts. On critical: expose one hidden social action — target cannot conceal it this round." },
      investigate: { name:"[Investigate]",  ap_cost:"1", mp_cost:"1", effect:"MND or SPT check. Locate hidden objects, concealed persons, or disguised threats within L×3 spaces. In social: detect concealed weapons, pre-arranged signals, or one hidden motive of a visible NPC. On success by 5+: reveal one social arrangement hidden from your group." },
      resolve:     { name:"[Resolve]",      ap_cost:"1", sp_cost:"0", effect:"SPT or MND check vs attacker. 1 AP (quick): gain 1 Determination stack (absorbs 1 incoming status stack/round). 2 AP (committed): block the social attack entirely and gain 1 Determination stack. On critical, reflect L SP drain to attacker. Reaction form: spend 1 SP to oppose one incoming attack at no AP cost, once per round." },
      provoke:     { name:"[Taunt]",        ap_cost:"2", sp_cost:"1", effect:"BDY or SPT check vs target Resolve. Apply L Provoked stacks. Provoked: target must spend 1 AP engaging you per round or drain L SP. Actions targeting anyone but you cost the target 1 extra SP. On critical, apply 1 Enraged stack — target's next action must target you, costs 0 AP, cannot be defensive." },
      console:     { name:"[Comfort]",      ap_cost:"1", sp_cost:"1", effect:"SPT check vs DC (8 + number of target's active negative stacks). 1 AP (quick): remove 1 negative social status stack from one target. 2 AP (committed): remove L negative status stacks (Fear, Disorient, Enthralled, or Demoralize) from one target, and target recovers L SP. Your next Inspire targeting this character gains +L." },
    };
    return templates[arch] || { name:"[Social Action]", ap_cost:"2", sp_cost:"1", effect:"[Social stat] check: on success, apply the relevant status effect or generate Rapport." };
  }
}

function makeL3(cat, arch, hooks) {
  const hasGrapple = hooks.some(h => h.id === "grapple");
  const hasArea    = hooks.some(h => h.id === "area");
  const hasControl = hooks.some(h => h.id === "stagger" || h.id === "condition");
  const hasMovement= hooks.some(h => h.id === "movement");
  const hasStealth = hooks.some(h => h.id === "stealth");
  const hasCounter = hooks.some(h => h.id === "counter");
  const hasAlly    = hooks.some(h => h.id === "ally");

  if (cat === "affinity") {
    return { effect:"[Escalating effect]: spend L [Pool] to [intensified version of L1 status application — broader, longer, or with secondary effect]." };
  }
  if (cat === "proficiency") {
    return { effect:"[Conditional technique]: [specialized bonus based on archetype circumstances — reaction, stance, or situational modifier]." };
  }
  if (cat === "craft") {
    return { effect:"Write patterns: up to L² recipes at Uncommon tier. Assist another crafter at +L to their check." };
  }

  if (cat === "style") {
    // Determine primary and secondary delivery from arch + hooks
    const delivHooks  = hooks.filter(h => h.id.startsWith("d_")).map(h => h.id.replace("d_",""));
    const primaryDel  = CASTING_ARCHS.has(arch) ? arch : (delivHooks[0] || null);
    const secondaryDel= delivHooks.find(h => h !== primaryDel) || null;
    const target = secondaryDel || primaryDel;
    const nameMap = { bolt:"Bolt", claw:"Claw Sweep", cone:"Cone", line:"Line", area:"Area Burst", wall:"Wall", bubble:"Sphere" };
    if (target === "bolt")   return { name:`[${nameMap.bolt}]`,   ap_cost:"3", mp_cost:"2L", effect:"Cast any known Affinity as a powerful bolt: deal 2L [piercing + Affinity] damage at 3L spaces and apply 2L stacks of [Affinity Status]." };
    if (target === "claw")   return { name:`[${nameMap.claw}]`,   ap_cost:"3", mp_cost:"2L", effect:"Sweep 2L [Affinity] claws that can split between targets within L spaces: each deals ⌊L/2⌋ [slashing + Affinity] damage and applies 1 stack." };
    if (target === "cone")   return { name:`[${nameMap.cone}]`,   ap_cost:"3", mp_cost:"2L", effect:"Breathe [Affinity] energy in a medium-range forward arc (L×2 spaces deep): deal L [Affinity] damage and apply L stacks to all targets hit." };
    if (target === "line")   return { name:`[${nameMap.line}]`,   ap_cost:"3", mp_cost:"2L", effect:"Fire a full-range [Affinity] beam through all targets in a straight line up to L×3 spaces: deal L [Affinity] damage and apply L stacks to each hit." };
    if (target === "area")   return { name:`[${nameMap.area}]`,   ap_cost:"3", mp_cost:"2L", effect:"Invoke a radius burst of [Affinity] energy at up to L×2 spaces distance: deal L [Affinity] damage and apply L stacks to all within L tiles of impact." };
    if (target === "wall")   return { name:`[${nameMap.wall}]`,   ap_cost:"3", mp_cost:"2L", effect:"Raise a full [Affinity] wall up to L×2 spaces long, placeable anywhere within L×2 spaces of you: blocks movement, deals L [Affinity] damage on contact. Lasts L rounds." };
    if (target === "bubble") return { name:`[${nameMap.bubble}]`, ap_cost:"3", mp_cost:"2L", effect:"Deploy an [Affinity] sphere at up to L×2 spaces distance: it remains L rounds, dealing L damage to those who enter and granting +L defense to allies inside." };
    if (arch === "craft_combat") return { name:"[Masterwork Deploy]", ap_cost:"2", effect:"Deploy a crafted item beyond normal limits: its core property operates at L tiers higher quality and lasts twice as long. +2L damage when using a self-crafted weapon." };
    if (!MARTIAL_ARCHS.has(arch)) return { name:"[Secondary Technique]", ap_cost:"3", mp_cost:"2L", effect:"[A second delivery form or powered-up version of your primary delivery]. Select a Delivery hook above to specify." };
    // Martial archetypes fall through to hook-based logic below
  }
  if (cat === "social") {
    const socialL3 = {
      inspire:     { name:"[Rally]",                  ap_cost:"2", sp_cost:"2", effect:"Inspire up to L targets simultaneously. Each gains L Inspiration stacks and recovers SP equal to L × their next AP spent." },
      seduce:      { name:"[Enthralling Gaze]",       ap_cost:"2", sp_cost:"2", effect:"Apply 2 Enthralled stacks to a target and drain L MP immediately. Enthralled targets cannot willingly attack you for 1 round per stack." },
      persuade:    { name:"[Compelling Argument]",    ap_cost:"2", sp_cost:"2", effect:"Persuade check at +L: gain Rapport equal to 2× margin on success. On a critical, target adopts your stated position for the duration of the scene." },
      deceive:     { name:"[Complex Misdirection]",   ap_cost:"2", sp_cost:"2", effect:"Apply L Disorient stacks to a target. While Disoriented, the target cannot detect your Deceive attempts and accepts false information as true." },
      intimidate:  { name:"[Overwhelming Presence]",  ap_cost:"2", sp_cost:"2", effect:"Apply 2 Fear stacks to all enemies within L×3 spaces. Targets at max Fear stacks are Cowering (cannot take aggressive actions) for 1 round." },
      insight:     { name:"[Emotional Mapping]",      ap_cost:"2", sp_cost:"2", effect:"Identify the precise emotional state, current intent, and active social vulnerabilities of all targets in line of sight. +L to all social checks against them this scene." },
      investigate: { name:"[Scene Sweep]",            ap_cost:"2", sp_cost:"2", effect:"Investigate the entire area: locate all hidden objects, concealed information, and disguised threats within L×5 spaces. Expose 1 hidden character." },
      resolve:     { name:"[Rally Defense]",          ap_cost:"2", sp_cost:"1", effect:"Build L Determination stacks and extend them to all allies within L×3 spaces. Remove 1 negative social status stack (Fear, Disorient, or Enthralled) from each protected ally." },
      provoke:     { name:"[Incite]",                ap_cost:"3", sp_cost:"2", effect:"Apply 2L Provoked stacks to all enemies within L×3 spaces. Provoked targets lose access to Insight and Investigate this round — too emotionally reactive to perceive clearly. On critical, apply 1 Enraged stack to all targets hit." },
      console:     { name:"[Safe Harbor]",           ap_cost:"3", sp_cost:"2", effect:"Remove all negative social status stacks from up to L allies simultaneously with one check. Each cleansed ally recovers L SP. Apply 1 Inspiration stack to each ally whose stacks were fully cleared." },
    };
    return socialL3[arch] || { name:"[Advanced Social Technique]", ap_cost:"2", sp_cost:"2", effect:"An empowered version of your base social action — broader range, stronger effect, or dual application." };
  }
  if (hasGrapple)  return { name:"[Submission Hold]",   ap_cost:"3", sp_cost:"2L", effect:"Apply a joint lock or choke: target is Immobilized and takes L damage per round until escape (BDY DC L+2)." };
  if (hasStealth)  return { name:"[Strike and Vanish]", ap_cost:"3", sp_cost:"2L", effect:"Attack from concealment for 2L damage, then immediately re-enter Stealth as part of the same action." };
  if (hasCounter)  return { name:"[Redirect]",          ap_cost:"2", effect:"As a Reaction to a melee or ranged attack, redirect it into a target of your choice within range. The original attacker's strike hits that new target instead." };
  if (hasArea)     return { name:"[Area Strike]",        ap_cost:"3", sp_cost:"2L", effect:"Strike all targets in a [radius or line]; deal 2L damage each. Apply [relevant status] to all hit." };
  if (hasMovement) return { name:"[Dash Strike]",        ap_cost:"3", sp_cost:"2L", effect:"Move up to L×2 tiles and strike all targets in your path for 2L damage. Movement does not provoke Reactions." };
  if (hasAlly)     return { name:"[Formation Advance]",  ap_cost:"2", effect:"Move up to 3 tiles; allied companions within range may move the same distance at no AP cost. Enemies in your path take L damage." };
  if (hasControl)  return { name:"[Pressure Strike]",    ap_cost:"3", sp_cost:"2L", effect:"Deal 2L damage and apply [status]. Targets already [status] suffer an upgraded version of the effect." };
  return                   { name:"[Power Technique]",   ap_cost:"3", sp_cost:"2L", effect:"A powerful version of your primary attack: deal 3L damage and apply a secondary effect." };
}

function makeL4(cat, arch, hooks) {
  const hasChain   = hooks.some(h => h.id === "chain");
  const hasCounter = hooks.some(h => h.id === "counter");
  const hasMovement= hooks.some(h => h.id === "movement");
  const hasDrain   = hooks.some(h => h.id === "drain");
  const hasAlly    = hooks.some(h => h.id === "ally");
  const hasDuration= hooks.some(h => h.id === "duration");
  const hasGrapple = hooks.some(h => h.id === "grapple");

  if (cat === "affinity") return { effect:"[Passive threshold]: once a target has L or more [Status] stacks, a secondary passive effect triggers (bonus damage, resource drain, additional status)." };
  if (cat === "proficiency") return { effect:"[Mastery passive]: [signature passive mechanic unique to this weapon or armor category — e.g. free reaction, bonus on stance, or escalating bonus]." };
  if (cat === "craft") return { effect:"Epic Artisan: write patterns up to Epic tier. Crafted items gain +L to all relevant stats." };

  if (cat === "style") {
    if (CASTING_ARCHS.has(arch) || hooks.some(h => h.id.startsWith("d_"))) {
      return { effect:"Delivery efficiency passive: reduce the [affinity pool] cost of your primary delivery by 1 (min 1). When you apply [Affinity Status] to a target already at max stacks, deal bonus L [Affinity] damage and reset stacks to L." };
    }
    if (arch === "craft_combat") return { effect:"Crafted items you use in combat gain +L to all relevant stats. When using a self-crafted weapon, deal +2L damage on hit. Once per combat, draw and activate a crafted item as a free action." };
    if (!MARTIAL_ARCHS.has(arch)) return { effect:"[Passive enhancement]: ongoing benefit that rewards investment in the base skill this style requires." };
    // Martial archetypes fall through to hook-based logic below
  }
  if (cat === "social") {
    return { effect:"Passive: [ongoing social benefit — Rapport decay slows, status stacks persist longer, or you gain bonus SP recovery when social actions succeed]." };
  }

  if (hasGrapple && hasChain) return { effect:"While Grappling, your target loses 1 AP per round. Gain +L to all attacks against Grappled targets." };
  if (hasChain)    return { effect:"After each hit on the same target this turn, gain +1 to the next attack roll (up to +L maximum)." };
  if (hasCounter)  return { effect:"As a Reaction after a successful Dodge or Block, immediately deal L damage to the attacker at no AP cost." };
  if (hasMovement) return { effect:"Moving no longer provokes Reaction attacks from enemies. +L damage when you attack after moving at least 1 tile this turn." };
  if (hasDrain)    return { effect:"Each hit drains L [resource] from the target and restores it to you. At the end of combat, keep all drained resources." };
  if (hasDuration) return { effect:"Ongoing effects you apply last L rounds longer. While any sustained effect is active, gain +L to defense." };
  if (hasAlly)     return { effect:"When adjacent to an ally who attacked this round, gain +L to all rolls until your next turn. This bonus is mutual." };
  return                   { effect:"[Passive enhancement]: [ongoing bonus tied to your primary mechanic, active without cost]." };
}

function makeL5(cat, arch, hooks) {
  const hasStealth = hooks.some(h => h.id === "stealth");
  const hasDuration= hooks.some(h => h.id === "duration");
  const hasGrapple = hooks.some(h => h.id === "grapple");
  const hasArea    = hooks.some(h => h.id === "area");

  if (cat === "affinity") {
    return { effect:"[Paragon effect]: [the absolute expression of this energy — permanent field, one-use cosmic event, or transformation of how the resource itself works]." };
  }
  if (cat === "proficiency") {
    return { effect:"[Mastery capstone]: [unique mechanic that only this weapon or armor type can express at its highest level]." };
  }
  if (cat === "craft") {
    return { effect:"Legendary Artisan: write Legendary patterns. L² recipes at all tiers. Crafted items count as L tiers higher for all purposes." };
  }

  if (cat === "style") {
    const delivHooks = hooks.filter(h => h.id.startsWith("d_")).map(h => h.id.replace("d_",""));
    const primary = CASTING_ARCHS.has(arch) ? arch : (delivHooks[0] || null);
    const ultimates = {
      bolt:   { name:"[Singularity]",       ap_cost:"3", mp_cost:"2L", effect:"Fire a hyper-condensed [Affinity] bolt: deal 5L [piercing + Affinity] damage. Ignores all resistances. Applies L² stacks of [Affinity Status]." },
      claw:   { name:"[Storm of Claws]",    ap_cost:"3", mp_cost:"2L", effect:"Lash 2L [Affinity] claws that can each target different enemies within L spaces: deal ⌊L/2⌋ [slashing + Affinity] damage per claw. Targets at max stacks take double damage." },
      cone:   { name:"[Elemental Surge]",   ap_cost:"3", mp_cost:"2L", effect:"Unleash a massive [Affinity] cone (L×3 spaces deep, full forward arc): deal 3L [Affinity] damage and apply 2L stacks to all targets hit. Targets at max stacks are Stunned." },
      line:   { name:"[Leyline Strike]",    ap_cost:"3", mp_cost:"2L", effect:"Fire a [Affinity] beam that pierces indefinitely in a straight line: deal 2L [Affinity] damage to each target hit. The final target in the line takes double damage." },
      area:   { name:"[Manifestation]",     ap_cost:"3", mp_cost:"2L", effect:"Call down a massive [Affinity] event at any point within L×5 spaces: deal 3L damage in a L-tile radius. The area remains hazardous for L rounds (L damage on entry each round)." },
      wall:   { name:"[Fortress]",          ap_cost:"2", mp_cost:"2L", effect:"Raise an enclosing [Affinity] structure around a target area up to L×2 spaces across: walls on all sides, L² HP each, 2L damage on contact. Lasts L rounds." },
      bubble: { name:"[Absolute Aegis]",    ap_cost:"2", mp_cost:"2L", effect:"Project an impenetrable [Affinity] sphere covering yourself and allies within L tiles for L rounds. Any damage taken by anyone inside triggers L [Affinity] retaliation on the attacker." },
    };
    if (primary && ultimates[primary]) return ultimates[primary];
    if (arch === "craft_combat") return { name:"[Masterwork Deployment]", ap_cost:"2", effect:"Deploy a Legendary crafted item at maximum effect: [its rarest property activates at full power scaled to L]. Self-crafted items deal +2L damage this turn." };
    if (!MARTIAL_ARCHS.has(arch)) return { name:"[Style Ultimate]", ap_cost:"3", mp_cost:"2L", effect:"The fullest expression of this delivery system — [your signature technique at maximum intensity]." };
    // Martial archetypes fall through to hook-based logic below
  }
  if (cat === "social") {
    const socialUltimates = {
      inspire:     { name:"[Legendary Inspiration]", ap_cost:"3", sp_cost:"2L", effect:"All allies in sight gain L Inspiration stacks and immediately recover SP equal to L × their governing stat level. This inspiration lasts until end of scene." },
      seduce:      { name:"[Absolute Enthrallment]", ap_cost:"3", sp_cost:"2L", effect:"Apply L Enthralled stacks to all targets in line of sight. Enthralled targets treat you as an ally until they succeed on a MND check (DC = your roll result)." },
      persuade:    { name:"[Conviction]",            ap_cost:"3", sp_cost:"2L", effect:"Persuade all witnesses simultaneously. On success, Rapport with every affected character jumps to the next full Rapport tier. On a critical, all affected are Devoted for the scene." },
      deceive:     { name:"[Total Fabrication]",     ap_cost:"3", sp_cost:"2L", effect:"All targets in sight gain L Disorient stacks and believe your fabrication is true until they succeed on an Insight check (DC = your MND + L)." },
      intimidate:  { name:"[Absolute Terror]",       ap_cost:"3", sp_cost:"2L", effect:"All enemies in line of sight make a Resolve check (DC = your result). Failure: Cowering. Critical failure: Flee. Success: still gain 3 Fear stacks." },
      insight:     { name:"[Open Book]",             ap_cost:"2", sp_cost:"2L", effect:"Read every target in the scene simultaneously: know their current emotional state, intent, social vulnerabilities, and active deceptions. This knowledge lasts the entire encounter." },
      investigate: { name:"[Complete Picture]",      ap_cost:"2", sp_cost:"2L", effect:"Simultaneously reveal all hidden objects, characters, information, and threats within the entire scene. Nothing can remain hidden from you for the duration of this encounter." },
      resolve:     { name:"[Unbreakable Will]",      ap_cost:"2", sp_cost:"2L", effect:"You and all allies within L×3 spaces become immune to social status effects for L rounds. All negative stacks immediately cleansed. Each round active, all protected characters auto-generate 1 Determination stack. Enemies who attempt social attacks against protected targets drain L SP." },
      provoke:     { name:"[Draw All Eyes]",         ap_cost:"3", sp_cost:"2L", effect:"All enemies in line of sight are Provoked for L rounds or until you are incapacitated. While active, no ally can be targeted by social attacks — all negative social attention flows to you. Enraged applies to all targets. You gain +L to all rolls for the duration." },
      console:     { name:"[Peace of Mind]",         ap_cost:"3", sp_cost:"2L", effect:"Cleanse all negative social status stacks from all allies in line of sight. For L rounds, cleansed allies are immune to social status effects. Apply L Inspiration stacks to each ally. Counts as an Inspire check for all related passives and prerequisites." },
    };
    return socialUltimates[arch] || { name:"[Social Capstone]", ap_cost:"3", sp_cost:"2L", effect:"The ultimate expression of your social mastery — a scene-defining action that reshapes relationships, resolves conflicts, or breaks opposition completely." };
  }

  if (hasStealth)  return { name:"[Phantom Form]",        ap_cost:"2", sp_cost:"2L", effect:"Merge with shadow for 3 rounds: gain full invisibility. Attacks do not break concealment unless you miss." };
  if (hasGrapple)  return { name:"[Submission Finisher]",  ap_cost:"3", sp_cost:"2L", effect:"The ultimate hold. Target is Immobilized; escape DC raises to L+5. On a critical fail to escape, target gains a permanent Weakened stack for the session." };
  if (hasArea)     return { name:"[Storm of Strikes]",     ap_cost:"3", sp_cost:"2L", effect:"Strike up to L targets in range; deal 2L damage each and apply [status]. Targets hit by two effects suffer an enhanced condition." };
  if (hasDuration) return { name:"[Sustained Form]",       ap_cost:"2", sp_cost:"2L", effect:"Enter an empowered state for L rounds. Gain +L to all attacks, defenses, and damage. [Secondary cost or limitation on exit]." };
  return                   { name:"[Signature Ultimate]",  ap_cost:"3", sp_cost:"2L", effect:"Your defining technique — [the fullest expression of everything this style builds toward]." };
}

function buildTemplate(puzzle) {
  const { category, archetype, stat, hooks } = puzzle;
  if (!category) return null;
  const pm   = poolFromPuzzle(category, archetype, stat);
  const type = {
    style:"combat_style", affinity:"combat_style", social:"social_skill",
    proficiency: archetype?.startsWith("armor") || archetype === "shield" ? "armor" : "weapon",
    craft:"craft_profession",
  }[category] || "combat_style";
  const isCombat = category === "style" || category === "affinity" || category === "social";
  return {
    id: genId(), name:"", subtitle:"", description:"",
    skill_type: type,
    governing_stat: stat || "highest",
    requirements: [],
    notes: `Puzzle blueprint: ${category}${archetype ? " · " + archetype : ""}${hooks.length ? " · [" + hooks.map(h=>h.label).join(", ") + "]" : ""}`,
    levels: {
      1: makeL1(category, archetype, hooks),
      2: { effect:`Max ${pm.pool} +L²; ${pm.regen} +L.` },
      3: makeL3(category, archetype, hooks),
      4: makeL4(category, archetype, hooks),
      5: makeL5(category, archetype, hooks),
    },
  };
}

// ── Similar Skills search ─────────────────────────────────────────────────────
function flattenDB(db, overrideType) {
  const out = [];
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.levels && obj.name) {
      out.push({ ...obj, skill_type: obj.skill_type || overrideType });
      return;
    }
    Object.values(obj).forEach(v => typeof v === "object" && walk(v));
  }
  walk(db);
  return out;
}

const ALL_EXISTING = [
  ...flattenDB(combatData, "combat_style"),
  ...flattenDB(profData,   "weapon"),
  ...flattenDB(craftData,  "craft_profession"),
  ...flattenDB({ emotional: affinityData?.emotional?.universal?.tier1 || {} }, "combat_style"),
  ...flattenDB({ primal:    affinityData?.primal?.fantasy?.tier1       || {} }, "combat_style"),
  ...flattenDB(socialData,  "social_skill").map(s => ({ ...s, skill_type: "social_skill" })),
];

function hookScore(skill, hooks) {
  if (!hooks.length) return 0;
  const text = JSON.stringify(skill.levels || "").toLowerCase();
  let hits = 0;
  for (const hook of hooks) {
    if (hook.kw.some(kw => text.includes(kw))) hits++;
  }
  return hits / hooks.length;
}

function getSimilar(puzzle) {
  const { category, archetype, stat, hooks } = puzzle;
  if (!category) return [];
  const targetType = {
    style:"combat_style", affinity:"combat_style", social:"social_skill",
    proficiency: archetype?.startsWith("armor") || archetype === "shield" ? "armor" : "weapon",
    craft:"craft_profession",
  }[category] || "combat_style";
  const targetStat = stat || null;

  return ALL_EXISTING
    .map(skill => {
      let score = 0;
      if (skill.skill_type === targetType) score += 0.5;
      if (targetStat && skill.governing_stat === targetStat) score += 0.2;
      score += hookScore(skill, hooks) * 0.3;
      return { skill, score };
    })
    .filter(x => x.score > 0.2)
    .sort((a,b) => b.score - a.score)
    .slice(0, 4)
    .map(x => x.skill);
}

// ════════════════════════════════════════════════════════════════════════════
// SHARED SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

function reqLabel(r) {
  switch (r.type) {
    case "stat_min":  return `${r.stat} ${r.value}+`;
    case "skill_min": return `${r.skill || "?"} L${r.rank || 1}+`;
    case "affinity":  return `Affinity: ${r.description || "?"}`;
    default:          return r.description || r.type;
  }
}

function RequirementRow({ req, onChange, onRemove }) {
  return (
    <div className="flex gap-2 items-start flex-wrap">
      <select value={req.type} onChange={e => onChange("type", e.target.value)}
        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500">
        {REQ_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      {req.type === "stat_min" ? (
        <>
          <select value={req.stat || "BDY"} onChange={e => onChange("stat", e.target.value)}
            className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500">
            {["BDY","SPT","MND"].map(s => <option key={s}>{s}</option>)}
          </select>
          <input type="number" min={1} max={5} value={req.value || 1} onChange={e => onChange("value", Number(e.target.value))}
            className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500" />
        </>
      ) : req.type === "skill_min" ? (
        <>
          <input value={req.skill || ""} onChange={e => onChange("skill", e.target.value)} placeholder="Skill name"
            className="flex-1 min-w-[120px] bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
          <input type="number" min={1} max={5} value={req.rank || 1} onChange={e => onChange("rank", Number(e.target.value))}
            className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-yellow-500" />
        </>
      ) : (
        <input value={req.description || ""} onChange={e => onChange("description", e.target.value)} placeholder="Description…"
          className="flex-1 min-w-[160px] bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
      )}
      <button onClick={onRemove} className="px-2 py-1.5 text-xs text-zinc-600 hover:text-red-400 transition shrink-0">✕</button>
    </div>
  );
}

function LevelRow({ n, level, isCombat, governing_stat, onChange, onAutoFill }) {
  const pm       = POOL_MAP[governing_stat];
  const poolHint = pm ? `Max ${pm.pool} +L²; ${pm.regen} +L.` : null;
  return (
    <div className="space-y-1.5 pb-3 border-b border-zinc-800/60 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-zinc-400 font-black font-mono text-sm w-4 shrink-0">{n}</span>
        {isCombat && (
          <>
            <input value={level.name || ""} onChange={e => onChange("name", e.target.value)} placeholder="Ability name"
              className="flex-1 min-w-[120px] bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
            <input value={level.ap_cost || ""} onChange={e => onChange("ap_cost", e.target.value)} placeholder="AP" title="AP Cost"
              className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
            <input value={level.sp_cost || ""} onChange={e => onChange("sp_cost", e.target.value)} placeholder="SP" title="SP Cost"
              className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
            <input value={level.mp_cost || ""} onChange={e => onChange("mp_cost", e.target.value)} placeholder="MP" title="MP Cost"
              className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
          </>
        )}
        {n === 2 && onAutoFill && poolHint && (
          <button onClick={onAutoFill} title={`Fill: "${poolHint}"`}
            className="text-xs px-2 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-yellow-400 hover:border-yellow-700 transition shrink-0">
            Auto-fill L2
          </button>
        )}
      </div>
      <div className="ml-6">
        <textarea value={level.effect || ""} onChange={e => onChange("effect", e.target.value)} rows={2}
          placeholder={n === 2 && poolHint ? `Suggested: "${poolHint}"` : `Level ${n} effect…`}
          className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 resize-none" />
      </div>
    </div>
  );
}

function SkillPreviewCard({ skill, compact }) {
  const meta   = SKILL_TYPES.find(t => t.value === skill.skill_type) || SKILL_TYPES[0];
  const levels = skill.levels || {};
  const hasAnyLevel = [1,2,3,4,5].some(n => {
    const lv = typeof levels[n] === "object" ? levels[n] : { effect: levels[n] };
    return lv?.effect || lv?.name;
  });
  return (
    <div className={`bg-zinc-800/40 border ${meta.border} rounded p-4 flex flex-col gap-3`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className={`font-black ${compact ? "text-sm" : "text-base"} ${meta.color}`}>
            {skill.name || <span className="text-zinc-600 italic font-normal text-sm">Unnamed Skill</span>}
          </h3>
          {skill.subtitle && <p className="text-zinc-400 text-xs italic mt-0.5">{skill.subtitle}</p>}
        </div>
        <div className="flex gap-1.5 flex-wrap justify-end shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded font-mono border ${meta.bg} ${meta.color} ${meta.border}`}>{meta.label}</span>
          {skill.governing_stat && skill.governing_stat !== "highest" && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 font-mono">{skill.governing_stat}</span>
          )}
        </div>
      </div>
      {!compact && skill.description && (
        <p className="text-zinc-500 text-xs leading-relaxed border-l-2 border-zinc-700 pl-3 italic">{skill.description}</p>
      )}
      {skill.requirements?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {skill.requirements.map((r, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-zinc-700/60 text-zinc-400 font-mono">{reqLabel(r)}</span>
          ))}
        </div>
      )}
      {hasAnyLevel && (
        <div className="space-y-1.5 border-t border-zinc-700/60 pt-3">
          {[1,2,3,4,5].map(n => {
            const lv  = typeof levels[n] === "object" ? levels[n] : { effect: levels[n] || "" };
            const eff = lv?.effect || "";
            const nm  = lv?.name || "";
            if (!eff && !nm) return null;
            const costs = [lv.ap_cost&&`${lv.ap_cost} AP`, lv.sp_cost&&`${lv.sp_cost} SP`, lv.mp_cost&&`${lv.mp_cost} MP`].filter(Boolean);
            const costStr = lv.cost || (costs.length ? costs.join(", ") : "");
            return (
              <div key={n} className="flex gap-2 text-xs">
                <span className="text-zinc-500 font-mono w-4 shrink-0 font-bold">{n}</span>
                <div className="flex-1 leading-relaxed">
                  {nm && <span className="text-zinc-200 font-semibold">{nm}{costStr ? ` (${costStr})` : ""} — </span>}
                  {!nm && costStr && <span className="text-zinc-500 font-mono">[{costStr}] </span>}
                  <span className="text-zinc-400">{eff}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!compact && skill.notes && (
        <p className="text-zinc-600 text-xs italic border-t border-zinc-700/60 pt-2">{skill.notes}</p>
      )}
    </div>
  );
}

function XPCostTable() {
  let cum = 0;
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4">
      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">XP Cost Reference</h3>
      <table className="w-full text-xs">
        <thead><tr className="text-zinc-500 border-b border-zinc-800">
          <th className="text-left pb-1 font-semibold">Level</th>
          <th className="text-right pb-1 font-semibold">Cost to Raise</th>
          <th className="text-right pb-1 font-semibold">Total XP Spent</th>
        </tr></thead>
        <tbody>{[1,2,3,4,5].map(n => { cum += n; return (
          <tr key={n} className="border-t border-zinc-800/60">
            <td className="py-1.5 text-zinc-300 font-mono">{n}</td>
            <td className="py-1.5 text-right text-yellow-400 font-mono">{n} XP</td>
            <td className="py-1.5 text-right text-zinc-400 font-mono">{cum} XP</td>
          </tr>
        ); })}</tbody>
      </table>
      <p className="text-zinc-600 text-xs mt-2 pt-2 border-t border-zinc-800">Skill level may never exceed the governing stat level.</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PUZZLE TAB
// ════════════════════════════════════════════════════════════════════════════

function PuzzleTab({ onUseTemplate }) {
  const [puzzle, setPuzzle] = useState({ category:null, archetype:null, stat:null, hooks:[] });
  const set = (k, v) => setPuzzle(prev => ({ ...prev, [k]: v }));
  const toggleHook = id => setPuzzle(prev => {
    const has = prev.hooks.find(h => h.id === id);
    return { ...prev, hooks: has ? prev.hooks.filter(h => h.id !== id) : [...prev.hooks, PUZZLE_HOOKS.find(h => h.id === id)] };
  });

  const template = useMemo(() => buildTemplate(puzzle), [puzzle]);
  const similar  = useMemo(() => getSimilar(puzzle),    [puzzle]);
  const catMeta  = PUZZLE_CATEGORIES.find(c => c.id === puzzle.category);
  const archetypes = puzzle.category ? (PUZZLE_ARCHETYPES[puzzle.category] || []) : [];

  const Tile = ({ active, onClick, label, sub, icon, color, border, bg }) => (
    <button onClick={onClick}
      className={`text-left rounded border p-3 transition text-sm font-semibold leading-tight w-full ${
        active
          ? `${border || "border-yellow-500"} ${bg || "bg-yellow-900/20"} ${color || "text-yellow-400"}`
          : "border-zinc-700 bg-zinc-800/30 text-zinc-300 hover:border-zinc-500"
      }`}>
      {icon && <span className="mr-1.5">{icon}</span>}
      {label}
      {sub && <p className="text-xs font-normal mt-1 text-zinc-500 leading-snug">{sub}</p>}
    </button>
  );

  const reset = () => setPuzzle({ category:null, archetype:null, stat:null, hooks:[] });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* LEFT — selectors */}
      <div className="xl:col-span-2 space-y-5">

        {/* Step 1: Category */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">1 — Skill Category</h2>
            {puzzle.category && <button onClick={reset} className="text-xs text-zinc-600 hover:text-zinc-400">Reset</button>}
          </div>
          <div className="grid grid-cols-1 gap-2">
            {PUZZLE_CATEGORIES.map(c => (
              <Tile key={c.id}
                active={puzzle.category === c.id}
                onClick={() => { set("category", c.id); set("archetype", null); set("hooks", []); }}
                label={c.label} sub={c.desc} icon={c.icon}
                color={c.color} border={c.border} bg={c.bg} />
            ))}
          </div>
        </div>

        {/* Step 2: Archetype */}
        {archetypes.length > 0 && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">2 — Subtype / Archetype</h2>
            {(() => {
              const groups = [...new Set(archetypes.map(a => a.group).filter(Boolean))];
              if (!groups.length) return (
                <div className="grid grid-cols-2 gap-2">
                  {archetypes.map(a => (
                    <Tile key={a.id} active={puzzle.archetype === a.id} onClick={() => set("archetype", a.id)}
                      label={a.label} sub={a.desc} icon={a.icon}
                      color={catMeta?.color} border={catMeta?.border} bg={catMeta?.bg} />
                  ))}
                </div>
              );
              const groupLabels = { Martial:"Martial Traditions", Casting:"Affinity Delivery", Cross:"Cross-Skill", Base:"Base Actions", Chakra:"Novice Chakra Skills" };
              return groups.map(grp => (
                <div key={grp}>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">{groupLabels[grp] || grp}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {archetypes.filter(a => a.group === grp).map(a => (
                      <Tile key={a.id} active={puzzle.archetype === a.id} onClick={() => set("archetype", a.id)}
                        label={a.label} sub={a.desc} icon={a.icon}
                        color={catMeta?.color} border={catMeta?.border} bg={catMeta?.bg} />
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Step 3: Governing stat */}
        {puzzle.category && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">3 — Governing Stat</h2>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id:"highest", label:"Highest", sub:"Versatile" },
                { id:"BDY",     label:"BDY",     sub:"HP pool"  },
                { id:"SPT",     label:"SPT",     sub:"SP pool"  },
                { id:"MND",     label:"MND",     sub:"MP pool"  },
              ].map(s => (
                <Tile key={s.id} active={puzzle.stat === s.id}
                  onClick={() => set("stat", s.id)}
                  label={s.label} sub={s.sub} />
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Mechanic hooks */}
        {puzzle.category && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">4 — Mechanic Hooks
              <span className="ml-2 font-normal normal-case text-zinc-500">(multi-select)</span>
            </h2>
            {HOOK_GROUPS.filter(grp => {
              if (grp === "Delivery") return (puzzle.category === "style" && CASTING_ARCHS.has(puzzle.archetype)) || puzzle.category === "affinity";
              if (grp === "Social")   return puzzle.category === "social";
              return true;
            }).map(grp => (
              <div key={grp}>
                <p className="text-xs text-zinc-500 font-semibold uppercase tracking-wider mb-1.5">{grp}</p>
                <div className="flex flex-wrap gap-1.5">
                  {PUZZLE_HOOKS.filter(h => h.group === grp).map(h => {
                    const active = puzzle.hooks.some(x => x.id === h.id);
                    return (
                      <button key={h.id} onClick={() => toggleHook(h.id)}
                        className={`text-xs px-2.5 py-1 rounded border font-mono transition ${
                          active
                            ? "border-yellow-500 bg-yellow-900/30 text-yellow-300"
                            : "border-zinc-700 bg-zinc-800/40 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                        }`}>
                        {h.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT — live result */}
      <div className="xl:col-span-3 space-y-5">

        {/* Blueprint */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Skill Blueprint</h2>
            {template && (
              <button onClick={() => onUseTemplate(template)}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-zinc-900 text-xs font-bold transition">
                ✏️ Open in Full Editor
              </button>
            )}
          </div>
          {template ? (
            <SkillPreviewCard skill={template} />
          ) : (
            <div className="bg-zinc-800/30 border border-dashed border-zinc-700 rounded p-10 text-center">
              <p className="text-zinc-500 text-sm">Select a skill category to generate your blueprint.</p>
              <p className="text-zinc-600 text-xs mt-2">The anatomy will update in real time as you choose pieces.</p>
            </div>
          )}
        </div>

        {/* Anatomy legend */}
        {puzzle.category && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Pattern Grammar</h3>
            <div className="space-y-1.5 text-xs text-zinc-400">
              {puzzle.category === "affinity" && <>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L1</span> Apply L stacks of a status effect at cost of 1 AP + L resource.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L2</span> Pool expansion — standard formula: Max [Pool] +L²; [Regen] +L.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L3</span> Escalating effect — enhanced or broadened application of L1 concept.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L4</span> Passive threshold or synergy — triggers when stacks reach a threshold.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L5</span> Paragon expression — the full realization of what this energy means.</p>
              </>}
              {puzzle.category === "proficiency" && <>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L1</span> +L bonus to the core action of this item type. No AP/resource cost.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L2</span> Pool expansion — standard formula. May include a secondary passive.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L3</span> Specialized technique — conditional bonus or new action type.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L4</span> Mastery passive — ongoing benefit that elevates the whole proficiency.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L5</span> Capstone — a mechanic only this item type can express at its peak.</p>
              </>}
              {puzzle.category === "craft" && <>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L1</span> Craft basic items. Recipe memory: L² recipes, L³ tool formulas.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L2</span> Write Common patterns. Quality improvement through skill level.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L3</span> Journeyman: assist others, unlock Uncommon tier.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L4</span> Master: Epic tier patterns, items gain +L to relevant stats.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L5</span> Artisan: Legendary tier. 25 recipes, 125 tool formulas.</p>
              </>}
              {puzzle.category === "social" && <>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L1</span> Named social action: 1 AP + 1 SP (BDY/SPT actions) or 1 MP (MND actions). Roll governing stat. Apply status on success.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L2</span> Pool expansion — Max SP +L²; SPR +L (or MP/MPR for MND-governed skills).</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L3</span> Escalating form — broader range, stronger status, or a second application of the base action.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L4</span> Passive social benefit — Rapport scaling, status persistence, or ongoing recovery bonus.</p>
                <p><span className="text-zinc-200 font-mono w-4 inline-block">L5</span> Scene-defining capstone — 1/encounter. Reshapes relationships, drains resources, or breaks opposition.</p>
                <p className="mt-2 text-amber-400/70 text-xs">Fully mundane — no magic required. Casual conversation is free; costs apply only when mechanically rolling. Intimidate does NOT generate Rapport. In a fantasy setting, a relevant Emotional Affinity dramatically amplifies these skills.</p>
                <p className="mt-1 text-zinc-600 text-xs">Chakra skills (Willpower, Courage, Wisdom…) are pre-built examples that bundle two base actions — find them in Similar Skills.</p>
              </>}
              {puzzle.category === "style" && (() => {
                const pm      = poolFromPuzzle(puzzle.category, puzzle.archetype, puzzle.stat);
                const isMartial = MARTIAL_ARCHS.has(puzzle.archetype);
                const isCasting = CASTING_ARCHS.has(puzzle.archetype);
                return <>
                  <p><span className="text-zinc-200 font-mono w-4 inline-block">L1</span> Named active ability — AP cost{isCasting ? " + [Affinity pool] cost" : ""}. Defines what this style does.</p>
                  <p><span className="text-zinc-200 font-mono w-4 inline-block">L2</span> Pool expansion — Max {pm.pool} +L²; {pm.regen} +L. Always passive.</p>
                  <p><span className="text-zinc-200 font-mono w-4 inline-block">L3</span> {isCasting ? "Secondary delivery form — pick a second Delivery hook to define it." : "Power technique — 3 AP, resource cost, heavier effect."}</p>
                  <p><span className="text-zinc-200 font-mono w-4 inline-block">L4</span> Passive enhancement — ongoing mechanic that rewards the style's identity.</p>
                  <p><span className="text-zinc-200 font-mono w-4 inline-block">L5</span> Signature ultimate — 1/combat, the style's ceiling.</p>
                  {isCasting && <p className="mt-2 text-amber-400/70 text-xs">Requires [Affinity] as a prerequisite. AP + {pm.pool} is the fuel. Select two Delivery hooks: first = L1 form, second = L3 unlock.</p>}
                  {(puzzle.archetype === "battle") && <p className="mt-2 text-amber-400/70 text-xs">Requires an Affinity + melee weapon as prerequisites. SP is the fuel.</p>}
                </>;
              })()}
            </div>
          </div>
        )}

        {/* Similar existing skills */}
        {similar.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Similar Existing Skills
              <span className="ml-2 font-normal normal-case text-zinc-500">— same pattern, different flavor</span>
            </h3>
            <div className="space-y-3">
              {similar.map((s, i) => (
                <div key={i} className="opacity-80 hover:opacity-100 transition">
                  <SkillPreviewCard skill={s} compact />
                </div>
              ))}
            </div>
          </div>
        )}

        {!puzzle.category && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded p-6 space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">How the Puzzle Works</h3>
            <div className="space-y-3 text-xs text-zinc-400">
              <p>Every skill in Unbound follows a <strong className="text-zinc-200">mechanical grammar</strong>: a pattern of what it costs, what it does, and how it scales. The puzzle builder makes that grammar explicit.</p>
              <p>Select a <strong className="text-zinc-200">category</strong> to define the skill's role in the system. Select an <strong className="text-zinc-200">archetype</strong> to choose its function within that category. Then pick <strong className="text-zinc-200">mechanic hooks</strong> — the specific things it does in play.</p>
              <p>The blueprint fills in automatically. <strong className="text-zinc-200">Similar Skills</strong> shows you existing skills that share the same pattern, so you can see how the grammar produces real skills — and how your new skill fits the family.</p>
              <p className="text-zinc-500 italic">Example (style): Style · Bolt · Delivery: Bolt + Delivery: Cone hooks → L1 bolt (3L range), L3 cone unlocked. Name it anything.</p>
              <p className="text-zinc-500 italic">Example (social): Social Skill · Inspire → L1 Inspire action, L3 Rally (multi-target), L5 scene-wide Inspiration. No magic required. Relevant Emotional Affinities amplify the skill when both are developed.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export default function WorkshopPage() {
  const [mode,       setMode]      = useState("puzzle");
  const [form,       setForm]      = useState(blankSkill);
  const [saved,      setSaved]     = useState(loadSkills);
  const [editingId,  setEditingId] = useState(null);
  const [search,     setSearch]    = useState("");
  const [typeFilter, setTypeFilter]= useState("all");
  const [saveMsg,    setSaveMsg]   = useState(null);

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(saved)); }, [saved]);

  const setField = (path, val) =>
    setForm(prev => {
      const next  = structuredClone(prev);
      const parts = path.split(".");
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = val;
      return next;
    });

  const setLevelField = (n, field, val) =>
    setForm(prev => ({ ...prev, levels: { ...prev.levels, [n]: { ...prev.levels[n], [field]: val } } }));

  const autoFillL2 = () => {
    const pm = POOL_MAP[form.governing_stat];
    if (pm) setLevelField(2, "effect", `Max ${pm.pool} +L²; ${pm.regen} +L.`);
  };

  const addReq    = () => setForm(prev => ({ ...prev, requirements: [...prev.requirements, { type:"stat_min", stat:"BDY", value:1, description:"" }] }));
  const updateReq = (i, field, val) => setForm(prev => { const r = [...prev.requirements]; r[i] = { ...r[i], [field]: val }; return { ...prev, requirements: r }; });
  const removeReq = i => setForm(prev => ({ ...prev, requirements: prev.requirements.filter((_, idx) => idx !== i) }));

  const saveSkill = () => {
    if (!form.name.trim()) { setSaveMsg("error"); setTimeout(() => setSaveMsg(null), 2000); return; }
    if (editingId) setSaved(prev => prev.map(s => s.id === editingId ? { ...form, id: editingId } : s));
    else setSaved(prev => [{ ...form, id: genId() }, ...prev]);
    setSaveMsg("ok"); setTimeout(() => setSaveMsg(null), 2000);
    setEditingId(null); setForm(blankSkill());
  };

  const startEdit = skill => { setForm(structuredClone(skill)); setEditingId(skill.id); setMode("build"); window.scrollTo({ top:0, behavior:"smooth" }); };
  const cancelEdit= () => { setEditingId(null); setForm(blankSkill()); };
  const deleteSkill = id => { setSaved(prev => prev.filter(s => s.id !== id)); if (editingId === id) cancelEdit(); };
  const duplicateSkill = skill => setSaved(prev => [{ ...structuredClone(skill), id: genId(), name: skill.name + " (Copy)" }, ...prev]);
  const exportSkill = skill => {
    const key = skill.name.toLowerCase().replace(/\s+/g,"_");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([JSON.stringify({ [key]: skill }, null, 2)], { type:"application/json" })), download: `${key}.json` });
    a.click();
  };
  const exportAll = () => {
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([JSON.stringify(saved, null, 2)], { type:"application/json" })), download:"custom_skills.json" });
    a.click();
  };

  const handleUseTemplate = template => {
    setForm({ ...template, id: genId(), name:"", notes: template.notes || "" });
    setEditingId(null);
    setMode("build");
    window.scrollTo({ top:0, behavior:"smooth" });
  };

  const isCS = isCombatType(form.skill_type);
  const filteredSaved = saved.filter(s => {
    if (typeFilter !== "all" && s.skill_type !== typeFilter) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="p-6 text-white max-w-7xl mx-auto">
      <div className="mb-5">
        <h1 className="text-3xl font-black mb-1 tracking-wide text-zinc-100">Skill Workshop</h1>
        <p className="text-purple-200 text-sm">Design skills using the same mechanical grammar as the existing system. All saves are local to your browser.</p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 mb-6 border-b border-zinc-800 pb-px">
        {[
          { id:"puzzle", label:"🧩 Puzzle Builder" },
          { id:"build",  label: editingId ? "✏️ Editing Skill" : "🔨 Full Editor" },
          { id:"saved",  label: `📁 Saved (${saved.length})` },
        ].map(t => (
          <button key={t.id} onClick={() => setMode(t.id)}
            className={`px-4 py-2 text-sm font-bold border-b-2 transition ${mode === t.id ? "border-yellow-500 text-yellow-400" : "border-transparent text-zinc-400 hover:text-zinc-200"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PUZZLE */}
      {mode === "puzzle" && <PuzzleTab onUseTemplate={handleUseTemplate} />}

      {/* FULL EDITOR */}
      {mode === "build" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-5">
            <fieldset className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
              <legend className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Identity</legend>
              <div>
                <label className="text-xs text-zinc-400 font-semibold block mb-1">Skill Name *</label>
                <input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Serpentine Evasion"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Skill Type</label>
                  <select value={form.skill_type} onChange={e => setField("skill_type", e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500">
                    {SKILL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Governing Stat</label>
                  <select value={form.governing_stat} onChange={e => setField("governing_stat", e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500">
                    {STATS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {isCS && <>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Subtitle</label>
                  <input value={form.subtitle} onChange={e => setField("subtitle", e.target.value)} placeholder="One-line description of the style"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 font-semibold block mb-1">Description / Lore</label>
                  <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={3}
                    placeholder="Historical/cultural origin and what makes this style unique."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 resize-none" />
                </div>
              </>}
            </fieldset>

            <fieldset className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-3">
              <legend className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Requirements</legend>
              {form.requirements.length === 0 && <p className="text-zinc-600 text-xs">No requirements. Available to all characters.</p>}
              {form.requirements.map((req, i) => (
                <RequirementRow key={i} req={req} onChange={(f,v) => updateReq(i,f,v)} onRemove={() => removeReq(i)} />
              ))}
              <button onClick={addReq} className="text-xs px-3 py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-yellow-400 hover:border-yellow-700 transition">
                + Add Requirement
              </button>
            </fieldset>

            <fieldset className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-4">
              <legend className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Level Effects {isCS && <span className="text-zinc-600 font-normal normal-case"> · Name / AP / SP / MP shown for combat types</span>}
              </legend>
              {[1,2,3,4,5].map(n => (
                <LevelRow key={n} n={n} level={form.levels[n] || BLANK_LEVEL} isCombat={isCS}
                  governing_stat={form.governing_stat} onChange={(f,v) => setLevelField(n,f,v)}
                  onAutoFill={n === 2 ? autoFillL2 : null} />
              ))}
            </fieldset>

            <fieldset className="bg-zinc-900/60 border border-zinc-800 rounded p-4">
              <legend className="px-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">Notes</legend>
              <textarea value={form.notes} onChange={e => setField("notes", e.target.value)} rows={2}
                placeholder="Designer notes, tags, or special rulings."
                className="w-full mt-1 bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 resize-none" />
            </fieldset>

            <div className="flex gap-3 items-center">
              <button onClick={saveSkill}
                className={`px-5 py-2.5 rounded font-bold text-sm transition ${
                  saveMsg === "error" ? "bg-red-900 border border-red-700 text-red-200"
                  : saveMsg === "ok"  ? "bg-green-800 border border-green-700 text-green-200"
                  : "bg-yellow-500 hover:bg-yellow-400 text-zinc-900"
                }`}>
                {saveMsg === "ok" ? "✓ Saved!" : saveMsg === "error" ? "⚠ Name required" : editingId ? "Update Skill" : "Save Skill"}
              </button>
              {editingId
                ? <button onClick={cancelEdit} className="px-4 py-2.5 rounded font-bold text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition">Cancel Edit</button>
                : <button onClick={() => setForm(blankSkill())} className="px-4 py-2.5 rounded font-bold text-sm bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-zinc-200 transition">Reset Form</button>
              }
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Live Preview</h2>
              <SkillPreviewCard skill={form} />
            </div>
            <XPCostTable />
            <div className="bg-zinc-900/60 border border-zinc-800 rounded p-4 space-y-2 text-xs text-zinc-500">
              <h3 className="font-bold text-zinc-400 uppercase tracking-widest text-xs mb-2">Builder Notes</h3>
              <p><span className="text-zinc-300 font-mono">L</span> in effect text = current level of this skill.</p>
              {POOL_MAP[form.governing_stat] && (
                <p><span className="text-zinc-300">Level 2 formula:</span> Max {POOL_MAP[form.governing_stat].pool} +L²; {POOL_MAP[form.governing_stat].regen} +L.</p>
              )}
              {form.skill_type === "combat_style"    && <p>Styles have named abilities per level with AP and resource costs. Add affinity/proficiency/craft prerequisites under Requirements if needed.</p>}
              {form.skill_type === "social_skill"    && <p>Social skills have named abilities with AP + SP/MP costs. BDY/SPT actions cost SP; MND actions cost MP. Casual conversation is always free.</p>}
              {form.skill_type === "craft_profession"&& <p>Recipe memory: L² items · Tool formulas: L³.</p>}
            </div>
          </div>
        </div>
      )}

      {/* SAVED */}
      {mode === "saved" && (
        <div>
          <div className="flex flex-wrap gap-3 mb-5 items-center">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name…"
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-yellow-500 w-52" />
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-yellow-500">
              <option value="all">All Types</option>
              {SKILL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {saved.length > 0 && (
              <button onClick={exportAll} className="ml-auto px-3 py-2 rounded bg-zinc-800 border border-zinc-700 text-xs text-zinc-400 hover:text-yellow-400 hover:border-yellow-700 transition">
                ↓ Export All JSON
              </button>
            )}
          </div>
          {filteredSaved.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔨</div>
              <p className="text-zinc-400 font-semibold text-lg">No saved skills yet.</p>
              <p className="text-zinc-600 text-sm mt-1">Use the Puzzle Builder or Full Editor to create your first skill.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredSaved.map(skill => (
                <div key={skill.id} className="flex flex-col gap-2">
                  <SkillPreviewCard skill={skill} />
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(skill)} className="flex-1 text-xs py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-yellow-400 hover:border-yellow-700 transition">✏️ Edit</button>
                    <button onClick={() => duplicateSkill(skill)} className="flex-1 text-xs py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-blue-400 hover:border-blue-700 transition">⧉ Dupe</button>
                    <button onClick={() => exportSkill(skill)} className="flex-1 text-xs py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-green-400 hover:border-green-700 transition">↓ JSON</button>
                    <button onClick={() => deleteSkill(skill.id)} className="px-3 text-xs py-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-600 hover:text-red-400 hover:border-red-800 transition">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
