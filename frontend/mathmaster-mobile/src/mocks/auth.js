// Mock auth data — demoable without a backend.
const DELAY = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function mockLogin(username, password) {
  await sleep(DELAY);
  if (!password || password.length < 4) {
    const err = new Error('Invalid username or password.');
    err.status = 401;
    throw err;
  }
  const role = username.toLowerCase().includes('teacher') ? 'teacher' : 'student';
  return {
    access: `mock-access-${role}`,
    refresh: 'mock-refresh',
    user: mockUser(username, role),
  };
}

export async function mockRegister(payload) {
  await sleep(600);
  return {
    access: 'mock-access',
    refresh: 'mock-refresh',
    user: mockUser(payload.username, payload.role || 'student'),
  };
}

export async function mockProfile() {
  await sleep(150);
  return mockUser('Alex Student', 'student');
}

export function mockUser(username = 'Alex Student', role = 'student') {
  return {
    id: 1,
    username,
    email: `${(username || 'user').toLowerCase().replace(/\s+/g, '.')}@mathmaster.ug`,
    first_name: username?.split(' ')[0] || 'Alex',
    last_name: username?.split(' ')[1] || '',
    role,
    level: 'S3',
    school: 'Kampala Secondary School',
  };
}
