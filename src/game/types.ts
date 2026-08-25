export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export const DICE_COUNT = 5;
export const MAX_ROLLS_PER_TURN = 3;

export type UpperCategoryId =
  | 'ones'
  | 'twos'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes';

export type LowerCategoryId =
  | 'threeOfAKind'
  | 'fourOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yahtzee'
  | 'chance';

export type CategoryId = UpperCategoryId | LowerCategoryId;

export interface Player {
  id: string;
  name: string;
  scores: Partial<Record<CategoryId, number>>;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: DieValue[];
  heldDice: boolean[];
  rollsLeft: number;
  isGameOver: boolean;
}
