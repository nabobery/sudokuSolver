import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  validateInput,
  checkIllegalMove,
  checkCompletion,
  fetchPuzzle,
  copyBoard,
} from "./utils";

interface SudokuBoardProps {
  initialBoard?: string[][];
  onComplete?: () => void;
}

interface CellPosition {
  row: number;
  col: number;
}

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
      setIsCompleted(false);
      setConflicts([]);
      setFocusedCell(null);
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
      setIsCompleted(false);
      setConflicts([]);
    } else {
      // If no initial board provided, fetch a new puzzle
      loadNewPuzzle();
    }
  }, [initialBoard, loadNewPuzzle]);

  // Update conflicts whenever board changes
  useEffect(() => {
    const { conflicts: newConflicts } = checkIllegalMove(board);
    setConflicts(newConflicts);

    // Check if board is completed
    if (checkCompletion(board) && !isCompleted) {
      setIsCompleted(true);
      onComplete?.();
    }
  }, [board, isCompleted, onComplete]);

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

  // Get cell styling classes
  const getCellClasses = (row: number, col: number): string => {
    const baseClasses =
      "w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-200";

    // Add border styling for 3x3 blocks
    let borderClasses = "";
    if (row % 3 === 0 && row !== 0)
      borderClasses += " border-t-2 border-t-gray-800 dark:border-t-gray-200";
    if (col % 3 === 0 && col !== 0)
      borderClasses += " border-l-2 border-l-gray-800 dark:border-l-gray-200";

    // Highlight focused cell and related cells
    const isFocused = focusedCell?.row === row && focusedCell?.col === col;
    const related = isRelatedCell(row, col);
    const focusClasses = isFocused
      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30"
      : related
      ? "bg-blue-50 dark:bg-blue-900/10"
      : "";

    // Conflict styling
    const conflictClasses = hasConflict(row, col)
      ? "bg-red-100 dark:bg-red-900/30 border-red-400"
      : "";

    // Original cell styling (darker background)
    const originalClasses = originalCells[row][col]
      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
      : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer";

    // Completion celebration
    const celebrationClasses = isCompleted ? "animate-graffiti" : "";

    return `${baseClasses} ${borderClasses} ${focusClasses} ${conflictClasses} ${originalClasses} ${celebrationClasses}`;
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
          className="grid grid-cols-9 gap-0 border-2 border-gray-800 dark:border-gray-200 bg-white dark:bg-gray-900 p-2 rounded-lg shadow-lg"
        >
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                className={`${getCellClasses(rowIndex, colIndex)} sudoku-cell`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {originalCells[rowIndex][colIndex] ? (
                  <span className="text-gray-800 dark:text-gray-200">
                    {cell}
                  </span>
                ) : (
                  <input
                    id={`cell-${rowIndex}-${colIndex}`}
                    type="text"
                    value={cell === "." ? "" : cell}
                    onChange={(e) =>
                      handleCellChange(rowIndex, colIndex, e.target.value)
                    }
                    onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    className="w-full h-full text-center bg-transparent border-none outline-none text-xl font-bold"
                    maxLength={1}
                    disabled={originalCells[rowIndex][colIndex]}
                  />
                )}
              </div>
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

      {/* Controls */}
      <div className="flex gap-4">
        {/* Toggle for number pad */}
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={numberPadEnabled}
            onChange={(e) => setNumberPadEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Enable number pad</span>
        </label>
        <button
          onClick={loadNewPuzzle}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200"
          disabled={isLoading}
        >
          New Puzzle
        </button>
        <button
          onClick={() => {
            const newBoard = Array(9)
              .fill(null)
              .map(() => Array(9).fill("."));
            setBoard(newBoard);
            setOriginalCells(
              Array(9)
                .fill(null)
                .map(() => Array(9).fill(false))
            );
            setIsCompleted(false);
            setConflicts([]);
            setFocusedCell(null);
          }}
          className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
        >
          Clear Board
        </button>
      </div>

      {/* Completion Celebration */}
      {isCompleted && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-2xl animate-bounce">
            <h2 className="text-4xl font-bold text-green-600 mb-4">
              🎉 Congratulations! 🎉
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              You solved the Sudoku puzzle!
            </p>
            <button
              onClick={() => setIsCompleted(false)}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors duration-200"
            >
              Play Again
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
