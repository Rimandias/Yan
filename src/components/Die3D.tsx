import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, View } from 'react-native';

import { DieValue } from '../game/types';

const SIZE = 52;
const HALF = SIZE / 2;
const DEG_RANGE = 100000;
const EXTRA_SPINS = 2;
const SPIN_DURATION = 650;

// 3x3 grid, true = pip visible at that cell.
const PIP_LAYOUT: Record<DieValue, boolean[]> = {
  1: [false, false, false, false, true, false, false, false, false],
  2: [true, false, false, false, false, false, false, false, true],
  3: [true, false, false, false, true, false, false, false, true],
  4: [true, false, true, false, false, false, true, false, true],
  5: [true, false, true, false, true, false, true, false, true],
  6: [true, false, true, true, false, true, true, false, true],
};

// Opposite faces sum to 7: front=1, back=6, top=2, bottom=5, right=3, left=4.
const FACES: { value: DieValue; transform: { rotateX?: string; rotateY?: string; translateZ?: number }[] }[] = [
  { value: 1, transform: [{ translateZ: HALF }] },
  { value: 6, transform: [{ rotateY: '180deg' }, { translateZ: HALF }] },
  { value: 3, transform: [{ rotateY: '90deg' }, { translateZ: HALF }] },
  { value: 4, transform: [{ rotateY: '-90deg' }, { translateZ: HALF }] },
  { value: 2, transform: [{ rotateX: '90deg' }, { translateZ: HALF }] },
  { value: 5, transform: [{ rotateX: '-90deg' }, { translateZ: HALF }] },
];

// Group rotation that brings each value's face to point straight at the viewer.
const RESTING_ROTATION: Record<DieValue, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  6: { x: 0, y: 180 },
  3: { x: 0, y: -90 },
  4: { x: 0, y: 90 },
  2: { x: -90, y: 0 },
  5: { x: 90, y: 0 },
};

function normalizeForwardDelta(current: number, targetDeg: number): number {
  const currentMod = ((current % 360) + 360) % 360;
  const targetMod = ((targetDeg % 360) + 360) % 360;
  const delta = targetMod - currentMod;
  return delta < 0 ? delta + 360 : delta;
}

function toDeg(value: Animated.Value) {
  return value.interpolate({
    inputRange: [-DEG_RANGE, DEG_RANGE],
    outputRange: [`-${DEG_RANGE}deg`, `${DEG_RANGE}deg`],
  });
}

function Pips({ value }: { value: DieValue }) {
  return (
    <View style={styles.grid}>
      {PIP_LAYOUT[value].map((filled, index) => (
        <View key={index} style={styles.pipCell}>
          {filled && <View style={styles.pipDot} />}
        </View>
      ))}
    </View>
  );
}

interface Die3DProps {
  value: DieValue;
  held: boolean;
  disabled?: boolean;
  /** Muda a cada rolagem; dispara a animação de giro para dados não segurados. */
  spinToken: number;
  onPress: () => void;
}

export function Die3D({ value, held, disabled, spinToken, onPress }: Die3DProps) {
  const initial = RESTING_ROTATION[value];
  const rotX = useRef(new Animated.Value(initial.x)).current;
  const rotY = useRef(new Animated.Value(initial.y)).current;
  const rawX = useRef(initial.x);
  const rawY = useRef(initial.y);
  const previousSpinToken = useRef(spinToken);

  useEffect(() => {
    if (spinToken === previousSpinToken.current) return;
    previousSpinToken.current = spinToken;
    if (held) return;

    const target = RESTING_ROTATION[value];
    const nextX = rawX.current + EXTRA_SPINS * 360 + normalizeForwardDelta(rawX.current, target.x);
    const nextY = rawY.current + EXTRA_SPINS * 360 + normalizeForwardDelta(rawY.current, target.y);
    rawX.current = nextX;
    rawY.current = nextY;

    const useNativeDriver = Platform.OS !== 'web';
    Animated.parallel([
      Animated.timing(rotX, {
        toValue: nextX,
        duration: SPIN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
      Animated.timing(rotY, {
        toValue: nextY,
        duration: SPIN_DURATION,
        easing: Easing.out(Easing.cubic),
        useNativeDriver,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinToken]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Dado com valor ${value}${held ? ', segurado' : ''}`}
      disabled={disabled}
      onPress={onPress}
      style={styles.scene}
    >
      <Animated.View
        style={[
          styles.cube,
          {
            transform: [{ perspective: 300 }, { rotateX: toDeg(rotX) }, { rotateY: toDeg(rotY) }],
          },
        ]}
      >
        {FACES.map((face) => (
          <View
            key={face.value}
            style={[styles.face, held && styles.faceHeld, { transform: face.transform as never }]}
          >
            <Pips value={face.value} />
          </View>
        ))}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scene: {
    width: SIZE,
    height: SIZE,
  },
  cube: {
    width: SIZE,
    height: SIZE,
    // RN's ViewStyle types don't declare `transformStyle` yet, but it's supported
    // (RN Web maps it to CSS `transform-style`) and required for the 6 absolutely
    // positioned faces below to compose their 3D transforms with the cube's own
    // rotation instead of being flattened onto it.
    ...({ transformStyle: 'preserve-3d' } as object),
  },
  face: {
    position: 'absolute',
    width: SIZE,
    height: SIZE,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#1f2933',
    padding: 5,
    backfaceVisibility: 'hidden',
  },
  faceHeld: {
    backgroundColor: '#ffe27a',
    borderColor: '#c98a00',
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
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1f2933',
  },
});
