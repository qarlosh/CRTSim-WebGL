//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

var evenFrame = true;
var lastms = 0;
var renderer, scene, camera;
var CurrentTexture, CurrentTarget, CurrentSource;

var materials = {
	basicShader: null,
	compositeShader: null,
	screenShader: null
}

var textures = {
	smb: null,
	check: null,
	check2: null,
	artifacts: null,
	mask: null
}

var shaders = {
	vert: {
		basic: null,
		crtbase: null,
		screen: null,
		post: null,
		present: null
	},
	frag: {
		basic: null,
		composite: null,
		crtbase: null,
		screen: null,
		post_upsample: null,
		post_downsample: null,
		present: null
	}
}

var renderTargets = {
	RTT_Composite_Even: null,
	RTT_Composite_Odd: null,
	RTT_Full: null,
	RTT_Downsample: null,
	RTT_Upsample: null
}

var quads = {
	srcQuad: null
}


function preinit() {
	/*
	Wait for shaders loading, and then execute init()
	*/

	var loading = 0;
	
	var load_shader = function(name, type) {
		loading++;
		ajax("../shaders/" + name + "." + type, function(status, data) {
			if (status != 200) throw "error";
			shaders[type][name] = data;
			loading--;
			if (loading == 0) {
				init();
			}
		});
	}

	load_shader("basic", "vert");
	load_shader("crtbase", "vert");
	load_shader("screen", "vert");
	load_shader("post", "vert");
	load_shader("present", "vert");
	load_shader("basic", "frag");
	load_shader("crtbase", "frag");
	load_shader("composite", "frag");
	load_shader("screen", "frag");
	load_shader("post_upsample", "frag");
	load_shader("post_downsample", "frag");
	load_shader("present", "frag");
}


function init() {
	initTextures();
	initMaterials();
	initRenderTargets();
	initScene();
	initRenderer();
	
	render();
}


function initTextures() {
	/*
	Create all the textures
	*/
	var loader = new THREE.TextureLoader();

	textures.check = loader.load('../res/check.bmp');
	textures.check.minFilter = THREE.NearestFilter;
	textures.check.magFilter = THREE.NearestFilter;
	textures.check.wrapS = THREE.ClampToEdgeWrapping;
	textures.check.wrapT = THREE.ClampToEdgeWrapping;
	CurrentTexture = textures.check;

	textures.check2 = loader.load('../res/check-2.bmp');
	textures.check2.minFilter = THREE.NearestFilter;
	textures.check2.magFilter = THREE.NearestFilter;
	textures.check2.wrapS = THREE.ClampToEdgeWrapping;
	textures.check2.wrapT = THREE.ClampToEdgeWrapping;

	textures.smb = loader.load('../res/Super Mario Bros.bmp');
	textures.smb.minFilter = THREE.NearestFilter;
	textures.smb.magFilter = THREE.NearestFilter;
	textures.smb.wrapS = THREE.ClampToEdgeWrapping;
	textures.smb.wrapT = THREE.ClampToEdgeWrapping;

	textures.artifacts = loader.load('../res/artifacts.bmp');
	textures.artifacts.minFilter = THREE.NearestFilter;
	textures.artifacts.magFilter = THREE.NearestFilter;
	textures.artifacts.wrapS = THREE.ClampToEdgeWrapping;
	textures.artifacts.wrapT = THREE.ClampToEdgeWrapping;
	// NOTE: In CRTSim the artifacts texture is WRAP mode, but in WebGL power-of-two size is required for this mode.
	
	textures.mask = loader.load('../res/mask.bmp');
	textures.mask.minFilter = THREE.LinearMipMapLinearFilter;
	textures.mask.magFilter = THREE.LinearFilter;
	textures.mask.wrapS = THREE.RepeatWrapping;
	textures.mask.wrapT = THREE.RepeatWrapping;
}


function initRenderTargets() {
	/*
	Create render targets. Some notes:
	  - In some render targets, minFilter should be LinearMipMapLinearFilter,
	    but it requieres power-of-two size.
	  - In RTT_Composite_Even and RTT_Composite_Odd, wrapping should be CLAMP_TO_BORDER,
	    but it is not supported on OpenGL ES.
	*/
	renderTargets.RTT_Composite_Even = new THREE.WebGLRenderTarget(Parameters.Init_SrcWidth, Parameters.Init_SrcHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBFormat,
			depthBuffer: null,
			stencilBuffer: null
	});
	
	renderTargets.RTT_Composite_Odd = new THREE.WebGLRenderTarget(Parameters.Init_SrcWidth, Parameters.Init_SrcHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBFormat,
			depthBuffer: null,
			stencilBuffer: null
	});

	renderTargets.RTT_Full = new THREE.WebGLRenderTarget(Parameters.Init_DstWidth, Parameters.Init_DstHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBFormat,
			depthBuffer: null,
			stencilBuffer: null
	});
	
	renderTargets.RTT_Downsample = new THREE.WebGLRenderTarget(Parameters.Init_DstWidth / 16, Parameters.Init_DstHeight / 16, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBFormat,
			depthBuffer: null,
			stencilBuffer: null
	});
	
	renderTargets.RTT_Upsample = new THREE.WebGLRenderTarget(Parameters.Init_DstWidth, Parameters.Init_DstHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			format: THREE.RGBFormat,
			depthBuffer: null,
			stencilBuffer: null
	});

}


