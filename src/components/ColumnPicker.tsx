import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_ORDER, COLUMNS } from '../game/categories';
import { isColumnComplete } from '../game/engine';
import { ColumnId, Player } from '../game/types';

interface ColumnPickerProps {
  player: Player;
  onChooseColumn: (columnId: ColumnId) => void;
}

export function ColumnPicker({ player, onChooseColumn }: ColumnPickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Escolha a coluna desta jogada</Text>
      {COLUMNS.map((column) => {
        const filled = Object.keys(player.columns[column.id]).length;
        const complete = isColumnComplete(player, column.id);

        return (
          <Pressable
            key={column.id}
            disabled={complete}
            onPress={() => onChooseColumn(column.id)}
            style={({ pressed }) => [
              styles.card,
              complete && styles.cardDisabled,
              pressed && !complete && styles.cardPressed,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardLabel}>{column.label}</Text>
              <Text style={styles.cardProgress}>
                {filled}/{CATEGORY_ORDER.length}
              </Text>
            </View>
            <Text style={styles.cardDescription}>{column.description}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    gap: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2933',
    marginBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderColor: '#bcccdc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  cardDisabled: {
    backgroundColor: '#f0f4f8',
    opacity: 0.5,
  },
  cardPressed: {
    opacity: 0.8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2933',
  },
  cardProgress: {
    fontSize: 13,
    color: '#52606d',
  },
  cardDescription: {
    fontSize: 12,
    color: '#52606d',
    marginTop: 2,
  },
});
