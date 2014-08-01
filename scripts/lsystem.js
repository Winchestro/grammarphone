define(function LSystem(){
	var canvas2d = document.getElementById("canvas2d");
	window.addEventListener("resize",scaleFS.bind(canvas2d),false);
	

	var debugDrawTime=0;
	var debugDrawCalls=0;
	var debugFrames = [];
	var cursor = {
		i:0,
		stack:[{x:0,y:0,a:0,s:0}]
	}
	var startPos = [window.innerWidth/2,window.innerHeight*.75];
	var size,angleL,angleR,audioData,clearColor,sequence,compiledCode =[];
	var compiler = new Worker("scripts/compiler.js");


	var ctx = canvas2d.getContext("2d");
		
	

	
	//var startAngle= -Math.PI*1.5;
	var startAngle= Math.PI;
	var scaleUP = .75;
	var scaleDOWN = .75;
	var currentScale = 1.;
	var axiom = "I";

	var turtle = {
		pushStack:function(){
			if(cursor.i+1===cursor.stack.length)
				cursor.stack[cursor.i+1]={x:0,y:0,a:0,s:0};
			cursor.stack[cursor.i+1].x=cursor.stack[cursor.i].x;
			cursor.stack[cursor.i+1].y=cursor.stack[cursor.i].y;
			cursor.stack[cursor.i+1].a=cursor.stack[cursor.i].a;
			cursor.stack[cursor.i+1].s=cursor.stack[cursor.i].s;
			cursor.i++;
		},
		popStack:function(){
			if(cursor.i>0)
				cursor.i--;
		},
		translate:function(x){
			//console.log("stack x,y",cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
			//console.log("sin cos",Math.sin(cursor.stack[cursor.i].x),Math.cos(cursor.stack[cursor.i].y))
			//console.log("angle",cursor.stack[cursor.i].a)
			//console.log("cos angle",Math.cos(cursor.stack[cursor.i].a))
			//console.log("x*cos angle",x*Math.cos(cursor.stack[cursor.i].a))
			//console.log(cursor.stack[cursor.i].y);
			cursor.stack[cursor.i].x+=x
			*Math.sin
			(cursor.stack[cursor.i].a)
			*cursor.stack[cursor.i].s;
			cursor.stack[cursor.i].y+=(x*Math.cos(cursor.stack[cursor.i].a)*cursor.stack[cursor.i].s);
			//console.log(cursor.stack[cursor.i].y);
			//console.log("cursor",cursor.i)
			//console.log("x,y",x,y);
			

		},
		rotate:function(a){
			cursor.stack[cursor.i].a+=a;
		},
		scale:function(s){
			cursor.stack[cursor.i].s*=s;
		},
		p:function(){
			debugDrawCalls++;
			//ctx.restore();
			
			this.popStack();
		},
		
		q:function(){
			debugDrawCalls++;
			//ctx.save();
			
			this.pushStack();
		},
		b:function(){
			debugDrawCalls++;
			//ctx.rotate(angleR);

			this.rotate(angleR);
		},
		d:function(){
			debugDrawCalls++;
			//ctx.rotate(angleL);

			this.rotate(angleL);
		},
		u:function(){
			debugDrawCalls++;
			//ctx.scale(1/scaleUP,1/scaleUP);

			this.scale(1/scaleUP);
		},
		n:function(){
			debugDrawCalls++;
			//ctx.scale(1*scaleDOWN,1*scaleDOWN);
			
			this.scale(1*scaleDOWN);
		},
		s:function(i,data){
			if(data){
			ctx.beginPath();
				var n = (Math.floor(data[i%data.length]/256*10))
				for(var v = 0; v<n; v++){
					debugDrawCalls++;
					//ctx.rotate((data[(i+v)%data.length]/128-1)*angleL);
					ctx.lineWidth=size/8000*cursor.stack[cursor.i].s;
					this.rotate((data[(i+v)%data.length]/128-1)*angleL);
					ctx.moveTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
					this.translate((data[i%data.length]/256*size/2000));
					ctx.lineTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
					//ctx.translate((data[(i+v)%data.length]/256*size/2000)+size/2000);
				}
			}
			ctx.stroke();
		},
		w:function(i,data){
			ctx.beginPath();
			if(data){
				var n = (Math.floor(data[i%data.length]/256*10))
				for(var v = 0; v<n; v++){
					debugDrawCalls++;
					if(data[(i+v)%data.length]<96){
						this.rotate(angleL);
						//ctx.rotate(angleL);
					}else if(data[(i+v)%data.length]>160){
						this.rotate(angleR);
						//ctx.rotate(angleR);
					}
					ctx.moveTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
					this.translate(size/2000,0);
					ctx.lineWidth=size/8000*cursor.stack[cursor.i].s;
					ctx.lineTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
					//ctx.translate(size/2000,0);
				}
			}
			ctx.stroke();
		},
		h:function(i,data){
			debugDrawCalls++;
			this.translate((data[i%data.length]/256*size/2000)+size/2000);
			//ctx.moveTo((data[i%data.length]/256*size/2000)+size/2000,0);
			//ctx.translate((data[i%data.length]/256*size/2000)+size/2000,0);
		},

		l:function(i,data){
			debugDrawCalls++;
			ctx.beginPath();
			ctx.lineWidth=size/8000*cursor.stack[cursor.i].s;
			ctx.moveTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
			this.translate((data[i%data.length]/256*size/2000)+size/2000);
			ctx.lineTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
			//ctx.moveTo(0,0)
			//ctx.translate((data[i%data.length]/256*size/2000)+size/2000,0);
			ctx.stroke();
			
			//ctx.stroke();
		},
		o:function(i,data){
			if(data){
				debugDrawCalls++;
				ctx.beginPath()
				ctx.fillStyle="hsl("+(data[i%data.length]*1.75)+",100%,50%)";
				//ctx.moveTo(cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
				ctx.arc(
					cursor.stack[cursor.i].x,
					cursor.stack[cursor.i].y,
					Math.abs(.285*data[i%data.length]/256*size/2000)*cursor.stack[cursor.i].s,
					0,Math.PI*2);
				ctx.fill();
				//ctx.stroke();
			}
		}
	}

	scaleFS.apply(canvas2d,[]);

	return {
		init:init,
		draw:draw,
		clearScreen:clearScreen,
		setClearColor:setClearColor,
		setData:setData,
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
		compiler.postMessage([rule,iterations]);
		var timeout = setTimeout(timeoutHandler,5000);
		compiler.addEventListener("message",successHandler,false);
		function timeoutHandler(){
			compiler.terminate();
			compiler = new Worker("scripts/compiler.js");
			console.log("compiler timed out");
		}
		function successHandler(e){
			compiler.removeEventListener("message",successHandler);
			clearTimeout(timeout);
			compiledCode=e.data;
			//console.log(e.data.length);
			compiler.onmessage=null;
			clearScreen();
			draw();		
		}
	}
	function setData(_audioData){
		audioData = _audioData;
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
	function setClearColor(color,alpha){
		clearColor = toRGBA(color,alpha);
	}
	function clearScreen(){
		ctx.setTransform(1,0,0,1,0,0);
		ctx.fillStyle = clearColor;
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

		if(this.width<dE.clientWidth||this.height<dE.clientHeight){
			this.width = dE.clientWidth;
			this.style.width = dE.clientWidth+"px";
			this.height = dE.clientHeight;
			this.style.height = dE.clientHeight+"px";
			draw();
		}
		
		
	}
	function debugTimerStart(){
		return Date.now();
	}
	function debugTimerEnd(n){
		return Date.now()-n;
	}
	function draw(){
		//console.log(cursor.stack[0]);
		//console.log(cursor.stack[1]);
		cursor.stack[0].x=startPos[0];
		cursor.stack[0].y=startPos[1];
		cursor.stack[0].a=startAngle;
		cursor.stack[0].s=1;
		cursor.i=0;
		//turtle.translate(startPos[0],startPos[1]);
		//turtle.rotate(startAngle);

		//console.log(cursor);
		//console.time("drawTime")
		//debugDrawTime = debugTimerStart();
		debugDrawCalls=0;
		//clear(clearColor);
		//if(!data){return}
		//ctx.setTransform(1,0,0,1,0,0);
		//ctx.translate(startPos[0],startPos[1]);
		
		//pos[0]=500;
		//pos[1]=500;
		//dir=0;
		//ctx.rotate(startAngle);
		ctx.lineWidth = size/10000;
		//ctx.lineWidth=1;
		ctx.fillStyle = toRGBA(plantColor.value,plantAlpha.value);
		ctx.strokeStyle = toRGBA(plantColor.value,plantAlpha.value);
		ctx.lineCap = "round";
		for(var i = 0; i<compiledCode.length; i++){
				//ctx.beginPath();
				turtle[compiledCode[i]](i,audioData);
				//ctx.stroke();
				//ctx.fill();
		}
		
		//debugDrawTime = debugTimerEnd(debugDrawTime);
		//debugFrames.push(debugDrawTime);
		/*
		ctx.fillStyle="white";
		ctx.font = "26px consolas";
		ctx.setTransform(1,0,0,1,0,0);
		ctx.fillText(debugDrawTime+"ms",20,80);
		ctx.fillText(((1000/debugDrawTime)>>0)+"FPS",20,110);
		ctx.fillText(debugDrawCalls+" drawcalls",20,140);
		*/
		//console.timeEnd("drawTime")

		//ctx.restore();
		//return sequence;
	}
});

/*
I=@ö!~ !=!ä!ö!ö!ä!
drawTime: 6.000ms 
31252 
drawTime: 82.000ms 
156252 
drawTime: 85.000ms 
781252 
drawTime: 363.000ms 
3906252 
drawTime: 1244.000ms 


drawTime: 37.000ms 
31249 
drawTime: 177.000ms
156249
drawTime: 601.000ms 
781249 
drawTime: 3001.000ms 
3906249 
drawTime: 14909.000ms
*/