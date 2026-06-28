import type { Context } from 'hono';
import { z } from 'zod';
import type { Env } from '../db/d1';

export interface CurrentUser {
  id: string;
  role: string;
  isDemoFallback: boolean;
}

const validityStatusSchema = z.enum(['valid', 'suspicious', 'invalid']);

export function getCurrentUserFromHeaders(c: Context<{ Bindings: Env }>): CurrentUser {
  const id = c.req.header('x-kairo-user-id')?.trim() || c.req.header('x-user-id')?.trim() || c.req.query('userId') || 'user-demo-supporter';
  const role = c.req.header('x-kairo-role')?.trim() || 'supporter';

  return {
    id,
    role,
    isDemoFallback: !c.req.header('x-kairo-user-id') || !c.req.header('x-kairo-role'),
  };
}

export function requireAdmin(c: Context<{ Bindings: Env }>): CurrentUser {
  const user = getCurrentUserFromHeaders(c);
  if (user.role !== 'admin') {
    const error = new Error('Admin role required');
    (error as Error & { status?: number }).status = 403;
    throw error;
  }

  const configuredToken = c.env.ADMIN_API_TOKEN?.trim();
  const requiresAdminToken = c.env.APP_ENV !== 'local' || Boolean(configuredToken);
  if (requiresAdminToken) {
    const requestToken = c.req.header('x-kairo-admin-token')?.trim();
    if (!configuredToken || requestToken !== configuredToken) {
      const error = new Error('Admin token required');
      (error as Error & { status?: number }).status = 403;
      throw error;
    }
  }

  return user;
}

export function requireBetaWriteAccess(c: Context<{ Bindings: Env }>): CurrentUser {
  const user = getCurrentUserFromHeaders(c);
  
  // Demote client-provided admin role on non-admin routes to supporter
  if (user.role === 'admin') {
    user.role = 'supporter';
  }

  const configuredToken = c.env.KAIRO_BETA_WRITE_TOKEN?.trim();
  const isProductionLike = c.env.APP_ENV !== 'local';

  if (isProductionLike) {
    if (user.isDemoFallback) {
      const error = new Error('Demo identity is disabled on production write operations');
      (error as Error & { status?: number }).status = 403;
      throw error;
    }

    const requestToken = c.req.header('x-kairo-beta-token')?.trim();
    if (!configuredToken) {
      const error = new Error('Beta write access token is not configured on production');
      (error as Error & { status?: number }).status = 403;
      throw error;
    }

    if (requestToken !== configuredToken) {
      const error = new Error('Valid beta write token required');
      (error as Error & { status?: number }).status = 403;
      throw error;
    }
  }

  return user;
}

export function normalizeValidityStatus(value: unknown) {
  return validityStatusSchema.parse(value);
}

export function safeJsonError(error: unknown, fallbackMessage = 'Unexpected KAIRO worker error') {
  if (error instanceof z.ZodError) {
    return {
      status: 400,
      body: { error: 'Validation failed', issues: error.issues },
    };
  }

  if (error instanceof Error) {
    const status = (error as Error & { status?: number }).status ?? 500;
    return {
      status,
      body: { error: error.message || fallbackMessage },
    };
  }

  return {
    status: 500,
    body: { error: fallbackMessage },
  };
}
