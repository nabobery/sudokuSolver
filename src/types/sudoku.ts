/**
 * TypeScript types and interfaces for the Sudoku application
 */

export type SudokuBoard = string[][];

export type SudokuCell = string;

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuBoardProps {
  initialBoard?: SudokuBoard;
  onComplete?: () => void;
}

export interface SudokuSolverState {
  isSolving: boolean;
  solverMessage: string;
  originalBoard: SudokuBoard | null;
}

export interface SudokuGameState {
  board: SudokuBoard;
  originalCells: boolean[][];
  focusedCell: CellPosition | null;
  isCompleted: boolean;
  conflicts: [number, number][];
  isLoading: boolean;
}

export interface NumberPadState {
  showNumberPad: boolean;
  numberPadPos: { top: number; left: number } | null;
  numberPadEnabled: boolean;
}

export type SolverMessageType =
  | "solving"
  | "success"
  | "error"
  | "warning"
  | "info";

export interface SolverMessage {
  type: SolverMessageType;
  text: string;
  duration?: number; // in milliseconds
}
