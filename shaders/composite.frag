//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

// This is the second step of the CRT simulation process,
// after the ntsc.fx shader has transformed the RGB values with a lookup table.
// This is where we apply effects "inside the screen," including spatial and temporal bleeding,
// an unsharp mask to simulate overshoot/undershoot, NTSC artifacts, and so on.

precision mediump float;

varying vec2 vTextureCoord;

uniform vec2 RcpScrWidth;
uniform vec2 RcpScrHeight;

uniform float Tuning_Sharp;				// typically [0,1], defines the weighting of the sharpness taps
uniform vec4 Tuning_Persistence;		// typically [0,1] per channel, defines the total blending of previous frame values
uniform float Tuning_Bleed;				// typically [0,1], defines the blending of L/R values with center value from prevous frame
uniform float Tuning_Artifacts;			// typically [0,1], defines the weighting of NTSC scanline artifacts (not physically accurate by any means)

// These are render target textures at the game scene resolution (256x224)
// representing the current scene prior to any compositing and the previous frame after compositing.
// Once we process this frame, we'll swap these and the final image will become our next frame's "previous."
uniform sampler2D curFrameSampler;
uniform sampler2D prevFrameSampler;

uniform sampler2D NTSCArtifactSampler;		// This is a texture map containing diagonal stripes of red, green, and blue, used to simulate chroma overlap between pixels as described in the slides.
uniform float NTSCLerp;		// Defines an interpolation between the two NTSC filter states. Typically would be 0 or 1 for vsynced 60 fps gameplay or 0.5 for unsynced, but can be whatever.

// Weight for applying an unsharp mask at a distance of 1, 2, or 3 pixels from changes in luma.
// The sign of each weight changes in order to alternately simulate overshooting and undershooting.
float SharpWeight[3];

// Calculate luma for an RGB value.
float Brightness(vec4 InVal)
{
	return dot(InVal, vec4(0.299, 0.587, 0.114, 0.0));
}

vec4 compositePixelShader(vec2 frag)
{
	vec4 NTSCArtifact1 = texture2D(NTSCArtifactSampler, frag.xy);
	vec4 NTSCArtifact2 = texture2D(NTSCArtifactSampler, frag.xy - RcpScrHeight);
	vec4 NTSCArtifact = mix(NTSCArtifact1, NTSCArtifact2, NTSCLerp);
				
	vec2 LeftUV = frag.xy - RcpScrWidth;
	vec2 RightUV = frag.xy + RcpScrWidth;
	
	vec4 Cur_Left = texture2D(curFrameSampler, LeftUV);
	vec4 Cur_Local = texture2D(curFrameSampler, frag.xy);
	vec4 Cur_Right = texture2D(curFrameSampler, RightUV);
	
	vec4 TunedNTSC = NTSCArtifact * Tuning_Artifacts;
	
	// Note: The "persistence" and "bleed" parameters have some overlap, but they are not redundant.
	// "Persistence" affects bleeding AND trails. (Scales the sum of the previous value and its scaled neighbors.)
	// "Bleed" only affects bleeding. (Scaling of neighboring previous values.)

	vec4 Prev_Left = texture2D(prevFrameSampler, LeftUV);
	vec4 Prev_Local = texture2D(prevFrameSampler, frag.xy);
	vec4 Prev_Right = texture2D(prevFrameSampler, RightUV);
	
	// Apply NTSC artifacts based on differences in luma between local pixel and neighbors..
	Cur_Local =
		clamp(Cur_Local +
		(((Cur_Left - Cur_Local) + (Cur_Right - Cur_Local)) * TunedNTSC), 0.0, 1.0);
	
	float curBrt = Brightness(Cur_Local);
	float offset = 0.0;
	
	// Step left and right looking for changes in luma that would produce a ring or halo on this pixel due to undershooting/overshooting.
	// (Note: It would probably be more accurate to look at changes in luma between pixels at a distance of N and N+1,
	// as opposed to 0 and N as done here, but this works pretty well and is a little cheaper.)
	for (int i = 0; i < 3; ++i)
	{
		vec2 StepSize = (vec2(1.0/256.0,0.0) * (float(i) + 1.0));
		vec4 neighborleft = texture2D(curFrameSampler, frag.xy - StepSize);
		vec4 neighborright = texture2D(curFrameSampler, frag.xy + StepSize);
		
		float NBrtL = Brightness(neighborleft);
		float NBrtR = Brightness(neighborright);
		offset += ((((curBrt - NBrtL) + (curBrt - NBrtR))) * SharpWeight[i]);
	}	

	// Apply the NTSC artifacts to the unsharp offset as well.
	Cur_Local = clamp(Cur_Local + (offset * Tuning_Sharp * mix(vec4(1,1,1,1), NTSCArtifact, Tuning_Artifacts)), 0.0, 1.0);

	// Take the max here because adding is overkill; bleeding should only brighten up dark areas, not blow out the whole screen.
	Cur_Local = clamp(max(Cur_Local, Tuning_Persistence * (1.0 / (1.0 + (2.0 * Tuning_Bleed))) * (Prev_Local + ((Prev_Left + Prev_Right) * Tuning_Bleed))), 0.0, 1.0);

	return Cur_Local;
}


void main(void) {
	/*	NOTE: Cannot construct a const array with GLSL ES 2.0 / WebGL 1.0),
		so initialize it here in main()
	*/
	SharpWeight[0] = 1.0;
	SharpWeight[1] = -0.3162277;
	SharpWeight[2] = 0.1;

	gl_FragColor = compositePixelShader(vTextureCoord);
}