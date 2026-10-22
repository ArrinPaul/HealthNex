"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Center of India

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync Markers when hotspots change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Filter out invalid location coordinates to avoid misleading map pins
    const validHotspots = hotspots.filter(
      h => typeof h.lat === 'number' && !isNaN(h.lat) && typeof h.lng === 'number' && !isNaN(h.lng) && (h.lat !== 0 || h.lng !== 0)
    );

    validHotspots.forEach((hotspot) => {
      const severity = hotspot.cases > 30 ? 'high' : hotspot.cases > 15 ? 'medium' : 'low';
      const color = severity === 'high' ? '#ef4444' : severity === 'medium' ? '#f59e0b' : '#10b981';
      
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: ${20 + hotspot.cases / 2}px; height: ${20 + hotspot.cases / 2}px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">${hotspot.cases}</div>`,
        iconSize: [20 + hotspot.cases / 2, 20 + hotspot.cases / 2],
      });

      const marker = L.marker([hotspot.lat, hotspot.lng], { icon })
        .addTo(map)
        .bindPopup(`<strong>${hotspot.location}</strong><br/>Category: ${hotspot.disease || 'Unknown'}<br/>Active Cases: ${hotspot.cases}`);

      markersRef.current.push(marker);
    });
  }, [hotspots]);

  // Pan map when selectedHotspot changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHotspot) return;

    map.setView([selectedHotspot.lat, selectedHotspot.lng], 9, {
      animate: true,
      duration: 1.2
    });

    // Find and open popup for this hotspot
    markersRef.current.forEach(marker => {
      const latLng = marker.getLatLng();
      // Use small tolerance for float comparison
      if (Math.abs(latLng.lat - selectedHotspot.lat) < 0.001 && Math.abs(latLng.lng - selectedHotspot.lng) < 0.001) {
        marker.openPopup();
      }
    });
  }, [selectedHotspot]);

  return <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-lg" />;
}