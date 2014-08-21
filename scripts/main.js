
define(["lsystem","jquery","gui"],function demo(LSystem,$,gui){
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
	
	
	function loadQuery(url){
		url = url || window.location;

		var defaultRule = "Uz1pPlsrU29dLVM%3D";


		var i = queryString("i",url)||"7";
		var z = queryString("z",url)||"50";
		var r = queryString("r",url)||defaultRule;
		var t = queryString("t",url)||"false"
		var a = queryString("a",url)||"30";
		var s = queryString("s",url)||"0.8";
		var f = queryString("f",url)||"%23ff0e471f";
		var l = queryString("l",url)||"%239efffffa";
		
		i=parseInt(i);
		z=parseInt(z);
		a=parseFloat(a);
		s=parseFloat(s);

		
		r=decodeURIComponent(r);
		f=decodeURIComponent(f);
		l=decodeURIComponent(l);

		try{
			r=atob(r)
		}catch(err){
			r=defaultRule;
		}
		try{
			t=JSON.parse(t);
		}catch(err){
			t=false;
		}
		
		LSystem.stop();
		
		//gui.Iterations.set(0);
		
		gui.Rule.set(r);
		gui.Iterations.set(i);
		gui.Zoom.set(z);
		gui.Angle.set(a);
		gui.FFT.set(s);
		gui.UseTimeDomain.set(t)
		gui.ClearColor.set(f);
		gui.LineColor.set(l);
		

		var rule = gui.Rule.get();
		var	iter = gui.Iterations.get();
		LSystem.setRule(rule,iter);
		LSystem.launch();
	}

	var xhr = new XMLHttpRequest();


	xhr.open("GET","http://winchestro.herokuapp.com/mentions_timeline");
	//xhr.open("GET","./mentions_timeline");

	xhr.send();
	xhr.onreadystatechange=function(){
		if(xhr.readyState===xhr.DONE&&xhr.status===200){
			//console.log(xhr.response)	
			$("#tabGallery").html(xhr.response);
			$($(".gallery.imgWrapper")[0]).attr("data-url","http://www.winchestro.com/grammarphone/?r=ST1baV0rK2kgaT0raS1pK1sraW9dLVtpb10%3D&z=14&a=315&t=false&s=0.5171393752639711&i=6&f=%23fc14141d&l=%2336cbcbcb");
			$($(".gallery.imgWrapper")[1]).attr("data-url","http://www.winchestro.com/grammarphone/?r=ST1bMV1baV0rWzFdW2ldIDE9aS0xMS1pIGk9MStpaSsx&z=14&a=90&t=true&s=0.8&i=7&f=%23ff140370&l=%23ffffffff");
			$(".gallery.imgWrapper").on("click",function(e){
				//console.log(e,this)
				var url = new URL($(this).attr("data-url"));
				loadQuery(url);
			})
		}
	}

	
	
	
	
	
	loadQuery();
	return {
		setCompileTimeout:LSystem.setCompileTimeout,
		setLoopTimeout:LSystem.setLoopTimeout,
		setDrawTimeout:LSystem.setDrawTimeout,
		setScaleFactor:LSystem.setScaleFactor,
		launch:LSystem.launch
	};
	function queryString(variable,url){
		//console.log(url.search)
		var vars = url.search.substring(1).split("&");
		for (var i=0;i<vars.length;i++){
			var pair = vars[i].split("=");
			if(pair[0] == variable){
				return pair[1];
			}
		}
		return(false);
	}
});
/*
	var defaults = [
		["rule",	"S=i>[+So]-S",			function(s){
			try{
				return atob(decodeURIComponent(s));
			}catch(err){
				return "S=i>[+So]-S";
			}
		}],
		["zoom",	50,						function(s){
			return parseInt(s)||50;
		}],
		["angle",	30,						function(s){
			return Number(s)||30;
		}],
		["td",		false,					function(s){
			try{
				return JSON.parse(s);
			}catch(err){
				return false;
			}
		}],
		["smooth",	0.8,					function(s){
			return parseFloat(s)||0.8;
		}],
		["iter",	7,						function(s){
			return parseInt(s)||7;
		}],
		["fade",	"rgb(141, 0, 134)",		function(s){
			var c = decodeURIComponent(s);
			if(c.length===9&&c[0]==="#"){
				return "rgb(141, 0, 134)"
			}else{
				return c;
			}
		}],
		["plant",	"rgba(255, 232, 111, 0.5)",function(s){
			var c = decodeURIComponent(s);
			if(c.length===9&&c[0]==="#"){
				return "rgba(255, 232, 111, 0.5)"
			}else{
				return c;
			}
		}]
	];
	
	*/
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