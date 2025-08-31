import React from "react";

interface ValidationStatsProps {
  stats: {
    totalCells: number;
    filledCells: number;
    correctCells: number;
    incorrectCells: number;
    originalCells: number;
    accuracy: number;
    isComplete: boolean;
    isValid: boolean;
  };
  showValidation: boolean;
}

const ValidationStats: React.FC<ValidationStatsProps> = ({
  stats,
  showValidation,
}) => {
  if (!showValidation || !stats) {
    return null;
  }

  const progressPercentage =
    ((stats.filledCells + stats.originalCells) / stats.totalCells) * 100;

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 max-w-md mx-auto border border-white/20 solver-message-enter">
      <h3 className="text-lg font-bold text-white mb-3 text-center">
        📊 Validation Stats
      </h3>

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-white/80 mb-1">
            <span>Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats.correctCells}
            </div>
            <div className="text-white/80">Correct</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">
              {stats.incorrectCells}
            </div>
            <div className="text-white/80">Incorrect</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats.filledCells}
            </div>
            <div className="text-white/80">Filled</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats.originalCells}
            </div>
            <div className="text-white/80">Original</div>
          </div>
        </div>

        {/* Accuracy */}
        <div className="text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.accuracy}%
          </div>
          <div className="text-white/80 text-sm">Accuracy</div>
        </div>

        {/* Status */}
        <div className="text-center">
          {stats.isComplete && stats.isValid ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm font-medium">
              ✅ Complete & Valid
            </div>
          ) : stats.isComplete ? (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/20 text-red-300 text-sm font-medium">
              ⚠️ Complete but Invalid
            </div>
          ) : (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-sm font-medium">
              🔄 In Progress
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ValidationStats;
