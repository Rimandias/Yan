import { Pressable, StyleSheet, Text, View } from 'react-native';

import { LOWER_CATEGORIES, UPPER_BONUS_AMOUNT, UPPER_BONUS_THRESHOLD, UPPER_CATEGORIES } from '../game/categories';
import { scoreForCategory } from '../game/scoring';
import { computeTotals } from '../game/totals';
import { CategoryId, DieValue, Player } from '../game/types';

interface ScoreTableProps {
  player: Player;
  dice: DieValue[];
  canScore: boolean;
  onSelectCategory: (categoryId: CategoryId) => void;
}

function ScoreRow({
  label,
  categoryId,
  player,
  dice,
  canScore,
  onSelectCategory,
}: {
  label: string;
  categoryId: CategoryId;
  player: Player;
  dice: DieValue[];
  canScore: boolean;
  onSelectCategory: (categoryId: CategoryId) => void;
}) {
  const scored = player.scores[categoryId];
  const isScored = scored !== undefined;
  const preview = isScored ? null : scoreForCategory(categoryId, dice);
  const interactive = canScore && !isScored;

  return (
    <Pressable
      disabled={!interactive}
      onPress={() => onSelectCategory(categoryId)}
      style={styles.row}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, isScored && styles.rowValueScored, interactive && styles.rowValuePreview]}>
        {isScored ? scored : canScore ? preview : '-'}
      </Text>
    </Pressable>
  );
}

export function ScoreTable({ player, dice, canScore, onSelectCategory }: ScoreTableProps) {
  const totals = computeTotals(player);

  return (
    <View style={styles.container}>
      {UPPER_CATEGORIES.map((category) => (
        <ScoreRow
          key={category.id}
          label={category.label}
          categoryId={category.id}
          player={player}
          dice={dice}
          canScore={canScore}
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
          player={player}
          dice={dice}
          canScore={canScore}
          onSelectCategory={onSelectCategory}
        />
      ))}

      <View style={styles.divider} />

      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{totals.grandTotal}</Text>
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
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  summaryLabel: {
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
