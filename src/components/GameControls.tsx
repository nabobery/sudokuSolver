import React from "react";

interface GameControlsProps {
  isLoading: boolean;
  numberPadEnabled: boolean;
  onLoadNewPuzzle: () => void;
  onClearAll: () => void;
  onToggleNumberPad: (enabled: boolean) => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isLoading,
  numberPadEnabled,
  onLoadNewPuzzle,
  onClearAll,
  onToggleNumberPad,
}) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {/* Game Controls */}
      <div className="flex gap-2">
        <button
          onClick={onLoadNewPuzzle}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg"
          disabled={isLoading}
        >
          🎲 New Puzzle
        </button>
        <button
          onClick={onClearAll}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg"
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Settings */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={numberPadEnabled}
            onChange={(e) => onToggleNumberPad(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Number pad</span>
        </label>
      </div>
    </div>
  );
};

export default GameControls;
