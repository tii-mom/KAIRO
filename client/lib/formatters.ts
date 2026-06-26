import { fundingStatusLabels, type BountyRecord } from '../../shared/domain';

export type FundingStatus = BountyRecord['fundingStatus'];

const fallbackFundingStatusLabel = 'Reward pending KAIRO confirmation';

export function formatFundingStatusLabel(status?: FundingStatus | null): string {
  if (!status) return fallbackFundingStatusLabel;
  return fundingStatusLabels[status] ?? fallbackFundingStatusLabel;
}

export function formatDate(value?: string | number | Date | null, fallback = 'TBD'): string {
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatMomentumCount(count?: number | null, fallback = '0'): string {
  if (typeof count !== 'number' || !Number.isFinite(count)) return fallback;
  return new Intl.NumberFormat('en', { notation: count >= 10_000 ? 'compact' : 'standard' }).format(count);
}

export function fallbackText(value?: string | number | null, fallback = 'Not provided'): string {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}
