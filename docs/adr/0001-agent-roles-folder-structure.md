# ADR-0001: Restructure agent roles from flat files to folders

## Status

Accepted

## Date

2026-02-12

## Context

The agent system stored role definitions as flat files in `.agents/roles/` (e.g., `1_architect.md`, `1_engineer.md`, `2_reviewer.md`, `4_manager.md`). The number prefix encoded execution order (1 = parallel, 2 = downstream, 4 = meta), but this was confusing and didn't scale. Roles had no place to store role-specific documents or scripts.

## Decision

Restructure roles into a folder-per-role layout:

```
roles/
├── architect/
│   ├── job_description.md
│   ├── docs/
│   └── scripts/
├── engineer/
│   ├── job_description.md
│   ├── docs/
│   └── scripts/
├── reviewer/
│   └── ...
└── manager/
    └── ...
```

- Remove number prefixes entirely
- Describe role relationships by name (parallel, sequential, cross-cutting) instead of by number
- Add a Cross-Role Fix Policy section to all role files
- Create `_system/` directory for system metadata (changelog, README)

## Consequences

### Positive

- Each role has dedicated space for docs and scripts
- Role names are self-descriptive (no need to remember what "1_" or "4_" means)
- Cross-Role Fix Policy establishes clear ownership boundaries
- Easier to add new roles (just create a new folder)

### Negative

- All existing references to `roles/1_architect.md` etc. must be updated
- Slightly deeper directory nesting

### Neutral

- The `.agents/` symlink mechanism is unchanged
- Email system and utils are unaffected
