export type Symptom = {
  id: string;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
};

export type EvaluationPayload = {
  age: number;
  gender: string;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  smoker: boolean;
  selectedSymptoms: string[];
};

export type EvaluationResult = {
  riskLevel: 'Bajo' | 'Moderado' | 'Alto' | 'Crítico';
  score: number;
  diagnosis: string;
  recommendations: string[];
  selectedSymptoms: string[];
  createdAt: string;
};