'use client';

/**
 * SENTINEL — Composant MapView
 * Carte interactive Deck.gl + react-map-gl centrée sur le Cameroun.
 * Affiche 3 couches : ScatterplotLayer (points), PolygonLayer (zones), ArcLayer (flux).
 */

import React, { useState, useCallback, useMemo } from 'react';
import Map from 'react-map-gl';
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

// Couleurs par sévérité (RGBA 0-255)
const SEVERITY_COLOR_MAP: Record<number, [number, number, number, number]> = {
  1: [16, 185, 129, 180],   // vert
  2: [16, 185, 129, 180],
  3: [16, 185, 129, 200],
  4: [245, 158, 11, 180],   // orange
  5: [245, 158, 11, 200],
  6: [249, 115, 22, 200],
  7: [249, 115, 22, 220],
  8: [239, 68, 68, 220],    // rouge
  9: [239, 68, 68, 240],
  10: [239, 68, 68, 255],
};

// Couleurs d'arc par sévérité
const ARC_COLORS: Record<string, [number, number, number]> = {
  normal: [59, 130, 246],     // bleu
  modere: [245, 158, 11],     // orange
  eleve: [249, 115, 22],      // orange foncé
  critique: [239, 68, 68],    // rouge
};

// Couleurs de zone par niveau d'alerte
const ZONE_COLORS: Record<string, [number, number, number, number]> = {
  faible: [16, 185, 129, 30],
  modere: [245, 158, 11, 40],
  eleve: [249, 115, 22, 50],
  critique: [239, 68, 68, 50],
};

const ZONE_LINE_COLORS: Record<string, [number, number, number, number]> = {
  faible: [16, 185, 129, 120],
  modere: [245, 158, 11, 150],
  eleve: [249, 115, 22, 180],
  critique: [239, 68, 68, 200],
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

  // Couche 1 — Points d'activité (ScatterplotLayer)
  const scatterLayer = useMemo(() => new ScatterplotLayer({
    id: 'geo-events',
    data: events,
    pickable: true,
    opacity: 0.9,
    stroked: true,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 4,
    radiusMaxPixels: 25,
    lineWidthMinPixels: 1,
    getPosition: (d: GeoEvent) => [d.lng, d.lat],
    getRadius: (d: GeoEvent) => Math.max(300, d.severity * 500),
    getFillColor: (d: GeoEvent) => SEVERITY_COLOR_MAP[d.severity] || [59, 130, 246, 180],
    getLineColor: [255, 255, 255, 80],
    onClick: (info: { object?: GeoEvent }) => {
      if (info.object && onEventClick) {
        onEventClick(info.object);
      }
    },
    onHover: (info: { object?: GeoEvent; x?: number; y?: number }) => {
      setHoveredEvent(info.object || null);
      if (info.x !== undefined && info.y !== undefined) {
        setTooltipPos({ x: info.x, y: info.y });
      }
    },
    updateTriggers: {
      getPosition: events.length,
      getFillColor: events.length,
    },
  }), [events, onEventClick]);

  // Couche 2 — Zones d'alerte (PolygonLayer)
  const polygonLayer = useMemo(() => new PolygonLayer({
    id: 'alert-zones',
    data: zones,
    pickable: true,
    stroked: true,
    filled: true,
    wireframe: false,
    lineWidthMinPixels: 2,
    getPolygon: (d: AlertZone) => d.polygon_coords,
    getFillColor: (d: AlertZone) => ZONE_COLORS[d.alert_level] || [239, 68, 68, 40],
    getLineColor: (d: AlertZone) => ZONE_LINE_COLORS[d.alert_level] || [239, 68, 68, 150],
    getLineWidth: 2,
  }), [zones]);

  // Couche 3 — Flux de transactions (ArcLayer)
  const arcLayer = useMemo(() => new ArcLayer({
    id: 'transaction-flows',
    data: flows,
    pickable: true,
    getWidth: (d: ArcFlow) => d.is_anomaly ? 3 : 1,
    getSourcePosition: (d: ArcFlow) => [d.source_lng, d.source_lat],
    getTargetPosition: (d: ArcFlow) => [d.target_lng, d.target_lat],
    getSourceColor: (d: ArcFlow) => ARC_COLORS[d.severity] || ARC_COLORS.normal,
    getTargetColor: (d: ArcFlow) => {
      const color = ARC_COLORS[d.severity] || ARC_COLORS.normal;
      return [...color, 100] as [number, number, number, number];
    },
    getHeight: 0.3,
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

      {/* Indicateur de nombre de points */}
      <div className="absolute bottom-4 left-4 sentinel-card px-3 py-2 text-xs text-[var(--text-secondary)]">
        <span className="status-dot status-dot-active inline-block mr-2" />
        {events.length} événements actifs • {zones.length} zones d'alerte
      </div>
    </div>
  );
}
