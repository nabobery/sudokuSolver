import React from "react";

interface SolverControlsProps {
  isSolving: boolean;
  solverMessage: string;
  hasOriginalBoard: boolean;
  showValidation: boolean;
  onSolve: () => void;
  onCheckSolution: () => void;
  onResetToOriginal: () => void;
  onToggleValidation: () => void;
}

const SolverControls: React.FC<SolverControlsProps> = ({
  isSolving,
  solverMessage,
  hasOriginalBoard,
  showValidation,
  onSolve,
  onCheckSolution,
  onResetToOriginal,
  onToggleValidation,
}) => {
  const getMessageStyle = (message: string) => {
    const baseClasses =
      "text-center p-3 rounded-lg font-medium transition-all duration-300 solver-message-enter";

    if (
      message.includes("successfully") ||
      message.includes("Congratulations")
    ) {
      return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 solver-message-success`;
    }
    if (message.includes("conflicts") || message.includes("complete")) {
      return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
    }
    if (message.includes("Solving")) {
      return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 animate-pulse`;
    }
    return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`;
  };

  return (
    <>
      {/* Solver Message */}
      {solverMessage && (
        <div className={getMessageStyle(solverMessage)}>
          {solverMessage.includes("Solving") && (
            <span className="solver-spinner mr-2"></span>
          )}
          {solverMessage}
        </div>
      )}

      {/* Solver Controls */}
      <div className="flex flex-wrap gap-3 justify-center">
        {/* Primary Solver Actions */}
        <div className="flex gap-2">
          <button
            onClick={onSolve}
            disabled={isSolving}
            className={`solver-btn px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 text-sm shadow-md hover:shadow-lg ${
              isSolving ? "animate-pulse" : ""
            }`}
          >
            {isSolving ? (
              <>
                <span className="solver-spinner mr-2"></span>
                Solving...
              </>
            ) : (
              "🤖 Solve"
            )}
          </button>
          <button
            onClick={onCheckSolution}
            disabled={isSolving}
            className="solver-btn px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg"
          >
            ✅ Check Solution
          </button>
        </div>

        {/* Validation Actions */}
        <div className="flex gap-2">
          <button
            onClick={onToggleValidation}
            disabled={isSolving}
            className={`solver-btn px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg ${
              showValidation
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {showValidation ? "🔍 Hide" : "🔍 Show"} Validation
          </button>
        </div>

        {/* Reset Actions */}
        {hasOriginalBoard && (
          <div className="flex gap-2">
            <button
              onClick={onResetToOriginal}
              disabled={isSolving}
              className="solver-btn px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors duration-200 text-sm shadow-md hover:shadow-lg"
            >
              🔄 Reset
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default SolverControls;
