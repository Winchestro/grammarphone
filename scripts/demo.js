
requirejs.config({
	paths: {
	//	"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
	//	"jquery-ui": "//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min"
		"jquery":"jquery.min",
		"keyboard":"jquery.keyboard.min",
		"keyboardExtensions":"jquery.keyboard.extension-all.min",
		"jquery-ui":"jquery-ui-1.11.1/jquery-ui.min",
		"socketIO":"https://cdn.socket.io/socket.io-1.0.0",
		"d3":"d3.v3.min"
	//	"d3":"http://d3js.org/d3.v3.min"
	},
	 "shim": {
		 "jquery.keyboard": ["jquery"],
		 "jquery.keyboardExtensions": ["jquery"]
    }
});
// urlArgs: "bust=" + (new Date()).getTime(),
require(["main"],function(main){
	window.grammarphone=main;
	
});
