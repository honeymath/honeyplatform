# Honeymath Platform 

Honeymath is a platform of creating interactive and platform-independent problems.

## Introduction to Problem Maker

<a href="platform/index.html">Click to enter Problem Maker</a>

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


## Some technical details

You don't have to worry about it. Just tell your GPT that this system has the following properties
#### Some strategies
When entering latex, it is frequently use `\command`. In python, the symbol `\` one needs to type `\\`. An easier method is to write `r"\command"` instead of `"\\command"`

Remember the $$ sign each time you use latex. So keep in mind to use "$${latex(...)}$$". Because the MathJax needs "$$...$$" to display maths.

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

Appending #matrix to the input code, then the system will use matrix input component for students so that student don't need to put that by hand Example `X=json.loads(input())#matrix`. The component would return a 3d array. It is the collection of matrices. Each matrix is a 2d-array. The reason we use `json.loads` is that the `input` will only return a string, and we need `json.loads` to convert it to an array.

However, you have option of not appending #matrix, just say `X=int(input())`, without `#matrix`, the system will generate textarea for student to write a number. So you may collect it by `int(input())`. This is idea of answering one number to a question.

A question can have multiple parts. For example, you may first ask about an eigenvalue of a matrix, then ask the student to find an eigenvector *based on* his eigenvalue. For this , you say `eigenvalue = int(input())`, after process with codes, you may then say `X = json.loads(input())#matrix`. This system will process each input as a subquestion, and having two input in your code means you have 2 subquestions. And you may process the code so that each question can uses answers of previous questions.
