precision highp float;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 normalMatrix;

uniform vec3 uLightPos[3];

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vNormal;
varying vec3 vVertex;
varying vec3 vLightPos[3];
varying vec2 vUv;

void main(void) {
  vVertex = vec3( modelViewMatrix * vec4(position, 1.0));
  vUv = uv;
  vNormal = normalMatrix * normal;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vLightPos[0] = vec3( viewMatrix * vec4(uLightPos[0], 1.0));
  vLightPos[1] = vec3( viewMatrix * vec4(uLightPos[1], 1.0));
  vLightPos[2] = vec3( viewMatrix * vec4(uLightPos[2], 1.0));
}
