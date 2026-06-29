import { fundingStatusLabels, type BountyRecord } from '../../shared/domain';

export type FundingStatus = BountyRecord['fundingStatus'];

export function formatFundingStatusLabel(status?: FundingStatus | null, locale: 'en-US' | 'zh-CN' | 'ko-KR' = 'en-US'): string {
  const fallback = locale === 'zh-CN' ? '外部奖励证据待提交' : locale === 'ko-KR' ? '외부 보상 증거 대기 중' : 'External reward evidence pending';
  if (!status) return fallback;
  const labels = fundingStatusLabels[locale] || fundingStatusLabels['en-US'];
  return labels[status] ?? fallback;
}

export function formatDate(
  value?: string | number | Date | null,
  locale: 'en-US' | 'zh-CN' | 'ko-KR' = 'en-US'
): string {
  const fallback = locale === 'zh-CN' ? '待定' : locale === 'ko-KR' ? '미정' : 'TBD';
  if (!value) return fallback;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatMomentumCount(
  count?: number | null,
  locale: 'en-US' | 'zh-CN' | 'ko-KR' = 'en-US'
): string {
  const fallback = '0';
  if (typeof count !== 'number' || !Number.isFinite(count)) return fallback;
  return new Intl.NumberFormat(locale, { notation: count >= 10_000 ? 'compact' : 'standard' }).format(count);
}

export function fallbackText(
  value?: string | number | null,
  locale: 'en-US' | 'zh-CN' | 'ko-KR' = 'en-US'
): string {
  const fallback = locale === 'zh-CN' ? '未提供' : locale === 'ko-KR' ? '제공되지 않음' : 'Not provided';
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}
