
import React, { useEffect, useRef, useMemo } from 'react';
import { EngineSettings, Vector2, ParticleState } from '../types';
import { SimplexNoise } from '../utils/noise';

interface FireEngineProps {
  settings: EngineSettings;
}

const FireEngine: React.FC<FireEngineProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ParticleState[]>([]);
  const mouseRef = useRef<Vector2>({ x: -1000, y: -1000 });
  const spawnPointsRef = useRef<Vector2[]>([]);
  const noise = useMemo(() => new SimplexNoise(), []);
  const animationFrameId = useRef<number>(0);

  // Initialize offscreen canvas for text sampling
  useEffect(() => {
    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const canvas = offscreenCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const updateTextLayout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const responsiveFontSize = Math.min(settings.fontSize, w / (settings.text.length * 0.6));
      ctx.font = `bold ${responsiveFontSize}px "Inter", "Segoe UI", sans-serif`;
      ctx.fillText(settings.text, w / 2, h / 2);

      const imageData = ctx.getImageData(0, 0, w, h).data;
      const points: Vector2[] = [];
      const step = 4; // Sample every 4th pixel for performance

      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < w; x += step) {
          const index = (y * w + x) * 4;
          if (imageData[index] > 128) {
            points.push({ x, y });
          }
        }
      }
      spawnPointsRef.current = points;
      
      // Reset particles when text changes
      initParticles(points);
    };

    const initParticles = (points: Vector2[]) => {
      const count = settings.particleCount;
      const newParticles: ParticleState[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push(createParticle(points));
      }
      particlesRef.current = newParticles;
    };

    const createParticle = (points: Vector2[]): ParticleState => {
      const point = points.length > 0 
        ? points[Math.floor(Math.random() * points.length)] 
        : { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      return {
        x: point.x + (Math.random() - 0.5) * 10,
        y: point.y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 2 - 1,
        life: 0,
        maxLife: Math.random() * 60 + 20,
        size: Math.random() * 4 + 1,
        originX: point.x,
        originY: point.y
      };
    };

    updateTextLayout();
    window.addEventListener('resize', updateTextLayout);
    return () => window.removeEventListener('resize', updateTextLayout);
  }, [settings.text, settings.fontSize, settings.particleCount]);

  // Main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const animate = (time: number) => {
      const w = canvas.width = window.innerWidth;
      const h = canvas.height = window.innerHeight;

      // Clear with slight trail for motion blur? No, pure black for fire contrast.
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';

      const particles = particlesRef.current;
      const spawnPoints = spawnPointsRef.current;
      const mouse = mouseRef.current;
      const noiseScale = 0.01;
      const timeScale = time * 0.002;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          // Reset particle to a random spawn point
          const point = spawnPoints.length > 0 
            ? spawnPoints[Math.floor(Math.random() * spawnPoints.length)] 
            : { x: w / 2, y: h / 2 };
          
          p.x = point.x + (Math.random() - 0.5) * 5;
          p.y = point.y + (Math.random() - 0.5) * 5;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -Math.random() * 1.5 - 0.5;
          p.life = 0;
          p.maxLife = Math.random() * 60 + 20;
          p.size = Math.random() * 4 + 1;
          p.originX = point.x;
          p.originY = point.y;
        }

        // Apply Physics
        // 1. Upward force
        p.vy -= 0.05 * settings.intensity;
        
        // 2. Simplex Noise (Wind/Flicker)
        const n = noise.noise2D(p.x * noiseScale, (p.y * noiseScale) + timeScale);
        p.vx += n * 0.15;

        // 3. Mouse Interaction (Wind)
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          p.vx += (dx / dist) * force * 2 * settings.windStrength;
          p.vy += (dy / dist) * force * 2 * settings.windStrength;
        }

        // Update Position
        p.x += p.vx;
        p.y += p.vy;

        // Draw Particle
        const lifeRatio = p.life / p.maxLife;
        const currentSize = p.size * (1 - lifeRatio);
        
        // Color transition logic
        let r, g, b, a;
        if (settings.colorTheme === 'phantom') {
          // Blue Flame (Ghostly)
          if (lifeRatio < 0.2) { [r, g, b] = [255, 255, 255]; }
          else if (lifeRatio < 0.4) { [r, g, b] = [100, 200, 255]; }
          else if (lifeRatio < 0.7) { [r, g, b] = [0, 50, 255]; }
          else { [r, g, b] = [40, 0, 80]; }
        } else if (settings.colorTheme === 'emerald') {
          // Green Flame (Magic)
          if (lifeRatio < 0.2) { [r, g, b] = [255, 255, 255]; }
          else if (lifeRatio < 0.4) { [r, g, b] = [180, 255, 180]; }
          else if (lifeRatio < 0.7) { [r, g, b] = [20, 255, 80]; }
          else { [r, g, b] = [0, 80, 20]; }
        } else {
          // Classic Fire
          if (lifeRatio < 0.15) { [r, g, b] = [255, 255, 255]; } // White hot core
          else if (lifeRatio < 0.35) { [r, g, b] = [255, 255, 0]; } // Yellow
          else if (lifeRatio < 0.6) { [r, g, b] = [255, 100, 0]; } // Orange
          else if (lifeRatio < 0.85) { [r, g, b] = [200, 30, 0]; } // Deep Red
          else { [r, g, b] = [40, 40, 40]; } // Smoke gray
        }

        a = (1 - lifeRatio) * 0.8;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [settings.intensity, settings.windStrength, settings.colorTheme, noise]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 bg-black" />;
};

export default FireEngine;
