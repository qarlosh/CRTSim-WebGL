//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

// code used for upsampling the full-resolution output image.

precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D DownsampleBufferSampler;		// The downsampled and blurred image.

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

vec4 postProcessUpsamplePixelShader(vsPostProcessOut frag)
{
	// Swap X and Y for this one to reduce artifacts in sampling.
	
	vec4 bloom = vec4(0,0,0,0);
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson0.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson1.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson2.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson3.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson4.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson5.yx * BloomScale));
	bloom += texture2D(DownsampleBufferSampler, frag.uv + (Poisson6.yx * BloomScale));
	bloom *= InvNumSamples;
	return bloom;
}


void main(void) {
	//	Initialization
	vsPostProcessOut postprocessout;

	//postprocessout.pos
	postprocessout.uv = vTextureCoord;
	gl_FragColor = postProcessUpsamplePixelShader(postprocessout);
}