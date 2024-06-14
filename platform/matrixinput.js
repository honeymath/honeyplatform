Vue.component('matrixinput', {
    props: {
        value: {
            type: String,
            default: '[]'
        },
        x: {
            type: Number,
            default: 55
        },
        y: {
            type: Number,
            default: 55
        }
    },
    template: `
    <div>
      <button v-on:click="addmatrix">Addmatrix</button>
      <div class="addmatrix" v-if="addswitch" v-on:click="emitdata" v-on:mousemove="trydata">
        <div v-for="index in columntoadd" class="column">
          <div v-bind:style="{width: (x-5)+'px', height:(y-5)+'px'}" v-for="sindex in rowtoadd" class="entry highlightbox"></div>
        </div>
      </div>
      </br>
     <div style="display:flex;width:100%">
      <div v-for="(mat, matindex) in localmatrix" class="mat">
        <div><button v-on:click="removematrix(matindex)">Delete me</button></div>
        <div v-for="(column, colindex) in mat" class="column">
          <span v-for="(entry, entryindex) in column">
            <input type="text" v-bind:style="{width: (x-5)+'px', height:(y-5)+'px'}" v-model="localmatrix[matindex][colindex][entryindex]" v-on:keyup="changeentry(matindex, colindex, entryindex)" class="entry regularbox">
            </input></br>
          </span>
        </div>
      </div>
    </div>
    `,
    data() {
        return {
            localmatrix: [],
            rowtoadd: 0,
            columntoadd: 0,
            addswitch: false
        };
    },
   mounted() {
        this.updateLocalMatrix(this.value);
    },
	created() {
        this.updateLocalMatrix(this.value);
    },
    watch: {
        value(newValue) {
            this.updateLocalMatrix(newValue);
        }
    },
    methods: {
	updateLocalMatrix(value) {
            try {
		if(value!=""){
                	this.localmatrix = JSON.parse(value).map(this.transposeArray);
		}else{
			this.localmatrix = []
		}
            } catch (e) {
                console.error('Error parsing value:', value);
                console.error('Error parsing value:', e.message);
            }
        },
        trydata: function(e) {
            this.columntoadd = parseInt(e.offsetX / this.x);
            this.rowtoadd = parseInt(e.offsetY / this.y);
        },
        addmatrix: function() {
            this.addswitch = true;
        },
        changeentry: function(position, column, row) {
            const tochange = {
                position: position,
                column: column,
                row: row,
                value: this.localmatrix[position][column][row]
            };
            console.log('here:', tochange);
            this.$emit('changeentry', tochange);
            this.emitChange()
        },
        emitChange: function(){
	        this.$emit('input',JSON.stringify(this.localmatrix.map(this.transposeArray)))
        },
        transposeArray(array) { return array[0].map((_, colIndex) => array.map(row => row[colIndex])); },
        removematrix: function(index) {
            this.localmatrix.splice(index, 1);
            this.emitChange()
        },
        emitdata: function() {
            this.addswitch = false;
            this.localmatrix.push(
                Array.from(
                    { length: this.columntoadd },
                    () => {
                        return Array.from({ length: this.rowtoadd }, () => { return 0 });
                    }
                )
            );
	        this.$emit('input',JSON.stringify(this.localmatrix.map(this.transposeArray)))
            //console.log(this.localmatrix);
        },
        anima: function() {
            alert('2');
        }
    }
});
