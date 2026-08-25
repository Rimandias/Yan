import { computeTotals } from '../totals';
import { Player } from '../types';

describe('computeTotals', () => {
  it('adds the upper bonus once the upper section reaches the threshold', () => {
    const player: Player = {
      id: 'p1',
      name: 'Ana',
      scores: { ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18 },
    };
    const totals = computeTotals(player);
    expect(totals.upperSum).toBe(63);
    expect(totals.upperBonus).toBe(35);
    expect(totals.grandTotal).toBe(63 + 35);
  });

  it('gives no bonus when the upper section is below the threshold', () => {
    const player: Player = { id: 'p1', name: 'Ana', scores: { ones: 1, twos: 2 } };
    const totals = computeTotals(player);
    expect(totals.upperBonus).toBe(0);
    expect(totals.grandTotal).toBe(3);
  });

  it('adds the lower section on top of the upper total and bonus', () => {
    const player: Player = {
      id: 'p1',
      name: 'Ana',
      scores: { ones: 1, chance: 20, yahtzee: 50 },
    };
    const totals = computeTotals(player);
    expect(totals.lowerSum).toBe(70);
    expect(totals.grandTotal).toBe(71);
  });
});
