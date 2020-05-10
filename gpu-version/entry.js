import * as THREE from '../node_modules/three/build/three.module.js';
import Stats from '../node_modules/stats.js/src/Stats.js'
import simulationFragShader from './glsl/simulationFrag.glsl';
import simulationVertShader from './glsl/simulationVert.glsl';
import displayFragShader from './glsl/displayFrag.glsl';
import displayVertShader from './glsl/displayVert.glsl';
import passthroughVertShader from './glsl/passthroughVert.glsl';
import passthroughFragShader from './glsl/passthroughFrag.glsl';

let containerSize = {
  // width: window.innerWidth,
  // height: window.innerHeight

  width: 900,
  height: 900
};

let container;                                                 // the DOM element that ThreeJS loads into
let camera, scene, renderer, displayMesh;                      // ThreeJS basics needed to show stuff on the screen
let simulationUniforms, displayUniforms, passthroughUniforms;  // uniforms are constants that get passed into shaders
let simulationMaterial, displayMaterial, passthroughMaterial;  // materials associate uniforms to vert/frag shaders
let renderTargets, currentRenderTargetIndex = 0;               // render targets are invisible meshes that allow shaders to generate textures for computation, not display
const pingPongSteps = 128;                                     // number of times per frame that the simulation is run before being displayed
let isPaused = false;

// FPS counter via Stats.js
let stats = new Stats();
document.body.appendChild(stats.dom);

setupEnvironment();
setupUniforms();
setupMaterials();
setupRenderTargets();
setupInitialTexture();
render();

//==============================================================
//  RENDER
//==============================================================
function render(timestamp) {
  if(!isPaused) {
    stats.begin();

    // Activate the simulation shaders
    displayMesh.material = simulationMaterial;

    // Run the simulation multiple times by feeding the result of one iteration (a render target's texture) into the next render target
    for(let i=0; i<pingPongSteps; i++) {
      var nextRenderTargetIndex = currentRenderTargetIndex === 0 ? 1 : 0;

      simulationUniforms.previousIterationTexture.value = renderTargets[currentRenderTargetIndex].texture;  // grab the result of the last iteration
      renderer.setRenderTarget(renderTargets[nextRenderTargetIndex]);                                       // prepare to render into the next render target
      renderer.render(scene, camera);                                                                       // run the simulation shader on that texture
      simulationUniforms.previousIterationTexture.value = renderTargets[nextRenderTargetIndex].texture;     // save the result of this simulation step for use in the next step
      displayUniforms.textureToDisplay.value = renderTargets[nextRenderTargetIndex].texture;                // pass this result to the display material too
      displayUniforms.previousIterationTexture.value = renderTargets[currentRenderTargetIndex].texture;     // pass the previous iteration result too for history-based rendering effects

      currentRenderTargetIndex = nextRenderTargetIndex;
    }

    // Activate the display shaders
    displayMesh.material = displayMaterial;

    // Render the latest iteration to the screen
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);

    stats.end();

    requestAnimationFrame(render);   // kick off the next iteration
  }
}

//==============================================================
//  UNIFORMS
//==============================================================
function setupUniforms() {
  setupSimulationUniforms();
  setupDisplayUniforms();
  setupPassthroughUniforms();
}

  function setupSimulationUniforms() {
    simulationUniforms = {
      previousIterationTexture: {
        type: "t",
        value: undefined
      },
      resolution: {
        type: "v2",
        value: new THREE.Vector2(containerSize.width, containerSize.height)
      },

      // Reaction-diffusion equation parameters
      f: {   // feed rate
        type: "f",
        value: 0.054
      },
      k: {   // kill rate
        type: "f",
        value: 0.062
      },
      dA: {  // diffusion rate for chemical A
        type: "f",
        value: 0.2097
      },
      dB: {  // diffusion rate for chemical B
        type: "f",
        value: 0.105
      },
      timestep: {
        type: "f",
        value: 1.0
      }
    };
  }

  function setupDisplayUniforms() {
    displayUniforms = {
      textureToDisplay: {
        value: null
      },
      previousIterationTexture: {
        value: null
      }
    };
  }

  function setupPassthroughUniforms() {
    passthroughUniforms = {
      textureToDisplay: {
        value: null
      }
    };
  }

