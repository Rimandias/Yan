import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.turnLabel}>Vez de {currentPlayer.name}</Text>
        {feedback ? (
          <Text style={styles.feedbackText} numberOfLines={2}>
            {feedback}
          </Text>
        ) : null}
      </View>

      <View style={styles.boardArea}>
        <ScoreBoard
          player={currentPlayer}
          dice={gameState.dice}
          rolled={rolled}
          onSelectCell={handleSelectCell}
        />

        <View style={styles.diceOverlay} pointerEvents="box-none">
          <DiceTray
            dice={gameState.dice}
            heldDice={gameState.heldDice}
            rollsLeft={gameState.rollsLeft}
            rollSequence={gameState.rollSequence}
            onToggleHold={(index) => onUpdateGame(toggleHold(gameState, index))}
            onRoll={() => {
              setFeedback(null);
              onUpdateGame(rollDice(gameState));
            }}
          />
        </View>
      </View>
    </View>
  );
}

function GameOverScreen({ gameState, onNewGame }: { gameState: GameState; onNewGame: () => void }) {
  const ranked = [...gameState.players]
    .map((player) => ({ player, total: computePlayerTotal(player) }))
    .sort((a, b) => b.total - a.total);

  return (
    <View style={styles.gameOverContainer}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 12,
    gap: 8,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  turnLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2933',
  },
  feedbackText: {
    fontSize: 12,
    color: '#8a5a00',
    textAlign: 'center',
  },
  boardArea: {
    flex: 1,
    position: 'relative',
  },
  diceOverlay: {
    position: 'absolute',
    top: '28%',
    left: 0,
    right: 0,
    alignItems: 'center',
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
