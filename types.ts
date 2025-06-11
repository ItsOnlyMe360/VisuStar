
export interface ParticleParams {
  particleCount: number;
  speed: number;
  directionY: number;
  directionX: number;
  particleSize: number;
  resolution: number;
  opacityFalloff: number;
  mouseInteraction: boolean;

  // Particle Colors
  particleColor1: string; // hex string
  particleColor2: string; // hex string
  particleHighlightColor: string; // hex string

  // Nebula Colors
  nebulaColor1: string; // hex string
  nebulaColor2: string; // hex string
  nebulaAccent1: string; // hex string
  nebulaAccent2: string; // hex string

  // New Nebula Shape & Motion Parameters
  nebulaOctaves: number; // Integer: FBM layers
  nebulaScale: number; // Float: Noise zoom level
  nebulaSpeed: number; // Float: Animation speed of clouds
  nebulaBrightness: number; // Float: Overall brightness multiplier
  nebulaColorMixFactor1: number; // Float: Sharpness of base color mix
  nebulaDynamicShiftIntensity: number; // Float: Magnitude of time-based color shifts

  // Audio Reactivity
  audioReactivityEnabled: boolean;
  audioSensitivity: number; // Float: 0 to 1, scales audio effect
}

// Used by the hook, includes a trigger for regeneration
export interface UpdatableParticleParams extends ParticleParams {
  triggerRegenerate: number; 
}