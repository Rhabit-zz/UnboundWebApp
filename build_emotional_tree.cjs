/**
 * build_emotional_tree.cjs
 * Writes the full Emotional affinity tree (T2–T5) into Affinities.json.
 * Replaces all existing T2/T3/T4 emotional entries (they were placeholder stubs),
 * merges T5 entries to preserve the existing Transcendence entry.
 * Also fixes the stale envy.opposing reference (kindness → generosity).
 */
'use strict';
const fs   = require('fs');
const path = require('path');

const DB = path.join(__dirname, 'src', 'database', 'Affinities.json');
const data = JSON.parse(fs.readFileSync(DB, 'utf-8'));
const emo  = data.emotional.universal;

// ── Fix stale reference ──────────────────────────────────────────────────────
emo.tier1.envy.opposing = 'generosity';

// ── Helper ───────────────────────────────────────────────────────────────────
function poolBonus(pool, regen) {
  return { pool, formula: 'L_squared', regen };
}
function req(affinity, level) {
  return { type: 'affinity_level', affinity, minimum_level: level };
}
function reqs(...pairs) {
  return pairs.map(([a, l]) => req(a, l));
}

// ════════════════════════════════════════════════════════════════════════════
// TIER 2 — 7 Bridges (one per opposing pair) + 14 Solo Initiates
// ════════════════════════════════════════════════════════════════════════════
const tier2 = {

  // ── BRIDGES ──────────────────────────────────────────────────────────────

  detachment: {
    name: 'Detachment', bridge: true,
    alignment: ['chastity', 'lust'],
    theme: 'The space between purity and desire — neither bound nor empty.',
    governing_pool: 'MP',
    requirement_level: reqs(['chastity', 2], ['lust', 2]),
    levels: {
      '1': { effect: 'Hold Chastity and Lust without conflict. Clarity and Invigorate stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Once per long rest, shed all emotional status effects (positive and negative) and gain L² MP restoration — a clean slate.' },
      '4': { effect: 'You cannot be compelled or seduced. Charm, Fear, and Enchantment effects require L additional successes to affect you.' },
      '5': { effect: 'Once per session, step outside a conflict entirely for L rounds — you are untouchable and neutral, observing without being observed.' }
    }
  },

  change: {
    name: 'Change', bridge: true,
    alignment: ['temperance', 'gluttony'],
    theme: 'The equilibrium that knows when to indulge and when to restrain.',
    governing_pool: 'SP',
    requirement_level: reqs(['temperance', 2], ['gluttony', 2]),
    levels: {
      '1': { effect: 'Hold Temperance and Gluttony without conflict. Fortify and Regenerate stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'After receiving any damage type for the first time in an encounter, gain L resistance to that type for the remainder of the encounter.' },
      '4': { effect: 'Once per long rest, reset all status stack counts to their ideal value (GM adjudicates) — the self finds balance between excess and control.' },
      '5': { effect: 'Once per session, adapt completely: redistribute your stat points optimally for the current challenge for L rounds, then return to normal.' }
    }
  },

  love: {
    name: 'Love', bridge: true,
    alignment: ['charity', 'greed'],
    theme: 'The force that drives both giving everything and wanting everything.',
    governing_pool: 'MP',
    requirement_level: reqs(['charity', 2], ['greed', 2]),
    levels: {
      '1': { effect: 'Hold Charity and Greed without conflict. Barrier and Harden stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP', effect: 'Grant an ally Barrier (L² HP absorbed) while simultaneously gaining L stacks of Harden yourself — protecting others steels you.' },
      '4': { effect: 'Willingly taking damage or spending resources for another grants you L² MP restoration and L stacks of Fortify.' },
      '5': { effect: 'Once per session, sacrifice any amount of your HP or SP to instantly restore allies proportionally — what you give returns doubled at encounter end.' }
    }
  },

  loss: {
    name: 'Loss', bridge: true,
    alignment: ['patience', 'wrath'],
    theme: 'Grief that teaches — the place where endurance and rage meet and become something wiser.',
    governing_pool: 'HP',
    requirement_level: reqs(['patience', 2], ['wrath', 2]),
    levels: {
      '1': { effect: 'Hold Patience and Wrath without conflict. Hasten and Empower stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'When an ally falls in combat, gain L² HP restoration and +L to all rolls for one round as loss becomes purpose.' },
      '4': { effect: 'Once per long rest, convert all damage taken this encounter into Empower stacks (1 stack per 5 HP lost). The pain was not wasted.' },
      '5': { effect: 'Once per session, declare that a past loss has meaning — re-enter the session with full HP, all wounds treated as lessons rather than wounds.' }
    }
  },

  discovery: {
    name: 'Discovery', bridge: true,
    alignment: ['diligence', 'sloth'],
    theme: 'The insight that arises from neither grinding effort nor complete stillness — but both.',
    governing_pool: 'SP',
    requirement_level: reqs(['diligence', 2], ['sloth', 2]),
    levels: {
      '1': { effect: 'Hold Diligence and Sloth without conflict. Focus and Bolstered stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Once per long rest, after spending a round doing nothing (only defending), gain L² SP and +L to all rolls for the following round.' },
      '4': { effect: 'Once per encounter, declare a Moment of Insight — any ability used this round costs 0 AP and gains +L effect from the burst of clarity.' },
      '5': { effect: 'Once per session, enter a trance for L rounds. You act last but all actions gain +L² and you may retroactively choose your targets after seeing results.' }
    }
  },

  gratitude: {
    name: 'Gratitude', bridge: true,
    alignment: ['generosity', 'envy'],
    theme: 'The recognition that abundance and lack are two faces of the same gift.',
    governing_pool: 'SP',
    requirement_level: reqs(['generosity', 2], ['envy', 2]),
    levels: {
      '1': { effect: 'Hold Generosity and Envy without conflict. Inspiration and Ambition stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Each time an ally uses an ability on your behalf, gain L MP restoration and apply L stacks of Inspiration back to them in gratitude.' },
      '4': { cost: '2 AP', effect: 'Clear all negative statuses from yourself; convert their stack counts to matching positive statuses. See what was always there.' },
      '5': { effect: 'Once per session, when you receive any resource from an ally, the giver receives the same amount back — gratitude multiplies.' }
    }
  },

  dignity: {
    name: 'Dignity', bridge: true,
    alignment: ['humility', 'pride'],
    theme: 'The self that neither puffs up nor diminishes — true worth needs no defense.',
    governing_pool: 'MP',
    requirement_level: reqs(['humility', 2], ['pride', 2]),
    levels: {
      '1': { effect: 'Hold Humility and Pride without conflict. Flow and Concentration stacks each contribute +L to the same checks when both are active.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'You are immune to Suppressed, Humiliated, and Broken. Allies within L×10 ft resist those same effects at +L.' },
      '4': { cost: '2 AP', effect: 'Declare your genuine worth. All allies in L×15 ft gain +L to all checks for L rounds. All enemies make a Resolve check or become Awed for L rounds.' },
      '5': { effect: 'Your stats cannot be reduced by external effects. Mind-altering effects automatically fail against you. Once per session, negate any effect that would change your fundamental nature.' }
    }
  },

  // ── SOLO INITIATES ────────────────────────────────────────────────────────

  chastity_initiate: {
    name: 'Chastity Initiate',
    theme: 'Disciplined mind — the first deepening of clarity into true mental fortitude.',
    governing_pool: 'MP',
    prerequisite: req('chastity', 3),
    levels: {
      '1': { effect: 'Clarity stacks grant an additional +L to MND-based checks. Clarity duration increases by L rounds.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP, L MP', effect: 'Purge one negative mental status from yourself and apply L stacks of Clarity.' },
      '4': { effect: 'While you have 10+ Clarity stacks, your MND is treated as L higher for all checks and abilities.' },
      '5': { effect: 'While Clarity is active, you are immune to compulsion, fear, and confusion. All MP costs are reduced by L (minimum 1).' }
    }
  },

  lust_initiate: {
    name: 'Lust Initiate',
    theme: 'Awakened desire — vital energy sharpened into a tool.',
    governing_pool: 'SP',
    prerequisite: req('lust', 3),
    levels: {
      '1': { effect: 'Invigorate grants an additional +L to SPT-based checks. You gain L bonus SP on a confirmed Hit.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP, L SP', effect: 'Apply L stacks of Invigorate to yourself and one willing target. The target also gains L bonus SP.' },
      '4': { effect: 'When you hit an enemy, siphon L SP from them (they lose it; you gain it).' },
      '5': { effect: 'Once per session, enter a state of pure desire for L rounds. All SPT checks succeed on 1+. Recover L² SP on any kill.' }
    }
  },

  temperance_initiate: {
    name: 'Temperance Initiate',
    theme: 'Measured control — discipline becomes an active defense.',
    governing_pool: 'MP',
    prerequisite: req('temperance', 3),
    levels: {
      '1': { effect: 'Fortify grants +L to all resistance checks. You may spend MP to reduce incoming damage by L per MP spent (decided after rolling).' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'When you would receive a negative status, spend L MP to reduce its duration by L rounds.' },
      '4': { cost: '2 AP, L MP', effect: 'Distribute up to L² MP among allies as HP healing. Each recipient also gains L stacks of Fortify.' },
      '5': { effect: 'Your resource pools cannot be reduced below L² by external effects. With 10+ Fortify stacks, you are immune to mental domination.' }
    }
  },

  gluttony_initiate: {
    name: 'Gluttony Initiate',
    theme: 'Voracious appetite — consumption becomes regeneration.',
    governing_pool: 'SP',
    prerequisite: req('gluttony', 3),
    levels: {
      '1': { effect: 'Regenerate heals +L additional SP per round. You gain the Regenerate status automatically after consuming any item or resource.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP', effect: 'Consume a downed enemy or material within reach. Gain L² SP and L stacks of Regenerate.' },
      '4': { effect: 'Each time you fully consume a resource or finish a Devour, gain L bonus SP and +L to your next attack.' },
      '5': { cost: '2 AP', effect: 'Enter a feeding frenzy for L rounds. Every hit restores L SP; every kill restores L². Area attacks heal L SP per target hit.' }
    }
  },

  charity_initiate: {
    name: 'Charity Initiate',
    theme: 'Giving protection — selfless power fuels those around you.',
    governing_pool: 'MP',
    prerequisite: req('charity', 3),
    levels: {
      '1': { effect: 'Barrier absorbs +L² additional damage. You may transfer L MP to an ally as a free action once per round.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP, L MP', effect: 'Grant up to L allies Barrier (L² HP absorption) for L rounds.' },
      '4': { effect: 'When an ally would drop to 0 HP, spend L MP to negate the killing blow — the ally remains at 1 HP.' },
      '5': { effect: 'All resource transfers from you are doubled. Allies within L×10 ft gain +L to all defenses. Sacrificed resources are half-returned at the start of your next turn.' }
    }
  },

  greed_initiate: {
    name: 'Greed Initiate',
    theme: 'Acquisitive power — accumulation becomes armor.',
    governing_pool: 'SP',
    prerequisite: req('greed', 3),
    levels: {
      '1': { effect: 'Harden grants +L to physical resistance. Each time you gain any resource (item, SP, MP, HP), gain L bonus SP.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP, L SP', effect: 'Attack that steals L MP or SP (your choice) from the target. Apply L stacks of Harden to yourself.' },
      '4': { effect: 'For every 10 SP above your base maximum, gain +1 to all resistance checks (max +L).' },
      '5': { effect: 'You cannot lose more than L² resources per round from enemy effects. Once per session, declare Bankruptcy Reversal — all resources taken from you this session return plus L%.' }
    }
  },

  patience_initiate: {
    name: 'Patience Initiate',
    theme: 'Endurance rewarded — delayed power pays dividends.',
    governing_pool: 'HP',
    prerequisite: req('patience', 3),
    levels: {
      '1': { effect: 'Hasten grants +L to initiative and dodge checks. Each round you refrain from attacking, gain L Endurance stacks (+1 to next attack each).' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'For each consecutive round spent preparing rather than attacking, your next attack deals +L² bonus damage and applies L status stacks of your choice.' },
      '4': { effect: 'Your HP cannot drop below L from any single hit. Automatically stabilize at L HP instead of dying from a single blow.' },
      '5': { effect: 'Patience stacks never expire. At 10+ stacks, incoming damage is halved and your next attack deals stacks×2L bonus damage.' }
    }
  },

  wrath_initiate: {
    name: 'Wrath Initiate',
    theme: 'Explosive force — received pain becomes outgoing destruction.',
    governing_pool: 'HP',
    prerequisite: req('wrath', 3),
    levels: {
      '1': { effect: 'Empower grants +L to all damage rolls. You gain L Empower stacks whenever you take a hit.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: '1 AP', effect: 'Charge up to L×10 ft, dealing L² damage to all enemies in your path and applying L Empower stacks to yourself.' },
      '4': { effect: 'When you drop below 30% HP, all damage dealt doubles and HPR increases by +L². This ends when you return above 50% HP.' },
      '5': { cost: '1 AP', effect: 'Channel pure fury for L rounds — immune to pain and stun. All attacks gain +L² damage. Every kill restores L² HP.' }
    }
  },

  diligence_initiate: {
    name: 'Diligence Initiate',
    theme: 'Focused effort — skill compounds into mastery.',
    governing_pool: 'SP',
    prerequisite: req('diligence', 3),
    levels: {
      '1': { effect: 'Focus/Alert grants +L to all skill checks. While Alert, attempt the same skill check twice and take the better result.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Any task you spend at least 2 consecutive turns focused on receives +L² to the final check.' },
      '4': { effect: 'You may take one additional Craft, Study, or Prepare action per round without spending extra AP.' },
      '5': { effect: 'Alert grants an additional +L to all checks. Once per encounter, declare a Practiced Technique — the ability costs 0 and automatically succeeds.' }
    }
  },

  sloth_initiate: {
    name: 'Sloth Initiate',
    theme: 'Effortless power — economy of action becomes its own strength.',
    governing_pool: 'MP',
    prerequisite: req('sloth', 3),
    levels: {
      '1': { effect: 'Bolstered grants +L to passive defenses. Actions that cost 0 AP deal +L bonus effect.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Each round you spend no AP, recover L² MP and gain L stacks of Bolstered.' },
      '4': { effect: 'Once per round, an ability that costs 2+ AP costs L fewer AP (minimum 0).' },
      '5': { effect: 'All your abilities cost L less AP (minimum 0). When you take 0 actions in a round, gain L passive charges; spend charges to add +L² to any roll.' }
    }
  },

  generosity_initiate: {
    name: 'Generosity Initiate',
    theme: 'Abundant giving — your overflow becomes everyone\'s gain.',
    governing_pool: 'SP',
    prerequisite: req('generosity', 3),
    levels: {
      '1': { effect: 'Inspiration stacks you grant to allies give +L instead of the base bonus. You gain L SP when you grant Inspiration to an ally.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP, L SP', effect: 'Grant L stacks of Inspiration to all allies within L×10 ft.' },
      '4': { effect: 'Allies with Inspiration from you gain +L to all rolls (not just their next check). They may pass their stacks to another ally as a free action.' },
      '5': { effect: 'You produce twice as many Inspiration stacks. Allies under your Inspiration cannot have their SP reduced below L².' }
    }
  },

  envy_initiate: {
    name: 'Envy Initiate',
    theme: 'Sharpened hunger — desire for what others have becomes tactical advantage.',
    governing_pool: 'MP',
    prerequisite: req('envy', 3),
    levels: {
      '1': { effect: 'Ambition stacks double their bonus when targeting someone with higher stats. You sense the stat distribution of any being within L×20 ft.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP', effect: 'Target one enemy. For L rounds, identify their highest stat and copy it as a +L bonus to your checks against them.' },
      '4': { effect: 'For each stat in which an enemy exceeds yours, gain +L to attacks against that specific enemy.' },
      '5': { effect: 'Ambition stacks never expire. With 10+ stacks, copy any ability used by an enemy or ally within L×20 ft and use it once this encounter.' }
    }
  },

  humility_initiate: {
    name: 'Humility Initiate',
    theme: 'Selfless power — by giving yourself away, you become more.',
    governing_pool: 'SP',
    prerequisite: req('humility', 3),
    levels: {
      '1': { effect: 'Flow grants +L to support and reaction checks. You gain Flow stacks when you aid others.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP', effect: 'Transfer your current Flow stacks to an ally. They treat their next check as if they had rolled maximum.' },
      '4': { effect: 'The fewer abilities you\'ve used this encounter, the stronger your remaining ones (+L per unused ability slot, max +L²).' },
      '5': { effect: 'You cannot be targeted by forced-movement, mind-control, or ego effects. All allies count you as having the highest relevant stat for assistance bonuses.' }
    }
  },

  pride_initiate: {
    name: 'Pride Initiate',
    theme: 'Commanding presence — unshakeable self-belief radiates outward.',
    governing_pool: 'MP',
    prerequisite: req('pride', 3),
    levels: {
      '1': { effect: 'Concentration grants +L to all-or-nothing checks. Enemies who witness your victories gain L stacks of Suppressed.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Assert dominance — all enemies within L×15 ft make a Willpower check or become Suppressed for L rounds.' },
      '4': { effect: 'With 5+ Concentration stacks, your abilities cannot be interrupted or countered. Concentration is spent instead of a counter-roll.' },
      '5': { effect: 'You cannot critically fail. With 10+ Concentration stacks, you are immune to charm, submission, and humiliation effects. Once per session, when reduced to 0 HP, remain at 1 HP with L² Concentration stacks.' }
    }
  }

};

// ════════════════════════════════════════════════════════════════════════════
// TIER 3 — 14 Solo Adepts + 7 Bridge Deepenings + 10 Compound States
// ════════════════════════════════════════════════════════════════════════════
const tier3 = {

  // ── SOLO ADEPTS ──────────────────────────────────────────────────────────

  chastity_adept: {
    name: 'Chastity Adept',
    theme: 'Purified form — clarity as a field that extends outward.',
    governing_pool: 'MP',
    prerequisite: req('chastity_initiate', 5),
    levels: {
      '1': { effect: 'Clarity stacks remove one negative status on application. MND is treated as +L higher for Clarity-driven effects.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Negative statuses expire L rounds faster on you. With 15+ Clarity stacks, you are immune to all mental status effects.' },
      '4': { cost: '2 AP', effect: 'Emit pure clarity in a L×15 ft radius. All allies gain 10 Clarity stacks; all negative mental statuses in the area are cleansed.' },
      '5': { effect: 'Clarity never expires on you — you generate L stacks per round automatically. Allies within your aura share half your Clarity stacks.' }
    }
  },

  lust_adept: {
    name: 'Lust Adept',
    theme: 'Mastered desire — vital energy becomes magnetic and transferable.',
    governing_pool: 'SP',
    prerequisite: req('lust_initiate', 5),
    levels: {
      '1': { effect: 'Invigorate stacks grant +L to all SPT-based attacks. Your presence causes enemies to lose L SP per round (vitality drawn toward you).' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Channel overwhelming desire — all enemies within L×15 ft must resist (MND vs your SPT) or lose L AP on their next turn.' },
      '4': { effect: 'Each hit restores L SP from the target. This cannot kill but leaves them weakened.' },
      '5': { effect: 'Your SP cannot drop below L². When at maximum SP, all attacks deal +L² bonus damage and automatically apply Invigorate to allies who witness them.' }
    }
  },

  temperance_adept: {
    name: 'Temperance Adept',
    theme: 'Perfect balance — discipline becomes a gift you share.',
    governing_pool: 'MP',
    prerequisite: req('temperance_initiate', 5),
    levels: {
      '1': { effect: 'Fortify stacks reduce all damage types by L per 2 stacks. You may distribute Fortify stacks to allies within L×15 ft as a reaction.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'You cannot exceed 100 stacks of any status. Instead, excess stacks convert to the opposite beneficial status at L:1 ratio.' },
      '4': { cost: '2 AP', effect: 'Redistribute all status stacks equally among all allies within L×15 ft. This optimization provides +L to all actions for L rounds.' },
      '5': { effect: 'Your stats are always treated as being at their optimal value for any given check. Extreme effects (maximum damage, critical failure) are moderated by L.' }
    }
  },

  gluttony_adept: {
    name: 'Gluttony Adept',
    theme: 'Infinite capacity — consumption becomes transformation.',
    governing_pool: 'SP',
    prerequisite: req('gluttony_initiate', 5),
    levels: {
      '1': { effect: 'Regenerate now also restores L HP per round. Your resource pools expand — excess restoration overflows to adjacent allies.' },
      '2': { effect: 'Max SP +L²; Max HP +L². SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'You can consume any material substance as a standard action, converting it to L² SP restoration. Environmental materials count.' },
      '4': { effect: 'Excess SP and HP restoration converts to Satiated stacks (+L to all checks per 10 stacks, max L×10) rather than being lost.' },
      '5': { effect: 'Regenerate grants L SP and L HP per round. Allies you share meals with outside combat recover L² of all resources.' }
    }
  },

  charity_adept: {
    name: 'Charity Adept',
    theme: 'Sacred giving — protection becomes sacrifice, and sacrifice becomes power.',
    governing_pool: 'MP',
    prerequisite: req('charity_initiate', 5),
    levels: {
      '1': { effect: 'Barrier stacks you apply absorb +L² damage each. You may grant Barrier as a reaction to an incoming hit targeting an ally.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP, L MP', effect: 'Grant one ally an impenetrable barrier absorbing L²×2 damage and lasting L rounds.' },
      '4': { effect: 'You may redirect any damage dealt to an ally within L×20 ft to yourself. Damage redirected this way is halved.' },
      '5': { effect: 'All protection you grant is doubled. You cannot die while an ally is below half HP — you stabilize at 1 HP. Once per session: sacrifice HP to restore allies proportionally.' }
    }
  },

  greed_adept: {
    name: 'Greed Adept',
    theme: 'Masterful acquisition — the hoard becomes a fortress.',
    governing_pool: 'SP',
    prerequisite: req('greed_initiate', 5),
    levels: {
      '1': { effect: 'Harden stacks reduce all damage by L per 2 stacks. You sense resources (items, SP, MP) within L×20 ft.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP', effect: 'Drain L² SP or MP from target. For every L resources drained this encounter, gain +L stacks of Harden until end of session.' },
      '4': { effect: 'Enemies within L×15 ft lose L SP per round passively drawn to you. You may suppress this effect.' },
      '5': { effect: 'Your Harden cannot be stripped. For every 50 SP above maximum you hold, gain L damage reduction. Resources stolen by enemies are automatically returned within L rounds.' }
    }
  },

  patience_adept: {
    name: 'Patience Adept',
    theme: 'Absolute endurance — the mountain does not hurry.',
    governing_pool: 'HP',
    prerequisite: req('patience_initiate', 5),
    levels: {
      '1': { effect: 'Hasten grants +L to all movement and reaction checks. You gain L Endurance per round automatically in combat.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'You may hold your action indefinitely. When you finally strike, deal L bonus damage per round held (max L×5).' },
      '4': { effect: 'HP reduction effects are halved. For every round you do not attack aggressively, gain +L to MND and SPT checks.' },
      '5': { effect: 'Effects that force immediate action automatically fail against you. When you finally strike, enemies make a Fortitude check vs your HP max or are Stunned for L rounds.' }
    }
  },

  wrath_adept: {
    name: 'Wrath Adept',
    theme: 'Righteous fury — unstoppable force, escalating momentum.',
    governing_pool: 'HP',
    prerequisite: req('wrath_initiate', 5),
    levels: {
      '1': { effect: 'Empower grants +L to all attack types. You gain L² HP when you reduce an enemy to 0 HP.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'If an attack reduces an enemy below 30% HP without killing them, you may immediately make a free follow-up attack.' },
      '4': { cost: '2 AP', effect: 'Enter a sustained frenzy for L rounds — all attacks hit, damage increases by L², and status effects cannot stop you.' },
      '5': { effect: 'Your presence deals L psychic damage to enemies each round. Empower stacks cannot be removed. At max HP, all your attacks are critical hits.' }
    }
  },

  diligence_adept: {
    name: 'Diligence Adept',
    theme: 'Refined expertise — repetition elevates craft into art.',
    governing_pool: 'SP',
    prerequisite: req('diligence_initiate', 5),
    levels: {
      '1': { effect: 'Alert grants +L² to skill checks. You may attempt L+1 actions per AP period.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Any ability used 3+ times in an encounter has its cost reduced by L and its effect increased by +L.' },
      '4': { effect: 'You cannot be Exhausted or Dazed. Your SP never drops below L² while in combat.' },
      '5': { effect: 'Non-combat actions take half the normal time. Combat abilities used 5+ times in an encounter automatically crit.' }
    }
  },

  sloth_adept: {
    name: 'Sloth Adept',
    theme: 'Mastered ease — stillness becomes the most potent force in the room.',
    governing_pool: 'MP',
    prerequisite: req('sloth_initiate', 5),
    levels: {
      '1': { effect: 'Bolstered stacks reduce damage from any source by L. Being inactive is never treated as a weakness.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Enemies who attack you suffer L SP drain per hit — the effort of striking you costs them.' },
      '4': { effect: 'Your highest-tier ability costs 0 AP once per round. Abilities used while stationary deal +L² bonus effect.' },
      '5': { effect: 'You recover L² MP per round without taking actions. Your passive defenses equal your active defenses. Once per session, your stillness resolves a conflict without combat.' }
    }
  },

  generosity_adept: {
    name: 'Generosity Adept',
    theme: 'Overflow abundance — your giving creates a tide that lifts all.',
    governing_pool: 'SP',
    prerequisite: req('generosity_initiate', 5),
    levels: {
      '1': { effect: 'Inspiration stacks persist L rounds longer. When you inspire an ally, you both recover L SP.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Release all current Inspiration stacks in a burst — all allies within L×20 ft receive L stacks each plus L² SP.' },
      '4': { effect: 'When any ally recovers SP, you recover half that amount as well. Any resource above your maximum is automatically distributed to the lowest ally.' },
      '5': { effect: 'You generate L Inspiration stacks per round for free distribution. SP regeneration benefits all allies within L×15 ft equally. You cannot drop below L SP while any ally has positive SP.' }
    }
  },

  envy_adept: {
    name: 'Envy Adept',
    theme: 'Consuming hunger — the wanting becomes the weapon.',
    governing_pool: 'MP',
    prerequisite: req('envy_initiate', 5),
    levels: {
      '1': { effect: 'Ambition stacks double their bonus against targets with higher stats. You can perceive the exact stat distribution of any being within L×30 ft.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '1 AP', effect: 'Target one enemy. For L rounds, copy their highest passive bonus and apply it to yourself. They are aware this is happening.' },
      '4': { effect: 'Each time an enemy uses an ability that exceeds your current power, you gain a copy of its passive effect for the remainder of the encounter.' },
      '5': { effect: 'With 20+ Ambition stacks, your stats equal the highest stat values of any enemy in the encounter. These stats persist until end of session.' }
    }
  },

  humility_adept: {
    name: 'Humility Adept',
    theme: 'Profound selflessness — invisible strength that cannot be measured or broken.',
    governing_pool: 'SP',
    prerequisite: req('humility_initiate', 5),
    levels: {
      '1': { effect: 'Flow stacks make your presence imperceptible as a threat — enemies do not target you unless you are the only option or you attack.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Your power is immeasurable by external observation. Ability checks made against you reveal no information about your capabilities.' },
      '4': { effect: 'All assistance bonuses you provide are doubled. You may take any ally\'s turn using your stats (with their permission).' },
      '5': { effect: 'All incoming effects targeting your stats or resources are halved. Allies you support with Flow treat their critical failures as successes.' }
    }
  },

  pride_adept: {
    name: 'Pride Adept',
    theme: 'Unassailable ego — divine confidence that commands the battlefield.',
    governing_pool: 'MP',
    prerequisite: req('pride_initiate', 5),
    levels: {
      '1': { effect: 'Concentration stacks cannot be removed by enemy effects. Enemies suffer -L to checks made against you.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Your base stats cannot be reduced by any external effect. You have complete awareness of all enemy stat totals.' },
      '4': { cost: '2 AP', effect: 'Declare your supremacy — all enemies within L×20 ft make a Resolve check or become Intimidated for L rounds, granting you +L to all rolls against them.' },
      '5': { effect: 'You always know if an effect will fail before attempting it. Your stats are treated as L higher for all defensive purposes. Once per session, succeed on any single check automatically.' }
    }
  },

  // ── BRIDGE DEEPENINGS ─────────────────────────────────────────────────────

  acceptance: {
    name: 'Acceptance', bridge: true,
    theme: 'Loss fully received — grief that becomes peace, pain that becomes clarity.',
    governing_pool: 'HP',
    prerequisite: req('loss', 3),
    levels: {
      '1': { effect: 'Loss is recognized as part of the cycle. Losing HP, SP, or MP triggers L recovery at the start of your next turn.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'Negative statuses last L rounds shorter on you. A damaging effect that would reduce you by 20+ HP is accepted and L% redirected as healing.' },
      '4': { cost: '2 AP', effect: 'Enter complete acceptance for L rounds — immune to movement and disruption, incoming damage is halved, and all HP lost heals allies within L×15 ft.' },
      '5': { effect: 'You cannot die from sudden damage. Any blow that would kill you reduces you to L HP instead. Once per session, make any die result the value you choose.' }
    }
  },

  metamorphosis: {
    name: 'Metamorphosis', bridge: true,
    theme: 'Change fully embraced — the self that transforms is no self at all.',
    governing_pool: 'SP',
    prerequisite: req('change', 3),
    levels: {
      '1': { effect: 'After receiving any damage type for the first time in an encounter, gain L resistance to that type for the remainder of the encounter.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Undergo profound change — reset all negative statuses and redistribute stat points optimally for current challenges (GM adjudicates) for L rounds.' },
      '4': { effect: 'You do not have a fixed true form. Gain L resistance to all damage types as your form continuously adapts.' },
      '5': { effect: 'Ability costs are reduced by L as you perfectly fit your approach to each moment. You cannot be permanently altered by any external effect — change is yours alone.' }
    }
  },

  liberation: {
    name: 'Liberation', bridge: true,
    theme: 'Detachment perfected — freedom from both attachment and its absence.',
    governing_pool: 'MP',
    prerequisite: req('detachment', 3),
    levels: {
      '1': { effect: 'Freed from both attachment and emptiness, you act without hesitation. Reaction speed is +L. You cannot be held, bound, or paralyzed.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'All movement restrictions on you are removed at the start of each turn. You may pass through difficult terrain and non-magical barriers freely.' },
      '4': { cost: '2 AP', effect: 'Transcend physical and emotional constraints for L rounds — immune to all status effects. Deal L² untyped damage to anything that attempts to contain or bind you.' },
      '5': { effect: 'You exist beyond categorization. Once per encounter, choose to exist outside the conflict entirely for L rounds — untouchable and non-threatening to all.' }
    }
  },

  devotion: {
    name: 'Devotion', bridge: true,
    theme: 'Love matured — the force that gives everything for a chosen purpose.',
    governing_pool: 'MP',
    prerequisite: req('love', 3),
    levels: {
      '1': { effect: 'Gain L bonus effect on any action taken on behalf of a declared beloved person or cause.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Willingly taking damage or loss on behalf of another grants you L² restoration and L rounds of Empower.' },
      '4': { cost: '2 AP', effect: 'Designate a Devotion target (lasts until end of session). You and that target share healing — any healing to one heals the other for L%. You may redirect damage to yourself at will.' },
      '5': { effect: 'All abilities benefiting your Devotion target have doubled effect. If your target is reduced to 0 HP, you have L rounds of Berserker immunity to reach them and restore them.' }
    }
  },

  wisdom: {
    name: 'Wisdom', bridge: true,
    theme: 'Discovery matured — effort and understanding become one weapon.',
    governing_pool: 'SP',
    prerequisite: req('discovery', 3),
    levels: {
      '1': { effect: 'For each unique enemy type defeated this session, gain +L to all rolls.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'On the second round of any encounter, you intuit enemy weaknesses. Attacks against identified weaknesses deal +L² bonus damage.' },
      '4': { cost: '2 AP', effect: 'Combine effort and understanding — your next attack deals L²×(rounds analyzed) damage, where analyzed means rounds spent observing rather than attacking.' },
      '5': { effect: 'Your highest attack stat and your highest mental stat are treated as equal — use whichever is higher. Critical hits grant L rounds of comprehensive situational awareness.' }
    }
  },

  abundance: {
    name: 'Abundance', bridge: true,
    theme: 'Gratitude perfected — the gap between giving and wanting dissolves.',
    governing_pool: 'SP',
    prerequisite: req('gratitude', 3),
    levels: {
      '1': { effect: 'The gap between giving and wanting dissolves. Gain L² SP at the start of each encounter.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'When your SP exceeds maximum, the overflow becomes freely distributable MP or HP rather than being lost.' },
      '4': { cost: '2 AP', effect: 'Create a field of abundance in L×20 ft for L rounds. All allies recover L² SP per round. All enemies suffer L SP drain per round.' },
      '5': { effect: 'You cannot be made to experience scarcity. When you give resources away, both you and the recipient receive L% extra. Ambition in others transforms to Inspiration in your presence.' }
    }
  },

  sovereignty: {
    name: 'Sovereignty', bridge: true,
    theme: 'Dignity matured — self-determination that commands through truth, not force.',
    governing_pool: 'MP',
    prerequisite: req('dignity', 3),
    levels: {
      '1': { effect: 'No external effect can define your actions or worth. Gain +L to all Resolve checks. Sovereignty cannot be suppressed or compelled.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'You establish L×15 ft as your sovereign domain. Within it, your defenses are doubled and allies gain +L to all checks.' },
      '4': { cost: '2 AP', effect: 'Assert sovereignty — all enemies within L×20 ft must submit (fail a Resolve check vs your SPT+MND) or cannot take aggressive actions for L rounds.' },
      '5': { effect: 'Your mere existence deals L psychic damage per round to those who attempt to subjugate you. Once per session, your will overrides any effect that would alter your fundamental being.' }
    }
  },

  // ── COMPOUND STATES ───────────────────────────────────────────────────────

  compassion: {
    name: 'Compassion',
    theme: 'To suffer with another — empathy that absorbs pain and transforms it into protection.',
    governing_pool: 'HP',
    prerequisite: reqs(['charity_initiate', 3], ['patience_initiate', 3]),
    levels: {
      '1': { effect: 'When an ally takes damage, you gain L Endurance stacks but also take L unmitigated empathic damage (emotional resonance).' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: 'Reaction', effect: 'When an ally within L×20 ft takes damage, absorb L of it yourself and grant them L stacks of Hasten.' },
      '4': { effect: 'Damage absorbed on behalf of others is reduced to 50%. The absorbed suffering heals allies within L×10 ft for the same amount.' },
      '5': { effect: 'You cannot be Feared or Broken while allies are present. Each HP sacrificed for others grants L permanent Endurance until end of session. Allies beside you regenerate +L HP per round.' }
    }
  },

  valor: {
    name: 'Valor',
    theme: 'Disciplined courage — effort and fury fused into heroic resolve.',
    governing_pool: 'HP',
    prerequisite: reqs(['diligence_initiate', 3], ['wrath_initiate', 3]),
    levels: {
      '1': { effect: 'Effort and anger are unified. All attacks gain +L and treat all enemies as Weakened.' },
      '2': { effect: 'Max HP +L²; Max SP +L². HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: '2 AP', effect: 'Heroic Charge — move up to L×15 ft, striking all enemies in path for L² damage. Allies who witness this gain L stacks of Empower.' },
      '4': { effect: 'When fighting outnumbered or against a superior enemy, gain +L to all rolls per enemy that outclasses you.' },
      '5': { effect: 'Enemies with lower HP maximum suffer -L to attacks against you (your endurance intimidates them). Your critical hits grant allies L² HP restoration.' }
    }
  },

  obsession: {
    name: 'Obsession',
    theme: 'All-consuming fixation — desire sharpened to a single devastating point.',
    governing_pool: 'SP',
    prerequisite: reqs(['lust_initiate', 3], ['envy_initiate', 3]),
    levels: {
      '1': { effect: 'Designate one Obsession target. Against them, all checks are made at +L². Against all others, -L.' },
      '2': { effect: 'Max SP +L²; Max MP +L². SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Your Obsession target cannot Hide, Flee, or Vanish from your awareness regardless of any effect.' },
      '4': { effect: 'While your Obsession target lives, you cannot be killed — stabilize at 1 HP. When they are resolved, lose L² of all resources in grief or release.' },
      '5': { effect: 'Against your Obsession target, your level is treated as 5 higher and all abilities automatically succeed. If they become an ally, transfer the bond — both gain +L² against any shared enemy.' }
    }
  },

  tyranny: {
    name: 'Tyranny',
    theme: 'Domination through force and ego — the dark unity of pride and wrath.',
    governing_pool: 'HP',
    prerequisite: reqs(['pride_initiate', 3], ['wrath_initiate', 3]),
    levels: {
      '1': { effect: 'Enemies who witness you deliver a killing blow must make a Resolve check or become Cowering for L rounds.' },
      '2': { effect: 'Max HP +L²; Max MP +L². HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: '2 AP', effect: 'Assert total dominance — all enemies within L×20 ft make a Resolve check vs your HP maximum or become Suppressed for L rounds. Suppressed enemies cannot use abilities above T2.' },
      '4': { effect: 'Suppressed enemies deal -L damage and -L to all checks. Each Suppressed enemy within range generates +L Concentration stacks for you per round.' },
      '5': { effect: 'In your domain (L×25 ft), all effects resolve in your favor first. Suppressed enemies cannot act against you. Your commands count as abilities against those who fail their Resolve check.' }
    }
  },

  avarice: {
    name: 'Avarice',
    theme: 'Boundless hunger — desire and greed merged into pure acquisitive force.',
    governing_pool: 'SP',
    prerequisite: reqs(['greed_initiate', 3], ['envy_initiate', 3]),
    levels: {
      '1': { effect: 'Each resource you hold above normal maximum grants +L to your next roll (stacks additively, max +L²).' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Each round, automatically drain L SP from the lowest-resource enemy within L×15 ft.' },
      '4': { effect: 'Your SP maximum increases by L for each resource type you hold above normal maximum — the ceiling rises with your hunger.' },
      '5': { effect: 'You cannot run out of SP while any enemies exist (you drain passively to sustain yourself). All ability costs are halved. Enemies with fewer resources than you are Frightened by your presence.' }
    }
  },

  spite: {
    name: 'Spite',
    theme: 'Vindictive malice — envy sharpened by wrath into a weapon of pure resentment.',
    governing_pool: 'HP',
    prerequisite: reqs(['wrath_initiate', 3], ['envy_initiate', 3]),
    levels: {
      '1': { effect: 'When you take damage or a negative status, gain L Ambition stacks and L Empower stacks — pain becomes purpose.' },
      '2': { effect: 'Max HP +L²; Max MP +L². HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: '1 AP', effect: 'Vengeful Strike — deals L²×(damage taken this encounter / 10, rounded up) bonus damage. Each use marks this enemy for +L future damage.' },
      '4': { effect: 'Enemies who have damaged you suffer -L to all checks as you radiate focused hatred toward them specifically.' },
      '5': { effect: 'All damage dealt to enemies who have harmed you is doubled. You cannot be killed by the same enemy twice — stabilize at 1 HP for the first killing blow from each enemy. Your spite outlasts your wounds.' }
    }
  },

  passion: {
    name: 'Passion',
    theme: 'Intense emotional force — desire and fury merged into transcendent expression.',
    governing_pool: 'SP',
    prerequisite: reqs(['lust_initiate', 3], ['wrath_initiate', 3]),
    levels: {
      '1': { effect: 'Emotions are a furnace. All abilities cost +L AP but deal +L² effect — the intensity is everything.' },
      '2': { effect: 'Max SP +L²; Max HP +L². SPR and HPR each +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Release all held passion in an explosion of energy — deal L² to all enemies in L×15 ft and heal all allies in range for the same amount.' },
      '4': { effect: 'While Invigorate and Empower stacks are simultaneously active, all abilities deal +L² damage and effect.' },
      '5': { effect: 'Passion cannot be extinguished. Status effects that would reduce your SP or HP convert to Invigorate or Empower stacks instead. Allies who witness your passion gain L stacks of both.' }
    }
  },

  grace: {
    name: 'Grace',
    theme: 'Effortless beauty — humility and generosity merged into elegant selflessness.',
    governing_pool: 'SP',
    prerequisite: reqs(['humility_initiate', 3], ['generosity_initiate', 3]),
    levels: {
      '1': { effect: 'Your actions are naturally beautiful. All skill checks involving expression, movement, or interaction gain +L.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: 'Reaction', effect: 'Move up to L×10 ft without provoking opportunity attacks and redirect one attack from an ally to yourself at half damage.' },
      '4': { effect: 'All allies within L×15 ft gain +L to all checks as your graceful presence uplifts them. Your own attacks are so elegant they do not trigger defensive reactions.' },
      '5': { effect: 'You cannot be struck by area effects — you simply are not where they are. Single-target attacks against you miss on any result below L×2. Your very existence is an act of generosity.' }
    }
  },

  melancholy: {
    name: 'Melancholy',
    theme: 'Profound sorrow as depth — stillness and endurance become the wisdom of impermanence.',
    governing_pool: 'MP',
    prerequisite: reqs(['sloth_initiate', 3], ['patience_initiate', 3]),
    levels: {
      '1': { effect: 'Sorrow gives you depth. MND is treated as +L higher for all checks involving understanding, discernment, or arcane sight.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'You cannot be Surprised or caught unaware. Your awareness of impermanence grants +L to all defensive checks.' },
      '4': { cost: '2 AP', effect: 'Channel profound sorrow into understanding — gain comprehensive knowledge of one enemy\'s weaknesses and motivations. Against them, all checks are +L² for L rounds.' },
      '5': { effect: 'When allies fall, gain L² MP as grief fuels power. When victory is achieved, the cost is remembered — MP cannot drop below L² in meaningful encounters.' }
    }
  },

  sacrifice: {
    name: 'Sacrifice',
    theme: 'Willing self-diminishment — the gift that costs you more than it appears.',
    governing_pool: 'HP',
    prerequisite: reqs(['charity_adept', 1], ['humility_initiate', 3]),
    levels: {
      '1': { effect: 'When you willingly spend resources for another, the transfer includes +L bonus (they receive more than you lose).' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'When you sacrifice HP on another\'s behalf, the HP is returned to you at the start of your next turn (maximum L² HP per round this way).' },
      '4': { cost: '2 AP', effect: 'Sacrifice up to L² of your current stat values. For each point sacrificed, an ally gains L×that amount as a bonus for L rounds.' },
      '5': { effect: 'Nothing you give is truly lost. Resources sacrificed for others are returned doubled at end of encounter. Once per session: drop to 1 in all stats for L rounds to grant one ally temporary godlike power (+L×5 to all stats).' }
    }
  }

};

// ════════════════════════════════════════════════════════════════════════════
// TIER 4 — 14 Solo Masters + 5 Near-Transcendent Compound States
// ════════════════════════════════════════════════════════════════════════════
const tier4 = {

  // ── SOLO MASTERS ─────────────────────────────────────────────────────────

  chastity_master: {
    name: 'Chastity Master',
    theme: 'Purified existence — the self as living clarity, corruption cannot approach.',
    governing_pool: 'MP',
    prerequisite: req('chastity_adept', 3),
    levels: {
      '1': { effect: 'Clarity is your natural state. You generate L² Clarity stacks per round automatically. You are immune to all compulsion effects.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Clarity extends outward — enemies within L×15 ft lose L stacks of any beneficial status per round in your presence.' },
      '4': { cost: '2 AP', effect: 'Enter perfect mental clarity for L rounds. All abilities cost 0 MP. All mental effects from you deal L² bonus effect. Immune to all emotional and mental damage.' },
      '5': { effect: 'Negative statuses cannot accumulate on you — any applied immediately lose L stacks. Your presence purifies all mental status effects from allies within L×20 ft.' }
    }
  },

  lust_master: {
    name: 'Lust Master',
    theme: 'Life-force mastery — vital energy at its absolute apex.',
    governing_pool: 'SP',
    prerequisite: req('lust_adept', 3),
    levels: {
      '1': { effect: 'Invigorate is permanently active at L stacks. Your presence invigorates all nearby beings — allies and enemies alike gain +L SP per round near you.' },
      '2': { effect: 'Max SP +L²; SPR +L. SP overflow heals HP at 2:1 ratio.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Allies near you cannot be reduced below L SP. Your attacks that drain SP heal you for double the amount drained.' },
      '4': { cost: '2 AP', effect: 'Unleash complete life-force expression — all beings in L×20 ft have their SP doubled for L rounds. Enemies have this SP drained to you instead.' },
      '5': { effect: 'SP cannot be reduced to 0 in your presence. Your touch or strike restores L² SP to allies or drains L² SP from enemies. Death effects fail within L×10 ft of you.' }
    }
  },

  temperance_master: {
    name: 'Temperance Master',
    theme: 'Perfect balance — the fulcrum of all extremes.',
    governing_pool: 'MP',
    prerequisite: req('temperance_adept', 3),
    levels: {
      '1': { effect: 'Fortify is permanently active at L stacks. Emotional manipulation and environmental hazards have no effect on you.' },
      '2': { effect: 'Max MP +L²; MPR +L. All damage received is automatically reduced to the median of its range.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Extreme effects (critical hits, catastrophic failures) revert to average outcomes within your presence (L×15 ft).' },
      '4': { cost: '2 AP', effect: 'Enter complete balance for L rounds — all stats treated as equal and at maximum value, resource costs average to 1 AP for all abilities.' },
      '5': { effect: 'Critical hits against you become normal hits. Critical failures by you become normal failures. Once per session, balance any single extreme outcome in the encounter — for allies or enemies.' }
    }
  },

  gluttony_master: {
    name: 'Gluttony Master',
    theme: 'Infinite capacity — the self as a living void that consumes and transforms everything.',
    governing_pool: 'SP',
    prerequisite: req('gluttony_adept', 3),
    levels: {
      '1': { effect: 'You sustain yourself on any energy type. Regenerate grants HP and SP simultaneously.' },
      '2': { effect: 'Max SP +L²; Max HP +L². Both regens +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Each round, drain L of every resource type from every enemy within L×15 ft. These can be held above your maximums indefinitely.' },
      '4': { cost: '2 AP', effect: 'Consume the energy of the battlefield itself — drain L² from all enemies and L² from all environmental energy within L×20 ft, then heal all allies for L% of total drained.' },
      '5': { effect: 'Your capacity is literally infinite. You cannot be emptied. All incoming effects that would reduce your resources are halved, then transferred to you as restoration.' }
    }
  },

  charity_master: {
    name: 'Charity Master',
    theme: 'Divine benevolence — protection that borders on the sacred.',
    governing_pool: 'MP',
    prerequisite: req('charity_adept', 3),
    levels: {
      '1': { effect: 'Barrier is permanent on all allies within L×10 ft (refreshes each round). When your Barrier absorbs an entire attack, the attacker takes L² reflected damage.' },
      '2': { effect: 'Max MP +L²; MPR +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Your protection extends to the spirit — allies cannot be reduced to 0 HP by a single attack while within L×15 ft of you.' },
      '4': { cost: '2 AP', effect: 'Pour your essence into protection — for L rounds, all damage dealt to allies within L×20 ft comes to you instead, halved. You cannot be killed during this period.' },
      '5': { effect: 'Allies you protect are immune to death effects. When you would die, if any ally has taken damage this encounter, you remain at 1 HP instead. Once per session: restore all allies to full HP.' }
    }
  },

  greed_master: {
    name: 'Greed Master',
    theme: 'Total acquisition — wealth beyond measure, secured forever.',
    governing_pool: 'SP',
    prerequisite: req('greed_adept', 3),
    levels: {
      '1': { effect: 'Harden is permanent at L stacks. All resources you hold are magically secured — they cannot be drained, stolen, or destroyed.' },
      '2': { effect: 'Max SP +L²; SPR +L. Allies within L×10 ft gain +L SP per round from proximity to your wealth aura.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'At the start of each encounter, your SP is automatically at maximum. All SP and MP held by enemies above their base is accessible to you as a secondary pool.' },
      '4': { cost: '2 AP', effect: 'Transform L² of your SP into permanent stat bonuses until end of session (+1 per 10 SP spent, distributed freely among your stats).' },
      '5': { effect: 'Your SP pool has no functional maximum. You accumulate L SP per round passively. SP stolen by enemies returns to you within L rounds.' }
    }
  },

  patience_master: {
    name: 'Patience Master',
    theme: 'Absolute endurance — what the mountain will do is inevitable.',
    governing_pool: 'HP',
    prerequisite: req('patience_adept', 3),
    levels: {
      '1': { effect: 'Hasten is permanent at L stacks. Your HP cannot drop below L% of maximum from any single attack.' },
      '2': { effect: 'Max HP +L²; HPR +L.', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'You declare your intended action for next round immediately — it happens regardless of any enemy interference or interruption.' },
      '4': { cost: '2 AP', effect: 'Declare a target outcome. For L rounds, nothing can prevent this outcome — it automatically succeeds at the end of the duration.' },
      '5': { effect: 'Abilities you begin casting cannot be interrupted. Your maximum HP is treated as your actual HP for all defensive calculations — the mountain\'s size is its defense.' }
    }
  },

  wrath_master: {
    name: 'Wrath Master',
    theme: 'Unstoppable destruction — wrath elevated to a force of nature.',
    governing_pool: 'HP',
    prerequisite: req('wrath_adept', 3),
    levels: {
      '1': { effect: 'Empower is permanent at L stacks. Enemies who have faced you before are Frightened on sight.' },
      '2': { effect: 'Max HP +L²; HPR +L. Each hit you deal adds L permanent Empower stacks (until end of session).', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'Your attacks cannot be parried, blocked, or reduced by defensive abilities — only raw HP stands between your strikes and death.' },
      '4': { cost: '2 AP', effect: 'Unleash righteous destruction for L rounds — double all damage dealt, all attacks are automatic hits, area abilities cost 0 AP.' },
      '5': { effect: 'Your anger is a force of nature — enemies without Empower stacks take +L² extra damage from you. Killing blows release a shockwave dealing L² damage to all enemies within L×10 ft.' }
    }
  },

  diligence_master: {
    name: 'Diligence Master',
    theme: 'Perfect craft — everything you do is at the edge of what is possible.',
    governing_pool: 'SP',
    prerequisite: req('diligence_adept', 3),
    levels: {
      '1': { effect: 'Alert is permanent at maximum stacks. You can perfectly replicate any ability you have observed L or more times this session.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Any extended task (5+ rounds) automatically succeeds at the highest possible outcome with L% improvement on top.' },
      '4': { cost: '2 AP', effect: 'Declare a Masterwork Action requiring L rounds to complete — upon completion, the effect is L²× more powerful than any normal version.' },
      '5': { effect: 'Everything you do is masterwork. Ability effects are maximized. All checks succeed on 1+. Once per session, declare any action a Grand Masterwork — it achieves its theoretical maximum effect.' }
    }
  },

  sloth_master: {
    name: 'Sloth Master',
    theme: 'Complete economy — stillness as supreme authority.',
    governing_pool: 'MP',
    prerequisite: req('sloth_adept', 3),
    levels: {
      '1': { effect: 'Bolstered is permanent at L stacks. You need 0 AP to maintain concentration or sustain ongoing effects.' },
      '2': { effect: 'Max MP +L²; MPR +L. Your natural recovery rate triples while inactive for 1 round.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'All abilities costing 2+ AP cost L fewer AP. Your passive defenses equal your maximum active defenses.' },
      '4': { cost: '2 AP', effect: 'Enter total conservation mode for L rounds — 0 AP cost for all actions, all defenses maximize, stillness is complete power.' },
      '5': { effect: 'You recover L² MP per round. Enemies suffer -L to all checks in your presence. Allies recover L HP/SP per round from your calming aura. Once per session, your stillness ends an encounter — nothing more needs to happen.' }
    }
  },

  generosity_master: {
    name: 'Generosity Master',
    theme: 'Infinite abundance — the source that gives more than it has.',
    governing_pool: 'SP',
    prerequisite: req('generosity_adept', 3),
    levels: {
      '1': { effect: 'Inspiration is permanent at L stacks for all allies within L×15 ft. Your abundance is endless.' },
      '2': { effect: 'Max SP +L²; SPR +L. All resources you distribute are doubled — you give more than you have.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'You can give resources you don\'t possess — go negative on SP and MP to benefit allies. Debt is forgiven at encounter\'s end.' },
      '4': { cost: '2 AP', effect: 'Create an abundance field in L×25 ft for L rounds. All allies recover L² SP per round and treat all resources as unlimited.' },
      '5': { effect: 'You are a living wellspring. Resources are infinite within your presence. Allies with you cannot run out of SP. All SP given to allies returns to you at the start of your next round.' }
    }
  },

  envy_master: {
    name: 'Envy Master',
    theme: 'Complete understanding of lack — the wanting has consumed all limitation.',
    governing_pool: 'MP',
    prerequisite: req('envy_adept', 3),
    levels: {
      '1': { effect: 'Ambition stacks grow whenever any being within L×40 ft succeeds at anything. You have perfect awareness of all stats and abilities in range.' },
      '2': { effect: 'Max MP +L²; MPR +L. Each 5 Ambition stacks grants +1 to all your stats permanently until end of session.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Any being with something you don\'t have grants +L² attack bonus against them — the wanting is power made real.' },
      '4': { cost: '2 AP', effect: 'Identify and copy the highest ability of any L beings within range. These copies function at your level and last until end of session.' },
      '5': { effect: 'You are now the object of envy — all beings feel the pull toward you. Enemies lose L to all checks near you. Once per session: become everything you have envied — temporarily gain all abilities you have observed this session.' }
    }
  },

  humility_master: {
    name: 'Humility Master',
    theme: 'Complete self-transcendence — the empty vessel that holds everything.',
    governing_pool: 'SP',
    prerequisite: req('humility_adept', 3),
    levels: {
      '1': { effect: 'Flow is permanent at L stacks. Others\' strengths flow through you — you are the conduit for all power.' },
      '2': { effect: 'Max SP +L²; SPR +L.', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { effect: 'Your presence increases all ally stats by L. Your own stats appear as 1 — yet all checks succeed because the universe acts through you.' },
      '4': { cost: '2 AP', effect: 'For L rounds, completely efface yourself — multiply all ally stats by L instead of your own. Enemies cannot perceive you as a target.' },
      '5': { effect: 'By having nothing, you are everything. You cannot be reduced below 1 in any stat. Your support grants allies +L² to all checks. When enemies attempt to diminish you, they fail and take L damage.' }
    }
  },

  pride_master: {
    name: 'Pride Master',
    theme: 'Supreme self-actualization — the self as an undeniable statement of reality.',
    governing_pool: 'MP',
    prerequisite: req('pride_adept', 3),
    levels: {
      '1': { effect: 'Concentration is permanent at L stacks. All beings within L×30 ft are aware of your reputation and deeds.' },
      '2': { effect: 'Max MP +L²; MPR +L. Enemies suffer -L to all checks against you.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Declare your absolute superiority — all enemies within L×25 ft make a Resolve check (DC = your level × 5) or become Awed for L rounds. Awed enemies cannot target you directly.' },
      '4': { effect: 'Your existence is a statement. All checks against your stats automatically resolve in your favor. All plots against you reveal themselves within L rounds.' },
      '5': { effect: 'Your stats are treated as 5 higher. You cannot fail. Once per session, your presence alone resolves a conflict — your reputation and will are sufficient.' }
    }
  },

  // ── NEAR-TRANSCENDENT COMPOUND STATES ────────────────────────────────────

  catharsis: {
    name: 'Catharsis',
    theme: 'The profound release that follows total emotional expression — the great clearing before transcendence.',
    governing_pool: 'MP',
    prerequisite: { type: 'compound_states', note: 'Any two T3 compound states at L3 or higher.' },
    levels: {
      '1': { effect: 'You have experienced the fullness of emotional depth. Your L² most recent emotional status stacks serve as fuel for all abilities.' },
      '2': { effect: 'Max MP +L²; Max SP +L²; Max HP +L². All regens +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Total Release — purge all status stacks (positive and negative) from yourself. Convert their total to L²× bonus damage on your next action and full resource restoration.' },
      '4': { effect: 'Negative statuses on you automatically convert to equivalent positive statuses at the rate of L per round.' },
      '5': { cost: 'Once per session', effect: 'The Great Clearing — release the full emotional weight of this session. Deal damage equal to all HP lost this session to all enemies within L×30 ft. Restore all allies to full HP. Enter the next encounter with all pools at maximum.' }
    }
  },

  dominion: {
    name: 'Dominion',
    theme: 'Complete emotional mastery — directing any emotional current like a river.',
    governing_pool: 'MP',
    prerequisite: { type: 'compound_states', note: 'Tyranny L3 and Sovereignty L3.' },
    levels: {
      '1': { effect: 'Emotional currents are visible to you and manipulable. You can see, intensify, or dampen any emotional state within L×20 ft.' },
      '2': { effect: 'Max MP +L²; Max SP +L². MPR and SPR each +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Restructure the emotional landscape of L×25 ft for L rounds — choose whether the area intensifies or dampens all emotional states, and by how much.' },
      '4': { cost: '2 AP', effect: 'Force the emotional state of all beings within L×20 ft to a chosen emotion for L rounds. They experience this authentically — it is not illusion.' },
      '5': { cost: 'Once per session', effect: 'Rewrite the emotional history of an encounter — all NPCs and enemies re-evaluate their motivations based on the emotion you instill.' }
    }
  },

  synthesis: {
    name: 'Synthesis',
    theme: 'The unification of opposites — virtue and vice recognized as aspects of a single truth.',
    governing_pool: 'MP',
    prerequisite: { type: 'bridge_mastery', note: 'Any T3 bridge deepening at L4 and any T3 compound state at L4.' },
    levels: {
      '1': { effect: 'You perceive the unity underlying apparent opposites. Virtues and vices no longer conflict within you — they complement.' },
      '2': { effect: 'Max MP +L²; Max SP +L²; Max HP +L². All regens +L.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Choose any two opposing virtues/vices you hold. Their status effects stack together for doubled benefit as long as you hold both.' },
      '4': { cost: '2 AP', effect: 'Harmonic Convergence — for L rounds, all your abilities draw from unified emotional truth. Effect of all abilities is doubled; resource costs halved.' },
      '5': { effect: 'You contain all emotional truth. Gain the benefits of all L1 emotional statuses simultaneously at L stacks each, refreshed each round (Clarity, Invigorate, Fortify, Regenerate, Barrier, Harden, Hasten, Empower, Focus, Bolstered, Ambition, Flow, Inspiration, Concentration).' }
    }
  },

  enlightenment: {
    name: 'Enlightenment',
    theme: 'Clear perception of emotional truth — the stillness from which transcendence becomes possible.',
    governing_pool: 'MP',
    prerequisite: { type: 'solo_mastery', note: 'Any two different T3 solo adepts at L5.' },
    levels: {
      '1': { effect: 'Your emotional clarity extends to metaphysical perception. You sense the emotional state of all beings within L×30 ft without any detection.' },
      '2': { effect: 'Max MP +L²; MPR +L. External status effects lose half their duration on you.', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'Allies within L×15 ft gain +L to all checks as your clarity illuminates the path forward.' },
      '4': { cost: '2 AP', effect: 'Enter perfect emotional clarity for L rounds. All abilities originating from this clarity automatically achieve their highest possible effect.' },
      '5': { effect: 'You stand at the edge of complete transcendence. Transcendence costs 0 additional affinity points for you. Your MND is treated as 5 higher for all emotional affinity calculations.' }
    }
  },

  apotheosis: {
    name: 'Apotheosis',
    theme: 'The moment before total transcendence — the self fully realized, all emotion embraced.',
    governing_pool: 'MP',
    prerequisite: { type: 'deep_mastery', note: 'Any three T4 entries (solo masters or compound states) at L5.' },
    levels: {
      '1': { effect: 'You stand at the boundary between mortal feeling and divine perspective. All emotional effects you originate are treated as one tier higher.' },
      '2': { effect: 'Max MP +L²; Max SP +L²; Max HP +L². All regens +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { effect: 'All emotional affinities you possess have their effective level treated as L higher.' },
      '4': { effect: 'You automatically understand the motivations, fears, and desires of any being you interact with. This grants +L² to all social and combat checks against them.' },
      '5': { cost: 'Once per session', effect: 'Briefly touch Transcendence — for L rounds, gain all Level 5 benefits of every emotional affinity you hold simultaneously.' }
    }
  }

};

// ════════════════════════════════════════════════════════════════════════════
// TIER 5 — 14 Solo Paragons (merged with existing Transcendence)
// ════════════════════════════════════════════════════════════════════════════
const tier5_new = {

  chastity_paragon: {
    name: 'Chastity Paragon',
    theme: 'Artemis — the untouched divine, purity as a field that cannot be entered uninvited.',
    governing_pool: 'MP',
    prerequisite: req('chastity_master', 3),
    levels: {
      '1': { effect: 'Your purity is a field. All corrupting effects fail within L×20 ft. You purify contaminated water, minds, and spaces by proximity.' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Cleanse all negative effects from L targets. Their mental stats are restored to maximum. Each receives L² Clarity stacks.' },
      '4': { effect: 'You are immune to all negative mental and emotional effects. Your MND cannot be reduced. Allies within L×20 ft share half your immunity.' },
      '5': { cost: 'Once per session', effect: 'Purify any environment, person, or situation — removing all negative emotional and mental effects from an entire scene permanently.' }
    }
  },

  lust_paragon: {
    name: 'Lust Paragon',
    theme: 'Eros — divine desire, the force of attraction at the heart of all creation.',
    governing_pool: 'SP',
    prerequisite: req('lust_master', 3),
    levels: {
      '1': { effect: 'You are the personification of desire. All beings within L×20 ft feel an inexorable pull toward you. You may direct this pull freely.' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '1 AP', effect: 'Send a bolt of pure desire at one target — they become genuinely devoted to a chosen being or cause for L rounds (not compulsion — authentic feeling).' },
      '4': { effect: 'All beings within L×25 ft recover L SP per round from your presence. Death effects fail entirely within this radius.' },
      '5': { cost: 'Once per session', effect: 'Direct the fundamental desire of all beings in a scene — choose what they most want, and they pursue it genuinely for the remainder of the session.' }
    }
  },

  temperance_paragon: {
    name: 'Temperance Paragon',
    theme: 'Sophrosyne — the divine principle of right measure, cosmic balance made manifest.',
    governing_pool: 'MP',
    prerequisite: req('temperance_master', 3),
    levels: {
      '1': { effect: 'You embody cosmic moderation. Extremes cannot exist near you — all things trend toward balance in your presence.' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Establish perfect balance in a L×25 ft area for L rounds. All effects (damage, healing, resources) are averaged across all beings in the area.' },
      '4': { effect: 'You cannot be moved to extremes by any means. All stats are always at their optimal value. Critical hits against you become normal hits.' },
      '5': { cost: 'Once per session', effect: 'The eternal scale speaks — redistribute any outcome perfectly. Damage becomes healing, failure becomes success, excess becomes sufficiency. The universe itself balances around your judgment.' }
    }
  },

  gluttony_paragon: {
    name: 'Gluttony Paragon',
    theme: 'Dionysus — the divine feast, infinite abundance, the cosmic celebration of excess.',
    governing_pool: 'SP',
    prerequisite: req('gluttony_master', 3),
    levels: {
      '1': { effect: 'You are plenty itself. Resources cannot be depleted in your presence — all pools refill at L² per round.' },
      '2': { effect: 'Max SP +L²×2; Max HP +L². Both regens +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Hold a bacchic feast of pure energy in L×25 ft — all beings restore full HP and SP, all abilities cost 0 resources for L rounds.' },
      '4': { effect: 'Your presence is intoxicating. All beings near you gain +L to all actions (including enemies). The excess is contagious — and glorious.' },
      '5': { cost: 'Once per session', effect: 'Scarcity does not exist near you. All resource pools are treated as full within L×20 ft. End all negative resource effects in a scene — everyone has what they need.' }
    }
  },

  charity_paragon: {
    name: 'Charity Paragon',
    theme: 'Agape — divine love as pure gift, the love that asks nothing and gives everything.',
    governing_pool: 'MP',
    prerequisite: req('charity_master', 3),
    levels: {
      '1': { effect: 'You are unconditional giving. All healing you provide is doubled and costs you nothing. You gain resources from the act of giving.' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Bestow divine grace on all allies within L×20 ft — full HP and SP restoration, all negative statuses removed, L² stacks of all positive statuses granted.' },
      '4': { effect: 'You cannot be reduced below 1 HP while any being needs your protection. Damage you sacrifice yourself for is always halved.' },
      '5': { cost: 'Once per session', effect: 'Agape made manifest — end all hostilities in a scene through pure love. All beings experience genuine healing. Enemies must actively choose to continue fighting.' }
    }
  },

  greed_paragon: {
    name: 'Greed Paragon',
    theme: 'Midas — the divine hoard, acquisition elevated to cosmic principle.',
    governing_pool: 'SP',
    prerequisite: req('greed_master', 3),
    levels: {
      '1': { effect: 'Everything you possess becomes more valuable. Items you carry are worth L× more. Resources accumulate interest at L per round.' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Target one enemy or object. Their HP maximum becomes your SP — they are worth exactly that much. Against them, deal bonus damage equal to their HP total.' },
      '4': { effect: 'You cannot lose resources permanently. Everything lost returns within L rounds. Your SP is treated as L²× its actual value for all calculations.' },
      '5': { cost: 'Once per session', effect: 'The golden throne — acquire anything of material value that exists within the session\'s scope. It comes to you.' }
    }
  },

  patience_paragon: {
    name: 'Patience Paragon',
    theme: 'Prometheus — eternal endurance, patience that spans ages and outlasts all opposition.',
    governing_pool: 'HP',
    prerequisite: req('patience_master', 3),
    levels: {
      '1': { effect: 'Time itself cannot defeat you. Status effects with durations expire at the end of the session, not in rounds.' },
      '2': { effect: 'Max HP +L²×2; HPR +L².', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { effect: 'Any failure this session can be declared "not yet" — re-roll once. The universe acknowledges your patience.' },
      '4': { effect: 'You cannot be killed by time or entropy. Effects that would reduce you to 0 HP trigger automatic stabilization at L HP once per round (not just once per session).' },
      '5': { cost: 'Once per session', effect: 'Achieve the goal that has been worked toward longest. Any long-term plan actively pursued resolves successfully. The universe completes what patience began.' }
    }
  },

  wrath_paragon: {
    name: 'Wrath Paragon',
    theme: 'Ares — divine fury, the principle of conflict itself given form.',
    governing_pool: 'HP',
    prerequisite: req('wrath_master', 3),
    levels: {
      '1': { effect: 'You are wrath itself. Your presence causes automatic fear in creatures who have witnessed violence. Your attacks need no targeting — they find what must be destroyed.' },
      '2': { effect: 'Max HP +L²×2; HPR +L².', pool_bonus: poolBonus('HP', 'HPR') },
      '3': { cost: '2 AP', effect: 'Declare war on one enemy or faction. Against this target, all attacks deal +L² damage, their attacks against you are halved, and all your abilities against them have doubled duration.' },
      '4': { effect: 'You cannot be stopped by pain, status effects, or barriers while in combat. All attacks deal minimum damage equal to level × 10. Critical hits deal maximum possible damage.' },
      '5': { cost: 'Once per session', effect: 'Conflict resolves in your favor by cosmic principle. Win any single combat exchange automatically. Enemies who survive you carry L² permanent Frightened stacks for the rest of the session.' }
    }
  },

  diligence_paragon: {
    name: 'Diligence Paragon',
    theme: 'Hephaestus — divine craft, creation through pure tireless effort.',
    governing_pool: 'SP',
    prerequisite: req('diligence_master', 3),
    levels: {
      '1': { effect: 'Your work is godlike. Any task you undertake has its difficulty reduced by L tiers. Items you create have maximum possible stats.' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Create anything from available materials in L rounds regardless of normal creation time. The result is a masterwork +L beyond maximum normal quality.' },
      '4': { effect: 'Your efficiency is perfect. All ability costs are reduced to 1 AP, or 0 if used before this session. Alert is permanent at maximum stacks.' },
      '5': { cost: 'Once per session', effect: 'Declare any ongoing work your Grand Design — it automatically achieves its theoretical maximum outcome, and the result persists until the start of next session.' }
    }
  },

  sloth_paragon: {
    name: 'Sloth Paragon',
    theme: 'Kairos — perfect timing, divine rest as the supreme power.',
    governing_pool: 'MP',
    prerequisite: req('sloth_master', 3),
    levels: {
      '1': { effect: 'While taking 0 actions, your defenses are treated as maximum and you recover L² of all resources per round.' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Enter divine rest for L rounds — immune to all effects, recover full HP, SP, and MP. Awaken with L² stacks of all positive statuses.' },
      '4': { effect: 'All your abilities cost 0 AP. You are the principle of efficiency made flesh — you take the path of least resistance to the ideal outcome.' },
      '5': { cost: 'Once per session', effect: 'By doing nothing, achieve everything. Without taking any action, achieve the desired outcome of an encounter. The universe bends to pure non-resistance.' }
    }
  },

  generosity_paragon: {
    name: 'Generosity Paragon',
    theme: 'Demeter — infinite abundance, the source that never runs dry, the eternal harvest.',
    governing_pool: 'SP',
    prerequisite: req('generosity_master', 3),
    levels: {
      '1': { effect: 'You are the principle of giving. Resources cannot run out in your presence — you produce L² of all resource types per round.' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Create a field of abundance in L×30 ft for L rounds. All allies have unlimited resources. Hostile intent in the area is suppressed — enemies must will themselves to attack.' },
      '4': { effect: 'Everything you give is doubled. Your SP is always at maximum at the start of any encounter. You cannot experience scarcity.' },
      '5': { cost: 'Once per session', effect: 'Declare the Harvest — all allies recover full resources, all injuries heal, all negative conditions resolve. The session\'s scarcity ends by your will.' }
    }
  },

  envy_paragon: {
    name: 'Envy Paragon',
    theme: 'Nemesis — divine reckoning, the force that restores cosmic balance by acknowledging inequity.',
    governing_pool: 'MP',
    prerequisite: req('envy_master', 3),
    levels: {
      '1': { effect: 'You are the divine weight of unfairness. Beings of unjust privilege suffer -L to all checks in your presence.' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP', effect: 'Redistribute all stat bonuses in L×25 ft — those with the most give to those with the least, averaging all bonuses among all beings.' },
      '4': { effect: 'Whenever any being achieves something through unfair advantage within L×30 ft, you gain L² MP and L bonus damage against them for the encounter.' },
      '5': { cost: 'Once per session', effect: 'Nemesis speaks — make one being receive the consequences of their unjust acts. All stolen resources return to rightful owners. All ill-gotten advantages dissolve permanently.' }
    }
  },

  humility_paragon: {
    name: 'Humility Paragon',
    theme: 'Hestia — the sacred hearth, the sustaining presence that asks for nothing and holds everything.',
    governing_pool: 'SP',
    prerequisite: req('humility_master', 3),
    levels: {
      '1': { effect: 'You are the hearth fire — the sustaining presence that asks nothing. All allies within L×20 ft regenerate L of all resources per round.' },
      '2': { effect: 'Max SP +L²×2; SPR +L².', pool_bonus: poolBonus('SP', 'SPR') },
      '3': { cost: '2 AP', effect: 'Establish a sanctuary in L×25 ft for L rounds. Within it, healing is doubled, attacks are halved, allies gain +L to all checks, enemies gain -L to all checks.' },
      '4': { effect: 'By having no needs of your own, you have everything others need. All your support and healing is maximized. Enemies cannot perceive you as a threat unless you attack them first.' },
      '5': { cost: 'Once per session', effect: 'Become home for all present — all allies are instantly restored and feel complete safety. All enemies make a supreme Resolve check or leave the fight entirely.' }
    }
  },

  pride_paragon: {
    name: 'Pride Paragon',
    theme: 'Zeus — the supreme will, divine ego that shapes reality by declaring it.',
    governing_pool: 'MP',
    prerequisite: req('pride_master', 3),
    levels: {
      '1': { effect: 'Your will is cosmic law. Declarations you make about reality have a L×10% chance of manifesting immediately (GM adjudicates).' },
      '2': { effect: 'Max MP +L²×2; MPR +L².', pool_bonus: poolBonus('MP', 'MPR') },
      '3': { cost: '2 AP, once per encounter', effect: 'The Thunderbolt — declare one truth about this encounter. It manifests. An enemy falls, an obstacle yields, an ally succeeds.' },
      '4': { effect: 'Your word is law. Commands given to beings of lower level cannot be refused. Your presence causes all lesser beings to defer.' },
      '5': { cost: 'Once per session', effect: 'You are the King of the Gods. Declare any outcome for the session and it comes to pass within narrative reason. The universe yields to the summit of pride.' }
    }
  }

};

// ════════════════════════════════════════════════════════════════════════════
// APPLY CHANGES
// ════════════════════════════════════════════════════════════════════════════

// Replace T2 and T3/T4 entirely (they were placeholder stubs or misaligned)
emo.tier2 = tier2;
emo.tier3 = tier3;
emo.tier4 = tier4;

// Merge T5: preserve Transcendence, add Paragons
emo.tier5 = Object.assign({}, emo.tier5, tier5_new);

// Write back with 2-space indent
fs.writeFileSync(DB, JSON.stringify(data, null, 2), 'utf-8');

console.log('✓ Fixed envy.opposing: kindness → generosity');
console.log('✓ Tier 2: replaced with 7 proper bridges + 14 solo Initiates (21 entries)');
console.log('✓ Tier 3: 14 solo Adepts + 7 Bridge Deepenings + 10 Compound States (31 entries)');
console.log('✓ Tier 4: 14 solo Masters + 5 near-transcendent Compound States (19 entries)');
console.log('✓ Tier 5: 14 solo Paragons added (Transcendence preserved)');
console.log('Total new emotional entries:', 21 + 31 + 19 + 14);
