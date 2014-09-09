// CBS
// ported from https://www.shadertoy.com/view/lslGWr
// Added some stars: Thanks to http://glsl.heroku.com/e#6904.0


precision highp float;
precision highp int;


uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform vec2 position;
uniform float scale;


uniform vec4 fgColor;
uniform vec4 bgColor;

uniform sampler2D tex0;


float audio(float n){
	int i = int(mod(n*1024.,4.));
	float x = 1.-mod(n*16.,1.);
	float y = floor(n*256.)/256.;
	vec2 uv = vec2(x,y);
	vec4 s = texture2D(tex0,uv);
	if(i==0){
		return s[3];
	}else if(i==1){
		return s[2];
	}else if(i==2){
		return s[1];
	}else if(i==3){
		return s[0];
	}
}
// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
float field(in vec3 p) {

	float strength = 2. + .01 * log(1.e-6 + fract(sin(time) * 4373.11));
	float accum = 0.;
	float prev = 0.;
	float tw = 0.;
	
	for (int i = 0; i < 16; ++i) {
		float mag = dot(p, p);
		//p = abs(p) / mag + vec3(-.5, -.3, -.5-bgColor.a);
		
		p = abs(p) / mag  + vec3(-.5-mouse.x*.01, -.3-mouse.y*.01, -.5-.025*audio(tw)-bgColor.a);
		
		//p = abs(p) / mag + ;
		float w = exp(-float(i) / 7.);
		accum += w * exp(-strength * pow(abs(mag - prev), 2.3));
		tw += w;
		prev = mag;
	}
	return max(0., 5. * accum / tw - .7);
}

vec3 nrand3( vec2 co )
{
	vec3 a = fract( cos( co.x*8.3e-3 + co.y )*vec3(1.3e5, 4.7e5, 2.9e5) );
	vec3 b = fract( sin( co.x*0.3e-3 + co.y )*vec3(8.1e5, 1.0e5, 0.1e5) );
	vec3 c = mix(a, b, 0.3);
	return c;
}


void main() {
	vec2 uv = (gl_FragCoord.xy +position * vec2(.1,-.1))/ resolution.xy;
	//uv.x -= mouse.x;
	

	vec2 uvs = uv * resolution.xy / max(resolution.x, resolution.y);
	vec3 p = vec3(uvs / 1., 0) + vec3(1., -1.4, 0.);
	//p += .03 * vec3(sin(time / 160.), sin(time / 120.),  sin(time / 1280.));
	float t = field(p);
	float v = (1.0 - exp((abs(uv.x) - 1.) * 6.)) * (1. - exp((abs(uv.y) - 1.) * 6.));
	
	
	//Let's add some stars
	//Thanks to http://glsl.heroku.com/e#6904.0
	vec2 seed = p.xy * 1.7;	
	seed = floor(seed * resolution);
	vec3 rnd = nrand3( seed );
	vec4 starcolor = vec4(pow(rnd.y,40.0));
	//vec4 starcolor = texture2D(tex0,p.xy);

	gl_FragColor = 
	mix(1., 1., v) 
	* vec4(
		bgColor.r * t * t * t, 
		bgColor.g * t * t * t, 
		bgColor.b * t * t * t, 
		1.0
	);
	
}