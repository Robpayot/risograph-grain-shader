precision highp float;

#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

uniform vec3 uLightColor[3];
uniform vec3 uColor;
uniform float uLightIntensity;
uniform float uNoiseCoef;
uniform float uNoiseMin;
uniform float uNoiseMax;
uniform vec3 uBgColor;
// uniform float uTime;
uniform bool uAlpha;
uniform bool uPattern;
uniform bool uPlain;
uniform float uFract;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec3 vVertex;
varying vec3 vLightPos[3];
varying vec2 vUv;

const float shininess = 1.;

//-------------------------------------------------------------------------
// Given a normal vector and a light,
// calculate the fragment's color using diffuse and specular lighting.

vec3 phong(vec3 normal, vec3 lightPos, vec3 lightColor) {

  vec3 s = normalize(vec3(lightPos) - vVertex);
  vec3 v = normalize(vec3(-vVertex));
  vec3 r = reflect(-s, normal);

  vec3 ambient = lightColor;
  vec3 diffuse = lightColor * max(dot(s, normal), 0.0);
  vec3 specular = lightColor * pow(max(dot(r, v), 0.0), shininess);

  return uLightIntensity * (ambient + diffuse);

  // vec3 diffuse_color;
  // vec3 to_light;
  // float cos_angle;
  // vec3 color;

  // //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // // General calculations needed for both specular and diffuse lighting

  // // Calculate a vector from the fragment location to the light source
  // to_light = lightPos - vVertex;
  // to_light = normalize( to_light );

  // //- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // // DIFFUSE  calculations

  // // Calculate the cosine of the angle between the vertex's normal
  // // vector and the vector going to the light.
  // cos_angle = dot(fragment_normal, to_light);
  // cos_angle = clamp(cos_angle, 0.0, 1.0);

  // // Scale the color of this fragment based on its angle to the light.
  // diffuse_color = uColor * lightColor * cos_angle * uLightIntensity;

  // // Combine
  // color = diffuse_color;

  // return color;
}

void main(void) {
  float ambient = uLightIntensity;
  vec3 normal = normalize(vNormal);
  vec3 color = vec3(0.);

  // for each light...
  for(int i = 0; i < 2; i++) {
    color += phong(normal, vLightPos[i], uLightColor[i]);
  }

  // Add ambient light intensity
  // color *= ambient;

  // grain
  // Calculate noise and sample texture
  // color.g = light intensity
  float lightValue = color.r;

  // grain
  float mdf = clamp(uNoiseMin, uNoiseMax, pow(lightValue, uNoiseCoef));
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  uv *= 100.; // old 555

  vec3 textureNoise = vec3(snoise2(uv) * 0.5 + .5);
  textureNoise *= mdf;

  gl_FragColor = vec4(textureNoise, 1.);

  if (uAlpha) {
    gl_FragColor.a = 1.0 - gl_FragColor.r;
  }

  // // clamping color values
  // old value 0.3
  gl_FragColor.r = clamp(gl_FragColor.r, uBgColor.r, 1.0);
  gl_FragColor.g = clamp(gl_FragColor.g, uBgColor.g, 1.0);
  gl_FragColor.b = clamp(gl_FragColor.b, uBgColor.b, 1.0);

  // if (gl_FragColor.r < 0.5) {
  //   gl_FragColor.r = 206.0 / 255.0;
  //   gl_FragColor.g = 217.0 / 255.0;
  //   gl_FragColor.b = 255.0 / 255.0;
  // }
  // gl_FragColor = vec4(color, 1.0);

}
