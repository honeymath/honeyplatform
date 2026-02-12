# Teacher Guide

## Workflow Overview

```
1. Write Problems     →  Python scripts (.py files)
2. Compose Exercise   →  Open teacher.html, add problems, test them
3. Distribute         →  Download exercises.json, share with students + student.html
4. Collect            →  Students submit {studentID}.json files
5. Grade              →  Run evaluator.py locally, get output.csv
6. (Optional) Feedback → Distribute feedback/solution scripts
```

## Step 1: Write Problem Scripts

Problems are Python scripts using the `print()` / `input()` / `raise Exception()` protocol. See [Problem Authoring Guide](problem-authoring.md) for the full specification.

Quick example:
```python
print("What is $1 + 1$?")
a = input()
if a != "2":
    raise Exception(f"Incorrect! The answer is not {a}.")
```

You can write problems:
- **Manually** in any text editor
- **With ChatGPT** - just describe what you want and paste the output
- **From the GitHub problem bank** - browse existing problems in the teacher platform

## Step 2: Compose an Exercise Set

1. Open `teacher.html` in your browser
2. **Browse Problems**: Click "Browse Problems" to find problems from GitHub repositories, or click "Choose File" to upload local `.py` files
3. **Edit Code**: Switch to code editing mode to modify problems directly
4. **Test**: Use the preview to see how students will experience the problem. Change the seed to verify randomization works correctly.
5. **Add Problems**: Click "Add Problem" to add more problems to the set. Each problem gets its own seed.
6. **Evaluation Script mode**: Check "Evaluation Script" if you want to export a grading-only JSON (without pre-filled answers). This is the normal mode for distributing homework.

## Step 3: Distribute to Students

1. Click "Save/Download" to download `exercises.json`
2. Give students two files:
   - `student.html` - the student platform (one file, works everywhere)
   - `exercises.json` - the exercise set

Distribution methods:
- Upload to your LMS (Moodle, Canvas, Blackboard, etc.)
- Email attachment
- Shared drive / USB
- Course website

## Step 4: Collect Submissions

Students complete exercises and download their submission as `{studentID}.json`. They submit this file through your normal homework submission channel (LMS upload, email, etc.).

Collect all submission files into a single folder:
```
submission/
├── 12345.json
├── 67890.json
├── 11111.json
└── ...
```

## Step 5: Grade

### Prerequisites

Install Python dependencies (one-time):
```bash
pip install sympy numpy pandas
```

### Run the Grader

1. Place your original exercise file (the same `exercises.json` you distributed, or the `.json` exported with "Evaluation Script" checked) in the same directory.

2. Edit `grader/evaluator.py` to set:
   - `folder_path`: path to the submission folder
   - `evaluator`: path to your exercise JSON
   - `total_score`: point values per problem (e.g., `[10, 15, 20]`)

3. Run:
```bash
python grader/evaluator.py
```

4. Output: `output.csv` with columns:
   - Column 0: Student ID
   - Column 1+: Score per problem (0.0 to 1.0)

5. Upload `output.csv` to your LMS or process further with Excel/pandas.

### Understanding Scores

| Score | Meaning |
|-------|---------|
| 1.0 | All parts correct (program completed without exception) |
| 0.0 | Wrong answer (exception raised, no partial credit specified) |
| 0.0–1.0 | Partial credit (from `#score = X` comment on the exception line) |

## Step 6 (Optional): Feedback & Solutions

You can create additional scripts for student self-assessment:

### Exercise Validation Script

A script that checks answer **format** without checking correctness. Students run this before submitting to make sure their answers are in the right format:

```python
# Only checks format, not correctness
answer = input().strip().upper()
if answer not in ['YES', 'NO']:
    raise Exception("Please answer Yes or No")
print("Format accepted. Please submit your work.")
```

### Feedback Script

A grading script that gives detailed feedback. Export it as a "grading script" JSON from the teacher platform. Students load their submission first, then load the feedback script to see what they got wrong.

### Solution Script

A script that prints the full solution for each problem. Students load it to see the correct answers after the deadline.

## Tips

### Testing Your Problems

- Always test with multiple seeds to ensure problems work for all students
- Use "Student Mode" in the teacher platform to experience the full student workflow
- Verify that error messages are helpful and show what the student entered

### Managing Problem Banks

- Store problems in Git repositories (public or private)
- The teacher platform can browse any public GitHub repo
- Organize by topic: `eigenvalues/`, `decomposition/`, `systems/`
- Each `.py` file is one problem - easy to mix and match

### Common Pitfalls

1. **Forgetting to import**: Always include `from sympy import ...`, `import json`, etc.
2. **Not echoing input**: Always `print()` what the student entered so they can verify
3. **Non-integer answers**: Design problems so answers are integers or simple fractions
4. **Missing LaTeX delimiters**: Use `$$...$$` for display math, `$...$` for inline
5. **Backslash in f-strings**: Use `rf"..."` (raw f-string) for LaTeX commands
6. **`#matrixlist` is deprecated**: Use `#textarea` (or plain `input()`) for new problems. The matrix editor UI is being phased out in favor of text-based input. See [ADR-0002](adr/0002-matrixinput-deprecation.md).
