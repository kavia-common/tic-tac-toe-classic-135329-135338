import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Animated,
  Easing,
} from 'react-native';

/**
 * Ocean Professional Theme tokens
 */
const theme = {
  name: 'Ocean Professional',
  colors: {
    primary: '#2563EB', // blue
    secondary: '#F59E0B', // amber
    success: '#F59E0B',
    error: '#EF4444',
    gradientStart: '#3B82F6', // used for subtle bg gradient
    gradientEnd: '#F3F4F6',
    background: '#f9fafb',
    surface: '#ffffff',
    text: '#111827',
    muted: '#6B7280',
    border: '#E5E7EB',
    shadow: 'rgba(0,0,0,0.08)',
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
  },
  spacing: (n: number) => 4 * n,
};

/**
 * Types
 */
type Player = 'X' | 'O';
type CellValue = Player | null;

type GameMode = 'HUMAN' | 'AI';

type GameState = {
  board: CellValue[];
  currentPlayer: Player;
  winner: Player | 'DRAW' | null;
  isGameOver: boolean;
  mode: GameMode;
};

/**
 * Utility functions
 */

// PUBLIC_INTERFACE
export function checkWinner(board: CellValue[]): Player | 'DRAW' | null {
  /** Determine the winner of a 3x3 board. Returns 'X', 'O', 'DRAW', or null when no terminal state. */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diags
  ];
  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every((c) => c !== null)) {
    return 'DRAW';
  }
  return null;
}

// PUBLIC_INTERFACE
export function getAvailableMoves(board: CellValue[]): number[] {
  /** Return indices of empty cells on the board. */
  const moves: number[] = [];
  board.forEach((v, i) => {
    if (v === null) moves.push(i);
  });
  return moves;
}

// PUBLIC_INTERFACE
export function aiChooseMove(board: CellValue[], aiPlayer: Player): number {
  /** Basic AI: try to win, block opponent, then pick center, corner, side. */
  const human: Player = aiPlayer === 'X' ? 'O' : 'X';
  const avail = getAvailableMoves(board);

  // Try to win
  for (const i of avail) {
    const copy = [...board];
    copy[i] = aiPlayer;
    if (checkWinner(copy) === aiPlayer) return i;
  }

  // Block opponent
  for (const i of avail) {
    const copy = [...board];
    copy[i] = human;
    if (checkWinner(copy) === human) return i;
  }

  // Pick center
  if (avail.includes(4)) return 4;

  // Pick any corner
  const corners = [0, 2, 6, 8].filter((i) => avail.includes(i));
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  // Pick any side
  const sides = [1, 3, 5, 7].filter((i) => avail.includes(i));
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];

  // Fallback
  return avail[0] ?? 0;
}

/**
 * UI Components
 */

