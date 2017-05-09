//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

// Blends the original full-resolution scene with the blurred output of post.fx to create bloom.

precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D PreBloomBufferSampler;
uniform sampler2D UpsampledBufferSampler;

uniform float BloomScalar;
uniform float BloomPower;

// Apply power to brightness while preserving color
// TODO: Clamp ActLuma to very small number to prevent (zero) division by zero when a component is zero?
vec4 ColorPow(vec4 InColor, float InPower)
{
	// This method preserves color better.
	vec4 RefLuma = vec4(0.299, 0.587, 0.114, 0.0);
	float ActLuma = dot(InColor, RefLuma);
	vec4 ActColor = InColor / ActLuma;
	float PowLuma = pow(ActLuma, InPower);
	vec4 PowColor = ActColor * PowLuma;
	return PowColor;
}

struct vsPresentPassOut
{
	vec4 pos;
	vec2 uv;
};

vec4 PresentPassPixelShader(vsPresentPassOut frag)
{
	vec4 PreBloom = texture2D(PreBloomBufferSampler, frag.uv);
	vec4 Blurred = texture2D(UpsampledBufferSampler, frag.uv);
	
	return PreBloom + (ColorPow(Blurred, BloomPower) * BloomScalar);
}


void main(void) {
	//	Initialization
	vsPresentPassOut presentpassout;

	//presentpassout.pos
	presentpassout.uv = vTextureCoord;
	gl_FragColor = PresentPassPixelShader(presentpassout);
}