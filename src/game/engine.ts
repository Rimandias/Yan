import { ALL_CATEGORIES } from './categories';
import { scoreForCategory } from './scoring';
import { hasCompletedScorecard } from './totals';
import {
  CategoryId,
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

export function createGame(playerNames: string[]): GameState {
  if (playerNames.length === 0) {
    throw new Error('A game needs at least one player');
  }

  const players: Player[] = playerNames.map((name, index) => ({
    id: `player-${index + 1}`,
    name,
    scores: {},
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

export function selectCategory(state: GameState, categoryId: CategoryId): GameState {
  if (state.isGameOver) {
    throw new Error('Cannot score: the game is over');
  }
  if (state.rollsLeft === MAX_ROLLS_PER_TURN) {
    throw new Error('Roll the dice at least once before scoring');
  }

  const currentPlayer = getCurrentPlayer(state);
  if (categoryId in currentPlayer.scores) {
    throw new Error(`Category "${categoryId}" was already scored this game`);
  }

  const score = scoreForCategory(categoryId, state.dice);
  const updatedPlayer: Player = {
    ...currentPlayer,
    scores: { ...currentPlayer.scores, [categoryId]: score },
  };

  const players = state.players.map((player, index) =>
    index === state.currentPlayerIndex ? updatedPlayer : player,
  );

  const nextPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
  const isGameOver = players.every((player) =>
    hasCompletedScorecard(player, ALL_CATEGORIES.length),
  );

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

export function canSelectCategory(state: GameState, categoryId: CategoryId): boolean {
  if (state.isGameOver || state.rollsLeft === MAX_ROLLS_PER_TURN) return false;
  return !(categoryId in getCurrentPlayer(state).scores);
}
