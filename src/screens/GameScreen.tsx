import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiceTray } from '../components/DiceTray';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScoreBoard } from '../components/ScoreBoard';
import { CATEGORY_ORDER, getColumnDefinition } from '../game/categories';
import {
  canPlaceScore,
  getCurrentPlayer,
  getForcedCategory,
  rollDice,
  rollsUsedThisTurn,
  selectCategory,
  toggleHold,
} from '../game/engine';
import { computePlayerTotal } from '../game/totals';
import { CategoryId, ColumnId, GameState, MAX_ROLLS_PER_TURN, Player } from '../game/types';

interface GameScreenProps {
  gameState: GameState;
  onUpdateGame: (nextState: GameState) => void;
  onNewGame: () => void;
}

function explainRejection(
  gameState: GameState,
  currentPlayer: Player,
  columnId: ColumnId,
  categoryId: CategoryId,
): string {
  if (gameState.rollsLeft === MAX_ROLLS_PER_TURN) {
    return 'Role os dados antes de pontuar.';
  }
  if (categoryId in currentPlayer.columns[columnId]) {
    return 'Essa jogada já foi preenchida nessa coluna.';
  }

  const definition = getColumnDefinition(columnId);
  if (definition.requiresFirstRollOnly && rollsUsedThisTurn(gameState) !== 1) {
    return 'No Seco só vale o resultado da 1ª rolagem do turno.';
  }
  if (definition.order !== 'free') {
    const forced = getForcedCategory(currentPlayer, columnId);
    const forcedLabel = CATEGORY_ORDER.find((category) => category.id === forced)?.label;
    return `Nessa coluna a próxima jogada precisa ser: ${forcedLabel}.`;
  }
  return 'Não é possível colocar essa pontuação aqui agora.';
}

export function GameScreen({ gameState, onUpdateGame, onNewGame }: GameScreenProps) {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (gameState.isGameOver) {
    return <GameOverScreen gameState={gameState} onNewGame={onNewGame} />;
  }

  const currentPlayer = getCurrentPlayer(gameState);
  const rolled = gameState.rollsLeft < MAX_ROLLS_PER_TURN;

  const handleSelectCell = (columnId: ColumnId, categoryId: CategoryId) => {
    if (!canPlaceScore(gameState, columnId, categoryId)) {
      setFeedback(explainRejection(gameState, currentPlayer, columnId, categoryId));
      return;
    }
    setFeedback(null);
    onUpdateGame(selectCategory(gameState, columnId, categoryId));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.turnLabel}>Vez de {currentPlayer.name}</Text>

      <DiceTray
        dice={gameState.dice}
        heldDice={gameState.heldDice}
        rollsLeft={gameState.rollsLeft}
        onToggleHold={(index) => onUpdateGame(toggleHold(gameState, index))}
        onRoll={() => {
          setFeedback(null);
          onUpdateGame(rollDice(gameState));
        }}
      />

      {feedback ? (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      ) : null}

      <ScoreBoard
        player={currentPlayer}
        dice={gameState.dice}
        rolled={rolled}
        onSelectCell={handleSelectCell}
      />
    </ScrollView>
  );
}

function GameOverScreen({ gameState, onNewGame }: { gameState: GameState; onNewGame: () => void }) {
  const ranked = [...gameState.players]
    .map((player) => ({ player, total: computePlayerTotal(player) }))
    .sort((a, b) => b.total - a.total);

  return (
    <ScrollView contentContainerStyle={styles.gameOverContainer}>
      <Text style={styles.title}>Fim de jogo!</Text>
      <Text style={styles.winner}>🏆 {ranked[0].player.name}</Text>

      {ranked.map(({ player, total }, index) => (
        <View key={player.id} style={styles.resultRow}>
          <Text style={styles.resultRank}>{index + 1}º</Text>
          <Text style={styles.resultName}>{player.name}</Text>
          <Text style={styles.resultScore}>{total}</Text>
        </View>
      ))}

      <View style={styles.newGameButton}>
        <PrimaryButton label="Novo jogo" onPress={onNewGame} />
      </View>
    </ScrollView>
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
  feedbackBanner: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff4e5',
    borderWidth: 1,
    borderColor: '#f0b429',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  feedbackText: {
    fontSize: 13,
    color: '#8a5a00',
    textAlign: 'center',
  },
  gameOverContainer: {
    flexGrow: 1,
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
