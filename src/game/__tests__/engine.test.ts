import { ALL_CATEGORIES } from '../categories';
import {
  canRoll,
  canSelectCategory,
  createGame,
  getCurrentPlayer,
  rollDice,
  selectCategory,
  toggleHold,
} from '../engine';
import { CategoryId } from '../types';

const fixedRng = (value: number) => () => value;

describe('createGame', () => {
  it('creates one player entry per name, with an empty scorecard', () => {
    const state = createGame(['Ana', 'Beto']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0]).toMatchObject({ name: 'Ana', scores: {} });
    expect(state.rollsLeft).toBe(3);
    expect(state.isGameOver).toBe(false);
  });

  it('rejects an empty player list', () => {
    expect(() => createGame([])).toThrow();
  });
});

describe('rollDice', () => {
  it('rolls only the dice that are not held, and consumes a roll', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0.99)); // all dice become 6
    expect(state.dice).toEqual([6, 6, 6, 6, 6]);
    expect(state.rollsLeft).toBe(2);

    state = toggleHold(state, 0);
    state = rollDice(state, fixedRng(0)); // remaining dice become 1
    expect(state.dice).toEqual([6, 1, 1, 1, 1]);
    expect(state.rollsLeft).toBe(1);
  });

  it('throws once there are no rolls left', () => {
    let state = createGame(['Ana']);
    state = rollDice(state);
    state = rollDice(state);
    state = rollDice(state);
    expect(state.rollsLeft).toBe(0);
    expect(canRoll(state)).toBe(false);
    expect(() => rollDice(state)).toThrow();
  });
});

describe('toggleHold', () => {
  it('refuses to hold dice before the first roll of the turn', () => {
    const state = createGame(['Ana']);
    expect(() => toggleHold(state, 0)).toThrow();
  });
});

describe('selectCategory', () => {
  it('scores the category, advances to the next player, and resets the turn', () => {
    let state = createGame(['Ana', 'Beto']);
    state = rollDice(state, fixedRng(0)); // dice = [1,1,1,1,1]

    expect(canSelectCategory(state, 'ones')).toBe(true);
    state = selectCategory(state, 'ones');

    expect(state.players[0].scores.ones).toBe(5);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.rollsLeft).toBe(3);
    expect(state.heldDice).toEqual([false, false, false, false, false]);
  });

  it('refuses to score the same category twice for a player', () => {
    let state = createGame(['Ana', 'Beto']);
    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'ones');
    // back to Ana after Beto's turn
    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'twos');

    state = rollDice(state, fixedRng(0));
    expect(() => selectCategory(state, 'ones')).toThrow();
  });

  it('ends the game once every player has filled every category', () => {
    let state = createGame(['Ana']);
    for (const category of ALL_CATEGORIES) {
      state = rollDice(state, fixedRng(0));
      state = selectCategory(state, category.id as CategoryId);
    }
    expect(state.isGameOver).toBe(true);
    expect(getCurrentPlayer(state).scores.chance).toBeDefined();
    expect(() => rollDice(state)).toThrow();
  });
});
