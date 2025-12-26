
import React, { useState } from 'react';
import FireEngine from './components/FireEngine';
import Controls from './components/Controls';
import { EngineSettings } from './types';

const App: React.FC = () => {
  const [settings, setSettings] = useState<EngineSettings>({
    text: 'IGNITE',
    fontSize: 180,
    particleCount: 6000,
    intensity: 1.2,
    windStrength: 1.5,
    colorTheme: 'classic'
  });

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden select-none">
      {/* Visual background layers */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-orange-500/5 to-transparent z-1" />
      
      {/* The Core Engine */}
      <FireEngine settings={settings} />

      {/* Decorative UI Overlay */}
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <h1 className="text-white/20 font-black text-4xl tracking-tighter">IGNITE.</h1>
        <p className="text-white/10 text-xs tracking-[0.2em] font-medium uppercase mt-1">Particle Fire Engine v2.0</p>
      </div>

      <div className="absolute top-8 right-8 z-20 pointer-events-none flex items-center gap-4">
        <div className="text-right">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest">System Status</p>
          <p className="text-green-500/40 text-[10px] font-mono">60 FPS // STABLE</p>
        </div>
        <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center">
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
        </div>
      </div>

      {/* Interactive Controls */}
      <Controls settings={settings} setSettings={setSettings} />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.9)] z-5" />
    </div>
  );
};

export default App;
