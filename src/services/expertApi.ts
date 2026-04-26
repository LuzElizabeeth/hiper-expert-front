import type {
  EmergencyContact,
  EvaluationPayload,
  EvaluationResult,
  NotificationSettings,
  PressureMeasurement,
  Symptom,
} from '../types/expert.types';
export const cardiovascularSymptoms: Symptom[] = [
  {
    id: 'chest_pain',
    label: 'Dolor u opresión en el pecho',
    description: 'Sensación de presión, ardor o peso en el centro del pecho.',
    severity: 'high',
  },
  {
    id: 'short_breath',
    label: 'Dificultad para respirar',
    description: 'Falta de aire en reposo o con poco esfuerzo.',
    severity: 'high',
  },
  {
    id: 'left_arm_pain',
    label: 'Dolor en brazo izquierdo',
    description: 'Dolor que puede extenderse hacia brazo, hombro, cuello o mandíbula.',
    severity: 'high',
  },
  {
    id: 'fatigue',
    label: 'Fatiga inusual',
    description: 'Cansancio extremo sin causa aparente.',
    severity: 'medium',
  },
  {
    id: 'dizziness',
    label: 'Mareo o desmayo',
    description: 'Sensación de pérdida de equilibrio o desvanecimiento.',
    severity: 'medium',
  },
  {
    id: 'sweating',
    label: 'Sudoración fría',
    description: 'Sudoración repentina, fría o excesiva.',
    severity: 'high',
  },
  {
    id: 'nausea',
    label: 'Náuseas',
    description: 'Malestar estomacal acompañado o no de vómito.',
    severity: 'medium',
  },
  {
    id: 'palpitations',
    label: 'Palpitaciones',
    description: 'Latidos rápidos, fuertes o irregulares.',
    severity: 'medium',
  },
];

export const evaluateCardiovascularRisk = async (
  payload: EvaluationPayload
): Promise<EvaluationResult> => {
  let score = 0;

  payload.selectedSymptoms.forEach((symptomId) => {
    const symptom = cardiovascularSymptoms.find((item) => item.id === symptomId);

    if (symptom?.severity === 'high') score += 25;
    if (symptom?.severity === 'medium') score += 15;
    if (symptom?.severity === 'low') score += 5;
  });

  if (payload.age >= 60) score += 15;
  if (payload.hasHypertension) score += 15;
  if (payload.hasDiabetes) score += 10;
  if (payload.smoker) score += 10;

  let riskLevel: EvaluationResult['riskLevel'] = 'Bajo';
  let diagnosis = 'No se identifican señales importantes de riesgo cardiovascular inmediato.';

  if (score >= 35) {
    riskLevel = 'Moderado';
    diagnosis =
      'Se identifican síntomas y factores que podrían estar relacionados con riesgo cardiovascular. Se recomienda valoración médica.';
  }

  if (score >= 65) {
    riskLevel = 'Alto';
    diagnosis =
      'El sistema detecta un posible riesgo cardiovascular alto. Es importante acudir a revisión médica lo antes posible.';
  }

  if (score >= 90) {
    riskLevel = 'Crítico';
    diagnosis =
      'Se detectan señales de posible emergencia cardiovascular. Se recomienda buscar atención médica inmediata.';
  }

  const result: EvaluationResult = {
    riskLevel,
    score,
    diagnosis,
    selectedSymptoms: payload.selectedSymptoms,
    createdAt: new Date().toISOString(),
    recommendations: [
      'No automedicarse.',
      'Registrar la hora de inicio de los síntomas.',
      'Evitar esfuerzo físico mientras persistan los síntomas.',
      'Consultar a un profesional de salud para una evaluación adecuada.',
      riskLevel === 'Crítico'
        ? 'Acudir inmediatamente a urgencias o llamar a servicios de emergencia.'
        : 'Dar seguimiento médico preventivo si los síntomas continúan.',
    ],
  };

  const previous = localStorage.getItem('cardio-history');
  const history = previous ? JSON.parse(previous) : [];
  localStorage.setItem('cardio-history', JSON.stringify([result, ...history]));

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 700);
  });
};

export const getHistory = (): EvaluationResult[] => {
  const data = localStorage.getItem('cardio-history');
  return data ? JSON.parse(data) : [];
};

export const getLastResult = (): EvaluationResult | null => {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
};

const PRESSURE_HISTORY_KEY = 'cardio-pressure-history';

export const savePressureMeasurement = (measurement: Omit<PressureMeasurement, 'createdAt'>): void => {
  const previous = localStorage.getItem(PRESSURE_HISTORY_KEY);
  const history: PressureMeasurement[] = previous ? JSON.parse(previous) : [];

  const newEntry: PressureMeasurement = {
    ...measurement,
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(PRESSURE_HISTORY_KEY, JSON.stringify([newEntry, ...history]));
};

export const getPressureHistory = (): PressureMeasurement[] => {
  const data = localStorage.getItem(PRESSURE_HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

const EMERGENCY_CONTACT_KEY = 'cardio-emergency-contact';

export const saveEmergencyContact = (
  contact: Omit<EmergencyContact, 'updatedAt'>
): EmergencyContact => {
  const payload: EmergencyContact = {
    ...contact,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(EMERGENCY_CONTACT_KEY, JSON.stringify(payload));
  return payload;
};

export const getEmergencyContact = (): EmergencyContact | null => {
  const data = localStorage.getItem(EMERGENCY_CONTACT_KEY);
  return data ? JSON.parse(data) : null;
};

export const deleteEmergencyContact = (): void => {
  localStorage.removeItem(EMERGENCY_CONTACT_KEY);
};

const NOTIFICATION_SETTINGS_KEY = 'cardio-notification-settings';

export const defaultNotificationSettings: NotificationSettings = {
  criticalAlerts: true,
  aiTrends: true,
  medicationReminders: true,
  adherenceReminders: false,
  dailyMeasurement: true,
  healthTips: true,
};

export const getNotificationSettings = (): NotificationSettings => {
  const data = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return data ? JSON.parse(data) : defaultNotificationSettings;
};

export const saveNotificationSettings = (settings: NotificationSettings): void => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};