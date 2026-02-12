# ADR-0002: Deprecate MatrixInput, use textarea/checkbox/radio

## Status

Accepted

## Date

2026-02-12

## Context

The `#matrixlist` input type triggers a visual matrix editor component (`MatrixInput`/`matrixinput.js`). This component:

- Has complex touch-handling logic for mobile
- Returns a 3D JSON array format (`[[[row1], [row2]], ...]`) that is non-obvious
- Is difficult to maintain and test
- Couples the platform tightly to a specific UI widget

Meanwhile, most linear algebra answers can be expressed as text (e.g., typing a matrix row-by-row, or entering eigenvalues as comma-separated numbers).

## Decision

1. **Deprecate `#matrixlist`**: Mark it as deprecated in all documentation. It will continue to work for backward compatibility but should not be used in new problems.

2. **Introduce new input types**:
   - `#textarea` (default) — multi-line text input
   - `#checkbox` — checkbox selection
   - `#radio` — radio button selection

3. **Migration path**: Problem authors should convert matrix inputs to textarea-based entry. Example:
   ```python
   # Old (deprecated):
   X = json.loads(input())  #matrixlist

   # New:
   print("Enter matrix rows, one per line (e.g., '1 2 3'):")
   answer = input()  #textarea
   ```

## Consequences

### Positive

- Simpler UI implementation (standard HTML form elements)
- Better mobile compatibility (native inputs vs custom matrix widget)
- More flexible input types for non-matrix problems
- Easier to maintain and style

### Negative

- Matrix entry is less visual (no grid UI)
- Existing problems using `#matrixlist` need migration (not urgent — backward compatible)
- Teachers need to design clearer prompts for text-based matrix entry

### Neutral

- The `#matrixlist` code remains in the codebase until all problems are migrated
- Evaluator.py is unaffected (it processes whatever `input()` returns)
