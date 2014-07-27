define(function URL(){
	
	return URLQ;
	function URLQ(origin,defaults,callback){
		setValues(defaults);
		if(window !== top){
			window.addEventListener("message",function(event){
				if(event.origin === origin){
					loadQuery(event.data,defaults,callback);
				}
			});
			top.postMessage(null,origin);
		}else{
			loadQuery(window.location.href,defaults,callback);
		}
		

	}
	function setValues(data){
		data.forEach(function(d,i){
			URLQ[d[0]] = d[1];
		});

	}
	function updateValues(data,d){
		var c = 0;
		for(var i = 1; i<data.length; i+=2){
			if(d[c][2]){
				URLQ[d[c][0]] = d[c][2](data[i]);
			}
			c++;
		}
	}
	function loadQuery(href,d,callback){
		href = href.split(/=|&/g);
		updateValues(href,d);
		callback();
	}
	
});