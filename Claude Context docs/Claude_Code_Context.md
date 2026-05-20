# Unbound Web App — Claude Code Context Primer
**RHabit Game Development | Unity 6.3 LTS + JSON Databases**

Feed this file to Claude Code at the start of any session to orient it on the project.

---

## What This Project Is

A **web app** for building and balancing the *Unbound TTRPG* — a universe-agnostic tabletop RPG system. The app supports:
- Database entry/editing (all data lives in JSON files)
- Character creation and progression balancing
- Species/trait building and validation
- Crafting system management
- XP economy simulation

The companion game is being built in **Unity 6.3 LTS**, so all data structures must be Unity-serialization-friendly (flat or shallow nesting preferred; avoid polymorphic arrays without type discriminators).

---

## JSON Database Files & Status

| File | Status | Purpose |
|------|--------|---------|
| `Stats.json` | ✅ Active | BDY / SPT / MND stats + HP/SP/MP resource pools |
| `Species.json` | ✅ Active | Biology types, morphotypes, size categories, diet types, traits |
| `Affinities.json` | ✅ Active | Emotional, Elemental, Arcane affinity domains |
| `CombatStyles.json` | ✅ Active | Combat skill trees and style definitions |
| `CraftSkills.json` | ✅ Active | Profession skills, knowledge tag system, recipe framework |
| `Gatherables.json` | ✅ Active | Raw gathering materials |
| `AnimalMaterials.json` | ✅ Active | Materials sourced from creatures |
| `StatusEffects.json` | ✅ Active | Flow, Bleed, Inspire, Haste, Slow, Stun, etc. |
| `Personas.json` | ✅ Active | Persona/soul trait system |
| `SocialSkills.json` | ✅ Active | Social skill definitions |
| `CraftRecipes.json` | ⚠️ Empty | Needs population — recipe/formula library |
| `Equipment.json` | ⚠️ Empty | Needs population — weapons, armor, items |
| `Knowledge.json` | ⚠️ Empty | Needs population — knowledge tag instances |
| `ProcessedMaterials.json` | ⚠️ Empty | Needs population — refined/crafted materials |

---

## Core System Rules (for validation logic)

### Stats
- Three primary stats: **BDY** (Body), **SPT** (Spirit), **MND** (Mind)
- Each stat has a **Rank** (starts at 1). Rank = dice pool size (d6s).
- **Stat Rank Up cost**: `currentRank × nextRank` XP
- Three resource pools: **HP**, **SP**, **MP** (each has a regen rate: HPR, SPR, MPR)
- Base pools: 8 HP, 8 SP, 8 MP (before traits/diet/skills modify them)

### XP Economy
- **Stat Rank cost**: `current × next` (e.g., Rank 1→2 = 2 XP, 2→3 = 6 XP, 3→4 = 12 XP)
- **Skill Level cost**: equal to the new level (e.g., Level 1→2 = 2 XP, 2→3 = 3 XP)
- **Biology Type Rank cost**: same as Stat Rank curve (`R × R+1`)
- Skills must rank up one level at a time
- **Character Rating (CR)** = BDY Rank + SPT Rank + MND Rank + (sum of all skill levels ÷ 5, round up)

### Resource Pool Formula
```
Max Pool = (Stat Rank × 4) + Diet Bonus + (Skill Level²) + Trait Bonuses
Regen Rate = Affinity/Proficiency Skill bonuses + Biology Trait bonuses
```

### Species Construction (layered system)
1. **Morphotype** — body plan, equipment slots, locomotion
2. **Biology Type** — taxonomic family (Ranks 1–5, purchased at XP curve)
3. **Lineage Archetype** — cultural heritage, suggests Rank 1 trait tendencies
4. **Traits** — purchased with Trait Points (TP) from Compensation Pool
5. **Size** — Tiny / Small / Medium / Large / Huge / Gigantic
6. **Diet** — filtered by kingdom tag, grants Max HP/SP/MP bonuses

### Combat
- Turn phases: **Upkeep** → **Action** → **Reaction**
- Resources: **Action Points (AP)**, **Reaction Tokens**
- Weapon weight categories: Light / Medium / Heavy (weight = bonus damage tier)

### Crafting & Knowledge Tags
- Tags are **qualifications**, not bonuses. Missing tags = operating at knowledge edge.
- Three tag domains: **Material**, **Technique**, **Formula**
- Five tag tiers: T1 Common → T5 Legendary
- Tags earned by: successful crafting, trainer instruction, examining materials, deconstruction
- Recipe fields: `required_tags`, `materials`, `crafting_dc`, `required_skills`, `tool_requirement`, `time_requirement`, `functional_material`, `critical_success_effect`

---

## JSON Schema Conventions

All JSON files follow this pattern:
```json
{
  "_meta": {
    "document": "filename.json",
    "system": "Unbound TTRPG",
    "studio": "RHabit Game Development",
    "version": "0.1-draft",
    "notes": []
  },
  "<data_key>": { ... }
}
```

**ID conventions**: `snake_case` strings used as dictionary keys (e.g., `"iron_working"`, `"felidae"`)

**Cross-references**: files reference each other by `id` string. Example: a recipe in `CraftRecipes.json` references `required_tags` by their `id` from `CraftSkills.json`.

**Unity serialization note**: Keep nesting ≤ 3 levels deep where possible. Use type discriminator fields (`"type": "material"`) on any polymorphic entries.

---

## Web App Goals

1. **Database Editor** — CRUD interface for all JSON files
2. **Character Builder** — guided creation flow with live XP cost tracking
3. **Balance Simulator** — compare CR values, resource pools, trait costs
4. **Crafting Planner** — recipe lookup, tag requirement checker
5. **Species Designer** — morphotype + biology type + trait point calculator

---

## Key Relationships Between Files

```
Stats.json
  └─ drives resource pool formulas

Species.json
  ├─ references CombatStyles.json (via trait unlocks)
  └─ references Affinities.json (via biology type affinities)

CraftSkills.json
  ├─ defines Knowledge Tags (used by CraftRecipes.json)
  └─ references Gatherables.json + AnimalMaterials.json + ProcessedMaterials.json

Equipment.json  [EMPTY - needs build]
  └─ will reference ProcessedMaterials.json (functional_material)

CraftRecipes.json  [EMPTY - needs build]
  ├─ references CraftSkills.json (required_tags, required_skills)
  └─ references Gatherables.json + ProcessedMaterials.json (materials)
```

---

## Current Priorities

- [ ] Populate `CraftRecipes.json` with recipe entries
- [ ] Populate `Equipment.json` with weapon/armor entries  
- [ ] Populate `Knowledge.json` with tag instances
- [ ] Populate `ProcessedMaterials.json` with refined material entries
- [ ] Build XP cost calculator utility
- [ ] Build character sheet validator (checks tag requirements, TP budget, XP spend)