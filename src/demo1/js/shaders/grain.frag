#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

uniform vec3 uLightColor[2];
uniform vec3 uColor;
uniform float uLightIntensity;
uniform float uNoiseCoef;
uniform float uNoiseMin;
uniform float uNoiseMax;
uniform float uNoiseScale;

varying vec3 vNormal;
varying vec3 vSurfaceToLight[2];


//-------------------------------------------------------------------------
// Given a normal vector and a light,
// calculate the fragment's color using diffuse and specular lighting.

vec3 light_reflection(vec3 vSurfaceToLight, vec3 lightColor) {
  // General calculations needed for diffuse lighting
  // AMBIENT is just the light's color
  vec3 ambient = lightColor;

  //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // DIFFUSE  calculations
  // Calculate the cosine of the angle between the vertex's normal
  // vector and the vector going to the light.
  vec3 diffuse = lightColor * max(dot(vSurfaceToLight, vNormal), 0.0);

  // Combine
  return (ambient + diffuse);
}

void main(void) {
  vec3 light_value = vec3(0);

  // for each light...
  for(int i = 0; i < 2; i++) {
    light_value += light_reflection(vSurfaceToLight[i], uLightColor[i]);
  }
  // Add ambient light intensity
  light_value *= uLightIntensity;

  // grain
  vec2 uv = gl_FragCoord.xy;
  uv /= uNoiseScale;

  vec3 colorNoise = vec3(snoise2(uv) * 0.5 + 0.5);
  colorNoise *= clamp(uNoiseMin, uNoiseMax, pow(light_value.r, uNoiseCoef));

  // clamping with our unique color
  gl_FragColor.r = max(colorNoise.r, uColor.r);
  gl_FragColor.g = max(colorNoise.g, uColor.g);
  gl_FragColor.b = max(colorNoise.b, uColor.b);
  gl_FragColor.a = 1.0;
}
