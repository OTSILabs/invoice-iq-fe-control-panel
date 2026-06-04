export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Plan {
  id: string;
  description: string;
  plan_type: string;
  plan_interval: string;
  price_per_invoice_amount: number;
  price_per_invoice_currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tenant_role: string;
  plan_id?: string;
  tenant_count?: number;
  status?: string;
  created_at?: string;
}

export interface Tenant {
  id: string;
  tenant_admin_full_name: string;
  tenant_role: string;
  access_status: string;
  created_at: string;
}
