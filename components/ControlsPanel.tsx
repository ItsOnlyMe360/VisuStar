
import React from 'react';
import { ParticleParams } from '../types';

interface ControlsPanelProps {
  params: ParticleParams;
  onParamChange: <K extends keyof ParticleParams>(param: K, value: ParticleParams[K]) => void;
  onRegenerate: () => void;
  onToggleVisibility: () => void;
}

interface RangeInputProps {
  id: keyof ParticleParams;
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
}

const RangeInput: React.FC<RangeInputProps> = ({ id, label, min, max, step, value, unit, onChange }) => (
  <div className="mb-4">
    <label htmlFor={id as string} className="block text-sm font-medium text-gray-300 mb-1">
      {label}: <span className="font-semibold text-blue-300">{value.toFixed(step < 1 ? (id === 'nebulaSpeed' || id === 'audioSensitivity' ? 3 : 2) : 0)}{unit}</span>
    </label>
    <input
      type="range"
      id={id as string}
      name={id as string}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-colors"
    />
  </div>
);

interface ColorInputProps {
  id: keyof ParticleParams;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const ColorInput: React.FC<ColorInputProps> = ({ id, label, value, onChange }) => (
  <div className="mb-3">
    <label htmlFor={id as string} className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <div className="flex items-center space-x-2">
      <input
        type="color"
        id={id as string}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 p-0.5 border-none rounded-md cursor-pointer bg-gray-700"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-md text-sm text-gray-200 focus:ring-blue-500 focus:border-blue-500"
        aria-label={`${label} hex code`}
      />
    </div>
  </div>
);


interface ControlGroupProps {
  title: string;
  children: React.ReactNode;
}

const ControlGroup: React.FC<ControlGroupProps> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-blue-300 border-b border-gray-600 pb-2 mb-3">{title}</h3>
    {children}
  </div>
);


