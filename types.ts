
export interface Vector2 {
  x: number;
  y: number;
}

export interface EngineSettings {
  text: string;
  fontSize: number;
  particleCount: number;
  intensity: number;
  windStrength: number;
  colorTheme: 'classic' | 'phantom' | 'emerald';
}

export interface ParticleState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  originX: number;
  originY: number;
}
