
(function demo(){
	var frameCount = 0;

	var looping;

	var query;

	var queryRule = "I=I[+IO]I[-IO][IO]";
	var queryZoom = 14;
	var queryAngle = 30;
	var queryTD		= true;
	var querySmooth = 0.8;
	var queryIter  = 4;
	var queryFade = "#0F4499FF";
	var queryPlant = "#FFFFFF88";
	
	/*
	 F f [] +- <> T t C = Left Right Backspace    √ ⇦ ␡ 
	
	*/
	function loadQuery(query){
		if(typeof query !== "string"){
			throw (typeof query + "wrong query type")
		}
		query = query.split(/=|&/g);

		//console.log(query);
		query[1]&&(queryRule=atob(decodeURIComponent(query[1])));
		query[3]&&(queryZoom=parseInt(query[3]));
		query[5]&&(queryAngle=parseInt(query[5]));
		query[7]&&(queryTD = JSON.parse(query[7]));
		query[9]&&(querySmooth = parseFloat(query[9]));
		query[11]&&(queryIter = parseInt(query[11]));
		query[13]&&(queryFade = decodeURIComponent(query[13]));
		query[15]&&(queryPlant = decodeURIComponent(query[15]));
		LSIter.value = queryIter;
		LSSize.value = queryZoom;
		LSInput.value = queryRule;
		LSAngle.value = queryAngle;
		LSAngleName.textContent = " "+parseInt(LSAngle.value)+"°";

		VisSmoothing.value = querySmooth;
		clearColor.value = queryFade.slice(0,7);
		clearAlpha.value = parseInt(queryFade.slice(7,9),16)/256;
		plantColor.value = queryPlant.slice(0,7);
		plantAlpha.value = parseInt(queryPlant.slice(7,9),16)/256;

		document.getElementById("LSzoomAmount").textContent=" "+parseInt(LSSize.value);
		document.getElementById("LSIterName").textContent=" "+parseInt(LSIter.value);
		document.getElementById("LSSmoothAmount").textContent=" "+parseFloat(VisSmoothing.value);

		if(queryTD){
			data = timeDomainData;
			VisTimeDomain.checked = "true";
		}else{
			data = frequencyData;
			VisFrequency.checked = "true";
		}
		system = LSystem("I",LSInput.value,parseInt(LSIter.value),1<<parseInt(LSSize.value),parseInt(LSAngle.value));
		redraw();
	}

	var canvas2d = document.getElementById("canvas2d");
	

	var track = document.getElementById("track");
		track.addEventListener("play",audioStart,false);
		track.addEventListener("pause",audioStop,false);
	var ctx = canvas2d.getContext("2d");
	var AudioContext = window.AudioContext||window.webkitAudioContext;
	var sfx = new  AudioContext;
	scaleFS.apply(canvas2d,[]);
	window.addEventListener("resize",scaleFS.bind(canvas2d),false);

	var media = sfx.createMediaElementSource(track);
	var analyser = sfx.createAnalyser();
		analyser.fftSize=2048;
		analyser.smoothingTimeConstant=querySmooth;

	var timeDomainData = new Uint8Array(analyser.frequencyBinCount);
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	
	
	var LSform = document.getElementById("LSform");

	var LSIter = document.getElementById("LSIter");
		LSIter.value = queryIter;
	var LSSize = document.getElementById("LSSize");
		LSSize.value = queryZoom;
	var LSInput = document.getElementById("LSInput");
		LSInput.value = queryRule;
		LSInput.onfocus = function(e){e.preventDefault()
			//e.target.setAttribute("readonly","true");
			//console.dir(e);

		}

	var LSAngle = document.getElementById("LSAngle");
		LSAngle.value = queryAngle;
	var LSAngleName = document.getElementById("LSAngleName");
		LSAngleName.textContent = " "+parseInt(LSAngle.value)+"°";
	var VisTimeDomain = document.getElementById("VisTimeDomain");
		VisTimeDomain.onchange=update;
	var VisFrequency = document.getElementById("VisFrequency");
		VisFrequency.onchange=update;
	var VisSmoothing = document.getElementById("VisSmoothing");
		VisSmoothing.value = querySmooth;
	var filePicker = document.getElementById("filePicker");
	var clearColor = document.getElementById("clearColor");
		clearColor.value = queryFade.slice(0,7);
	var clearAlpha = document.getElementById("clearAlpha");
		clearAlpha.value = parseInt(queryFade.slice(7,9),16)/256;
	var plantColor = document.getElementById("plantColor");
		plantColor.value = queryPlant.slice(0,7);
	var plantAlpha = document.getElementById("plantAlpha");
		plantAlpha.value = parseInt(queryPlant.slice(7,9),16)/256;

	var btnExolore	=	document.getElementById("btnExolore");
	var btnMusic	=	document.getElementById("btnMusic");
	var btnOptions	=	document.getElementById("btnOptions");
	var btnKeys		=	document.getElementById("btnKeys");

	btnOptions.addEventListener("click",toggleHandler(btnOptions,[btnMusic,btnKeys],"tabOptions"));
	btnMusic.addEventListener("click",toggleHandler(btnMusic,[btnOptions,btnKeys],"tabMusic"));
	btnKeys.addEventListener("click",toggleHandler(btnKeys,[btnOptions,btnMusic],"tabKeys"));
	function toggleHandler(self,others,selector){
		self.toggled = false;
		self.toggle = toggle;
		var options = document.getElementById(selector);
		return toggle;
		function toggle(e){
			if(self.toggled){
				hide(options);
				unstyle(self).toggled = false;
			}else{
				unstyle(options);
				pressed(self).toggled = true;
				others.forEach(function(e,i){
					if(e.toggled){
						e.toggle();
					}
				});
			}
			function hide(e){
				e.setAttribute("style","display:none;");
				return e;
			}
			function pressed(e){
				e.setAttribute("style","box-shadow:0em 0em .5em white;background:#AAA;");
				return e;
			}
			function unstyle(e){
				e.setAttribute("style","");
				return e;
			}
		}
	}
	var data; 
	if(queryTD){
		data = timeDomainData;
		VisTimeDomain.checked = "true";
	}else{
		data = frequencyData;
		VisFrequency.checked = "true";
	}
	var system = LSystem("I",queryRule,queryIter,queryZoom,queryAngle);
	window.addEventListener("wheel",function(e){	
		LSSize.value = parseInt(LSSize.value)+-1*e.deltaY/Math.abs(e.deltaY);
		document.getElementById("LSzoomAmount").textContent=parseInt(LSSize.value);
		system.setZoom(1<<parseInt(LSSize.value));
		updateHistory();
		redraw();

	},false);

	
	filePicker.addEventListener("change",loadFile,false);

	var startPos = [canvas2d.width/2,canvas2d.height*.75];
	LSform.oninput=update;
	LSform.onsubmit = function(e){e.preventDefault()}
	media.connect(analyser);
	analyser.connect(sfx.destination);
	canvas2d.addEventListener("contextmenu",function(e){
		e.preventDefault();
		system.setCenter(e.clientX,e.clientY);
		redraw();
	},false);
	//loop();
	redraw();
	if(window !== top){
		window.addEventListener("message",function(event){
			if(event.origin === "http://www.winchestro.com"){
				loadQuery(event.data);
			}
		});
		top.postMessage(null,"http://www.winchestro.com");
	}else{
		loadQuery(window.location.href);
	}
	function update(e){
		
		//console.dir(e);
		switch(e.target){
			case LSInput:
				system = LSystem("I",LSInput.value,parseInt(LSIter.value),1<<parseInt(LSSize.value),parseInt(LSAngle.value));
				redraw();
				break;
			case LSIter:
				document.getElementById("LSIterName").textContent=" "+parseFloat(LSIter.value);
				system = LSystem("I",LSInput.value,parseInt(LSIter.value),1<<parseInt(LSSize.value),parseInt(LSAngle.value));
				redraw();
				break;
			case VisTimeDomain:
				data = timeDomainData;
				redraw();
				break;
			case VisFrequency:
				data = frequencyData;
				redraw();
				break;
			case LSAngle:
				LSAngleName.textContent = " "+parseInt(LSAngle.value)+"°";
				system.setAngle(parseInt(LSAngle.value));
				redraw();
				break;
			case VisSmoothing:
				document.getElementById("LSSmoothAmount").textContent=" "+parseFloat(VisSmoothing.value);
				analyser.smoothingTimeConstant=parseFloat(VisSmoothing.value);
				break;
			case LSSize:
				document.getElementById("LSzoomAmount").textContent=" "+parseInt(LSSize.value);
				system.setZoom(1<<parseInt(LSSize.value));
				redraw();
				break;
			default:
				redraw();
				break;

		}
		updateHistory();
		/*
		if(VisTimeDomain.checked){
			
		}else{
			
		}
		*/
		//document.body.style.background = clearColor;
		
		//clearScreen(clearColor);
		
		//console.log(analyser.smoothingTimeConstant);
		
		
	}
	function toHex(s,a){
		var alpha = ((parseFloat(a)*256)>>0)-1;
		alpha = s+alpha.toString(16);
		//console.log(alpha);
		return alpha;
	}
	function toRGBA(s,a){
		var R = parseInt(s[1]+s[2],16);
		var G = parseInt(s[3]+s[4],16);
		var B = parseInt(s[5]+s[6],16);
		return "rgba("+R+","+G+","+B+","+a+")";
	}
	function convert(url){
		url.replace("rule","r");
		url.replace("zoom","z");
		url.replace("angle","a");
		url.replace("td","t");
		url.replace("smooth","s");
		url.replace("iter","i");
		url.replace("fade","f");
		url.replace("line","l");
		var rule = url.match(/(?=\?r).*(?=\&z)/)[0];
		rule.slice(rule.match(".*=")[0].length);
		rule=decodeURIComponent(rule);
		encodeURIComponent(atob(rule));
	}
	function updateHistory(){
		if(window !== top){
			top.postMessage(
				"?r="+encodeURIComponent(btoa(LSInput.value))
				+"&z="+LSSize.value
				+"&a="+LSAngle.value
				+"&t="+VisTimeDomain.checked
				+"&s="+VisSmoothing.value
				+"&i="+LSIter.value
				+"&f="+encodeURIComponent(toHex(clearColor.value,clearAlpha.value))
				+"&l="+encodeURIComponent(toHex(plantColor.value,plantAlpha.value)),"http://www.winchestro.com");
		}else{
			if(history.length>1){
				history.replaceState({},"",location.pathname+
					"?r="+encodeURIComponent(btoa(LSInput.value))+
					"&z="+LSSize.value+
					"&a="+LSAngle.value+
					"&t="+VisTimeDomain.checked+
					"&s="+VisSmoothing.value+
					"&i="+LSIter.value+
					"&f="+encodeURIComponent(toHex(clearColor.value,clearAlpha.value))+
					"&l="+encodeURIComponent(toHex(plantColor.value,plantAlpha.value)));
			}else{
				history.pushState({},"",location.pathname+
					"?r="+encodeURIComponent(btoa(LSInput.value))+
					"&z="+LSSize.value+
					"&a="+LSAngle.value+
					"&t="+VisTimeDomain.checked+
					"&s="+VisSmoothing.value+
					"&i="+LSIter.value+
					"&f="+encodeURIComponent(toHex(clearColor.value,clearAlpha.value))+
					"&l="+encodeURIComponent(toHex(plantColor.value,plantAlpha.value)));
			}
		}
		
		
	}
	function loadFile(){
		if(filePicker.files.length>0){
			var audio = document.createElement("audio");
				audio.id="track";
				audio.setAttribute("controls","true");
				audio.setAttribute("loop","true");
				audio.setAttribute("autoplay","true");
			var source = audio.appendChild(document.createElement("source"));
				audio.addEventListener("play",audioStart,false);
				audio.addEventListener("pause",audioStop,false);
			track.remove();
			document.querySelector("div#audioSettings").appendChild(audio);
			track = audio;

			//console.log(filePicker.files[0])
			//console.log(URL.createObjectURL(filePicker.files[0]))
			source.src = URL.createObjectURL(filePicker.files[0]);
			source.type = filePicker.files[0].type;
			//console.log(track.querySelector("source"))
			media = sfx.createMediaElementSource(track);
			media.connect(analyser);
			
		}
	}
	
	
	

	function audioStart(e){
		looping=true;
		loop();
	}
	function audioStop(e){
		looping=false;
	}
	function loop(){
		looping&&requestAnimationFrame(loop);
		redraw();
	}

	function redraw(){
		analyser.getByteTimeDomainData(timeDomainData);
		analyser.getByteFrequencyData(frequencyData);
		clearScreen(toRGBA(clearColor.value,clearAlpha.value));
		system.draw(data);
		frameCount++;
	}
	function clearScreen(color){
		ctx.setTransform(1,0,0,1,0,0);
		ctx.fillStyle = color||clearColor.value;
		ctx.fillRect(0,0,canvas2d.width,canvas2d.height);
	}
	
	
	function LSystem(axiom,rule,iterations,FL,angle){
		var stack = [];
		
		var startAngle= Math.PI*1.5;
		var FL = FL||10;
		var angleL = angle/360*Math.PI*2;
		var angleR = -angle/360*Math.PI*2;
		var scaleUP = .75;
		var scaleDOWN = .75;
		var currentScale = 1.;
		/* 
			F = line forward (length)
			+ = rotate left (angle)
			- = rotate right (angle)
			[ = push State
			] = pop State

			x > y = rewrite Rule, each iteration x is replaced by y
		*/
		var sequence = axiom;
		var r = rule.split(" ");
		r.forEach(function(e,i){

			var rA = e.split("=")[0];
			var rB = e.split("=")[1];
			r[i] = [rA,rB];
			
		});
		rewrite(iterations)
		return {draw:draw,setZoom:setZoom,setAngle:setAngle,setCenter:setCenter};
		function setCenter(x,y){
			startPos[0]=x;
			startPos[1]=y;
		}
		function setZoom(n){
			FL=n;
		}
		function setAngle(n){
			angleL = n/360*Math.PI*2;
			angleR = -n/360*Math.PI*2;
		}
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
				return translate(sequence);
			}
		}
		function translate(s){
			for(var i = 0; i<s.length; i++){

			}
		}
		function draw(data){
			//clear(clearColor);
			ctx.setTransform(1,0,0,1,0,0);
			ctx.translate(startPos[0],startPos[1]);
			ctx.rotate(startAngle);
			ctx.lineWidth = 1;
			ctx.lineCap = "round";
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
					case ">":scaleUp();break;
					case "<":scaleDown();break;
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
				ctx.scale(1*scaleUP,1*scaleUP);
			}
			function scaleDown(){
				ctx.scale(1/scaleDOWN,1/scaleDOWN);
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
				ctx.moveTo((data[(i)%data.length]/256*FL/2000)+FL/2000,0);
				ctx.translate((data[(i)%data.length]/256*FL/2000)+FL/2000,0);
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
					//ctx.lineWidth = (data[(i+v)%data.length]/64+1)*FL/20;
					ctx.lineWidth = FL/10000;
					if(m){
						ctx.moveTo((data[(i+v)%data.length]/256*FL/2000)+FL/2000,0);
						ctx.lineTo(0,0);
						ctx.translate((data[(i+v)%data.length]/256*FL/2000)+FL/2000,0);
					}else{
						ctx.moveTo(FL/2000,0);
						ctx.lineTo(0,0);
						ctx.translate(FL/2000,0);
					}
				
				}
				ctx.stroke();
			}
			function Fruit(){
				ctx.beginPath()
				ctx.fillStyle="hsl("+(data[i%data.length]*1.75)+",100%,50%)";
				ctx.arc(0,0,Math.abs(.385*data[i%data.length]/256*FL/2000),0,Math.PI*2);
				ctx.fill();
			}
			//ctx.restore();
			//return sequence;
		}
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
})();