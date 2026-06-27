import { useEffect, useState, type FC } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, Copy, Flame, Share2, ShieldCheck, Sparkles, Activity } from 'lucide-react';
import { getProofOfSupport, getProofOfSupportByUser, type ProofOfSupport, type SupportEvent } from '../lib/api';
import { ActionButton, DataRow, EmptyPanel, PageHero, Panel, StatusChip, MomentumBar, AnimatedCounter, PointerGlowCard } from '../components/runtimeUi';
import { ErrorState, LoadingState } from './pageUtils';

export default function ProofOfSupportPage() {
  const { userId } = useParams();
  const [proof, setProof] = useState<ProofOfSupport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const payload = userId ? await getProofOfSupportByUser(userId) : await getProofOfSupport();
      setProof(payload);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Proof of Support');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [userId]);

  if (isLoading) return <LoadingState label="Loading Supporter Proof telemetry..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const hasEvents = Boolean(proof?.events.length);

  const handleCopy = async () => {
    if (!proof) return;
    const copy = `KAIRO Proof of Support\nUser: ${proof.user.id}\nLevel: ${proof.supporterLevel}\nSupport Points: ${proof.points.totalPoints}\nValid Boosts: ${proof.validBoostCount}`;
    await navigator.clipboard.writeText(copy);
    setCopyMessage('Proof summary copied!');
    setTimeout(() => setCopyMessage(null), 2000);
  };

  const getMultiplierVal = (level?: string) => {
    if (level?.toLowerCase().includes('elite')) return '1.50x';
    if (level?.toLowerCase().includes('pro')) return '1.25x';
    return '1.00x';
  };

  const getMultiplierPercent = (level?: string) => {
    if (level?.toLowerCase().includes('elite')) return 100;
    if (level?.toLowerCase().includes('pro')) return 75;
    return 50;
  };

  return (
    <div className="space-y-8 pb-12" id="proof-of-support-page">
      {/* Supporter Dashboard Hero */}
      <PageHero
        eyebrow="Supporter Dashboard"
        title="Proof of Support & Referral Telemetry"
        description="Verify public boost activity, active referrals, and support point multipliers. The logs coordinate community action without asset holding guarantees."
        actions={
          <ActionButton onClick={() => void handleCopy()} tone="primary" className="text-xs uppercase tracking-widest font-bold">
            <Copy className="h-4 w-4" />
            {copyMessage ? 'Copied Summary!' : 'Copy Proof Summary'}
          </ActionButton>
        }
        stats={[
          { label: 'Total Support Points', value: proof?.points.totalPoints ?? 0, detail: 'Contribution multiplier score' },
          { label: 'Boost Points', value: proof?.points.boostPoints ?? 0, detail: 'Earned from active boosts', tone: 'sky' },
          { label: 'Verified Boosts', value: proof?.validBoostCount ?? 0, detail: proof?.supporterLevel ?? 'Signal Level', tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow="State log" title="Support Profile" icon={ShieldCheck}>
            <div className="grid gap-3 font-mono">
              <SignalField label="Identity Address" value={proof?.user.id ?? '0x0000...0000'} />
              <SignalField label="Multiplier Rank" value={proof?.supporterLevel ?? 'New Tracker'} />
              <SignalField label="Data Uplink" value={proof?.user.isDemoFallback ? 'Demo Fallback' : 'Active Registry'} />
              {copyMessage ? (
                <div className="rounded border border-white/5 bg-[#050608] px-3 py-2 text-[10px] text-[#ffb95f] font-bold">
                  {copyMessage}
                </div>
              ) : null}
            </div>
          </Panel>
        }
      />

      {/* Supporter Impact Summary Modules */}
      {proof && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PointerGlowCard className="glass-panel p-5 bg-[#050608]/30 kairo-tilt">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">SUPPORT POINTS</span>
            <div className="text-2xl font-bold text-white mt-1.5 font-mono">
              <AnimatedCounter value={proof.points.totalPoints} />
            </div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">
              Share: <AnimatedCounter value={proof.points.sharePoints} /> pts
            </div>
          </PointerGlowCard>
          
          <PointerGlowCard className="glass-panel p-5 bg-[#050608]/30 kairo-tilt">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">ACTIVE MULTIPLIER</span>
            <div className="text-2xl font-bold text-[#ffb95f] mt-1.5 font-mono">
              <AnimatedCounter 
                value={proof.supporterLevel.toLowerCase().includes('elite') ? 1.5 : proof.supporterLevel.toLowerCase().includes('pro') ? 1.25 : 1.0} 
                formatter={(v) => `${v.toFixed(2)}x`} 
              />
            </div>
            <div className="mt-2.5">
              <MomentumBar percentage={getMultiplierPercent(proof.supporterLevel)} className="h-1.5" />
            </div>
          </PointerGlowCard>

          <PointerGlowCard className="glass-panel p-5 bg-[#050608]/30 kairo-tilt">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">REFERRAL POINTS</span>
            <div className="text-2xl font-bold text-white mt-1.5 font-mono">
              <AnimatedCounter value={proof.points.referralPoints} />
            </div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">Earned from coordinate signups</div>
          </PointerGlowCard>

          <PointerGlowCard className="glass-panel p-5 bg-[#050608]/30 kairo-tilt">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider block">VERIFIED ACTIVITY</span>
            <div className="text-2xl font-bold text-[#4ade80] mt-1.5 font-mono">
              <AnimatedCounter value={proof.validBoostCount} /> Boosts
            </div>
            <div className="text-[10px] text-white/40 mt-1 font-mono">Status: active verification</div>
          </PointerGlowCard>
        </section>
      )}

      {/* Boosted Catalysts & Submissions lists */}
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel eyebrow="Catalyst Proof" title="Boosted Catalysts" icon={Sparkles}>
          <SupportList items={proof?.boostedCatalysts ?? []} empty="No boosted Catalysts yet." pathPrefix="/catalysts" />
        </Panel>
        <Panel eyebrow="Solution Proof" title="Boosted Solutions" icon={Award}>
          <SupportList items={proof?.boostedSubmissions ?? []} empty="No boosted solutions yet." pathPrefix="/submissions" />
        </Panel>
      </div>

      {/* Main event timeline */}
      <Panel eyebrow="Audit feed" title="Support Events Feed" description="Public coordinate ledger records for booster and referral actions.">
        {hasEvents && proof ? (
          <div className="relative pl-6 border-l border-white/5 space-y-4">
            {proof.events.map((event) => (
              <div key={event.id} className="relative group">
                {/* Energy pin indicator */}
                <div className={`absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-[#0c0e14] ${
                  event.validityStatus === 'valid' 
                    ? 'bg-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]' 
                    : event.validityStatus === 'suspicious' 
                    ? 'bg-[#ffb95f] shadow-[0_0_8px_rgba(255,185,95,0.5)] animate-pulse' 
                    : 'bg-[#EE1C25]'
                }`} />
                <div className="glass-panel p-4 hover:border-white/10 transition-colors bg-[#050608]/40">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <div className="text-sm font-bold text-white font-mono uppercase tracking-tight">
                        {formatEventType(event.eventType)}
                      </div>
                      <div className="text-[10px] text-white/50 mt-1 font-mono">
                        Target: {event.targetType} ({event.targetId.slice(0, 8)}...) · Source: {event.source}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <span className="font-mono text-xs font-bold text-[#ffb95f]">
                        {event.pointsDelta >= 0 ? '+' : ''}{event.pointsDelta} PTS
                      </span>
                      <StatusChip tone={event.validityStatus === 'valid' ? 'emerald' : event.validityStatus === 'suspicious' ? 'gold' : 'red'}>
                        {event.validityStatus}
                      </StatusChip>
                    </div>
                  </div>
                  <div className="text-[9px] font-mono text-white/30 mt-2">
                    Committed at: {formatDate(event.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title="No support events logged"
            description="Perform a Catalyst or solution boost to coordinate a visible timeline history."
            action={<Link className="btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" to="/catalysts">Browse Catalysts</Link>}
          />
        )}
      </Panel>
    </div>
  );
}

function SupportList({
  items,
  empty,
  pathPrefix,
}: {
  items: Array<{ id: string; title?: string; name?: string }>;
  empty: string;
  pathPrefix: string;
}) {
  return items.length ? (
    <div className="grid gap-3">
      {items.map((item) => (
        <DataRow
          key={item.id}
          to={`${pathPrefix}/${item.id}`}
          title={item.title ?? item.name ?? item.id}
          badge={<StatusChip tone="gold">tracked</StatusChip>}
        />
      ))}
    </div>
  ) : (
    <EmptyPanel title="No activity recorded" description={empty} />
  );
}

function SignalField({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-panel p-3 border-white/5 bg-[#050608]">
      <div className="text-[8px] uppercase tracking-wider text-white/30">{label}</div>
      <div className="mt-1 text-xs font-semibold text-white/80 truncate">{value}</div>
    </div>
  );
}

function formatEventType(eventType: string) {
  return eventType.replace(/_/g, ' ').replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
