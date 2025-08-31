import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  validateInput,
  checkIllegalMove,
  checkCompletion,
  fetchPuzzle,
  copyBoard,
} from "./utils";
import {
  solveSudoku,
  copyBoardForSolving,
  getValidationStats,
} from "./solver/sudokuSolver";
import type { SudokuBoardProps, CellPosition } from "./types/sudoku";
import SolverControls from "./components/SolverControls";
import GameControls from "./components/GameControls";
import SudokuCell from "./components/SudokuCell";
import ValidationStats from "./components/ValidationStats";

const SudokuBoard: React.FC<SudokuBoardProps> = ({
  initialBoard,
  onComplete,
}) => {
  // Board state: 9x9 grid of strings ('.' for empty, '1'-'9' for filled)
  const [board, setBoard] = useState<string[][]>(
    () =>
      initialBoard ||
      Array(9)
        .fill(null)
        .map(() => Array(9).fill("."))
  );

  // Track which cells are part of the original puzzle (not user-editable)
  const [originalCells, setOriginalCells] = useState<boolean[][]>(() =>
    initialBoard
      ? initialBoard.map((row) =>
          row.map((cell) => cell !== "." && cell !== "")
        )
      : Array(9)
          .fill(null)
          .map(() => Array(9).fill(false))
  );

  // Current focused cell position
  const [focusedCell, setFocusedCell] = useState<CellPosition | null>(null);

  // Loading state for fetching puzzles
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Completion state
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Conflicts from illegal moves
  const [conflicts, setConflicts] = useState<[number, number][]>([]);

  // Solver state
  const [isSolving, setIsSolving] = useState<boolean>(false);
  const [solverMessage, setSolverMessage] = useState<string>("");
  const [originalBoard, setOriginalBoard] = useState<string[][] | null>(null);
  const [solvedBoard, setSolvedBoard] = useState<string[][] | null>(null);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [validationStats, setValidationStats] = useState<{
    totalCells: number;
    filledCells: number;
    correctCells: number;
    incorrectCells: number;
    originalCells: number;
    accuracy: number;
    isComplete: boolean;
    isValid: boolean;
  } | null>(null);
  // Completion/modal state management to prevent modal re-opening loops
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showCompletionModal, setShowCompletionModal] =
    useState<boolean>(false);

  // Reference to the board container for keyboard navigation
  const boardRef = useRef<HTMLDivElement>(null);
  // Wrapper ref used for positioning the number pad relative to the board
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  // Number pad UI state and ref
  const [showNumberPad, setShowNumberPad] = useState<boolean>(false);
  const [numberPadPos, setNumberPadPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const numberPadRef = useRef<HTMLDivElement | null>(null);
  // Whether number pad (mouse UI) is enabled (persist in localStorage)
  const [numberPadEnabled, setNumberPadEnabled] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("sudoku:numberPadEnabled");
      return raw === null ? true : raw === "true";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "sudoku:numberPadEnabled",
        numberPadEnabled ? "true" : "false"
      );
    } catch {
      // ignore
    }
    if (!numberPadEnabled) {
      closeNumberPad();
    }
  }, [numberPadEnabled]);

  // Load a new puzzle from API
  const loadNewPuzzle = useCallback(async () => {
    setIsLoading(true);
    try {
      const newBoard = await fetchPuzzle();
      setBoard(copyBoard(newBoard));
      setOriginalCells(
        newBoard.map((row) => row.map((cell) => cell !== "." && cell !== ""))
      );
      setOriginalBoard(copyBoard(newBoard));
      setIsCompleted(false);
      setConflicts([]);
      setFocusedCell(null);
      setHasWon(false);
      setShowCompletionModal(false);
    } catch (error) {
      console.error("Failed to load puzzle:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize board when component mounts or initialBoard changes
  useEffect(() => {
    if (initialBoard) {
      setBoard(copyBoard(initialBoard));
      setOriginalCells(
        initialBoard.map((row) =>
          row.map((cell) => cell !== "." && cell !== "")
        )
      );
      setOriginalBoard(copyBoard(initialBoard));
      setIsCompleted(false);
      setConflicts([]);
      setSolverMessage("");
      setHasWon(false);
      setShowCompletionModal(false);
    } else {
      // If no initial board provided, fetch a new puzzle
      loadNewPuzzle();
    }
  }, [initialBoard, loadNewPuzzle]);

  // Solver functions
  const handleSolve = useCallback(async () => {
    setIsSolving(true);
    setSolverMessage("Solving...");

    // Create a copy of the board to solve
    const boardToSolve = copyBoardForSolving(board);

    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
      const success = solveSudoku(boardToSolve);

      if (success) {
        setBoard(boardToSolve);
        setSolvedBoard(copyBoard(boardToSolve));
        setSolverMessage("Puzzle solved successfully!");
        // mark solved but do not force-open completion modal
        setIsCompleted(true);
        setHasWon(true);
        setShowCompletionModal(false);
      } else {
        setSolverMessage("No solution exists for this puzzle!");
      }

      setIsSolving(false);

      // Clear message after 3 seconds
      setTimeout(() => {
        setSolverMessage("");
      }, 3000);
    }, 100);
  }, [board]);

  const handleResetToOriginal = useCallback(() => {
    if (originalBoard) {
      setBoard(copyBoard(originalBoard));
      setOriginalCells(
        originalBoard.map((row) =>
          row.map((cell) => cell !== "." && cell !== "")
        )
      );
      setIsCompleted(false);
      setConflicts([]);
      setShowValidation(false);
      setValidationStats(null);
      setSolvedBoard(null);
      setHasWon(false);
      setShowCompletionModal(false);
      setSolverMessage("Reset to original puzzle!");
      setTimeout(() => setSolverMessage(""), 2000);
    }
  }, [originalBoard]);

  // Validation functions
  const handleValidateSolution = useCallback(() => {
    if (!solvedBoard) {
      setSolverMessage("Please solve the puzzle first!");
      setTimeout(() => setSolverMessage(""), 3000);
      return;
    }

    const stats = getValidationStats(board, solvedBoard, originalCells);
    setValidationStats(stats);
    setShowValidation(true);

    if (stats.isComplete && stats.isValid) {
      setSolverMessage("Congratulations! Board is complete and correct!");
      setIsCompleted(true);
    } else if (stats.isComplete) {
      setSolverMessage(
        `Board is complete but has ${stats.incorrectCells} incorrect cells.`
      );
    } else {
      setSolverMessage(
        `Board has ${stats.filledCells}/${
          81 - stats.originalCells
        } filled cells with ${stats.accuracy}% accuracy.`
      );
    }

    setTimeout(() => setSolverMessage(""), 5000);
  }, [board, solvedBoard, originalCells]);

  const handleToggleValidation = useCallback(() => {
    setShowValidation(!showValidation);
    if (!showValidation && solvedBoard) {
      const stats = getValidationStats(board, solvedBoard, originalCells);
      setValidationStats(stats);
    }
  }, [showValidation, solvedBoard, board, originalCells]);

  // Update conflicts whenever board changes
  useEffect(() => {
    const { conflicts: newConflicts } = checkIllegalMove(board);
    setConflicts(newConflicts);

    // Check if board is completed; only trigger completion once until reset
    if (checkCompletion(board) && !hasWon) {
      setIsCompleted(true);
      setHasWon(true);
      setShowCompletionModal(true);
      onComplete?.();
    }
  }, [board, hasWon, onComplete]);

  // Handle cell value change
  const handleCellChange = (row: number, col: number, value: string) => {
    if (originalCells[row][col]) return; // Don't allow editing original cells

    // Validate input
    if (!validateInput(value)) return;

    const newBoard = copyBoard(board);
    newBoard[row][col] = value;
    setBoard(newBoard);
  };

  // Handle keyboard navigation and input
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    row: number,
    col: number
  ) => {
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        navigateToCell(Math.max(0, row - 1), col);
        break;
      case "ArrowDown":
        e.preventDefault();
        navigateToCell(Math.min(8, row + 1), col);
        break;
      case "ArrowLeft":
        e.preventDefault();
        navigateToCell(row, Math.max(0, col - 1));
        break;
      case "ArrowRight":
        e.preventDefault();
        navigateToCell(row, Math.min(8, col + 1));
        break;
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          navigateToCell(row, Math.max(0, col - 1));
        } else {
          navigateToCell(row, Math.min(8, col + 1));
        }
        break;
      case "Backspace":
      case "Delete":
        handleCellChange(row, col, "");
        break;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        handleCellChange(row, col, e.key);
        // Move to next cell automatically
        if (col < 8) {
          navigateToCell(row, col + 1);
        } else if (row < 8) {
          navigateToCell(row + 1, 0);
        }
        break;
      default:
        // Prevent any other input
        if (!/^[1-9]$/.test(e.key)) {
          e.preventDefault();
        }
    }
  };

  // Navigate to a specific cell and focus it
  const navigateToCell = (row: number, col: number) => {
    setFocusedCell({ row, col });
    // Focus will be handled by the useEffect that watches focusedCell
  };

  // Handle cell click to focus
  const handleCellClick = (row: number, col: number) => {
    if (!originalCells[row][col]) {
      // focus and open number pad near this cell
      setFocusedCell({ row, col });
      if (numberPadEnabled) openNumberPad(row, col);
    }
  };

  // Open number pad positioned near the cell
  const openNumberPad = (row: number, col: number) => {
    setShowNumberPad(true);
    // compute position relative to boardRef
    requestAnimationFrame(() => {
      if (!boardRef.current) return;
      const cellId = `cell-${row}-${col}`;
      const cellEl = boardRef.current.querySelector(
        `#${cellId}`
      ) as HTMLElement | null;
      if (!cellEl) return;
      const boardRect = (
        boardWrapperRef.current ?? boardRef.current
      ).getBoundingClientRect();
      const cellRect = cellEl.getBoundingClientRect();
      // approximate pad size to avoid clipping
      const PAD_WIDTH = 140; // px
      const PAD_HEIGHT = 160; // px
      let top = cellRect.bottom - boardRect.top + 8; // small offset
      let left = cellRect.left - boardRect.left;
      // if pad would overflow right edge of board, shift left
      if (left + PAD_WIDTH > boardRect.width) {
        left = Math.max(8, boardRect.width - PAD_WIDTH - 8);
      }
      // if pad would overflow bottom of board, show above cell
      if (top + PAD_HEIGHT > boardRect.height) {
        top = Math.max(8, cellRect.top - boardRect.top - PAD_HEIGHT - 8);
      }
      setNumberPadPos({ top, left });
    });
  };

  // Close number pad
  const closeNumberPad = () => {
    setShowNumberPad(false);
    setNumberPadPos(null);
  };

  // Auto-focus the focused cell
  useEffect(() => {
    if (focusedCell && boardRef.current) {
      const cellId = `cell-${focusedCell.row}-${focusedCell.col}`;
      const cellElement = boardRef.current.querySelector(
        `#${cellId}`
      ) as HTMLInputElement;
      if (cellElement && !originalCells[focusedCell.row][focusedCell.col]) {
        cellElement.focus();
        cellElement.select();
      }
    }
  }, [focusedCell, originalCells]);

  // Close number pad on outside click or Escape
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (showNumberPad) {
        if (
          numberPadRef.current &&
          !numberPadRef.current.contains(target) &&
          boardRef.current &&
          !boardRef.current.contains(target)
        ) {
          closeNumberPad();
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNumberPad();
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNumberPad]);

  // Check if a cell has a conflict
  const hasConflict = (row: number, col: number): boolean => {
    return conflicts.some(([r, c]) => r === row && c === col);
  };

  // Check if a cell is related to focused cell (same row/col/block)
  const isRelatedCell = (row: number, col: number): boolean => {
    if (!focusedCell) return false;
    const fr = focusedCell.row;
    const fc = focusedCell.col;
    if (row === fr || col === fc) return true;
    if (
      Math.floor(row / 3) === Math.floor(fr / 3) &&
      Math.floor(col / 3) === Math.floor(fc / 3)
    )
      return true;
    return false;
  };

  // Get validation state for a cell
  const getCellValidationState = (
    row: number,
    col: number
  ): "correct" | "incorrect" | "empty" | null => {
    if (!showValidation || !solvedBoard || originalCells[row][col]) {
      return null;
    }

    const currentValue = board[row][col];
    const solvedValue = solvedBoard[row][col];

    if (currentValue === ".") {
      return "empty";
    }

    return currentValue === solvedValue ? "correct" : "incorrect";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Loading puzzle...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Sudoku
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill the grid with numbers 1-9. Each row, column, and 3×3 block must
          contain all numbers exactly once.
        </p>
      </div>

      {/* Game Board (wrapped so keypad positions relative to it) */}
      <div ref={boardWrapperRef} className="relative inline-block">
        <div
          ref={boardRef}
          className={`grid grid-cols-9 gap-0 border-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg transition-all duration-300 ${
            isSolving ? "sudoku-solving" : ""
          }`}
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <SudokuCell
                key={`cell-${rowIndex}-${colIndex}`}
                value={cell}
                isOriginal={originalCells[rowIndex][colIndex]}
                hasConflict={hasConflict(rowIndex, colIndex)}
                isFocused={
                  focusedCell?.row === rowIndex && focusedCell?.col === colIndex
                }
                isRelated={isRelatedCell(rowIndex, colIndex)}
                isCompleted={isCompleted}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onChange={(value) =>
                  handleCellChange(rowIndex, colIndex, value)
                }
                onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                cellId={`cell-${rowIndex}-${colIndex}`}
                validationState={getCellValidationState(rowIndex, colIndex)}
                showValidation={showValidation}
              />
            ))
          )}
        </div>

        {/* Number pad for mouse input */}
        {showNumberPad && numberPadPos && (
          <div
            ref={(el) => {
              numberPadRef.current = el;
            }}
            className="absolute z-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg grid grid-cols-3 gap-2"
            style={{ top: numberPadPos.top, left: numberPadPos.left }}
          >
            {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
              <button
                key={`np-${n}`}
                onClick={() => {
                  if (!focusedCell) return;
                  handleCellChange(focusedCell.row, focusedCell.col, String(n));
                  closeNumberPad();
                }}
                className="w-10 h-10 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => {
                if (!focusedCell) return;
                handleCellChange(focusedCell.row, focusedCell.col, "");
                closeNumberPad();
              }}
              className="col-span-3 mt-1 px-2 py-1 text-sm rounded-md bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Solver Controls */}
      <SolverControls
        isSolving={isSolving}
        solverMessage={solverMessage}
        hasOriginalBoard={!!originalBoard}
        showValidation={showValidation}
        onSolve={handleSolve}
        onCheckSolution={handleValidateSolution}
        onResetToOriginal={handleResetToOriginal}
        onToggleValidation={handleToggleValidation}
      />

      {/* Validation Stats */}
      {validationStats && (
        <ValidationStats
          stats={validationStats}
          showValidation={showValidation}
        />
      )}

      {/* Game Controls */}
      <GameControls
        isLoading={isLoading}
        numberPadEnabled={numberPadEnabled}
        onLoadNewPuzzle={loadNewPuzzle}
        onClearAll={() => {
          const newBoard = Array(9)
            .fill(null)
            .map(() => Array(9).fill("."));
          setBoard(newBoard);
          setOriginalCells(
            Array(9)
              .fill(null)
              .map(() => Array(9).fill(false))
          );
          setOriginalBoard(null);
          setSolvedBoard(null);
          setIsCompleted(false);
          setConflicts([]);
          setFocusedCell(null);
          setShowValidation(false);
          setValidationStats(null);
        }}
        onToggleNumberPad={setNumberPadEnabled}
      />

      {/* Completion Celebration */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-2xl animate-bounce">
            <h2 className="text-4xl font-bold text-green-600 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              You solved the Sudoku puzzle!
            </p>
            <button
              onClick={() => setShowCompletionModal(false)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md text-center">
        <p className="mb-2">
          <strong>Controls:</strong> Use arrow keys or Tab to navigate. Type
          numbers 1-9 to fill cells.
        </p>
        <p>
          <strong>Tips:</strong> Red highlights indicate conflicts. Original
          numbers are shown in darker cells.
        </p>
      </div>
    </div>
  );
};

export default SudokuBoard;
