//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

// Common code shared by the screen and frame effects.
// Provides a function for sampling into the "in-CRT" composite image with "in-world" effects applied.

uniform vec2 UVScalar;
uniform vec2 UVOffset;

uniform vec2 CRTMask_Scale;
uniform vec2 CRTMask_Offset;

uniform float Tuning_Overscan;
uniform float Tuning_Dimming;
uniform float Tuning_Satur;
uniform float Tuning_ReflScalar;
uniform float Tuning_Barrel;
uniform float Tuning_Mask_Brightness;
uniform float Tuning_Mask_Opacity;
uniform float Tuning_Diff_Brightness;
uniform float Tuning_Spec_Brightness;
uniform float Tuning_Spec_Power;
uniform float Tuning_Fres_Brightness;
uniform vec3 Tuning_LightPos;

uniform sampler2D compFrameSampler;
uniform sampler2D shadowMaskSampler;

vec4 texture2D_blackborder(sampler2D sampler, vec2 uv)
{
	if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
		return vec4(0.0, 0.0, 0.0, 1.0);
	}

	return texture2D(sampler, uv);
}

vec4 SampleCRT(vec2 uv)
{
	vec2 ScaledUV = uv;
	ScaledUV *= UVScalar;
	ScaledUV += UVOffset;
	
	vec2 scanuv = (ScaledUV - vec2(0.0, 1.0)*UVScalar) * CRTMask_Scale;
	vec3 scantex = texture2D(shadowMaskSampler, scanuv).rgb;

	scantex += Tuning_Mask_Brightness;			// adding looks better
	scantex = mix(vec3(1.0,1.0,1.0), scantex, Tuning_Mask_Opacity);

	// Apply overscan after scanline sampling is done.
	vec2 overscanuv = (ScaledUV * Tuning_Overscan) - ((Tuning_Overscan - 1.0) * 0.5);
	
	// Curve UVs for composite texture inwards to garble things a bit.
	overscanuv = overscanuv - vec2(0.5,0.5);
	float rsq = (overscanuv.x*overscanuv.x) + (overscanuv.y*overscanuv.y);
	overscanuv = overscanuv + (overscanuv * (Tuning_Barrel * rsq)) + vec2(0.5,0.5);

	vec3 comptex = texture2D_blackborder(compFrameSampler, overscanuv).rgb;

	vec4 emissive = vec4(comptex * scantex, 1.0);
	float desat = dot(vec4(0.299, 0.587, 0.114, 0.0), emissive);
	emissive = mix(vec4(desat,desat,desat,1.0), emissive, Tuning_Satur);

	return emissive;
}
