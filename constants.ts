
import { ParticleParams } from './types';

// Default parameters, matching user's initial setup where possible
export const INITIAL_PARTICLE_PARAMS: ParticleParams = {
  particleCount: 75000,
  speed: 0.05,
  directionY: 0.1,
  directionX: 0.0,
  particleSize: 2.5,
  resolution: 1.5,
  opacityFalloff: 1.5,
  mouseInteraction: true,

  // Default Particle Colors
  particleColor1: '#66ccff', // Light Blue
  particleColor2: '#cc99ff', // Lavender
  particleHighlightColor: '#ffee99', // Pale Yellow

  // Default Nebula Colors
  nebulaColor1: '#001133', // Deep Dark Blue
  nebulaColor2: '#0d0025', // Dark Purple
  nebulaAccent1: '#223366', // Muted Blue
  nebulaAccent2: '#302255', // Muted Purple/Indigo

  // New Nebula Shape & Motion Defaults
  nebulaOctaves: 6,
  nebulaScale: 1.0,
  nebulaSpeed: 0.015,
  nebulaBrightness: 1.0,
  nebulaColorMixFactor1: 4.0,
  nebulaDynamicShiftIntensity: 0.03,

  // Audio Reactivity Defaults
  audioReactivityEnabled: false,
  audioSensitivity: 0.5,
};

export const PARTICLE_RANGE = 1500;
const MAX_NEBULA_OCTAVES = 10; // Max octaves for shader loop
export const MAX_AUDIO_VISUAL_EFFECT_STRENGTH = 2.5; // Multiplier for audio influence in shader

export const BACKGROUND_VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const BACKGROUND_FRAGMENT_SHADER = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  varying vec2 vUv;

  // Nebula Color Uniforms
  uniform vec3 u_nebulaBaseCol1;
  uniform vec3 u_nebulaBaseCol2;
  uniform vec3 u_nebulaAccentCol1;
  uniform vec3 u_nebulaAccentCol2;

  // New Nebula Shape & Motion Uniforms
  uniform int u_nebulaOctaves;
  uniform float u_nebulaScale;
  uniform float u_nebulaSpeed;
  uniform float u_nebulaBrightness;
  uniform float u_nebulaColorMixFactor1;
  uniform float u_nebulaDynamicShiftIntensity;


  float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123); }
  float noise(vec2 st) {
      vec2 i = floor(st); vec2 f = fract(st);
      float a = random(i); float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.y * u.x;
  }
  float fbm(vec2 st) {
      float value = 0.0; float amplitude = 0.5;
      // Loop with break for WebGL compatibility with dynamic octaves
      for (int i = 0; i < ${MAX_NEBULA_OCTAVES}; i++) {
          if (i >= u_nebulaOctaves) break;
          value += amplitude * noise(st);
          st *= 2.0; amplitude *= 0.5;
      }
      return value;
  }

  void main() {
      vec2 st = vUv * u_nebulaScale; // Apply nebula scale
      st.x *= u_resolution.x / u_resolution.y; // Aspect correction
      
      // Nebula motion patterns using u_nebulaSpeed
      vec2 q = vec2(fbm(st + u_time * u_nebulaSpeed), fbm(st + vec2(1.0) + u_time * u_nebulaSpeed * 0.75));
      vec2 r = vec2(fbm(st + q + u_time * u_nebulaSpeed * 0.5), fbm(st + q + vec2(1.0) + u_time * u_nebulaSpeed * 0.25));
      float f = fbm(st + r);

      // Apply subtle time-based shifts to user-defined colors, scaled by u_nebulaDynamicShiftIntensity
      float timePhase = u_time * 0.03; // Base speed for color shifting
      vec3 shiftVec1 = vec3(sin(timePhase), cos(timePhase * 0.7), sin(timePhase * 1.2)) * u_nebulaDynamicShiftIntensity;
      vec3 shiftVec2 = vec3(cos(timePhase * 0.8), sin(timePhase * 0.5), cos(timePhase)) * u_nebulaDynamicShiftIntensity;
      vec3 shiftVec3 = vec3(sin(timePhase * 1.1), cos(timePhase * 0.6), sin(timePhase * 0.9)) * u_nebulaDynamicShiftIntensity;
      vec3 shiftVec4 = vec3(cos(timePhase * 0.4), sin(timePhase * 1.3), cos(timePhase * 0.75)) * u_nebulaDynamicShiftIntensity;

      vec3 finalBaseCol1 = u_nebulaBaseCol1 + shiftVec1;
      vec3 finalBaseCol2 = u_nebulaBaseCol2 + shiftVec2;
      vec3 finalAccentCol1 = u_nebulaAccentCol1 + shiftVec3;
      vec3 finalAccentCol2 = u_nebulaAccentCol2 + shiftVec4;

      // Color mixing using u_nebulaColorMixFactor1
      vec3 color = mix(finalBaseCol1, finalBaseCol2, clamp((f * f) * u_nebulaColorMixFactor1, 0.0, 1.0));
      color = mix(color, finalAccentCol1, clamp(length(q), 0.0, 1.0));
      color = mix(color, finalAccentCol2, clamp(length(r.x), 0.0, 1.0));
      color *= (f * f * f + 0.6 * f * f + 0.5 * f);

      // Apply overall brightness
      color *= u_nebulaBrightness;

      gl_FragColor = vec4(color, 1.0);
  }
`;

export const PARTICLE_VERTEX_SHADER = `
  uniform float uParticleSizeBase; // For dynamic particle size
  uniform float uAudioInfluence;   // Normalized audio influence (0-1)

  attribute float depth;
  attribute vec3 colorAttrib; // Particle color attribute
  attribute float twinkleOffsetAttrib; // For per-particle twinkle phase

  varying float vDepth;
  varying vec3 vColor;
  varying float vTwinkleOffset;

  void main() {
    vDepth = depth;
    vColor = colorAttrib;
    vTwinkleOffset = twinkleOffsetAttrib;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    // mvPosition.z is usually negative, so -mvPosition.z is positive. Clamp to avoid division by zero or very small numbers.
    float audioReactiveSizeFactor = 1.0 + uAudioInfluence * ${MAX_AUDIO_VISUAL_EFFECT_STRENGTH.toFixed(1)};
    gl_PointSize = uParticleSizeBase * audioReactiveSizeFactor * (300.0 / max(0.001, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const PARTICLE_FRAGMENT_SHADER = `
  uniform sampler2D pointTexture;
  uniform float opacityFalloff;
  uniform float u_time; // Time uniform for twinkling

  varying float vDepth;
  varying vec3 vColor;
  varying float vTwinkleOffset; // Received from vertex shader

  void main() {
    vec4 texColor = texture2D(pointTexture, gl_PointCoord);
    if (texColor.a < 0.1) discard; // Discard fully transparent pixels early

    // Clamp vDepth to ensure it's within [0, 1] for pow function
    float clampedDepth = clamp(vDepth, 0.0, 1.0);
    float finalOpacity = pow(clampedDepth, opacityFalloff);

    // Twinkling effect
    // sin(u_time * speed + phase) gives a value from -1 to 1. Map to 0-1.
    // Then scale to desired min/max visibility.
    float twinkleFactor = (sin(u_time * 2.5 + vTwinkleOffset) + 1.0) * 0.5; // Varies between 0 and 1
    twinkleFactor = 0.5 + twinkleFactor * 0.5; // Modulate twinkle (e.g., always at least 50% visible, twinkles up to 100%)
    
    gl_FragColor = vec4(vColor, texColor.a * finalOpacity * twinkleFactor);
  }
`;