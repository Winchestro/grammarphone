define(["jquery","audioplayer"],function LSystem($,AudioPlayer){
	var canvas2d = document.getElementById("canvas2d");
	var canvas3d = document.createElement("canvas")
		canvas3d.id="canvas3d";
	window.addEventListener("resize",scaleFSQuality.bind(canvas3d),false);
	scaleFSQuality.call(canvas3d);
	var gls;
	var gl = canvas3d.getContext("webgl");
	window.gl = gl;
	if(gl){
		
		gls = new GLSystem();
		
		window.g = gls;
	}

	//window.addEventListener("resize",scaleFS.bind(canvas2d),false);
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
	var size,angleL,angleR,audioData,clearColor,lineColor,fruithue,drawTime,sequence,looping,usingTimeDomain,compiledCode =[];
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
			stackX[cursor]+=x
				*Math.sin
				(stackA[cursor])
				*stackS[cursor];
			stackY[cursor]+=(x
				*Math.cos
				(stackA[cursor])
				*stackS[cursor]);
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
				ctx.fillStyle=["hsl(",data[i%data.length]+fruithue-128,",100%,50%)"].join("");
				ctx.arc(
					stackX[cursor],
					stackY[cursor],
					Math.abs(Math.sin(i/100)*data[i%data.length]/256*size/2500000*canvas2d.width)*stackS[cursor],
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
		stop:stop,
		load:gls&&gls.load
	};


	function GLSystem(){
		var mouseX=0,mouseY=0,tex0,frames=0;
		var program,VScache={},FScache={};

		gl.viewport(0,0,document.documentElement.clientWidth,document.documentElement.clientHeight)
		
		document.body.appendChild(canvas3d);
		
		//this.loadShaders = loadShaders;
		//this.loadFile = loadFile;

		
		loadup("default");

		

		document.addEventListener("mousemove",function(event){
			mouseX= event.clientX/window.innerWidth;
			mouseY= 1-event.clientY/window.innerHeight;
			
			if(program&&program.mouseUniform!=null){
				render();
			}
			
		}, false);

		this.bufferAudio = updateSoundTexture;
		this.render = render;
		this.load = loadup;
		window.load=loadup;

		function loadup(FS,VS,nocache){
			FS = FS || "default";
			if(nocache){
				FScache ={};
				VScache ={};
			}
			loadShaders(FS,VS).then(function(shader){
				//console.log(shader);
				bufferFSQ();
				compileProgram(shader);
				tex0=bufferSoundTexture(AudioPlayer.timeDomainData);
				render();

			});
		}
		function render(){
			//updateAudioAnalyser();
			frames++;
			updateUniforms();
			//console.count("render");
			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}
		function updateUniforms(){
			var w = document.documentElement.clientWidth/2;
			var h = document.documentElement.clientHeight/2;



			gl.uniform2f(program.mouseUniform, mouseX, mouseY);
			if(w>h){
				gl.uniform2f(program.resolutionUniform, w,h);
			}else{
				gl.uniform2f(program.resolutionUniform, h, w);
			}
			gl.uniform1f(program.timeUniform, frames);
			gl.uniform2fv(program.positionUniform,startPos);
			gl.uniform1f(program.scaleUniform,size);

			gl.uniform4f(program.foregroundUniform,lineColor._r/256,lineColor._g/256,lineColor._b/256,lineColor._a);
			gl.uniform4f(program.backgroundUniform,clearColor._r/256,clearColor._g/256,clearColor._b/256,clearColor._a);
			//console.dir(lineColor,clearColor)
			//window.l = lineColor;
			if(typeof tex0 !== "undefined"){
				gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, tex0);
				gl.uniform1i(program.tex0Uniform, 0);
			}		
		}
		function updateSoundTexture(buffer){
			gl.bindTexture(gl.TEXTURE_2D, tex0);
			gl.texImage2D(gl.TEXTURE_2D,
				0, 
				gl.RGBA, 
				16,
				16, 
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE, 
				buffer
			);
		}
		function bufferSoundTexture(buffer){
			var TempTex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, TempTex);
			gl.texImage2D(gl.TEXTURE_2D,
				0, 
				gl.RGBA, 
				16,
				16, 
				0,
				gl.RGBA,
				gl.UNSIGNED_BYTE, 
				buffer);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.bindTexture(gl.TEXTURE_2D, null);
			return TempTex;
		}
		function setupLocations(){
			program.positionLocation = gl.getAttribLocation(program, "pos");
			gl.enableVertexAttribArray(program.positionLocation);
			gl.vertexAttribPointer(program.positionLocation, 2, gl.FLOAT, false, 0, 0);
		}
		function setupUniforms(){
			program.mouseUniform	 	= gl.getUniformLocation(program, "mouse");
			program.resolutionUniform 	= gl.getUniformLocation(program, "resolution");
			program.timeUniform			= gl.getUniformLocation(program, "time");
			program.scaleUniform		= gl.getUniformLocation(program, "scale");
			program.positionUniform		= gl.getUniformLocation(program, "position");

			program.foregroundUniform 	= gl.getUniformLocation(program, "fgColor");
			program.backgroundUniform 	= gl.getUniformLocation(program, "bgColor");
			
			program.tex0Uniform 		= gl.getUniformLocation(program, "tex0");
		}

		function use(){
			gl.useProgram(program);
		}
		function compileProgram(shader){
			program = gl.createProgram()
			var FS=processShader(shader.fs,gl.FRAGMENT_SHADER);
			var VS=processShader(shader.vs,gl.VERTEX_SHADER);
			if(FS&&VS){
				gl.attachShader(program, FS);
				gl.attachShader(program, VS);
				gl.deleteShader(FS);
				gl.deleteShader(VS);
				gl.linkProgram(program);
				gl.useProgram(program);
				setupLocations();
				setupUniforms();
			}
		}
		function bufferFSQ(buffer){
			var buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([
			-1.0, -1.0, 
			 1.0, -1.0, 
			-1.0,  1.0, 
			-1.0,  1.0, 
			 1.0, -1.0, 
			 1.0,  1.0]), 
			gl.STATIC_DRAW);
		}
		function processShader(code,type){
			var shader = gl.createShader(type);
			gl.shaderSource(shader,code);
			gl.compileShader(shader);
			if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
				console.error(gl.getShaderInfoLog(shader));
				return null;
			}else{
				return shader;
			}
		}
		function loadShaders(FSname,VSname){
			var VS,FS;
			VSname = VSname || "default";
			return new Promise(function(cb,err){
				Promise.all([
					FSname in FScache?
						FS = FScache[FSname]:					
					loadFile("scripts/shader/"+FSname+".frag").then(function(response){
						FS = response;
						FScache[FSname]=FS;
					}),
					VSname in VScache?
						VS = VScache[VSname]:
					loadFile("scripts/shader/"+VSname+".vert").then(function(response){
						VS = response;
						VScache[VSname]=VS;
					})
				]).then(function(){
					cb({fs:FS,vs:VS});
				})
			})
		}
		function loadFile(path){
			return new Promise(function(cb,err){
				var xhr = new XMLHttpRequest();
				xhr.open("GET",path);
				xhr.onreadystatechange=function(){
					if(xhr.readyState===xhr.DONE&&xhr.status===200){
						cb(xhr.response);
					};
				}
				xhr.onerror=function(e){
					err(e);
				}
				xhr.send();
			})
		}
		function clearScreen(){
			gl.clearColor(0,0,0,1);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
	}

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
					.join(	"-")
					.split(	"b")
					.join(	"+")
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
		if(gl){
			clearColor = color;
		}else{
			clearColor = ctx.createRadialGradient(x,y,0,x,y,2*x);
			clearColor.addColorStop(0,color);
			clearColor.addColorStop(1,color.darken(20));
		}
		
		triggerRedraw();
		//console.log(color,c);
		//canvas2d.style.background = c;
	};
	function setLineColor(color){
		lineColor = color;
		fruithue = color.toHsl().h;
		//console.dir(color);
		//window.c = color;
	}
	function clearScreen(){
		//ctx.setTransform(1,0,0,1,0,0);
		if(gl){
			ctx.clearRect(0,0,canvas2d.width,canvas2d.height);
		}else{
			ctx.fillStyle = clearColor;
			ctx.fillRect(0,0,canvas2d.width,canvas2d.height);
		}
		
		
	}
	function scaleFS(){
		var dE = document.documentElement;
		
			this.width = dE.clientWidth;
			this.style.width = dE.clientWidth+"px";
			this.height = dE.clientHeight;
			this.style.height = dE.clientHeight+"px";
			triggerRedraw();
		
	}
	function scaleFSQuality(){
		var quality = 2;
		var dE = document.documentElement;
		
			this.width = dE.clientWidth/quality;
			this.style.width = dE.clientWidth+"px";
			this.height = dE.clientHeight/quality;
			this.style.height = dE.clientHeight+"px";
			//triggerRedraw();
		
		scaleFS.call(canvas2d)
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
			if(gls){
				gls.bufferAudio(AudioPlayer.timeDomainData);
				gls.render();
			}
		}else{
			
			for(var i = 0; i<compiledCode.length; i++){
				turtle[compiledCode[i]](i,AudioPlayer.frequencyData);
			}
			if(gls){
				gls.bufferAudio(AudioPlayer.frequencyData);
				gls.render();
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