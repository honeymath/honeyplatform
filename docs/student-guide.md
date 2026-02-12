# Student Guide

## Getting Started

You need two files from your teacher:
1. **student.html** - the exercise platform (open in any browser)
2. **exercises.json** - your homework exercises

## Solving Exercises

### Step 1: Open the Platform

Open `student.html` in a web browser (Chrome, Firefox, Safari, or Edge). This also works on your phone.

**First load may take 10-30 seconds** while the Python engine downloads. After the first load, it will be cached and start faster.

### Step 2: Enter Your Student ID

Enter your student number and click "Enter System". This is important because:
- Your student ID determines the specific numbers in your problems
- If you re-enter the same ID, you get the same problems (so you can resume)
- Different students get different problems

### Step 3: Load the Exercises

Click the file input button and select the `exercises.json` file from your teacher.

### Step 4: Solve Problems

For each problem:
1. **Read the problem** - math formulas are rendered with proper notation
2. **Enter your answer** - depending on the problem type:
   - **Text/Number**: Type your answer in the text area
   - **Matrix**: Click "Add Matrix", select the dimensions, then fill in the entries
3. **Get instant feedback**:
   - **Green "Accepted"**: Your answer is correct
   - **Red error message**: Your answer is incorrect, with an explanation
   - **Partial credit**: Some problems give partial credit for partially correct answers

### Step 5: Save Your Progress

Click "Save/Download" at any time to save your progress as a JSON file. You can:
- Close the browser and come back later
- Re-open student.html, enter your student ID, and load your saved file to continue
- Your saved file name will be `{your_student_ID}.json`

### Step 6: Submit

When you are done:
1. Click "Save/Download" to download your final submission
2. Submit the `{your_student_ID}.json` file through your course's submission system (LMS, email, etc.)

## Matrix Input

For matrix problems:
1. Click **"Add Matrix"** to create a new matrix
2. **Select dimensions**: Move your mouse to choose rows and columns, then click
3. **Fill entries**: Click on each cell and type the value
4. **Delete**: Click "Delete me" to remove a matrix
5. Some problems ask for multiple matrices - add as many as needed

## Tips

- **Save often**: Save your progress regularly in case of browser crashes
- **Check your answers**: The platform shows what it received from you. Verify the displayed values match what you intended.
- **Reload**: If the platform behaves unexpectedly, save your progress, refresh the page, re-enter your student ID, and load your saved file.
- **Mobile**: The platform works on phones. For matrix problems, landscape mode may be more comfortable.
- **Internet**: You need internet for the first load. After that, the page works even if you go offline (as long as you don't close the tab).

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page shows "Loading..." for a long time | Check your internet connection. Pyodide (~30MB) needs to download on first use. |
| "Python Error" message | This is usually a bug in the problem, not your fault. Contact your teacher. |
| Matrix input not appearing | Make sure you click "Add Matrix" first, then select the size. |
| Lost my progress | If you saved before, load the saved JSON file. If not, you'll need to redo the exercises. |
| Different numbers than my classmate | This is by design. Each student gets unique problems based on their student ID. |
