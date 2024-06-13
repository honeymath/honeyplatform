Vue.component('input-area', {
    template: `
        <div>
            <textarea v-model="inputValue" placeholder="Enter input for Python code here"></textarea>
        </div>
    `,
    props: ['value'],
    computed: {
        inputValue: {
            get() {
                return this.value;
            },
            set(newValue) {
                this.$emit('input', newValue);
            }
        }
    }
});

Vue.component('code-mirror', {
    template: `
        <div>
            <textarea ref="myTextarea"></textarea>
        </div>
    `,
    props: ['value'],
    mounted() {
        this.editor = CodeMirror.fromTextArea(this.$refs.myTextarea, {
            lineNumbers: true,
            mode: 'python',
            theme: 'dracula'
        });
        this.editor.setValue(this.value);
        this.editor.on('change', () => {
            this.$emit('input', this.editor.getValue());
        });
    },
    watch: {
        value(newValue) {
            if (newValue !== this.editor.getValue()) {
                this.editor.setValue(newValue);
            }
        }
    }
});

Vue.component('code-result', {
    template: `
        <div>
            <p>Result:</p>
            <pre>{{ result }}</pre>
        </div>
    `,
    props: ['result']
});

Vue.component('code-output', {
    template: `
        <div>
            <p>Output:</p>
            <pre>{{ output }}</pre>
        </div>
    `,
    props: ['output']
});

Vue.component('code-error', {
    template: `
        <div>
            <p>Error:</p>
            <pre>{{ error }}</pre>
        </div>
    `,
    props: ['error']
});