function ModeToggle({
  mode,
  onChange,
}: {
  mode: GameMode;
  onChange: (mode: GameMode) => void;
}) {
  return (
    <View style={styles.modeToggle}>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange('HUMAN')}
        style={({ pressed }) => [
          styles.modeButton,
          {
            backgroundColor:
              mode === 'HUMAN' ? theme.colors.primary : theme.colors.surface,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text
          style={[
            styles.modeButtonText,
            { color: mode === 'HUMAN' ? '#fff' : theme.colors.text },
          ]}
        >
          2 Players
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange('AI')}
        style={({ pressed }) => [
          styles.modeButton,
          {
            backgroundColor:
              mode === 'AI' ? theme.colors.secondary : theme.colors.surface,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text
          style={[
            styles.modeButtonText,
            { color: mode === 'AI' ? '#111' : theme.colors.text },
          ]}
        >
          Vs AI
        </Text>
      </Pressable>
    </View>
  );
}

function ControlBar({
  onReset,
  onNew,
  disabledNew,
}: {
  onReset: () => void;
  onNew: () => void;
  disabledNew?: boolean;
}) {
  return (
    <View style={styles.controlsRow}>
      <Pressable
        accessibilityRole="button"
        onPress={onReset}
        style={({ pressed }) => [
          styles.controlBtn,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text style={[styles.controlBtnText, { color: theme.colors.primary }]}>
          Reset
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onNew}
        disabled={disabledNew}
        style={({ pressed }) => [
          styles.controlBtn,
          {
            backgroundColor: theme.colors.primary,
            opacity: disabledNew ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <Text style={[styles.controlBtnText, { color: '#fff' }]}>New Game</Text>
      </Pressable>
    </View>
  );
}

function Cell({
  value,
  onPress,
  highlight,
}: {
  value: CellValue;
  onPress: () => void;
  highlight?: boolean;
}) {
  const scale = useMemo(() => new Animated.Value(0.95), []);
  useEffect(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 250,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, [value]);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.cell,
        {
          backgroundColor: highlight ? '#ECF2FF' : theme.colors.surface,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <Animated.Text
        style={[
          styles.cellText,
          {
            transform: [{ scale }],
            color:
              value === 'X'
                ? theme.colors.primary
                : value === 'O'
                ? theme.colors.secondary
                : theme.colors.text,
          },
        ]}
      >
        {value ?? ''}
      </Animated.Text>
    </Pressable>
  );
}

function Board({
  board,
  onCellPress,
  winLine,
}: {
  board: CellValue[];
  onCellPress: (index: number) => void;
  winLine: number[] | null;
}) {
  return (
    <View style={styles.board}>
      {board.map((v, i) => (
        <Cell
          key={i}
          value={v}
          onPress={() => onCellPress(i)}
          highlight={winLine ? winLine.includes(i) : false}
        />
      ))}
    </View>
  );
}

/**
 * Root App
 */
export default function App() {
  const [game, setGame] = useState<GameState>({
    board: Array<CellValue>(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    mode: 'AI',
  });

  const [winLine, setWinLine] = useState<number[] | null>(null);

  const statusText = useMemo(() => {
    if (game.winner === 'DRAW') return "It's a draw!";
    if (game.winner === 'X' || game.winner === 'O')
      return `Player ${game.winner} wins 🎉`;
    return `Turn: Player ${game.currentPlayer}`;
  }, [game]);

  // Find win line for highlighting when game ends
  const computeWinLine = (board: CellValue[]): number[] | null => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (const l of lines) {
      const [a, b, c] = l;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return l;
    }
    return null;
  };

  const handleCellPress = (index: number) => {
    if (game.isGameOver || game.board[index] !== null) return;

    setGame((prev) => {
      const board = [...prev.board];
      board[index] = prev.currentPlayer;

      const result = checkWinner(board);
      const isGameOver = result !== null;
      const winner = result;

      const nextPlayer: Player = prev.currentPlayer === 'X' ? 'O' : 'X';

      if (isGameOver) {
        setWinLine(computeWinLine(board));
      } else {
        setWinLine(null);
      }

      return {
        ...prev,
        board,
        currentPlayer: isGameOver ? prev.currentPlayer : nextPlayer,
        winner,
        isGameOver,
      };
    });
  };

  // AI move when mode is AI and it's O's turn (by default human plays X first).
  useEffect(() => {
    if (
      game.mode === 'AI' &&
      !game.isGameOver &&
      game.currentPlayer === 'O'
    ) {
      const timeout = setTimeout(() => {
        setGame((prev) => {
          if (prev.isGameOver) return prev;
          const board = [...prev.board];
          const move = aiChooseMove(board, 'O');
          if (board[move] !== null) return prev;
          board[move] = 'O';

          const result = checkWinner(board);
          const isGameOver = result !== null;
          const winner = result;

          if (isGameOver) {
            setWinLine(computeWinLine(board));
          } else {
            setWinLine(null);
          }

          return {
            ...prev,
            board,
            currentPlayer: isGameOver ? prev.currentPlayer : 'X',
            winner,
            isGameOver,
          };
        });
      }, 450); // Small delay for UX
      return () => clearTimeout(timeout);
    }
  }, [game.mode, game.currentPlayer, game.isGameOver, game.board]);

  const handleReset = () => {
    setGame((prev) => ({
      ...prev,
      board: Array<CellValue>(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
    }));
    setWinLine(null);
  };

  const handleNewGame = () => {
    setGame({
      board: Array<CellValue>(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      mode: game.mode,
    });
    setWinLine(null);
  };

  const handleModeChange = (mode: GameMode) => {
    setGame({
      board: Array<CellValue>(9).fill(null),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      mode,
    });
    setWinLine(null);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.headerCard}>
          <Text style={styles.title}>Tic Tac Toe</Text>
          <ModeToggle mode={game.mode} onChange={handleModeChange} />
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>

        <View style={styles.boardCard}>
          <Board
            board={game.board}
            onCellPress={handleCellPress}
            winLine={winLine}
          />
        </View>

        <View style={styles.footerCard}>
          <ControlBar
            onReset={handleReset}
            onNew={handleNewGame}
            disabledNew={!game.isGameOver && game.board.every((c) => c === null)}
          />
          <Text style={styles.helperText}>
            Ocean Professional theme • Smooth and minimalist interactions
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  root: {
    flex: 1,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    gap: theme.spacing(3),
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: 0.3,
    marginBottom: theme.spacing(2),
  },
  statusPill: {
    marginTop: theme.spacing(2),
    alignSelf: 'flex-start',
    backgroundColor: '#F3F6FF',
    borderRadius: 999,
    paddingVertical: theme.spacing(1.5),
    paddingHorizontal: theme.spacing(3),
    borderWidth: 1,
    borderColor: '#E6ECFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
  modeButton: {
    flex: 1,
    paddingVertical: theme.spacing(2.5),
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  boardCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(3),
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
    justifyContent: 'center',
  },
  board: {
    aspectRatio: 1,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: '#F8FAFF',
    borderRadius: theme.radius.md,
  },
  cell: {
    width: '30.5%',
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cellText: {
    fontSize: 44,
    fontWeight: '900',
  },
  footerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing(3),
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: theme.spacing(2),
  },
  controlBtn: {
    flex: 1,
    paddingVertical: theme.spacing(2.5),
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  controlBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  helperText: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
    color: theme.colors.muted,
    fontSize: 12,
  },
});
