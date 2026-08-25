import { UPPER_BONUS_AMOUNT, UPPER_BONUS_THRESHOLD, UPPER_CATEGORIES } from './categories';
import { Player } from './types';

export interface PlayerTotals {
  upperSum: number;
  upperBonus: number;
  lowerSum: number;
  grandTotal: number;
}

export function computeTotals(player: Player): PlayerTotals {
  const upperSum = UPPER_CATEGORIES.reduce(
    (total, category) => total + (player.scores[category.id] ?? 0),
    0,
  );
  const upperBonus = upperSum >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_AMOUNT : 0;
  const scoredValues = Object.values(player.scores) as number[];
  const allSum = scoredValues.reduce((total, value) => total + value, 0);
  const lowerSum = allSum - upperSum;

  return {
    upperSum,
    upperBonus,
    lowerSum,
    grandTotal: upperSum + upperBonus + lowerSum,
  };
}

export function hasCompletedScorecard(player: Player, totalCategories: number): boolean {
  return Object.keys(player.scores).length >= totalCategories;
}
