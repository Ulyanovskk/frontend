'use client';

/**
 * SENTINEL — Composant MapView
 * Carte interactive Deck.gl + react-map-gl centrée sur le Cameroun.
 * Affiche 3 couches : ScatterplotLayer (points), PolygonLayer (zones), ArcLayer (flux).
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Map } from 'react-map-gl/mapbox';
import DeckGL from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer, PolygonLayer } from '@deck.gl/layers';
import type { GeoEvent, AlertZone, ArcFlow } from '@/lib/types';

import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Vue initiale : centrée sur le Cameroun
const INITIAL_VIEW_STATE = {
  longitude: 12.3547,
  latitude: 4.2272,
  zoom: 5.8,
  pitch: 35,
  bearing: 0,
};

// Couleurs par défaut (RGBA 0-255) — Extraites du CSS de sentinel.html
const SEVERITY_COLOR_MAP: Record<number, [number, number, number, number]> = {
  1: [59, 130, 246, 180],    // blue
  2: [59, 130, 246, 180],
  3: [59, 130, 246, 200],
  4: [255, 149, 0, 180],     // orange
  5: [255, 149, 0, 200],
  6: [255, 95, 0, 200],
  7: [255, 95, 0, 220],
  8: [255, 59, 59, 220],     // red
  9: [255, 59, 59, 240],
  10: [255, 59, 59, 255],
};

const ARC_COLORS: Record<string, [number, number, number]> = {
  normal: [59, 130, 246],    // blue
  modere: [255, 149, 0],     // orange
  eleve: [255, 95, 0],       // orange vif
  critique: [255, 59, 59],   // red
};

const ZONE_COLORS: Record<string, [number, number, number, number]> = {
  faible: [59, 130, 246, 30],
  modere: [255, 149, 0, 40],
  eleve: [255, 95, 0, 50],
  critique: [255, 59, 59, 50],
};

const ZONE_LINE_COLORS: Record<string, [number, number, number, number]> = {
  faible: [59, 130, 246, 100],
  modere: [255, 149, 0, 120],
  eleve: [255, 95, 0, 150],
  critique: [255, 59, 59, 180],
};

interface MapViewProps {
  events: GeoEvent[];
  zones: AlertZone[];
  flows: ArcFlow[];
  onEventClick?: (event: GeoEvent) => void;
}

export default function MapView({ events, zones, flows, onEventClick }: MapViewProps) {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [hoveredEvent, setHoveredEvent] = useState<GeoEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Couche 1 — Points d'activité (ScatterplotLayer) — "Points de contrôle"
  const scatterLayer = useMemo(() => new ScatterplotLayer({
    id: 'geo-events',
    data: events,
    pickable: true,
    opacity: 1,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 5,
    radiusMaxPixels: 15,
    lineWidthMinPixels: 2,
    getPosition: (d: GeoEvent) => [d.lng, d.lat],
    getRadius: 8,
    getFillColor: (d: GeoEvent) => SEVERITY_COLOR_MAP[d.severity] || [0, 204, 255, 180],
    getLineColor: [0, 0, 0, 120],
    onClick: (info: { object?: GeoEvent }) => {
      if (info.object && onEventClick) onEventClick(info.object);
    },
    onHover: (info: { object?: GeoEvent; x?: number; y?: number }) => {
      setHoveredEvent(info.object || null);
      if (info.x !== undefined && info.y !== undefined) setTooltipPos({ x: info.x, y: info.y });
    },
  }), [events, onEventClick]);

  // Couche 2 — Zones d'alerte (PolygonLayer) — "Rayon d'action"
  const polygonLayer = useMemo(() => new PolygonLayer({
    id: 'alert-zones',
    data: zones,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: false,
    lineWidthMinPixels: 1.5,
    getPolygon: (d: AlertZone) => d.polygon_coords,
    getFillColor: (d: AlertZone) => ZONE_COLORS[d.alert_level] || [255, 51, 51, 40],
    getLineColor: (d: AlertZone) => ZONE_LINE_COLORS[d.alert_level] || [255, 51, 51, 150],
    getLineWidth: 2,
  }), [zones]);

  // Couche 3 — Flux de transactions (ArcLayer) — "Flows"
  const arcLayer = useMemo(() => new ArcLayer({
    id: 'transaction-flows',
    data: flows,
    pickable: true,
    getWidth: (d: ArcFlow) => (d.is_anomaly ? 4 : 1.5),
    getSourcePosition: (d: ArcFlow) => [d.source_lng, d.source_lat],
    getTargetPosition: (d: ArcFlow) => [d.target_lng, d.target_lat],
    getSourceColor: (d: ArcFlow) => ARC_COLORS[d.severity] || ARC_COLORS.normal,
    getTargetColor: (d: ArcFlow) => {
      const color = ARC_COLORS[d.severity] || ARC_COLORS.normal;
      return [...color, 80] as [number, number, number, number];
    },
    getHeight: 0.2, // Plus plat comme sur le screenshot
  }), [flows]);

  const layers = [polygonLayer, arcLayer, scatterLayer];

  const onViewStateChange = useCallback(({ viewState: newViewState }: { viewState: typeof INITIAL_VIEW_STATE }) => {
    setViewState(newViewState);
  }, []);

  return (
    <div className="relative w-full h-full" id="map-container">
      <DeckGL
        viewState={viewState}
        onViewStateChange={onViewStateChange as any}
        controller={true}
        layers={layers}
        getCursor={() => hoveredEvent ? 'pointer' : 'grab'}
      >
        {MAPBOX_TOKEN ? (
          <Map
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/dark-v11"
            attributionControl={false}
          />
        ) : (
          <div className="w-full h-full bg-[#0a0e1a] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🗺️</div>
              <p className="text-[var(--text-secondary)] text-sm">
                Token Mapbox non configuré
              </p>
              <p className="text-[var(--text-muted)] text-xs mt-1">
                Ajoutez NEXT_PUBLIC_MAPBOX_TOKEN dans .env.local
              </p>
              {/* Afficher les points même sans fond de carte */}
            </div>
          </div>
        )}
      </DeckGL>

      {/* Tooltip au survol */}
      {hoveredEvent && tooltipPos && (
        <div
          className="absolute pointer-events-none z-50 sentinel-card p-3 max-w-xs animate-fade-in"
          style={{
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="status-dot"
              style={{
                background: hoveredEvent.severity >= 7 ? '#ef4444' :
                  hoveredEvent.severity >= 4 ? '#f59e0b' : '#10b981'
              }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              {hoveredEvent.event_type.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] mb-1">
            {hoveredEvent.description || 'Aucune description'}
          </p>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
            <span>Sévérité: {hoveredEvent.severity}/10</span>
            <span>{new Date(hoveredEvent.created_at).toLocaleDateString('fr-FR')}</span>
          </div>
        </div>
      )}

    </div>
  );
}
