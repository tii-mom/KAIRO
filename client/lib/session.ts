export type KairoRole = 'supporter' | 'builder' | 'admin';

export interface DemoIdentity {
  id: string;
  role: KairoRole;
  label: string;
  adminToken?: string;
}

export const DEMO_IDENTITIES = {
  supporter: {
    id: 'user-demo-supporter',
    role: 'supporter',
    label: 'Demo Supporter',
  },
  builder: {
    id: 'user-demo-builder',
    role: 'builder',
    label: 'Demo Builder',
  },
  admin: {
    id: 'user-demo-admin',
    role: 'admin',
    label: 'Demo Admin',
  },
} as const satisfies Record<KairoRole, DemoIdentity>;

export const DEFAULT_DEMO_IDENTITY: DemoIdentity = DEMO_IDENTITIES.supporter;

export function getDemoIdentity(role: KairoRole = DEFAULT_DEMO_IDENTITY.role): DemoIdentity {
  return DEMO_IDENTITIES[role];
}

export function getSessionHeaders(identity: DemoIdentity = DEFAULT_DEMO_IDENTITY): HeadersInit {
  const headers: Record<string, string> = {
    'x-kairo-user-id': identity.id,
    'x-kairo-role': identity.role,
  };
  if (identity.adminToken) headers['x-kairo-admin-token'] = identity.adminToken;
  
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const betaToken = window.sessionStorage.getItem('x-kairo-beta-token');
    if (betaToken) {
      headers['x-kairo-beta-token'] = betaToken;
    }
  }
  
  return headers;
}

export function withSessionHeaders(
  init: RequestInit = {},
  identity: DemoIdentity = DEFAULT_DEMO_IDENTITY,
): RequestInit {
  return {
    ...init,
    headers: {
      ...getSessionHeaders(identity),
      ...init.headers,
    },
  };
}
