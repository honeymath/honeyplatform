# Honeymath Platform - Architecture Document

## Overview

Honeymath is a browser-based mathematics exercise platform for university linear algebra courses. Teachers author problems as Python scripts, students solve them in a web interface, and grading is fully automated.

### Core Design Principles

1. **Problem as Code** - Every problem is a standalone Python script that runs in terminal, browser, or Jupyter. The platform is just a runner; the problem bank survives even if the platform is deprecated.
2. **Zero Server** - All computation runs client-side via Pyodide (Python compiled to WebAssembly). No backend, no database, no authentication server.
3. **Single-File Distribution** - The student application is a single HTML file. Students open it in any browser (including mobile). No installation required.
4. **Data Transparency** - All data (exercises, submissions, grades) is plain JSON. Students and teachers can inspect, export, and import freely.
5. **Seed-Based Randomization** - Student ID serves as the random seed, generating unique-per-student problems that are fully reproducible.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AUTHORING PHASE                          │
│                                                                 │
│  Teacher writes Python problem scripts                          │
│  (locally, with GPT, or from GitHub problem bank)               │
│       │                                                         │
│       ▼                                                         │
│  ┌──────────────┐    Vite build     ┌────────────────────┐      │
│  │ teacher.html │◄──────────────────│ src/teacher/       │      │
│  │ (single file)│    (singlefile)   │ Vue 3 + CodeMirror │      │
│  └──────┬───────┘                   └────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  exercises.json   (problem code + seeds, no answers)            │
└─────────┬───────────────────────────────────────────────────────┘
          │  distribute via LMS / email / USB
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SOLVING PHASE                            │
│                                                                 │
│  ┌──────────────┐    Vite build     ┌────────────────────┐      │
│  │ student.html │◄──────────────────│ src/student/       │      │
│  │ (single file)│    (singlefile)   │ Vue 3 (no CM)      │      │
│  └──────┬───────┘                   └────────────────────┘      │
│         │                                                       │
│  Student opens HTML → enters student ID → loads exercises.json  │
│         │                                                       │
│  Pyodide executes each problem with student's seed              │
│  print() → rendered as LaTeX via MathJax                        │
│  input() → text/number/matrix input UI                          │
│  raise Exception → error feedback shown in red                  │
│  program completes → "Accepted" shown in green                  │
│         │                                                       │
│         ▼                                                       │
│  {studentID}.json   (problem code + seeds + student answers)    │
└─────────┬───────────────────────────────────────────────────────┘
          │  submit via LMS / email
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        GRADING PHASE                            │
│                                                                 │
│  Teacher runs locally:                                          │
│  python grader/evaluator.py                                     │
│         │                                                       │
│  For each student submission:                                   │
│    - Replays the original problem code (from exercises.json)    │
│    - Feeds student's answers via redirected input()              │
│    - Uses the student's seed for reproducible randomization     │
│    - Catches Exception → extracts #score = X for partial credit │
│    - Full completion → score = 1                                │
│         │                                                       │
│         ▼                                                       │
│  output.csv   (uploadable to any LMS)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

### Student HTML (Lightweight)

| Dependency | Purpose | Loading |
|------------|---------|---------|
| **Vue 3** | Reactive UI framework | Bundled inline by Vite |
| **Pyodide** (~30MB cached) | Python runtime in browser (WASM) | CDN, browser-cached after first load |
| **MathJax 3** | LaTeX rendering | CDN |
| **App code** | Components, logic, styles | Bundled inline by Vite |

The student HTML does **not** include CodeMirror - students only see rendered problems and input fields.

### Teacher HTML (Full-Featured)

Everything in student HTML, plus:

| Dependency | Purpose | Loading |
|------------|---------|---------|
| **CodeMirror 6** | Python code editor | Bundled inline by Vite |
| **GitHub API** | Browse problem repositories | Fetch API (no library) |

### Grader (Local Python)

| Dependency | Purpose |
|------------|---------|
| **Python 3.8+** | Runtime |
| **sympy** | Symbolic math (used by problems) |
| **numpy** | Numerical computing (used by problems) |
| **pandas** | CSV output |

### Build Toolchain (Development Only)

| Tool | Purpose |
|------|---------|
| **Vite** | Dev server, bundler, HMR |
| **vite-plugin-singlefile** | Inlines all assets into one HTML |
| **TypeScript** | Type safety |
| **Vue 3 SFC** | Single-file components (.vue) |

## Project Structure

