/**
 * Sudoku Solver Algorithm
 * Converted from C++ backtracking algorithm to TypeScript
 */

export type SudokuBoard = string[][];

/**
 * Class-based Sudoku Solver with backtracking algorithm
 */
export class SudokuSolver {
  private rows: boolean[][];
  private cols: boolean[][];
  private blocks: boolean[][];

  constructor() {
    // Initialize tracking arrays for rows, columns, and 3x3 blocks
    this.rows = Array.from({ length: 9 }, () => Array(10).fill(false));
    this.cols = Array.from({ length: 9 }, () => Array(10).fill(false));
    this.blocks = Array.from({ length: 9 }, () => Array(10).fill(false));
  }

  /**
   * Main solve function that initializes tracking and starts backtracking
   * @param board - The Sudoku board to solve (9x9 grid)
   * @returns true if solvable, false otherwise
   */
  public solve(board: SudokuBoard): boolean {
    // Reset tracking arrays
    this.initializeTracking(board);

    // Start backtracking from top-left corner
    return this.solveHelper(0, 0, board);
  }

  /**
   * Recursive backtracking helper function
   * @param row - Current row index (0-8)
   * @param col - Current column index (0-8)
   * @param board - The Sudoku board being solved
   * @returns true if solution found, false otherwise
   */
  private solveHelper(row: number, col: number, board: SudokuBoard): boolean {
    // Base case: reached end of board
    if (row === 9) return true;

    // Move to next row when end of current row reached
    if (col === 9) return this.solveHelper(row + 1, 0, board);

    // Skip filled cells
    if (board[row][col] !== ".") return this.solveHelper(row, col + 1, board);

    // Calculate 3x3 block index
    const blockIndex = Math.floor(row / 3) * 3 + Math.floor(col / 3);

    // Try numbers 1-9
    for (let num = 1; num <= 9; num++) {
      if (
        !this.rows[row][num] &&
        !this.cols[col][num] &&
        !this.blocks[blockIndex][num]
      ) {
        // Place number and mark as used
        board[row][col] = num.toString();
        this.rows[row][num] = true;
        this.cols[col][num] = true;
        this.blocks[blockIndex][num] = true;

        // Recurse to next cell
        if (this.solveHelper(row, col + 1, board)) {
          return true;
        }

        // Backtrack: remove number and unmark
        board[row][col] = ".";
        this.rows[row][num] = false;
        this.cols[col][num] = false;
        this.blocks[blockIndex][num] = false;
      }
    }

    return false;
  }

  /**
   * Initialize tracking arrays based on current board state
   * @param board - The Sudoku board
   */
  private initializeTracking(board: SudokuBoard): void {
    // Reset all tracking arrays
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 10; j++) {
        this.rows[i][j] = false;
        this.cols[i][j] = false;
        this.blocks[i][j] = false;
      }
    }

    // Mark existing numbers
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] !== ".") {
          const num = parseInt(board[i][j]);
          const blockIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
          this.rows[i][num] = true;
          this.cols[j][num] = true;
          this.blocks[blockIndex][num] = true;
        }
      }
    }
  }
}

/**
 * Functional version of the Sudoku solver (alternative implementation)
 * @param board - The Sudoku board to solve
 * @returns true if solvable, false otherwise
 */
export function solveSudoku(board: SudokuBoard): boolean {
  const solver = new SudokuSolver();
  return solver.solve(board);
}

/**
 * Create a deep copy of the board for solving without modifying original
 * @param board - The original board
 * @returns A copy of the board
 */
export function copyBoardForSolving(board: SudokuBoard): SudokuBoard {
  return board.map((row) => [...row]);
}

/**
 * Check if a Sudoku board is valid (no conflicts in rows, columns, or blocks)
 * @param board - The Sudoku board to validate
 * @returns true if valid, false if there are conflicts
 */
export function isValidSudoku(board: SudokuBoard): boolean {
  const rows = Array.from({ length: 9 }, () => new Set<string>());
  const cols = Array.from({ length: 9 }, () => new Set<string>());
  const blocks = Array.from({ length: 9 }, () => new Set<string>());

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const value = board[i][j];
      if (value !== ".") {
        const blockIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);

        // Check for duplicates
        if (
          rows[i].has(value) ||
          cols[j].has(value) ||
          blocks[blockIndex].has(value)
        ) {
          return false;
        }

        rows[i].add(value);
        cols[j].add(value);
        blocks[blockIndex].add(value);
      }
    }
  }

  return true;
}

