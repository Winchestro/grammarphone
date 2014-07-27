
define(["lsystem","url","jquery"],function demo(LSystem,query,$){
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
		$LSSmoothAmount = $("#LSSmoothAmount"),
		$track =	$("#track");

	
	var looping;
	var data;
	var AudioContext = window.AudioContext||window.webkitAudioContext;
	var sfx = new  AudioContext;
	
	var media = sfx.createMediaElementSource(track);
	var analyser = sfx.createAnalyser();
		analyser.fftSize=2048;

	var timeDomainData = new Uint8Array(analyser.frequencyBinCount);
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	media.connect(analyser);
	
	query("http://www.winchestro.com",[
		["rule",	"I=I[+IO]I[-IO][IO]",	function(s){return atob(decodeURIComponent(s))}],
		["zoom",	14,						function(s){return parseInt(s)}],
		["angle",	30,						function(s){return parseInt(s)}],
		["td",		true,					function(s){return JSON.parse(s)}],
		["smooth",	0.8,					function(s){return parseFloat(s)}],
		["iter",	4,						function(s){return parseInt(s)}],
		["fade",	"#0F4499FF",			function(s){return decodeURIComponent(s)}],
		["plant",	"#FFFFFF88",			function(s){return decodeURIComponent(s)}]
	],function(){
		
		window.w=query;
		updateInterface();

		if(query.td){
			data = timeDomainData;
			VisTimeDomain.checked=true;
		}else{
			data = frequencyData;
			VisFrequency.checked=true;

		}
		LSystem.init(
			query.rule,
			query.iter,
			query.zoom,
			query.angle
		);
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
	$track.on("play",audioStart)
	$track.on("pause",audioStop);
	
	LSystem.init(query.rule,query.iter,query.zoom,query.angle);
	
	
	$(window).on("wheel",function(e){
		var e = e.originalEvent;
		$LSSize.val(parseInt($LSSize.val())+-1*e.deltaY/Math.abs(e.deltaY));
		$LSzoomAmount.text(parseInt($LSSize.val()));
		LSystem.setSize(parseInt($LSSize.val()));
		updateHistory();
		redraw();
	});
	//$("#LSInput").on("focus",function(e){e.preventDefault()});
	$("#filePicker").on("change",loadFile);
	$("#LSform").on("submit",function(e){e.preventDefault()})
		.on("input",update);
	
	
	$("#VisTimeDomain").on("change",update);
	$("#VisFrequency").on("change",update);
	$("#btnOptions").on("click",toggleHandler(btnOptions,[btnMusic,btnKeys,btnGallery],"tabOptions"));
	$("#btnMusic").on("click",toggleHandler(btnMusic,[btnOptions,btnKeys,btnGallery],"tabMusic"));
	$("#btnKeys").on("click",toggleHandler(btnKeys,[btnOptions,btnMusic,btnGallery],"tabKeys"));
	$("#btnGallery").on("click",toggleHandler(btnGallery,[btnOptions,btnMusic,btnKeys],"tabGallery"));
	function toggleHandler(self,others,selector){
		self.toggled = false;
		self.toggle = toggle;
		var options = document.getElementById(selector);
		return toggle;
		function toggle(e){
			if(self.toggled){
				hide(options);
				unpressed(self).toggled = false;
			}else{
				unhide(options);
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
				e.classList.add("pressed")
				return e;
			}
			function unpressed(e){
				e.classList.remove("pressed")
				return e;
			}
			function unhide(e){
				e.setAttribute("style","");
				return e;
			}
		}
	}
		
	
	redraw();

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
			case VisTimeDomain:
				data = timeDomainData;
				redraw();
				break;
			case VisFrequency:
				data = frequencyData;
				redraw();
				break;
			case LSAngle:
				$LSAngleName.text(parseInt($LSAngle.val())+"°");
				LSystem.setAngle(parseInt($LSAngle.val()));
				redraw();
				break;
			case VisSmoothing:
				$LSSmoothAmount.text(parseFloat($VisSmoothing.val()));
				analyser.smoothingTimeConstant=parseFloat($VisSmoothing.val());
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
	function loadFile(){
		
		if(filePicker.files.length>0){
			
			$track.remove();
			console.log($track);
			 
			$track = $(document.createElement("audio"))
			.attr("id","track")
			.attr("controls","true")
			.attr("loop","true")
			.attr("autoplay","true")
			.on("play",audioStart)
			.on("pause",audioStop)
			.appendTo("div#audioSettings")
			.append(
				$(document.createElement("source"))
				.attr("src",URL.createObjectURL(filePicker.files[0]))
				.attr("type",filePicker.files[0].type)
			);
			
			sfx.createMediaElementSource(track).connect(analyser);
			analyser.connect(sfx.destination);
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
		LSystem.clearScreen($clearColor.val(),$clearAlpha.val());
		
		LSystem.draw(data);
	}
	
	$("#canvas2d").on("contextmenu",function(e){
		LSystem.setCenter(e.clientX,e.clientY);
		redraw();
		e.originalEvent.preventDefault();
	});
	
});