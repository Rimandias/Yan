import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { createGame } from './src/game/engine';
import { GameState } from './src/game/types';
import { GameScreen } from './src/screens/GameScreen';
import { NewGameScreen } from './src/screens/NewGameScreen';

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {gameState ? (
        <GameScreen
          gameState={gameState}
          onUpdateGame={setGameState}
          onNewGame={() => setGameState(null)}
        />
      ) : (
        <NewGameScreen onStartGame={(names) => setGameState(createGame(names))} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
});
