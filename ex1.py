print("$1+1=?$")
a = input()
if a!="2":
	raise Exception(f"Your answer is wrong! The answer is not {a}")
print("You are correct, then please answer $2+2=?$")
b = input()
if b!="4":
	raise Exception(f"Your answer is wrong, $2+2\neq {b}$")

