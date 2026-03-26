'use client';

/**
 * SENTINEL — Badge d'alerte temps réel
 * Affiche les compteurs animés du tableau de bord (événements, anomalies, niveau d'alerte).
 * Animation flash rouge lors de la mise à jour des compteurs critiques.
 */

import React, { useEffect, useState } from 'react';
import type { DashboardStats } from '@/lib/types';

interface AlertBadgeProps {
  stats: DashboardStats;
}

const ALERT_LEVEL_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string }> = {
  'FAIBLE': {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
    glow: '0 0 15px rgba(16, 185, 129, 0.2)',
  },
  'MODÉRÉ': {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
    glow: '0 0 15px rgba(245, 158, 11, 0.2)',
  },
  'ÉLEVÉ': {
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    border: 'rgba(249, 115, 22, 0.3)',
    glow: '0 0 20px rgba(249, 115, 22, 0.3)',
  },
  'CRITIQUE': {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.4)',
    glow: '0 0 25px rgba(239, 68, 68, 0.3)',
  },
};

export default function AlertBadge({ stats }: AlertBadgeProps) {
  const [flash, setFlash] = useState(false);
  const [prevCritical, setPrevCritical] = useState(stats.critical_alerts);

  // Flash quand les alertes critiques changent
  useEffect(() => {
    if (stats.critical_alerts > prevCritical) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
    }
    setPrevCritical(stats.critical_alerts);
  }, [stats.critical_alerts, prevCritical]);

  const levelConfig = ALERT_LEVEL_CONFIG[stats.alert_level] || ALERT_LEVEL_CONFIG['FAIBLE'];

  return (
    <div
      className={`flex items-center gap-4 ${flash ? 'animate-flash-alert' : ''}`}
      id="alert-badges"
    >
      {/* Compteur d'événements actifs */}
      <CounterBadge
        label="Événements"
        value={stats.active_events}
        icon="🌐"
        color="var(--accent-blue)"
      />

      {/* Compteur d'anomalies */}
      <CounterBadge
        label="Anomalies"
        value={stats.total_anomalies}
        icon="⚠️"
        color="var(--accent-orange)"
        pulse={stats.total_anomalies > 10}
      />

      {/* Compteur critiques */}
      <CounterBadge
        label="Critiques"
        value={stats.critical_alerts}
        icon="🔴"
        color="var(--accent-red)"
        pulse={stats.critical_alerts > 0}
      />

      {/* Niveau d'alerte global */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300"
        style={{
          background: levelConfig.bg,
          borderColor: levelConfig.border,
          boxShadow: levelConfig.glow,
        }}
      >
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            stats.alert_level === 'CRITIQUE' ? 'animate-pulse-red' : ''
          }`}
          style={{ background: levelConfig.color }}
        />
        <div>
          <div className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">
            Niveau
          </div>
          <div
            className="text-xs font-bold tracking-wider"
            style={{ color: levelConfig.color }}
          >
            {stats.alert_level}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant auxiliaire pour les compteurs individuels
interface CounterBadgeProps {
  label: string;
  value: number;
  icon: string;
  color: string;
  pulse?: boolean;
}

function CounterBadge({ label, value, icon, color, pulse }: CounterBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg sentinel-card
        ${pulse ? 'animate-pulse-glow' : ''}`}
    >
      <span className="text-sm">{icon}</span>
      <div>
        <div className="text-[0.6rem] text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </div>
        <div className="text-sm font-bold font-mono animate-count-up" style={{ color }}>
          {value.toLocaleString('fr-FR')}
        </div>
      </div>
    </div>
  );
}