//==============================================================
//  MATERIALS
//==============================================================
function setupMaterials() {
  /**
  Create the simulation material
  - This material takes a texture full of data (assumed to be
    the previous iteration result), then applies the reaction-
    diffusion equation to each pixel.
  */
  simulationMaterial = new THREE.ShaderMaterial({
    uniforms: simulationUniforms,
    vertexShader: simulationVertShader,
    fragmentShader: simulationFragShader,
  });
  simulationMaterial.blending = THREE.NoBlending;

  /**
  Create the display material
  - This material reads the data encoded in the texture
    generated by the simulation material's fragment shader
    and converts it into meaningful color data to show on
    the screen.
  */
  displayMaterial = new THREE.ShaderMaterial({
    uniforms: displayUniforms,
    vertexShader: displayVertShader,
    fragmentShader: displayFragShader,
  });
  displayMaterial.blending = THREE.NoBlending;

  /**
  Create the passthrough material
  - This material just displays a texture without any
    modifications or processing. Used when creating
    the initial texture.
  */
  passthroughMaterial = new THREE.ShaderMaterial({
    uniforms: passthroughUniforms,
    vertexShader: passthroughVertShader,
    fragmentShader: passthroughFragShader,
  });
  passthroughMaterial.blending = THREE.NoBlending;
}

//==============================================================
//  RENDER TARGETS
//==============================================================
function setupRenderTargets() {
  renderTargets = [];

  // Create two render targets so we can "ping pong" between them and run multiple iterations per frame
  for(let i=0; i<2; i++) {
    let nextRenderTarget = new THREE.WebGLRenderTarget(containerSize.width, containerSize.height, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      type: THREE.FloatType,
      wrapS: THREE.RepeatWrapping,
      wrapT: THREE.RepeatWrapping
    });

    // Enable texture wrapping
    // - Referencing a texture coordinate that is out-of-bounds will automatically make it wrap!
    nextRenderTarget.texture.name = `render texture ${i}`;

    renderTargets.push(nextRenderTarget);
  }
}

//==============================================================
//  ENVIRONMENT (scene, camera, display mesh, etc)
//==============================================================
function setupEnvironment() {
  // Set up the camera and scene
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  scene = new THREE.Scene();

  // Create a plane and orient it perpendicular to the camera so it seems 2D
  displayMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(2,2), displayMaterial);
  scene.add(displayMesh);

  // Set up the renderer (a WebGL context inside a <canvas>)
  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
  renderer.setSize(containerSize.width, containerSize.height);

  // Uncomment this line to see how many shader varyings your GPU supports.
  // console.log(renderer.capabilities.maxVaryings);

  // Grab the container DOM element and inject the <canvas> element generated by the renderer
  container = document.getElementById('container');
  container.appendChild(renderer.domElement);

  // Update the renderer dimensions whenever the browser is resized
  window.addEventListener('resize', resetTextureSizes, false);
}

  function resetTextureSizes() {
    renderer.setSize(containerSize.width, containerSize.height);
  }

//==============================================================
//  INITIAL TEXTURE
//==============================================================
function setupInitialTexture() {
  // Build a texture and fill it with a pattern of pixels
  let pixels = getCirclePixels(window.innerWidth, window.innerHeight/2, 100);
  let texture = new THREE.DataTexture(pixels, containerSize.width, containerSize.height, THREE.RGBAFormat, THREE.FloatType);
  texture.needsUpdate = true;

  // Pass the DataTexture to the passthrough material
  passthroughUniforms.textureToDisplay.value = texture;

  // Activate the passthrough material
  displayMesh.material = passthroughMaterial;

  // Render the DataTexture into both of the render targets
  for(let i=0; i<2; i++) {
    renderer.setRenderTarget(renderTargets[i]);
    renderer.render(scene, camera);
  }

  // Switch back to the display material and pass along the initial rendered texture
  displayUniforms.textureToDisplay.value = renderTargets[0].texture;
  displayUniforms.previousIterationTexture.value = renderTargets[0].texture;
  displayMesh.material = displayMaterial;

  // Set the render target back to the default display buffer and render the first frame
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

  // Add a circle of chemical B on top of a default pixel buffer
  function getCirclePixels(centerX, centerY, radius) {
    let pixels = getDefaultPixels();

    for(let x = -radius; x < radius; x++) {
      for(let y = -radius; y < radius; y++) {
        if(x*x + y*y < radius*radius) {
          const index = ((centerX + x) + (centerY + y) * containerSize.width) * 4;
          pixels[index + 1] = 0.4;  // B
        }
      }
    }

    return pixels;
  }

  // Create a "blank slate" pixel buffer
  function getDefaultPixels() {
    let pixels = new Float32Array(containerSize.width * containerSize.height * 4);
    let i = 0;

    for(let col = 0; col < containerSize.width; col++) {
      for(let row = 0; row < containerSize.height; row++) {
        pixels[i]     = 0.9;  // A
        pixels[i + 1] = 0.0;  // B
        pixels[i + 2] = 0.0;
        pixels[i + 3] = 0.0;  // alpha (unused)

        i += 4;
      }
    }

    return pixels;
  }

//==============================================================
//  KEYBOARD CONTROLS
//==============================================================
window.addEventListener('keyup', function(e) {
  if(e.key == ' ') {
    isPaused = !isPaused;

    if(!isPaused) {
      render();
    }
  }
});