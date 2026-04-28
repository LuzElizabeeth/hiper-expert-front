import { http } from './http';

export async function getCurrentUser() {
  const response = await http.get('/users/me');
  return response.data;
}

export async function getRiskProfile() {
  const response = await http.get('/risk-profile');
  return response.data;
}

export async function getLatestVital() {
  const response = await http.get('/vitals?limit=1');
  return response.data;
}