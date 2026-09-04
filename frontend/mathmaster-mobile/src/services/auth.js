// Auth service. Mock path (USE_MOCK_DATA) keeps the app demoable offline;
// real path hits the Django backend.
import { USE_MOCK_DATA } from './api';
import { get, post } from './api';
import { mockLogin, mockProfile, mockRegister } from '../mocks/auth';

export async function login(username, password) {
  // Real:  const data = await post('/api/accounts/login/', { username, password });
  if (USE_MOCK_DATA) return mockLogin(username, password);
  return post('/api/accounts/login/', { username, password });
}

export async function register(payload) {
  if (USE_MOCK_DATA) return mockRegister(payload);
  return post('/api/accounts/register/', payload);
}

export async function profile() {
  if (USE_MOCK_DATA) return mockProfile();
  return get('/api/accounts/profile/');
}
