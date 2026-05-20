export const getRankUpgradeCost = (currentRank) => currentRank * (currentRank + 1);
export const getRankDowngradeRefund = (currentRank) => (currentRank - 1) * currentRank;

export const calculateVitals = ({ bdy, spt, mnd, persona, personaRank, skills }) => {
  let maxHp = 10; let hpr = 1;
  let maxSp = 10; let spr = 1;
  let maxMp = 10; let mpr = 1;

  maxHp += (bdy - 1) * 5;
  maxSp += (spt - 1) * 5;
  maxMp += (mnd - 1) * 5;

  if (persona && personaRank >= 2) {
    const R = personaRank;
    if (persona.stat === 'BDY') { maxHp += (R * R); hpr += R; }
    if (persona.stat === 'SPT') { maxSp += (R * R); spr += R; }
    if (persona.stat === 'MND') { maxMp += (R * R); mpr += R; }
  }

  // Evaluate live skills based on their source json properties
  skills.forEach(skill => {
    if (skill.level >= 2) {
      const L = skill.level;
      const target = skill.resourceTarget?.toUpperCase() || '';
      const category = skill.sourceCategory || '';

      // Map pool rules to database types (Affinities = MP, Combat/Styles = SP, Proficiencies/Craft = HP)
      if (target === 'HP' || category === 'Proficiencies' || category === 'CraftSkills') {
        maxHp += (L * L);
        hpr += L;
      }
      if (target === 'SP' || category === 'CombatStyles') {
        maxSp += (L * L);
        spr += L;
      }
      if (target === 'MP' || category === 'Affinities') {
        maxMp += (L * L);
        mpr += L;
      }
    }
  });

  return { maxHp, hpr, maxSp, spr, maxMp, mpr };
};

export const calculatePowerRating = ({ bdy, spt, mnd, personaRank, speciesRank = 1, skills = [], traitsCount = 0 }) => {
  const baseRanksSum = bdy + spt + mnd + personaRank + speciesRank;
  const totalSkillLevels = skills.reduce((sum, s) => sum + s.level, 0);
  
  return parseFloat((baseRanksSum + (totalSkillLevels / 2) + (traitsCount / 5)).toFixed(2));
};