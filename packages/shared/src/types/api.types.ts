export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  meta: {
    request_id: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

export interface PaginationMeta {
  cursor?: string;
  has_more: boolean;
  total_count?: number;
}

export interface JwtPayload {
  sub: string;
  tenant_id: string | null;
  roles: string[];
  permissions: string[];
  device_id?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  id: string;
  tenantId: string | null;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
}

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  status: string;
}
