import json
import traceback
import random
import sympy
import numpy
import sympy
import pandas as pd
import os
from sympy import latex
original_randMatrix = sympy.randMatrix

## Suppose you put all student submitted homework to the folder submission/
folder_path = 'submission'
submission = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if f.endswith('.json')]

total_score = [10,15,20] # set the score of each problem.

## Suppose you have put your grading script to the file ex.json
evaluator = "ex.json"
dic = {}

for submitted in submission:
    with open(evaluator,'r') as file:
        eva = json.load(file)
    with open(submitted,'r') as file:
        sub = json.load(file)
    total = min(len(eva),len(sub))
    results = []
    for i in range(total):
        inputs = sub[i]["inputs"][::-1]
        def custom_input(x=""):
            if len(inputs) == 0:
                return ""
            togive = inputs.pop()
            return togive["value"]
        input = custom_input # redirect input.
        seed = int(sub[i]["seed"])
        random.seed(seed)
        numpy.random.seed(seed)
        def cuscus(*args,**kwargs):
            if 'prng' not in kwargs:
                kwargs['prng'] = random.Random(seed)
            return original_randMatrix(*args,**kwargs)

        sympy.randMatrix = cuscus

        code = eva[i]["code"]
        try:
            score = 0
            exec(code)
            score = 1
        except Exception as e:
            print(e)
            texts = code.split('\n')[traceback.extract_tb(e.__traceback__)[1].lineno - 1].split('#') 
            if len(texts) > 1:
                exec(texts[-1])
        results.append(score)
    dic[seed] = results #sum([results[i]*total_score[i] for i in range(len(results))])


grades = list(zip(*[[key]+obj for key,obj in dic.items()]))
pd.DataFrame({i:grades[i] for i in range(len(grades))}).to_csv('output.csv',index = False)

## We use pandas, so you can do some data analysis.





