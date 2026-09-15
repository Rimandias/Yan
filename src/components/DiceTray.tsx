import { StyleSheet, Text, View } from 'react-native';

import { DieValue, MAX_ROLLS_PER_TURN } from '../game/types';
import { Die3D } from './Die3D';
import { PrimaryButton } from './PrimaryButton';

interface DiceTrayProps {
  dice: DieValue[];
  heldDice: boolean[];
  rollsLeft: number;
  rollSequence: number;
  onToggleHold: (index: number) => void;
  onRoll: () => void;
}

export function DiceTray({
  dice,
  heldDice,
  rollsLeft,
  rollSequence,
  onToggleHold,
  onRoll,
}: DiceTrayProps) {
  const hasRolledThisTurn = rollsLeft < MAX_ROLLS_PER_TURN;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {dice.map((value, index) => (
          <Die3D
            key={index}
            value={value}
            held={heldDice[index]}
            disabled={!hasRolledThisTurn}
            spinToken={rollSequence}
            onPress={() => onToggleHold(index)}
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {hasRolledThisTurn ? 'Toque num dado para segurá-lo' : 'Role os dados para começar'}
      </Text>
      <PrimaryButton
        label={rollsLeft > 0 ? `Rolar (${rollsLeft} restante${rollsLeft === 1 ? '' : 's'})` : 'Sem rolagens'}
        onPress={onRoll}
        disabled={rollsLeft <= 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9e2ec',
    paddingVertical: 10,
    paddingHorizontal: 14,
    shadowColor: '#1f2933',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  hint: {
    color: '#52606d',
    fontSize: 11,
  },
});
