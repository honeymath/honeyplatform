

# Honeymath Platform Overview

This project is available online at : https://honeymath.com

If you are interested in the code, visit the github page https://github.com/honeymath/honeyplatform

You can also watch the introduction at Youtube Video: https://youtu.be/ziht6w8sr9Y

Honeymath platform aims to provide an efficient, interactive solution for managing and solving math problems for teachers and students. Here's an overview of the platform's workflow:

First, teachers can open the Honeymath platform and create or select problems(<a href="platform/index.html">Click to enter Problem Maker</a>). Problems can be chosen from existing GitHub resources or modified in detail. Once the problem is created, teachers can save it as a JSON file.

After downloading the JSON file, students can upload it to the platform and start solving the problems (<a href="platform/student.html" download="student.html">A download link for student platform</a>). You can also access students platform directly online at <a href="platform/student.html">Online student platform</a>. Students can save their progress at any time, allowing them to pause and resume as needed. The Honeymath platform ensures that the problem data is randomized for each student based on their student ID, providing unique problems while maintaining consistency upon reloading.

Once students complete their assignments, they can submit the JSON file to the teacher. Teachers collect all student JSON files into a folder and use the provided Python script for grading. The script automatically evaluates the assignments, using comments and exception handling to determine scores, and supports partial credit mechanisms.

<a href="evaluator.py">Automatic Grading script</a>

<a href="130.json">Example of submission</a>

<a href="ex.json">Example of grading script</a>



Additionally, teachers can generate detailed feedback scripts, allowing students to understand the correctness of each step. Students can load the feedback script on the platform to receive specific error messages and improvement suggestions. Teachers can also provide solution scripts that generate answers for each problem based on the randomized data, ensuring fully automated solutions. This is an example
> <a href="exercise.py">Example of distributing exercises</a>
> This exercise only checks if the student's answer is good to submit, and it does not check for correctness. It motivates students to check by themselves before submission.

> <a href="feedback.py">Example of grading feedback script for teacher</a>
> Students create a JSON file and submit it. The teacher loads feedback.py in the teacher's system and clicks the grading script option to download the feedback JSON script. Then the student loads his submitted answer and then loads the feedback script to get feedback.

> <a href="solution.py">Example of solution script</a>
> Students load this script to get the solution of the exercise.
The above files can be found at the github repository as `semiPositiveDefinite_Exercise.py`, `semiPositiveDefinite_Grading.py` and 
`semiPositiveDefinite_Solution.py`


The comprehensive automation of the Honeymath platform not only enhances teachers' efficiency but also provides students with detailed feedback and a unique learning experience, reducing the likelihood of cheating.






## Introduction to Problem Maker

A simple example of the problem maker is 

```python

print("$1+1=?$")
a = input()
if a!="2":
	raise Exception(f"Your answer is wrong! The answer is not {a}")
print("You are correct, then please answer $2+2=?$")
b = input()
if b!="4":
	raise Exception(f"Your answer is wrong, $2+2\neq {b}$")

```
<!--
[DownloadPythonCode](ex1.py)
-->
Save the above code as `ex1.py`, then runs by `python3 ex1.py`, you will create the same problem in terminal and the input() function is waiting for your answer. In our value, it is important to make platform-independent problems to ensure the resuability, processability, and AI-friendly problem banks.

We interact with users by two main functions, `print(message)` for exercise prompt, `raise Exception` for wrong answer comment or alert. If the program is successfully runing through, then it means the student's answer is correct.

#### Why use python?
 Python is the most prevalent coding language for scientist. It's simplicity can simplify the process of problem making and helping problem maker more concetrate on making problems. Besieds, the strong support of python packages makes the problem making process easier. One of the most important reason is the redability and that python is the first language of chatGPT.

#### Creating Problems with chatGPT

You don't need to learn how to code. Just state your idea of creating a problem with GPT and let it to create for you. The system is designed in the sense that the logic is understandable by GPT, minimizing the influence of the platform.












## Some mathematical tricks of making problems

A perfect problem always could have integer solutions. It is useful to keep in mind how to generate an integer matrix with determinant 1. So that its inverse is also integer matrix. We use PLU decomposition. P is permutation matrix, L is lower triangular and U is upper triangular matrix. For example, in the following code, we create a matrix with determinant 1.
```python
## The following code generates an upper triangular matrix
upper = [[1 if i == j else 0 if i < j else int(random.random()*scale) for j in range(n)] for i in range(n)]

## The following code generates an lower triangular matrix
lower = [[1 if i == j else 0 if i > j else int(random.random()*scale) for j in range(n)] for i in range(n)]

## The following code, we generate a random switching matrix.
switch = list(range(n))
random.shuffle(switch)
sw = eye(n)[switch,:]

  

## Pack the above into matrices that can be processed by sympy
up = Matrix(upper)
lo = Matrix(lower)


## The following matrix is going to give the student as content of exercise

givenMatrix = sw*up*lo
```

Some times, you want a matrix with integer eigenvalue, then you realize the formula P^{-1}ΛP, where P is the integer invertibla matrix with determinant 1 and Λ is the diagonal matrix with integer eigenvalues! Use this idea you can create integer eigenvalue problems!

Here is another example of codes

