import { useState } from "react";
import SudokuBoard from "./SudokuBoard";

// Sample initial board from the requirements
const sampleBoard: string[][] = [
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

function App() {
  const [useSampleBoard, setUseSampleBoard] = useState<boolean>(false);
  const [showInstructions, setShowInstructions] = useState<boolean>(true);

  const handlePuzzleComplete = () => {
    console.log("Puzzle completed! 🎉");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🎯 Sudoku Game
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Challenge your mind with this interactive Sudoku puzzle. Use
            keyboard navigation and enjoy the graffiti celebration when you
            complete it!
          </p>
        </div>

        {/* Mode + Instructions */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setUseSampleBoard(false)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                !useSampleBoard
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              🔄 Random
            </button>
            <button
              onClick={() => setUseSampleBoard(true)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                useSampleBoard
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
              }`}
            >
              📝 Sample
            </button>
          </div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="px-4 py-2 rounded-lg font-semibold bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-all duration-300"
          >
            {showInstructions ? "📖 Hide" : "📖 Show"} Instructions
          </button>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 mb-8 max-w-4xl mx-auto border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">
              🎮 How to Play
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-white/90">
              <div>
                <h3 className="font-semibold mb-2">🎯 Game Rules:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Fill each row with numbers 1-9 (no repeats)</li>
                  <li>• Fill each column with numbers 1-9 (no repeats)</li>
                  <li>• Fill each 3×3 block with numbers 1-9 (no repeats)</li>
                  <li>• Use logic to solve the puzzle</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⌨️ Controls:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Click cells or use arrow keys to navigate</li>
                  <li>• Type numbers 1-9 to fill cells</li>
                  <li>• Press Backspace/Delete to clear cells</li>
                  <li>• Tab/Shift+Tab for quick navigation</li>
                  <li>• Red highlights show conflicts</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Sudoku Board */}
        <div className="flex justify-center">
          <div className="w-full lg:w-3/4">
            <SudokuBoard
              initialBoard={useSampleBoard ? sampleBoard : undefined}
              onComplete={handlePuzzleComplete}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-white/70">
          <p className="text-sm">
            Built with React, TypeScript, Vite, and Tailwind CSS
          </p>
          <p className="text-xs mt-2">
            Enjoy the graffiti celebration when you complete the puzzle! 🎨
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
