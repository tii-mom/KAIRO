import type {
  BountyRecord,
  CreateBountyInput,
  CreateSubmissionInput,
  SubmissionRecord,
  SupportEventRecord,
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
}

export interface LeaderboardResponse {
  hottestCatalysts: Array<Record<string, unknown>>;
  topBuilders: Array<Record<string, unknown>>;
  curatedItems: Array<Record<string, unknown>>;
}

export interface ProofOfSupportResponse {
  userId: string;
  totalPoints: number;
  events: SupportEventRecord[];
}

interface ApiEnvelope<T> {
  data: T;
}

export interface ApiClientOptions {
  baseUrl?: string;
  identity?: DemoIdentity;
}

const defaultBaseUrl = '';

async function requestJson<T>(path: string, init: RequestInit = {}, options: ApiClientOptions = {}): Promise<T> {
  const baseUrl = options.baseUrl ?? defaultBaseUrl;
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

export async function getProofOfSupport(options?: ApiClientOptions): Promise<ProofOfSupportResponse> {
  const identity = options?.identity ?? DEFAULT_DEMO_IDENTITY;
  const response = await requestJson<ApiEnvelope<ProofOfSupportResponse>>('/api/proof-of-support', undefined, {
    ...options,
    identity,
  });
  return response.data;
}
