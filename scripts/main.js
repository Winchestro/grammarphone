
define(["lsystem","url","jquery","gui"],function demo(LSystem,query,$,gui){
	"use strict";
	window.q=$;

	
	
	$(".ui.row.tab.uiBG").hide();
	$(".menubody").show();
	
	/*
		var socket = io.connect("http://localhost");
		window.socket = socket;
		socket.on("loadGallery",function(items){
			
			console.log(items)
		});
		socket.on("debug",function(data){
			window.last=data;
			console.log(data);

		})
	*/

	query("http://www.winchestro.com",[
		["rule",	"So=i>[+So]-S",		function(s){return atob(decodeURIComponent(s))}],
		["zoom",	50,						function(s){return parseInt(s)}],
		["angle",	30,						function(s){return (s)}],
		["td",		false,					function(s){return JSON.parse(s)}],
		["smooth",	0.8,					function(s){return parseFloat(s)}],
		["iter",	7,						function(s){return parseInt(s)}],
		["fade",	"rgb(141, 0, 134)",		function(s){return decodeURIComponent(s)}],
		["plant",	"rgba(255, 232, 111, 0.541176)",function(s){return decodeURIComponent(s)}]
	],function(){
		updateInterface();
		/*
		LSystem.useTimeDomain(query.td);
		LSystem.init(
			gui.Rule.get(),
			gui.Iterations.get(),
			gui.Zoom.get(),
			gui.Angle.get()
		);
		LSystem.setClearColor(gui.ClearColor.get());
		LSystem.redraw();
		*/
	});
	function updateInterface(){
		gui.Iterations.set(query.iter);
		gui.Zoom.set(query.zoom);
		gui.Rule.set(query.rule);
		gui.Angle.set(query.angle);
		gui.FFT.set(query.smooth);
		gui.UseTimeDomain.set(query.td);

		gui.ClearColor.set(query.fade
			//query.fade.slice(0,7),
			//parseInt(query.fade.slice(7,9),16)/256
		);
		gui.LineColor.set(query.plant
			//query.plant.slice(0,7),
			//parseInt(query.plant.slice(7,9),16)/256
		);
		
		//gui.Angle.update((query.angle)+"°");
		//gui.Zoom.update();
		//gui.Iterations.update();
		//gui.FFT.update();
	}

	var xhr = new XMLHttpRequest();
	xhr.open("GET","./mentions_timeline");
	xhr.send();
	xhr.onload=function(){
		
			//console.log(xhr.response)	
			$("#tabGallery").html(xhr.response);
		
	}

	
	
	
	
	

	return {
		setCompileTimeout:LSystem.setCompileTimeout,
		setLoopTimeout:LSystem.setLoopTimeout,
		setDrawTimeout:LSystem.setDrawTimeout,
		setScaleFactor:LSystem.setScaleFactor
	};
	
});
/*
	$("#btnGallery")
	.on("click",function(e){
		
		if(!twitterLoaded){
			var loading = loadingCircle();
	
			tabGallery.appendChild(loading);
			
			var twttr = window.twttr = (function (d, s, id) {
	  			var t, js, fjs = d.getElementsByTagName(s)[0];
	  			if (d.getElementById(id)) return;
	  			js = d.createElement(s); js.id = id; js.src= "http://platform.twitter.com/widgets.js";
	  			fjs.parentNode.insertBefore(js, fjs);
	  			return window.twttr || (t = { _e: [], ready: function (f) { t._e.push(f) } });
			}(document, "script", "twitter-wjs"));
			twttr.ready(function(twttr){
				
				
				var editorsChoice = $(document.createElement("a"))
				.hide()
				.appendTo(tabGallery.firstChild)
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
	*/
/*
	function addTwitter(){
		
		
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
		
	}
	*/

/*
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
	*/