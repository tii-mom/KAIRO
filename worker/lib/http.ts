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
