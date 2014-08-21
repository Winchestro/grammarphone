define(["jquery","filesystem","d3","jquery-ui"],function ($,fs,d3){
	var URL = window.URL || window.webkitURL;
	var AudioContext = window.AudioContext||window.webkitAudioContext;
	//window.fs = fs;
	//window.d3 = d3;
	//window.p = $player[0];

	var $root = $(tabMusic);
	
	
	var $player = AudioPlayerElement();
	var $playlist = Playlist();
	var sfx = new  AudioContext;
	

	var analyser = sfx.createAnalyser();
	var media = sfx.createMediaElementSource($player[0]);
	
	media.connect(analyser);
	analyser.connect(sfx.destination);
	
	var currentSong = -1;
	var AudioPlayer = {
		element:$player[0],
		timeDomainData:new Uint8Array(analyser.frequencyBinCount),
		frequencyData:new Uint8Array(analyser.frequencyBinCount),
		analyse:function(td){
			if(td){
				analyser.getByteTimeDomainData(this.timeDomainData);
			}
			else{
				analyser.getByteFrequencyData(this.frequencyData);
			}
		},
		setSmoothing:function(n){
			analyser.smoothingTimeConstant=n;
		}
	}
	return AudioPlayer;
	
	function AudioPlayerElement(){
		
		
		return $(document.createElement("audio"))
		.on("playTrigger",function(e,url){
			$(AudioPlayer).trigger("play");
			$(".play.container>.symbol").fadeOut(500);
			$(".play.container>.description").fadeIn(500);
			if(url){
				URL.revokeObjectURL(this.src);
				this.src="";
				this.src = url;
				
			}else if(fs.length>0&&$(".playing").length===0){
				$($(".playlist.entry>p")[currentSong]).trigger("click");
			}
			this.playing = true;
			this.play();
			$(".play.container>.progress").fadeIn(500);
		})
		.on("pauseTrigger",function(e){
			$(".play.container>.symbol").fadeIn(500);
			$(".play.container>.description").fadeOut(500);
			$(AudioPlayer).trigger("pause");
			this.pause();
			this.playing = false;
		})
		.on("toggle",function(e){
			if(this.playing){
				$(this).trigger("pauseTrigger");
			}else{
				$(this).trigger("playTrigger");
			}
		})
		.on("ended",function(e){
			if(fs.length>0){
				currentSong++;
				if(currentSong>(fs.length-1)){
					currentSong = 0;
				}
				//console.log($(".playlist.container>.playing+*>p"))
				$(".playlist.container>.playing+*>p").trigger("click");
			}
		})
		
		
		
	}
	function Playlist(){
		$(".playlist.container").sortable();
		if(fs){
			fs.open().then(function(store){
				//fs=store;
				//console.dir(fs)

				store.read(store.temp).then(function(entries){
					addEntries(entries);
				})
				store.read(store.perm).then(function(entries){
					//console.log(entries)
					addEntries(entries);
				})
				function addEntries(entries){
					d3.select(".playlist.container").call(updateList)
					if(fs.length===0){
						$(".play.container").hide();
						$(".analyser.container").hide();
						
					}else{
						currentSong=0;
						$player[0].src=entries[0].toURL();
					}
				}
			});
		}else{
			fs = [];
			$(".play.container").hide();
			$(".analyser.container").hide();
			
			fs.push = function(FileList){
				return new Promise(function(resolve,reject){
					FileList=toArray(FileList);
					fs=fs.concat(FileList);
					resolve(FileList);
				})	
			}
		}
		function toArray(list) {
			return Array.prototype.slice.call(list || [], 0);
		}
		window.addEventListener("dragenter",function(e){
			var filetypes = Array.prototype.slice.call(e.dataTransfer.types);
			var containsFiles = filetypes.filter(function(e){
				return e==="Files";
			})
			if(containsFiles){
				$(".canv.overlay")
				.addClass("drag")
				.text("drop anywhere")
				;
			}
		},false)
		window.addEventListener("dragleave",function(){
			$(".canv.overlay").removeClass("drag").text("");
		},false)
		window.addEventListener("dragend",function(){
			$(".canv.overlay").removeClass("drag").text("");
		},false)
		window.addEventListener("dragover",function(e){
			e.preventDefault();
			e.dataTransfer.dropEffect = 'move'; 
		},false)
		window.addEventListener('drop', function(e){
			e.preventDefault();
			if(e.stopPropagation){
				e.stopPropagation(); 
			}
			addFiles(e.dataTransfer.files);
			$(".canv.overlay").removeClass("drag").text("");
			return false;
		},false);

		$("#filePicker")
		.on("change",function(e){
			//console.log(this.files)
			addFiles(this.files);
		})
		;
		function createList(selection,d){
			selection
			.selectAll("div")
			.data(d)
			.enter()
			.call(addFile)
		}
		function addFile(selection){
			selection.append("div")
			.attr("class","playlist entry")
			.call(addFileName)
		}
		function addFileName(selection){
			selection.append("p")
			.text(function(d) { 
				//console.log(d.name);
				return d.name; 
			})
			.on("click",function(d,i){
				$(".playing").removeClass("playing");
				$(this.parentElement).addClass("playing");
				currentSong=i;
				$player.trigger("playTrigger",[(d.toURL&&d.toURL())||URL.createObjectURL(d)])
			})
			.on("highlight",function(d){
				$(".playing").removeClass("playing");
				$(this.parentElement).addClass("playing");
			})
			.call(addDelete)	
		}
		function addDelete(selection){
			selection.append("button")
			.attr("class","playlist remove")
			.on("click",function(d,i){
				//console.log(arguments)
				var div = this.parentElement;
				div.remove();
				if(i===currentSong+1){
					$player.trigger("pause");
					$player[0].src="";
				}
				fs.splice(i,1);
				//console.log(fs)
				d.remove(function(){
					
				})
				d3.event.stopPropagation();
				
			})
			.append("svg")
			.attr("viewBox","0 0 512 512")
			.attr("xmlns","http://www.w3.org/2000/svg")
			.append("path")
			.attr("d","M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 384.00,173.255L 301.256,256.00 L 384.00,338.744L 384.00,384.00 l-45.256,0.00 L 256.00,301.256L 173.255,384.00L 128.00,384.00 l0.00-45.256 L 210.745,256.00L 128.00,173.255L 128.00,128.00 l 45.255,0.00 L 256.00,210.745L 338.744,128.00L 384.00,128.00 L 384.00,173.255 z")	
		}
		function addFiles(FileList){
			//console.log(fs)
			if(fs.length===0){
				$(".play.container").fadeIn(500);
				$(".analyser.container").fadeIn(500);
				//$(".files.clickable").off("click");
			}
			fs.push(FileList).then(function(files){
				//console.log(file,i)
				updateList();
			}).catch(console.error.bind(console));
			
		}
		function updateList(){
			d3.select(".playlist.container").selectAll("div")
			.data(fs)
			.enter()
			.call(addFile);
		}
	}
});
/*
	fs.addEventListener("ready",function(e){
		console.log(e,fs);
	})
	*/
	/*
	db.open("AudioDB","AudioStorage",1,function(){
		db.all(function(err,files){
			console.log(files);
			$playlist.addFile(files);

		})
	})
	*/

		/*
		function AudioFile(file){
			$(document.createElement("div"))
				.addClass("playlist entry")
				.append(
					$(document.createElement("p"))
					.text(file.name)
					.on("click",function(){
						playSource(source);
					})
				)
				.append(
					$(document.createElement("button"))
					.addClass("playlist remove")
					.html('<svg width="22" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><path d="M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 384.00,173.255L 301.256,256.00 L 384.00,338.744L 384.00,384.00 l-45.256,0.00 L 256.00,301.256L 173.255,384.00L 128.00,384.00 l0.00-45.256 L 210.745,256.00L 128.00,173.255L 128.00,128.00 l 45.255,0.00 L 256.00,210.745L 338.744,128.00L 384.00,128.00 L 384.00,173.255 z" ></path></svg>')
					.on("click",function(){
						$(this).parent().remove()
					})
				)
		}
		
		function AudioFile(file){
			var playing = false;
			var source = createSource(file);
			var fileEle = FileElement().prop("source",source);
			source.prop("file",fileEle)
			source.prop("next",function(){
				this.file.next("p").trigger("click");
			});
			return fileEle;

			
			function FileElement(){
				return $(document.createElement("div"))
				.addClass("playlist entry")
				.append(
					$(document.createElement("p"))
					.text(file.name)
					.on("click",function(){
						playSource(source);
					})
				)
				.append(
					$(document.createElement("button"))
					.addClass("playlist remove")
					.html('<svg width="22" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><path d="M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 384.00,173.255L 301.256,256.00 L 384.00,338.744L 384.00,384.00 l-45.256,0.00 L 256.00,301.256L 173.255,384.00L 128.00,384.00 l0.00-45.256 L 210.745,256.00L 128.00,173.255L 128.00,128.00 l 45.255,0.00 L 256.00,210.745L 338.744,128.00L 384.00,128.00 L 384.00,173.255 z" ></path></svg>')
					.on("click",function(){$(this).parent().remove()})
				)

			}
			function playSource(source){
				var s = $player.children("source");
				if(s[0]!==source){
					if(s[0].file){
						$(s[0]
							.file[0]
							.children[0])
						.removeClass("playing");
					}
					$player.children("source").remove();
					$player.append(source);
				}

				$player.trigger("play");

			}
			function createSource(file){
				return $(document.createElement("source"))
				.attr("src",file.toURL())
				.attr("type","audio/mp3")
			}	
		}
		*/
