import type {
  BountyRecord,
  CreateBountyInput,
  CreateSubmissionInput,
  SubmissionRecord,
} from '../../shared/domain';
import { DEFAULT_DEMO_IDENTITY, type DemoIdentity, withSessionHeaders } from './session';

export interface HealthResponse {
  ok: boolean;
  service: string;
  terms: string[];
}

export interface BoostResponse {
  id: string;
  supportEventId: string;
  pointsDelta: number;
  createdAt: string;
  duplicate?: boolean;
  existingBoostId?: string;
}

export interface LeaderboardResponse {
  hottestCatalysts: Array<Record<string, unknown>>;
  topBuilders: Array<Record<string, unknown>>;
  curatedItems: Array<Record<string, unknown>>;
}

export interface SupportPoints {
  userId: string;
  totalPoints: number;
  boostPoints: number;
  referralPoints: number;
  sharePoints: number;
  validBoostCount: number;
  updatedAt: string | null;
}

export interface SupportEvent {
  id: string;
  userId: string;
  eventType: string;
  targetType: string;
  targetId: string;
  bountyId: string | null;
  submissionId: string | null;
  referrerId: string | null;
  pointsDelta: number;
  validityStatus: string;
  source: string;
  metadata: unknown;
  createdAt: string;
}

export interface ProofOfSupport {
  user: {
    id: string;
    role: string;
    isDemoFallback: boolean;
  };
  points: SupportPoints;
  validBoostCount: number;
  events: SupportEvent[];
}

interface ApiEnvelope<T> {
  data: T;
}

export interface ApiClientOptions {
  baseUrl?: string;
  identity?: DemoIdentity;
}

const envBaseUrl = ((import.meta as unknown as { env?: { VITE_API_BASE_URL?: string } }).env?.VITE_API_BASE_URL) ?? '';

async function requestJson<T>(path: string, init: RequestInit = {}, options: ApiClientOptions = {}): Promise<T> {
  const baseUrl = options.baseUrl ?? envBaseUrl;
  const response = await fetch(`${baseUrl}${path}`, withSessionHeaders(init, options.identity ?? DEFAULT_DEMO_IDENTITY));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `KAIRO API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function jsonInit(method: 'POST' | 'PUT' | 'PATCH', body: unknown): RequestInit {
  return {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export async function getHealth(options?: ApiClientOptions): Promise<HealthResponse> {
  return requestJson<HealthResponse>('/api/health', undefined, options);
}

export async function listBounties(options?: ApiClientOptions): Promise<BountyRecord[]> {
  const response = await requestJson<ApiEnvelope<BountyRecord[]>>('/api/bounties', undefined, options);
  return response.data;
}

export async function getBounty(id: string, options?: ApiClientOptions): Promise<BountyRecord> {
  const response = await requestJson<ApiEnvelope<BountyRecord>>(`/api/bounties/${encodeURIComponent(id)}`, undefined, options);
  return response.data;
}

export async function createBounty(input: CreateBountyInput, options?: ApiClientOptions): Promise<BountyRecord> {
  const response = await requestJson<ApiEnvelope<BountyRecord>>('/api/bounties', jsonInit('POST', input), options);
  return response.data;
}

export async function listSubmissions(bountyId?: string, options?: ApiClientOptions): Promise<SubmissionRecord[]> {
  const query = bountyId ? `?bountyId=${encodeURIComponent(bountyId)}` : '';
  const response = await requestJson<ApiEnvelope<SubmissionRecord[]>>(`/api/submissions${query}`, undefined, options);
  return response.data;
}

export async function getSubmission(id: string, options?: ApiClientOptions): Promise<SubmissionRecord> {
  const response = await requestJson<ApiEnvelope<SubmissionRecord>>(`/api/submissions/${encodeURIComponent(id)}`, undefined, options);
  return response.data;
}

export async function createSubmission(input: CreateSubmissionInput, options?: ApiClientOptions): Promise<SubmissionRecord> {
  const response = await requestJson<ApiEnvelope<SubmissionRecord>>('/api/submissions', jsonInit('POST', input), options);
  return response.data;
}

export async function boostBounty(bountyId: string, options?: ApiClientOptions): Promise<BoostResponse> {
  const identity = options?.identity ?? DEFAULT_DEMO_IDENTITY;
  const response = await requestJson<ApiEnvelope<BoostResponse>>(
    '/api/boosts',
    jsonInit('POST', { bountyId, userId: identity.id, source: 'direct' }),
    { ...options, identity },
  );
  return response.data;
}

export async function boostSubmission(
  submissionId: string,
  bountyId?: string,
  options?: ApiClientOptions,
): Promise<BoostResponse> {
  const identity = options?.identity ?? DEFAULT_DEMO_IDENTITY;
  const response = await requestJson<ApiEnvelope<BoostResponse>>(
    '/api/boosts',
    jsonInit('POST', { bountyId, submissionId, userId: identity.id, source: 'direct' }),
    { ...options, identity },
  );
  return response.data;
}

export async function getLeaderboard(options?: ApiClientOptions): Promise<LeaderboardResponse> {
  const response = await requestJson<ApiEnvelope<LeaderboardResponse>>('/api/leaderboard', undefined, options);
  return response.data;
}

export async function getLeaderboardCategory<T = Array<Record<string, unknown>>>(
  category: string,
  options?: ApiClientOptions,
): Promise<T> {
  const response = await requestJson<ApiEnvelope<T>>(`/api/leaderboard/${category}`, undefined, options);
  return response.data;
}

export async function getProofOfSupport(options?: ApiClientOptions): Promise<ProofOfSupport> {
  const response = await requestJson<ApiEnvelope<ProofOfSupport>>('/api/support/proof/me', undefined, options);
  return response.data;
}
