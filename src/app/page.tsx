'use client';

/**
 * SENTINEL — Dashboard principal
 * Page principale de la plateforme de surveillance géospatiale
 * et de détection d'anomalies financières.
 * 
 * Layout :
 * ┌──────────────────────────────────────────────────────┐
 * │  SENTINEL  [logo]    [compteurs temps réel]   [heure]│
 * ├───────────┬──────────────────────┬───────────────────┤
 * │  Panel    │    CARTE             │  Panel            │
 * │  Anomalies│    géospatiale       │  Financier        │
 * │           │    interactive       │  (Recharts)       │
 * └───────────┴──────────────────────┴───────────────────┘
 * │  [GÉNÉRER RAPPORT IA]  [EXPORTER PDF]  [ACTUALISER]  │
 * └──────────────────────────────────────────────────────┘
 */

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import AlertBadge from '@/components/AlertBadge';
import AnomalyPanel from '@/components/AnomalyPanel';
import FinancialChart from '@/components/FinancialChart';
import ReportModal from '@/components/ReportModal';
import {
  getGeoEvents,
  getAlertZones,
  getTransactionFlows,
  getDashboardStats,
  getAnomalyAlerts,
  getFinancialChartData,
  getFinancialSummary,
  generateReport,
  exportPDF,
} from '@/lib/api';
import type {
  GeoEvent,
  AlertZone,
  ArcFlow,
  DashboardStats,
  AnomalyAlert,
  FinancialChartData,
  ReportResponse,
} from '@/lib/types';

