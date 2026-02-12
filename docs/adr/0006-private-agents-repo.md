# ADR-0006: Deploy agents as separate private repo

## Status

Accepted

## Date

2026-02-12

## Context

The agent system (role definitions, email tool, communications) contains project-management artifacts that are not relevant to the platform codebase. Including them in the main repo would:

- Clutter the repository with non-code files
- Expose internal process decisions publicly
- Make the main repo harder to navigate for contributors who only care about the platform code

## Decision

1. **Separate repository**: Agent system lives in a private `honeyplatform-agents` repo
2. **Symlink access**: The main `honeyplatform` repo accesses it via `.agents/ → ../honeyplatform-agents` symlink
3. **`.gitignore` the symlink target**: The main repo ignores `.agents/` contents (it's a symlink to an external repo)
4. **Independent versioning**: Agent system changes are committed independently of platform code

### Setup

```bash
# One-time setup (already done)
ln -s ../honeyplatform-agents .agents
echo ".agents" >> .gitignore  # or track the symlink itself
```

## Consequences

### Positive

- Clean separation between platform code and process management
- Agent system can be private while platform is public
- Each repo has focused commit history
- Agent system can be reused across projects

### Negative

- Developers need to clone both repos
- Symlink may not work on all systems (Windows without developer mode)
- Cross-repo references can break if repos are moved

### Neutral

- CLAUDE.md documents the symlink and how to access role files
- The `.agents/` path is consistent regardless of the underlying repo structure
