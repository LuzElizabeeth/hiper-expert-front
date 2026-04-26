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

export type MeasurementRange = 'semana' | 'mes' | 'anio';

export type PressureMeasurement = {
  systolic: number;
  diastolic: number;
  pulse: number;
  createdAt: string;
};

export type EmergencyRelation = 'hijo' | 'hija' | 'cuidador' | 'otro';

export type EmergencyContact = {
  fullName: string;
  relation: EmergencyRelation;
  phone: string;
  healthAlerts: boolean;
  shareData: boolean;
  hasPhoto: boolean;
  /** Foto en base64 (data URL), elegida desde archivos del dispositivo */
  photoDataUrl?: string | null;
  updatedAt: string;
};

export type MedicationFrequency = 'diario' | 'interdiario';

/** Medicación guardada desde la pantalla de añadir medicación */
export type SavedMedication = {
  id: string;
  name: string;
  doseMg: number;
  frequency: MedicationFrequency;
  intervalLabel: string;
  firstDoseHHmm: string;
  takeWithFood: boolean;
  createdAt: string;
};

export type UserSex = 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';

export type UserProfile = {
  displayName: string;
  phone: string;
  age: number | null;
  sex: UserSex;
  weightKg: number | null;
  heightCm: number | null;
  hasHypertension: boolean;
  hasDiabetes: boolean;
  smoker: boolean;
  notes: string;
  photoDataUrl: string | null;
  updatedAt: string;
};

export type NotificationSettings = {
  criticalAlerts: boolean;
  aiTrends: boolean;
  medicationReminders: boolean;
  adherenceReminders: boolean;
  dailyMeasurement: boolean;
  healthTips: boolean;
};