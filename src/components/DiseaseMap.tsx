"use client";

import { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import { useTheme } from 'next-themes';

interface DiseaseMapProps {
  hotspots?: Array<{
    lat: number;
    lng: number;
    cases: number;
    location: string;
    disease?: string;
  }>;
  selectedHotspot?: { lat: number; lng: number } | null;
}

export default function DiseaseMap({ hotspots = [], selectedHotspot = null }: DiseaseMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef(null);
  const pointerInteractionMovement = useRef(0);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let phi = 0;
    let width = 0;
    let globe: any = null;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };
    window.addEventListener('resize', onResize);
    onResize();

    const isDark = resolvedTheme === 'dark';

    const defaultHotspots = hotspots.length > 0 ? hotspots : [
      { lat: 28.6139, lng: 77.2090, cases: 45, location: 'Delhi', disease: 'COVID' },
      { lat: 19.0760, lng: 72.8777, cases: 38, location: 'Mumbai', disease: 'Dengue' },
      { lat: 22.5726, lng: 88.3639, cases: 28, location: 'Kolkata', disease: 'Cholera' },
      { lat: 12.9716, lng: 77.5946, cases: 15, location: 'Bengaluru', disease: 'Flu' },
      { lat: 26.1445, lng: 91.7362, cases: 23, location: 'Guwahati', disease: 'Malaria' }
    ];

    const markers = defaultHotspots.map(h => ({
      location: [h.lat, h.lng] as [number, number],
      size: Math.min(0.15, 0.05 + h.cases / 500)
    }));

    if (canvasRef.current) {
      globe = createGlobe(canvasRef.current, {
        devicePixelRatio: 2,
        width: width * 2,
        height: width * 2,
        phi: 0,
        theta: 0.3,
        dark: isDark ? 1 : 0,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: isDark ? 1.2 : 6,
        baseColor: isDark ? [0.1, 0.1, 0.1] : [0.9, 0.9, 0.9],
        markerColor: [0, 0.7, 0.85], // Brand Primary (Cyan)
        glowColor: isDark ? [0, 0.2, 0.3] : [0.8, 0.9, 1],
        markers: markers,
        onRender: (state: Record<string, any>) => {
          // Auto-rotate unless interacting
          if (!pointerInteracting.current) {
            phi += 0.005;
          }
          state.phi = phi + pointerInteractionMovement.current;
        }
      });
    }

    return () => {
      if (globe) globe.destroy();
      window.removeEventListener('resize', onResize);
    };
  }, [hotspots, resolvedTheme]);

  return (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center relative overflow-hidden rounded-lg bg-transparent">
      <div className="absolute inset-0 z-10 pointer-events-none rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]" />
      <canvas
        ref={canvasRef}
        className="w-full max-w-[500px] aspect-square opacity-90 transition-opacity duration-1000 cursor-grab active:cursor-grabbing"
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX as any;
          canvasRef.current!.style.cursor = 'grabbing';
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = 'grab';
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - (pointerInteracting.current as any);
            pointerInteractionMovement.current = delta / 200;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - (pointerInteracting.current as any);
            pointerInteractionMovement.current = delta / 100;
          }
        }}
      />
    </div>
  );
}