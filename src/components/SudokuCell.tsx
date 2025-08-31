import React from "react";

interface SudokuCellProps {
  value: string;
  isOriginal: boolean;
  hasConflict: boolean;
  isFocused: boolean;
  isRelated: boolean;
  isCompleted: boolean;
  onClick: () => void;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  cellId: string;
  validationState?: "correct" | "incorrect" | "empty" | null;
  showValidation?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({
  value,
  isOriginal,
  hasConflict,
  isFocused,
  isRelated,
  isCompleted,
  onClick,
  onChange,
  onKeyDown,
  cellId,
  validationState = null,
  showValidation = false,
}) => {
  const getCellClasses = () => {
    const baseClasses =
      "w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-200";

    // Add border styling for 3x3 blocks
    let borderClasses = "";
    const row = parseInt(cellId.split("-")[1]);
    const col = parseInt(cellId.split("-")[2]);

    if (row % 3 === 0 && row !== 0)
      borderClasses += " border-t-2 border-t-gray-800 dark:border-t-gray-200";
    if (col % 3 === 0 && col !== 0)
      borderClasses += " border-l-2 border-l-gray-800 dark:border-l-gray-200";

    // Highlight focused cell and related cells
    const focusClasses = isFocused
      ? "ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/30"
      : isRelated
      ? "bg-blue-50 dark:bg-blue-900/10"
      : "";

    // Conflict styling
    const conflictClasses = hasConflict
      ? "bg-red-100 dark:bg-red-900/30 border-red-400"
      : "";

    // Original cell styling (darker background)
    const originalClasses = isOriginal
      ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
      : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer";

    // Completion celebration
    const celebrationClasses = isCompleted ? "animate-graffiti" : "";

    // Validation styling
    let validationClasses = "";
    if (showValidation && !isOriginal && validationState) {
      switch (validationState) {
        case "correct":
          validationClasses =
            "bg-green-100 dark:bg-green-900/30 border-green-400";
          break;
        case "incorrect":
          validationClasses = "bg-red-100 dark:bg-red-900/30 border-red-400";
          break;
        case "empty":
          validationClasses =
            "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-300";
          break;
      }
    }

    return `${baseClasses} ${borderClasses} ${focusClasses} ${conflictClasses} ${originalClasses} ${celebrationClasses} ${validationClasses}`;
  };

  return (
    <div className={`sudoku-cell ${getCellClasses()}`} onClick={onClick}>
      {isOriginal ? (
        <span className="text-gray-800 dark:text-gray-200">{value}</span>
      ) : (
        <input
          id={cellId}
          type="text"
          value={value === "." ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="w-full h-full text-center bg-transparent border-none outline-none text-xl font-bold"
          maxLength={1}
          disabled={isOriginal}
        />
      )}
    </div>
  );
};

export default SudokuCell;
