/**
 * Calculates the XP cost to upgrade a Rank-based value (Stats, Persona Rank).
 * Formula: Current Rank * Target Rank
 */
export const calculateRankUpgradeCost = (currentRank) => {
  return currentRank * (currentRank + 1);
};

/**
 * Calculates the cumulative XP cost to bring a rank from 1 to a target rank.
 */
export const getCumulativeRankCost = (targetRank) => {
  let totalCost = 0;
  for (let r = 1; r < targetRank; r++) {
    totalCost += r * (r + 1);
  }
  return totalCost;
};

/**
 * Calculates the XP cost to upgrade a Linear Level-based value (Skills).
 * Formula: Target Level
 */
export const calculateLevelUpgradeCost = (nextLevel) => {
  return nextLevel;
};

/**
 * Calculates XP spent on additional traits purchased during character creation.
 * Cost: 0.5 XP per trait, bought strictly in pairs (1.0 XP per pair).
 * @param {number} baseTraitsCount - Number of traits inherently granted by the chosen species
 * @param {number} currentTraitsCount - Total traits currently selected on the sheet
 */
export const calculateAdditionalTraitXpCost = (baseTraitsCount, currentTraitsCount) => {
  const extraCount = currentTraitsCount - baseTraitsCount;
  if (extraCount <= 0) return 0;
  
  // Enforce validation rule: must be an even number/pair to be mathematically valid in currency spend
  const pairs = Math.floor(extraCount / 2);
  return pairs * 1.0; 
};
