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





