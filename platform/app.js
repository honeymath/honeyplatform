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


Vue.component('repository',{
	//props: ['owner','repo'],
	data(){
		return{
			owner: "honeymath",
			repo:"mathProblems",
			files: [],
			path:[],
			selectedFile: null,
			serverResponse: false,// true if server responses, false if not
			servarReady:false,//set ready once the dir browser is done.
			serverError:"",
			loginView:false,
			fileName:""
		}
	},
	 mounted() {
    		console.log("start fetching git hub directory")
	    this.fetchData()
	    console.log("end fetching")
	},
	template: `
<div>	
		<div>
			<button @click = "loginView=!loginView;if(!loginView){fetchData()}">{{loginView?"Return to current repository":"Change repository"}}</button>
		  </div>

                
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
	`,
	methods: {
		   fetchGithubDirectory: async function(owner, repo, path, callback) {
		    this.serverReady = false
		    this.serverError = ""
		    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
		    const headers = {
			'Accept': 'application/vnd.github.v3+json'
		    };
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
			//this.clearScreen()
			this.$emit('clearScreen')
			//this.code = "#waiting for the server response...\n # File adress: " + endpoint
			this.$emit('code', "#waiting for the server response...\n # File adress: " + endpoint)
			const headers = { 'Accept': 'application/vnd.github.v3+json' };
		    try {
			const response = await this.$http.get(endpoint, { headers });
			callback(null, response.bodyText); // 直接返回原始响应数据
			//this.code = response.bodyText 
			this.$emit('code', response.bodyText)
			this.fileName = endpoint.split("/").pop()
			this.$emit('fileName' , this.fileName)
			if(this.fileName.split(".").pop()=="py"){
	//			this.restart()
				this.$emit('restart')
			}else{
		//		this.outputs = [response.bodyText]
				this.$emit('present')
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
	}
})

Vue.component('exercise',{
	props:['seed','inputs','outputs','error','errors','correct','score'],
	data(){
		return{
			showSeed:false,
		}
	},
	template:`
	<div>
		<div v-for="input in inputs" :key="input.indexCounter">
			<span v-html = "outputs[input.id]" style="font-size:20px"></span>
			</br>
			<div>
				<textarea  v-if = "input.type != 'matrix'&& input.type !='matrixlist' " v-model="input.value" @input="input.ready = true;$emit('runPythonCode')"></textarea>
				<matrixinput v-else v-model="input.value" @input="input.ready = true;$emit('runPythonCode')"></matrixinput>
			</div>
			</br>
			<hr>
		</div>	
		<span v-html = "outputs[inputs.length]" style="font-size:20px"></span>
		</br>
		<span v-html = "error" style="color:red;font-size:20px"></span>
		</br>
	    	<span v-if="correct" style="color:green;font-size:20px">Your answer is correct!</span>
		<span v-else style="color:orange;font-size:20px"><span v-if="score>0">Partial Credit:{{score}}</span></span>
		</br>
            	<span style="color:red">{{errors}}</span>
	</div>
	`
})


Vue.component('parent-component', {
    data() {
        return {
            pyodide: null,
	    pointer:0,
	    teacher:!student,
	    teacherToggle:!student,
	    backupcodeNotUsedPleaseDelete:`
print("$1+1=?$")
a = input()
if a!="2":
  raise Exception(f"Your answer is wrong! The answer of this question is not {a}")#score = 0.2
print("You are correct, then please answer $2+2=?$")
b = input()
if b!="4":
  raise Exception(rf"You are wrong , $2+2 \\neq {b}$!")#score = 0.4
				`,
	    exercises:[{
			    key:-1,
			    code: student?'print("Please click Choose File to upload exercises. Once finished, please click save to download the file. You may save your partial work and upload the file to continue anytime. Once you finished the exercise, just submit your downloaded work to the teacher.")':'print("Please browse exercises to compose a problem set. Once you finished, click save to save your problem set. Your student then is able to use your problem set to do exercises.")',
			    ind: 0,
			    outputs: ["fe"],
			    error:"",
			    errors: "",
			    inputs: [],
			    correct:false, // This controls the showing of the words "Answer Correct". After the program successfully runs, it shows up.
			    seed:0, // this is the random number seed.
			    correctUntil:0,
			    score:0,
			    show:true
	}],
	fileName:"example.py",
	indexCounter:0,
        showFiles:!student,// In code mode, files does not show up, but in browse file mode, it shows up
	requiredPackages:['sympy','numpy'],// the list of required packages, will add in the future.
	loadingMessage:" Python platform is loading... Please wait.",
	pythonReady: false,
	globalSeed:undefined,
	studentNumber:undefined,
	evaluation:false
        };
    },
    template: `
<div>
<div style="display: flex; justify-content: center; background-color:lightgreen; align-items: center; height: 100vh;" v-if = "!teacher && globalSeed==undefined">
		Student Number:   <input v-if="pythonReady" type="text" v-model="studentNumber"></input> <button v-if="pythonReady" @click="updateGlobalSeed">Enter System</button>
</div>

<div v-else>

<div v-if = "pythonReady">
            <div v-if="teacher" style="width:100%;height:40px;background-color:black">
                <a href="/" style="color:white">Return to Home</a> 
                <span style="color:lightblue">File Name =   </span>
                <input v-model="fileName" style="border:none;background-color:black;color:lightgreen;font-size:25px"></input>
                <button @click = "showFiles = !showFiles">{{showFiles?"Edit Code":"Browse Problems"}}</button>
              </div>

        <div v-if="teacher" style="width:55%;float:left">
		<div v-if = "showFiles">
			<repository @code="(x)=>{exercises[pointer].code = x}" @fileName="(x)=>{fileName=x}" @clearScreen="clearScreen" @restart="restart" @present="present"></repository>
		</div>
		<div v-else>
		    <div style="background-color:black">
			<button v-if="teacher" @click="restart">Run Code</button>
			<button v-if="teacher" @click="downloadCode">Download Code</button>
			<input v-if="teacher" style="width:200px" type="file" v-on:change="(event)=>{getFile(event,(x)=>{exercises[pointer].code=x})}" id="input-file">
		    </div>
		    <code-mirror v-model="exercises[pointer].code" ></code-mirror>
		</div>
       </div>
		
       <div :style="{width:teacher?'40%':'100%'}" style="float:left;padding:2%">
	
	<div>
	    <button v-if="teacherToggle" @click="teacher=!teacher;globalSeed = undefined;restart()">{{teacher?"Student Mode":"Teacher Mode"}}</button>
            <button @click="downloadStatus()">Save/Download</button>
	    <input v-if="teacher" type="checkbox" v-model="evaluation"><span v-if="teacher">Evaluation Script</span></input>
	    <button v-if="teacher" @click="restart">Refresh</button>
	    <input style="width:200px" type="file" v-on:change="(event)=>{getFile(event,(x)=>{uploadStatus(x)})}" id="input-file">
	    <!--button v-if="teacher" @click="globalSeed = undefined;restart()">Randomize Question</button-->

		    

	    <div v-if="teacher || globalSeed!=undefined" v-for="(ex,key) in exercises" :key="ex.key">
		<span v-if="key==pointer" style="color:red;background:lightblue">Problem{{key}}:</span> 
		<span v-else @click="pointer=key" style="cursor: pointer">Problem{{key}}:</span> 
			
		<button @click="ex.show=!ex.show">{{ex.show?"Hide":"Show"}}</button>
		<button v-if="teacher" @click="exercises.splice(key,1)">Delete Problem</button>
		<span v-if="teacher">Seed:</span>
		    <input v-if="teacher" v-model = "ex.seed" @input = "pointer=key;runPythonCode()"></input>
		<exercise v-if="ex.show" :seed="ex.seed" :inputs="ex.inputs" :outputs="ex.outputs" :error="ex.error" :errors="ex.errors" :correct="ex.correct" :score="ex.score" @runPythonCode="()=>{pointer=key;runPythonCode()}"></exercise>
	    </div>



		<button v-if="teacher" @click="exercises.push({key:indexCounter,code:'',ind:0,outputs:[],error:'',errors:'',inputs:[],correct:false,seed:globalSeed===undefined?Math.random():globalSeed,correctUntil:0,show:true});indexCounter+=1;pointer = exercises.length-1">Add Problem</button>
	</div>
       </div>
</div>
<div v-else>
{{loadingMessage}}
</div>
</div>
</div>
    `,
	updated(){
     this.$nextTick(function() {try{
						 MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
					 }catch(e){}
	    })},
    mounted() {

	document.addEventListener('pythonEvent', (event) => {
           // const params = event;
           // console.log(`JavaScript function called with parameters: ${JSON.stringify(params)}`);
           // alert(`JavaScript function called with parameters: ${JSON.stringify(params)}`);
		this.prepareInput({
			line: event.lineno,
			context: this.exercises[this.pointer].code.split('\n')[event.lineno - 1]
		})
		//let line = event.lineno
		//let context = this.code.split('\n')[line-1]
		//console.log(event.lineno)
        });
        this.loadPyodide();
//	this.initialize();// this cause problem when mounting
        },
    methods: {
	restart(){
		//this.pyodide.runPython("_random_array = []")

		//this.exercises[this.pointer].seed = Math.random()
		//this.exercises[this.pointer].inputs.splice(0,)
		//this.runPythonCode()
		var pointer_backup = this.pointer
		this.exercises.forEach((obj,ind)=>{
			obj.seed = this.globalSeed === undefined?Math.random():this.globalSeed
			obj.inputs.splice(0,)
			obj.score = 0
			this.pointer = ind
			this.runPythonCode()
		})
		this.pointer = pointer_backup
	},
	present(){
		this.exercises[this.pointer].outputs = [this.exercises[this.pointer].code]
	},
	updateGlobalSeed(){
		this.globalSeed = "0."+this.studentNumber
		this.fileName = this.studentNumber + ".json"
		this.exercises.forEach((obj,ind)=>{
			obj.seed = this.globalSeed === undefined?obj.seed:this.globalSeed
			this.pointer = ind
			this.runPythonCode()
		})
	},
	downloadCode(){
		this.download(this.exercises[this.pointer].code, this.fileName)
	},
	downloadStatus(){
		var dict = []
		console.log(this.evaluation)
		this.exercises.forEach((obj,ind)=>{
			
			dict.push({
				code:obj.code,
//				inputs:this.evaluation?(obj.inputs.filter(input => input.ready)):obj.inputs,
				inputs:this.evaluation?[]:obj.inputs,
				seed:obj.seed
				})
		})
		this.download(JSON.stringify(dict),this.teacher?"exercises.json":this.fileName)
	},
	uploadStatus(text){
//		console.log(text)
		var dict = JSON.parse(text)
		console.log(dict)
		
		var tempExercises = this.exercises.splice(0,)
//		var sum = 0
		dict.forEach((obj,ind)=>{
			this.exercises.push({
				key:this.indexCounter,
				ind:0,
				code:obj.code,	
				inputs:obj.inputs.length==0 && tempExercises[ind]!= undefined && tempExercises[ind].inputs!= undefined ? tempExercises[ind].inputs : obj.inputs,
				seed:this.globalSeed === undefined?obj.seed:this.globalSeed,
				outputs:[],
				error:"",
				errors:"",
				correct:false,
				correctUntil:0,
				score:0,
				show:true
			})
			this.pointer = this.exercises.length - 1
			this.runPythonCode()
			this.indexCounter += 1
		})
		
	},
	download(todown,fileName){
		var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(todown));
                element.setAttribute('download', fileName);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
	},
	clearScreen(){//not sure if this is required?
		this.exercises[this.pointer].ind = 0
		this.exercises[this.pointer].inputs.splice(0,)
		this.exercises[this.pointer].outputs = ["Please Wait while the system is compiling the script ... "]
		this.exercises[this.pointer].errors = ""
		this.exercises[this.pointer].error = ""
		this.pyodide.runPython("_random_index = 0")
		this.exercises[this.pointer].correct = false
	},
	initialize(){// initialize all parameters.
		this.exercises[this.pointer].ind = 0
//		this.inputs.splice(0,)
		this.exercises[this.pointer].outputs = []
		this.exercises[this.pointer].errors = ""
		this.exercises[this.pointer].error = ""
//		this.pyodide.runPython("_random_index = 0")
		this.reseed()
		this.exercises[this.pointer].correct = false
	},
	reseed(){
		this.pyodide.runPython("import random")
		this.pyodide.runPython("import numpy")
		this.pyodide.runPython("_random_seed = "+this.exercises[this.pointer].seed)
		this.pyodide.runPython("random.seed(_random_seed)")//reseed
		this.pyodide.runPython("numpy.random.seed(int(123456789*_random_seed))")//reseed
	},
	parameters(context){// helper function
		let splita = context.split("#")
		let type = ""
		let parameters = []
		if (splita.length > 1){
			let rinima = splita[splita.length-1].split("(")
			let caonima = rinima[1]==undefined?"":rinima[1].split(")")[0]
			parameters = caonima.split(",")
			type = rinima[0]
		}
		return {type,parameters} 
	},
	getscore(){
		let lineno = this.exercises[this.pointer].correctUntil
		let context = this.exercises[this.pointer].code.split('\n')[lineno-1]
//		console.log("context")
//		console.log(context)
		let splita = context.split("#")
		let ll = splita.length
		if(ll > 1){
			this.pyodide.runPython(splita[ll-1])
		}
		let result = this.pyodide.runPython("score")
		if(result != ""){
			this.exercises[this.pointer].score = result
		}
		
	},
//	parameters,type = parameters(context)
	prepareInput({line,context}){
		let {type,parameters} = this.parameters(context)
		console.log(type)
		console.log(parameters)
		let rinimade = this.exercises[this.pointer].ind
		console.log(rinimade)
		console.log(this.pointer)
		console.log(this.exercises[this.pointer])
		if(this.exercises[this.pointer].inputs[rinimade]==undefined){
					Vue.set(this.exercises[this.pointer].inputs, this.exercises[this.pointer].ind, {indexCounter:this.indexCounter, id:this.exercises[this.pointer].ind,value:"", line:line, context:context, ready:false, type:type, parameters:parameters})
					console.log(this.exercises[this.pointer].inputs[this.ind])
					this.indexCounter += 1
				}
	},
	getFile: function(event,callback) {
	            const input = event.target
                if ('files' in input && input.files.length > 0) {
	                this.placeFileContent(
                            input.files[0],callback)
                    }
                input.value=""
                },
            placeFileContent: function(file,callback) {
	                this.readFileContent(file).then(content => {
				callback(content)
  	                	//this.exercises[this.pointer].code = content
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
			stdin: ()=>{ if(this.exercises[this.pointer].inputs[this.exercises[this.pointer].ind]==undefined || !this.exercises[this.pointer].inputs[this.exercises[this.pointer].ind].ready){ throw "This error is throwed by me to stop the python code. I can not control Pyodide, it throw my error without my control. Don't worry, it would not destroy the earth. " } this.exercises[this.pointer].ind += 1; return this.exercises[this.pointer].inputs[this.exercises[this.pointer].ind-1].value },
			stdout: (output) => {Vue.set(this.exercises[this.pointer].outputs,this.exercises[this.pointer].ind,this.exercises[this.pointer].outputs[this.exercises[this.pointer].ind]==undefined?output+'\n':this.exercises[this.pointer].outputs[this.exercises[this.pointer].ind]+ output + '\n') }
		});
//        let micropip = this.pyodide.pyimport("sympy");
    const loadPackagePromises = this.requiredPackages.map((pack) => {
        total -= 1;
        return this.pyodide.loadPackage(pack);
    });

    // Wait for all packages to be loaded
    this.loadingMessage = "Loading packages...";
	console.log("try loading packs")
    await Promise.all(loadPackagePromises);
//        await this.pyodide.loadPackage("sympy");
//        await this.pyodide.loadPackage("numpy");
		this.loadingMessage = "Running preloading scripts. These scripts is important to syncronize the random seed and redirect I/O..."
	console.log("loading rinimabi")
		let rinimabi = this.pyodide.runPythonAsync(`import inspect
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
`)

	console.log("loading caonimabi")
	let caonimabi = this.pyodide.runPythonAsync(
`
import sympy
original_randMatrix = sympy.randMatrix

def cuscus(*args,**kwargs):
    if 'prng' not in kwargs:
        kwargs['prng'] = random.Random(_random_seed)
    return original_randMatrix(*args,**kwargs)

sympy.randMatrix = cuscus
`)
	console.log("start waiting fuck")
	await Promise.all([rinimabi,caonimabi])
	console.log("waiting fucked")
//	this.reseed()
	this.initialize()
// This is preloading fucage. redefine input, later on we will realize redefine random.
	this.pythonReady = true
	console.log("load complicated")
	this.runPythonCode()
		
        },
         runPythonCode() {
		this.initialize()
            if (this.pyodide) {
		
      		try{
                    this.pyodide.runPython(this.exercises[this.pointer].code)
		    this.exercises[this.pointer].correct = true
		}catch(e){
			if(e.type!="OSError" && e.type!="Exception"){   // this excludes the input error, fuck it out.
				this.exercises[this.pointer].errors = "Python Error:\n"+e.message
			}
			else if(e.type=="Exception"){
				this.exercises[this.pointer].inputs.splice(this.exercises[this.pointer].ind,)
				this.exercises[this.pointer].error = e.message.substring(/Exception:.*$/gm.exec(e.message).index+11)
				const match = e.message.match(/File "<exec>", line (\d+),/)
				this.exercises[this.pointer].correctUntil = match?match[1]:0
				this.getscore()
			}
		}            
            } else {
                console.log('Pyodide is not loaded yet.');
            }
        }
    }
});












new Vue({
    el: '#app'
});

