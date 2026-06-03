import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const logout = (err: any) => {
  sessionStorage.clear();
  window.dispatchEvent(new Event('auth:logout'));
  return Promise.reject(err);
};

api.interceptors.request.use((config) => {
  try {
    const sessionStr = sessionStorage.getItem('token');
    if (sessionStr && config.headers) {
      const sessionData = JSON.parse(sessionStr);
      const token = sessionData.access_token || sessionData.token;
      const tokenType = sessionData.token_type || 'Bearer';
      const formattedType = tokenType.charAt(0).toUpperCase() + tokenType.slice(1);
      
      if (token) {
        config.headers.Authorization = `${formattedType} ${token}`;
      }
    }
  } catch (e) {
    // Ignore parse errors, let it pass without token
  }
  return config;
}, Promise.reject);

api.interceptors.response.use((res) => res, async (error) => {
  const req = error.config;
  const status = error.response?.status;

  if (status === 401 && !req._retry) {
    req._retry = true;
    
    let sessionData: any = null;
    try {
      const sessionStr = sessionStorage.getItem('token');
      if (sessionStr) sessionData = JSON.parse(sessionStr);
    } catch (e) {}

    const rt = sessionData?.refresh_token;
    if (!rt) return logout(error);

    try {
      const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh`, { refresh_token: rt }, {
        headers: { 'accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const t = data.access_token || data.token;
      if (t) {
        const newData = { ...sessionData, ...data };
        sessionStorage.setItem('token', JSON.stringify(newData));
        
        const tokenType = newData.token_type || 'Bearer';
        const formattedType = tokenType.charAt(0).toUpperCase() + tokenType.slice(1);
        req.headers.Authorization = `${formattedType} ${t}`;
        return api(req);
      }
    } catch (e) {
      console.error('Session expired.');
      return logout(e);
    }
  }

  if (status === 403) console.error('Forbidden access');
  else if (status >= 500) console.error('Server error');
  else if (!error.response) console.error('Network error or no response received');

  return Promise.reject(error);
});

export default api;
