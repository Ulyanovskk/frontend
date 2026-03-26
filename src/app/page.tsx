'use client';

/**
 * SENTINEL — Dashboard Révisé (1:1 de sentinel.html)
 * Structure et classes CSS calquées strictement sur le fichier original.
 */

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
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

const MapView = dynamic(() => import('@/components/MapView'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#060810]" />,
});

export default function DashboardPage() {
  const [events, setEvents] = useState<GeoEvent[]>([]);
  const [zones, setZones] = useState<AlertZone[]>([]);
  const [flows, setFlows] = useState<ArcFlow[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    active_events: 247,
    total_anomalies: 12,
    critical_alerts: 3,
    alert_level: 'FAIBLE',
    last_updated: new Date().toISOString(),
  });
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [chartData, setChartData] = useState<FinancialChartData[]>([]);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [selectedAlert, setSelectedAlert] = useState<string | undefined>();
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [layers, setLayers] = useState({ events: true, zones: true, flux: true });

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

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const reportData = await generateReport(7);
      setReport(reportData);
      setShowReport(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg0)] scanline-overlay">
      
      {/* HEADER SECTION (from sentinel.html) */}
      <header className="flex items-center px-[20px] h-[52px] border-b border-[var(--line2)] bg-[var(--bg1)] shrink-0 gap-[24px] relative">
        <div className="logo flex items-center gap-[10px] shrink-0 font-[var(--cond)] font-bold text-[20px] tracking-[0.18em] text-[var(--green)] uppercase">
          <div className="logo-icon w-[28px] h-[28px] border-[1.5px] border-[var(--green)] rounded-full flex items-center justify-center relative">
            <div className="logo-icon-dot w-[8px] h-[8px] bg-[var(--green)] rounded-full animate-pulse-dot" />
            <div className="logo-icon-sonar absolute w-[20px] h-[20px] border border-[var(--green)] rounded-full opacity-0 animate-sonar" />
          </div>
          SENTINEL
        </div>
        <div className="header-divider w-[1px] h-[24px] bg-[var(--line2)] shrink-0" />
        
        <div className="stat-group flex items-center gap-[20px]">
          <div className="stat flex flex-col gap-[1px]">
            <span className="stat-label font-mono-tech text-[9px] text-[var(--text3)] tracking-[0.1em] uppercase">Événements actifs</span>
            <span className="stat-value orange font-mono-tech text-[16px] font-normal leading-none text-[var(--orange)]">{stats.active_events || '247'}</span>
          </div>
          <div className="stat flex flex-col gap-[1px]">
            <span className="stat-label font-mono-tech text-[9px] text-[var(--text3)] tracking-[0.1em] uppercase">Anomalies</span>
            <span className="stat-value red font-mono-tech text-[16px] font-normal leading-none text-[var(--red)]">{stats.total_anomalies || '12'}</span>
          </div>
          <div className="stat flex flex-col gap-[1px]">
            <span className="stat-label font-mono-tech text-[9px] text-[var(--text3)] tracking-[0.1em] uppercase">Zones critiques</span>
            <span className="stat-value red font-mono-tech text-[16px] font-normal leading-none text-[var(--red)]">{stats.critical_alerts || '3'}</span>
          </div>
          <div className="stat flex flex-col gap-[1px]">
            <span className="stat-label font-mono-tech text-[9px] text-[var(--text3)] tracking-[0.1em] uppercase">Transactions / h</span>
            <span className="stat-value green font-mono-tech text-[16px] font-normal leading-none text-[var(--green)]">1 842</span>
          </div>
        </div>

        <div className="header-right ml-auto flex items-center gap-[16px]">
          <div className="status-pill live font-mono-tech text-[10px] tracking-[0.1em] px-[10px] py-[3px] rounded-[2px] uppercase bg-[var(--green-bg)] text-[var(--green)] border border-[rgba(0,255,136,0.3)] animate-blink-border">● LIVE</div>
          <div className="clock font-mono-tech text-[13px] text-[var(--text2)]">
            {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT (from sentinel.html) */}
      <main className="main grid grid-cols-[280px_1fr_260px] flex-1 overflow-hidden h-full">
        
        {/* LEFT PANEL: ANOMALIES */}
        <aside className="panel flex flex-col bg-[var(--bg1)] border-r border-[var(--line)] overflow-hidden">
          <div className="panel-header px-[14px] py-[10px] border-b border-[var(--line)] shrink-0">
            <div className="panel-title font-[var(--cond)] text-[11px] tracking-[0.14em] uppercase text-[var(--text3)] font-medium">Anomalies financières</div>
            <div className="panel-subtitle font-mono-tech text-[10px] text-[var(--text3)] mt-[1px]">Isolation Forest · seuil 0.65</div>
          </div>
          <div className="panel-body flex-1 overflow-y-auto custom-scrollbar">
            <AnomalyPanel 
              anomalies={anomalies} 
              onAlertClick={(a) => setSelectedAlert(a.id)} 
              selectedAlertId={selectedAlert} 
            />
          </div>
        </aside>

        {/* CENTER: MAP AREA */}
        <div className="map-area flex flex-col bg-[var(--bg0)] overflow-hidden relative h-full">
          <div className="map-toolbar px-[16px] py-[8px] border-b border-[var(--line)] flex items-center gap-[12px] bg-[var(--bg1)] shrink-0">
            <span className="map-toolbar-label font-mono-tech text-[10px] text-[var(--text3)] uppercase tracking-[0.1em]">Couches</span>
            <button className={`layer-toggle font-mono-tech text-[10px] px-[8px] py-[3px] border rounded-[2px] uppercase tracking-[0.05em] transition-all bg-transparent ${layers.events ? 'on text-[var(--green)] bg-[var(--green-bg)] border-[rgba(0,255,136,0.3)]' : 'text-[var(--text2)] border-[var(--line2)]'}`} onClick={() => setLayers(l => ({ ...l, events: !l.events }))}>Événements</button>
            <button className={`layer-toggle font-mono-tech text-[10px] px-[8px] py-[3px] border rounded-[2px] uppercase tracking-[0.05em] transition-all bg-transparent ${layers.zones ? 'on text-[var(--green)] bg-[var(--green-bg)] border-[rgba(0,255,136,0.3)]' : 'text-[var(--text2)] border-[var(--line2)]'}`} onClick={() => setLayers(l => ({ ...l, zones: !l.zones }))}>Zones critiques</button>
            <button className={`layer-toggle font-mono-tech text-[10px] px-[8px] py-[3px] border rounded-[2px] uppercase tracking-[0.05em] transition-all bg-transparent ${layers.flux ? 'on text-[var(--green)] bg-[var(--green-bg)] border-[rgba(0,255,136,0.3)]' : 'text-[var(--text2)] border-[var(--line2)]'}`} onClick={() => setLayers(l => ({ ...l, flux: !l.flux }))}>Flux financiers</button>
          </div>
          
          <div className="map-container flex-1 relative overflow-hidden h-full">
            <MapView 
              events={layers.events ? events : []} 
              zones={layers.zones ? zones : []} 
              flows={layers.flux ? flows : []}
            />
            
            <div className="map-overlay-info absolute bottom-[12px] right-[12px] font-mono-tech text-[10px] text-[var(--text3)] leading-[1.6] pointer-events-none z-10 text-right">
              <div>Proj: WGS84 · ESPG:4326</div>
              <div>Région: Cameroun & sous-région</div>
              <div>Coord: [ {anomalies[0]?.lat?.toFixed(4) || '3.8480'}, {anomalies[0]?.lng?.toFixed(4) || '11.5021'} ]</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: METRICS */}
        <aside className="panel flex flex-col bg-[var(--bg1)] border-l border-[var(--line)] overflow-hidden">
          <div className="panel-header px-[14px] py-[10px] border-b border-[var(--line)] shrink-0">
            <div className="panel-title font-[var(--cond)] text-[11px] tracking-[0.14em] uppercase text-[var(--text3)] font-medium">Analyse & métriques</div>
            <div className="panel-subtitle font-mono-tech text-[10px] text-[var(--text3)] mt-[1px]">Dernière analyse : 11:58</div>
          </div>
          <div className="panel-body flex-1 overflow-y-auto custom-scrollbar">
            <FinancialChart data={chartData} summary={financialSummary} />
          </div>
        </aside>

      </main>

      {/* FOOTER SECTION (from sentinel.html) */}
      <footer className="h-[48px] bg-[var(--bg1)] border-t border-[var(--line2)] flex items-center px-[20px] gap-[12px] shrink-0">
        <button 
          onClick={handleGenerateReport} 
          disabled={isGenerating}
          className="btn btn-primary bg-[var(--green)] text-[var(--bg0)] font-[var(--cond)] text-[13px] font-semibold tracking-[0.1em] uppercase px-[18px] py-[7px] rounded-[2px] transition-all hover:translate-y-[-1px] hover:bg-[#00ffaa]"
        >
          {isGenerating ? 'Analyse en cours...' : '🤖 Générer rapport IA'}
        </button>
        <button className="btn btn-secondary bg-transparent text-[var(--text2)] border border-[var(--line2)] px-[18px] py-[7px] rounded-[2px] font-[var(--cond)] text-[13px] font-semibold tracking-[0.1em] uppercase hover:bg-[var(--bg3)] hover:text-white">📥 Exporter Données</button>
        <button className="btn btn-danger bg-[var(--red-bg)] text-[var(--red)] border border-[rgba(255,59,59,0.3)] px-[18px] py-[7px] rounded-[2px] font-[var(--cond)] text-[13px] font-semibold tracking-[0.1em] uppercase hover:bg-[rgba(255,59,59,0.15)]">⚠️ Alerte Manuelle</button>

        <div className="footer-status ml-auto font-mono-tech text-[10px] text-[var(--text3)]">
          SYSTÈME OPÉRATIONNEL · <span>STATUS OK</span>
        </div>
      </footer>

      {/* MODAL (linked to api report) */}
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
