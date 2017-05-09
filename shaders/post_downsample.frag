//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

// code used for downsampling the full-resolution output image.

precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D PreBloomBufferSampler;			// The original full-resolution image before bloom or any other effects have been added.

// The distance the bloom blur spreads.
// Includes aspect ratio compensation.
uniform vec2 BloomScale;

vec2 Poisson0 = vec2(0.000000, 0.000000);
vec2 Poisson1 = vec2(0.000000, 1.000000);
vec2 Poisson2 = vec2(0.000000, -1.000000);
vec2 Poisson3 = vec2(-0.866025, 0.500000);
vec2 Poisson4 = vec2(-0.866025, -0.500000);
vec2 Poisson5 = vec2(0.866025, 0.500000);
vec2 Poisson6 = vec2(0.866025, -0.500000);

float InvNumSamples = 1.0 / 7.0;

struct vsPostProcessOut
{
	vec4 pos;
	vec2 uv;
};

vec4 postProcessDownsamplePixelShader(vsPostProcessOut frag)
{
	vec4 bloom = vec4(0,0,0,0);
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson0 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson1 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson2 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson3 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson4 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson5 * BloomScale));
	bloom += texture2D(PreBloomBufferSampler, frag.uv + (Poisson6 * BloomScale));
	bloom *= InvNumSamples;
	return bloom;
}


void main(void) {
	//	Initialization
	vsPostProcessOut postprocessout;

	//postprocessout.pos
	postprocessout.uv = vTextureCoord;
	gl_FragColor = postProcessDownsamplePixelShader(postprocessout);
}