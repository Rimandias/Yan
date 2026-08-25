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
  | 'twoPairs'
  | 'threeOfAKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'fourOfAKind'
  | 'chance'
  | 'yan';

export type CategoryId = UpperCategoryId | LowerCategoryId;

/**
 * descida: preenchida de cima para baixo (Ases -> Yan).
 * subida: preenchida de baixo para cima (Yan -> Ases).
 * desordem: qualquer categoria livre, com rolagens normais.
 * seco: qualquer categoria livre, mas com uma única rolagem (sem segurar dados).
 */
export type ColumnId = 'descida' | 'subida' | 'desordem' | 'seco';

export type ColumnScores = Partial<Record<CategoryId, number>>;

export interface Player {
  id: string;
  name: string;
  columns: Record<ColumnId, ColumnScores>;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  dice: DieValue[];
  heldDice: boolean[];
  rollsLeft: number;
  isGameOver: boolean;
}
