//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

precision mediump float;

varying vec2 vTextureCoord;
varying vec4 vColor;
varying vec3 vNorm;
varying vec3 vCamDir;
varying vec3 vLightDir;

struct vsScreenOut
{
	vec4 pos;
	vec4 color;
	vec2 uv;
	vec3 norm;
	vec3 camDir;
	vec3 lightDir;
};

vec4 screenPixelShader(vsScreenOut screenout)
{
	vec3 norm = normalize(screenout.norm);
	
	vec3 camDir = normalize(screenout.camDir);
	vec3 lightDir = normalize(screenout.lightDir);
	
	vec3 refl = reflect(camDir, screenout.norm);

	float diffuse = saturate(dot(norm, lightDir));
	vec4 colordiff = vec4(0.175, 0.15, 0.2, 1) * diffuse * Tuning_Diff_Brightness;
	
	vec3 halfVec = normalize(lightDir + camDir);
	float spec = saturate(dot(norm, halfVec));
	spec = pow(spec, Tuning_Spec_Power);
	vec4 colorspec = vec4(0.25, 0.25, 0.25, 1) * spec * Tuning_Spec_Brightness;
	
	float fres = 1.0 - dot(camDir, norm);
	fres = (fres*fres) * Tuning_Fres_Brightness;
	vec4 colorfres = vec4(0.45, 0.4, 0.5, 1.0) * fres;
	
	vec4 emissive = SampleCRT(screenout.uv);
	
	vec4 nearfinal = colorfres + colordiff + colorspec + emissive;

	return (nearfinal * mix(vec4(1.0,1.0,1.0,1.0), screenout.color, Tuning_Dimming));
}

vec4 screenPixelShader_bypass(vsScreenOut screenout)
{
	return texture2D(compFrameSampler, screenout.uv);
}

void main(void) {
	//	Initialization
	vsScreenOut screenout;

	//screenout.pos;
	screenout.color = vColor;
	screenout.uv = vTextureCoord;
	screenout.norm = vNorm;//xxx
	screenout.camDir = vCamDir;//xxx
	screenout.lightDir = vLightDir;//xxx
	gl_FragColor = screenPixelShader(screenout);
}