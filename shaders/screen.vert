//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec3 vNorm;
varying vec3 vCamDir;
varying vec3 vLightDir;

void main(void) {

	vColor = vec4(1.0, 1.0, 1.0, 1.0);
	vNorm = vec3(1.0, 0.0, 0.0);
	vCamDir = vec3(1.0, 0.0, 0.0);
	vLightDir = vec3(1.0, 0.0, 0.0);

	vTextureCoord = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
