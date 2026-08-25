import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiceTray } from '../components/DiceTray';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScoreTable } from '../components/ScoreTable';
import { canSelectCategory, getCurrentPlayer, rollDice, selectCategory, toggleHold } from '../game/engine';
import { computeTotals } from '../game/totals';
import { CategoryId, GameState } from '../game/types';

interface GameScreenProps {
  gameState: GameState;
  onUpdateGame: (nextState: GameState) => void;
  onNewGame: () => void;
}

export function GameScreen({ gameState, onUpdateGame, onNewGame }: GameScreenProps) {
  if (gameState.isGameOver) {
    return <GameOverScreen gameState={gameState} onNewGame={onNewGame} />;
  }

  const currentPlayer = getCurrentPlayer(gameState);
  const rolledThisTurn = gameState.rollsLeft < 3;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.turnLabel}>Vez de {currentPlayer.name}</Text>

      <DiceTray
        dice={gameState.dice}
        heldDice={gameState.heldDice}
        rollsLeft={gameState.rollsLeft}
        onToggleHold={(index) => onUpdateGame(toggleHold(gameState, index))}
        onRoll={() => onUpdateGame(rollDice(gameState))}
      />

      <View style={styles.scoreTableWrapper}>
        <ScoreTable
          player={currentPlayer}
          dice={gameState.dice}
          canScore={rolledThisTurn}
          onSelectCategory={(categoryId: CategoryId) => {
            if (!canSelectCategory(gameState, categoryId)) return;
            onUpdateGame(selectCategory(gameState, categoryId));
          }}
        />
      </View>
    </ScrollView>
  );
}

function GameOverScreen({ gameState, onNewGame }: { gameState: GameState; onNewGame: () => void }) {
  const ranked = [...gameState.players]
    .map((player) => ({ player, totals: computeTotals(player) }))
    .sort((a, b) => b.totals.grandTotal - a.totals.grandTotal);

  return (
    <View style={styles.gameOverContainer}>
      <Text style={styles.title}>Fim de jogo!</Text>
      <Text style={styles.winner}>🏆 {ranked[0].player.name}</Text>

      {ranked.map(({ player, totals }, index) => (
        <View key={player.id} style={styles.resultRow}>
          <Text style={styles.resultRank}>{index + 1}º</Text>
          <Text style={styles.resultName}>{player.name}</Text>
          <Text style={styles.resultScore}>{totals.grandTotal}</Text>
        </View>
      ))}

      <View style={styles.newGameButton}>
        <PrimaryButton label="Novo jogo" onPress={onNewGame} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  turnLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2933',
  },
  scoreTableWrapper: {
    width: '100%',
    maxWidth: 360,
  },
  gameOverContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2933',
  },
  winner: {
    fontSize: 20,
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    maxWidth: 280,
    paddingVertical: 6,
  },
  resultRank: {
    width: 32,
    fontWeight: '700',
    color: '#1f2933',
  },
  resultName: {
    flex: 1,
    color: '#1f2933',
  },
  resultScore: {
    fontWeight: '700',
    color: '#1f2933',
  },
  newGameButton: {
    marginTop: 24,
    width: '100%',
    maxWidth: 280,
  },
});
