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



