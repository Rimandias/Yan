import { Pressable, StyleSheet, View } from 'react-native';

import { DieValue } from '../game/types';

// 3x3 grid, true = pip visible at that cell.
const PIP_LAYOUT: Record<DieValue, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

interface DieProps {
  value: DieValue;
  held: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function Die({ value, held, disabled, onPress }: DieProps) {
  const pips = PIP_LAYOUT[value];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dado com valor ${value}${held ? ', segurado' : ''}`}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.die,
        held && styles.dieHeld,
        pressed && styles.diePressed,
      ]}
    >
      <View style={styles.grid}>
        {pips.map((filled, index) => (
          <View key={index} style={styles.pipCell}>
            {filled && <View style={styles.pipDot} />}
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  die: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1f2933',
    padding: 6,
  },
  dieHeld: {
    backgroundColor: '#ffe27a',
    borderColor: '#c98a00',
  },
  diePressed: {
    opacity: 0.7,
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pipCell: {
    width: '33.33%',
    height: '33.33%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1f2933',
  },
});
