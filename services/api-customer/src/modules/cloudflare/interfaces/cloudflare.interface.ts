export interface CloudflareConfig {
  apiToken: string;
  zoneId: string;
  email?: string;
  apiKey?: string;
}


export interface CloudflareDNSRecord {
  message: string;
  statusCode: number;
  id: string;
  zone_id: string;
  zone_name: string;
  name: string;
  type: string;
  content: string;
  proxiable: boolean;
  proxied: boolean;
  ttl: number;
  locked: boolean;
  meta: {
    auto_added: boolean;
    managed_by_apps: boolean;
    managed_by_argo_tunnel: boolean;
    source: string;
  };
  created_on: string;
  modified_on: string;
}
export interface CloudflareResponse<T> {
  success: boolean;
  errors: Array<{
    code: number;
    message: string;
  }>;
  messages: Array<{
    code: number;
    message: string;
  }>;
  result: T;
}