```python
#### Problem

from sympy import randMatrix, latex, Matrix,sqrt
import json
import re

A = randMatrix(3, max=5, min=1, symmetric=True)
B = Matrix(A.tolist())
print(rf"""
Is the following matrix positive semi-definite?
$$
A={latex(A)}
$$
If yes, answer 'Yes'. Otherwise, answer 'No'...
"""
)

#### Solutions

n = A.rows
collect = []
center = []
rows = []

for i in range(n):
    if all(element.is_zero for element in A[:,i]):
        continue
    elif A[i,i]==0:
        break
    cross = A[:,i]*A[i,:]/A[i,i]
    collect += [cross]
    rows += [A[i,:]/sqrt(A[i,i])]
    center += [A[i,i]]
    A-= cross

exp = "+".join([latex(i) for i in collect])
if all(element.is_zero for element in A):
    print("We have a complete diagonal cross filling for matrix")
    print(rf"$${exp}$$")
    if all (c>=0 for c in center):
        print("This means the original matrix is semi-positive definite")
        U = Matrix.vstack(*rows)
        print(rf"$$U={latex(U)}$$ and we have $A=U^TU$")
    else:
        print("This means the original matrix is NOT semi-positive definite")
else:
    print("We can not do a complete diagonal cross filling for the matrix, the matrix is indefinite")
    print(rf"$${exp}+{latex(A)}$$")

A = B



#### Exercise

answer = input().strip().upper()
answer = re.sub(r'[^a-zA-Z0-9]', '', answer)

if answer not in ['YES', 'NO']:
    raise Exception('Please answer in yes or no')

if answer == 'YES':
    print(rf"""
    You mentioned it is a positive semi-definite matrix. Please decompose it into $A=LL^T$ where $L$ is a lower triangular matrix. Please enter your matrix $U$.
    """)
    X = json.loads(input())  #matrixlist
    if (k := len(X)) != 1:
        raise Exception(rf"You are required to enter 1 matrix, but {k} matrices detected")

    M = Matrix(X[0])
    print(rf"By what you've entered, you mean $$U = {latex(M)}$$")
    if not M.is_lower:
        raise Exception(rf"What you've suggested is not a lower triangular matrix...")

#### Verification
    P = M * M.T
    print(rf"By what you've suggested, we have $UU^T = {latex(P)}$")

    if P != A:
        raise Exception(rf"But $UU^T\neq A$...")#score = 0.1



```

## Some technical details

You don't have to worry about it. Just tell your GPT that this system has the following properties
#### Some strategies
When entering latex, it is frequently use `\command`. In python, the symbol `\` one needs to type `\\`. An easier method is to write `r"\command"` instead of `"\\command"`

Remember the `$$` sign each time you use latex. So keep in mind to use `$${latex(...)}$$`. Because the MathJax needs `$$...$$` to display maths.

#### Random Seeds

You may set the seed of each problem. The number are generated based on seed. In other words, same seeds will generate same random number, and thus same exercises.

#### Supporting packages

Currently this platform supports numpy and sympy packages. Reminder: Please remember to import packages! Frequent use packages are. Please remember to includes these in your codes.

```
import json
import random
from sympy import Matrix, symbols, Eq, latex
``` 

#### For input

Appending #matrix to the input code, then the system will use matrix input component for students so that student don't need to put that by hand Example `X=json.loads(input())#matrixlist`. The component would return a 3d array. It is the collection of matrices. Each matrix is a 2d-array. The reason we use `json.loads` is that the `input` will only return a string, and we need `json.loads` to convert it to an array.

However, you have option of not appending #matrix, just say `X=int(input())`, without `#matrix`, the system will generate textarea for student to write a number. So you may collect it by `int(input())`. This is idea of answering one number to a question.

A question can have multiple parts. For example, you may first ask about an eigenvalue of a matrix, then ask the student to find an eigenvector *based on* his eigenvalue. For this , you say `eigenvalue = int(input())`, after process with codes, you may then say `X = json.loads(input())#matrix`. This system will process each input as a subquestion, and having two input in your code means you have 2 subquestions. And you may process the code so that each question can uses answers of previous questions.

#### Always be responsive.

Note that ALWAYS say what the input you've get from student, because their might be bug of the system that did not correctly obtain the student input. So when student input'yes', always print things like 'you have said yes...', when got student input a matrixlist, always interprete and tell students what they have put there.



<!--
Idea of demonstration.

Teacher's creation of exercises.


1. Composing a homework.

    - Click Problems to change around each question

    - Preview from student perspective of view.

    - May change a little bit of the logic 

    - May download the progress

    - The random behavior of the platform.

2. Modifying individual exercises

    - Test the code directly
    
    - The remarks can control the behavior of the question. Input tools or score counting.

    - Some example of score just counting how many they have be done correctly.

    - Platform independent, it is python and supposed to be able to run on any platform. Can even run in terminal. This make sure even if this platform is outdated and abandoned, the problem bank still exists and can run on any other similar platforms.

    - If you are interested to create your own problem bank, just create a git repository, and upload problem there publicly, and then the honeymath can show your problems all in the system.

    - You can also upload your code by clicking choose File.

    - Create problems by chatGPT

3. Save and distribute exercises to students.

    - Once you finished testing those exercises, just click restart and download it save it to a JSON file. When distributing, just distribute this JSON file to student.

    - Student can login to their platform. Then they select the JSON file to start doing homework... 
        - The random number is generated based on their student number. 

    - Student can save and load their progress anytime. 

    - The student submit their work just by the saved JSON file. It will saved by their student ID. They submit the JSON file to the teacher.


4. Grading of the work.

    - The teacher put every submitted homerowk in a folder, and put his original script, then run a python script to generate a grading.
        - The original script is necessary to prevent student from changing the script or add malicious script.

    - Then he/she is able to upload the result to whatever platforms.


5. Special needs.
    
    - To motivate student to think, the teacher might give a script only tell the accepted format of the submission.

    - After submission, the teacher distribute a script to tell student the correctness

    - The teacher may also distribute a solution so student can load.



-->
