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
  MAX_ROLLS_PER_TURN,
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
    dice: Array(DICE_COUNT).fill(1) as DieValue[],
    heldDice: Array(DICE_COUNT).fill(false),
    rollsLeft: MAX_ROLLS_PER_TURN,
    isGameOver: false,
  };
}

export function getCurrentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

export function rollsUsedThisTurn(state: GameState): number {
  return MAX_ROLLS_PER_TURN - state.rollsLeft;
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

export function rollDice(state: GameState, rng: RandomSource = defaultRandom): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot roll dice: the game is over');
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
  if (state.rollsLeft === MAX_ROLLS_PER_TURN) {
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

/**
 * Se essa jogada pode ser colocada em (columnId, categoryId) agora, dado o
 * estado atual do turno. Não é usada para restringir o que é mostrado ao
 * jogador (nenhuma jogada é "escondida" ou desabilitada visualmente) — só
 * para validar uma tentativa de colocação.
 */
export function canPlaceScore(
  state: GameState,
  columnId: ColumnId,
  categoryId: CategoryId,
): boolean {
  if (state.isGameOver) return false;
  if (state.rollsLeft === MAX_ROLLS_PER_TURN) return false; // ainda não rolou neste turno

  const player = getCurrentPlayer(state);
  if (categoryId in player.columns[columnId]) return false; // já preenchida

  const definition = getColumnDefinition(columnId);
  if (definition.requiresFirstRollOnly && rollsUsedThisTurn(state) !== 1) {
    return false;
  }

  return getAvailableCategories(player, columnId).includes(categoryId);
}

export function selectCategory(
  state: GameState,
  columnId: ColumnId,
  categoryId: CategoryId,
): GameState {
  if (!canPlaceScore(state, columnId, categoryId)) {
    throw new Error(`Cannot place "${categoryId}" in column "${columnId}" right now`);
  }

  const currentPlayer = getCurrentPlayer(state);
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
    dice: Array(DICE_COUNT).fill(1) as DieValue[],
    heldDice: Array(DICE_COUNT).fill(false),
    rollsLeft: MAX_ROLLS_PER_TURN,
    isGameOver,
  };
}

export function canRoll(state: GameState): boolean {
  return !state.isGameOver && state.rollsLeft > 0;
}
