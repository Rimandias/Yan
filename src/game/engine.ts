import { CATEGORY_ORDER, COLUMNS, getColumnDefinition } from './categories';
import { scoreForCategory } from './scoring';
import { hasCompletedScorecard } from './totals';
import {
  CategoryId,
  ColumnId,
  ColumnScores,
  DICE_COUNT,
  DieValue,
  GameState,
  Player,
} from './types';

export type RandomSource = () => number;

const defaultRandom: RandomSource = Math.random;

function rollOneDie(rng: RandomSource): DieValue {
  return (Math.floor(rng() * 6) + 1) as DieValue;
}

function emptyColumns(): Player['columns'] {
  return { descida: {}, subida: {}, desordem: {}, seco: {} };
}

export function createGame(playerNames: string[]): GameState {
  if (playerNames.length === 0) {
    throw new Error('A game needs at least one player');
  }

  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    columns: emptyColumns(),
  }));

  return {
    players,
    currentPlayerIndex: 0,
    activeColumn: null,
    dice: Array(DICE_COUNT).fill(1) as DieValue[],
    heldDice: Array(DICE_COUNT).fill(false),
    rollsLeft: 0,
    isGameOver: false,
  };
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function isColumnComplete(player: Player, columnId: ColumnId): boolean {
  return CATEGORY_ORDER.every((category) => category.id in player.columns[columnId]);
}

export function getAvailableColumns(player: Player): ColumnId[] {
  return COLUMNS.filter((column) => !isColumnComplete(player, column.id)).map(
    (column) => column.id,
  );
}

/** Para colunas de ordem livre (desordem/seco) não há uma única categoria forçada. */
export function getForcedCategory(player: Player, columnId: ColumnId): CategoryId | undefined {
  const definition = getColumnDefinition(columnId);
  const filled = player.columns[columnId];

  if (definition.order === 'forcedDown') {
    return CATEGORY_ORDER.find((category) => !(category.id in filled))?.id;
  }
  if (definition.order === 'forcedUp') {
    return [...CATEGORY_ORDER].reverse().find((category) => !(category.id in filled))?.id;
  }
  return undefined;
}

export function getAvailableCategories(player: Player, columnId: ColumnId): CategoryId[] {
  const forced = getForcedCategory(player, columnId);
  if (forced) return [forced];

  const filled = player.columns[columnId];
  return CATEGORY_ORDER.filter((category) => !(category.id in filled)).map(
    (category) => category.id,
  );
}

export function chooseColumn(state: GameState, columnId: ColumnId): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot choose a column: the game is over');
  }
  if (state.activeColumn) {
    throw new Error('A column was already chosen this turn');
  }

  const player = getCurrentPlayer(state);
  if (isColumnComplete(player, columnId)) {
    throw new Error(`Column "${columnId}" is already complete`);
  }

  const definition = getColumnDefinition(columnId);

  return {
    ...state,
    activeColumn: columnId,
    dice: Array(DICE_COUNT).fill(1) as DieValue[],
    heldDice: Array(DICE_COUNT).fill(false),
    rollsLeft: definition.maxRolls,
  };
}

export function rollDice(state: GameState, rng: RandomSource = defaultRandom): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot roll dice: the game is over');
  }
  if (!state.activeColumn) {
    throw new Error('Choose a column before rolling');
  }
  if (state.rollsLeft <= 0) {
    throw new Error('No rolls left this turn');
  }

  const dice = state.dice.map((die, index) =>
    state.heldDice[index] ? die : rollOneDie(rng),
  ) as DieValue[];

  return {
    ...state,
    dice,
    rollsLeft: state.rollsLeft - 1,
  };
}

export function toggleHold(state: GameState, dieIndex: number): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot hold dice: the game is over');
  }
  if (!state.activeColumn) {
    throw new Error('Choose a column before holding dice');
  }

  const definition = getColumnDefinition(state.activeColumn);
  if (!definition.allowHold) {
    throw new Error(`Column "${state.activeColumn}" does not allow holding dice`);
  }
  if (state.rollsLeft === definition.maxRolls) {
    throw new Error('Roll the dice at least once before holding');
  }
  if (dieIndex < 0 || dieIndex >= DICE_COUNT) {
    throw new Error(`Invalid die index: ${dieIndex}`);
  }

  const heldDice = state.heldDice.map((held, index) =>
    index === dieIndex ? !held : held,
  );

  return { ...state, heldDice };
}

export function selectCategory(state: GameState, categoryId: CategoryId): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot score: the game is over');
  }
  if (!state.activeColumn) {
    throw new Error('Choose a column before scoring');
  }

  const definition = getColumnDefinition(state.activeColumn);
  if (state.rollsLeft === definition.maxRolls) {
    throw new Error('Roll the dice at least once before scoring');
  }

  const currentPlayer = getCurrentPlayer(state);
  const columnId = state.activeColumn;
  const available = getAvailableCategories(currentPlayer, columnId);
  if (!available.includes(categoryId)) {
    throw new Error(`Category "${categoryId}" is not available in column "${columnId}" right now`);
  }

  const score = scoreForCategory(categoryId, state.dice);
  const updatedColumn: ColumnScores = { ...currentPlayer.columns[columnId], [categoryId]: score };
  const updatedPlayer: Player = {
    ...currentPlayer,
    columns: { ...currentPlayer.columns, [columnId]: updatedColumn },
  };

  const players = state.players.map((player, index) =>
    index === state.currentPlayerIndex ? updatedPlayer : player,
  );

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
  const isGameOver = players.every((player) => hasCompletedScorecard(player));

  return {
    ...state,
    players,
    currentPlayerIndex: isGameOver ? state.currentPlayerIndex : nextPlayerIndex,
    activeColumn: null,
    dice: Array(DICE_COUNT).fill(1) as DieValue[],
    heldDice: Array(DICE_COUNT).fill(false),
    rollsLeft: 0,
    isGameOver,
  };
}

export function canRoll(state: GameState): boolean {
  return !state.isGameOver && !!state.activeColumn && state.rollsLeft > 0;
}

export function canSelectCategory(state: GameState, categoryId: CategoryId): boolean {
  if (state.isGameOver || !state.activeColumn) return false;
  const definition = getColumnDefinition(state.activeColumn);
  if (state.rollsLeft === definition.maxRolls) return false;
  const player = getCurrentPlayer(state);
  return getAvailableCategories(player, state.activeColumn).includes(categoryId);
}
