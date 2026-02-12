# CLAUDE.md - Honeymath Platform

## Project Summary

Honeymath is a browser-based mathematics exercise platform for university linear algebra courses. Teachers author problems as Python scripts, students solve them in a single-HTML-file web app, and grading is automated via a local Python evaluator.

## Key Architecture Decisions

- **Single-file distribution**: Student app must build to ONE self-contained HTML file via `vite-plugin-singlefile`
- **No server**: All computation runs client-side via Pyodide (Python→WebAssembly)
- **Two entry points**: `src/teacher/` and `src/student/` build to separate HTML files
- **Student HTML has no CodeMirror**: Students only see rendered problems + input fields
- **Data format is JSON**: exercises.json (teacher→student), {studentID}.json (student→teacher)
- **Python problem protocol**: `print()` displays, `input()` collects answers, `raise Exception()` gives feedback

## Tech Stack

- **Vue 3** (Composition API) + **TypeScript** + **Vite**
- **Pyodide** (CDN) - Python runtime in browser
- **MathJax 3** (CDN) - LaTeX rendering
- **CodeMirror 6** (npm, teacher only) - code editor
- **vite-plugin-singlefile** - builds to single HTML

## Commands

```bash
npm run dev        # Dev server with HMR
npm run build      # Build dist/teacher.html + dist/student.html
npm run preview    # Preview production build
npm run typecheck  # TypeScript checking
```

## Project Structure

```
platform/               → Legacy codebase (Vue 2, to be migrated)
docs/                   → Architecture, guides, specs
docs/adr/               → Architecture Decision Records
.agents/                → Agent system (symlink to private repo)
evaluator.py            → Grading script
```

## Critical Files

- `platform/app.js` - Main application logic (Vue 2, Pyodide lifecycle, I/O redirection, seed management)
- `platform/matrixinput.js` - Visual matrix editor component (DEPRECATED — see ADR-0002)
- `evaluator.py` - Automated grading script

## Python Problem Protocol

Problems are standalone Python scripts. The platform just runs them:

| Construct | Behavior |
|-----------|----------|
| `print(msg)` | Show text/LaTeX to student |
| `input()` | Text input (default: `#textarea`) |
| `input() #matrixlist` | Matrix input UI (DEPRECATED — see ADR-0002) |
| `input() #checkbox` | Checkbox input |
| `input() #radio` | Radio button input |
| `raise Exception(msg)` | Wrong answer (score=0) |
| `raise Exception(msg) #score = 0.5` | Partial credit |
| Program completes | All correct (score=1) |

### Tag Protocol

Input type and parameters are specified via comment tags on the `input()` line using `#<name>` or `#<name>=<value>` syntax:

```python
answer = input()                    # defaults to #textarea
answer = input() #checkbox          # tag without value
answer = input() #rows=5            # tag with value
```

**Locality rule**: Tags only apply to the `input()` call on the same line. They do not carry over to subsequent `input()` calls.

## Data Flow

```
Teacher Python scripts → exercises.json → Student solves → {studentID}.json → evaluator.py → output.csv
```

## Key Constraints

1. Student HTML must work on mobile browsers
2. Student HTML must work offline (after first CDN cache)
3. No cookies, no localStorage dependency for core function (JSON file-based)
4. Pyodide + MathJax loaded from CDN (too large to inline)
5. All bundled JS/CSS must be inlined into the HTML (vite-plugin-singlefile)
6. Problems must remain executable as standalone Python (`python3 problem.py`)

## Documentation

- `docs/architecture.md` - Full technical architecture
- `docs/problem-authoring.md` - Python problem API specification
- `docs/teacher-guide.md` - Teacher workflow
- `docs/student-guide.md` - Student usage
- `docs/development.md` - Developer setup & build
- `docs/adr/` - Architecture Decision Records

## Decision Logging

All architectural and design decisions are recorded as Architecture Decision Records (ADRs):
- Location: `docs/adr/NNNN-short-title.md`
- Format: Status, Date, Context, Decision, Consequences
- Reference existing ADRs before making conflicting decisions

## Agent System

The `.agents/` directory is a symlink to the private `honeyplatform-agents` repository. It contains:

- **Role definitions**: `.agents/roles/<role>/job_description.md` — one per agent role (architect, engineer, reviewer, manager)
- **Email system**: `.agents/utils/email.sh` — inter-agent communication tool. Manual at `.agents/utils/docs/email_system_manual.md`
- **System changelog**: `.agents/_system/changelog.md` — log of structural changes to the agent system
