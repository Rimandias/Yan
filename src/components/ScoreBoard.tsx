import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';

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

// header + 14 jogadas + 4 linhas de resumo (soma sup., bônus sup., bônus coluna, total)
const TOTAL_ROWS = 1 + CATEGORY_ORDER.length + 4;
const LABEL_COLUMN_RATIO = 0.28;
const MIN_LABEL_WIDTH = 92;

export function ScoreBoard({ player, dice, rolled, onSelectCell }: ScoreBoardProps) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setSize({ width, height });
  };

  const labelColumnWidth = Math.max(MIN_LABEL_WIDTH, Math.round(size.width * LABEL_COLUMN_RATIO));
  const dataColumnWidth = size.width > 0 ? (size.width - labelColumnWidth) / COLUMNS.length : 0;
  const rowHeight = size.height > 0 ? size.height / TOTAL_ROWS : 0;

  const columnTotals = COLUMNS.map((column) => computeColumnTotals(player.columns[column.id]));
  const ready = size.width > 0 && size.height > 0;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {ready ? (
        <View style={styles.board}>
          <View style={[styles.labelColumn, { width: labelColumnWidth }]}>
            <View style={{ height: rowHeight }} />
            {CATEGORY_ORDER.map((category) => (
              <Text
                key={category.id}
                style={[styles.labelCell, { height: rowHeight }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {category.label}
              </Text>
            ))}
            <Text style={[styles.labelCell, { height: rowHeight }]} numberOfLines={1} adjustsFontSizeToFit>
              Soma superior
            </Text>
            <Text style={[styles.labelCell, { height: rowHeight }]} numberOfLines={1} adjustsFontSizeToFit>
              Bônus superior
            </Text>
            <Text style={[styles.labelCell, { height: rowHeight }]} numberOfLines={1} adjustsFontSizeToFit>
              Bônus coluna
            </Text>
            <Text
              style={[styles.labelCell, styles.totalLabelCell, { height: rowHeight }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              Total
            </Text>
          </View>

          <View style={styles.dataColumns}>
            {COLUMNS.map((column, columnIndex) => {
              const totals = columnTotals[columnIndex];
              const scores = player.columns[column.id];

              return (
                <View key={column.id} style={[styles.dataColumn, { width: dataColumnWidth }]}>
                  <Text
                    style={[styles.headerCellText, { height: rowHeight }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {column.label}
                  </Text>
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
                        style={[styles.dataCellPressable, { height: rowHeight }]}
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
                  <Text style={[styles.dataCell, { height: rowHeight }]}>{totals.upperSum}</Text>
                  <Text style={[styles.dataCell, { height: rowHeight }]}>{totals.upperBonus}</Text>
                  <Text style={[styles.dataCell, { height: rowHeight }]}>{totals.wholeColumnBonus}</Text>
                  <Text style={[styles.dataCell, styles.totalDataCell, { height: rowHeight }]}>
                    {totals.columnTotal}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  board: {
    flex: 1,
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
  },
  headerCellText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1f2933',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  labelCell: {
    fontSize: 11,
    color: '#1f2933',
    paddingHorizontal: 6,
    textAlignVertical: 'center',
  },
  totalLabelCell: {
    fontWeight: '700',
  },
  dataColumns: {
    flex: 1,
    flexDirection: 'row',
  },
  dataColumn: {
    borderRightWidth: 1,
    borderRightColor: '#d9e2ec',
  },
  dataCellPressable: {
    justifyContent: 'center',
  },
  dataCell: {
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
