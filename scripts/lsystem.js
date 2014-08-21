define(["jquery","audioplayer"],function LSystem($,AudioPlayer){
	var canvas2d = document.getElementById("canvas2d");
	window.addEventListener("resize",scaleFS.bind(canvas2d),false);
	var params={
		maxDrawTime:	2000,
		maxLoopTime:	1000,
		compileTimeout: 5000,
		startUpTimeout: 20000
	};
	
	var stackX=[];
	var stackY=[];
	var stackA=[];
	var stackS=[];
	var cursor=0;

	var startPos = [window.innerWidth/2,window.innerHeight*.75];
	var size,angleL,angleR,audioData,clearColor,lineColor,drawTime,sequence,looping,usingTimeDomain,compiledCode =[];
	var compiler = new Worker("scripts/compiler.js");
	var wait,launched = false;

	var ctx = canvas2d.getContext("2d");
		
	
	$(AudioPlayer).on("play",audioStart)
	$(AudioPlayer).on("pause",audioStop);
	
	//var startAngle= -Math.PI*1.5;
	var startAngle= Math.PI;
	var scaleUP = .75;
	var scaleDOWN = .75;
	var currentScale = 1.;
	var axiom = "I";

	var turtle = {
		pushStack:function(){
			/*
			if(cursor.i+1===cursor.stack.length)
			cursor.stack[cursor.i+1]={x:0,y:0,a:0,s:0};
			cursor.stack[cursor.i+1].x=cursor.stack[cursor.i].x;
			cursor.stack[cursor.i+1].y=cursor.stack[cursor.i].y;
			cursor.stack[cursor.i+1].a=cursor.stack[cursor.i].a;
			cursor.stack[cursor.i+1].s=cursor.stack[cursor.i].s;
			cursor.i++;
			*/
			
			
			stackX[cursor+1]=stackX[cursor];
			stackY[cursor+1]=stackY[cursor];
			stackA[cursor+1]=stackA[cursor];
			stackS[cursor+1]=stackS[cursor];
			cursor++;
			
		},
		popStack:function(){
			if(cursor>0)
				cursor--;
		},
		translate:function(x){
			//console.log("stack x,y",cursor.stack[cursor.i].x,cursor.stack[cursor.i].y);
			//console.log("sin cos",Math.sin(cursor.stack[cursor.i].x),Math.cos(cursor.stack[cursor.i].y))
			//console.log("angle",cursor.stack[cursor.i].a)
			//console.log("cos angle",Math.cos(cursor.stack[cursor.i].a))
			//console.log("x*cos angle",x*Math.cos(cursor.stack[cursor.i].a))
			//console.log(cursor.stack[cursor.i].y);
			stackX[cursor]+=x
				*Math.sin
				(stackA[cursor])
				*stackS[cursor];
			stackY[cursor]+=(x
				*Math.cos
				(stackA[cursor])
				*stackS[cursor]);
			//console.log(cursor.stack[cursor.i].y);
			//console.log("cursor",cursor.i)
			//console.log("x,y",x,y);
			

		},
		rotate:function(a){
			stackA[cursor]+=a;
		},
		scale:function(s){
			stackS[cursor]*=s;
		},
		p:function(){
			this.popStack();
		},
		
		q:function(){
			this.pushStack();
		},
		b:function(){
			this.rotate(angleR);
		},
		d:function(){
			this.rotate(angleL);
		},
		u:function(){
			this.scale(1/scaleUP);
		},
		n:function(){
			this.scale(1*scaleDOWN);
		},
		s:function(i,data){
			if(data){
			ctx.beginPath();
				var n = (Math.floor(data[i%data.length]/256*10))
				for(var v = 0; v<n; v++){
					ctx.lineWidth=size/10000000*canvas2d.width*stackS[cursor];
					this.rotate((data[(i+v)%data.length]/128-1)*angleL);
					ctx.moveTo(stackX[cursor],stackY[cursor]);
					this.translate((data[i%data.length]/256*size/2500000*canvas2d.width));
					ctx.lineTo(stackX[cursor],stackY[cursor]);
				}
			}
			ctx.stroke();
		},
		w:function(i,data){
			ctx.beginPath();
			if(data){
				var n = (Math.floor(data[i%data.length]/256*10))
				for(var v = 0; v<n; v++){
					if(data[(i+v)%data.length]<96){
						this.rotate(angleL);
					}else if(data[(i+v)%data.length]>160){
						this.rotate(angleR);
					}
					ctx.moveTo(stackX[cursor],stackY[cursor]);
					this.translate(size/2500000*canvas2d.width);
					ctx.lineWidth=size/10000000*canvas2d.width*stackS[cursor];
					ctx.lineTo(stackX[cursor],stackY[cursor]);
				}
			}
			ctx.stroke();
		},
		h:function(i,data){
			this.translate((data[i%data.length]/256*size/2500000*canvas2d.width)+size/2500000*canvas2d.width);
		},

		l:function(i,data){
			ctx.beginPath();
			ctx.lineWidth=size/10000000*canvas2d.width*stackS[cursor];
			ctx.moveTo(stackX[cursor],stackY[cursor]);
			this.translate((data[i%data.length]/256*size/2500000*canvas2d.width)+size/2500000*canvas2d.width);
			ctx.lineTo(stackX[cursor],stackY[cursor]);
			ctx.stroke();
		},
		o:function(i,data){
			if(data){
				ctx.beginPath()
				ctx.fillStyle="hsl("+(data[i%data.length]*1.0)+",100%,50%)";
				ctx.arc(
					stackX[cursor],
					stackY[cursor],
					Math.abs(.5*data[i%data.length]/256*size/2500000*canvas2d.width)*stackS[cursor],
					0,Math.PI*2);
				ctx.fill();
			}
		}
	}

	scaleFS.apply(canvas2d,[]);
	var highWarning = $("<span class='tip warning'>too-much-stuff-warning. Safety option. Reduce letters.</span>")
		.appendTo($("#interface>.head"))
		.hide()
		;
	var lowHelp = $("<span class='tip help'></span>")
		.appendTo($("#tabKeys"))
		.hide();

	
	return {
		init:init,
		clearScreen:clearScreen,
		setClearColor:setClearColor,
		setLineColor:setLineColor,
		useTimeDomain:useTimeDomain,
		redraw:triggerRedraw,
		setRule:setRule,
		setCenter:setCenter,
		moveCenter:moveCenter,
		setSize:setSize,
		setAngle:setAngle,
		setCompileTimeout:setCompileTimeout,
		setLoopTimeout:setLoopTimeout,
		setDrawTimeout:setDrawTimeout,
		setScaleFactor:setScaleFactor,
		launch:launch,
		stop:stop
	};
	function stop(){
		launched = false;
	}
	function launch(){
		launched = true;
		setRule(wait[0],wait[1]);
	}
	function setScaleFactor(up,down){
		scaleUP = up;
		scaleDOWN = down;
		return "Upscale factor set to "+up+",Downscale factor set to "+down;
	}
	function setCompileTimeout(val){
		params.compileTimeout = val;
		return "Compiler Timeout set to "+val+"ms";
	};
	function setLoopTimeout(val){
		params.maxLoopTime = val;
		return "Loop Timeout set to "+val+"ms";
	};
	function setDrawTimeout(val){
		params.maxDrawTime = val;
		return "Draw Timeout set to "+val+"ms";
	}
	function init(rule,iterations,size,angle){
		setRule(rule,iterations);
		setSize(size);
		setAngle(angle);
	};
	function audioStart(e){
		looping=true;
		loop();
	}
	function audioStop(e){
		looping=false;
	}
	function loop(){
		//console.log(drawTime);
		if(looping&&drawTime<params.maxLoopTime)
			requestAnimationFrame(loop);
		redraw();
	}
	function useTimeDomain(b){
		usingTimeDomain=b;
	}
	function triggerRedraw(){
		if(launched){
			requestAnimationFrame(redraw);
		}else{
			//console.count("blocked redraws")
		}

	}
	function redraw(){
		if(launched){
			drawTime = Date.now();
			AudioPlayer.analyse(usingTimeDomain);
			clearScreen();
			draw();
			drawTime = Date.now()-drawTime;
		}
	}
	function setRule(rule,iterations){
		if(launched){
			//console.count("compiles")
			compiler.postMessage([rule,iterations]);
			var timeout = setTimeout(timeoutHandler,params.startUpTimeout);
			params.startUpTimeout=params.compileTimeout;
			compiler.addEventListener("message",successHandler,false);
			audioStop();
			
		}else{
			//console.count("blocked compiles")
			wait = [rule,iterations];
		}
		function timeoutHandler(){
			compiler.terminate();
			compiler = new Worker("scripts/compiler.js");
			console.warn("compiler timed out");
			
			$(".tip").hide()
			highWarning.show();
		}
		function successHandler(e){
			compiler.removeEventListener("message",successHandler);
			if(e.data.length<300){
				lowHelp.show().text(e.data
					.join("")
					.split(	"q")
					.join(	"[")
					.split(	"p")
					.join(	"]")
					.split(	"d")
					.join(	"+")
					.split(	"b")
					.join(	"-")
					.split(	"u")
					.join(	"<")
					.split(	"n")
					.join(	">")
					.split(	"l")
					.join(	"i")
				);
			}else{
				lowHelp.show().text("Size: "+e.data.length);
			}

			highWarning.hide();
			clearTimeout(timeout);
			compiledCode=e.data;
			if(!AudioPlayer.element.paused){
				audioStart();
			};
			compiler.onmessage=null;
			clearScreen();
			triggerRedraw();

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
		//size=n*Math.pow(1.2,n);
		size=n;
		
	}
	function setAngle(n){
		angleL = n/360*Math.PI*2;
		angleR = -n/360*Math.PI*2;
	}
	function setClearColor(color){
		//clearColor = color.getAlpha();
		//clearColor = ["radial-gradient(ellipse,",color.brighten(5),",",color.darken(5),")"].join("");
		var x = canvas2d.width/2;
		var y = canvas2d.height/2;
		
		clearColor = ctx.createRadialGradient(x,y,0,x,y,2*x);
		clearColor.addColorStop(0,color);
		clearColor.addColorStop(1,color.darken(20));
		
		//clearColor = color;
		triggerRedraw();
		//console.log(color,c);
		//canvas2d.style.background = c;
	};
	function setLineColor(color){
		lineColor = color;
	}
	function clearScreen(){
		//ctx.setTransform(1,0,0,1,0,0);
		ctx.fillStyle = clearColor;
		ctx.fillRect(0,0,canvas2d.width,canvas2d.height);
		//ctx.clearRect(0,0,canvas2d.width,canvas2d.height);
	}
	function scaleFS(){
		var dE = document.documentElement;
		if(this.width<dE.clientWidth||this.height<dE.clientHeight){
			this.width = dE.clientWidth;
			this.style.width = dE.clientWidth+"px";
			this.height = dE.clientHeight;
			this.style.height = dE.clientHeight+"px";
			triggerRedraw();
		}
	}
	function debugTimerStart(){
		return Date.now();
	}
	function debugTimerEnd(n){
		return Date.now()-n;
	}
	function draw(audioData){
		//stackX.length=1;
		//console.count("redraws")

		stackX[0]=startPos[0];
		stackY[0]=startPos[1];
		stackA[0]=startAngle;
		stackS[0]=1;
		cursor=0;

		
		ctx.lineWidth = size/10000;
		ctx.fillStyle = lineColor;
		ctx.strokeStyle = lineColor;
		ctx.lineCap = "round";
		if(usingTimeDomain){
			
			for(var i = 0; i<compiledCode.length; i++){
				turtle[compiledCode[i]](i,AudioPlayer.timeDomainData);
			}
		}else{
			
			for(var i = 0; i<compiledCode.length; i++){
				turtle[compiledCode[i]](i,AudioPlayer.frequencyData);
			}
		}

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