import { scoreForCategory } from '../scoring';
import { DieValue } from '../types';

const dice = (...values: DieValue[]) => values;

describe('scoreForCategory', () => {
  it('scores upper section categories by summing matching dice', () => {
    expect(scoreForCategory('threes', dice(3, 3, 5, 6, 1))).toBe(6);
    expect(scoreForCategory('sixes', dice(1, 2, 3, 4, 5))).toBe(0);
  });

  it('scores two pairs as twice the sum of the two highest paired values', () => {
    expect(scoreForCategory('twoPairs', dice(2, 2, 4, 4, 6))).toBe(2 * (2 + 4));
    expect(scoreForCategory('twoPairs', dice(1, 1, 1, 5, 5))).toBe(2 * (1 + 5));
    expect(scoreForCategory('twoPairs', dice(1, 2, 3, 4, 5))).toBe(0);
  });

  it('scores three of a kind as the sum of all dice, or 0', () => {
    expect(scoreForCategory('threeOfAKind', dice(2, 2, 2, 5, 6))).toBe(17);
    expect(scoreForCategory('threeOfAKind', dice(1, 2, 3, 4, 5))).toBe(0);
  });

  it('scores four of a kind as the sum of all dice, or 0', () => {
    expect(scoreForCategory('fourOfAKind', dice(4, 4, 4, 4, 2))).toBe(18);
    expect(scoreForCategory('fourOfAKind', dice(4, 4, 4, 3, 2))).toBe(0);
  });

  it('scores a full house as 25 only for a true pair + triple', () => {
    expect(scoreForCategory('fullHouse', dice(2, 2, 3, 3, 3))).toBe(25);
    expect(scoreForCategory('fullHouse', dice(2, 2, 2, 2, 2))).toBe(0);
    expect(scoreForCategory('fullHouse', dice(1, 2, 3, 4, 5))).toBe(0);
  });

  it('scores small straights as 30', () => {
    expect(scoreForCategory('smallStraight', dice(1, 2, 3, 4, 6))).toBe(30);
    expect(scoreForCategory('smallStraight', dice(2, 3, 4, 5, 2))).toBe(30);
    expect(scoreForCategory('smallStraight', dice(1, 1, 2, 4, 6))).toBe(0);
  });

  it('scores large straights as 40', () => {
    expect(scoreForCategory('largeStraight', dice(1, 2, 3, 4, 5))).toBe(40);
    expect(scoreForCategory('largeStraight', dice(2, 3, 4, 5, 6))).toBe(40);
    expect(scoreForCategory('largeStraight', dice(1, 2, 3, 4, 4))).toBe(0);
  });

  it('scores chance as the sum of all dice', () => {
    expect(scoreForCategory('chance', dice(1, 2, 3, 4, 5))).toBe(15);
  });

  it('scores yan as 50 only when all five dice match', () => {
    expect(scoreForCategory('yan', dice(6, 6, 6, 6, 6))).toBe(50);
    expect(scoreForCategory('yan', dice(6, 6, 6, 6, 5))).toBe(0);
  });
});
