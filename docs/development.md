# Development Guide

## Prerequisites

- **Node.js** 18+ (for Vite build toolchain)
- **npm** or **pnpm**
- **Python 3.8+** (for grader and testing problems locally)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/honeymath/honeyplatform.git
cd honeyplatform

# Install dependencies
npm install

# Start development server
npm run dev
```

This starts two dev servers:
- **Teacher platform**: http://localhost:5173/teacher/
- **Student platform**: http://localhost:5173/student/

Changes to `.vue`, `.ts`, and `.css` files are reflected instantly via HMR (Hot Module Replacement).

## Project Structure

```
src/
├── shared/          # Code shared between teacher & student
│   ├── components/  #   Reusable Vue components
│   ├── pyodide/     #   Pyodide loading & execution engine
│   ├── types/       #   TypeScript interfaces
│   └── utils/       #   Utility functions
├── teacher/         # Teacher entry point & components
└── student/         # Student entry point & components
```

## Build

```bash
# Build both teacher.html and student.html
npm run build
```

Output is in `dist/`:
- `dist/teacher.html` - self-contained teacher platform
- `dist/student.html` - self-contained student platform (distribute this to students)

Both files are **single HTML files** with all JS/CSS inlined. External CDN dependencies (Pyodide, MathJax) remain as `<script>` tags.

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build production single-file HTMLs |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |

## Vite Configuration

Key aspects of `vite.config.ts`:

### Multi-Page App

Two HTML entry points configured via `rollupOptions.input`:
```ts
{
  teacher: 'src/teacher/index.html',
  student: 'src/student/index.html'
}
```

### Single-File Output

`vite-plugin-singlefile` inlines all JS and CSS into the HTML files. This is critical for the student experience - they receive one file that works everywhere.

### External Dependencies

Pyodide and MathJax are kept as external CDN `<script>` tags in the HTML templates (not bundled by Vite). They are too large to inline and benefit from browser CDN caching.

## Technology Decisions

### Why Vite + vite-plugin-singlefile?

The core constraint is that students receive a **single HTML file** they can open directly (even on phones, even offline after first load). Vite gives us proper development tooling (HMR, TypeScript, SFC components), while `vite-plugin-singlefile` ensures the build output remains a single file.

### Why Vue 3?

- Natural upgrade from the existing Vue 2 codebase
- Composition API maps well to the existing logic
- Smaller bundle size than Vue 2
- Strong TypeScript support

### Why TypeScript?

- Type safety for the data structures (Exercise, Input, Submission)
- Better IDE support for development
- Self-documenting interfaces for the Pyodide integration layer
- Helps AI agents understand the codebase

### Why No CodeMirror in Student HTML?

Students only need to: read problems (LaTeX) and enter answers (text/matrix). Removing CodeMirror from the student build:
- Reduces bundle size significantly
- Improves mobile experience
- Simplifies the student UI

### Why Keep Python Grader Local?

- Zero infrastructure required
- Teacher has full control over the grading environment
- No security concerns about running student code on a server
- Teachers already have Python installed (it's a math department)

## Key TypeScript Interfaces

```typescript
// src/shared/types/exercise.ts

interface Exercise {
  code: string          // Python problem script
  inputs: Input[]       // Student answers (empty when distributed)
  seed: number          // Random seed (overridden by student ID)
}

interface Input {
  id: number            // Sequential index (0, 1, 2, ...)
  value: string         // The student's answer as a string
  type: string          // "" for text, "matrixlist" for matrix
  ready: boolean        // Has the student filled this in?
  line: number          // Source line number in Python code
  context: string       // The input() line from the source code
}

interface ExerciseState extends Exercise {
  key: number           // Vue reactivity key
  outputs: string[]     // Rendered output segments (between inputs)
  error: string         // Current error message
  errors: string        // Python runtime errors
  correct: boolean      // All answers accepted
  correctUntil: number  // Line number where error occurred
  score: number         // Partial credit score (0-1)
  show: boolean         // UI visibility toggle
}
```

## Adding a New Feature

1. Determine if the feature belongs in `shared/`, `teacher/`, or `student/`
2. Create or modify the relevant `.vue` component
3. Run `npm run dev` to test with HMR
4. Run `npm run typecheck` to verify types
5. Run `npm run build` to verify the single-file output works
6. Test the built `dist/student.html` by opening it directly (not via dev server)

## Testing the Build

After `npm run build`, always verify:

1. **Open `dist/student.html` directly** (file:// protocol or simple HTTP server)
2. Enter a student ID
3. Load an exercises.json
4. Solve a problem and verify the answer checking works
5. Save and reload progress
6. Test on mobile (or mobile emulation in DevTools)

## Grader Development

The grader (`grader/evaluator.py`) runs independently of the web platform:

```bash
# Set up a test scenario
mkdir submission
# Copy some test .json files into submission/

# Run the grader
python grader/evaluator.py
```

Modify `evaluator.py` configuration at the top of the file:
- `folder_path`: submission directory
- `evaluator`: path to the original exercises JSON
- `total_score`: point weights per problem