function initMaterials() {
	/*
	Create the Shader Materials
	*/

	materials.basicShader = new THREE.ShaderMaterial({
		uniforms: {
			sampler:	new THREE.Uniform(null)
		},
		vertexShader: shaders.vert.basic,
		fragmentShader: shaders.frag.basic
	});


	materials.compositeShader = new THREE.ShaderMaterial({
		uniforms: {
			RcpScrWidth:			new THREE.Uniform((new THREE.Vector2()).fromArray([1.0 / Parameters.Init_SrcWidth, 0.0])),
			RcpScrHeight:			new THREE.Uniform((new THREE.Vector2()).fromArray([0.0, 1.0 / Parameters.Init_SrcHeight])),
			Tuning_Sharp:			new THREE.Uniform(Parameters.Tuning_Sharp),
			Tuning_Persistence:		new THREE.Uniform((new THREE.Vector4()).fromArray(Parameters.Tuning_Persistence)),
			Tuning_Bleed:			new THREE.Uniform(Parameters.Tuning_Bleed),
			Tuning_Artifacts:		new THREE.Uniform(Parameters.Tuning_Artifacts),
			curFrameSampler:		new THREE.Uniform(null),
			prevFrameSampler:		new THREE.Uniform(null),
			NTSCArtifactSampler:	new THREE.Uniform(textures.artifacts),
			NTSCLerp:				new THREE.Uniform(0.0)
		},
		vertexShader: shaders.vert.basic,
		fragmentShader: shaders.frag.composite
	});


	var UVScalar =			[1.0, 0.0, 0.0, 0.0];
	var UVOffset =			[0.0, 0.0, 0.0, 0.0];
	var CRTMask_Scale =		[Parameters.Init_SrcWidth * 0.5, Parameters.Init_SrcHeight, 0.0, 0.0];
	var CRTMask_Offset =	[0.0, 0.0, 0.0, 0.0];
	var Ratio_Viewport =	Parameters.Init_DstWidth / Parameters.Init_DstHeight;
	var Ratio_ScreenBuffer = Parameters.Init_SrcWidth / Parameters.Init_SrcHeight;
	var Ratio_DesiredPixel = Parameters.Tuning_PixelRatio;
	UVScalar[1] = (Ratio_ScreenBuffer / Ratio_Viewport) * Ratio_DesiredPixel;
	UVOffset[1] = (1.0 - (((Ratio_ScreenBuffer / Ratio_Viewport) * Ratio_DesiredPixel))) * 0.5;
	materials.screenShader = new THREE.ShaderMaterial({
		uniforms: {
			Tuning_Overscan:		new THREE.Uniform(1.0 / Parameters.Tuning_Overscan),
			Tuning_Dimming:			new THREE.Uniform(Parameters.Tuning_Dimming),
			Tuning_Satur:			new THREE.Uniform(Parameters.Tuning_Satur),
			Tuning_ReflScalar:		new THREE.Uniform(Parameters.Tuning_ReflScalar),
			Tuning_Barrel:			new THREE.Uniform(Parameters.Tuning_Barrel),
			Tuning_Mask_Brightness:	new THREE.Uniform(Parameters.Tuning_Mask_Brightness),
			Tuning_Mask_Opacity:	new THREE.Uniform(Parameters.Tuning_Mask_Opacity),
			Tuning_Diff_Brightness:	new THREE.Uniform(Parameters.Tuning_Diff_Brightness),
			Tuning_Spec_Brightness:	new THREE.Uniform(Parameters.Tuning_Spec_Brightness),
			Tuning_Spec_Power:		new THREE.Uniform(Parameters.Tuning_Spec_Power),
			Tuning_Fres_Brightness:	new THREE.Uniform(Parameters.Tuning_Fres_Brightness),
			Tuning_LightPos:		new THREE.Uniform((new THREE.Vector4()).fromArray(Parameters.Tuning_LightPos)),
			UVScalar:				new THREE.Uniform((new THREE.Vector4()).fromArray(UVScalar)),
			UVOffset:				new THREE.Uniform((new THREE.Vector4()).fromArray(UVOffset)),
			CRTMask_Scale:			new THREE.Uniform((new THREE.Vector4()).fromArray(CRTMask_Scale)),
			CRTMask_Offset:			new THREE.Uniform((new THREE.Vector4()).fromArray(CRTMask_Offset)),
			compFrameSampler:		new THREE.Uniform(null),
			shadowMaskSampler:		new THREE.Uniform(textures.mask)
		},
		vertexShader: shaders.vert.crtbase + "\r\n" + shaders.vert.screen,
		fragmentShader: shaders.frag.crtbase + "\r\n" + shaders.frag.screen
	});


	var InvAspectRatio = Parameters.Init_DstHeight / Parameters.Init_DstWidth;
	
	var BloomScaleVec4 = [InvAspectRatio * Parameters.Tuning_Bloom_Downsample_Spread, Parameters.Tuning_Bloom_Downsample_Spread, 0.0, 0.0];
	materials.postDownsampleShader = new THREE.ShaderMaterial({
		uniforms: {
			PreBloomBufferSampler:	new THREE.Uniform(null),
			BloomScale:				new THREE.Uniform((new THREE.Vector4()).fromArray(BloomScaleVec4))
		},
		vertexShader: shaders.vert.post,
		fragmentShader: shaders.frag.post_downsample
	});

	var BloomScaleVec4 = [InvAspectRatio * Parameters.Tuning_Bloom_Upsample_Spread, Parameters.Tuning_Bloom_Upsample_Spread, 0.0, 0.0];
	materials.postUpsampleShader = new THREE.ShaderMaterial({
		uniforms: {
			DownsampleBufferSampler: new THREE.Uniform(null),
			BloomScale:				 new THREE.Uniform((new THREE.Vector4()).fromArray(BloomScaleVec4))
		},
		vertexShader: shaders.vert.post,
		fragmentShader: shaders.frag.post_upsample
	});


	materials.presentShader = new THREE.ShaderMaterial({
		uniforms: {
			PreBloomBufferSampler:	new THREE.Uniform(null),
			UpsampledBufferSampler: new THREE.Uniform(null),
			BloomScalar:			new THREE.Uniform(Parameters.Tuning_Bloom_Intensity),
			BloomPower:				new THREE.Uniform(Parameters.Tuning_Bloom_Power)
		},
		vertexShader: shaders.vert.present,
		fragmentShader: shaders.frag.present
	});
	
}


