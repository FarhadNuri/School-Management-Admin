import api from '../client';
import { adaptDashboardData } from '../adapters/dashboardAdapter';

export async function getDashboard() {
  const raw = await api.get('/dashboard');
  return adaptDashboardData(raw);
}

// Backwards-compatible methods matching old mock service function names
export async function getOverviewStats() {
  const dash = await getDashboard();
  return dash.statCards;
}

export async function getCommunityMix() {
  const dash = await getDashboard();
  return dash.communityMix;
}

export async function getEnrollmentTrend() {
  const dash = await getDashboard();
  return dash.enrollmentTrend;
}

export async function getClassSizes() {
  const dash = await getDashboard();
  return dash.classSizes;
}
