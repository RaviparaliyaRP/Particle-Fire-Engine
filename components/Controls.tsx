
import React, { useState } from 'react';
import { EngineSettings } from '../types';
import { ChevronDown, ChevronUp, Settings2, Flame, Wind, Maximize2 } from 'lucide-react';

interface ControlsProps {
  settings: EngineSettings;
  setSettings: (settings: EngineSettings) => void;
}

const Controls: React.FC<ControlsProps> = ({ settings, setSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateSetting = <K extends keyof EngineSettings>(key: K, value: EngineSettings[K]) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-lg px-4 transition-all duration-300">
      <div className={`bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden ${isExpanded ? 'p-6' : 'p-3'}`}>
        
        {/* Main Input Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              type="text"
              value={settings.text}
              onChange={(e) => updateSetting('text', e.target.value)}
              placeholder="Type to ignite..."
              className="w-full bg-black/40 border border-white/5 group-hover:border-orange-500/50 focus:border-orange-500 rounded-xl px-4 py-3 text-white placeholder-white/30 outline-none transition-all text-lg font-medium"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-orange-500/50 group-focus-within:text-orange-500">
               <Flame size={20} className="animate-pulse" />
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/5 text-white/70"
          >
            {isExpanded ? <ChevronDown size={20} /> : <Settings2 size={20} />}
          </button>
        </div>

        {/* Expanded Controls */}
        {isExpanded && (
          <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Color Themes */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1 h-1 bg-orange-500 rounded-full" /> Engine Core
              </label>
              <div className="flex gap-2">
                {(['classic', 'phantom', 'emerald'] as const).map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('colorTheme', theme)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      settings.colorTheme === theme 
                        ? 'bg-orange-500/20 border-orange-500/50 text-orange-400' 
                        : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Flame size={14} className="text-orange-500" /> Intensity
                  </label>
                  <span className="text-[10px] font-mono text-orange-500">{Math.round(settings.intensity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.intensity}
                  onChange={(e) => updateSetting('intensity', parseFloat(e.target.value))}
                  className="w-full accent-orange-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Wind size={14} className="text-blue-400" /> Wind
                  </label>
                   <span className="text-[10px] font-mono text-blue-400">{Math.round(settings.windStrength * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={settings.windStrength}
                  onChange={(e) => updateSetting('windStrength', parseFloat(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>

               <div className="space-y-3">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Maximize2 size={14} className="text-purple-400" /> Font Size
                  </label>
                   <span className="text-[10px] font-mono text-purple-400">{settings.fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="300"
                  step="1"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>

            <p className="text-[10px] text-center text-white/20 italic pt-2 border-t border-white/5">
              Interact with the screen to push the flames.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
