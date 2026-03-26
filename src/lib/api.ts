/**
 * SENTINEL — Client API
 * Fonctions d'appel vers le backend FastAPI.
 * Toutes les requêtes passent par ce module centralisé.
 */

import type {
  GeoEvent,
  AlertZone,
  ArcFlow,
  DashboardStats,
  FinancialChartData,
  AnomalyAlert,
  Transaction,
  AnalyzeResponse,
  ReportResponse,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fonction utilitaire pour les appels API avec gestion d'erreurs
 */
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`❌ Erreur API [${endpoint}]:`, error);
    throw error;
  }
}

// ============================================================
// Endpoints géospatiaux
// ============================================================

export async function getGeoEvents(minSeverity = 1): Promise<{ events: GeoEvent[]; total: number }> {
  return fetchAPI(`/api/geo/events?min_severity=${minSeverity}`);
}

export async function getAlertZones(): Promise<{ zones: AlertZone[]; total: number }> {
  return fetchAPI('/api/geo/zones');
}

export async function getTransactionFlows(): Promise<ArcFlow[]> {
  return fetchAPI('/api/geo/flows');
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI('/api/geo/stats');
}

export async function getFinancialChartData(lookbackDays = 30): Promise<FinancialChartData[]> {
  return fetchAPI(`/api/geo/chart-data?lookback_days=${lookbackDays}`);
}

// ============================================================
// Endpoints financiers
// ============================================================

export async function getTransactions(
  limit = 100,
  anomaliesOnly = false
): Promise<Transaction[]> {
  return fetchAPI(`/api/finance/transactions?limit=${limit}&anomalies_only=${anomaliesOnly}`);
}

export async function getFinancialSummary(): Promise<{
  total_transactions: number;
  total_amount: number;
  anomaly_count: number;
  average_amount: number;
  anomaly_rate: number;
}> {
  return fetchAPI('/api/finance/summary');
}

// ============================================================
// Endpoints anomalies
// ============================================================

export async function getAnomalyAlerts(limit = 50): Promise<AnomalyAlert[]> {
  return fetchAPI(`/api/anomalies/alerts?limit=${limit}`);
}

export async function analyzeAnomalies(lookbackDays = 30): Promise<AnalyzeResponse> {
  return fetchAPI('/api/anomalies/analyze', {
    method: 'POST',
    body: JSON.stringify({ lookback_days: lookbackDays }),
  });
}

export async function getAnomalySummary(): Promise<{
  total_alerts: number;
  unresolved: number;
  critical: number;
  resolution_rate: number;
}> {
  return fetchAPI('/api/anomalies/summary');
}

// ============================================================
// Endpoints rapports
// ============================================================

export async function generateReport(lookbackDays = 7): Promise<ReportResponse> {
  return fetchAPI('/api/report/generate', {
    method: 'POST',
    body: JSON.stringify({
      include_anomalies: true,
      include_geo_context: true,
      lookback_days: lookbackDays,
    }),
  });
}

export async function exportPDF(lookbackDays = 7): Promise<Blob> {
  const url = `${API_BASE}/api/report/export-pdf`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      include_anomalies: true,
      include_geo_context: true,
      lookback_days: lookbackDays,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erreur export PDF: ${response.statusText}`);
  }

  return response.blob();
}

export async function getLatestReport(): Promise<ReportResponse> {
  return fetchAPI('/api/report/latest');
}