/**
 * Check if a Sudoku board is completely filled and valid
 * @param board - The Sudoku board to check
 * @returns true if complete and valid, false otherwise
 */
export function isCompleteAndValid(board: SudokuBoard): boolean {
  // Check if all cells are filled
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (board[i][j] === ".") {
        return false;
      }
    }
  }

  // Check if the filled board is valid
  return isValidSudoku(board);
}

/**
 * Compare two Sudoku boards and return differences
 * @param currentBoard - The current board state
 * @param solvedBoard - The solved board
 * @returns Object containing comparison results
 */
export function compareBoards(
  currentBoard: SudokuBoard,
  solvedBoard: SudokuBoard
): {
  correctCells: [number, number][];
  incorrectCells: [number, number][];
  emptyCells: [number, number][];
  accuracy: number;
} {
  const correctCells: [number, number][] = [];
  const incorrectCells: [number, number][] = [];
  const emptyCells: [number, number][] = [];
  let totalFilledCells = 0;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const currentValue = currentBoard[i][j];
      const solvedValue = solvedBoard[i][j];

      if (currentValue === ".") {
        emptyCells.push([i, j]);
      } else {
        totalFilledCells++;
        if (currentValue === solvedValue) {
          correctCells.push([i, j]);
        } else {
          incorrectCells.push([i, j]);
        }
      }
    }
  }

  const accuracy =
    totalFilledCells > 0 ? (correctCells.length / totalFilledCells) * 100 : 0;

  return {
    correctCells,
    incorrectCells,
    emptyCells,
    accuracy: Math.round(accuracy * 100) / 100, // Round to 2 decimal places
  };
}

/**
 * Get a hint by revealing one cell from the solved board
 * @param currentBoard - The current board state
 * @param solvedBoard - The solved board
 * @param originalCells - Which cells were originally given
 * @returns Position and value of the hint, or null if no hints available
 */
export function getHint(
  currentBoard: SudokuBoard,
  solvedBoard: SudokuBoard,
  originalCells: boolean[][]
): { row: number; col: number; value: string } | null {
  // Find cells that are empty and not original
  const availableHints: [number, number][] = [];

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (currentBoard[i][j] === "." && !originalCells[i][j]) {
        availableHints.push([i, j]);
      }
    }
  }

  if (availableHints.length === 0) {
    return null; // No hints available
  }

  // Select a random hint
  const randomIndex = Math.floor(Math.random() * availableHints.length);
  const [row, col] = availableHints[randomIndex];

  return {
    row,
    col,
    value: solvedBoard[row][col],
  };
}

/**
 * Validate a single cell against the solved board
 * @param row - Row index
 * @param col - Column index
 * @param value - The value to check
 * @param solvedBoard - The solved board
 * @returns true if the value is correct, false otherwise
 */
export function validateCell(
  row: number,
  col: number,
  value: string,
  solvedBoard: SudokuBoard
): boolean {
  if (value === "." || value === "") {
    return true; // Empty cells are not incorrect
  }

  return value === solvedBoard[row][col];
}

/**
 * Get validation statistics for the current board
 * @param currentBoard - The current board state
 * @param solvedBoard - The solved board
 * @param originalCells - Which cells were originally given
 * @returns Detailed statistics
 */
export function getValidationStats(
  currentBoard: SudokuBoard,
  solvedBoard: SudokuBoard,
  originalCells: boolean[][]
): {
  totalCells: number;
  filledCells: number;
  correctCells: number;
  incorrectCells: number;
  originalCells: number;
  accuracy: number;
  isComplete: boolean;
  isValid: boolean;
} {
  let filledCells = 0;
  let correctCells = 0;
  let originalCount = 0;

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (originalCells[i][j]) {
        originalCount++;
      } else if (currentBoard[i][j] !== ".") {
        filledCells++;
        if (currentBoard[i][j] === solvedBoard[i][j]) {
          correctCells++;
        }
      }
    }
  }

  const totalCells = 81;
  const incorrectCells = filledCells - correctCells;
  const accuracy = filledCells > 0 ? (correctCells / filledCells) * 100 : 0;
  const isComplete = filledCells + originalCount === totalCells;
  const isValid = isValidSudoku(currentBoard) && incorrectCells === 0;

  return {
    totalCells,
    filledCells,
    correctCells,
    incorrectCells,
    originalCells: originalCount,
    accuracy: Math.round(accuracy * 100) / 100,
    isComplete,
    isValid,
  };
}
