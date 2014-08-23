// CBS
// ported from https://www.shadertoy.com/view/lslGWr
// Added some stars: Thanks to http://glsl.heroku.com/e#6904.0

#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
uniform vec2 position;
uniform float scale;


uniform vec4 fgColor;
uniform vec4 bgColor;

uniform sampler2D tex0;

float dist(in vec2 uv,in vec2 pos){
	return pow(pow(abs(uv.x-pos.x),2.)+pow(abs(uv.y-pos.y),2.),.5);
}

// http://www.fractalforums.com/new-theories-and-research/very-simple-formula-for-fractal-patterns/
float field(in vec3 p) {
	float strength = 2. + .03 * log(1.e-6 + fract(sin(time) * 4373.11));
	float accum = 0.;
	float prev = 0.;
	float tw = 0.;
	for (int i = 0; i < 32; ++i) {
		float mag = dot(p, p);
		//p = abs(p) / mag + vec3(-.5, -.3, -.5-bgColor.a);
		p = abs(p) / mag + vec3(-.5-mouse.x*.01, -.3-mouse.y*.01, -.5-bgColor.a);
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
void main() {
	vec2 uv = gl_FragCoord.xy / resolution;
	float d = 1.-dist(vec2(.5),uv)*bgColor.a;
	//float c = dist(position*vec2(-.1,.1)/resolution+vec2(.5),uv);
	//float e=audio(uv.x);
	gl_FragColor = vec4(
		bgColor.r*d,
		bgColor.g*d,
		bgColor.b*d,
		1.0
	);
	
}