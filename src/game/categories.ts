import { CategoryId, LowerCategoryId, UpperCategoryId } from './types';

export interface CategoryDefinition {
  id: CategoryId;
  label: string;
  section: 'upper' | 'lower';
}

export const UPPER_CATEGORIES: CategoryDefinition[] = [
  { id: 'ones', label: 'Ases (1)', section: 'upper' },
  { id: 'twos', label: 'Duques (2)', section: 'upper' },
  { id: 'threes', label: 'Ternos (3)', section: 'upper' },
  { id: 'fours', label: 'Quadras (4)', section: 'upper' },
  { id: 'fives', label: 'Quinas (5)', section: 'upper' },
  { id: 'sixes', label: 'Senas (6)', section: 'upper' },
];

export const LOWER_CATEGORIES: CategoryDefinition[] = [
  { id: 'threeOfAKind', label: 'Trinca', section: 'lower' },
  { id: 'fourOfAKind', label: 'Quadra', section: 'lower' },
  { id: 'fullHouse', label: 'Full House', section: 'lower' },
  { id: 'smallStraight', label: 'Sequência Pequena', section: 'lower' },
  { id: 'largeStraight', label: 'Sequência Grande', section: 'lower' },
  { id: 'yahtzee', label: 'Yahtzee', section: 'lower' },
  { id: 'chance', label: 'Chance', section: 'lower' },
];

export const ALL_CATEGORIES: CategoryDefinition[] = [
  ...UPPER_CATEGORIES,
  ...LOWER_CATEGORIES,
];

export const UPPER_BONUS_THRESHOLD = 63;
export const UPPER_BONUS_AMOUNT = 35;

export function isUpperCategory(id: CategoryId): id is UpperCategoryId {
  return UPPER_CATEGORIES.some((category) => category.id === id);
}

export function isLowerCategory(id: CategoryId): id is LowerCategoryId {
  return LOWER_CATEGORIES.some((category) => category.id === id);
}
