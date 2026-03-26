'use client';

/**
 * SENTINEL — Panel latéral d'analyse (1:1 sentinel.html)
 * Affiche la grille de métriques, les sparklines 24h et le journal d'activité.
 */

import React from 'react';
import {
  AreaChart, Area, ResponsiveContainer,
} from 'recharts';
import type { FinancialChartData } from '@/lib/types';

interface FinancialChartProps {
  data: FinancialChartData[];
  summary?: {
    total_transactions: number;
    total_amount: number;
    anomaly_count: number;
    average_amount: number;
    anomaly_rate: number;
  };
}

export default function FinancialChart({ data, summary }: FinancialChartProps) {
  // Region Data simulation strictly for 1:1 match
  const regionData = [
    { name: 'Douala', value: 85, color: 'var(--red)' },
    { name: 'Maroua', value: 74, color: 'var(--orange)' },
    { name: 'Garoua', value: 62, color: 'var(--orange)' },
    { name: 'Yaoundé', value: 51, color: 'var(--blue)' },
    { name: 'Bertoua', value: 28, color: 'var(--blue)' },
  ];

  // Activity Journal (Items from sentinel.html)
  const activityItems = [
    { type: 'RED', msg: 'Alerte critique TXN-2847 - Douala', time: '14:25', color: 'var(--red)' },
    { type: 'ORANGE', msg: 'Nouvelle zone suspecte détectée - Far North', time: '14:19', color: 'var(--orange)' },
    { type: 'RED', msg: 'Score Isolation Forest > 0.90 - 2 comptes', time: '14:15', color: 'var(--red)' },
    { type: 'BLUE', msg: 'Mise à jour pipeline de données', time: '14:11', color: 'var(--blue)' },
    { type: 'BLUE', msg: 'Fractionnement détecté - Douala', time: '14:08', color: 'var(--blue)' },
    { type: 'GREEN', msg: 'Modèle IA ré-entraîné : précision 94.2%', time: '13:55', color: 'var(--green)' },
  ];

  return (
    <div className="h-full flex flex-col bg-[var(--bg1)]" id="analysis-panel">
      
      {/* 4x Grid Metrics Section (sentinel.html) */}
      <div className="metrics-grid grid grid-cols-2 gap-[1px] border-b border-[var(--line)] shrink-0 bg-[var(--line)]">
        <div className="metric-cell p-[10px_12px] bg-[var(--bg1)]">
          <div className="metric-label font-mono-tech text-[9px] text-[var(--text3)] uppercase mb-[3px]">Score global</div>
          <div className="metric-value font-mono-tech text-[18px] text-[var(--red)] leading-none font-bold">0.84</div>
        </div>
        <div className="metric-cell p-[10px_12px] bg-[var(--bg1)] border-l border-[var(--line)]">
          <div className="metric-label font-mono-tech text-[9px] text-[var(--text3)] uppercase mb-[3px]">Tx suspectes</div>
          <div className="metric-value font-mono-tech text-[18px] text-[var(--orange)] leading-none font-bold">12</div>
        </div>
        <div className="metric-cell p-[10px_12px] bg-[var(--bg1)]">
          <div className="metric-label font-mono-tech text-[9px] text-[var(--text3)] uppercase mb-[3px]">Vol. anormal</div>
          <div className="metric-value font-mono-tech text-[18px] text-[var(--red)] leading-none font-bold">47M</div>
        </div>
        <div className="metric-cell p-[10px_12px] bg-[var(--bg1)] border-l border-[var(--line)]">
          <div className="metric-label font-mono-tech text-[9px] text-[var(--text3)] uppercase mb-[3px]">Confiance IA</div>
          <div className="metric-value font-mono-tech text-[18px] text-[var(--green)] leading-none font-bold">91%</div>
        </div>
      </div>

      {/* 24h Area Sparkline Section (sentinel.html) */}
      <div className="chart-section p-[10px_14px] border-b border-[var(--line)] flex-shrink-0">
        <div className="chart-section-title font-mono-tech text-[9px] text-[var(--text3)] uppercase tracking-[0.1em] mb-[8px]">Volume Transactions (24h)</div>
        <div className="h-[60px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.slice(-24)}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--green)" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="total_amount" 
                stroke="var(--green)" 
                fillOpacity={1} 
                fill="url(#colorGreen)" 
                strokeWidth={1.5}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Grid Section (Visual simulation from html) */}
      <div className="chart-section p-[10px_14px] border-b border-[var(--line)] flex-shrink-0">
        <div className="chart-section-title font-mono-tech text-[9px] text-[var(--text3)] uppercase tracking-[0.1em] mb-[8px]">Répartition par région</div>
        <div className="space-y-[8px]">
          {regionData.map((reg, i) => (
            <div key={i} className="region-stat flex flex-col gap-[3px]">
              <div className="flex justify-between items-center text-[10px] px-[2px]">
                <span className="font-[var(--cond)] font-medium text-[var(--text2)] uppercase tracking-[0.05em]">{reg.name}</span>
                <span className="font-mono-tech text-[var(--text3)] text-[9px]">{reg.value}%</span>
              </div>
              <div className="h-[3px] w-full bg-[var(--bg3)] rounded-[1px] overflow-hidden">
                <div className="h-full rounded-[1px] transition-all duration-1000" style={{ width: `${reg.value}%`, background: reg.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Feed Section (sentinel.html) */}
      <div className="panel-header px-[14px] py-[10px] border-b border-[var(--line)] shrink-0 mt-[2px]">
        <div className="panel-title font-[var(--cond)] text-[11px] tracking-[0.14em] uppercase text-[var(--text3)] font-medium">Journal d'alertes</div>
      </div>
      <div className="activity-feed p-[8px_0] overflow-y-auto custom-scrollbar flex-1 h-full">
        {activityItems.map((item, i) => (
          <div key={i} className="activity-item px-[14px] py-[5px] flex gap-[8px] items-start group">
            <div className="activity-dot w-[5px] h-[5px] rounded-full mt-[4px] shrink-0 animate-pulse" style={{ background: item.color }} />
            <div className="activity-text text-[var(--text2)] text-[11px] leading-[1.4] group-hover:text-[var(--text)]">{item.msg}</div>
            <div className="activity-time font-mono-tech text-[9px] text-[var(--text3)] ml-auto shrink-0">{item.time}</div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
