import { http } from './http';

export type AlertStatus = 'active' | 'resolved' | 'dismissed' | 'all';

export interface Alert {
  id: number;
  user_id: number;
  alert_type: 'medical' | 'medication';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  status: 'active' | 'resolved' | 'dismissed';
  source: string;
  created_at: string;
  resolved_at: string | null;
}

export async function getAlerts(status: AlertStatus = 'active', limit = 50) {
  const response = await http.get<{
    data: Alert[];
    message: string;
  }>(`/alerts?status=${status}&limit=${limit}`);

  return response.data;
}

export async function resolveAlert(id: number) {
  const response = await http.patch<{
    data: Alert;
    message: string;
  }>(`/alerts/${id}/resolve`);

  return response.data;
}

export async function dismissAlert(id: number) {
  const response = await http.patch<{
    data: Alert;
    message: string;
  }>(`/alerts/${id}/dismiss`);

  return response.data;
}