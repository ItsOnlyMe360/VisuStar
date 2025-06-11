
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { INITIAL_PARTICLE_PARAMS } from './constants';
import { ParticleParams, UpdatableParticleParams } from './types';
import { ControlsPanel } from './components/ControlsPanel';
import { useParticleSystem } from './hooks/useParticleSystem';

const SettingsIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.646.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 1.905c-.007.379.137.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.333.184-.582.496-.646.87l-.212 1.282c-.09.542-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.645-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.759 6.759 0 0 1 0-1.905c.007-.379-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.184.582-.496.645-.87l.212-1.282Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const App: React.FC = () => {
  const [params, setParams] = useState<ParticleParams>(INITIAL_PARTICLE_PARAMS);
  const [triggerRegenerate, setTriggerRegenerate] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettingsIcon, setShowSettingsIcon] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const updatableParams: UpdatableParticleParams = {
    ...params,
    triggerRegenerate,
  };

  useParticleSystem({ canvasRef, params: updatableParams });

  const handleParamChange = useCallback(<K extends keyof ParticleParams,>(paramKey: K, value: ParticleParams[K]) => {
    setParams(prevParams => ({ ...prevParams, [paramKey]: value }));
  }, []);

  const handleRegenerate = useCallback(() => {
    setTriggerRegenerate(prev => prev + 1);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'h') {
        setShowControls(prev => !prev);
      } else if (key === 'l') {
        setShowSettingsIcon(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden antialiased">
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
      
      {showControls && (
        <ControlsPanel
          params={params}
          onParamChange={handleParamChange}
          onRegenerate={handleRegenerate}
          onToggleVisibility={() => setShowControls(false)}
        />
      )}

      {!showControls && showSettingsIcon && (
         <button
           onClick={() => setShowControls(true)}
           className="fixed top-4 right-4 bg-slate-700/80 hover:bg-slate-600/90 text-white p-3 rounded-full shadow-xl z-50 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
           aria-label="Show Controls (Press H or L to toggle this button)"
           title="Show Controls (Press H or L to toggle this button)"
         >
           <SettingsIcon />
         </button>
       )}
    </div>
  );
};

export default App;