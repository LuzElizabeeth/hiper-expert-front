import { http } from './http';

export interface CreateVitalPayload {
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate_bpm: number;
  symptoms?: string[];
  recorded_at?: string;
}

export interface VitalRecord {
  id: number;
  user_id: number;
  systolic_bp: number;
  diastolic_bp: number;
  heart_rate_bpm: number;
  symptoms: string[];
  symptom_labels: string[];
  bp_category: string;
  bp_category_label: string;
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  initial_assessment: string;
  recommendations: string[];
  recorded_at: string;
  created_at: string;
}

export async function createVitalRecord(payload: CreateVitalPayload) {
  const response = await http.post('/vitals', payload);
  return response.data;
}


export async function getVitals(limit = 100) {
  const response = await http.get<{
    data: VitalRecord[];
    message: string;
  }>(`/vitals?limit=${limit}`);

  return response.data;
}