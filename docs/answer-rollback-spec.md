# Answer Rollback Feature Specification

**Status**: Requirements only — implementation deferred
**Related**: [ADR-0005](adr/0005-answer-rollback-tree.md)

## Problem Statement

In multi-part problems, later parts depend on earlier answers. When a student changes answer N, all subsequent answers (N+1, N+2, ...) become invalid because the problem re-executes from the changed point. Currently, changing an earlier answer clears all subsequent inputs, losing the student's work permanently.

### Example Scenario

```
Problem: Find eigenvalue λ, then find eigenvector for that λ.

1. Student enters λ = 2, then enters eigenvector [1, 0]
2. Student realizes λ = 2 is wrong, changes to λ = 3
3. System clears eigenvector [1, 0] because it was for λ = 2
4. Student now has to re-enter the eigenvector from scratch
5. If student changes back to λ = 2, the old eigenvector [1, 0] is gone
```

Students find this frustrating — they want to explore different answers without losing previous work.

## Requirements

### R1: Tree-Structured Storage

Answers are stored in a tree where:
- Each node represents an answer at a specific input index
- Each node has children (answers to subsequent inputs) and siblings (alternative answers to the same input)
- The "active path" through the tree determines the current `inputs[]` array

### R2: Branch Preservation

When a student changes answer N:
- The old answer N and its children (N+1, N+2, ...) are preserved as a sibling branch
- A new branch is created for the new answer N
- The student can switch back to the old branch at any time

### R3: Suggested Answers

When the student navigates to an input that has answers in other branches of the tree:
- Show those answers as "suggestions" (e.g., grayed-out text, accessible via Tab or arrow keys)
- Selecting a suggestion restores the entire branch below it

### R4: JSON Format Extension

The `answerTree` field is added alongside the existing `inputs[]` array:

```json
{
  "code": "...",
  "inputs": [
    {"id": 0, "value": "2", "type": "", "ready": true, "line": 5, "context": "..."},
    {"id": 1, "value": "[[[1,0],[0,1]]]", "type": "matrixlist", "ready": true, "line": 10, "context": "..."}
  ],
  "seed": 12345,
  "answerTree": {
    "nodes": [
      {
        "inputIndex": 0,
        "value": "2",
        "active": true,
        "children": [
          {
            "inputIndex": 1,
            "value": "[[[1,0],[0,1]]]",
            "active": true,
            "children": []
          }
        ]
      },
      {
        "inputIndex": 0,
        "value": "3",
        "active": false,
        "children": [
          {
            "inputIndex": 1,
            "value": "[[[0,1],[1,0]]]",
            "active": false,
            "children": []
          }
        ]
      }
    ]
  }
}
```

**Backward compatibility**:
- `inputs[]` always reflects the currently active branch
- Files without `answerTree` work normally (no tree features)
- The evaluator only reads `inputs[]` and ignores `answerTree`

### R5: Evaluator Compatibility

The evaluator (`evaluator.py`) reads only `inputs[]`. No changes to the evaluator are required. The `answerTree` field is silently ignored.

### R6: UX Design

```
┌─────────────────────────────────────────────┐
│ Q1: What is the eigenvalue of A?            │
│ ┌─────────────────────────────────────────┐ │
│ │ 2                                 [←][→]│ │
│ └─────────────────────────────────────────┘ │
│ (also tried: 3, 5)                          │
│                                             │
│ Q2: Find an eigenvector for λ = 2           │
│ ┌─────────────────────────────────────────┐ │
│ │                                   [Tab] │ │
│ └─────────────────────────────────────────┘ │
│ Suggestion: [1, 0] (from previous attempt)  │
│                                             │
│                              [Save/Download]│
└─────────────────────────────────────────────┘
```

**Interactions**:
- `[←][→]` arrows browse sibling answers at the same input index
- Switching to a sibling restores its children (subsequent answers)
- `[Tab]` on an empty input fills it with the suggested answer from the tree
- The number of previous attempts is shown below each input

### R7: Storage Limits

- Maximum tree depth = number of `input()` calls in the problem (bounded by problem design)
- Maximum siblings per node = 20 (prevent unbounded growth)
- If limit reached, oldest sibling is dropped when a new one is added

## Non-Requirements (Explicitly Out of Scope)

- Undo/redo (this is branch switching, not linear undo)
- Diffing between branches
- Branch naming or labeling
- Syncing tree across devices (JSON file handles this naturally)
- Teacher visibility into the tree (evaluator ignores it)

## Testing Criteria

1. Changing answer N preserves the old branch
2. Switching back to an old answer restores its children
3. Suggested answers appear from sibling branches
4. `inputs[]` always matches the active branch
5. Files without `answerTree` load and work normally
6. Evaluator produces correct scores regardless of tree presence
7. JSON file size remains reasonable after 20+ answer changes
