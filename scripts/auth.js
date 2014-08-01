define([],function(){
	
	return {
		r:request
	}	
	function request(cb){
		var xhr = new XMLHttpRequest();
		xhr.open("GET","https://script.google.com/macros/s/AKfycbyAtelxi_uLL1yTqeZR5G_2mMeRLmDic3ZNOYKV5aRKlNpjdya9/exec");
		xhr.onreadystatechange=function(){
			if(xhr.DONE&&xhr.readyState===4){
				cb(xhr.response);
			}
		}
	}
});