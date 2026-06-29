import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Flame, Github, Globe, PlayCircle } from 'lucide-react';
import { boostSubmission, getSubmission } from '../lib/api';
import type { SubmissionRecord } from '../../shared/domain';
import { ErrorState, LoadingState } from './pageUtils';
import { ActionButton, StatusChip } from '../components/runtimeUi';
import { useI18n } from '../i18n/useI18n';

import ShareButton from '../components/ShareButton';

function getStoredReferralContext() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return { referrerId: undefined, source: 'direct' as const };
  }

  const referrerId = window.sessionStorage.getItem('kairo-referrer-id')?.trim() || undefined;
  return {
    referrerId,
    source: referrerId ? ('referral' as const) : ('direct' as const),
  };
}

export default function SubmissionDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const [submission, setSubmission] = useState<SubmissionRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await getSubmission(id);
      setSubmission(data);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load submission');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label={t('submissionDetail.loading')} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!submission) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const { referrerId, source } = getStoredReferralContext();
      const result = await boostSubmission(submission.id, submission.bountyId, referrerId, source);
      setBoostMessage(result.duplicate ? t('submissionDetail.boostDuplicate') : t('submissionDetail.boostSuccessDelta', { delta: String(result.pointsDelta ?? 0) }));
      await load();
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : t('submissionDetail.boostError'));
    }
  };

  return (
    <article className="glass-panel p-6 sm:p-8 max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <Link to={`/catalysts/${submission.bountyId}`} className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f] hover:underline">
          ← {t('submissionDetail.backToCatalyst')}
        </Link>
        <ShareButton id={submission.id} type="submission" title={submission.name} variant="compact" />
      </div>
      
      <div className="border-b border-white/5 pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{submission.name}</h1>
        <div className="mt-2 text-xs text-white/50 font-mono uppercase tracking-wider flex flex-wrap gap-4 items-center">
          <span>{t('submissionDetail.builderId')}: {submission.builderId}</span>
          <StatusChip tone={submission.status === 'approved' ? 'emerald' : 'gold'}>{submission.status}</StatusChip>
          <span>{t('submissionDetail.delivery')}: <strong className="text-white">{submission.deliveryStatus}</strong></span>
        </div>
      </div>

      <div className="font-sans text-sm text-white/70 leading-relaxed max-w-3xl">
        <p className="font-bold text-white mb-2">{submission.tagline}</p>
        <p>{submission.description}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-t border-white/5 pt-6">
        {submission.demoUrl ? (
          <a className="btn-ghost px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" href={submission.demoUrl} target="_blank" rel="noopener noreferrer">
            <Globe className="h-3.5 w-3.5" />
            {t('submissionDetail.liveDemo')}
          </a>
        ) : null}
        {submission.githubUrl ? (
          <a className="btn-ghost px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" href={submission.githubUrl} target="_blank" rel="noopener noreferrer">
            <Github className="h-3.5 w-3.5" />
            {t('submissionDetail.githubRepo')}
          </a>
        ) : null}
        {submission.videoUrl ? (
          <a className="btn-ghost px-4 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" href={submission.videoUrl} target="_blank" rel="noopener noreferrer">
            <PlayCircle className="h-3.5 w-3.5" />
            {t('submissionDetail.explainerVideo')}
          </a>
        ) : null}
        <ActionButton onClick={handleBoost} tone="ignite" className="px-6 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer">
          <Flame className="h-3.5 w-3.5 animate-pulse" />
          {t('submissionDetail.boostButton')} ({submission.boostCount})
        </ActionButton>
      </div>

      {boostMessage ? (
        <div className="rounded border border-white/5 bg-[#050608] p-4 space-y-3 font-mono">
          <div className="text-xs text-[#ffb95f]">
            {boostMessage}
          </div>
          <div className="border-t border-white/5 pt-3 space-y-2 text-[10px]">
            <div className="text-white/40 font-bold uppercase">{t('beta.nextActionsTitle')}</div>
            <div className="flex flex-col gap-1.5">
              <Link to="/proof" className="text-[#ffb95f] hover:underline">
                {t('beta.nextViewProof')}
              </Link>
              <Link to={`/catalysts/${submission.bountyId}`} className="text-white/60 hover:text-white transition-colors">
                {t('beta.nextBackToCatalyst')}
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
