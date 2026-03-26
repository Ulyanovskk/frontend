/**
 * SENTINEL — Types TypeScript
 * Définition de tous les types utilisés dans l'application frontend.
 */

// ============================================================
// Types géospatiaux
// ============================================================

export interface GeoEvent {
  id: string;
  lat: number;
  lng: number;
  event_type: string;
  severity: number;
  description?: string;
  metadata?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
}

export interface AlertZone {
  id: string;
  name: string;
  polygon_coords: number[][];
  alert_level: string;
  event_count: number;
  description?: string;
  created_at: string;
}

export interface ArcFlow {
  source_lat: number;
  source_lng: number;
  target_lat: number;
  target_lng: number;
  amount: number;
  is_anomaly: boolean;
  severity: string;
}

// ============================================================
// Types financiers
// ============================================================

export interface Transaction {
  id: string;
  account_id: string;
  amount: number;
  currency: string;
  transaction_type: string;
  origin_city?: string;
  destination_city?: string;
  origin_lat?: number;
  origin_lng?: number;
  destination_lat?: number;
  destination_lng?: number;
  anomaly_score?: number;
  is_anomaly: boolean;
  anomaly_reasons?: string[];
  created_at: string;
}

export interface AnomalyAlert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description?: string;
  transaction_ids?: string[];
  lat?: number;
  lng?: number;
  score?: number;
  is_resolved: boolean;
  created_at: string;
}

export interface AnalyzeSummary {
  total: number;
  suspicious: number;
  critical: number;
}

export interface AnalyzeResponse {
  transactions: Transaction[];
  anomalies: AnomalyAlert[];
  summary: AnalyzeSummary;
}

// ============================================================
// Types tableau de bord
// ============================================================

export interface DashboardStats {
  active_events: number;
  total_anomalies: number;
  critical_alerts: number;
  alert_level: string;
  last_updated: string;
}

export interface FinancialChartData {
  date: string;
  total_amount: number;
  transaction_count: number;
  anomaly_count: number;
  avg_anomaly_score?: number;
}

// ============================================================
// Types rapport
// ============================================================

export interface ReportResponse {
  id: string;
  title: string;
  content: string;
  threat_level: string;
  anomaly_count: number;
  zone_count: number;
  created_at: string;
}

// ============================================================
// Types utilitaires
// ============================================================

export type AlertLevel = 'faible' | 'modere' | 'eleve' | 'critique';
export type ThreatLevel = 'FAIBLE' | 'MODÉRÉ' | 'ÉLEVÉ' | 'CRITIQUE';

export const SEVERITY_COLORS: Record<string, string> = {
  faible: '#10b981',
  modere: '#f59e0b',
  eleve: '#f97316',
  critique: '#ef4444',
  normal: '#10b981',
};

export const EVENT_TYPE_LABELS: Record<string, string> = {
  mouvement_militaire: 'Mouvement Militaire',
  transaction_suspecte: 'Transaction Suspecte',
  communication_chiffree: 'Communication Chiffrée',
  logistique_anormale: 'Logistique Anormale',
  deplacement_vehicule: 'Déplacement Véhicule',
  activite_portuaire: 'Activité Portuaire',
  signal_electronique: 'Signal Électronique',
  rassemblement_inhabitual: 'Rassemblement Inhabituel',
};
