import { CATEGORY_ORDER } from '../categories';
import {
  canRoll,
  canSelectCategory,
  chooseColumn,
  createGame,
  getAvailableCategories,
  getAvailableColumns,
  getCurrentPlayer,
  getForcedCategory,
  isColumnComplete,
  rollDice,
  selectCategory,
  toggleHold,
} from '../engine';
import { CategoryId } from '../types';

const fixedRng = (value: number) => () => value;
const forwardOrder = CATEGORY_ORDER.map((category) => category.id);
const backwardOrder = [...forwardOrder].reverse();

describe('createGame', () => {
  it('creates each player with 4 empty columns and no active column', () => {
    const state = createGame(['Ana', 'Beto']);
    expect(state.players).toHaveLength(2);
    expect(state.players[0].columns).toEqual({
      descida: {},
      subida: {},
      desordem: {},
      seco: {},
    });
    expect(state.activeColumn).toBeNull();
    expect(getAvailableColumns(state.players[0])).toEqual([
      'descida',
      'subida',
      'desordem',
      'seco',
    ]);
  });
});

describe('chooseColumn', () => {
  it('sets rollsLeft according to the column rules (3 normally, 1 for seco)', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'descida');
    expect(state.activeColumn).toBe('descida');
    expect(state.rollsLeft).toBe(3);

    state = createGame(['Ana']);
    state = chooseColumn(state, 'seco');
    expect(state.rollsLeft).toBe(1);
  });

  it('refuses to roll or hold before a column is chosen', () => {
    const state = createGame(['Ana']);
    expect(() => rollDice(state)).toThrow();
    expect(() => toggleHold(state, 0)).toThrow();
  });
});

describe('forced column order', () => {
  it('descida forces Ases -> Yan, one category at a time', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'descida');
    expect(getForcedCategory(getCurrentPlayer(state), 'descida')).toBe('ones');

    state = rollDice(state, fixedRng(0));
    expect(() => selectCategory(state, 'twos')).toThrow();
    state = selectCategory(state, 'ones');

    expect(getForcedCategory(state.players[0], 'descida')).toBe('twos');
  });

  it('subida forces Yan -> Ases, one category at a time', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'subida');
    expect(getForcedCategory(getCurrentPlayer(state), 'subida')).toBe('yan');

    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'yan');

    expect(getForcedCategory(state.players[0], 'subida')).toBe('chance');
  });
});

describe('free column order (desordem/seco)', () => {
  it('lets the player pick any unfilled category', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'desordem');
    expect(getAvailableCategories(getCurrentPlayer(state), 'desordem')).toEqual(forwardOrder);

    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'fullHouse');
    expect('fullHouse' in state.players[0].columns.desordem).toBe(true);
    expect(getAvailableCategories(state.players[0], 'desordem')).not.toContain('fullHouse');
  });

  it('seco only allows a single roll and no holding', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'seco');
    state = rollDice(state, fixedRng(0));

    expect(canRoll(state)).toBe(false);
    expect(() => rollDice(state)).toThrow();
    expect(() => toggleHold(state, 0)).toThrow();
  });
});

describe('selectCategory', () => {
  it('scores into the chosen column, clears the active column, and advances the turn', () => {
    let state = createGame(['Ana', 'Beto']);
    state = chooseColumn(state, 'desordem');
    state = rollDice(state, fixedRng(0)); // dice = [1,1,1,1,1]
    state = selectCategory(state, 'chance');

    expect(state.players[0].columns.desordem.chance).toBe(5);
    expect(state.activeColumn).toBeNull();
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('refuses to score a category that is not available in the active column', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'desordem');
    state = rollDice(state, fixedRng(0));
    state = selectCategory(state, 'chance');

    state = chooseColumn(state, 'desordem');
    state = rollDice(state, fixedRng(0));
    expect(() => selectCategory(state, 'chance')).toThrow();
  });
});

describe('a full game', () => {
  it('fills all 4 columns for every player and ends the game', () => {
    let state = createGame(['Ana']);

    for (const column of ['descida', 'subida', 'desordem', 'seco'] as const) {
      const order = column === 'subida' ? backwardOrder : forwardOrder;
      for (const categoryId of order as CategoryId[]) {
        state = chooseColumn(state, column);
        state = rollDice(state, fixedRng(0));
        state = selectCategory(state, categoryId);
      }
      expect(isColumnComplete(state.players[0], column)).toBe(true);
    }

    expect(state.isGameOver).toBe(true);
    expect(() => chooseColumn(state, 'descida')).toThrow();
  });
});

describe('canSelectCategory', () => {
  it('is false before rolling and true only for available categories after rolling', () => {
    let state = createGame(['Ana']);
    state = chooseColumn(state, 'descida');
    expect(canSelectCategory(state, 'ones')).toBe(false);

    state = rollDice(state, fixedRng(0));
    expect(canSelectCategory(state, 'ones')).toBe(true);
    expect(canSelectCategory(state, 'twos')).toBe(false);
  });
});
