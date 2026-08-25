import { CategoryId, DieValue, LowerCategoryId, UpperCategoryId } from './types';

const UPPER_VALUE: Record<UpperCategoryId, DieValue> = {
  ones: 1,
  twos: 2,
  threes: 3,
  fours: 4,
  fives: 5,
  sixes: 6,
};

function countsByValue(dice: DieValue[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0];
  for (const die of dice) counts[die - 1] += 1;
  return counts;
}

function sum(dice: DieValue[]): number {
  return dice.reduce((total, die) => total + die, 0);
}

function scoreUpper(dice: DieValue[], value: DieValue): number {
  return dice.filter((die) => die === value).length * value;
}

function scoreOfAKind(dice: DieValue[], minCount: number): number {
  const counts = countsByValue(dice);
  return counts.some((count) => count >= minCount) ? sum(dice) : 0;
}

function scoreTwoPairs(dice: DieValue[]): number {
  const counts = countsByValue(dice);
  const pairValues = counts
    .map((count, index) => ({ value: index + 1, count }))
    .filter(({ count }) => count >= 2)
    .map(({ value }) => value)
    .sort((a, b) => b - a);

  if (pairValues.length < 2) return 0;
  const [highest, second] = pairValues;
  return 2 * (highest + second);
}

function scoreFullHouse(dice: DieValue[]): number {
  const counts = countsByValue(dice).filter((count) => count > 0);
  const hasThree = counts.includes(3);
  const hasTwo = counts.includes(2);
  return hasThree && hasTwo ? 25 : 0;
}

function scoreStraight(dice: DieValue[], run: number, points: number): number {
  const distinct = Array.from(new Set(dice)).sort((a, b) => a - b);
  let longestRun = 1;
  let currentRun = 1;
  for (let i = 1; i < distinct.length; i += 1) {
    if (distinct[i] === distinct[i - 1] + 1) {
      currentRun += 1;
      longestRun = Math.max(longestRun, currentRun);
    } else {
      currentRun = 1;
    }
  }
  return longestRun >= run ? points : 0;
}

function scoreYan(dice: DieValue[]): number {
  return countsByValue(dice).some((count) => count === 5) ? 50 : 0;
}

const LOWER_SCORERS: Record<LowerCategoryId, (dice: DieValue[]) => number> = {
  twoPairs: scoreTwoPairs,
  threeOfAKind: (dice) => scoreOfAKind(dice, 3),
  fullHouse: scoreFullHouse,
  smallStraight: (dice) => scoreStraight(dice, 4, 30),
  largeStraight: (dice) => scoreStraight(dice, 5, 40),
  fourOfAKind: (dice) => scoreOfAKind(dice, 4),
  chance: sum,
  yan: scoreYan,
};

export function scoreForCategory(categoryId: CategoryId, dice: DieValue[]): number {
  if (categoryId in UPPER_VALUE) {
    return scoreUpper(dice, UPPER_VALUE[categoryId as UpperCategoryId]);
  }
  return LOWER_SCORERS[categoryId as LowerCategoryId](dice);
}
