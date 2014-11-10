//var axiom = "I";
var compiledCode = [];
var rewrittenCode = [];
onmessage = function(e){
	compileJob(e.data[0],e.data[1]);
}
function compileJob(rule,iterations){
	if(!rule.length){return postMessage(["h"])}
	//console.log(rule);
	//console.log(iterations);
	var sequence=rule.match(/^[^=]*/)[0];
	var match = false;
	//console.log(rule);
	//var first = rule.split(" ")[0];
	//console.log(first,rule);
	//var rule = rule.unshift().join(" ");
	//console.log(rule);
	return rewrite(sequence,iterations);
	
	function rewrite(sequence,n){
		//console.log(sequence)
		//console.log(n)

		if(n>0){
			var rules = rule.split(" ");

			for(var i = 0; i<sequence.length; i++){
				applyRules(i,rules,0);
			}
			sequence = rewrittenCode.join("");
			
			rewrittenCode.length=0;
			return rewrite(sequence,n-1);
		}else{
			//sequence = rewrittenCode.join("");
			//rewrittenCode.length=0;
			//console.log(sequence)
			return compile(sequence);
		}
		function applyRules(i,rules,n){
			
			if(n<rules.length){
				var L = rules[n].split("=")[0];
				var R = rules[n].split("=")[1];
				if(L&&R){
					if(sequence.substr(i,L.length)===L){
						//console.log(R)	
						return rewrittenCode.push(R);
					}else{
						return applyRules(i,rules,n+1);
					}
				}else{
					return applyRules(i,rules,n+1);
				}
			}else{
				
				
				rewrittenCode.push(sequence[i]);
				
				return;
			}
		}
		function compile(sequence){

			compiledCode.length=0;
			//sequence=sequence.split("");
			for(var i = 0; i<sequence.length; i++){
				switch(sequence[i]){
					case "i":
					case "I":
					case "f":
					case "F":
					case "L":
					case "1":
					case "l":
					compiledCode.push("l");
					break;

					case "4":
					case "b":
					case "+":
					compiledCode.push("b");
					break;

					case "-":
					case "6":
					case "d":
					compiledCode.push("d");
					break;

					case "[":
					case "(":
					case "{":
					case "7":
					case "q":
					compiledCode.push("q");
					break;

					case "]":
					case ")":
					case "}":
					case "9":
					case "p":
					compiledCode.push("p");
					break;

					case "O":
					case "*":
					case "o":
					compiledCode.push("o");
					break;

					case "H":
					case "0":
					case "h":
					compiledCode.push("h");
					break;

					case "S":
					case "3":
					case "s":
					compiledCode.push("s");
					break;

					case "W":
					case "5":
					case "w":
					compiledCode.push("w");
					break;

					case ">":
					case "2":
					case "n":
					compiledCode.push("n");
					break;

					case "u":
					case "<":
					case "8":
					compiledCode.push("u");
					break;

					default:
					break;
				}
			}
			
			return postMessage(compiledCode);
		}
	}
	
}