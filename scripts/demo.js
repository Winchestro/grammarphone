
requirejs.config({
	paths: {
	//	"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
		"jquery":"jquery.min",
		"jquery-ui":"jquery-ui-1.11.1/jquery-ui.min",
		"socketIO":"https://cdn.socket.io/socket.io-1.0.0",
		"d3":"d3.v3.min"
	//	"d3":"http://d3js.org/d3.v3.min"
	}
});
// urlArgs: "bust=" + (new Date()).getTime(),
require(["main"],function(main){
	window.grammarphone=main;
});