export const ControlsPanel: React.FC<ControlsPanelProps> = ({ params, onParamChange, onRegenerate, onToggleVisibility }) => {
  return (
    <div className="fixed top-0 left-0 h-full w-80 bg-slate-800/90 backdrop-blur-md text-white p-5 shadow-2xl z-50 custom-scrollbar overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-200">Controls</h2>
        <button 
          onClick={onToggleVisibility} 
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-slate-700"
          title="Hide Controls (Press H)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <ControlGroup title="Appearance">
        <RangeInput id="resolution" label="Resolution" min={0.1} max={3} step={0.1} value={params.resolution} onChange={(v) => onParamChange('resolution', v)} />
        <RangeInput id="opacityFalloff" label="Opacity Falloff" min={0.1} max={5} step={0.1} value={params.opacityFalloff} onChange={(v) => onParamChange('opacityFalloff', v)} />
        <RangeInput id="particleSize" label="Particle Size" min={0.1} max={400} step={0.1} value={params.particleSize} onChange={(v) => onParamChange('particleSize', v)} />
      </ControlGroup>

      <ControlGroup title="Movement">
        <RangeInput id="speed" label="Speed" min={0} max={10} step={0.005} value={params.speed} onChange={(v) => onParamChange('speed', v)} />
        <RangeInput id="directionY" label="Vertical Dir." min={-1} max={1} step={0.05} value={params.directionY} onChange={(v) => onParamChange('directionY', v)} />
        <RangeInput id="directionX" label="Horizontal Dir." min={-1} max={1} step={0.05} value={params.directionX} onChange={(v) => onParamChange('directionX', v)} />
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="mouseInteraction" className="text-sm font-medium text-gray-300">
            Mouse Interaction
          </label>
          <button
            id="mouseInteraction"
            onClick={() => onParamChange('mouseInteraction', !params.mouseInteraction)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              params.mouseInteraction 
                ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {params.mouseInteraction ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </ControlGroup>
      
      <ControlGroup title="Nebula Shape & Motion">
        <RangeInput id="nebulaOctaves" label="Nebula Octaves" min={1} max={10} step={1} value={params.nebulaOctaves} onChange={(v) => onParamChange('nebulaOctaves', v)} />
        <RangeInput id="nebulaScale" label="Nebula Scale" min={0.1} max={5} step={0.1} value={params.nebulaScale} onChange={(v) => onParamChange('nebulaScale', v)} />
        <RangeInput id="nebulaSpeed" label="Nebula Speed" min={0.001} max={0.05} step={0.001} value={params.nebulaSpeed} onChange={(v) => onParamChange('nebulaSpeed', v)} />
        <RangeInput id="nebulaBrightness" label="Nebula Brightness" min={0.1} max={2.5} step={0.05} value={params.nebulaBrightness} onChange={(v) => onParamChange('nebulaBrightness', v)} />
        <RangeInput id="nebulaColorMixFactor1" label="Nebula Base Color Mix" min={0.1} max={10} step={0.1} value={params.nebulaColorMixFactor1} onChange={(v) => onParamChange('nebulaColorMixFactor1', v)} />
        <RangeInput id="nebulaDynamicShiftIntensity" label="Nebula Color Shift Intensity" min={0} max={0.1} step={0.005} value={params.nebulaDynamicShiftIntensity} onChange={(v) => onParamChange('nebulaDynamicShiftIntensity', v)} />
      </ControlGroup>

      <ControlGroup title="Color Customization">
        <h4 className="text-md font-medium text-gray-200 mb-2">Particle Colors</h4>
        <ColorInput id="particleColor1" label="Primary Color" value={params.particleColor1} onChange={(v) => onParamChange('particleColor1', v)} />
        <ColorInput id="particleColor2" label="Secondary Color" value={params.particleColor2} onChange={(v) => onParamChange('particleColor2', v)} />
        <ColorInput id="particleHighlightColor" label="Highlight Color" value={params.particleHighlightColor} onChange={(v) => onParamChange('particleHighlightColor', v)} />
        
        <h4 className="text-md font-medium text-gray-200 mt-4 mb-2">Nebula Background Colors</h4>
        <ColorInput id="nebulaColor1" label="Base Color 1" value={params.nebulaColor1} onChange={(v) => onParamChange('nebulaColor1', v)} />
        <ColorInput id="nebulaColor2" label="Base Color 2" value={params.nebulaColor2} onChange={(v) => onParamChange('nebulaColor2', v)} />
        <ColorInput id="nebulaAccent1" label="Accent Color 1" value={params.nebulaAccent1} onChange={(v) => onParamChange('nebulaAccent1', v)} />
        <ColorInput id="nebulaAccent2" label="Accent Color 2" value={params.nebulaAccent2} onChange={(v) => onParamChange('nebulaAccent2', v)} />
      </ControlGroup>

      <ControlGroup title="Audio Reactivity">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="audioReactivityEnabled" className="text-sm font-medium text-gray-300">
            Enable Audio Reactivity
          </label>
          <button
            id="audioReactivityEnabled"
            onClick={() => onParamChange('audioReactivityEnabled', !params.audioReactivityEnabled)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              params.audioReactivityEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-600 hover:bg-gray-500 text-gray-300'
            }`}
          >
            {params.audioReactivityEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        {params.audioReactivityEnabled && (
          <RangeInput 
            id="audioSensitivity" 
            label="Audio Sensitivity" 
            min={0.01} max={10.0} step={0.01} 
            value={params.audioSensitivity} 
            onChange={(v) => onParamChange('audioSensitivity', v)} 
          />
        )}
      </ControlGroup>

      <ControlGroup title="General Configuration">
        <RangeInput id="particleCount" label="Particle Count" min={1000} max={200000} step={1000} value={params.particleCount} onChange={(v) => onParamChange('particleCount', v)} />
        <button
          onClick={onRegenerate}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-lg"
        >
          Recreate Universe
        </button>
      </ControlGroup>
      <p className="text-xs text-gray-400 mt-6 text-center">Press 'H' to toggle this panel.</p>
    </div>
  );
};
