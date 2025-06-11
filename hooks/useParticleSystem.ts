
import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { UpdatableParticleParams } from '../types';
import {
  BACKGROUND_VERTEX_SHADER,
  BACKGROUND_FRAGMENT_SHADER,
  PARTICLE_VERTEX_SHADER,
  PARTICLE_FRAGMENT_SHADER,
  PARTICLE_RANGE
} from '../constants';

interface UseParticleSystemProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  params: UpdatableParticleParams;
}

export const useParticleSystem = ({ canvasRef, params }: UseParticleSystemProps) => {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const backgroundMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  
  const particlesGroupRef = useRef<THREE.Points | null>(null);
  const particleGeometryRef = useRef<THREE.BufferGeometry | null>(null);
  const particleMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const clockRef = useRef(new THREE.Clock());
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  
  const particleTextureRef = useRef<THREE.Texture | null>(null);

  // Audio Reactivity Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioDataArrayRef = useRef<Uint8Array | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null); // Changed name for clarity (was audioStreamRef)


  const createParticleTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return new THREE.Texture(); 

    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }, []);
  

  const createOrUpdateParticles = useCallback(() => {
    if (!sceneRef.current) return;

    if (particlesGroupRef.current) {
      sceneRef.current.remove(particlesGroupRef.current);
      particleGeometryRef.current?.dispose();
    }
    
    if (!particleTextureRef.current) {
        particleTextureRef.current = createParticleTexture();
    }

    particleGeometryRef.current = new THREE.BufferGeometry();
    const positions = new Float32Array(params.particleCount * 3);
    const depths = new Float32Array(params.particleCount);
    const colors = new Float32Array(params.particleCount * 3);
    const twinkleOffsets = new Float32Array(params.particleCount);
    
    const particleColor = new THREE.Color();
    const primaryColor = new THREE.Color(params.particleColor1);
    const secondaryColor = new THREE.Color(params.particleColor2);
    const highlightColor = new THREE.Color(params.particleHighlightColor);

    for (let i = 0; i < params.particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() * 2 - 1) * PARTICLE_RANGE;
      positions[i3 + 1] = (Math.random() * 2 - 1) * PARTICLE_RANGE;
      positions[i3 + 2] = (Math.random() * 2 - 1) * PARTICLE_RANGE;
      depths[i] = (positions[i3 + 2] + PARTICLE_RANGE) / (2 * PARTICLE_RANGE);
      
      twinkleOffsets[i] = Math.random() * Math.PI * 2; 

      let chosenBaseColor: THREE.Color;
      const randomChoice = Math.random();
      if (randomChoice < 0.05) { 
          chosenBaseColor = highlightColor;
      } else if (randomChoice < 0.40) { 
          chosenBaseColor = secondaryColor;
      } else { 
          chosenBaseColor = primaryColor;
      }

      const hsl = { h: 0, s: 0, l: 0 };
      chosenBaseColor.getHSL(hsl);
      
      particleColor.setHSL(
          hsl.h + (Math.random() - 0.5) * 0.05, 
          Math.max(0, Math.min(1, hsl.s * (0.7 + Math.random() * 0.5))), 
          Math.max(0, Math.min(1, hsl.l * (0.6 + Math.random() * 0.7)))  
      );
      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }

    particleGeometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometryRef.current.setAttribute('depth', new THREE.BufferAttribute(depths, 1));
    particleGeometryRef.current.setAttribute('colorAttrib', new THREE.BufferAttribute(colors, 3));
    particleGeometryRef.current.setAttribute('twinkleOffsetAttrib', new THREE.BufferAttribute(twinkleOffsets, 1));

    if (!particleMaterialRef.current) {
        particleMaterialRef.current = new THREE.ShaderMaterial({
            uniforms: {
              pointTexture: { value: particleTextureRef.current },
              opacityFalloff: { value: params.opacityFalloff },
              uParticleSizeBase: { value: params.particleSize },
              u_time: { value: 0.0 },
              uAudioInfluence: { value: 0.0 },
            },
            vertexShader: PARTICLE_VERTEX_SHADER,
            fragmentShader: PARTICLE_FRAGMENT_SHADER,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
        });
    } else {
        if (particleMaterialRef.current.uniforms.opacityFalloff) {
            particleMaterialRef.current.uniforms.opacityFalloff.value = params.opacityFalloff;
        }
        if (particleMaterialRef.current.uniforms.uParticleSizeBase) {
            particleMaterialRef.current.uniforms.uParticleSizeBase.value = params.particleSize;
        }
    }
    
    particlesGroupRef.current = new THREE.Points(particleGeometryRef.current, particleMaterialRef.current);
    sceneRef.current.add(particlesGroupRef.current);

  }, [params.particleCount, params.opacityFalloff, params.particleSize, 
      params.particleColor1, params.particleColor2, params.particleHighlightColor, 
      createParticleTexture]);

  useEffect(() => {
    const setupAudio = async () => {
      if (params.audioReactivityEnabled) {
        try {
          // Request to capture display (screen/tab/window) including audio
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: true, // Request video to get the screen sharing prompt
            audio: true  // Request audio along with it
          });
          mediaStreamRef.current = stream;

          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            audioContextRef.current = new window.AudioContext();
            const source = audioContextRef.current.createMediaStreamSource(stream); // Use the full stream
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);
            audioDataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
            console.log("Audio setup successful using getDisplayMedia. Visualizing shared audio.");

            // Optional: Listen for when the user stops sharing via browser UI
            audioTracks[0].onended = () => {
              console.log("Audio track ended (user stopped sharing).");
              // Consider disabling audio reactivity here if desired, e.g., by calling onParamChange
              // For now, it will just stop receiving data.
            };

          } else {
            console.warn("Audio track not shared or unavailable from getDisplayMedia. Audio reactivity will not work.");
            // Stop all tracks if audio wasn't successfully captured
            stream.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
          }
        } catch (err) {
          console.error('Error setting up audio via getDisplayMedia:', err);
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
          }
        }
      }
    };

    const teardownAudio = () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(e => console.error("Error closing audio context:", e));
        audioContextRef.current = null;
      }
      analyserRef.current = null;
      audioDataArrayRef.current = null;
      console.log("Audio teardown complete.");
    };

    if (params.audioReactivityEnabled) {
      setupAudio();
    } else {
      teardownAudio();
    }

    return () => {
      teardownAudio();
    };
  }, [params.audioReactivityEnabled]);


  useEffect(() => {
    if (!canvasRef.current) return;

    sceneRef.current = new THREE.Scene();
    cameraRef.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 100, 3000);
    cameraRef.current.position.z = 500;

    rendererRef.current = new THREE.WebGLRenderer({ canvas: canvasRef.current, antialias: true });
    rendererRef.current.setPixelRatio(params.resolution);
    rendererRef.current.setSize(window.innerWidth, window.innerHeight);

    const backgroundGeometry = new THREE.PlaneGeometry(2, 2);
    backgroundMaterialRef.current = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0.0 },
        u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        u_nebulaBaseCol1: { value: new THREE.Color(params.nebulaColor1) },
        u_nebulaBaseCol2: { value: new THREE.Color(params.nebulaColor2) },
        u_nebulaAccentCol1: { value: new THREE.Color(params.nebulaAccent1) },
        u_nebulaAccentCol2: { value: new THREE.Color(params.nebulaAccent2) },
        u_nebulaOctaves: { value: params.nebulaOctaves },
        u_nebulaScale: { value: params.nebulaScale },
        u_nebulaSpeed: { value: params.nebulaSpeed },
        u_nebulaBrightness: { value: params.nebulaBrightness },
        u_nebulaColorMixFactor1: { value: params.nebulaColorMixFactor1 },
        u_nebulaDynamicShiftIntensity: { value: params.nebulaDynamicShiftIntensity },
      },
      vertexShader: BACKGROUND_VERTEX_SHADER,
      fragmentShader: BACKGROUND_FRAGMENT_SHADER,
      depthWrite: false,
    });
    const backgroundMesh = new THREE.Mesh(backgroundGeometry, backgroundMaterialRef.current);
    backgroundMesh.renderOrder = -1; 
    sceneRef.current.add(backgroundMesh);
    
    if (!particleTextureRef.current) { 
        particleTextureRef.current = createParticleTexture();
    }
    createOrUpdateParticles(); 

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && backgroundMaterialRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
        if (backgroundMaterialRef.current.uniforms.u_resolution) { 
            backgroundMaterialRef.current.uniforms.u_resolution.value.set(width, height);
        }
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouseX.current = (event.clientX - window.innerWidth / 2) / 4;
      mouseY.current = (event.clientY - window.innerHeight / 2) / 4;
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (!sceneRef.current || !cameraRef.current || !rendererRef.current || !backgroundMaterialRef.current || !particlesGroupRef.current || !particleGeometryRef.current || !particleMaterialRef.current) return;

      const elapsedTime = clockRef.current.getElapsedTime();
      
      if (backgroundMaterialRef.current.uniforms.u_time) { 
        backgroundMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }
      
      if (particleMaterialRef.current.uniforms.u_time) {
        particleMaterialRef.current.uniforms.u_time.value = elapsedTime;
      }

      if (params.audioReactivityEnabled && analyserRef.current && audioDataArrayRef.current && particleMaterialRef.current.uniforms.uAudioInfluence) {
        analyserRef.current.getByteFrequencyData(audioDataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < audioDataArrayRef.current.length; i++) {
          sum += audioDataArrayRef.current[i];
        }
        const average = sum / audioDataArrayRef.current.length;
        const normalizedAverage = average / 255; 
        particleMaterialRef.current.uniforms.uAudioInfluence.value = normalizedAverage * params.audioSensitivity;
      } else if (particleMaterialRef.current.uniforms.uAudioInfluence) {
         particleMaterialRef.current.uniforms.uAudioInfluence.value = 0.0;
      }


      if (params.mouseInteraction) {
        cameraRef.current.position.x += (mouseX.current - cameraRef.current.position.x) * 0.02;
        cameraRef.current.position.y += (-mouseY.current - cameraRef.current.position.y) * 0.02;
      }
      cameraRef.current.lookAt(sceneRef.current.position);

      const positions = particleGeometryRef.current.attributes.position.array as Float32Array;
      const depths = particleGeometryRef.current.attributes.depth.array as Float32Array;

      for (let i = 0; i < params.particleCount; i++) { 
        const i3 = i * 3;
        positions[i3 + 1] += params.directionY * params.speed; 
        positions[i3] += params.directionX * params.speed;

        if (positions[i3 + 1] > PARTICLE_RANGE) positions[i3 + 1] = -PARTICLE_RANGE;
        if (positions[i3 + 1] < -PARTICLE_RANGE) positions[i3 + 1] = PARTICLE_RANGE;
        if (positions[i3] > PARTICLE_RANGE) positions[i3] = -PARTICLE_RANGE;
        if (positions[i3] < -PARTICLE_RANGE) positions[i3] = PARTICLE_RANGE;
        
        depths[i] = (positions[i3 + 2] + PARTICLE_RANGE) / (2 * PARTICLE_RANGE);
      }
      particleGeometryRef.current.attributes.position.needsUpdate = true;
      particleGeometryRef.current.attributes.depth.needsUpdate = true;
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      rendererRef.current?.dispose();
      backgroundMaterialRef.current?.dispose();
      particleGeometryRef.current?.dispose();
      particleMaterialRef.current?.dispose();
      particleTextureRef.current?.dispose();
      if (sceneRef.current && particlesGroupRef.current) {
         sceneRef.current.remove(particlesGroupRef.current);
      }
    };
  }, [
      canvasRef, createParticleTexture, params.resolution, 
      params.nebulaColor1, params.nebulaColor2, params.nebulaAccent1, params.nebulaAccent2,
      params.nebulaOctaves, params.nebulaScale, params.nebulaSpeed, params.nebulaBrightness,
      params.nebulaColorMixFactor1, params.nebulaDynamicShiftIntensity,
      params.speed, params.directionX, params.directionY, params.mouseInteraction, params.particleCount,
  ]);


  useEffect(() => {
    if (sceneRef.current) { 
        createOrUpdateParticles();
    }
  }, [params.particleCount, params.triggerRegenerate, createOrUpdateParticles]);


  useEffect(() => {
    if (rendererRef.current && rendererRef.current.getPixelRatio() !== params.resolution) {
      rendererRef.current.setPixelRatio(params.resolution);
    }

    if (particleMaterialRef.current && particleMaterialRef.current.uniforms) {
      if (particleMaterialRef.current.uniforms.opacityFalloff) {
        particleMaterialRef.current.uniforms.opacityFalloff.value = params.opacityFalloff;
      }
      if (particleMaterialRef.current.uniforms.uParticleSizeBase) {
        particleMaterialRef.current.uniforms.uParticleSizeBase.value = params.particleSize;
      }
    }

    if (backgroundMaterialRef.current && backgroundMaterialRef.current.uniforms) {
      if (backgroundMaterialRef.current.uniforms.u_nebulaBaseCol1) {
        backgroundMaterialRef.current.uniforms.u_nebulaBaseCol1.value.set(params.nebulaColor1);
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaBaseCol2) {
        backgroundMaterialRef.current.uniforms.u_nebulaBaseCol2.value.set(params.nebulaColor2);
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaAccentCol1) {
        backgroundMaterialRef.current.uniforms.u_nebulaAccentCol1.value.set(params.nebulaAccent1);
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaAccentCol2) {
        backgroundMaterialRef.current.uniforms.u_nebulaAccentCol2.value.set(params.nebulaAccent2);
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaOctaves) {
        backgroundMaterialRef.current.uniforms.u_nebulaOctaves.value = params.nebulaOctaves;
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaScale) {
        backgroundMaterialRef.current.uniforms.u_nebulaScale.value = params.nebulaScale;
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaSpeed) {
        backgroundMaterialRef.current.uniforms.u_nebulaSpeed.value = params.nebulaSpeed;
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaBrightness) {
        backgroundMaterialRef.current.uniforms.u_nebulaBrightness.value = params.nebulaBrightness;
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaColorMixFactor1) {
        backgroundMaterialRef.current.uniforms.u_nebulaColorMixFactor1.value = params.nebulaColorMixFactor1;
      }
      if (backgroundMaterialRef.current.uniforms.u_nebulaDynamicShiftIntensity) {
        backgroundMaterialRef.current.uniforms.u_nebulaDynamicShiftIntensity.value = params.nebulaDynamicShiftIntensity;
      }
    }
  }, [params.resolution, params.opacityFalloff, params.particleSize,
      params.nebulaColor1, params.nebulaColor2, params.nebulaAccent1, params.nebulaAccent2,
      params.nebulaOctaves, params.nebulaScale, params.nebulaSpeed, params.nebulaBrightness,
      params.nebulaColorMixFactor1, params.nebulaDynamicShiftIntensity
    ]);

};
