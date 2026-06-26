import type {
  BountyRecord,
  CreateBountyInput,
  CreateSubmissionInput,
  CuratedItemRecord,
  FundingEventRecord,
  SubmissionRecord,
} from '../../shared/domain';
import { DEFAULT_DEMO_IDENTITY, type DemoIdentity, withSessionHeaders } from './session';

export interface HealthResponse {
  ok: boolean;
  service: string;
  terms: string[];
}

export interface BoostResponse {
  id?: string;
  supportEventId?: string;
  pointsDelta?: number;
  createdAt?: string;
  duplicate?: boolean;
  existingBoostId?: string;
  message?: string;
}

export interface LeaderboardResponse {
  hottestCatalysts: Array<Record<string, unknown>>;
  confirmedRewardCatalysts: Array<Record<string, unknown>>;
  topBuilders: Array<Record<string, unknown>>;
  mostBoostedSubmissions: Array<Record<string, unknown>>;
  dormantGiants: Array<Record<string, unknown>>;
  breakoutStories: Array<Record<string, unknown>>;
  comebackHall: Array<Record<string, unknown>>;
  genesisCandidates: Array<Record<string, unknown>>;
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
  supporterLevel: string;
  boostedCatalysts: Array<{ id: string; title: string }>;
  boostedSubmissions: Array<{ id: string; name: string }>;
}

export interface AdminStats {
  bounties: number;
  submissions: number;
  boosts: number;
  supportEvents: number;
  activeCuratedItems: number;
}

interface ApiEnvelope<T> {
  data: T;
}

export interface PublicBountyRecord extends BountyRecord {
  tokenSymbol?: string | null;
  tokenName?: string | null;
  tokenChain?: string | null;
  tokenContractAddress?: string | null;
  tokenWebsiteUrl?: string | null;
  tokenTwitterUrl?: string | null;
  tokenTelegramUrl?: string | null;
}

export interface ApiClientOptions {
  baseUrl?: string;
  identity?: DemoIdentity;
}

const envBaseUrl = ((import.meta as unknown as { env?: { VITE_KAIRO_API_BASE_URL?: string } }).env?.VITE_KAIRO_API_BASE_URL) ?? '';

function camelizeKey(key: string) {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function camelizeRecord<T extends Record<string, unknown>>(record: T) {
  return Object.fromEntries(
    Object.entries(record).map(([key, value]) => [camelizeKey(key), key === 'featured' ? Boolean(value) : value]),
  );
}

function normalizePublicRecord<T>(record: Record<string, unknown>): T {
  return camelizeRecord(record) as T;
}

function normalizePublicRecords<T>(records: Array<Record<string, unknown>>): T[] {
  return records.map((record) => normalizePublicRecord<T>(record));
}

function resolveBaseUrl(options?: ApiClientOptions) {
  return options?.baseUrl ?? envBaseUrl;
}

async function requestJson<T>(path: string, init: RequestInit = {}, options: ApiClientOptions = {}): Promise<T> {
  const response = await fetch(`${resolveBaseUrl(options)}${path}`, withSessionHeaders(init, options.identity ?? DEFAULT_DEMO_IDENTITY));

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
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/bounties', undefined, options);
  return normalizePublicRecords<BountyRecord>(response.data);
}

export async function getBounty(id: string, options?: ApiClientOptions): Promise<PublicBountyRecord> {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/bounties/${encodeURIComponent(id)}`, undefined, options);
  return normalizePublicRecord<PublicBountyRecord>(response.data);
}

export async function createBounty(input: CreateBountyInput, options?: ApiClientOptions): Promise<PublicBountyRecord> {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>('/api/bounties', jsonInit('POST', input), options);
  return normalizePublicRecord<PublicBountyRecord>(response.data);
}

export async function listFundingEvents(bountyId: string, options?: ApiClientOptions): Promise<FundingEventRecord[]> {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>(`/api/bounties/${encodeURIComponent(bountyId)}/funding-events`, undefined, options);
  return normalizePublicRecords<FundingEventRecord>(response.data);
}

export async function listSubmissions(bountyId?: string, options?: ApiClientOptions): Promise<SubmissionRecord[]> {
  const query = bountyId ? `?bountyId=${encodeURIComponent(bountyId)}` : '';
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>(`/api/submissions${query}`, undefined, options);
  return normalizePublicRecords<SubmissionRecord>(response.data);
}

export async function getSubmission(id: string, options?: ApiClientOptions): Promise<SubmissionRecord> {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/submissions/${encodeURIComponent(id)}`, undefined, options);
  return normalizePublicRecord<SubmissionRecord>(response.data);
}

