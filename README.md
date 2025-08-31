# 🎯 Sudoku Solver

A modern, interactive web-based Sudoku game built with React, TypeScript, and Tailwind CSS. Features real-time validation, keyboard navigation, touch support, and an intuitive user interface with dark mode support.

## ✨ Features

### 🎮 Game Features

- **Interactive 9×9 Sudoku Grid**: Clean, responsive grid with proper 3×3 block divisions
- **Real-time Validation**: Instant conflict detection with red highlights for invalid moves
- **Smart Navigation**: Arrow keys and Tab navigation with automatic cell advancement
- **Multiple Input Methods**:
  - Keyboard input (1-9 keys)
  - Click-to-select with number pad
  - Touch-friendly interface for mobile devices
- **Puzzle Generation**: Fetches new puzzles from external API with fallback to classic puzzles
- **Completion Celebration**: Optional modal on completion; does not block solved board

### 🎨 User Experience

- **Dark Mode Support**: Automatic system theme detection with manual toggle
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Keyboard navigation and screen reader friendly
- **Settings Persistence**: Number pad preference saved in localStorage
- **Visual Feedback**: Cell highlighting for focused/related cells and conflicts

### 🛠️ Technical Features

- **TypeScript**: Full type safety and better developer experience
- **Modern React**: Built with React 19 and hooks
- **Tailwind CSS**: Utility-first styling with custom animations
- **Vite**: Fast development server and optimized production builds
- **ESLint**: Code quality and consistency enforcement

### 🧮 Solver Features

- **Backtracking Solver**: Fast, reliable solver based on classic row/col/block constraints
- **Check Validation**: Show per-cell correctness highlighting and aggregate stats
- **Reset to Original**: Restore puzzle to its initial state

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm installed
- Git for cloning the repository

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/nabobery/sudokuSolver.git
   cd sudokuSolver
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to play the game!

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🎯 How to Play

### Basic Rules

- Fill the 9×9 grid so that each row, column, and 3×3 block contains numbers 1-9 exactly once
- Some numbers are already filled in as clues
- Use logic to determine where each number goes

### Controls

#### Keyboard Navigation

- **Arrow Keys**: Move between cells
- **Tab/Shift+Tab**: Navigate to next/previous cell
- **Numbers 1-9**: Fill selected cell
- **Backspace/Delete**: Clear cell
- **Escape**: Close number pad (if open)

#### Mouse/Touch

- **Click/Tap**: Select cell and open number pad
- **Number Pad**: Click numbers to fill cell
- **Clear Button**: Remove number from cell

### Game Features

- **New Puzzle**: Generate a fresh puzzle anytime
- **Clear Board**: Reset to empty grid (useful for custom puzzles)
- **Conflict Detection**: Red highlights show invalid placements
- **Cell Highlighting**: Blue highlights show related cells (same row/column/block)
- **Completion Check**: Automatic win detection with optional celebration

## 🤖 Solver Usage

Inside the board:

- **🤖 Solve**: Solves the current puzzle and displays the solved board. If a solution exists, the modal will not lock the screen; you can close it.
- **✅ Check Solution**: Computes correctness stats and highlights each non-original cell as correct/incorrect/empty.
- **🔍 Show/Hide Validation**: Toggles per-cell validation colors.
- **🔄 Reset**: Restores the puzzle to its original state.

Notes:

- A new puzzle sets a fresh original board and clears validation/overlays.
- Solving sets the solved board reference and keeps the grid visible.

## 🏗️ Project Structure

```
sudokuSolver/
├── src/
│   ├── App.tsx              # Main application component
│   ├── SudokuBoard.tsx      # Core game component and UI composition
│   ├── components/
│   │   ├── SudokuCell.tsx        # Cell rendering
│   │   ├── SolverControls.tsx    # Solve/validate/hint/reset controls
│   │   └── ValidationStats.tsx   # Stats and progress display
│   ├── solver/
│   │   └── sudokuSolver.ts       # Backtracking solver + helpers
│   ├── types/
│   │   └── sudoku.ts             # Shared TS types
│   ├── utils.ts             # Game logic utilities (validation, API fetch)
│   ├── index.css            # Global styles and Tailwind imports
│   ├── main.tsx             # Application entry point
│   └── vite-env.d.ts        # Vite type definitions
├── public/
│   └── vite.svg             # Vite logo
├── index.html               # Main HTML template
├── package.json             # Dependencies and scripts
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite build configuration
└── eslint.config.js         # ESLint configuration
```

## 🧩 Game Logic

The game implements comprehensive Sudoku validation:

- **Row Validation**: Ensures no duplicate numbers in any row
- **Column Validation**: Ensures no duplicate numbers in any column
- **Block Validation**: Ensures no duplicate numbers in any 3×3 block
- **Completion Check**: Verifies all cells are filled and valid

## 🔧 Customization

### Adding Custom Puzzles

You can modify the `fetchPuzzle()` function in `utils.ts` to:

- Use different puzzle APIs
- Add predefined difficulty levels
- Implement custom puzzle generation

### Styling

The game uses Tailwind CSS classes. Key styling areas:

- Cell appearance and interactions
- Number pad positioning and styling
- Color scheme and themes
- Animations and transitions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add: your feature description"`
5. Push to your branch: `git push origin feature/your-feature`
6. Create a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code style
- Add JSDoc comments for new functions
- Test game logic thoroughly
- Ensure mobile responsiveness

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Sudoku puzzles provided by [Dosuku API](https://sudoku-api.vercel.app/)
- Built with [React](https://reactjs.org/), [TypeScript](https://www.typescriptlang.org/), and [Tailwind CSS](https://tailwindcss.com/)
- Icons and animations powered by CSS and Tailwind utilities

## 🔍 Troubleshooting

### Common Issues

**Puzzle not loading**: The app falls back to a predefined puzzle if the API is unavailable

**Number pad not showing**: Check if "Enable number pad" is toggled in settings

**Styling issues**: Ensure Tailwind CSS is properly configured and built

**TypeScript errors**: Make sure all dependencies are installed and TypeScript is configured correctly

---

**Enjoy playing Sudoku!** 🧩✨

For questions or support, please open an issue on GitHub.
