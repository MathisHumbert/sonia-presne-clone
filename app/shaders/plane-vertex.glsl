attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float uTime;
uniform float uWind;
uniform float uHover;

varying vec2 vUv;

const float TAU = 6.2831852;
const float PI = 0.5 * TAU; // This is a political statement
const float octaves = 8.0;

float hash11(float p){
  const float HASHSCALE1 = .1031;
	vec3 p3  = fract(vec3(p) * HASHSCALE1);
  p3 += dot(p3, p3.yzx + 19.19);
  return fract((p3.x + p3.y) * p3.z);
}

float getAmplitude(float octave){
  return 1.0 / pow(2.0, octave);
}

float getWavelength(float octave){
const float maximumWavelength = 50.0;
  
  float wavelength = TAU * maximumWavelength / pow(2.0, octave);

  // Make it aperiodic with a random factor
  wavelength *= 0.75 + 0.5 * hash11(1.337 * octave);
  
  return wavelength;
}

float getSpeed(float octave){
  const float speedScaleFactor = 2.0;
  
  // Smallest waves travel twice as fast as given velocity,
  // largest waves travel half as fast
  const vec2 speedRange = vec2(2.0, 0.5);
  
  // Map octave to speed range
  float speed = speedScaleFactor * mix(speedRange.x, speedRange.y, octave / (max(1.0, octaves - 1.0)));
  
  // Add some randomness
  speed *= 0.5 + hash11(1.337 * octave);
  
  return speed;
}


float wind(vec2 position, float amp, vec2 velocity) {
  float magnitude = length(velocity);
  vec2 direction = (magnitude > 1e-5) ? velocity / magnitude : vec2(0.0);

  float height = 0.0;
  
  for (float octave = 0.0; octave < octaves; octave += 1.0){
    float amplitude = getAmplitude(octave);
    float wavelength = getWavelength(octave);
    float speed = magnitude * getSpeed(octave);
    float frequency = TAU / wavelength;
    float randomPhaseOffset = hash11(1.337 * octave) * TAU;
    float phase = speed * frequency + randomPhaseOffset;
    float theta = dot(-direction, position);

    height += amplitude * sin(theta * frequency + uTime * phase);
  }
  
  return height * amp * 0.004;
}


void main(){
  vUv = uv;

  vec2 velocity = vec2(8.0, 6.0);

  vec4 pos = modelViewMatrix * vec4(position, 1.0);
  pos.x = pos.x + wind(pos.xy * 200., uWind * uHover, velocity);
  pos.y = pos.y + wind(pos.xy * 200., uWind * uHover, velocity) * .3;

  gl_Position = projectionMatrix * pos;
}