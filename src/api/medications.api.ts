import { http } from './http';

export interface MedicationPayload {
  name: string;
  dose_mg: number;
  frequency_hours: number;
  first_dose_time: string;
  with_food: boolean;
}

export async function createMedication(payload: MedicationPayload) {
  const response = await http.post('/medications', payload);
  return response.data;
}

export async function getMedications() {
  const response = await http.get('/medications');
  return response.data;
}

export async function deleteMedication(id: number) {
  const response = await http.delete(`/medications/${id}`);
  return response.data;
}