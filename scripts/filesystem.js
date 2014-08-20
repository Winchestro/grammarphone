define([],function FileSystemConstructor(){
	var requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	

	if(!requestFileSystem){
		return {}
	}

	function FS(TYPE,QUOTA,b){
		if(!(this instanceof FS)){return new FS(TYPE,QUOTA)}
		var SELF = this;
		this.updateSize = updateSize;
		this.requestSize = requestSize;
		this.increaseSize = increaseSize;
		return new Promise(function(res,rej){
			Promise.all([requestSize(b),updateSize()]).then(function(val){
				//console.dir(val[0]);
				res(val[0]);
			})
		})
		function increaseSize(bytes){
			return new Promise(function(resolve,reject){
				console.log("increasing size")
				window.webkitStorageInfo.requestQuota(
					TYPE,
					bytes,
					function(bytes){
						resolve(bytes);
					},
					console.error.bind(console)
				)
			})
		}
		function requestSize(bytes){
			return new Promise(function(resolve,reject){
				requestFileSystem(TYPE,bytes,function(fileSystem){
					Object.setPrototypeOf(SELF,fileSystem);
					resolve(SELF);
				},console.error.bind(console))
			})
		}
		
		function updateSize(){
			return new Promise(function(resolve,reject){
				QUOTA.queryUsageAndQuota(function(used,max){
					SELF.bUsed=used;
					SELF.bMax=max;
					SELF.kbUsed=used/1024<<0;
					SELF.kbMax=max/1024<<0;
					SELF.mbUsed=used/1024/1024<<0;
					SELF.mbMax=max/1024/1024<<0;
					resolve(SELF);
				})
			})
		}

	}
	
	function Storage(){
		this.open=function(){
			var SELF = this;
			return new Promise(function(res,rej){
				var temp = FS(TEMPORARY,navigator.webkitTemporaryStorage,1024*1024*200);
				var perm = FS(PERSISTENT,navigator.webkitPersistentStorage,0);
				Promise.all([temp,perm]).then(function(val){
					//console.log(val);
					SELF.temp=val[0];
					SELF.perm=val[1];
					res(SELF);
				})
			})

		}
		
	}
	
	
	var Clipboard = Object.create(Array.prototype,{
		push:{ 
			value:function(Arraylike){
				var self = this;
				var results = [];
				var size = 0;
				var freeSize = self.temp.bMax-self.temp.bUsed;
				//var files = Array.prototype.slice.call(arguments);
				console.log(Arraylike);
				for(var i = 0; i<Arraylike.length; i++){
					size += Arraylike[i].size;
				}
				
				
				return new Promise(function(resolve,reject){
					if(size>freeSize){
						console.log("Size %s Free %s",size,freeSize);
						
						self.perm.increaseSize(size-freeSize).then(function(){
							console.log("writing to perm")
							writeFiles(self.perm);
						})
					}else{
						writeFiles(self.temp);
					}
					function writeFiles(fs){
						for(var i = 0; i<Arraylike.length;i++){
							//Promise.all()
							writeFile(fs.root,Arraylike[i],function(fileEntry){
								//console.log(fileEntry)
								Array.prototype.push.apply(self,[fileEntry]);
								fs.updateSize();
								results.push(fileEntry);
								if(results.length===Arraylike.length){
									resolve(results);
								}
							},console.error.bind(console))
						}
					}
				})
			}
		},
		inClipboard:{
			value:function(file){
				return this.filter(function(e){
					return e.name === file.name;
				})
			}
		},
		read:{
			value:function(fs){
				var self = this;
				//console.log(this);
				return new Promise(function(resolve,reject){
					//console.log(self.temp.root);
					readDir(fs.root,function(entries){
						//console.log(entries)
						Array.prototype.push.apply(self,entries);
						resolve(entries);
					},console.error.bind(console))
				});
			}
		}
	});
	Storage.prototype=Clipboard;

	

	function readDir(dir,cb){
		var entries=[];
		var reader = dir.createReader();
		//console.log(dir,reader);
		(function(n){
			//console.log(n)
			if(n<=0){console.error("I am your computer and I hate you")}
			else{				
				reader.readEntries(function(results){
					if(!results.length){
						cb(entries);
					}else{
						entries = entries.concat(toArray(results));
						arguments.callee(n-1)
					}
				},console.error.bind(console))
			}
		})(10)

	}
	function writeFile(dir,file,cb){
		//console.log(file);
		dir.getFile(
			file.name||file.toString(),
			{create: true, exclusive: false},
			function(fileEntry){
				//console.log(file);
				fileEntry.createWriter(function(fileWriter){
					fileWriter.write(file);
					//console.log(file);
					cb(fileEntry);
				})
			},console.error.bind(console)
		)
	}

	function toArray(list) {
	  return Array.prototype.slice.call(list || [], 0);
	}
	
	return new Storage;
})