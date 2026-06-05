import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const getSession = () => {
  try { return JSON.parse(sessionStorage.getItem('token') || '{}'); } 
  catch { return {}; }
};

const getAuthHeader = (session = getSession()) => {
  const token = session.access_token || session.token;
  if (!token) return null;
  const type = session.token_type || 'Bearer';
  return `${type.charAt(0).toUpperCase() + type.slice(1)} ${token}`;
};

const logout = (err: any) => {
  sessionStorage.clear();
  window.dispatchEvent(new Event('auth:logout'));
  return Promise.reject(err);
};

api.interceptors.request.use((config) => {
  const authHeader = getAuthHeader();
  if (authHeader && config.headers) config.headers.Authorization = authHeader;
  return config;
}, Promise.reject);

api.interceptors.response.use((res) => res, async (error) => {
  const { config, response } = error;
  const status = response?.status;

  if (status === 401 && !config._retry) {
    config._retry = true;
    const session = getSession();
    if (!session.refresh_token) return logout(error);

    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: session.refresh_token });
      const newSession = { ...session, ...data };
      sessionStorage.setItem('token', JSON.stringify(newSession));
      
      config.headers.Authorization = getAuthHeader(newSession);
      return api(config);
    } catch (e) {
      return logout(e); // Session truly expired
    }
  }

  const errMap: Record<number, string> = { 403: 'Forbidden access', 500: 'Server error' };
  console.error(errMap[status as number] || 'Network error or response missing');

  return Promise.reject(error);
});

export default api;
