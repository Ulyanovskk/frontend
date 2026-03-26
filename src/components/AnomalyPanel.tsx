'use client';

/**
 * SENTINEL — Panel latéral des anomalies (1:1 sentinel.html)
 * Liste des alertes avec barres de score et tags de sévérité.
 */

import React from 'react';
import type { AnomalyAlert } from '@/lib/types';

interface AnomalyPanelProps {
  anomalies: AnomalyAlert[];
  onAlertClick?: (alert: AnomalyAlert) => void;
  selectedAlertId?: string;
}

export default function AnomalyPanel({ anomalies, onAlertClick, selectedAlertId }: AnomalyPanelProps) {
  return (
    <div className="anomaly-list h-full" id="anomaly-panel">
      {anomalies.length === 0 ? (
        <div className="p-8 text-center text-[var(--text3)] font-mono-tech text-[10px] uppercase tracking-[0.1em]">
          Recherche d'anomalies en cours...
        </div>
      ) : (
        anomalies.map((alert) => {
          const isSelected = selectedAlertId === alert.id;
          const score = alert.score || 0.5;
          const percentage = Math.min(score * 100, 100).toFixed(0);
          
          let color = 'var(--blue)';
          let tagClass = 'blue';
          let itemClass = '';

          if (alert.severity === 'critique') {
            color = 'var(--red)';
            tagClass = 'red';
            itemClass = isSelected ? 'active border-l-2 border-[var(--red)]' : '';
          } else if (alert.severity === 'eleve') {
            color = 'var(--orange)';
            tagClass = 'orange';
            itemClass = isSelected ? 'active-orange border-l-2 border-[var(--orange)]' : '';
          }

          return (
            <div 
              key={alert.id}
              onClick={() => onAlertClick?.(alert)}
              className={`anomaly-item group ${itemClass} ${isSelected ? 'bg-[rgba(255,255,255,0.03)]' : ''}`}
            >
              <div className="anomaly-header flex items-center justify-between mb-[4px]">
                <div className="anomaly-id font-mono-tech text-[10px] text-[var(--text3)] uppercase">
                  TXN-{alert.id.slice(0, 4).toUpperCase()}
                </div>
                <div className="anomaly-time font-mono-tech text-[10px] text-[var(--text3)]">
                  {new Date(alert.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </div>
              </div>

              <div className="anomaly-amount font-mono-tech text-[15px] text-[var(--text)] mb-[3px]">
                XAF {(alert.score ? alert.score * 12400000 : 5400000).toLocaleString('fr-FR')}
              </div>

              <div className="anomaly-meta text-[11px] text-[var(--text2)] mb-[5px] font-medium italic">
                {alert.title.includes('→') ? alert.title : 'Douala → Maroua'}
              </div>

              <div className="score-bar-wrap flex items-center gap-[8px]">
                <div className="score-bar flex-1 h-[3px] bg-[var(--bg3)] rounded-[1px] overflow-hidden">
                  <div 
                    className="score-fill h-full rounded-[1px] transition-all duration-300"
                    style={{ width: `${percentage}%`, background: color }}
                  />
                </div>
                <div className="score-label font-mono-tech text-[10px] min-w-[32px] text-right" style={{ color }}>
                  {score.toFixed(2)}
                </div>
                <div className={`tag ${tagClass} inline-block font-mono-tech text-[9px] px-[5px] py-[1px] rounded-[1px] uppercase tracking-[0.05em] border`}>
                  {alert.alert_type.split('_')[0].toUpperCase()}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
