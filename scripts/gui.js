define(["jquery","lsystem","d3","audioplayer","spectrum","jquery-ui"],function($,LSystem,d3,audio){
	$(document).tooltip();
	var gui = {

		Tab:(function(o){
			//$(".menuhead").tabs();
			return o;
		})({
			Options:(function(o){
				$(o.trigger)
				.on("click",toggleHandler.call(o.trigger,o.tab))
				;
				return o;
			})({
				trigger:btnOptions,
				tab:tabOptions
			}),
			Music:(function(o){
				$(o.trigger)
				.on("click",toggleHandler.call(o.trigger,o.tab))
				;
				return o;
			})({
				trigger:btnMusic,
				tab:tabMusic
			}),
			Keys:(function(o){
				$(o.trigger)
				.on("click",toggleHandler.call(o.trigger,o.tab))
				;
				return o;
			})({
				trigger:btnKeys,
				tab:tabKeys
			}),
			Gallery:(function(o){
				$(o.trigger)
				.on("click",toggleHandler.call(o.trigger,o.tab))
				;
				return o;
			})({
				trigger:btnGallery,
				tab:tabGallery
			})
		}),
		LineColor:(function(o){
			o.input=$(plantColor).spectrum({
				preferredFormat: "rgb",
				showAlpha:true,
				containerClassName:"lineColor",
				clickoutFiresChange: true, 
				showButtons: false,
				move:function(c){$(this).trigger("change")}
			})
			.on("change",function(e){
				var c = this.get();
				LSystem.setLineColor(c);
				LSystem.redraw();
				updateHistory();
			}.bind(o))
			;
			return o;
		})({
			set:	setColor,
			get:	getColor
		}),
		ClearColor:(function(o){
			o.input=$(clearColor).spectrum({
				preferredFormat: "rgb",
				showAlpha:true,
				containerClassName:"clearColor",
				clickoutFiresChange: true,
				showButtons: false,
				move:function(c){$(this).trigger("change")}
			})
			.on("change",function(e){
				var c = this.get();
				LSystem.setClearColor(c);
				//LSystem.redraw();
				updateHistory();
			}.bind(o))
			;
			$(".clearColor").append(
				$(document.createElement("div"))
				.addClass("renderer container")
				.append($(document.createElement("div"))
					.addClass("renderer method none")
					.on("click",function(){
						LSystem.load();
					})
				)
				.append($(document.createElement("div"))
					.addClass("renderer method hell")
					.on("click",function(){
						LSystem.load("hell");
					})
				)
			);
			return o;
		})({
			set:	setColor,
			get:	getColor
		}),
		UseTimeDomain:(function(o){
			o.input=$(".analyser.clickable")
			.on("click",function(e){
				//console.log(this)
				//$(".analyser.container>.stateA").toggle();
				//$(".analyser.container>.stateB").toggle();
				//$(".analyser.container>.progress").toggle();
				this.toggle();
				LSystem.useTimeDomain(this.get());
				LSystem.redraw();
				updateHistory();
			}.bind(o))
			[0];
			o.set=setValue;
			return o;
			function setValue(bool){
				if(bool){
					$(".analyser.container>.stateA").hide();
					$(".analyser.container>.progress").hide();
					$(".analyser.container>.stateB").show();
				}else{
					$(".analyser.container>.stateA").show();
					$(".analyser.container>.progress").show();
					$(".analyser.container>.stateB").hide();
				}
				setBool.call(this,bool);
			}
		})({
			get:getBool,
			toggle:toggleBool
		}),
		Rule:(function(o){
			o.input = $(LSInput)
			.on("input",function(e){
				var rule = gui.Rule.get();
				var	iter = gui.Iterations.get();
				LSystem.setRule(rule,iter);
				LSystem.redraw();
				updateHistory();
			}.bind(o))
			[0];
			o.set=function(val){
				setAny.call(this,val);
				//var rule = gui.Rule.get();
				//var	iter = gui.Iterations.get();
				//LSystem.setRule(rule,iter);
				//updateHistory();
			}
			return o;
		})({
			set:setAny,
			get:getString
		}),
		Zoom:(function(o){
			d3.select(".zoom.container")
			.call(createProgress)
			.call(createProgressThumb)
			.call(createProgressRange)
			$(".zoom.container>.ring")
			.on("mousedown",function(e){
				var a = dragHandler.apply(this,[e,onMove.bind(o),onEnd.bind(o)]);
				var a2;
				$(".zoom.container>.symbol").hide();
				$(".zoom.container>.description").show();
				function onMove(a){
					//console.log(this);
					a2=a;
					$(".zoom.container>.description").text(a*100>>0);
					setVal.call(this,calcNumber(a));
				}
				function onEnd(){
					setVal.call(this,calcNumber(a2||a));
					$(".zoom.container>.symbol").show();
					$(".zoom.container>.description").hide();
					updateHistory();
				}
				function calcNumber(val){
					return ((val*100)>>0)%100
				}
			});
			o.input = $(".zoom.clickable")
			.on("click",function(e){
				panToOrigin();
			}.bind(o));
			[0];
			o.set=setVal;
			function setVal(val){
				setRange(".zoom",val/100);
				setNumber.call(this,val);
				//console.log(this.get())
				zoomTo(this.get());
				
				//LSystem.setCenter(vPos[0]-vPosOrigin[0] );

				LSystem.redraw();
				
			}
			
			return o;
		})({
			get:	getNumber,
			increment: increment,
			wrap:	wrap,
			update:	updateOutput
		}),
		FFT:(function(o){
			d3.select(".analyser.container")
			.call(createProgress)
			.call(createProgressThumb)
			.call(createProgressRange)
			o.input=$(".analyser.container>.ring")
			.on("mousedown",function(e){
				var a = dragHandler.apply(this,[e,onMove.bind(o),onEnd.bind(o)]);
				var a2;
				$(".analyser.container>.stateA").hide();
				$(".analyser.container>.description").show();
				function onMove(a){
					//console.log(this);
					a2=a;
					$(".analyser.container>.description").text([a*100>>0,"%"].join(""));
					setVal.call(this,a);
				}
				function onEnd(){
					setVal.call(this,a2||a);
					$(".analyser.container>.stateA").show();
					$(".analyser.container>.description").hide();
					updateHistory();
				}
				
			})
			[0];
			o.set=setVal;
			function setVal(val){
				setRange(".analyser",val);
				setNumber.call(this,val);
				//console.log(this.get())
				audio.setSmoothing(val);
				
			}
			return o;
		})({
			output:	LSSmoothAmount,
			get:	getNumber,
			increment: increment,
			wrap:	wrap,
			update:	updateOutput
		}),
		Angle:(function(o){
			d3.select(".angle.container")
			.call(createProgress)
			.call(createProgressThumb)
			.call(createProgressRange)
			$(".angle.container>.ring")
			.on("mousedown",function(e){
				var a = dragHandler.apply(this,[e,onMove.bind(o),onEnd.bind(o)]);
				var a2;
				$(".angle.container>.symbol").hide();
				$(".angle.container>.description").show();

				function onMove(a){
					//console.log(this);
					a2=a;
					$(".angle.container>.description").text([a*360>>0,"°"].join(""));
					setVal.call(this,calcNumber(a));
				}
				function onEnd(){
					setVal.call(this,calcNumber(a2||a));
					$(".angle.container>.symbol").show();
					$(".angle.container>.description").hide();
					updateHistory();
				}
				function calcNumber(val){
					return ((val*360))%360;
				}
			});
			o.input = $(".angle.clickable")
			.on("click",function(e){
				setVal.call(this,this.get()>>0);
				updateHistory();

			}.bind(o))[0];
			o.set=setVal;
			function setVal(val){
				setRange(".angle",val/360);
				setNumber.call(this,val);
				//console.log(this.get())
				LSystem.setAngle(this.get())
				LSystem.redraw();
				
			}
			document.addEventListener("keydown",function(e){
				if(e.target===gui.Rule.input){
					return false;
				}
				switch(e.keyCode){
					case 39:
						changeAngle(e,1);
					break;
					case 37:
						changeAngle(e,-1);
					break;
				}
			}.bind(o),false);
			document.addEventListener("keyup",function(e){
				//console.log(e.keyCode)
				switch(e.keyCode){
					case 39:
						//LSystem.redraw();
						updateHistory();
					break;
					case 37:
						//LSystem.redraw();
						updateHistory();
					break;
				}
			})
			return o;
			function changeAngle(e,n){
				if(e.shiftKey){
					gui.Angle.set(Math.abs((gui.Angle.get()+n/abs())%360))
				}else{
					gui.Angle.set(Math.abs(((gui.Angle.get()+n)<<0)%360));
				}
				LSystem.setAngle(abs());
				
				$(gui.Angle.input).trigger("change");
				//updateHistory();
				function abs(){
					return gui.Angle.get()/Math.abs(n);
				}
			}
		})({
			output:	LSAngleOut,
			set:	setNumber,
			get:	getNumber,
			increment: increment,
			wrap:	wrap,
			update:	updateOutput
		}),
		Iterations:(function(o){
			o.input=$(LSIter)
			.on("change",function(e){
				var rule = gui.Rule.get();
				var iter = gui.Iterations.get();
				this.update();
				LSystem.setRule(rule,iter);
				LSystem.redraw();
				updateHistory();
			}.bind(o))
			[0];
			o.set = function(val){
				setNumber.call(this,val);
				//var rule = gui.Rule.get();
				//var	iter = gui.Iterations.get();
				//LSystem.setRule(rule,iter);
			}
			document.addEventListener("keydown",function(e){
				switch(e.keyCode){
					case 40:
						this.increment(-1).update();
						LSystem.setRule(gui.Rule.get(),this.get());
						LSystem.redraw();
						gui.updateHistory();
						e.preventDefault();
					break;
					
					case 38:
						this.increment(1).update();
						LSystem.setRule(gui.Rule.get(),this.get());
						LSystem.redraw();
						gui.updateHistory();
						e.preventDefault();
					break;
					
				}
			}.bind(o),false);
			return o;
		})({
			output:	LSIterOut,
			set:	setNumber,
			get:	getNumber,
			increment: increment,
			wrap:	wrap,
			update:	updateOutput
		}),
		TogglePlaylist:(function(o){
			$(".files.clickable").on("click",function(e){
				if($(".playlist.container")[0].children.length){
					$(".files.stateA").toggle()
					$(".files.stateB").toggle()
					$(".playlist.container").toggleClass("expanded");
				}else{
					$(filePicker).click();
					$(".files.stateA").toggle()
					$(".files.stateB").toggle()
					$(".playlist.container").toggleClass("expanded");
				}
			});
		})(),
		PlayButton:(function(o){
			d3.select(".play.container")
			.call(createProgress)
			.call(createProgressThumb)
			.call(createProgressRange)
			;
			$(".play.container>.ring").on("mousedown", function(e){
				if(!audio.element.src) {
					return false
				}
				var a = dragHandler.apply(this,[e,onMove,onEnd]);
				var t = a*audio.element.duration||0;
				var needRestart;
				if(!audio.element.paused){
					needRestart=true;
				}
				audio.element.pause();
				$(audio).trigger("pause");
				function onMove(a){
					t = a*audio.element.duration||0;
					audio.element.currentTime = t;
				}
				function onEnd(){
					audio.element.currentTime = t;
					if(needRestart){
						audio.element.play();
						$(audio).trigger("play");
					}
				}
			});
			o.input = $(".play.clickable")
			.on("click",function(e){
				if(audio.element.src){
					$(audio.element).trigger("toggle");
				}else if($(".playlist.container")[0].children.length){
					$($(".playlist.container")[0].children[0].children[0]).click();
				}

			})
			[0];
			return o;
		})({
		}),
		updateHistory:updateHistory
	}
	var vPosOrigin = [canvas2d.width/2,canvas2d.height*.75];
	var vPos = vPosOrigin.slice();
	var zoomPrev = 0;
	$(canvas2d)
	.on("wheel",function(e){
		var e = e.originalEvent;
		gui.Zoom.set(
			gui.Zoom.get()-1*e.deltaY/Math.abs(e.deltaY)
		);
		
		//zoomTo(gui.Zoom.get());
		updateHistory();
		//LSystem.redraw();
	});

	$(audio.element).on("timeupdate",function(e){
		//window.t=(this.currentTime);
		$(".play.container>.description").text(convertTimeString(this.currentTime));
		//console.log(progress)
		if(this.currentTime&&this.duration){
			setRange(".play",this.currentTime/this.duration);
		}
	});
	$(canvas2d).on("click",function(e){
		//console.log(e.which);
		if(e.which===2){
			panToOrigin();
		}
	});
	canvas2d.addEventListener("mousedown",panHandler);
	canvas2d.addEventListener("touchstart",touchHandler);
	function zoomTo(n){
		var rel = n-zoomPrev;
		zoomPrev = n;
		//var s = n*Math.pow(1.2,n);
		var s = 1<<n;
		var x1 = vPos[0];
		var x2 = canvas2d.width/2;
		var y1 = vPos[1];
		var y2 = canvas2d.height/2;
		var y3 = vPosOrigin[1];
		var dx = x1-x2;
		var dy = y1-y2;
		if(rel===1){
			vPos[0]=(x1<<1)-x2;
			vPos[1]=(y1<<1)-y2;	
		}else{
			vPos[0]=(x1+x2)>>1;
			vPos[1]=(y1+y2)>>1;	
		}
		LSystem.setSize(s);
		LSystem.setCenter(vPos[0],vPos[1]);
	};
	function panToOrigin(){
		LSystem.setCenter(window.innerWidth/2,window.innerHeight*.75);
		vPos[0]=canvas2d.width/2;
		vPos[1]=canvas2d.height*.75;
		LSystem.redraw();
	};
	function touchHandler(e){
		var touches = e.touches;

		//console.log(e);
		if(touches.length===1){
			var startPos = [e.touches[0].clientX,e.touches[0].clientY];
			canvas2d.addEventListener("touchmove",singleTouchmoveHandler);
			window.addEventListener("touchend",singleTouchEndHandler)

		}else if(touches.length===2){
			canvas2d.removeEventListener("touchmove",singleTouchmoveHandler);
			window.removeEventListener("touchend",singleTouchEndHandler);
			 

			//vPos[0]+=(e.changedTouches[0].clientX-startPos[0]);
			//vPos[1]+=(e.changedTouches[0].clientY-startPos[1]);
		}
		function singleTouchmoveHandler(e){
			LSystem.setCenter(e.touches[0].clientX-startPos[0]+vPos[0],e.touches[0].clientY-startPos[1]+vPos[1]);
			LSystem.redraw();
			e.preventDefault();
		}
		function singleTouchEndHandler(e){
			canvas2d.removeEventListener("touchmove",singleTouchmoveHandler);
			window.removeEventListener("touchend",singleTouchEndHandler);
			vPos[0]+=(e.changedTouches[0].clientX-startPos[0]);
			vPos[1]+=(e.changedTouches[0].clientY-startPos[1]);
			LSystem.redraw();
		}
	};
	function panHandler(e){
		if(e.which===1){
			var startPos = [e.clientX,e.clientY];
			//console.log(e);
			$(canvas2d).css("cursor","move");
			canvas2d.removeEventListener("mousedown",panHandler);
			canvas2d.addEventListener("mousemove",dragMoveHandler,false);
			window.addEventListener("mouseup",dragStopHandler,false);
			
			
		}
		function dragMoveHandler(e){
			
			//100 100 > 200,200   500 500 > 600 600
			
			LSystem.setCenter(e.clientX-startPos[0]+vPos[0],e.clientY-startPos[1]+vPos[1]);
			//console.log(e)
			LSystem.redraw();
		}
		function dragStopHandler(e){
			canvas2d.removeEventListener("mousemove",dragMoveHandler);
			window.removeEventListener("mouseup",dragStopHandler);
			canvas2d.addEventListener("mousedown",panHandler,false);
			$(canvas2d).css("cursor","pointer");
			vPos[0]+=(e.clientX-startPos[0]);
			vPos[1]+=(e.clientY-startPos[1]);
			LSystem.redraw();
		}
	};
	function convertTimeString(fTime){
		return [
			(fTime/60)>10?"":"0",
			Math.floor(fTime/60),
			":",
			(fTime%60)>10?"":"0",
			Math.floor(fTime%60)
		].join("");
	};
	function setRange(selector,val){
		d3.select(selector+".container>.progress.arc")
			.attr("d",
				d3.svg.arc()
				.innerRadius(256-64)
				.outerRadius(256)
				.startAngle(0)
				.endAngle(function(){
					return val*Math.PI*2;
				})
			)
			d3.select(selector+".container>.progress.thumb")
			.attr("transform",
				["translate(",
					(Math.cos(val*Math.PI*2-Math.PI/2)+1)*(256-32)+32,
					",",
					(Math.sin(val*Math.PI*2-Math.PI/2)+1)*(256-32)+32,
				")"].join("")
			)
	};
	function dragHandler(e,onMove,onEnd){
		//console.log($(this).offset().top-e.pageY);
		e.preventDefault();
		var clientRects = this.getClientRects();
		var origin = this;
		var w = this.parentElement.clientWidth;
		var h = this.parentElement.clientHeight;
		var offsetX = e.clientX-(e.offsetX);
		var offsetY = e.clientY-(e.offsetY);
		var x = e.offsetX;
		var y = e.offsetY;

		if(clientRects.length>0){
			var cr = clientRects[0];
			//console.dir(cr);
			w = cr.width;
			h = cr.height;
			x = e.pageX - cr.left;
			y = e.pageY - cr.top;
			offsetX = cr.left;
			offsetY = cr.top;

		}
		//console.log(x,y,w,h,offsetX,offsetY);
		//console.log(e.clientY-(e.offsetY));
		
		
		
		var a = calculateAngle(x,y,w,h);
		$(".canv.overlay").css("display","initial");
		$(this).css("transition","0ms");
		$(document).css("pointer-events","none");
		$(window)
		.on("mousemove",moveHandler)
		.on("mouseup",endHandler);
		return a;
		function moveHandler(e){
			x = e.pageX-offsetX;
			y = e.pageY-offsetY;
			a = calculateAngle(x,y,w,h);
			onMove(a);
			e.preventDefault();
			return false;
		}
		function endHandler(e){
			$(".canv.overlay").css("display","none");
			$(origin)
			//.css("transition","")
			//.css("pointer-events","initial");
			$(document).css("pointer-events","none");
			$(window)
			.off("mouseup")
			.off("mousemove");
			onEnd();
		}
		function calculateAngle(x,y,w,h){
			return (((Math.atan2(h/2-y,w/2-x)+Math.PI)/Math.PI/2)+.25)%1;
		}
	};
	function createProgressThumb(s){
		s.insert("path")
		.attr("class","progress thumb")
		.attr("transform", "translate(256,32)")
		.attr("d",
			d3.svg.arc()
			.innerRadius(0)
			.outerRadius(32)
			.startAngle(0)
			.endAngle(Math.PI*2)
		)
	};
	function createProgressRange(s){
		s.append("path")
		.attr("class","progress ring")
		.attr("transform", "translate(256,256)")
		.attr("d",
			d3.svg.arc()
			.innerRadius(256-64)
			.outerRadius(256)
			.startAngle(0)
			.endAngle(Math.PI*2)
		)
	};
	function createProgress(s){
		s.insert("path")
		.attr("class","progress arc")
		.attr("transform", "translate(256,256)")
		.attr("d",
			d3.svg.arc()
			.innerRadius(256-64)
			.outerRadius(256)
			.startAngle(0)
			.endAngle(0)
		)
	};
	function increment(val){
		this.input.value = (this.input.valueAsNumber||this.input.value) + val ;
		return this; 
	};
	function wrap(){
		var val = this.input.valueAsNumber;
		var min = Number(this.input.max);
		var max = Number(this.input.min);
		if(val === max)
			this.set(this.input.min);
		if(val === min)
			this.set(this.input.max);
		return this;
	};
	function updateOutput(val){
		if(typeof val === "undefined"){
			$(this.output).text(this.input.value);
		}else{
			$(this.output).text(val);
		}
	};
	function setNumber(val){
		if(typeof val === "number"){
			this.input.value = val
		}else if(typeof val === "string"){
			this.input.value = Number(val);
		}
		return this;
	};
	function setAny(val){
		this.input.value = val;
	};
	function setBool(val){
		if(val){
			this.checked = true;
			/*$(".analyser.container>.progress").hide();
			$(".analyser.stateA").hide();
			$(".analyser.stateB").show();
			$(this).trigger("change");
			*/
		}else{
			this.checked = false;
			/*
			$(".analyser.container>.progress").show();
			$(".analyser.stateA").show();
			$(".analyser.stateB").hide();
			$(this).trigger("change");
			*/
		}
		return this;
	};
	function toggleBool(){
		//console.dir(this);
		if(this.checked){
			this.set(false);
		}else{
			this.set(true);
		}
		return this;
	};
	function setColor(color){
		this.input.spectrum("set",color);
		this.input.trigger("change");
		return this;
	};
	function getNumber(){
		return this.input.valueAsNumber||Number(this.input.value);
	};
	function getString(){
		return this.input.value;
	};
	function getBool(){
		return this.checked;
	};
	function getColor(){
		return this.input.spectrum("get");
	};
	function toRGBA(s,a){
		var R = parseInt(s[1]+s[2],16);
		var G = parseInt(s[3]+s[4],16);
		var B = parseInt(s[5]+s[6],16);
		return "rgba("+R+","+G+","+B+","+a+")";
	};
	function toggleHandler(tab){
		//horrible code.... 
		this.toggled = false;
		this.toggle = toggle;
		var self = this;
		return toggle;
		function toggle(e){
			if(this.toggled){
				//$(tab).css("right","-100%")
				$(tab).hide();
				unpressed(this).toggled = false;
			}else{
				
				//$(tab).css("right","0px")
				$(tab).show();
				pressed(this).toggled = true;
				$("button.tab").each(function(i,e){
					if(e.toggled && e !== self){
						e.toggle();
					}
				});
			}

			function pressed(e){
				e.classList.add("pressed")
				return e;
			}
			function unpressed(e){
				e.classList.remove("pressed")
				return e;
			}
			
		}
	};
	function updateHistory(){
		if(window !== top){
			top.postMessage(generateQuery(),"http://www.winchestro.com");
		}else{
			if(history.length>1){
				history.replaceState({},"",location.pathname+generateQuery());
			}else{
				history.pushState({},"",location.pathname+generateQuery());
			}
		}
		function toHex(s,a){
			var alpha = ((parseFloat(a)*256)>>0)-1;
			alpha = s+alpha.toString(16);
			//console.log(alpha);
			return alpha;
		}
		function generateQuery(){
			return ("?r="+encodeURIComponent(btoa(gui.Rule.get()))
				+"&z="+gui.Zoom.get()
				+"&a="+gui.Angle.get()
				+"&t="+gui.UseTimeDomain.get()
				+"&s="+gui.FFT.get()
				+"&i="+gui.Iterations.get()
				+"&f="+encodeURIComponent(gui.ClearColor.get().toHex8String())
				+"&l="+encodeURIComponent(gui.LineColor.get().toHex8String())
			)
		}
	};
	return gui;
})