// Import dynamique de MapView pour éviter le SSR (Deck.gl nécessite le client)
const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[var(--bg-primary)] flex items-center justify-center">
      <div className="text-center animate-pulse-glow">
        <div className="text-4xl mb-3">🛰️</div>
        <p className="text-sm text-[var(--text-secondary)]">Initialisation de la carte...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  // === États ===
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [zones, setZones] = useState<AlertZone[]>([]);
  const [flows, setFlows] = useState<ArcFlow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    active_events: 0,
    total_anomalies: 0,
    critical_alerts: 0,
    alert_level: 'FAIBLE',
    last_updated: new Date().toISOString(),
  });
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [chartData, setChartData] = useState<FinancialChartData[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());

  // États UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // === Chargement des données ===
  const loadData = useCallback(async () => {
    try {
      const [eventsRes, zonesRes, flowsRes, statsRes, alertsRes, chartRes, summaryRes] =
        await Promise.allSettled([
          getGeoEvents(),
          getAlertZones(),
          getTransactionFlows(),
          getDashboardStats(),
          getAnomalyAlerts(),
          getFinancialChartData(),
          getFinancialSummary(),
        ]);

      if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.events);
      if (zonesRes.status === 'fulfilled') setZones(zonesRes.value.zones);
      if (flowsRes.status === 'fulfilled') setFlows(flowsRes.value);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (alertsRes.status === 'fulfilled') setAnomalies(alertsRes.value);
      if (chartRes.status === 'fulfilled') setChartData(chartRes.value);
      if (summaryRes.status === 'fulfilled') setFinancialSummary(summaryRes.value);

      setError(null);
    } catch (err) {
      console.error('Erreur chargement données:', err);
      setError('Impossible de charger les données. Vérifiez que le backend est en cours d\'exécution.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling toutes les 10 secondes
  useEffect(() => {
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Horloge temps réel
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // === Handlers ===
  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const reportData = await generateReport(7);
      setReport(reportData);
      setShowReport(true);
    } catch (err) {
      console.error('Erreur génération rapport:', err);
      alert('Erreur lors de la génération du rapport. Vérifiez le backend.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const blob = await exportPDF(7);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SENTINEL_RAPPORT_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur export PDF:', err);
      alert('Erreur lors de l\'export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAlertClick = (alert: AnomalyAlert) => {
    setSelectedAlert(alert.id);
  };

  const handleEventClick = (event: GeoEvent) => {
    // Chercher l'alerte liée à cet événement par proximité géographique
    const relatedAlert = anomalies.find(a =>
      a.lat && a.lng &&
      Math.abs(a.lat - event.lat) < 0.5 &&
      Math.abs(a.lng - event.lng) < 0.5
    );
    if (relatedAlert) {
      setSelectedAlert(relatedAlert.id);
    }
  };

  // === Rendu ===
  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] scanline-overlay grid-pattern">
      {/* ═══════════════════════════════════════════════════
          BARRE SUPÉRIEURE — Logo + Compteurs + Horloge
          ═══════════════════════════════════════════════════ */}
      <header className="h-16 flex items-center justify-between px-5 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] relative z-10">
        {/* Logo SENTINEL */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg"
              style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' }}
            >
              <span className="text-white font-black text-sm">S</span>
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--accent-green)] status-dot-active" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-[0.2em] text-[var(--text-primary)]">
              SENTINEL
            </h1>
            <p className="text-[0.55rem] text-[var(--text-muted)] uppercase tracking-[0.15em] -mt-0.5">
              Surveillance & Détection
            </p>
          </div>
        </div>

        {/* Compteurs temps réel */}
        <AlertBadge stats={stats} />

        {/* Horloge */}
        <div className="text-right">
          <div className="text-sm font-mono font-bold text-[var(--text-primary)]">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[0.6rem] text-[var(--text-muted)]">
            {currentTime.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          ZONE PRINCIPALE — 3 colonnes
          ═══════════════════════════════════════════════════ */}
      <main className="flex-1 flex min-h-0">
        {/* Colonne gauche — Panel Anomalies */}
        <aside className="w-[300px] min-w-[280px] border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden animate-slide-left">
          <AnomalyPanel
            anomalies={anomalies}
            onAlertClick={handleAlertClick}
            selectedAlertId={selectedAlert}
          />
        </aside>

        {/* Colonne centrale — Carte géospatiale */}
        <section className="flex-1 relative">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-primary)]">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-[var(--border-color)] rounded-full" />
                  <div
                    className="absolute inset-0 border-4 border-transparent border-t-[var(--accent-blue)] rounded-full"
                    style={{ animation: 'radar-sweep 1.5s linear infinite' }}
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)]">Chargement des données SENTINEL...</p>
              </div>
            </div>
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center bg-[var(--bg-primary)]">
              <div className="text-center sentinel-card p-8 max-w-md">
                <div className="text-4xl mb-4">⚠️</div>
                <h2 className="text-base font-bold text-[var(--text-primary)] mb-2">
                  Connexion au backend impossible
                </h2>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {error}
                </p>
                <div className="text-xs text-[var(--text-muted)] sentinel-card p-3 text-left font-mono">
                  <p>1. docker-compose up -d</p>
                  <p>2. cd backend && python data/seed_data.py</p>
                  <p>3. uvicorn main:app --reload --port 8000</p>
                </div>
                <button
                  onClick={loadData}
                  className="btn-sentinel btn-primary mt-4 text-xs"
                >
                  🔄 Réessayer
                </button>
              </div>
            </div>
          ) : (
            <MapView
              events={events}
              zones={zones}
              flows={flows}
              onEventClick={handleEventClick}
            />
          )}
        </section>

        {/* Colonne droite — Panel Financier */}
        <aside className="w-[300px] min-w-[280px] border-l border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-hidden animate-slide-right">
          <FinancialChart
            data={chartData}
            financialSummary={financialSummary}
          />
        </aside>
      </main>

      {/* ═══════════════════════════════════════════════════
          BARRE INFÉRIEURE — Actions
          ═══════════════════════════════════════════════════ */}
      <footer className="h-14 flex items-center justify-center gap-4 px-5 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        {/* Bouton Générer Rapport IA */}
        <button
          onClick={handleGenerateReport}
          disabled={isGenerating}
          className="btn-sentinel btn-primary disabled:opacity-50"
          id="generate-report-btn"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Génération en cours...
            </>
          ) : (
            <>🤖 Générer Rapport IA</>
          )}
        </button>

        {/* Bouton Exporter PDF */}
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="btn-sentinel btn-danger disabled:opacity-50"
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
            <>📥 Exporter PDF</>
          )}
        </button>

        {/* Bouton Actualiser */}
        <button
          onClick={loadData}
          className="btn-sentinel btn-ghost"
          id="refresh-btn"
        >
          🔄 Actualiser
        </button>

        {/* Indicateur de connexion */}
        <div className="flex items-center gap-2 ml-4 text-[0.65rem] text-[var(--text-muted)]">
          <div className={`status-dot ${error ? '' : 'status-dot-active'}`} />
          {error ? 'Déconnecté' : 'Connecté — Polling actif'}
        </div>
      </footer>

      {/* Modal Rapport */}
      {report && (
        <ReportModal
          report={report}
          isOpen={showReport}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
}
