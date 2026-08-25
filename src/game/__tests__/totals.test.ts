import { CATEGORY_ORDER } from '../categories';
import { computeColumnTotals, computePlayerTotal } from '../totals';
import { ColumnScores, Player } from '../types';

function fullColumn(overrides: ColumnScores = {}): ColumnScores {
  // 1 point in every category by default, so every cell is "scored" (non-zero).
  const base: ColumnScores = {};
  for (const category of CATEGORY_ORDER) base[category.id] = 1;
  return { ...base, ...overrides };
}

describe('computeColumnTotals', () => {
  it('gives the upper bonus once the upper section reaches 60', () => {
    const totals = computeColumnTotals({
      ones: 5,
      twos: 10,
      threes: 15,
      fours: 12,
      fives: 10,
      sixes: 12,
    });
    expect(totals.upperSum).toBe(64);
    expect(totals.upperBonus).toBe(40);
  });

  it('gives no upper bonus below 60', () => {
    const totals = computeColumnTotals({ ones: 1, twos: 2 });
    expect(totals.upperBonus).toBe(0);
  });

  it('grants the whole-column bonus only when the column is complete, has no scratches, and reached the upper bonus', () => {
    const column = fullColumn({
      ones: 5,
      twos: 10,
      threes: 15,
      fours: 12,
      fives: 10,
      sixes: 12,
    });
    const totals = computeColumnTotals(column);
    expect(totals.isComplete).toBe(true);
    expect(totals.upperBonus).toBe(40);
    expect(totals.wholeColumnBonus).toBe(40);
  });

  it('denies the whole-column bonus if any category was scratched (scored 0)', () => {
    const column = fullColumn({
      ones: 5,
      twos: 10,
      threes: 15,
      fours: 12,
      fives: 10,
      sixes: 12,
      chance: 0,
    });
    const totals = computeColumnTotals(column);
    expect(totals.upperBonus).toBe(40);
    expect(totals.wholeColumnBonus).toBe(0);
  });

  it('denies the whole-column bonus if the upper bonus was not reached, even with no scratches', () => {
    const column = fullColumn();
    const totals = computeColumnTotals(column);
    expect(totals.upperBonus).toBe(0);
    expect(totals.wholeColumnBonus).toBe(0);
  });

  it('is not complete when categories are still missing', () => {
    const totals = computeColumnTotals({ ones: 1 });
    expect(totals.isComplete).toBe(false);
  });
});

describe('computePlayerTotal', () => {
  it('sums the column totals across all 4 columns', () => {
    const player: Player = {
      id: 'p1',
      name: 'Ana',
      columns: {
        descida: { ones: 3, chance: 10 },
        subida: { yan: 50 },
        desordem: {},
        seco: {},
      },
    };
    expect(computePlayerTotal(player)).toBe(3 + 10 + 50);
  });
});
