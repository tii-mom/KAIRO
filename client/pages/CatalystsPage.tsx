import { useEffect, useState, type FC } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Award, Flame, FolderKanban, Info, Plus, ShieldCheck } from 'lucide-react';
import { boostBounty, getBounty, listBounties, listFundingEvents, listSubmissions, type PublicBountyRecord } from '../lib/api';
import { fundingStatusLabels, type BountyRecord, type FundingEventRecord, type SubmissionRecord } from '../../shared/domain';
import { fallbackText, formatDate, formatFundingStatusLabel, formatMomentumCount } from '../lib/formatters';
import { ActionButton, ActionLink, DataRow, EmptyPanel, MomentumBar, PageHero, Panel, StatusChip, AnimatedCounter, PointerGlowCard } from '../components/runtimeUi';
import { EmptyState, ErrorState, LoadingState } from './pageUtils';

type ApiBounty = PublicBountyRecord & {
  tokenSymbol?: string | null;
  tokenName?: string | null;
  tokenChain?: string | null;
};

export function CatalystDetailPage() {
  const { id } = useParams();
  const [catalyst, setCatalyst] = useState<ApiBounty | null>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);
  const [fundingEvents, setFundingEvents] = useState<FundingEventRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [boostMessage, setBoostMessage] = useState<string | null>(null);
  const [boostSuccess, setBoostSuccess] = useState(false);

  const load = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [bountyData, submissionData, fundingData] = await Promise.all([
        getBounty(id),
        listSubmissions(id),
        listFundingEvents(id),
      ]);
      setCatalyst(bountyData as ApiBounty);
      setSubmissions(submissionData);
      setFundingEvents(fundingData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalyst details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label="Loading Catalyst detail console..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!catalyst) return <Navigate to="/catalysts" replace />;

  const handleBoost = async () => {
    try {
      const result = await boostBounty(id);
      setBoostMessage(result.duplicate ? 'Boost already recorded for this user.' : `Boost recorded: +${result.pointsDelta ?? 0} support points.`);
      if (!result.duplicate) {
        setBoostSuccess(true);
        setTimeout(() => setBoostSuccess(false), 700);
      }
      await load();
    } catch (boostError) {
      setBoostMessage(boostError instanceof Error ? boostError.message : 'Unable to record Boost.');
    }
  };

  const copyAddress = () => {
    const address = catalyst.tokenContractAddress || '';
    if (!address) return;
    void navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Detail Header Block */}
      <div className="border-b border-white/5 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link to="/catalysts" className="text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f] hover:underline">
            ← Back to Registry
          </Link>
          <span className="text-white/20">|</span>
          <span className="inline-flex rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider text-[#ffb95f]">
            Active Catalyst
          </span>
          <span className="text-white/40 font-mono text-[9px] uppercase tracking-wider">Scope: Discovery Mode</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-5xl font-bold tracking-tight text-white mb-3">{catalyst.title}</h1>
        <p className="font-sans text-[#c4c7c7] text-sm sm:text-base max-w-3xl leading-relaxed">{catalyst.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Details, Objectives, Milestones */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Project Profile & Chart */}
          <PointerGlowCard className="glass-panel rounded-lg overflow-hidden kairo-tilt">
            <div className="glass-header px-6 py-4 flex justify-between items-center">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">Project Profile</h2>
              <div className="flex gap-2">
                {catalyst.tokenWebsiteUrl ? (
                  <a href={catalyst.tokenWebsiteUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-2.5 py-1 text-[9px] font-mono tracking-widest font-bold">
                    WEBSITE
                  </a>
                ) : (
                  <span className="text-[9px] font-mono text-white/30 border border-white/5 px-2.5 py-1 rounded">WEBSITE UNAVAILABLE</span>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded bg-[#0c0e14] flex items-center justify-center border border-white/5 shadow-[0_0_15px_rgba(255,185,95,0.15)] text-[#ffb95f]">
                  <span className="font-mono text-xl font-bold">{catalyst.tokenSymbol ? catalyst.tokenSymbol.slice(0, 3) : 'KAI'}</span>
                </div>
                <div>
                  <div className="font-sans text-lg font-bold text-white">{catalyst.tokenName || 'KAIRO Network Token'}</div>
                  <div className="font-mono text-[11px] text-white/50 flex items-center gap-2 mt-1">
                    <span>Address: {catalyst.tokenContractAddress ? `${catalyst.tokenContractAddress.slice(0, 6)}...${catalyst.tokenContractAddress.slice(-4)}` : 'Pending verification / Not provided'}</span>
                    {catalyst.tokenContractAddress ? (
                      <button onClick={copyAddress} className="text-[#ffb95f] hover:text-white transition-colors" title="Copy Address">
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Compact metadata rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-6 text-xs font-mono mb-6">
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/40">CHAIN</span>
                  <span className="text-white font-bold uppercase">{catalyst.tokenChain || 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                  <span className="text-white/40">WEBSITE</span>
                  {catalyst.tokenWebsiteUrl ? (
                    <a href={catalyst.tokenWebsiteUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      Link
                    </a>
                  ) : (
                    <span className="text-white/30 italic">Not provided</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-white/5 md:border-b-0">
                  <span className="text-white/40">TWITTER</span>
                  {catalyst.tokenTwitterUrl ? (
                    <a href={catalyst.tokenTwitterUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      Link
                    </a>
                  ) : (
                    <span className="text-white/30 italic">Not provided</span>
                  )}
                </div>
                <div className="flex justify-between items-center py-1.5 md:py-0">
                  <span className="text-white/40">TELEGRAM</span>
                  {catalyst.tokenTelegramUrl ? (
                    <a href={catalyst.tokenTelegramUrl} target="_blank" rel="noopener noreferrer" className="text-[#ffb95f] hover:underline">
                      Link
                    </a>
                  ) : (
                    <span className="text-white/30 italic">Not provided</span>
                  )}
                </div>
              </div>

              {/* simulated Telemetry Chart Area */}
              <div className="w-full h-44 bg-[#050608] rounded border border-white/5 relative overflow-hidden flex flex-col justify-between p-4">
                <div className="absolute inset-0 bg-energy-line opacity-10 pointer-events-none" />
                <div className="font-mono text-[10px] text-[#ffb95f] flex justify-between z-10">
                  <span>REVIVAL SIGNAL TELEMETRY</span>
                  <span className="text-[#4ade80]">+28.4% MOMENTUM</span>
                </div>
                
                {/* Visual grid chart bars */}
                <div className="w-full h-24 flex items-end justify-between px-2 pb-1 relative z-10">
                  <div className="w-[12%] h-[20%] bg-[#ffb95f]/10 border-t border-[#ffb95f]/30 rounded-t"></div>
                  <div className="w-[12%] h-[35%] bg-[#ffb95f]/15 border-t border-[#ffb95f]/40 rounded-t"></div>
                  <div className="w-[12%] h-[25%] bg-[#ffb95f]/10 border-t border-[#ffb95f]/30 rounded-t"></div>
                  <div className="w-[12%] h-[55%] bg-[#ffb95f]/20 border-t border-[#ffb95f]/50 rounded-t"></div>
                  <div className="w-[12%] h-[40%] bg-[#ffb95f]/15 border-t border-[#ffb95f]/40 rounded-t"></div>
                  <div className="w-[12%] h-[75%] bg-[#ffb95f]/30 border-t-2 border-[#ffb95f] rounded-t relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#ffb95f] rounded-full animate-ping" />
                  </div>
                </div>

                <div className="text-[9px] font-mono text-white/30 italic text-left border-t border-white/5 pt-1.5 z-10">
                  Illustrative preview — not chain, market, or reward data. Telemetry reflects coordination signal intensity and community boost logs. This does not represent financial or price movement.
                </div>
              </div>
            </div>
          </PointerGlowCard>

          {/* Mission Objectives */}
          <section className="glass-panel rounded-lg p-6">
            <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80 border-b border-white/5 pb-4 mb-4">Mission Blueprint</h2>
            <div className="font-sans text-xs sm:text-sm text-white/70 space-y-4 leading-relaxed">
              <p>This Catalyst seeks builder implementation for the legacy token revival path. Supporter boosts increase coordination signals, signaling core momentum to development contributors.</p>
              <div className="bg-[#050608] p-4 rounded border border-white/5 mt-4">
                <h3 className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-3">Key Technical Targets</h3>
                <ul className="list-disc list-inside space-y-2 font-mono text-xs text-white/60">
                  <li>Verify community deliverable integrity on public routes.</li>
                  <li>Build zero-fee analytics telemetry dashboard pipelines.</li>
                  <li>Incentivize long-term code support records for builders.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Project Milestones */}
          <section className="glass-panel rounded-lg p-6">
            <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80 border-b border-white/5 pb-4 mb-6">Workflow Pipeline</h2>
            <p className="text-[11px] text-white/40 mb-6 font-mono">Standard roadmap stages of the KAIRO coordination flow. Actual technical progress varies by contributor solution reviews.</p>
            <div className="relative pl-6 border-l border-white/5 space-y-8">
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-[#ffb95f] ring-4 ring-[#0c0e14]"></div>
                <div className="font-mono text-[10px] text-[#ffb95f] mb-1">STAGE 1: PLANNING</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">Ecosystem Signal Bootstrapping</h4>
                <p className="font-sans text-xs text-white/50">Initial catalyst deployment and coordinate launchpad signal tracking.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-[#EE1C25] ring-4 ring-[#0c0e14] shadow-[0_0_8px_rgba(238,28,37,0.5)] animate-pulse"></div>
                <div className="font-mono text-[10px] text-[#EE1C25] mb-1">STAGE 2: ACTIVE (CURRENT)</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">Builder Solutions Delivery</h4>
                <p className="font-sans text-xs text-white/50">Recruiting builders to submit functional solution demos and code artifacts.</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[30px] top-1 w-3 h-3 rounded bg-white/20 ring-4 ring-[#0c0e14]"></div>
                <div className="font-mono text-[10px] text-white/30 mb-1">STAGE 3: VERIFICATION</div>
                <h4 className="font-sans text-sm font-bold text-white mb-1">Review & Telemetry Log</h4>
                <p className="font-sans text-xs text-white/50">Evaluating support proof metrics and applying KAIRO developer score points.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Support, Bounty Pool, Top Boosters */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Support Panel */}
          <section className="glass-panel rounded-lg p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#EE1C25]/5 blur-[40px] pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-2">Ecosystem Momentum</div>
              <div className="font-sans text-4xl font-black text-[#EE1C25] tracking-tight mb-4 flex items-baseline gap-1">
                <AnimatedCounter value={catalyst.momentumScore} formatter={formatMomentumCount} /> <span className="font-mono text-xs text-white/40 uppercase">PTS</span>
              </div>
              <MomentumBar percentage={75} className="w-full mb-6" />
              <ActionButton tone="ignite" onClick={() => void handleBoost()} className={`w-full py-3 text-xs uppercase tracking-widest font-bold ${boostSuccess ? 'animate-success-pulse' : ''}`}>
                Boost Catalyst
              </ActionButton>
              {boostMessage ? (
                <div className="mt-4 w-full rounded border border-white/5 bg-white/[0.02] p-3 text-[11px] font-mono text-[#ffb95f]">
                  {boostMessage}
                </div>
              ) : null}
            </div>
          </section>

          {/* Builder Bounty */}
          <section className="glass-panel rounded-lg p-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">Builder Reward</h2>
              <Award className="h-4 w-4 text-[#ffb95f]" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-white/40 mb-1">VERIFIED POOL / REWARD RECORD</div>
              <div className="font-sans text-xl font-bold text-white mb-4">
                {catalyst.rewardText ? catalyst.rewardText : <span className="text-white/40 italic">Reward record pending</span>}
              </div>
              <div className="flex items-center justify-between p-3 bg-[#050608] rounded border border-white/5 mb-4 text-xs font-mono">
                <span className="text-white/40">Funding Status:</span>
                <span className="bg-[#ffb95f]/15 text-[#ffb95f] border border-[#ffb95f]/30 px-2 py-0.5 rounded text-[10px] uppercase font-semibold">
                  {formatFundingStatusLabel(catalyst.fundingStatus)}
                </span>
              </div>
              <p className="text-xs text-white/50 leading-5">
                Funding coordinate label is logged in public repository records, verified strictly based on completed milestones and review updates.
              </p>
            </div>
          </section>

          {/* Top Supporters */}
          <section className="glass-panel rounded-lg overflow-hidden">
            <div className="glass-header px-6 py-4">
              <h2 className="text-sm font-bold tracking-wider font-mono uppercase text-white/80">Top Supporters</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-white/5">
                <span className="text-white/60">1. Referral network</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">2,400 PTS</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono py-1.5 border-b border-white/5">
                <span className="text-white/60">2. Developer score board</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">1,950 PTS</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono py-1.5">
                <span className="text-white/60">3. Support timeline logic</span>
                <span className="font-mono text-xs text-[#ffb95f] font-semibold">1,850 PTS</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Submissions Section */}
      <div className="mt-12 border-t border-white/5 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Builder Submissions</h2>
          <span className="bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded text-xs font-mono">{submissions.length}</span>
        </div>
        
        {submissions.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {submissions.map((submission) => (
              <div key={submission.id} className="glass-panel p-5 bg-[#0c0e14]/60 border-white/5 hover:border-[#ffb95f]/30 transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white tracking-tight">{submission.name}</h4>
                      <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">
                        BUILDER: {submission.builderName || submission.builderId || 'Unknown'}
                      </p>
                    </div>
                    <Link to={`/submissions/${submission.id}`} className="text-white/30 hover:text-[#ffb95f] transition-colors shrink-0" title="Solution details">
                      <Info className="h-4 w-4" />
                    </Link>
                  </div>
                  <p className="text-xs text-white/60 leading-5 mb-4">{submission.tagline || submission.description}</p>
                </div>
                
                {/* Proof Links Row */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono mb-4 text-white/40">
                  {submission.demoUrl ? (
                    <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">DEMO</a>
                  ) : <span className="opacity-50">NO_DEMO</span>}
                  <span>·</span>
                  {submission.githubUrl ? (
                    <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">CODE</a>
                  ) : <span className="opacity-50">NO_CODE</span>}
                  <span>·</span>
                  {submission.videoUrl ? (
                    <a href={submission.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#ffb95f] underline">VIDEO</a>
                  ) : <span className="opacity-50">NO_VIDEO</span>}
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-auto">
                  <StatusChip tone={submission.status === 'approved' ? 'emerald' : 'gold'}>
                    {submission.status}
                  </StatusChip>
                  <div className="text-right">
                    <span className="font-mono text-xs text-[#ffb95f] font-bold">{submission.boostCount} Boosts</span>
                    <div className="text-[9px] font-mono text-white/30 mt-0.5">{formatDate(submission.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyPanel
            title="Awaiting solutions submissions"
            description="Active Catalyst lane is waiting for the first builder solution. Claim the objective to get started."
          />
        )}
      </div>

      {/* Funding log */}
      <div className="mt-8">
        <Panel eyebrow="Evidence log" title="Reward Confirmation Records" description="Public-safe verified funding confirmation notes." icon={ShieldCheck}>
          <div className="grid gap-3">
            {fundingEvents.length ? (
              fundingEvents.map((event) => (
                <DataRow
                  key={event.id}
                  title={event.amountText ?? 'Reward confirmation note'}
                  subtitle={event.note ?? 'Verified by community coordinates.'}
                  meta={formatDate(event.createdAt)}
                  badge={<StatusChip tone="emerald">recorded</StatusChip>}
                />
              ))
            ) : (
              <EmptyPanel
                title="Awaiting event logs"
                description="Community confirmation logs will stream here as payments are coordinates."
              />
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function CatalystsPage() {
  const [catalysts, setCatalysts] = useState<ApiBounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const items = await listBounties();
      setCatalysts(items as ApiBounty[]);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalysts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  if (isLoading) return <LoadingState label="Connecting to Catalyst registry..." />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;

  const confirmed = catalysts.filter((item) => item.fundingStatus !== 'unverified');
  const featured = catalysts.filter((item) => item.featured).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* Registry Hero */}
      <PageHero
        eyebrow="Catalyst Registry"
        title="Dormant Token Resurrection marketplace"
        description="Monitor community resurrection briefs, verify public reward records, and coordinate builder solutions safely in the registry command dashboard."
        actions={
          <>
            <ActionLink to="/create-catalyst" className="text-xs uppercase tracking-widest font-bold">Create Catalyst</ActionLink>
            <ActionLink tone="secondary" to="/leaderboard" className="text-xs uppercase tracking-widest font-bold">Open rankings Grid</ActionLink>
          </>
        }
        stats={[
          { label: 'Live Lanes', value: catalysts.length, detail: 'Resurrection missions active' },
          { label: 'Verified', value: confirmed.length, detail: 'Public reward state recorded', tone: 'emerald' },
          { label: 'Featured', value: featured.length, detail: 'High-priority tracker lanes', tone: 'sky' },
        ]}
        aside={
          <Panel eyebrow="Ignition Switch" title="Ignite a new Catalyst" icon={Plus}>
            <p className="text-xs leading-5 text-white/50">
              Provide project detail specifications, token metadata, target milestones, and contact verification to invite builder participation.
            </p>
            <div className="mt-5">
              <Link className="btn-primary px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5" to="/create-catalyst">
                Ignite Catalyst
                <Plus className="h-4 w-4" />
              </Link>
            </div>
          </Panel>
        }
      />

      {catalysts.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
          <Panel eyebrow="Registry grid" title="Active Catalyst Lanes" description="Explore resurrection lanes to submit builder code solutions.">
            <div className="grid gap-3">
              {catalysts.map((catalyst) => (
                <DataRow
                  key={catalyst.id}
                  to={`/catalysts/${catalyst.id}`}
                  title={catalyst.title}
                  subtitle={catalyst.description}
                  value={formatMomentumCount(catalyst.momentumScore)}
                  meta={`Boosts: ${catalyst.boostCount}  Solutions: ${catalyst.submissionCount}`}
                  badge={<StatusChip tone="gold">{formatFundingStatusLabel(catalyst.fundingStatus)}</StatusChip>}
                />
              ))}
            </div>
          </Panel>

          <div className="grid gap-6">
            <Panel eyebrow="Telemetry Status" title="Reward-Visible Lanes" icon={ShieldCheck}>
              <div className="grid gap-3">
                {confirmed.length ? (
                  confirmed.slice(0, 5).map((item) => (
                    <DataRow
                      key={item.id}
                      to={`/catalysts/${item.id}`}
                      title={item.title}
                      subtitle={item.tokenSymbol ?? item.tokenId}
                      value={formatFundingStatusLabel(item.fundingStatus)}
                      badge={<StatusChip tone="emerald">verified rewards</StatusChip>}
                    />
                  ))
                ) : (
                  <EmptyPanel
                    title="No confirmed rewards logged"
                    description="Verified reward structures will stream here once operators confirm inputs."
                  />
                )}
              </div>
            </Panel>

            <Panel eyebrow="Catalyst watch" title="Ecosystem Highlights" icon={Flame}>
              <div className="grid gap-3">
                {(featured.length ? featured : catalysts.slice(0, 3)).map((catalyst) => (
                  <article key={catalyst.id} className="glass-panel p-4 flex flex-col justify-between bg-[#0c0e14]/40">
                    <div>
                      <StatusChip tone="gold">{catalyst.featured ? 'featured target' : 'watchlist'}</StatusChip>
                      <h3 className="mt-4 text-base font-bold tracking-tight text-white">{catalyst.title}</h3>
                      <p className="mt-2 text-xs leading-5 text-white/50">{catalyst.description}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3 border-t border-white/5 pt-3 font-mono text-[9px] uppercase tracking-wider text-white/30">
                      <span>Momentum: {formatMomentumCount(catalyst.momentumScore)}</span>
                      <span>Boosts: {catalyst.boostCount}</span>
                    </div>
                  </article>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      ) : (
        <EmptyState title="No Catalysts yet" description="Seed data is empty or active database tables are clean. Ignite a Catalyst to begin." />
      )}
    </div>
  );
}
