# ADR-0004: Document and stabilize random seed mechanisms

## Status

Accepted

## Date

2026-02-12

## Context

The platform seeds random number generators before each problem execution to ensure reproducibility. Three packages are involved:

1. **`random`** (stdlib): Seeded via `random.seed(student_id)`
2. **`numpy.random`**: Seeded via `numpy.random.seed(student_id)`
3. **`sympy.randMatrix`**: Patched to use `random.Random(student_id)` — an **isolated** PRNG instance

This seeding happens in two places:
- **Browser** (`platform/app.js:424-430` for random/numpy, `platform/app.js:528-535` for sympy.randMatrix)
- **Evaluator** (`evaluator.py:38-45`)

The mechanisms are not well-documented, leading to subtle bugs when problem authors mix random sources.

## Decision

1. **Document per-package seed behavior** in `docs/problem-authoring.md` and `docs/architecture.md`
2. **Establish rules** for problem authors:
   - `random` and `numpy.random` share global state — call order matters
   - `sympy.randMatrix` uses an isolated `random.Random(seed)` instance — order-independent
   - Do not mix `random` and `numpy.random` in the same problem (they have separate state)
   - If you need order-independent randomness, use `random.Random(seed)` instances
3. **No code changes** — the current seeding logic is correct. This ADR documents and stabilizes it.

## Consequences

### Positive

- Problem authors understand why call order affects results
- Clear guidance on which random source to use
- Documented parity between browser and evaluator seeding

### Negative

- The order-dependence of `random` and `numpy.random` is an inherent limitation that cannot be fixed without breaking existing problems

### Neutral

- Existing problems continue to work unchanged
- The evaluator and browser seeding logic remain identical
