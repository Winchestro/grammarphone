define(["jquery"],function AudioPlayer($){
	
	var $root = $(audioPlayerRoot);
	
	var $player = AudioPlayerElement();
	var $playlist = Playlist($player);
	$root.append($playlist).append($player);

	var URL = window.URL || window.webkitURL;
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
    var dbVersion = 1;
    var dbRequest = indexedDB.open("audioPlayerFiles", dbVersion);

	var AudioContext = window.AudioContext||window.webkitAudioContext;
	var sfx = new  AudioContext;
	var bufferNode = sfx.createBufferSource();

	var analyser = sfx.createAnalyser();
		analyser.fftSize=2048;

	var timeDomainData = new Uint8Array(analyser.frequencyBinCount);
	var frequencyData = new Uint8Array(analyser.frequencyBinCount);
	var media = sfx.createMediaElementSource($player[0]);
	media.connect(analyser);
	analyser.connect(sfx.destination);
	//bufferNode.connect(sfx.destination);
	

	/*
	function decode(file,callback){
		var fileReader = new FileReader();
		fileReader.onload = function(){
			sfx.decodeAudioData(this.result,function(b){
				callback(null,b);
			},function(e){callback("Decoding Error")});
		}
		fileReader.readAsArrayBuffer(file);
	}
	*/
	AudioPlayer.prototype = {}
	AudioPlayer.prototype.analyse=analyse;
	AudioPlayer.prototype.timeDomainData=timeDomainData;
	AudioPlayer.prototype.frequencyData=frequencyData;
	AudioPlayer.prototype.setSmoothing=setSmoothing;
	return AudioPlayer.prototype;

	function Controls(){
		var $playButton = $(document.createElement("button"))
		.html('<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><path d="M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 256.00,464.00 c-114.875,0.00-208.00-93.125-208.00-208.00S 141.125,48.00, 256.00,48.00s 208.00,93.125, 208.00,208.00S 370.875,464.00, 256.00,464.00zM 192.00,144.00L 384.00,256.00L 192.00,368.00 z" ></path></svg>')
	}
	function setSmoothing(n){
		analyser.smoothingTimeConstant=n;
	}
	function Playlist(){
		var e = PlaylistElement();
		var f = $("#filePicker");
		var files = {};

		$("#filePicker").on("change",function(){
			if(f[0].files.length>0){
				$(filePicker.files).each(function(i,file){
					if(!(file.name in files)){
						e.append(files[file.name]=AudioFile(file))

					}
				});
			}
		});
		return e;
		function AudioFile(file){
			var playing = false;
			var source = createSource(file);
			return FileElement();
			function FileElement(){
				return $(document.createElement("div"))
				.addClass("playlist entry")
				.append(
					$(document.createElement("p"))
					.text(file.name)
					.on("click",function(){playSource(source)})
				)
				.append(
					$(document.createElement("button"))
					.addClass("playlist remove")
					.html('<svg width="22" height="22" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><path d="M 256.00,0.00C 114.615,0.00,0.00,114.615,0.00,256.00s 114.615,256.00, 256.00,256.00s 256.00-114.615, 256.00-256.00S 397.385,0.00, 256.00,0.00z M 384.00,173.255L 301.256,256.00 L 384.00,338.744L 384.00,384.00 l-45.256,0.00 L 256.00,301.256L 173.255,384.00L 128.00,384.00 l0.00-45.256 L 210.745,256.00L 128.00,173.255L 128.00,128.00 l 45.255,0.00 L 256.00,210.745L 338.744,128.00L 384.00,128.00 L 384.00,173.255 z" ></path></svg>')
					.on("click",function(){$(this).parent().remove()})
				)
			}
			function playSource(source){
				$player.children("source").remove();
				$player.append(source);
				$player[0].play();

			}
			function createSource(file){
				return $(document.createElement("source"))
				.attr("src",URL.createObjectURL(file))
				.attr("type",file.type)
			}	
		}
		
		function PlaylistElement(){
			return $(document.createElement("div"))
				.addClass("playlist container")
		}
	}
	
	function AudioPlayerElement(){
		return $(document.createElement("audio"))
			.attr("controls","true")
			.on("play",function(e){
				$(AudioPlayer.prototype).trigger(e);
			})
			.on("pause",function(e){
				$(AudioPlayer.prototype).trigger(e);
			})
	}
	function analyse(){	
		analyser.getByteTimeDomainData(timeDomainData);
		analyser.getByteFrequencyData(frequencyData);

	}
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
	function playBuffer(buffer){
		bufferNode.stop();
		bufferNode.buffer = buffer;
		bufferNode.start(0);
	}
	*/
	
});