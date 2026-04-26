import type {
  EmergencyContact,
  EvaluationPayload,
  EvaluationResult,
  NotificationSettings,
  PressureMeasurement,
  Symptom,
} from '../types/expert.types';

export const hypertensionSymptoms: Symptom[] = [
  {
    id: 'headache',
    label: 'Dolor de cabeza intenso',
    description: 'Cefalea frecuente o fuerte, especialmente al despertar.',
    severity: 'medium',
  },
  {
    id: 'dizziness',
    label: 'Mareo o sensación de inestabilidad',
    description: 'Sensación de desvanecimiento, vértigo o pérdida de equilibrio.',
    severity: 'medium',
  },
  {
    id: 'blurred_vision',
    label: 'Visión borrosa',
    description: 'Dificultad para enfocar, ver manchas o alteraciones visuales.',
    severity: 'high',
  },
  {
    id: 'chest_pressure',
    label: 'Presión o dolor en el pecho',
    description: 'Molestia torácica asociada a presión arterial elevada.',
    severity: 'high',
  },
  {
    id: 'short_breath',
    label: 'Dificultad para respirar',
    description: 'Falta de aire en reposo o durante actividades cotidianas.',
    severity: 'high',
  },
  {
    id: 'palpitations',
    label: 'Palpitaciones',
    description: 'Latidos rápidos, fuertes o irregulares.',
    severity: 'medium',
  },
  {
    id: 'nosebleed',
    label: 'Sangrado nasal',
    description: 'Sangrado sin causa clara, especialmente si se acompaña de presión alta.',
    severity: 'medium',
  },
  {
    id: 'fatigue',
    label: 'Cansancio inusual',
    description: 'Fatiga persistente o debilidad sin causa aparente.',
    severity: 'low',
  },
];

export const evaluateHypertensionRisk = async (
  payload: EvaluationPayload
): Promise<EvaluationResult> => {
  let score = 0;

  payload.selectedSymptoms.forEach((symptomId) => {
    const symptom = hypertensionSymptoms.find((item) => item.id === symptomId);

    if (symptom?.severity === 'high') score += 25;
    if (symptom?.severity === 'medium') score += 15;
    if (symptom?.severity === 'low') score += 5;
  });

  if (payload.age >= 60) score += 15;
  if (payload.hasHypertension) score += 15;
  if (payload.hasDiabetes) score += 10;
  if (payload.smoker) score += 10;

  let riskLevel: EvaluationResult['riskLevel'] = 'Bajo';
  let diagnosis = 'No se identifican señales importantes de riesgo hipertensivo inmediato.';

  if (score >= 35) {
    riskLevel = 'Moderado';
    diagnosis =
      'Se identifican síntomas y factores que podrían estar RELACIÓNados con riesgo hipertensivo. Se recomienda valoración médica.';
  }

  if (score >= 65) {
    riskLevel = 'Alto';
    diagnosis =
      'El sistema detecta un posible riesgo hipertensivo alto. Es importante acudir a revisión médica lo antes posible.';
  }

  if (score >= 90) {
    riskLevel = 'Crítico';
    diagnosis =
      'Se detectan señales compatibles con una posible crisis hipertensiva. Se recomienda buscar atención médica inmediata.';
  }

  const result: EvaluationResult = {
    riskLevel,
    score,
    diagnosis,
    selectedSymptoms: payload.selectedSymptoms,
    createdAt: new Date().toISOString(),
    recommendations: [
  'No automedicarse ni suspender tratamiento sin indicación médica.',
  'Registrar presiónla presión arterial con fecha y hora.',
  'Evitar esfuerzo físico si hay síntomas intensos.',
  'Reducir consumo de sal, cafeína y tabaco cuando aplique.',
  riskLevel === 'Crítico'
    ? 'Acudir inmediatamente a urgencias o llamar a servicios de emergencia.'
    : 'Dar seguimiento con un profesional de salud si los síntomas continúan.',
],
  };

  const previous = localStorage.getItem('hypertension-history');
  const history = previous ? JSON.parse(previous) : [];
  localStorage.setItem('hypertension-history', JSON.stringify([result, ...history]));

  return new Promise((resolve) => {
    setTimeout(() => resolve(result), 700);
  });
};

export const getHistory = (): EvaluationResult[] => {
  const data = localStorage.getItem('hypertension-history');
  return data ? JSON.parse(data) : [];
};

export const getLastResult = (): EvaluationResult | null => {
  const history = getHistory();
  return history.length > 0 ? history[0] : null;
};

const PRESSURE_HISTORY_KEY = 'hypertension-pressure-history';

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

const EMERGENCY_CONTACT_KEY = 'hypertension-emergency-contact';

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

const NOTIFICATION_SETTINGS_KEY = 'hypertension-notification-settings';

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