import {
  CATEGORY_ORDER,
  COLUMNS,
  LOWER_CATEGORIES,
  UPPER_BONUS_AMOUNT,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  WHOLE_COLUMN_BONUS_AMOUNT,
} from './categories';
import { ColumnScores, Player } from './types';

export interface ColumnTotals {
  upperSum: number;
  upperBonus: number;
  lowerSum: number;
  wholeColumnBonus: number;
  columnTotal: number;
  isComplete: boolean;
}

export function computeColumnTotals(column: ColumnScores): ColumnTotals {
  const upperSum = UPPER_CATEGORIES.reduce(
    (total, category) => total + (column[category.id] ?? 0),
    0,
  );
  const upperBonus = upperSum >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS_AMOUNT : 0;
  const lowerSum = LOWER_CATEGORIES.reduce(
    (total, category) => total + (column[category.id] ?? 0),
    0,
  );

  const isComplete = CATEGORY_ORDER.every((category) => category.id in column);
  const hasNoScratches =
    isComplete && CATEGORY_ORDER.every((category) => (column[category.id] ?? 0) > 0);
  // O bônus de coluna inteira só é concedido se o bônus da seção superior também foi alcançado.
  const wholeColumnBonus = hasNoScratches && upperBonus > 0 ? WHOLE_COLUMN_BONUS_AMOUNT : 0;

  return {
    upperSum,
    upperBonus,
    lowerSum,
    wholeColumnBonus,
    columnTotal: upperSum + upperBonus + lowerSum + wholeColumnBonus,
    isComplete,
  };
}

export function computePlayerTotal(player: Player): number {
  return COLUMNS.reduce(
    (total, column) => total + computeColumnTotals(player.columns[column.id]).columnTotal,
    0,
  );
}

export function hasCompletedScorecard(player: Player): boolean {
  return COLUMNS.every((column) => computeColumnTotals(player.columns[column.id]).isComplete);
}
