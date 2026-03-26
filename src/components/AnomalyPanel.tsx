'use client';

/**
 * SENTINEL — Panel latéral des anomalies financières
 * Affiche la liste des alertes d'anomalie avec scores, sévérité et détails.
 * Animation flash rouge lors de l'apparition d'une nouvelle anomalie.
 */

import React, { useState } from 'react';
import type { AnomalyAlert } from '@/lib/types';

interface AnomalyPanelProps {
  anomalies: AnomalyAlert[];
  onAlertClick?: (alert: AnomalyAlert) => void;
  selectedAlertId?: string;
}

const ALERT_TYPE_ICONS: Record<string, string> = {
  montant_eleve: '💰',
  velocite_suspecte: '⚡',
  geo_incoherent: '📍',
  horaire_suspect: '🌙',
  pattern_anormal: '🔍',
};

const SEVERITY_ORDER = ['critique', 'eleve', 'modere', 'faible'];

export default function AnomalyPanel({ anomalies, onAlertClick, selectedAlertId }: AnomalyPanelProps) {
  const [filter, setFilter] = useState<string>('all');

  // Filtrer les anomalies
  const filteredAnomalies = anomalies
    .filter(a => filter === 'all' || a.severity === filter)
    .sort((a, b) => {
      const aIdx = SEVERITY_ORDER.indexOf(a.severity);
      const bIdx = SEVERITY_ORDER.indexOf(b.severity);
      return aIdx - bIdx;
    });

  // Compteurs par sévérité
  const counts = {
    all: anomalies.length,
    critique: anomalies.filter(a => a.severity === 'critique').length,
    eleve: anomalies.filter(a => a.severity === 'eleve').length,
    modere: anomalies.filter(a => a.severity === 'modere').length,
    faible: anomalies.filter(a => a.severity === 'faible').length,
  };

  return (
    <div className="h-full flex flex-col" id="anomaly-panel">
      {/* En-tête */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="status-dot status-dot-alert" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">
            Anomalies Financières
          </h2>
        </div>

        {/* Filtres rapides */}
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'all', label: 'Tout', count: counts.all },
            { key: 'critique', label: 'Critique', count: counts.critique },
            { key: 'eleve', label: 'Élevé', count: counts.eleve },
            { key: 'modere', label: 'Modéré', count: counts.modere },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-2 py-1 rounded text-[0.65rem] font-semibold uppercase tracking-wider transition-all
                ${filter === key
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Liste des anomalies */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredAnomalies.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-muted)] text-sm">
            Aucune anomalie détectée
          </div>
        ) : (
          filteredAnomalies.map((alert, index) => (
            <div
              key={alert.id}
              onClick={() => onAlertClick?.(alert)}
              className={`sentinel-card p-3 cursor-pointer animate-fade-in
                ${selectedAlertId === alert.id
                  ? 'border-[var(--accent-blue)] glow-blue'
                  : ''
                }
                ${alert.severity === 'critique' ? 'border-l-2 border-l-[var(--accent-red)]' : ''}
                ${alert.severity === 'eleve' ? 'border-l-2 border-l-[var(--accent-orange)]' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* En-tête de l'alerte */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base flex-shrink-0">
                    {ALERT_TYPE_ICONS[alert.alert_type] || '⚠️'}
                  </span>
                  <span className={`badge badge-${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
                <span className="text-[0.6rem] text-[var(--text-muted)] flex-shrink-0">
                  {formatTimeAgo(alert.created_at)}
                </span>
              </div>

              {/* Titre */}
              <h3 className="text-xs font-semibold text-[var(--text-primary)] mb-1 leading-tight">
                {alert.title}
              </h3>

              {/* Description */}
              {alert.description && (
                <p className="text-[0.65rem] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                  {alert.description}
                </p>
              )}

              {/* Score */}
              {alert.score !== undefined && alert.score !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.abs(alert.score) * 200, 100)}%`,
                        background: alert.severity === 'critique' ? '#ef4444' :
                          alert.severity === 'eleve' ? '#f97316' : '#f59e0b'
                      }}
                    />
                  </div>
                  <span className="text-[0.6rem] text-[var(--text-muted)] font-mono">
                    {alert.score.toFixed(3)}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Résumé en bas */}
      <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
        <div className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-[var(--accent-red)]">{counts.critique}</div>
            <div className="text-[0.6rem] text-[var(--text-muted)] uppercase">Critiques</div>
          </div>
          <div>
            <div className="text-lg font-bold text-[var(--accent-orange)]">{counts.eleve}</div>
            <div className="text-[0.6rem] text-[var(--text-muted)] uppercase">Élevées</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Formate un timestamp en "il y a X" en français
 */
function formatTimeAgo(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  } catch {
    return '';
  }
}
