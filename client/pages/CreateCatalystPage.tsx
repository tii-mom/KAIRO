import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Flame, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { createBounty } from '../lib/api';
import { ErrorState } from './pageUtils';
import { FormField, FormTextArea, ActionButton } from '../components/runtimeUi';

export default function CreateCatalystPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states to support validation & review screen
  const [tokenName, setTokenName] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [chain, setChain] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rewardText, setRewardText] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [deadline, setDeadline] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  const [stepErrors, setStepErrors] = useState<string | null>(null);

  const steps = [
    { id: 1, label: 'Token Identity', desc: 'Specify asset details' },
    { id: 2, label: 'Catalyst Mission', desc: 'Resurrection objective' },
    { id: 3, label: 'Reward & Timeline', desc: 'Escrows & targets' },
    { id: 4, label: 'Access Channels', desc: 'Contact & socials' },
    { id: 5, label: 'Review & Submit', desc: 'Verify coordination specs' },
  ];

  const validateStep = (step: number) => {
    setStepErrors(null);
    if (step === 1) {
      if (!tokenName.trim() || !tokenSymbol.trim() || !chain.trim()) {
        setStepErrors('Token Name, Symbol, and Target Chain are required fields.');
        return false;
      }
    }
    if (step === 2) {
      if (!title.trim() || !description.trim()) {
        setStepErrors('Catalyst Title and detailed Objective Brief are required.');
        return false;
      }
      if (description.trim().length < 20) {
        setStepErrors('Objective Brief must be at least 20 characters.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setStepErrors(null);
    setActiveStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      setActiveStep(1);
      return;
    }
    setIsSubmitting(true);
    setError(null);

    try {
      const catalyst = await createBounty({
        tokenName,
        tokenSymbol,
        chain,
        title,
        description,
        rewardText,
        rewardType: 'offchain',
        contactInfo,
        deadline,
        websiteUrl: websiteUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        telegramUrl: telegramUrl.trim() || undefined,
      });
      navigate(`/catalysts/${catalyst.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create Catalyst');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Title Header */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
          <Flame className="h-4 w-4 text-[#EE1C25] animate-pulse" />
          Ignite Catalyst Flow
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">Ignite a Resurrection Catalyst</h1>
        <p className="mt-2 text-xs text-white/50 leading-5">
          Provide project specifications, token metadata, target milestones, and contact verification to list this Catalyst lane on KAIRO.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Step Progress Track */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 space-y-6">
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-2">
              Pipeline Progress
            </div>
            <nav className="space-y-4">
              {steps.map((s) => {
                const isActive = s.id === activeStep;
                const isCompleted = s.id < activeStep;
                return (
                  <div key={s.id} className="flex items-start gap-3 text-left">
                    <div className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border transition-colors ${
                      isActive 
                        ? 'border-[#ffb95f] bg-[#ffb95f]/15 text-[#ffb95f] shadow-[0_0_10px_rgba(255,185,95,0.25)]' 
                        : isCompleted 
                        ? 'border-[#EE1C25] bg-[#EE1C25]/10 text-[#EE1C25]' 
                        : 'border-white/10 text-white/30'
                    }`}>
                      {s.id}
                    </div>
                    <div className="min-w-0">
                      <div className={`text-[11px] font-mono uppercase tracking-wider ${isActive ? 'text-[#ffb95f] font-bold' : isCompleted ? 'text-white/80' : 'text-white/30'}`}>
                        {s.label}
                      </div>
                      <div className="text-[9px] text-white/40 truncate hidden lg:block">{s.desc}</div>
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Right Column: Active Step Inputs Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-9 space-y-6">
          <div className="glass-panel p-6 sm:p-8 space-y-6">
            
            {/* Step 1: Token Identity */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_01_TOKEN_IDENTITY]</span>
                  <h3 className="text-base font-bold text-white mt-1">Specify Token Asset Metadata</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">Define the ticker symbol, name, and underlying blockchain of the dormant asset.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField 
                    name="tokenName" 
                    label="Token Name" 
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="e.g. DeFi Liquidity Engine" 
                    required 
                  />
                  <FormField 
                    name="tokenSymbol" 
                    label="Token Symbol" 
                    value={tokenSymbol}
                    onChange={(e) => setTokenSymbol(e.target.value)}
                    placeholder="e.g. DLE" 
                    required 
                  />
                  <FormField 
                    name="chain" 
                    label="Target Protocol Chain" 
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    placeholder="e.g. Ethereum, Arbitrum" 
                    required 
                  />
                </div>
              </div>
            )}

            {/* Step 2: Catalyst Mission */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_02_CATALYST_MISSION]</span>
                  <h3 className="text-base font-bold text-white mt-1">Define Resurrection Objectives</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">Outline the core targets and technical specifications required from builders.</p>
                </div>
                <div className="space-y-6">
                  <FormField 
                    name="title" 
                    label="Catalyst Objective Title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Cross-Chain Routing Engine Implementation" 
                    required 
                  />
                  <FormTextArea 
                    name="description" 
                    label="Detailed Objective Brief (Min 20 chars)" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain the token context, builder requirements, and how the solution revives token utility..." 
                    required 
                    minLength={20} 
                    rows={6} 
                  />
                </div>
              </div>
            )}

            {/* Step 3: Reward & Timeline */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_03_REWARD_TIMELINE]</span>
                  <h3 className="text-base font-bold text-white mt-1">Bounty Rewards & Submission Deadlines</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">Declare what coordinators or supporters have committed to reward successful builders.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField 
                    name="rewardText" 
                    label="Reward Structure Description" 
                    value={rewardText}
                    onChange={(e) => setRewardText(e.target.value)}
                    placeholder="e.g. 50,000 USDC via milestone multi-sig" 
                  />
                  <FormField 
                    name="deadline" 
                    label="Submission Deadline" 
                    type="datetime-local" 
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Access Channels */}
            {activeStep === 4 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_04_ACCESS_CHANNELS]</span>
                  <h3 className="text-base font-bold text-white mt-1">Ecosystem Links & Coordinator Contacts</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">List project website resources and telegram/discord handles for coordination.</p>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField 
                    name="websiteUrl" 
                    label="Website URL" 
                    type="url" 
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://" 
                  />
                  <FormField 
                    name="twitterUrl" 
                    label="X (Twitter) URL" 
                    type="url" 
                    value={twitterUrl}
                    onChange={(e) => setTwitterUrl(e.target.value)}
                    placeholder="https://x.com/" 
                  />
                  <FormField 
                    name="telegramUrl" 
                    label="Telegram Channel URL" 
                    type="url" 
                    value={telegramUrl}
                    onChange={(e) => setTelegramUrl(e.target.value)}
                    placeholder="https://t.me/" 
                  />
                  <FormField 
                    name="contactInfo" 
                    label="Coordinator Contact Details" 
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="e.g. @coordinators_handle / email" 
                  />
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {activeStep === 5 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-white/5 pb-3">
                  <span className="font-mono text-[9px] text-[#4ade80] uppercase tracking-widest">[SECTION_05_REVIEW_SUBMIT]</span>
                  <h3 className="text-base font-bold text-white mt-1">Verify Specifications</h3>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">Confirm that all details are accurate before committing the Catalyst lane to public indexes.</p>
                </div>
                
                {/* Summary Card */}
                <div className="rounded border border-white/5 bg-[#050608] p-5 space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                    <div>
                      <span className="text-white/40 block">TOKEN NAME</span>
                      <span className="text-white font-bold">{tokenName}</span>
                    </div>
                    <div>
                      <span className="text-white/40 block">SYMBOL (CHAIN)</span>
                      <span className="text-white font-bold">{tokenSymbol} ({chain})</span>
                    </div>
                  </div>
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-white/40 block">CATALYST TITLE</span>
                    <span className="text-white font-bold">{title}</span>
                  </div>
                  <div className="border-b border-white/5 pb-3">
                    <span className="text-white/40 block">REWARD STRUCTURE</span>
                    <span className="text-[#ffb95f] font-bold">{rewardText || 'Not specified (Pending validation)'}</span>
                  </div>
                  <div>
                    <span className="text-white/40 block">COORDINATOR CONTACT</span>
                    <span className="text-white">{contactInfo || 'None provided'}</span>
                  </div>
                </div>

                <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-4 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-[#ffb95f] shrink-0" />
                  <p className="text-[11px] leading-5 text-white/60">
                    Resurrection lanes coordinates are committed to public logs. Standard compliance audits apply. Double-check all contract inputs before execution.
                  </p>
                </div>
              </div>
            )}

            {/* Validation errors warning */}
            {stepErrors && (
              <div className="rounded border border-[#EE1C25]/20 bg-[#EE1C25]/5 p-4 text-xs text-[#EE1C25] font-mono">
                {stepErrors}
              </div>
            )}

            {/* Step navigation buttons */}
            <div className="flex justify-between items-center border-t border-white/5 pt-6 mt-6">
              <div>
                {activeStep > 1 && (
                  <ActionButton 
                    type="button" 
                    onClick={handleBack} 
                    tone="secondary" 
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </ActionButton>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                {activeStep < 5 ? (
                  <ActionButton 
                    type="button" 
                    onClick={handleNext} 
                    tone="primary" 
                    className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </ActionButton>
                ) : (
                  <ActionButton 
                    type="submit" 
                    disabled={isSubmitting} 
                    tone="ignite" 
                    className="px-8 py-2.5 text-xs font-bold uppercase tracking-widest"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
                    Ignite Catalyst
                  </ActionButton>
                )}
              </div>
            </div>

          </div>
        </form>
      </div>

      {error ? <ErrorState message={error} /> : null}
    </div>
  );
}
