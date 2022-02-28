uniform vec3 uLightPos[2];

varying vec3 vNormal;
varying vec3 vSurfaceToLight[2];

void main(void) {
  vNormal = normalize(normalMatrix * normal);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  // General calculations needed for diffuse lighting
  vec3 surfaceToLightDirection = vec3( modelViewMatrix * vec4(position, 1.0));
  // Calculate a vector from the fragment location for each light source
  vec3 worldLightPos1 = vec3( viewMatrix * vec4(uLightPos[0], 1.0));
  vSurfaceToLight[0] = normalize(worldLightPos1 - surfaceToLightDirection);
  vec3 worldLightPos2 = vec3( viewMatrix * vec4(uLightPos[1], 1.0));
  vSurfaceToLight[1] = normalize(worldLightPos2 - surfaceToLightDirection);
}
