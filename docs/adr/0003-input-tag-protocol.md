# ADR-0003: Redesign input tag protocol with `#name=value` syntax

## Status

Accepted

## Date

2026-02-12

## Context

The current input type system uses a simple comment tag on the `input()` line:
```python
X = json.loads(input())  #matrixlist
```

This only supports a single type identifier with no parameters. As we add new input types (textarea, checkbox, radio) and configuration options (row count, option labels), we need a more expressive tag syntax.

## Decision

Adopt a `#<name>` and `#<name>=<value>` tag protocol:

### Syntax Rules

1. Tags appear as Python comments on the `input()` line
2. Simple tags: `#tagname` — sets a flag or selects a type
3. Key-value tags: `#key=value` — sets a parameter
4. Multiple tags: separated by spaces within the comment
5. **Locality rule**: Tags only apply to the `input()` call on the same line

### Supported Tags

| Tag | Description | Example |
|-----|-------------|---------|
| `#textarea` | Multi-line text input (default) | `input() #textarea` |
| `#checkbox` | Checkbox selection | `input() #checkbox` |
| `#radio` | Radio button selection | `input() #radio` |
| `#matrixlist` | Matrix editor (DEPRECATED) | `input() #matrixlist` |
| `#rows=N` | Number of rows for textarea | `input() #rows=5` |
| `#score=X` | Partial credit on `raise Exception` | `raise Exception(...) #score=0.5` |

### Parsing

The platform splits the source line at `#` and parses the last segment. Tags with `=` are key-value pairs; tags without are type selectors.

### Standalone Compatibility

When running as `python3 problem.py`, tags are just comments and are ignored. `input()` falls through to standard stdin. This preserves the "problem as code" principle.

## Consequences

### Positive

- Extensible: new tags can be added without changing the protocol
- Backward compatible: `#matrixlist` continues to work
- Self-documenting: tags are visible in the source code
- No runtime overhead: tags are parsed from source, not executed

### Negative

- Tag parsing happens at the source-code level (string splitting), which is fragile if comments contain `#`
- No validation at authoring time (tags are only checked at runtime)

### Neutral

- The `#score=X` tag on `raise Exception` lines already uses this pattern, so the new syntax is consistent with existing behavior
