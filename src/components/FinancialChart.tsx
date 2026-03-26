'use client';

/**
 * SENTINEL — Graphiques financiers Recharts
 * Affiche les courbes et histogrammes des données financières.
 */

import React from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
  ComposedChart, Line,
} from 'recharts';
import type { FinancialChartData } from '@/lib/types';

interface FinancialChartProps {
  data: FinancialChartData[];
  financialSummary?: {
    total_transactions: number;
    total_amount: number;
    anomaly_count: number;
    average_amount: number;
    anomaly_rate: number;
  };
}

// Formater les montants en XAF
function formatAmount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

// Formater les dates
function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

// Tooltip personnalisé
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="sentinel-card p-3 text-xs">
      <p className="text-[var(--text-primary)] font-semibold mb-2">
        {formatDate(label)}
      </p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-[var(--text-secondary)]">{entry.name}:</span>
          <span className="text-[var(--text-primary)] font-mono">
            {typeof entry.value === 'number'
              ? entry.name.includes('Montant')
                ? `${formatAmount(entry.value)} XAF`
                : entry.value.toLocaleString('fr-FR')
              : entry.value
            }
          </span>
        </div>
      ))}
    </div>
  );
}

export default function FinancialChart({ data, financialSummary }: FinancialChartProps) {
  return (
    <div className="h-full flex flex-col" id="financial-panel">
      {/* En-tête */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">📊</span>
          <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--text-primary)]">
            Analyse Financière
          </h2>
        </div>

        {/* Résumé financier */}
        {financialSummary && (
          <div className="grid grid-cols-2 gap-2">
            <div className="sentinel-card p-2 text-center">
              <div className="text-sm font-bold text-[var(--accent-blue)]">
                {formatAmount(financialSummary.total_amount)} XAF
              </div>
              <div className="text-[0.6rem] text-[var(--text-muted)] uppercase">Volume total</div>
            </div>
            <div className="sentinel-card p-2 text-center">
              <div className="text-sm font-bold text-[var(--accent-red)]">
                {financialSummary.anomaly_rate}%
              </div>
              <div className="text-[0.6rem] text-[var(--text-muted)] uppercase">Taux anomalie</div>
            </div>
          </div>
        )}
      </div>

      {/* Graphique principal — Volume + Anomalies */}
      <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto">
        <div>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Volume des transactions (30 jours)
          </h3>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <defs>
                  <linearGradient id="gradientBlue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(30, 41, 59, 0.8)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={formatAmount}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total_amount"
                  name="Montant total"
                  stroke="#3b82f6"
                  fill="url(#gradientBlue)"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="anomaly_count"
                  name="Anomalies"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#ef4444' }}
                  yAxisId={0}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Graphique — Nombre de transactions */}
        <div>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Transactions par jour
          </h3>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(30, 41, 59, 0.8)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={{ stroke: '#1e293b' }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 9, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="transaction_count"
                  name="Transactions"
                  fill="#3b82f6"
                  radius={[2, 2, 0, 0]}
                  opacity={0.8}
                />
                <Bar
                  dataKey="anomaly_count"
                  name="Anomalies"
                  fill="#ef4444"
                  radius={[2, 2, 0, 0]}
                  opacity={0.9}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score d'anomalie global */}
        <div className="sentinel-card p-3">
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Score de risque global
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke="rgba(30, 41, 59, 0.8)"
                  strokeWidth="3"
                />
                <circle
                  cx="18" cy="18" r="14"
                  fill="none"
                  stroke={financialSummary && financialSummary.anomaly_rate > 10 ? '#ef4444' :
                    financialSummary && financialSummary.anomaly_rate > 5 ? '#f59e0b' : '#10b981'}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(financialSummary?.anomaly_rate || 0) * 0.88} 88`}
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-[var(--text-primary)]">
                  {financialSummary?.anomaly_rate?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-primary)] font-semibold">
                {financialSummary && financialSummary.anomaly_rate > 10 ? 'Risque élevé' :
                  financialSummary && financialSummary.anomaly_rate > 5 ? 'Risque modéré' : 'Risque faible'}
              </div>
              <div className="text-[0.6rem] text-[var(--text-muted)]">
                {financialSummary?.anomaly_count || 0} anomalies sur {financialSummary?.total_transactions || 0} tx
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
