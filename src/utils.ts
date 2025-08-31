/**
 * Utility functions for Sudoku game logic
 */

/**
 * Validates user input for a Sudoku cell
 * @param cellValue - The input value to validate
 * @returns true if the input is valid (empty or digit 1-9), false otherwise
 */
export function validateInput(cellValue: string): boolean {
  // Allow empty string or digits 1-9 only
  return cellValue === "" || /^[1-9]$/.test(cellValue);
}

/**
 * Checks for illegal moves in the Sudoku board
 * @param board - The current Sudoku board state (9x9 grid)
 * @returns Object containing array of conflicting cell positions [row, col]
 */
export function checkIllegalMove(board: string[][]): {
  conflicts: [number, number][];
} {
  const conflicts: [number, number][] = [];

  // Check rows for duplicates
  for (let row = 0; row < 9; row++) {
    const seen = new Set<string>();
    for (let col = 0; col < 9; col++) {
      const value = board[row][col];
      if (value !== "." && value !== "") {
        if (seen.has(value)) {
          // Mark all occurrences of this duplicate as conflicts
          for (let c = 0; c < 9; c++) {
            if (board[row][c] === value) {
              conflicts.push([row, c]);
            }
          }
          break; // No need to check further duplicates in this row
        }
        seen.add(value);
      }
    }
  }

  // Check columns for duplicates
  for (let col = 0; col < 9; col++) {
    const seen = new Set<string>();
    for (let row = 0; row < 9; row++) {
      const value = board[row][col];
      if (value !== "." && value !== "") {
        if (seen.has(value)) {
          // Mark all occurrences of this duplicate as conflicts
          for (let r = 0; r < 9; r++) {
            if (board[r][col] === value) {
              // Only add if not already in conflicts
              if (!conflicts.some(([cr, cc]) => cr === r && cc === col)) {
                conflicts.push([r, col]);
              }
            }
          }
          break; // No need to check further duplicates in this column
        }
        seen.add(value);
      }
    }
  }

  // Check 3x3 blocks for duplicates
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const seen = new Set<string>();
      const blockConflicts: [number, number][] = [];

      // Check each cell in the 3x3 block
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = blockRow * 3 + r;
          const col = blockCol * 3 + c;
          const value = board[row][col];

          if (value !== "." && value !== "") {
            if (seen.has(value)) {
              // Mark all occurrences of this duplicate in the block
              blockConflicts.push([row, col]);
            } else {
              seen.add(value);
            }
          }
        }
      }

      // Add block conflicts to main conflicts list if any found
      conflicts.push(...blockConflicts);
    }
  }

  return { conflicts };
}

/**
 * Checks if the Sudoku board is complete and valid
 * @param board - The current Sudoku board state (9x9 grid)
 * @returns true if the board is complete and valid, false otherwise
 */
export function checkCompletion(board: string[][]): boolean {
  // First check if all cells are filled
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === "." || board[row][col] === "") {
        return false; // Board is not complete
      }
    }
  }

  // Check for any conflicts (illegal moves)
  const { conflicts } = checkIllegalMove(board);
  return conflicts.length === 0; // No conflicts means the board is valid
}

/**
 * Fetches a new Sudoku puzzle from an open API
 * @returns Promise that resolves to a 9x9 Sudoku board as string[][]
 */
export async function fetchPuzzle(): Promise<string[][]> {
  try {
    // Using a free Sudoku API (you can replace with any other API)
    // This is a placeholder - you might want to use a real API like:
    // https://sudoku-api.vercel.app/api/dosuku or similar
    const response = await fetch(
      "https://sudoku-api.vercel.app/api/dosuku?query={newboard(limit:1){grids{value}}}"
    );

    if (!response.ok) {
      throw new Error("Failed to fetch puzzle");
    }

    const data = await response.json();

    // Parse the API response to get the puzzle
    if (
      data.newboard &&
      data.newboard.grids &&
      data.newboard.grids.length > 0
    ) {
      const grid = data.newboard.grids[0].value;

      // The API may return either a flat 81-length array or a 9x9 nested array.
      const board: string[][] = [];

      if (Array.isArray(grid) && grid.length === 81) {
        // flat array case
        for (let i = 0; i < 9; i++) {
          board[i] = [];
          for (let j = 0; j < 9; j++) {
            const value = grid[i * 9 + j];
            board[i][j] =
              value === 0 || value === null || value === undefined
                ? "."
                : String(value);
          }
        }
        return board;
      }

      if (Array.isArray(grid) && Array.isArray(grid[0]) && grid.length >= 9) {
        // nested arrays case (grid[row][col])
        for (let i = 0; i < 9; i++) {
          board[i] = [];
          const rowArr = grid[i] || [];
          for (let j = 0; j < 9; j++) {
            const value = rowArr[j];
            board[i][j] =
              value === 0 || value === null || value === undefined
                ? "."
                : String(value);
          }
        }
        return board;
      }
    }

    throw new Error("Invalid API response format");
  } catch (error) {
    console.error("Error fetching puzzle:", error);

    // Fallback to a predefined easy puzzle if API fails
    const fallbackBoard: string[][] = [
      ["5", "3", ".", ".", "7", ".", ".", ".", "."],
      ["6", ".", ".", "1", "9", "5", ".", ".", "."],
      [".", "9", "8", ".", ".", ".", ".", "6", "."],
      ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
      ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
      ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
      [".", "6", ".", ".", ".", ".", "2", "8", "."],
      [".", ".", ".", "4", "1", "9", ".", ".", "5"],
      [".", ".", ".", ".", "8", ".", ".", "7", "9"],
    ];

    return fallbackBoard;
  }
}

/**
 * Creates a deep copy of a Sudoku board
 * @param board - The board to copy
 * @returns A new copy of the board
 */
export function copyBoard(board: string[][]): string[][] {
  return board.map((row) => [...row]);
}