export async function createSubmission(input: CreateSubmissionInput, options?: ApiClientOptions): Promise<SubmissionRecord> {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>('/api/submissions', jsonInit('POST', input), options);
  return normalizePublicRecord<SubmissionRecord>(response.data);
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

export async function boostSubmission(submissionId: string, bountyId?: string, options?: ApiClientOptions): Promise<BoostResponse> {
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

export async function getLeaderboardCategory<T = Array<Record<string, unknown>>>(category: string, options?: ApiClientOptions): Promise<T> {
  const response = await requestJson<ApiEnvelope<T>>(`/api/leaderboard/${category}`, undefined, options);
  return response.data;
}

export async function getProofOfSupport(options?: ApiClientOptions): Promise<ProofOfSupport> {
  const response = await requestJson<ApiEnvelope<ProofOfSupport>>('/api/support/proof/me', undefined, options);
  return response.data;
}

export async function getProofOfSupportByUser(userId: string, options?: ApiClientOptions): Promise<ProofOfSupport> {
  const response = await requestJson<ApiEnvelope<ProofOfSupport>>(`/api/support/proof/${encodeURIComponent(userId)}`, undefined, options);
  return response.data;
}

export async function listCuratedItems(options?: ApiClientOptions): Promise<CuratedItemRecord[]> {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/curated-items', undefined, options);
  return normalizePublicRecords<CuratedItemRecord>(response.data);
}

export async function listCuratedItemsByPlacement(placement: string, options?: ApiClientOptions): Promise<CuratedItemRecord[]> {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>(`/api/curated-items/${encodeURIComponent(placement)}`, undefined, options);
  return normalizePublicRecords<CuratedItemRecord>(response.data);
}

export async function listCuratedItemsByType(itemType: string, options?: ApiClientOptions): Promise<CuratedItemRecord[]> {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>(`/api/curated-items/type/${encodeURIComponent(itemType)}`, undefined, options);
  return normalizePublicRecords<CuratedItemRecord>(response.data);
}

export async function listAdminBounties(params: { status?: string; fundingStatus?: string } = {}, options?: ApiClientOptions) {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.fundingStatus) search.set('fundingStatus', params.fundingStatus);
  const query = search.toString() ? `?${search.toString()}` : '';
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>(`/api/admin/bounties${query}`, undefined, options);
  return response.data;
}

export async function patchAdminBountyStatus(id: string, status: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/bounties/${encodeURIComponent(id)}/status`, jsonInit('PATCH', { status }), options);
  return response.data;
}

export async function patchAdminBountyFundingStatus(id: string, fundingStatus: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/bounties/${encodeURIComponent(id)}/funding-status`, jsonInit('PATCH', { fundingStatus }), options);
  return response.data;
}

export async function createAdminFundingEvent(id: string, body: { amountText?: string; proofUrl?: string; note: string; eventType?: string }, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/bounties/${encodeURIComponent(id)}/funding-events`, jsonInit('POST', body), options);
  return response.data;
}

export async function listAdminSubmissions(options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/admin/submissions', undefined, options);
  return response.data;
}

export async function patchAdminSubmissionStatus(id: string, status: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/submissions/${encodeURIComponent(id)}/status`, jsonInit('PATCH', { status }), options);
  return response.data;
}

export async function patchAdminSubmissionDeliveryStatus(id: string, deliveryStatus: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/submissions/${encodeURIComponent(id)}/delivery-status`, jsonInit('PATCH', { deliveryStatus }), options);
  return response.data;
}

export async function listAdminBoosts(options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/admin/boosts', undefined, options);
  return response.data;
}

export async function patchAdminBoostValidityStatus(id: string, validityStatus: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/boosts/${encodeURIComponent(id)}/validity-status`, jsonInit('PATCH', { validityStatus }), options);
  return response.data;
}

export async function listAdminSupportEvents(options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/admin/support-events', undefined, options);
  return response.data;
}

export async function patchAdminSupportEventValidityStatus(id: string, validityStatus: string, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/support-events/${encodeURIComponent(id)}/validity-status`, jsonInit('PATCH', { validityStatus }), options);
  return response.data;
}

export async function listAdminCuratedItems(options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Array<Record<string, unknown>>>>('/api/admin/curated-items', undefined, options);
  return response.data;
}

export async function createAdminCuratedItem(body: Record<string, unknown>, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>('/api/admin/curated-items', jsonInit('POST', body), options);
  return response.data;
}

export async function patchAdminCuratedItem(id: string, body: Record<string, unknown>, options?: ApiClientOptions) {
  const response = await requestJson<ApiEnvelope<Record<string, unknown>>>(`/api/admin/curated-items/${encodeURIComponent(id)}`, jsonInit('PATCH', body), options);
  return response.data;
}

export async function getAdminStats(options?: ApiClientOptions): Promise<AdminStats> {
  const response = await requestJson<ApiEnvelope<AdminStats>>('/api/admin/stats', undefined, options);
  return response.data;
}
