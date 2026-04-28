import { http } from "./http";

export interface RiskProfilePayload {
  sex: "male" | "female";
  has_diabetes: boolean;
  is_smoker: boolean;
  systolic_bp: number;
  age: number;
  total_cholesterol: number;
}

export interface RiskProfile {
  id: number;
  user_id: number;
  sex: "male" | "female";
  has_diabetes: boolean;
  is_smoker: boolean;
  systolic_bp: number;
  age: number;
  total_cholesterol: number;
  age_bucket: number | null;
  systolic_bucket: number | null;
  cholesterol_bucket: number | null;
  risk_percent: number | null;
  risk_display: string | null;
  risk_category: string | null;
  risk_category_label: string | null;
  is_applicable: boolean;
  calculation_message: string;
  calculated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function getRiskProfile() {
  const response = await http.get('/risk-profile');
  return response.data;
}

export async function saveRiskProfile(payload: RiskProfilePayload) {
  const response = await http.put('/risk-profile', payload);
  return response.data;
}

export async function getRiskProfileHistory(limit = 50) {
  const response = await http.get<{
    data: RiskProfile[];
    message: string;
  }>(`/risk-profile/history?limit=${limit}`);

  return response.data;
}