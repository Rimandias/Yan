import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_ORDER, COLUMNS } from '../game/categories';
import { scoreForCategory } from '../game/scoring';
import { computeColumnTotals } from '../game/totals';
import { CategoryId, ColumnId, DieValue, Player } from '../game/types';

interface ScoreBoardProps {
  player: Player;
  dice: DieValue[];
  /** Se já rolou ao menos uma vez neste turno (controla o preview e se as células respondem ao toque). */
  rolled: boolean;
  onSelectCell: (columnId: ColumnId, categoryId: CategoryId) => void;
}

const ROW_HEIGHT = 32;
const DATA_COL_WIDTH = 76;

export function ScoreBoard({ player, dice, rolled, onSelectCell }: ScoreBoardProps) {
  const columnTotals = COLUMNS.map((column) => computeColumnTotals(player.columns[column.id]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Placar de {player.name}</Text>
      <View style={styles.board}>
        <View style={styles.labelColumn}>
          <View style={styles.headerCell} />
          {CATEGORY_ORDER.map((category) => (
            <Text key={category.id} style={styles.labelCell} numberOfLines={1}>
              {category.label}
            </Text>
          ))}
          <Text style={styles.labelCell}>Soma superior</Text>
          <Text style={styles.labelCell}>Bônus superior</Text>
          <Text style={styles.labelCell}>Bônus coluna</Text>
          <Text style={[styles.labelCell, styles.totalLabelCell]}>Total</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator>
          <View style={styles.dataColumns}>
            {COLUMNS.map((column, columnIndex) => {
              const totals = columnTotals[columnIndex];
              const scores = player.columns[column.id];

              return (
                <View key={column.id} style={styles.dataColumn}>
                  <Text style={styles.headerCellText}>{column.label}</Text>
                  {CATEGORY_ORDER.map((category) => {
                    const scored = scores[category.id];
                    const isFilled = scored !== undefined;
                    const preview = !isFilled && rolled ? scoreForCategory(category.id, dice) : null;

                    return (
                      <Pressable
                        key={category.id}
                        accessibilityRole="button"
                        accessibilityLabel={`${column.label} - ${category.label}`}
                        disabled={isFilled || !rolled}
                        onPress={() => onSelectCell(column.id, category.id)}
                        style={styles.dataCellPressable}
                      >
                        <Text
                          style={[
                            styles.dataCell,
                            isFilled ? styles.dataCellFilled : styles.dataCellPreview,
                          ]}
                        >
                          {isFilled ? scored : preview ?? '-'}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Text style={styles.dataCell}>{totals.upperSum}</Text>
                  <Text style={styles.dataCell}>{totals.upperBonus}</Text>
                  <Text style={styles.dataCell}>{totals.wholeColumnBonus}</Text>
                  <Text style={[styles.dataCell, styles.totalDataCell]}>{totals.columnTotal}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52606d',
    marginBottom: 6,
  },
  board: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d9e2ec',
    borderRadius: 8,
    overflow: 'hidden',
  },
  labelColumn: {
    backgroundColor: '#f0f4f8',
    borderRightWidth: 1,
    borderRightColor: '#d9e2ec',
    minWidth: 110,
  },
  headerCell: {
    height: ROW_HEIGHT,
  },
  headerCellText: {
    height: ROW_HEIGHT,
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2933',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  labelCell: {
    height: ROW_HEIGHT,
    fontSize: 11,
    color: '#1f2933',
    paddingHorizontal: 6,
    textAlignVertical: 'center',
  },
  totalLabelCell: {
    fontWeight: '700',
  },
  dataColumns: {
    flexDirection: 'row',
  },
  dataColumn: {
    width: DATA_COL_WIDTH,
    borderRightWidth: 1,
    borderRightColor: '#d9e2ec',
  },
  dataCellPressable: {
    height: ROW_HEIGHT,
    justifyContent: 'center',
  },
  dataCell: {
    height: ROW_HEIGHT,
    fontSize: 12,
    color: '#1f2933',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  dataCellPreview: {
    color: '#1f6feb',
  },
  dataCellFilled: {
    color: '#1f2933',
    fontWeight: '700',
  },
  totalDataCell: {
    fontWeight: '700',
    color: '#1f2933',
  },
});
