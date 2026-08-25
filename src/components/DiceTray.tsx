import { StyleSheet, Text, View } from 'react-native';

import { DieValue, MAX_ROLLS_PER_TURN } from '../game/types';
import { Die } from './Die';
import { PrimaryButton } from './PrimaryButton';

interface DiceTrayProps {
  dice: DieValue[];
  heldDice: boolean[];
  rollsLeft: number;
  onToggleHold: (index: number) => void;
  onRoll: () => void;
}

export function DiceTray({ dice, heldDice, rollsLeft, onToggleHold, onRoll }: DiceTrayProps) {
  const hasRolledThisTurn = rollsLeft < MAX_ROLLS_PER_TURN;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {dice.map((value, index) => (
          <Die
            key={index}
            value={value}
            held={heldDice[index]}
            disabled={!hasRolledThisTurn}
            onPress={() => onToggleHold(index)}
          />
        ))}
      </View>
      <Text style={styles.hint}>
        {hasRolledThisTurn ? 'Toque num dado para segurá-lo' : 'Role os dados para começar'}
      </Text>
      <PrimaryButton
        label={rollsLeft > 0 ? `Rolar dados (${rollsLeft} restante${rollsLeft === 1 ? '' : 's'})` : 'Sem rolagens'}
        onPress={onRoll}
        disabled={rollsLeft <= 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  hint: {
    color: '#52606d',
    fontSize: 13,
  },
});