function initScene() {
	/*
	Create the Scene, Camera and Quad mesh
	*/
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	plane = new THREE.PlaneGeometry(2, 2);
	quads.srcQuad = new THREE.Mesh(plane);
	scene.add(quads.srcQuad);
}


function initRenderer() {
	/*
	Create the Renderer
	*/
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(Parameters.Init_DstWidth, Parameters.Init_DstHeight);
	document.body.appendChild(renderer.domElement);

	renderer.domElement.style.imageRendering = 'pixelated';
}


function render() {
	/*
	Rendering loop
	*/

	requestAnimationFrame(render);

	//	Animation
	/*var ms = new Date().getTime() % 1000;
	var change_image = Boolean(ms < lastms);
	lastms = ms;
	if (change_image) {
		CurrentTexture = (CurrentTexture == textures.check) ? textures.check2 : textures.check;
	}*/
	CurrentTexture = textures.smb;

	// Set up this frame to sample from the previous frame's composite image and draw to the other one.
	if (evenFrame) {
		CurrentTarget = renderTargets.RTT_Composite_Even;
		CurrentSource = renderTargets.RTT_Composite_Odd;
	} else {
		CurrentTarget = renderTargets.RTT_Composite_Odd;
		CurrentSource = renderTargets.RTT_Composite_Even;
	}
	
	// Step 1. Build the composite image.
	materials.compositeShader.uniforms.curFrameSampler.value = CurrentTexture;
	materials.compositeShader.uniforms.prevFrameSampler.value = CurrentSource.texture;
	materials.compositeShader.uniforms.NTSCLerp.value = evenFrame ? 0.0 : 1.0;
	quads.srcQuad.material = materials.compositeShader;
	renderer.render(scene, camera, CurrentTarget);

	// Step 2A. Draw the screen mesh.
	materials.screenShader.uniforms.compFrameSampler.value = CurrentTarget.texture;
	quads.srcQuad.material = materials.screenShader;
	renderer.render(scene, camera, renderTargets.RTT_Full);

	// Step 3. Downsample and blur the image of the screen and frame.
	materials.postDownsampleShader.uniforms.PreBloomBufferSampler.value = renderTargets.RTT_Full.texture;
	quads.srcQuad.material = materials.postDownsampleShader;
	renderer.render(scene, camera, renderTargets.RTT_Downsample);
	
	// Step 4. Upsample and blur the downsampled/blurred image.
	materials.postUpsampleShader.uniforms.DownsampleBufferSampler.value = renderTargets.RTT_Downsample.texture;
	quads.srcQuad.material = materials.postUpsampleShader;
	renderer.render(scene, camera, renderTargets.RTT_Upsample);

	// Step 5. Blend the original and blurred images to produce bloom.
	materials.presentShader.uniforms.PreBloomBufferSampler.value = renderTargets.RTT_Full.texture;
	materials.presentShader.uniforms.UpsampledBufferSampler.value = renderTargets.RTT_Upsample.texture;
	quads.srcQuad.material = materials.presentShader;
	renderer.render(scene, camera, null);

	evenFrame = !evenFrame;
}


preinit();
