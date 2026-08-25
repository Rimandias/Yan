import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  LOWER_CATEGORIES,
  UPPER_BONUS_AMOUNT,
  UPPER_BONUS_THRESHOLD,
  UPPER_CATEGORIES,
  WHOLE_COLUMN_BONUS_AMOUNT,
} from '../game/categories';
import { scoreForCategory } from '../game/scoring';
import { computeColumnTotals } from '../game/totals';
import { CategoryId, ColumnScores, DieValue } from '../game/types';

interface ScoreTableProps {
  columnScores: ColumnScores;
  dice: DieValue[];
  selectableCategories: CategoryId[];
  onSelectCategory: (categoryId: CategoryId) => void;
}

function ScoreRow({
  label,
  categoryId,
  columnScores,
  dice,
  selectableCategories,
  onSelectCategory,
}: {
  label: string;
  categoryId: CategoryId;
  columnScores: ColumnScores;
  dice: DieValue[];
  selectableCategories: CategoryId[];
  onSelectCategory: (categoryId: CategoryId) => void;
}) {
  const scored = columnScores[categoryId];
  const isScored = scored !== undefined;
  const isSelectable = !isScored && selectableCategories.includes(categoryId);
  const preview = isSelectable ? scoreForCategory(categoryId, dice) : null;

  return (
    <Pressable
      disabled={!isSelectable}
      onPress={() => onSelectCategory(categoryId)}
      style={styles.row}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, isScored && styles.rowValueScored, isSelectable && styles.rowValuePreview]}>
        {isScored ? scored : isSelectable ? preview : '-'}
      </Text>
    </Pressable>
  );
}

export function ScoreTable({ columnScores, dice, selectableCategories, onSelectCategory }: ScoreTableProps) {
  const totals = computeColumnTotals(columnScores);

  return (
    <View style={styles.container}>
      {UPPER_CATEGORIES.map((category) => (
        <ScoreRow
          key={category.id}
          label={category.label}
          categoryId={category.id}
          columnScores={columnScores}
          dice={dice}
          selectableCategories={selectableCategories}
          onSelectCategory={onSelectCategory}
        />
      ))}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Soma superior</Text>
        <Text style={styles.summaryValue}>{totals.upperSum}</Text>
      </View>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Bônus ({UPPER_BONUS_THRESHOLD}+ = {UPPER_BONUS_AMOUNT})
        </Text>
        <Text style={styles.summaryValue}>{totals.upperBonus}</Text>
      </View>

      <View style={styles.divider} />

      {LOWER_CATEGORIES.map((category) => (
        <ScoreRow
          key={category.id}
          label={category.label}
          categoryId={category.id}
          columnScores={columnScores}
          dice={dice}
          selectableCategories={selectableCategories}
          onSelectCategory={onSelectCategory}
        />
      ))}

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>
          Bônus coluna completa (sem riscar, com bônus superior)
        </Text>
        <Text style={styles.summaryValue}>{totals.wholeColumnBonus}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total da coluna</Text>
        <Text style={styles.totalValue}>{totals.columnTotal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#d9e2ec',
  },
  rowLabel: {
    fontSize: 15,
    color: '#1f2933',
  },
  rowValue: {
    fontSize: 15,
    color: '#9aa5b1',
    minWidth: 30,
    textAlign: 'right',
  },
  rowValueScored: {
    color: '#1f2933',
    fontWeight: '700',
  },
  rowValuePreview: {
    color: '#1f6feb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  summaryLabel: {
    flexShrink: 1,
    fontSize: 13,
    color: '#52606d',
  },
  summaryValue: {
    fontSize: 13,
    color: '#52606d',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#bcccdc',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2933',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2933',
  },
});