```
honeyplatform/
├── src/
│   ├── shared/                     # Code shared between teacher & student
│   │   ├── components/
│   │   │   ├── MatrixInput.vue     #   Visual matrix editor
│   │   │   └── MathRenderer.vue    #   MathJax rendering wrapper
│   │   ├── pyodide/
│   │   │   └── runner.ts           #   Pyodide lifecycle & execution engine
│   │   ├── types/
│   │   │   └── exercise.ts         #   TypeScript interfaces (Exercise, Input, Submission)
│   │   └── utils/
│   │       ├── storage.ts          #   JSON import/export utilities
│   │       └── seed.ts             #   Seed management utilities
│   │
│   ├── teacher/                    # Teacher entry point
│   │   ├── index.html              #   HTML template (CDN script tags)
│   │   ├── main.ts                 #   Vue app initialization
│   │   ├── App.vue                 #   Root component
│   │   └── components/
│   │       ├── CodeEditor.vue      #     CodeMirror 6 wrapper
│   │       ├── ProblemManager.vue  #     Problem list + add/delete/reorder
│   │       ├── Preview.vue         #     Student-view preview
│   │       └── GithubBrowser.vue   #     GitHub repository file browser
│   │
│   └── student/                    # Student entry point
│       ├── index.html              #   HTML template (CDN script tags)
│       ├── main.ts                 #   Vue app initialization
│       ├── App.vue                 #   Root component
│       └── components/
│           ├── Login.vue           #     Student ID entry screen
│           ├── ProblemView.vue     #     Problem display (LaTeX rendered)
│           ├── AnswerInput.vue     #     Answer input (text/number/matrix)
│           └── ProgressBar.vue     #     Progress tracking + save/export
│
├── grader/                         # Local Python grading tool
│   ├── evaluator.py                #   Main grading script
│   └── README.md                   #   Grading usage instructions
│
├── examples/                       # Example problem scripts
│   ├── basic_arithmetic.py         #   Simplest example (1+1, 2+2)
│   ├── matrix_eigenvalue.py        #   Eigenvalue computation
│   ├── plu_decomposition.py        #   PLU decomposition
│   └── positive_semidefinite.py    #   Positive semi-definite check + Cholesky
│
├── docs/                           # Documentation
│   ├── architecture.md             #   This file
│   ├── teacher-guide.md            #   Teacher workflow guide
│   ├── student-guide.md            #   Student usage guide
│   ├── problem-authoring.md        #   Python problem API specification
│   └── development.md              #   Developer setup & build guide
│
├── dist/                           # Build output (gitignored)
│   ├── teacher.html                #   Self-contained teacher app
│   └── student.html                #   Self-contained student app
│
├── vite.config.ts                  # Vite configuration
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies & scripts
├── CLAUDE.md                       # AI agent guide
└── README.md                       # Project overview
```

## Data Formats

### exercises.json (Teacher → Student)

```json
[
  {
    "code": "from sympy import ...\nprint(rf'...')\na = input()\n...",
    "inputs": [],
    "seed": 42
  },
  {
    "code": "...",
    "inputs": [],
    "seed": 42
  }
]
```

- `code`: The Python problem script (executable standalone)
- `inputs`: Empty array when distributed to students
- `seed`: Base seed (overridden by student ID on the student side)

### {studentID}.json (Student → Teacher)

```json
[
  {
    "code": "...",
    "inputs": [
      {
        "id": 0,
        "value": "2",
        "type": "",
        "ready": true,
        "line": 3,
        "context": "a = input()"
      },
      {
        "id": 1,
        "value": "[[[1,0],[0,1]]]",
        "type": "matrixlist",
        "ready": true,
        "line": 8,
        "context": "X = json.loads(input()) #matrixlist"
      }
    ],
    "seed": 12345
  }
]
```

- `inputs[].value`: The student's answer as a string
- `inputs[].type`: Input type derived from code comment (`""` = text, `"matrixlist"` = matrix)
- `seed`: The student's ID (used as seed)

### output.csv (Grader → LMS)

```csv
0,1,2,3
12345,1,0.5,1
67890,1,1,0
```

- Column 0: Student ID (seed)
- Columns 1+: Score per problem (0.0 to 1.0)

## Key Technical Details

### Python Problem Protocol

The platform treats Python scripts as interactive problem definitions using three primitives:

| Python Construct | Platform Behavior |
|-----------------|-------------------|
| `print(message)` | Display text to student. Supports LaTeX via `$$...$$` and `$...$`. |
| `input()` | Pause and wait for student text/number answer. |
| `input() #matrixlist` | Pause and show matrix input UI. Returns JSON string of 3D array. |
| `raise Exception(msg)` | Show error message. Student's answer is wrong. |
| `raise Exception(msg) #score = 0.5` | Wrong answer with partial credit (0.0–1.0). |
| Program completes without exception | All answers correct. Score = 1.0. |

### Pyodide Integration

1. **Loading**: Pyodide WASM runtime loaded from CDN (~30MB, browser-cached)
2. **Packages**: `sympy` and `numpy` loaded via `pyodide.loadPackage()`
3. **I/O Redirection**:
   - `input()` is monkey-patched to dispatch a DOM event, which triggers the Vue UI to show an input field
   - `print()` is redirected to a stdout handler that appends output to the Vue reactive data
4. **Seeding**: Before each problem execution, `random.seed(studentID)` and `numpy.random.seed(studentID)` are called. `sympy.randMatrix` is also patched to use the seeded PRNG.

### Security Considerations

- **Code Execution**: Student submissions are re-evaluated using the teacher's original code (from exercises.json), not the student's potentially modified copy. This prevents code injection.
- **No Server**: No attack surface from server-side vulnerabilities.
- **Data Visibility**: All data is plain JSON - nothing is hidden from inspection.

### Mobile Support

The student HTML must work on mobile browsers:
- Responsive layout (no fixed-width panels)
- Touch-friendly matrix input
- No dependencies on desktop-only features (file system API, etc.)
- File input via `<input type="file">` works on all mobile browsers

### Offline Capability

- **First load**: Requires internet to fetch Pyodide (~30MB) and MathJax from CDN
- **Subsequent loads**: Browser cache serves all CDN resources
- **Fully offline option**: Place Pyodide and MathJax files alongside student.html and update script src paths

## Migration from v1

| v1 (Current) | v2 (Refactored) |
|--------------|-----------------|
| Vue 2.6 via CDN | Vue 3 bundled by Vite |
| Single `app.js` (1575 lines) | Multiple .vue SFC components |
| `let student = true/false` toggle | Separate entry points (teacher.html / student.html) |
| CodeMirror 5 via CDN (both modes) | CodeMirror 6 via npm (teacher only) |
| MathJax 2.7.7 | MathJax 3 |
| No build system | Vite + vite-plugin-singlefile |
| JavaScript | TypeScript |
| PHP server.php (unused/legacy) | Removed |
| Manual HTML files | Built from Vue SFC |