/*
	function playFile(file){
		$("#track>source").remove();
		$track.append(
			$(document.createElement("source"))
			.attr("src",URL.createObjectURL(file))
			.attr("type",file.type)
		);
		$track[0].play();

	}
	*/
	/*
	
	*/
	
	//console.log(analyser)
	//window.a = analyser;
	//window.t = timeDomainData;
	//var bufferNode;
	/*
	function decode(file,callback){
		var fileReader = new FileReader();
		fileReader.onload = function(){
			console.dir(this.result)
			callback(null,this.result);
			
		}
		fileReader.readAsArrayBuffer(file);
	}
	*/
	/*
	function decode(file,callback){
		var fileReader = new FileReader();
		fileReader.onload = function(){
			sfx.decodeAudioData(this.result,function(b){
				callback(b);
			},console.error.bind(console));
		}
		fileReader.readAsArrayBuffer(file);
	}
	
	function playBuffer(buffer){
		if(bufferNode){bufferNode.stop(0);bufferNode.disconnect(analyser)}
		bufferNode = sfx.createBufferSource();
		bufferNode.connect(analyser);
		bufferNode.buffer = buffer;
		bufferNode.start(0);
		$(AudioPlayer.prototype).trigger("play");
	}
	*/
			
/*
			'<svg width="100%" height="100%" \
				viewBox="0 0 512 512" \
				xmlns="http://www.w3.org/2000/svg" \
				fill="white">\

					<path d="\
						M 256,0\
						C 114.615,0,	0,114.615,	0,256\
						s 114.615,256,	256,256\
						s 256-114.615, 256.00-256.00\
						S 397.385,0.00, 256.00,0.00\
						z \
						M 256.00,464.00 \
						c-114.875,0.00-208.00-93.125-208.00-208.00\
						S 141.125,48.00, 256.00,48.00\
						s 208.00,93.125, 208.00,208.00\
						S 370.875,464.00, 256.00,464.00\
						z\
						M 192,144\
						L 384,256\
						L 192,368 \
						z"\
				></path>\
			</svg>'

		function e(tagName,attributes){
			return [ "<",tagName,attributes,">",
			Array.prototype.slice.call(arguments,2).join(""),
			"</",tagName,">"].join("")
		}
		function a(){
			return [" ",
				Array.prototype.slice.call(arguments)
				.join("' ")
				.split("=")
				.join("='"),
			"'"].join("");
		}
		function f(tagName){

		}

		
		return [
		"<svg",
			" id='audioControls'",
			" xmlns='http://www.w3.org/2000/svg'",
			" version='1.1'",
		">",
		ellipse("","play","50%","50%","50%","50%"),
		"</svg>"].join("");
		function svg()
		function e(s){
			return ['"',s,'"'].join("");
		};
		
		function ellipse(id,cn,cx,cy,rx,ry,fill){
			return ["<ellipse",
			id?		" id=":"",		e(id),
			cn?		" class=":"",	e(className),
			cx?		" cx=":"",		e(cx),
			cy?		" cy=":"",		e(cy),
			rx?		" rx=":"",		e(rx),
			ry?		" ry=":"",		e(ry),
			fill?	" fill=":"",	e(fill),
			"></ellipse>"].join("");
		}
		
		function p(className,x,y,r){
			var e = document.createElementNS("http://www.w3.org/2000/svg", 'path');
			e.setAttribute("d","A "+x+" "+y+" "+"")
		}
		
		var canvas = document.createElement("canvas");
		var w=canvas.width = 80;
		var h=canvas.height= 80;
			canvas.id="audioControls";
		var ctx = canvas.getContext("2d");
		var progress = .4,buffer = .8;
		
		const center = w/2;

		const outerR = w/2;
		const midR = w/3;
		const innerR = w/4;

		const fgC = "white";
		const bgC = "grey";
		const borderC = "black";

		canvas.addEventListener("click",clickHandler);
		canvas.draw = draw;
		draw();
		return canvas;
		function draw(){
			
			ctx.clearRect(0,0,w,h);
			if($player){
				progress = $player[0].currentTime/$player[0].duration;
			}
			if($player&&$player[0].buffered.length){
				buffer=$player[0].buffered.end(.5)/$player[0].duration;
			}
			
			ctx.strokeStyle = borderC;
			ctx.lineWidth = 0;
			
			
			drawCircle(bgC,outerR,buffer);
			drawCircle(fgC,midR,progress);
			drawCutout(innerR);
			drawSeeker(outerR,(outerR-innerR)/2,progress);
			function drawSeeker(n,s,p){
				ctx.beginPath();
				
				var x = n+(n-s)*Math.sin(-p*Math.PI*2+Math.PI/2);
				var y = n+(n-s)*Math.cos(-p*Math.PI*2+Math.PI/2);
				//console.log(x,y)
				ctx.globalCompositeOperation = "source-over";
				//ctx.moveTo(x,y);
				ctx.arc(x,y,s,0,Math.PI*2);
				
				ctx.fillStyle="white"
				ctx.fill();
				ctx.stroke();
			}
			function drawPlay(){
				ctx.beginPath();
				ctx.moveTo()
			}
			function drawCircle(c,r,n){
				ctx.beginPath();
				ctx.fillStyle=c;
				ctx.globalCompositeOperation = "source-over";
				ctx.moveTo(center,center)
				ctx.arc(center,center,r,0,Math.PI*2*n);
				ctx.fill();
				ctx.stroke();
			}
			function drawCutout(r){
				ctx.beginPath();
				ctx.globalCompositeOperation = "destination-out";
				ctx.moveTo(center,center);
				ctx.arc(center,center,r,0,Math.PI*2);
				ctx.fill();
			}
			
		}

		function clickHandler(e){
			//console.log(e)
			var x = e.layerX, y=e.layerY;

			if(isInRadius(x,y,w/4,w/2)){
				var a = ((Math.atan2(h/2-y,w/2-x)+Math.PI)/Math.PI/2);
				//console.log(a)
				$player[0].currentTime = a*$player[0].duration

			}else if(isInRadius(x,y,0,w/4)){
				//mainColor = "red";
				$player.trigger("toggle");
			}
		}
		function isInRadius(x,y,min,max){
			var d = Math.sqrt(Math.pow(x-w/2,2)+Math.pow(y-h/2,2));
			//console.log(d,x,y,w,h)
			return (d<max&&d>min)?true:false;
			
		}
		//.html('<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><path d="M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 256.00,464.00 c-114.875,0.00-208.00-93.125-208.00-208.00S 141.125,48.00, 256.00,48.00s 208.00,93.125, 208.00,208.00S 370.875,464.00, 256.00,464.00zM 192.00,144.00L 384.00,256.00L 192.00,368.00 z" ></path></svg>')
		*/