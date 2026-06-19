let session: any = null;

export const getSession = () => session || {};
export const setSession = (data: any) => { session = data; };
export const clearSession = () => { session = null; };