Vue.component('parent-component', {
    data() {
        return {
            code: `
print("$1+1=?$")
a = input()
if a!="2":
  raise Exception(f"Your answer is wrong! The answer of this question is not {a}")
print("You are correct, then please answer $2+2=?$")
b = input()
if b!="4":
  raise Exception(rf"You are wrong , $2+2 \\neq {b}$!")
`,
            pyodide: null,
	    ind: 0,
            outputs: ['ri'],
            results: ['fe'],
	    error:"",
            errors: "",
            inputs: [],
	    temp:"[]",
	    fucker:0,
            customInputExceptionMessage: 'CustomInputException: No input provided', // 自定义异常消息
	    fileName:"example.py",
	    correct:false, // This controls the showing of the words "Answer Correct". After the program successfully runs, it shows up.
        showFiles:false,// In code mode, files does not show up, but in browse file mode, it shows up
        files: [],
        selectedFile: null,
        owner:"honeymath",
        repo:"mathProblems",
        serverResponse: false,// true if server responses, false if not
        servarReady:false,//set ready once the dir browser is done.
        serverError:"",
        path:[],
        loginView:false, // true if in a login view. Flase if not.
	seed:0, // this is the random number seed.
	showSeed:false,
	requiredPackages:['sympy','numpy'],// the list of required packages, will add in the future.
	loadingMessage:" Python platform is loading... Please wait.",
	pythonReady: false
        };
    },
    template: `
<div>
<div v-if = "pythonReady">
            <div style="width:100%;height:40px;background-color:black">
                <a href="/" style="color:white">Return to Home</a> 
                <span style="color:lightblue">File Name =   </span>
                <input v-model="fileName" style="border:none;background-color:black;color:lightgreen;font-size:25px"></input>
                <button @click = "showFiles = !showFiles">{{showFiles?"Edit Code":"Browse Files"}}</button>
                <button v-if="showFiles" @click = "loginView=!loginView;if(!loginView){fetchData()}">{{loginView?"Return to current repository":"Change repository"}}</button>
            </div>

        <div style="width:55%;float:left">

            <div v-if = "showFiles">
                
                <div v-if="loginView" style="padding:50px">
                    Owner Name:<input v-model="owner"></input>
                        </br>
                        </br>
                    Repository:<input v-model="repo"></input>
                </div>
                <div v-else>

                <button class="dir" @click="path = [];fetchData()"> \\ ROOT </button>

                <div v-if = "serverResponse">


                <div v-if="serverReady">
                    <div v-if="path.length>0">
                        <button class="dir" @click="path.pop();fetchData()">..</button>
                    </div>
                    <div v-else>
                        <span>Toppest Level</span>
                    </div>
                </div>
                <div v-else>
                    <div v-if="path.length>0">
                        <button class="dir">..</button>
                    </div>
                    <div v-else>
                        <span>Toppest Level</span>
                    </div>
                </div>
                    
                <div v-for="file in files">
                    <div v-if = "file.type=='file'">
                        <input 
                            type="radio" 
                            :value="file.name" 
                            v-model="selectedFile" 
                            :id="file.name"
                            style="display:none"
                        />
                        <label style="width:100%" :for="file.name" :class="selectedFile === file.name ? 'checked' : 'unchecked'" @click="fetchGithubContent(file.download_url)">
                            {{ file.name }}
                        </label>
                        </div>
                        <div v-else>
                            <button v-if="serverReady" class="dir" @click="path.push(file.name);fetchData()">{{file.name}}</button>
                            <button v-else class="dir" @click="console.log('server is busy, waiting')">{{file.name}}</button>
                        </div>
                    </div>
              </div>
              <div v-else>
                <span style="color:red">Can not find the content:{{serverError}}</span>
              </div>
              </div>



            </div>

            <code-mirror v-else v-model="code" ></code-mirror>
        </div>

	<!--textarea v-model="inputs[0].value"></textarea-->
       <div style="width:40%;float:left;padding:2%">
	    <button @click="restart">Run Code</button>
            <button @click="downloadCode">Download Code</button>
            <button @click="showSeed=!showSeed">{{showSeed?"Hide Seed":"Show Seed"}}</button>
	    <input style="width:200px" type="file" v-on:change="getFile" id="input-file">
	    <input v-if="showSeed" v-model = "seed" @input = "runPythonCode()"></input>
		<div v-for="input in inputs" :key="input.fucker">
			<span v-html = "outputs[input.id]" style="font-size:20px"></span>
			</br>
			<div>
				<textarea  v-if = "input.type != 'matrix' " v-model="input.value" @input="input.ready = true;runPythonCode()"></textarea>
				<matrixinput v-else v-model="input.value" @input="input.ready = true;runPythonCode()"></matrixinput>
			</div>
			</br>
			<hr>
		</div>	
		<span v-html = "outputs[inputs.length]" style="font-size:20px"></span>
		</br>
		<span v-html = "error" style="color:red;font-size:20px"></span>
		</br>
	    	<span v-if="correct" style="color:green;font-size:20px">Your answer is correct!</span>
		</br>
            	<span style="color:red">{{errors}}</span>
            
       </div>
</div>
<div v-else>
{{loadingMessage}}
</div>
</div>
    `,
	updated(){
     this.$nextTick(function() {try{
						 MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
					 }catch(e){}
	    })},
    mounted() {
	//Fuckingly
   // console.log("why you are not fuck?")
    console.log("start fetching git hub directory")
    this.fetchData()//testing fuck
    console.log("end fetching")

	document.addEventListener('pythonEvent', (event) => {
           // const params = event;
           // console.log(`JavaScript function called with parameters: ${JSON.stringify(params)}`);
           // alert(`JavaScript function called with parameters: ${JSON.stringify(params)}`);
		this.prepareInput({
			line: event.lineno,
			context: this.code.split('\n')[event.lineno - 1]
		})
		//let line = event.lineno
		//let context = this.code.split('\n')[line-1]
		//console.log(event.lineno)
        });
	// The above are fucking codes that do events with fucking python
        this.loadPyodide();
//	this.initialize();// this cause problem when mounting
        },
    methods: {
	restart(){
		//this.pyodide.runPython("_random_array = []")
		this.seed = Math.random()
		this.inputs.splice(0,)
		this.runPythonCode()
	},
	downloadCode(){
		todown = this.code
		var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(todown));
                element.setAttribute('download', this.fileName);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
	},
	clearScreen(){//not sure if this is required?
		this.ind = 0
		this.inputs.splice(0,)
		this.outputs = ["Please Wait while the system is compiling the script ... "]
		this.results = []
		this.errors = ""
		this.error = ""
		this.pyodide.runPython("_random_index = 0")
		this.correct = false
	},
	initialize(){// initialize all parameters.
		this.ind = 0
//		this.inputs.splice(0,)
		this.outputs = []
		this.results = []
		this.errors = ""
		this.error = ""
//		this.pyodide.runPython("_random_index = 0")
		this.reseed()
		this.correct = false
	},
	reseed(){
		this.pyodide.runPython("import random")
		this.pyodide.runPython("import numpy")
		this.pyodide.runPython("_random_seed = "+this.seed)
		this.pyodide.runPython("random.seed(_random_seed)")//reseed
		this.pyodide.runPython("numpy.random.seed(int(123456789*_random_seed))")//reseed
	},
	prepareInput({line,context}){
//		console.log(line)
//		console.log(context)
		let splita = context.split("#")
//		console.log(splita)
		let rinima = splita[splita.length-1].split("(")
//		console.log(rinima)
		let caonima = rinima[1]==undefined?"":rinima[1].split(")")[0]
//		console.log(caonima)
		let parameters = caonima.split(",")
		let type = rinima[0]
//		context.split("#")[1].split("(")[0]
		if(this.inputs[this.ind]==undefined){
					Vue.set(this.inputs, this.ind, {fucker:this.fucker, id:this.ind,value:"", line:line, context:context, ready:false, type:type, parameters:parameters})
					console.log(this.inputs[this.ind])
					this.fucker += 1
				}
	},
	getFile: function(event) {
	            const input = event.target
                if ('files' in input && input.files.length > 0) {
	                this.placeFileContent(
                            input.files[0])
                    }
                input.value=""
                },
            placeFileContent: function(file) {
	                this.readFileContent(file).then(content => {
  	                this.code = content
			if(this.autoupload){
				this.upload()
			}
                    }).catch(error => console.log(error))
                },
            readFileContent: function(file) {
	            const reader = new FileReader()
                return new Promise((resolve, reject) => {
                reader.onload = event => resolve(event.target.result)
                reader.onerror = error => reject(error)
                reader.readAsText(file)
                })
            },
        async loadPyodide() {
		this.pythonReady = false
		let total = this.requiredPackages.length
            	this.pyodide = await loadPyodide({
			stdin: ()=>{ if(this.inputs[this.ind]==undefined || !this.inputs[this.ind].ready){ throw "This error is throwed by me to stop the python code. I can not control Pyodide, it throw my error without my control. Don't worry, it would not destroy the earth. " } this.ind += 1; return this.inputs[this.ind-1].value },
			stdout: (output) => {Vue.set(this.outputs,this.ind,this.outputs[this.ind]==undefined?output+'\n':this.outputs[this.ind]+ output + '\n') },
			stderr: (output)=>{this.errors = output}	
		});
//        let micropip = this.pyodide.pyimport("sympy");
    const loadPackagePromises = this.requiredPackages.map((pack) => {
        total -= 1;
        return this.pyodide.loadPackage(pack);
    });

    // Wait for all packages to be loaded
    this.loadingMessage = "Loading packages...";
    await Promise.all(loadPackagePromises);
//        await this.pyodide.loadPackage("sympy");
//        await this.pyodide.loadPackage("numpy");
//        console.log("tmd fucker is fucking")
		this.loadingMessage = "Running preloading scripts. These scripts is important to syncronize the random seed and redirect I/O..."
		this.pyodide.runPython(`import inspect
import js

system_input = input
def custom_input(args=''):
	event = js.CustomEvent.new('pythonEvent')
	event.lineno = inspect.stack()[1].lineno
	print(args)
	event.args = args
	js.document.dispatchEvent(event)
	return system_input()

input = custom_input

import sympy
original_randMatrix = sympy.randMatrix

def cuscus(*args,**kwargs):
    if 'prng' not in kwargs:
        kwargs['prng'] = random.Random(_random_seed)
    return original_randMatrix(*args,**kwargs)

sympy.randMatrix = cuscus
`)
//	this.reseed()
	this.initialize()
// This is preloading fucage. redefine input, later on we will realize redefine random.
	this.pythonReady = true
		console.log("load complicated")
		
        },
    fetchGithubDirectory: async function(owner, repo, path, callback) {
//    console.log("version:13:15")
    this.serverReady = false
    this.serverError = ""
    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };
//    console.log(this.$http)
    try {
        const response = await this.$http.get(endpoint, { headers });
        this.serverResponse = true
        this.serverReady = true
        this.files = response.data.map(file => ({
            name: file.name,
            path: file.path,
            type: file.type,
            download_url: file.download_url
        }));
        callback(null, this.files); // 直接返回原始响应数据
    } catch (error) {
        this.serverResponse = false
        this.serverError = error
        console.error('Error fetching GitHub directory:', error);
        callback(error, null); // 传递错误对象
    }
    },
    fetchGithubContent: async function(endpoint, callback = (a,b)=>{console.log(b)}) {
	this.clearScreen()
        this.code = "#waiting for the server response...\n # File adress: " + endpoint
        const headers = { 'Accept': 'application/vnd.github.v3+json' };
    try {
        const response = await this.$http.get(endpoint, { headers });
        callback(null, response.bodyText); // 直接返回原始响应数据
        this.code = response.bodyText // this actually fucked hahaha 
        this.fileName = endpoint.split("/").pop()
	if(this.fileName.split(".").pop()=="py"){
		this.restart()
	}else{
		this.outputs = [response.bodyText]
	}
    } catch (error) {
        console.error('Error fetching GitHub file:', error);
        callback(error, null); // 传递错误对象
    }
    },
    fetchData() {// The testing.
//'honeymath', 'honeymath.github.io', ''
        this.fetchGithubDirectory(this.owner, this.repo, this.path.join("/"), (error, files) => {
            if (error) {
                console.error('Failed to fetch directory:', error);
            } else {
                console.log('Directory files:', files);
            }
        });
    },
        runPythonCode() {
// Do not delete the following code, it is the dynamic change input and output method.
//		this.pyodide.setStdout({
//		                        batched: (output) => {
//						console.log("---------------")
//						console.log(output)
//						console.log(this.ind)
//						console.log(JSON.stringify(this.outputs))
//						Vue.set(this.outputs,this.ind,this.outputs[this.ind]==undefined?output+'\n':this.outputs[this.ind]+ output + '\n')//fucking.
//						console.log(JSON.stringify(this.outputs))
//						console.log("---------------")
//                		        }
//	                    });
//		this.pyodide.setStderr({
//		                        batched: (output) => {
//						Vue.set(this.errors,this.ind,this.errors+ output + '\n')//fucking.
  //              		        }
//	                    });
//		this.output = ''
//		this.result = ''
//		this.error = ''
		this.initialize()
            if (this.pyodide) {
		
      		try{
                    Vue.set(this.results,0, this.pyodide.runPython(this.code))
		    this.correct = true
		}catch(e){
			if(e.type!="OSError" && e.type!="Exception"){   // this excludes the input error, fuck it out.
				this.errors = "Python Error:\n"+e.message
			}
			else if(e.type=="Exception"){
				this.inputs.splice(this.ind,)
			this.error = e.message.substring(/Exception:.*$/gm.exec(e.message).index+11)
			}
		}            
            } else {
                this.output = 'Pyodide is not loaded yet.';
            }
        }
    }
});












new Vue({
    el: '#app'
});

