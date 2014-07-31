
define(["lsystem","url","jquery","audioplayer"],function demo(LSystem,query,$,AudioPlayer){
	"use strict";
	window.q=$;

	var $LSIter = $("#LSIter"), 
		$LSSize = $("#LSSize"), 
		$LSInput = $("#LSInput"),
		$LSAngle = $("#LSAngle"),
		$VisSmoothing = $("#VisSmoothing"),
		$VisTimeDomain = $("#VisTimeDomain"),
		$clearColor = $("#clearColor"),
		$plantColor = $("#plantColor"),
		$clearAlpha = $("#clearAlpha"),
		$plantAlpha = $("#plantAlpha"),
		$LSAngleName = $("#LSAngleName"),
		$LSzoomAmount = $("#LSzoomAmount"),
		$LSIterName = $("#LSIterName"),
		$LSSmoothAmount = $("#LSSmoothAmount");
		

	var looping;
	var data;
	var twitterLoaded = false;

	query("http://www.winchestro.com",[
		["rule",	"I=S S=i>[+SO][-SO]",	function(s){return atob(decodeURIComponent(s))}],
		["zoom",	47,						function(s){return parseInt(s)}],
		["angle",	30,						function(s){return parseInt(s)}],
		["td",		false,					function(s){return JSON.parse(s)}],
		["smooth",	0.8,					function(s){return parseFloat(s)}],
		["iter",	9,						function(s){return parseInt(s)}],
		["fade",	"#08103bDD",			function(s){return decodeURIComponent(s)}],
		["plant",	"#00000088",			function(s){return decodeURIComponent(s)}]
	],function(){
		
		window.w=query;
		updateInterface();

		if(query.td){
			data = AudioPlayer.timeDomainData;
			VisTimeDomain.checked=true;
		}else{
			data = AudioPlayer.frequencyData;
			VisFrequency.checked=true;

		}
		LSystem.init(
			query.rule,
			query.iter,
			query.zoom,
			query.angle
		);
		LSystem.setClearColor(clearColor.value,clearAlpha.value);
		redraw();
	});
	function updateInterface(){
		$LSIter.val(query.iter);
		$LSSize.val(query.zoom);
		$LSInput.val(query.rule);
		$LSAngle.val(query.angle);
		$VisSmoothing.val(query.smooth);

		$clearColor.val(query.fade.slice(0,7));
		$plantColor.val(query.plant.slice(0,7));
		$clearAlpha.val(parseInt(query.fade.slice(7,9),16)/256);
		$plantAlpha.val(parseInt(query.plant.slice(7,9),16)/256);
		
		$LSAngleName.text(query.angle+"°");
		$LSzoomAmount.text(parseInt($LSSize.val()));
		$LSIterName.text(parseInt($LSIter.val()));
		$LSSmoothAmount.text(" "+parseFloat($VisSmoothing.val()));
		
		
	}
	
	//LSystem.setClearColor(clearColor.value,clearAlpha.value);
	//LSystem.init(query.rule,query.iter,query.zoom,query.angle);
	
	
	$(canvas2d)
	.on("wheel",function(e){
		var e = e.originalEvent;
		$LSSize.val(parseInt($LSSize.val())+-1*e.deltaY/Math.abs(e.deltaY));
		$LSzoomAmount.text(parseInt($LSSize.val()));
		LSystem.setSize(parseInt($LSSize.val()));
		updateHistory();
		redraw();
	})
	.click(function(e){
		//console.log(e.which);
		if(e.which===2){
			LSystem.setCenter(window.innerWidth/2,window.innerHeight*.75);
			vPos[0]=canvas2d.width/2;
			vPos[1]=canvas2d.height*.75;
			redraw();
		}

	});
/*
	.on("contextmenu",function(e){
		e.originalEvent.preventDefault();
		LSystem.setCenter((window.innerWidth/2-e.clientX)/2,(window.innerHeight/2-e.clientY)/2);
		redraw();
		
	});
*/	
	document.getElementById("canvas2d").addEventListener("mousedown",dragHandler);
	
	var vPos = [canvas2d.width/2,canvas2d.height*.75];
	function dragHandler(e){
		var startPos = [e.x,e.y];
		//console.log(e);
		$(canvas2d).css("cursor","move");
		canvas2d.removeEventListener("mousedown",dragHandler)
		canvas2d.addEventListener("mousemove",dragMoveHandler);
		window.addEventListener("mouseup",dragStopHandler);

		function dragMoveHandler(e){
			
			//100 100 > 200,200   500 500 > 600 600
			
			LSystem.setCenter(e.x-startPos[0]+vPos[0],e.y-startPos[1]+vPos[1]);
			
			redraw();
		}
		function dragStopHandler(e){
			canvas2d.removeEventListener("mousemove",dragMoveHandler);
			window.removeEventListener("mouseup",dragStopHandler);
			canvas2d.addEventListener("mousedown",dragHandler);
			$(canvas2d).css("cursor","pointer");
			vPos[0]+=(e.x-startPos[0]);
			vPos[1]+=(e.y-startPos[1]);

		}
	};
	

	//$("#LSInput").on("focus",function(e){e.preventDefault()});
	
	$("#LSform")
	.on("submit",function(e){e.preventDefault()})
	.on("input",update)
	;
	
	
	$("#VisTimeDomain").on("change",update);
	$("#VisFrequency").on("change",update);
	$("#btnOptions").on("click",toggleHandler.call(btnOptions,tabOptions));
	$("#btnMusic").on("click",toggleHandler.call(btnMusic,tabMusic));
	$("#btnKeys").on("click",toggleHandler.call(btnKeys,tabKeys));
	$("#btnGallery")
	.on("click",toggleHandler.call(btnGallery,tabGallery))
	.on("click",function(e){
		if(!twitterLoaded){
			var loading = loadingCircle();
	
			tabGallery.appendChild(loading);
			/*load twitter on demand, moved out for debug*/
			var twttr = window.twttr = (function (d, s, id) {
	  			var t, js, fjs = d.getElementsByTagName(s)[0];
	  			if (d.getElementById(id)) return;
	  			js = d.createElement(s); js.id = id; js.src= "http://platform.twitter.com/widgets.js";
	  			fjs.parentNode.insertBefore(js, fjs);
	  			return window.twttr || (t = { _e: [], ready: function (f) { t._e.push(f) } });
			}(document, "script", "twitter-wjs"));
			twttr.ready(function(twttr){
				/*<a class="twitter-timeline" href="https://twitter.com/Grammarphone/timelines/494782493229588482" data-widget-id="494782771546439680">Editor's Choice</a>*/
				
				var editorsChoice = $(document.createElement("a"))
				.hide()
				.appendTo(tabGallery)
				.attr("class","twitter-timeline")
				//.attr("href","https://twitter.com/Grammarphone/timelines/494782493229588482")
				//.attr("data-widget-id","494782771546439680")
				//.text("Editor's Choice")
				;
				//console.log(twttr);
				twttr.widgets.createTimeline(
					"494782771546439680",
					editorsChoice[0],
					{
						width: 100,
		    			height: 400,
						chrome:"noheader nofooter noborders transparent noscrollbar",
						listId:"494782493229588482",
						listSlug:"Grammarphone"
					}
				).then(function(e){
					//console.log(e);
					$(e)
					
					;
					loading.running = false;
					loading.remove();
					editorsChoice.show()
				})
			})
			twitterLoaded = true;
		}
	})
	;
	
	function toggleHandler(tab){
		this.toggled = false;
		this.toggle = toggle;
		var self = this;
		return toggle;
		function toggle(e){
			if(this.toggled){
				$(tab).hide();
				unpressed(this).toggled = false;
			}else{
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
	}
	function loadingCircle(){
		var canvas = document.createElement("canvas");
	    canvas.width = 200;
	    canvas.height = 200;
	    canvas.style.background = "transparent";
	    canvas.running = true;
	    
	    
	    
		
		var ctx = canvas.getContext("2d");
		    ctx.strokeStyle = "#444";
		    ctx.lineWidth = .0;
		
		var frame = 0;
		var randomness = 25;
		var center = {x:canvas.width/2,y:canvas.height/2};
		var dot = {
		    averageSize:16,
		    variation:5,
		    amount:9,
		    radius:canvas.width/4
		}
		var TWOPI = Math.PI*2;
		var animation = {end:1000,speed:28,percent:0};
		draw();
		return canvas;
		function draw(){
			if(canvas.running) requestAnimationFrame(draw)
		    animation.percent = frame/animation.end*animation.speed;
		    ctx.fillStyle = "hsl("+frame+",50%,50%)";
		    ctx.beginPath();
		    ctx.arc(
		        center.x+dot.radius*Math.sin(animation.percent*TWOPI),
		        center.y+dot.radius*Math.cos(animation.percent*TWOPI),
		        dot.averageSize+dot.variation*Math.sin(animation.percent*TWOPI*dot.amount),
		        0,
		        TWOPI);

		    ctx.moveTo(
		        center.x+Math.random()*randomness-randomness/2,
		        center.y+Math.random()*randomness-randomness/2);
		    ctx.lineTo(
		        center.x+dot.radius*.65*Math.sin(animation.percent*TWOPI),
		        center.y+dot.radius*.65*Math.cos(animation.percent*TWOPI)
		    )
		    
		    ctx.fill();
		    //ctx.stroke();
		    frame++;
		}
	}

	function update(e){
		e=e.originalEvent;
		//console.dir(e);
		switch(e.target){
			case LSInput:
				LSystem.setRule(
					$LSInput.val(),
					parseInt($LSIter.val()));
				redraw();
				break;
			case LSIter:
				$LSIterName.text(parseFloat($LSIter.val()));
				LSystem.setRule($LSInput.val(),parseInt($LSIter.val()));
				redraw();
				break;
			case clearColor:
			case clearAlpha: 
				LSystem.setClearColor($clearColor.val(),$clearAlpha.val());
				break;
			case VisTimeDomain:
				data = AudioPlayer.timeDomainData;
				redraw();
				break;
			case VisFrequency:
				data = AudioPlayer.frequencyData;
				redraw();
				break;
			case LSAngle:
				$LSAngleName.text(parseInt($LSAngle.val())+"°");
				LSystem.setAngle(parseInt($LSAngle.val()));
				redraw();
				break;
			case VisSmoothing:
				$LSSmoothAmount.text(parseFloat($VisSmoothing.val()));
				AudioPlayer.setSmoothing(parseFloat($VisSmoothing.val()));
				break;
			case LSSize:
				$LSzoomAmount.text(parseInt($LSSize.val()));
				LSystem.setSize(parseInt($LSSize.val()));
				redraw();
				break;
			default:
				redraw();
				break;

		}
		updateHistory();
	}
	function addTwitter(){
		
		/*
		!function(d,s,id){
			var js,
				fjs=d.getElementsByTagName(s)[0],
				p=/^http:/.test(d.location)?'http':'https';
			if(!d.getElementById(id)){
				js=d.createElement(s);
				js.id=id;
				js.src=p+"://platform.twitter.com/widgets.js";
				fjs.parentNode.insertBefore(js,fjs);
			}
		}(document,"script","twitter-wjs");
		*/
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
			return ("?r="+encodeURIComponent(btoa($LSInput.val()))
				+"&z="+$LSSize.val()
				+"&a="+$LSAngle.val()
				+"&t="+VisTimeDomain.checked
				+"&s="+$VisSmoothing.val()
				+"&i="+$LSIter.val()
				+"&f="+encodeURIComponent(toHex($clearColor.val(),$clearAlpha.val()))
				+"&l="+encodeURIComponent(toHex($plantColor.val(),$plantAlpha.val())))
		}
	}
	
	$(AudioPlayer).on("play",audioStart)
	$(AudioPlayer).on("pause",audioStop);

	function audioStart(e){
		looping=true;
		loop();
	}
	function audioStop(e){
		looping=false;
	}
	function loop(){
		if(looping)
			requestAnimationFrame(loop);
		redraw();
	}

	function redraw(){
		AudioPlayer.analyse(VisTimeDomain.checked);
		
		LSystem.clearScreen();
		LSystem.setData(data);
		LSystem.draw();
	}
	
	
	redraw();
});