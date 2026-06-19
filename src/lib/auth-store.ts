export const getSession = () => {
  try {
    const item = localStorage.getItem("auth-session:v1");
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
};

export const setSession = (data: any) => {
  localStorage.setItem("auth-session:v1", JSON.stringify(data));
};

export const clearSession = () => {
  localStorage.removeItem("auth-session:v1");
};
