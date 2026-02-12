# ADR-0005: Answer rollback with tree structure

## Status

Proposed

## Date

2026-02-12

## Context

In multi-part problems, later parts depend on earlier answers. When a student changes answer N, all subsequent answers (N+1, N+2, ...) become invalid because the problem state has changed. Currently, changing an earlier answer simply clears all subsequent inputs, losing the student's work.

Students find this frustrating — they want to explore alternative answers without losing their existing work.

## Decision

Implement a tree-structured answer storage system:

1. **Tree structure**: Each node represents an answer at a specific input index. Branches represent alternative answers to the same question.
2. **Branch preservation**: When a student changes answer N, the old branch (including answers N+1, N+2, ...) is preserved in the tree. A new branch is created for the new answer.
3. **Suggested answers**: When navigating to an input that has answers in other branches, show those answers as suggestions (accessible via Tab or arrow keys).
4. **JSON format extension**: Add an `answerTree` field alongside the existing `inputs[]` array. The `inputs[]` array always reflects the current active branch (for backward compatibility).
5. **Evaluator compatibility**: The evaluator only reads `inputs[]` and ignores `answerTree`. No evaluator changes needed.

### JSON Format

```json
{
  "code": "...",
  "inputs": [...],
  "seed": 12345,
  "answerTree": {
    "0": {
      "value": "2",
      "children": {
        "1": {
          "value": "[[[1,0],[0,1]]]",
          "children": {}
        }
      },
      "siblings": [
        {
          "value": "3",
          "children": {
            "1": {
              "value": "[[[0,1],[1,0]]]",
              "children": {}
            }
          }
        }
      ]
    }
  }
}
```

### UX

```
┌─────────────────────────────────┐
│ Q1: What is the eigenvalue?     │
│ ┌─────────────────────────────┐ │
│ │ 2                     [←][→]│ │  ← arrows browse sibling answers
│ └─────────────────────────────┘ │
│ (also tried: 3, 5)             │  ← shows other branches
│                                 │
│ Q2: Find the eigenvector        │
│ ┌─────────────────────────────┐ │
│ │ [1, 0]                [Tab] │ │  ← Tab fills suggested answer from tree
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## Consequences

### Positive

- Students can explore without fear of losing work
- Suggested answers speed up re-entry after changing earlier parts
- Backward compatible (evaluator ignores tree, reads `inputs[]`)

### Negative

- Increased storage in JSON (tree can grow with many attempts)
- UI complexity for branch navigation
- Implementation effort in the student-facing component

### Neutral

- Teacher workflow is unaffected
- Problem authoring is unaffected
- This is a student UX improvement only
