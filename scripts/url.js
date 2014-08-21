define(function URL(){
	
	return URLQ;
	function URLQ(defaults,callback){
		setValues(defaults);
		loadQuery(window.location.href);
		
		function setValues(defaults){
			defaults.forEach(function(d,i){
				URLQ[d[0]] = d[1];
			});
		}
		
		function loadQuery(href,d){
			href = href.split(/=|&/g);
			updateValues(href,d);
			callback();
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
	}
});