
requirejs.config({
	paths: {
		"jquery": "//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min"
	}
});
// urlArgs: "bust=" + (new Date()).getTime(),
require(["main"]);
