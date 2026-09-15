import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { PrimaryButton } from '../components/PrimaryButton';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 4;

interface NewGameScreenProps {
  onStartGame: (playerNames: string[]) => void;
}

function defaultNames(count: number): string[] {
  return Array.from({ length: count }, (_, index) => `Jogador ${index + 1}`);
}

export function NewGameScreen({ onStartGame }: NewGameScreenProps) {
  const [names, setNames] = useState<string[]>(defaultNames(2));

  const updateName = (index: number, value: string) => {
    setNames((current) => current.map((name, i) => (i === index ? value : name)));
  };

  const addPlayer = () => {
    if (names.length >= MAX_PLAYERS) return;
    setNames((current) => [...current, `Jogador ${current.length + 1}`]);
  };

  const removePlayer = () => {
    if (names.length <= MIN_PLAYERS) return;
    setNames((current) => current.slice(0, -1));
  };

  const startGame = () => {
    const cleaned = names.map((name, index) => name.trim() || `Jogador ${index + 1}`);
    onStartGame(cleaned);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Yan</Text>
      <Text style={styles.subtitle}>Quem vai jogar?</Text>

      {names.map((name, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={name}
          onChangeText={(value) => updateName(index, value)}
          placeholder={`Jogador ${index + 1}`}
          maxLength={20}
        />
      ))}

      <View style={styles.playerCountRow}>
        <PrimaryButton label="- Jogador" onPress={removePlayer} disabled={names.length <= MIN_PLAYERS} />
        <PrimaryButton label="+ Jogador" onPress={addPlayer} disabled={names.length >= MAX_PLAYERS} />
      </View>

      <View style={styles.startButton}>
        <PrimaryButton label="Começar jogo" onPress={startGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1f2933',
  },
  subtitle: {
    fontSize: 16,
    color: '#52606d',
    marginBottom: 12,
  },
  input: {
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: '#bcccdc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  playerCountRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  startButton: {
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
  },
});
