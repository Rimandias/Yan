import { CATEGORY_ORDER } from '../categories';
import {
  canPlaceScore,
  canRoll,
  createGame,
  getAvailableColumns,
  getCurrentPlayer,
  getForcedCategory,
  isColumnComplete,
  rollDice,
  rollsUsedThisTurn,
  selectCategory,
  toggleHold,
} from '../engine';
import { CategoryId } from '../types';

const fixedRng = (value: number) => () => value;
const forwardOrder = CATEGORY_ORDER.map((category) => category.id);
const backwardOrder = [...forwardOrder].reverse();

describe('createGame', () => {
  it('creates each player with 4 empty columns, ready to roll', () => {
    const state = createGame(['Ana', 'Beto']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].columns).toEqual({
      descida: {},
      subida: {},
      desordem: {},
      seco: {},
    });
    expect(state.rollsLeft).toBe(3);
    expect(getAvailableColumns(state.players[0])).toEqual([
      'descida',
      'subida',
      'desordem',
      'seco',
    ]);
  });
});

describe('rolling and holding', () => {
  it('refuses to place a score before rolling', () => {
    const state = createGame(['Ana']);
    expect(canPlaceScore(state, 'desordem', 'chance')).toBe(false);
    expect(() => selectCategory(state, 'desordem', 'chance')).toThrow();
  });

  it('refuses to hold dice before the first roll', () => {
    const state = createGame(['Ana']);
    expect(() => toggleHold(state, 0)).toThrow();
  });

  it('lets the player roll up to 3 times, holding dice in between', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0.99)); // all dice become 6
    expect(rollsUsedThisTurn(state)).toBe(1);

    state = toggleHold(state, 0);
    state = rollDice(state, fixedRng(0)); // remaining dice become 1
    expect(state.dice).toEqual([6, 1, 1, 1, 1]);
    expect(rollsUsedThisTurn(state)).toBe(2);

    state = rollDice(state, fixedRng(0));
    expect(canRoll(state)).toBe(false);
    expect(() => rollDice(state)).toThrow();
  });
});

describe('placing a score: no column is pre-chosen', () => {
  it('can place a rolled result into any column/category the player picks, without a prior selection step', () => {
    let state = createGame(['Ana', 'Beto']);
    state = rollDice(state, fixedRng(0)); // dice = [1,1,1,1,1]

    expect(canPlaceScore(state, 'desordem', 'chance')).toBe(true);
    state = selectCategory(state, 'desordem', 'chance');

    expect(state.players[0].columns.desordem.chance).toBe(5);
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.rollsLeft).toBe(3);
  });

  it('rejects a placement in an already-filled category', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'desordem', 'chance');

    state = rollDice(state, fixedRng(0));
    expect(canPlaceScore(state, 'desordem', 'chance')).toBe(false);
    expect(() => selectCategory(state, 'desordem', 'chance')).toThrow();
  });
});

describe('forced column order (descida/subida)', () => {
  it('descida only accepts the next category in Ases -> Yan order', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0));

    expect(getForcedCategory(getCurrentPlayer(state), 'descida')).toBe('ones');
    expect(canPlaceScore(state, 'descida', 'twos')).toBe(false);
    expect(canPlaceScore(state, 'descida', 'ones')).toBe(true);

    state = selectCategory(state, 'descida', 'ones');
    expect(getForcedCategory(state.players[0], 'descida')).toBe('twos');
  });

  it('subida only accepts the next category in Yan -> Ases order', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0));

    expect(getForcedCategory(getCurrentPlayer(state), 'subida')).toBe('yan');
    expect(canPlaceScore(state, 'subida', 'chance')).toBe(false);

    state = selectCategory(state, 'subida', 'yan');
    expect(getForcedCategory(state.players[0], 'subida')).toBe('chance');
  });
});

describe('seco requires the first roll of the turn, untouched', () => {
  it('accepts a placement right after the first roll', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0));
    expect(canPlaceScore(state, 'seco', 'chance')).toBe(true);
    state = selectCategory(state, 'seco', 'chance');
    expect(state.players[0].columns.seco.chance).toBe(5);
  });

  it('rejects a placement once a second or third roll has happened', () => {
    let state = createGame(['Ana']);
    state = rollDice(state, fixedRng(0));
    state = rollDice(state, fixedRng(0));
    expect(canPlaceScore(state, 'seco', 'chance')).toBe(false);
    expect(() => selectCategory(state, 'seco', 'chance')).toThrow();

    // other columns are unaffected by having rolled more than once
    expect(canPlaceScore(state, 'desordem', 'chance')).toBe(true);
  });
});

describe('a full game', () => {
  it('fills all 4 columns for every player and ends the game', () => {
    let state = createGame(['Ana']);

    for (const column of ['descida', 'subida', 'desordem', 'seco'] as const) {
      const order = column === 'subida' ? backwardOrder : forwardOrder;
      for (const categoryId of order as CategoryId[]) {
        state = rollDice(state, fixedRng(0));
        state = selectCategory(state, column, categoryId);
      }
      expect(isColumnComplete(state.players[0], column)).toBe(true);
    }

    expect(state.isGameOver).toBe(true);
    expect(() => rollDice(state)).toThrow();
  });
});
