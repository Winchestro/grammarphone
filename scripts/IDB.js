define([],function IDB(){
	var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
    if(!indexedDB){return}

   

    var db,DB_NAME,STORE_NAME,DB_VERSION;
    var current_vew_pub_key;
		
    

    //var transaction = db.transaction(["audioFiles"], "readwrite");
    
		
		
	
	

	return {
		open:openDB,
		get:getFile,
		write:write,
		all:all,
		remove:remove
	};


	function openDB(dbName,storeName,dbVersion,cb){
		DB_NAME = dbName;
		DB_VERSION = dbVersion||1;
		STORE_NAME = storeName;
		var request = indexedDB.open(DB_NAME,DB_VERSION);
		request.onsuccess=function(e){
			db=this.result;
			cb();
			//db.close();
		}
		request.onerror=errorHandler;
		request.onupgradeneeded = function(e){
			var store =  e.currentTarget.result.createObjectStore(
				STORE_NAME,
				{autoIncrement:true}
			);
			/*
			store.createIndex("lastModifiedDate","lastModifiedDate",{unique:false});
			store.createIndex("name","name",{unique:false});
			store.createIndex("size","size",{unique:false});
			store.createIndex("type","type",{unique:false});
			store.createIndex("webkitRelativePath","webkitRelativePath",{unique:false});
			*/
		}
	}

	function getObjectStore(mode) {
		var transaction = db.transaction(STORE_NAME, mode);
		return transaction.objectStore(STORE_NAME);
	}
	function clearObjectStore() {
		var store = getObjectStore("readwrite");
		var req = store.clear();
		req.onsuccess = function(evt) {
			
		};
		req.onerror = errorHandler;
	}
	function all(cb){
		var store = getObjectStore("readonly");
		var req = store.count();
		req.onsuccess=function(e){
			cb(null,e.target.result);
		};
		req.onerror=function(e){
			console.error("DB read all error!")
			cb(this.error,null);
		}

	}
	function getFile(key, cb) {
		var request = STORE_NAME.get(key);
		req.onsuccess = function(e) {
			cb(null,e.target.result)
		};
		req.onerror=function(e){
			console.error("DB read error! key=",key)
			cb(this.error,null);
		};
	}
	function write(obj,cb){
		var store = getObjectStore("readwrite");
		var req = store.put(obj);
		req.onsuccess=function(e){
			console.log("Stored:",obj);
			cb();
		};
		req.onerror=function(e){
			console.error("DB write error! obj=",obj);
			cb();
		};
	}
	function remove(key){
		var store = getObjectStore("readwrite");
		var req = store.index(key);
		req.get(key).onsuccess=function(e){
			if(typeof e.target.result ==="undefined"){
				console.error("DB delete error! key=",key);
				return;
			}
			//**deletefunction
		}
		req.onerror=errorHandler;
	}
	function deleteIndex(key,store){
		var req = store.get(key)
		//**
	}
	function errorHandler(e){
		console.error("DB generic errror",e.target.errorCode);
	}

})