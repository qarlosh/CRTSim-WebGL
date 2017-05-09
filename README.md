# CRTSim-WebGL
This is a port of [CRTSim](https://github.com/MinorKeyGames/CRTSim) to WebGL (GLSL ES). You can see an example [here](https://qarlosh.github.io/CRTSim-WebGL/src/index.html)

The original project is done in C++, Direct3D9 and HLSL. This is a port
to Javascript and WebGL.

[three.js](https://threejs.org) is used for simplifying the code.

Many thanks to J. Kyle Pittman for the original CRT Simulation.

## What is missing

 * No screen grabbing - because of the web environment, I am using a screenshot of Super Mario Bros for NES. I tried an ingame gif capture, but it is not trivial using GIF textures on WebGL... By the way, persistence and bleeding effects are working correctly, but it is not noticeable in a static image.
 * It is not using any mesh. In the original CRTSim, the screen and the border are meshes which provide lighting, reflection, curvature and dimming. By now, this has not been implemented.
 * Slight color mismatch - I suspect it is because cannot use the same exact texture sampling configuration - cannot enable mipmapping on non power of two textures in WebGL.

