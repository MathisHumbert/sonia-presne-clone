precision mediump float;

uniform sampler2D uTexture;
uniform vec2 uPlaneSizes;
uniform vec2 uImageSizes;
varying vec2 vUv;

vec2 getCorrectUv (vec2 planeSizes, vec2 imageSizes, vec2 uv){
  vec2 ratio = vec2(
    min(((planeSizes.x / planeSizes.y) / (imageSizes.x / imageSizes.y)), 1.),
    min(((planeSizes.y / planeSizes.x) / (imageSizes.y / imageSizes.x)), 1.)
  );

  return vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );
}

void main(){
  vec4 texture = texture2D(uTexture, vUv);

  gl_FragColor = texture;
  // gl_FragColor = vec4(0., 0., 0., 1.0);
}