//////////////////////////////////////////////////////////////////////////
//
// CC0 1.0 Universal (CC0 1.0)
// Public Domain Dedication 
//
//////////////////////////////////////////////////////////////////////////

var Parameters = {};										//	WORKING	DEFAULT
															//	-------	------------------------
Parameters.Init_SrcWidth = 256;								//	OK		256
Parameters.Init_SrcHeight = 224;							//	OK		224
Parameters.Init_DstWidth = 1600;							//	OK		1600
Parameters.Init_DstHeight = 900;							//	OK		900

Parameters.Tuning_Sharp = 0.8;								//	OK		0.8
Parameters.Tuning_Persistence = [0.7, 0.525, 0.42, 0.0];	//	OK		0.7, 0.525, 0.42, 0.0
Parameters.Tuning_Bleed = 0.5;								//	OK		0.5
Parameters.Tuning_Artifacts = 0.5;							//	OK		0.5

Parameters.Tuning_PixelRatio = 8.0/7.0;						//	OK		8.0 / 7.0
Parameters.Tuning_Overscan = 0.7;							//	OK		1.0
Parameters.Tuning_Dimming = 0.5;							//			0.5
Parameters.Tuning_Satur = 1.35;								//	OK		1.35
Parameters.Tuning_ReflScalar = 0.0;							//			0.3
Parameters.Tuning_Barrel = 0.115;							//	OK		-0.115
Parameters.Tuning_Mask_Brightness = 0.45;					//	OK		0.45
Parameters.Tuning_Mask_Opacity = 1.0;						//	OK		1.0

Parameters.Tuning_Diff_Brightness = 0.0;					//			0.5
Parameters.Tuning_Spec_Brightness = 0.0;					//			0.35
Parameters.Tuning_Spec_Power = 0.0;							//			50.0
Parameters.Tuning_Fres_Brightness = 0.0;					//			1.0
Parameters.Tuning_LightPos = [-10.0, -5.0, 10.0, 0.0];		//			-10.0, -5.0, 10.0, 0.0
Parameters.Tuning_FrameColor = [0.06, 0.06, 0.06, 1.0];		//			0.06, 0.06, 0.06, 1.0

Parameters.Tuning_Bloom_Downsample_Spread = 0.025;			//	OK		0.025
Parameters.Tuning_Bloom_Upsample_Spread = 0.025;			//	OK		0.025
Parameters.Tuning_Bloom_Intensity = 0.25;					//	OK		0.25
Parameters.Tuning_Bloom_Power = 2.0;						//	OK		2.0
