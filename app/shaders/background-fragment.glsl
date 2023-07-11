precision mediump float;

float lerp(float v0, float v1, float t) {
  return v0 + t * (v1 - v0);
}

float easeIn(float i){
  return i * i;
}

float easeOut(float i){
  return 1. - easeIn(1. - i);
}

float easeInOut(float i){
  float a = easeIn(i);
  float b = easeOut(i);
  return lerp(a, b, i);
}

float frac(float x){
  return x - floor(x);
}

// float fwidth(float x) {
//     return abs(dFdx(x)) + abs(dFdy(x));
// } 

float rand2dTo1d(vec2 value, vec2 dotDir){
  vec2 smallValue = sin(value);
  float random = dot(smallValue, dotDir);
  random = frac(sin(random) * 143758.5453);
  return random;
}


vec2 rand2dTo2d(vec2 value){
  return vec2(
      rand2dTo1d(value, vec2(12.989, 78.233)),
      rand2dTo1d(value, vec2(39.346, 11.135))
  );
}

float rand3dTo1d(vec3 value, vec3 dotDir){
  //make value smaller to avoid artefacts
  vec3 smallValue = sin(value);
  //get scalar value from 3d vector
  float random = dot(smallValue, dotDir);
  //make value more random by making it bigger and then taking the factional part
  random = frac(sin(random) * 143758.5453);
  return random;
}

vec3 rand3dTo3d(vec3 value){
  return vec3(
    rand3dTo1d(value, vec3(12.989, 78.233, 37.719)),
    rand3dTo1d(value, vec3(39.346, 11.135, 83.155)),
    rand3dTo1d(value, vec3(73.156, 52.235, 09.151))
  );
}

float hash(float p) { p = fract(p * 0.011); p *= p + 7.5; p *= p + p; return fract(p); }
float hash(vec2 p) {vec3 p3 = fract(vec3(p.xyx) * 0.13); p3 += dot(p3, p3.yzx + 3.333); return fract((p3.x + p3.y) * p3.z); }


vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float perlinNoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
              dot(p2,x2), dot(p3,x3) ) );
}

uniform float uAlpha;
uniform float uTime;
uniform float uColorMix;

varying vec2 vUv;

void main(){
  vec3 white = vec3(1.);
  vec3 blue = vec3(.125, .145, .298);
  vec3 color = mix(white, blue, uColorMix);

  float x = vUv.x * 11.; // size
  float y = vUv.y * 11.; // size
  float z = uTime * .01; // speed
  float s = .1; // smoothing
  float l = .2; // line width

  float noise = perlinNoise(vec3(x, y, z)) + 0.5;
  noise = frac(noise * 40.); // amount of lines
  
  float pixelNoiseChange = l;
  
  float heightLine = smoothstep(1. - s - pixelNoiseChange, 1., noise);
  heightLine += smoothstep(s + pixelNoiseChange, 0., noise);
  heightLine = clamp(heightLine, 0., .5);
  heightLine = heightLine * .065;
  
  color = color - heightLine * (1. - uColorMix * 2.);
  gl_FragColor = vec4(color, uAlpha);
}