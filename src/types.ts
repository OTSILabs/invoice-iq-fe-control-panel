export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  // Define actual response fields based on your API here
  token?: string;
  [key: string]: any;
}
