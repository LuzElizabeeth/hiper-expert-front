import { http } from './http';

export async function getCurrentUser() {
  const response = await http.get('/users/me');
  return response.data;
}

export async function getLatestVitals() {
  const response = await http.get('/vitals?limit=1');
  return response.data;
}

export async function getWeeklyTrends() {
  const response = await http.get('/vitals/trends?range=week');
  return response.data;
}

export async function getDueMedications() {
  const response = await http.get('/medications/due');
  return response.data;
}

export async function getActiveAlerts() {
  const response = await http.get('/alerts?status=active&limit=5');
  return response.data;
}