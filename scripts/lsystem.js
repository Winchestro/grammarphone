define(function LSystem(){
	var canvas2d = document.getElementById("canvas2d");
	window.addEventListener("resize",scaleFS.bind(canvas2d),false);
	scaleFS.apply(canvas2d,[]);

	

	
	var ctx = canvas2d.getContext("2d");
		ctx.lineCap = "round";
	var size,angleL,angleR,sequence;

	
	var startPos = [canvas2d.width/2,canvas2d.height*.75];
	var startAngle= Math.PI*1.5;
	
	var scaleUP = .75;
	var scaleDOWN = .75;
	var currentScale = 1.;
	var axiom = "I";

	return {
		init:init,
		draw:draw,
		clearScreen:clearScreen,
		setRule:setRule,
		setCenter:setCenter,
		moveCenter:moveCenter,
		setSize:setSize,
		setAngle:setAngle
	};
	function init(rule,iterations,size,angle){
		setRule(rule,iterations);
		setSize(size);
		setAngle(angle);
	};
	function setRule(rule,iterations){
		sequence=axiom;

		var r = rule.split(" ");
		r.forEach(function(e,i){
			var rA = e.split("=")[0];
			var rB = e.split("=")[1];
			r[i] = [rA,rB];
		});
		rewrite(iterations);
		function rewrite(n){
			if(n>0){
				r.forEach(function(e,i){
					//console.log(e);
					if(e[0]&&e[1]){
						sequence=sequence.split(e[0]).join(e[1]);
					};
				});
				return rewrite(n-1);
			}else{
				return sequence;
			}
		}
	}

	function setCenter(x,y){
		startPos[0]=x;
		startPos[1]=y;
	}
	function moveCenter(x,y){
		startPos[0]+=x;
		startPos[1]+=y;
	}
	function setSize(n){
		size=n*Math.pow(1.2,n);
	}
	function setAngle(n){
		angleL = n/360*Math.PI*2;
		angleR = -n/360*Math.PI*2;
	}
	function clearScreen(color,alpha){
		ctx.setTransform(1,0,0,1,0,0);
		ctx.fillStyle = toRGBA(color,alpha);
		ctx.fillRect(0,0,canvas2d.width,canvas2d.height);
	}
	function toRGBA(s,a){
		var R = parseInt(s[1]+s[2],16);
		var G = parseInt(s[3]+s[4],16);
		var B = parseInt(s[5]+s[6],16);
		return "rgba("+R+","+G+","+B+","+a+")";
	}
	function scaleFS(){
		var dE = document.documentElement;
		if(this.width<dE.clientWidth){
			this.width = dE.clientWidth;
			this.style.width = dE.clientWidth+"px";
		}
		if(this.height<dE.clientHeight){
			this.height = dE.clientHeight;
			this.style.height = dE.clientHeight+"px";
		}
		
		
	}
	function draw(data){
		//clear(clearColor);
		//if(!data){return}
		ctx.setTransform(1,0,0,1,0,0);
		ctx.translate(startPos[0],startPos[1]);
		ctx.rotate(startAngle);
		ctx.lineWidth = size/10000;
		
		ctx.strokeStyle = toRGBA(plantColor.value,plantAlpha.value);
		
		for(var i = 0; i<sequence.length; i++){
			switch(sequence[i]){

				case "i":Line();break;
				case "I":Line();break;
				case "f":Line();break;
				case "F":Line();break;

				case "L":Line();break;
				case "O":Fruit();break;
				case "H":Invisible();break;
				case "S":Antenna();break;
				case "W":Tentacle();break;
				case "+":turnLeft();break;
				case "-":turnRight();break;
				case ">":scaleDown();break;
				case "<":scaleUp();break;
				case "[":pushStack();break;
				case "]":popStack();break;

				case "1":Line();break;
				case "*":Fruit();break;
				case "0":Invisible();break;
				case "3":Antenna();break;
				case "5":Tentacle();break;
				case "4":turnLeft();break;
				case "6":turnRight();break;
				case "8":scaleUp();break;
				case "2":scaleDown();break;
				case "7":pushStack();break;
				case "9":popStack();break;
				
				case "l":Line();break;
				case "o":Fruit();break;
				case "h":Invisible();break;
				case "s":Antenna();break;
				case "w":Tentacle();break;
				case "b":turnLeft();break;
				case "d":turnRight();break;
				case "u":scaleUp();break;
				case "n":scaleDown();break;
				case "q":pushStack();break;
				case "p":popStack();break;
				
				
				default:break;
			}
		}
		function popStack(){
			ctx.restore();
		}
		function pushStack(){
			ctx.save();
		}
		function turnRight(){
			ctx.rotate(angleR);
		}
		function turnLeft(){
			ctx.rotate(angleL);
		}
		function scaleUp(){
			ctx.scale(1/scaleUP,1/scaleUP);
		}
		function scaleDown(){
			ctx.scale(1*scaleDOWN,1*scaleDOWN);
		}
		function Antenna(){
			var n = (Math.floor(data[i%data.length]/256*10))
			Line(n,true);
			
			
		}
		function Tentacle(){
			var n = (Math.floor(data[i%data.length]/256*10))
			Line(n,true,true,false);
		}
		function Invisible(){
			ctx.moveTo((data[(i)%data.length]/256*size/2000)+size/2000,0);
			ctx.translate((data[(i)%data.length]/256*size/2000)+size/2000,0);
		}

		function Line(num,r,f,m){
			if(typeof num === "undefined"){num = 1;}
			if(typeof r === "undefined"){r = false;}
			if(typeof f === "undefined"){f = false;}
			if(typeof m === "undefined"){m = true;}
			ctx.beginPath();
			for(var v = 0; v<num; v++){
				if(r){
					if(f){
						if(data[(i+v)%data.length]<96){
							ctx.rotate(angleL);
						}else if(data[(i+v)%data.length]>160){
							ctx.rotate(angleR);
						}
					}else{
						ctx.rotate((data[(i+v)%data.length]/128-1)*angleL);
					}
				}
				//ctx.lineWidth = (data[(i+v)%data.length]/64+1)*size/20;
				
				if(m){

					ctx.moveTo((data[(i+v)%data.length]/256*size/2000)+size/2000,0);
					ctx.lineTo(0,0);
					ctx.translate((data[(i+v)%data.length]/256*size/2000)+size/2000,0);
				}else{
					ctx.moveTo(size/2000,0);
					ctx.lineTo(0,0);
					ctx.translate(size/2000,0);
				}
			
			}
			ctx.stroke();
		}
		function Fruit(){
			ctx.beginPath()
			ctx.fillStyle="hsl("+(data[i%data.length]*1.75)+",100%,50%)";
			ctx.arc(0,0,Math.abs(.385*data[i%data.length]/256*size/2000),0,Math.PI*2);
			ctx.fill();
		}
		//ctx.restore();
		//return sequence;
	}
});