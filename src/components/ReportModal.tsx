'use client';

/**
 * SENTINEL — Modal de rapport IA
 * Affiche le rapport généré par DeepSeek dans une modal plein écran.
 * Permet l'export PDF via le bouton de téléchargement.
 */

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { ReportResponse } from '@/lib/types';
import { exportPDF } from '@/lib/api';

interface ReportModalProps {
  report: ReportResponse;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReportModal({ report, isOpen, onClose }: ReportModalProps) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const blob = await exportPDF(7);
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SENTINEL_RAPPORT_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de l\'export PDF. Vérifiez que le backend est accessible.');
    } finally {
      setIsExporting(false);
    }
  };

  // Déterminer la couleur du niveau de menace
  const threatLevelColor = {
    'CRITIQUE': '#ef4444',
    'ÉLEVÉ': '#f97316',
    'MODÉRÉ': '#f59e0b',
    'FAIBLE': '#10b981',
  }[report.threat_level] || '#94a3b8';

  return (
    <div className="modal-overlay" onClick={onClose} id="report-modal">
      <div
        className="w-[90vw] max-w-4xl h-[90vh] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] flex flex-col animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête du modal */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="flex items-center gap-4">
            <div className="text-2xl">📄</div>
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)] tracking-wide">
                {report.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[0.65rem] text-[var(--text-muted)]">
                  {new Date(report.created_at).toLocaleString('fr-FR')}
                </span>
                <span
                  className="badge"
                  style={{
                    background: `${threatLevelColor}15`,
                    color: threatLevelColor,
                    border: `1px solid ${threatLevelColor}40`,
                  }}
                >
                  MENACE {report.threat_level}
                </span>
                <span className="badge badge-modere">
                  {report.anomaly_count} anomalies
                </span>
                <span className="badge badge-faible">
                  {report.zone_count} zones
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bouton Export PDF */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="btn-sentinel btn-primary text-xs disabled:opacity-50"
              id="export-pdf-btn"
            >
              {isExporting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Export...
                </>
              ) : (
                <>
                  📥 Exporter PDF
                </>
              )}
            </button>

            {/* Bouton Fermer */}
            <button
              onClick={onClose}
              className="btn-sentinel btn-ghost text-xs"
            >
              ✕ Fermer
            </button>
          </div>
        </div>

        {/* Classification */}
        <div className="text-center py-2 border-b border-[var(--border-color)]"
          style={{ background: 'rgba(239, 68, 68, 0.05)' }}
        >
          <span className="text-xs font-bold tracking-[0.3em] text-[var(--accent-red)]">
            ⬛ CONFIDENTIEL — DIFFUSION RESTREINTE ⬛
          </span>
        </div>

        {/* Contenu du rapport */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="report-content max-w-3xl mx-auto">
            <ReactMarkdown>{report.content}</ReactMarkdown>
          </div>
        </div>

        {/* Pied de page */}
        <div className="p-3 border-t border-[var(--border-color)] bg-[var(--bg-primary)] text-center">
          <p className="text-[0.6rem] text-[var(--text-muted)]">
            Ce document est classifié CONFIDENTIEL. Toute reproduction ou diffusion non autorisée est strictement interdite.
            &nbsp;•&nbsp; SENTINEL — Plateforme de Renseignement et Surveillance de Données
          </p>
        </div>
      </div>
    </div>
  );
}
