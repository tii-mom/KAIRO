import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Flame, ChevronRight, ChevronLeft, ShieldCheck } from 'lucide-react';
import { createBounty } from '../lib/api';
import { ErrorState } from './pageUtils';
import { FormField, FormTextArea, ActionButton, PointerGlowCard } from '../components/runtimeUi';
import { useI18n } from '../i18n/useI18n';
import BetaAccessGate from '../components/BetaAccessGate';


export default function CreateCatalystPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
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

  const [sponsorSource, setSponsorSource] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [whoControlsFunds, setWhoControlsFunds] = useState('');
  const [disputeContact, setDisputeContact] = useState('');
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const [check4, setCheck4] = useState(false);

  const [stepErrors, setStepErrors] = useState<string | null>(null);

  const steps = [
    { id: 1, label: t('createCatalyst.step1Label'), desc: t('createCatalyst.step1Desc') },
    { id: 2, label: t('createCatalyst.step2Label'), desc: t('createCatalyst.step2Desc') },
    { id: 3, label: t('createCatalyst.step3Label'), desc: t('createCatalyst.step3Desc') },
    { id: 4, label: t('createCatalyst.step4Label'), desc: t('createCatalyst.step4Desc') },
    { id: 5, label: t('createCatalyst.step5Label'), desc: t('createCatalyst.step5Desc') },
  ];

  const validateStep = (step: number) => {
    setStepErrors(null);
    if (step === 1) {
      if (!tokenName.trim() || !tokenSymbol.trim() || !chain.trim()) {
        setStepErrors(t('createCatalyst.validationTokenRequired'));
        return false;
      }
    }
    if (step === 2) {
      if (!title.trim() || !description.trim()) {
        setStepErrors(t('createCatalyst.validationObjectiveRequired'));
        return false;
      }
      if (description.trim().length < 20) {
        setStepErrors(t('createCatalyst.validationBriefMinLength'));
        return false;
      }
    }
    if (step === 5) {
      if (!check1 || !check2 || !check3 || !check4) {
        setStepErrors(t('createCatalyst.validationDisclaimersRequired'));
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
      const fullDescription = `${description}\n\n` +
        `${t('createCatalyst.specHeader')}\n` +
        `${t('createCatalyst.specSponsorSource', { value: sponsorSource || t('createCatalyst.specNa') })}\n` +
        `${t('createCatalyst.specEvidenceUrl', { value: evidenceUrl || t('createCatalyst.specNa') })}\n` +
        `${t('createCatalyst.specFundController', { value: whoControlsFunds || t('createCatalyst.specExternallyManaged') })}\n` +
        `${t('createCatalyst.specDisputeContact', { value: disputeContact || t('createCatalyst.specNa') })}\n` +
        `${t('createCatalyst.specAssetControl', { value: t('createCatalyst.specStrictlyNo') })}`;

      const catalyst = await createBounty({
        tokenName,
        tokenSymbol,
        chain,
        title,
        description: fullDescription,
        rewardText,
        rewardType: 'offchain',
        contactInfo,
        deadline,
        websiteUrl: websiteUrl.trim() || undefined,
        twitterUrl: twitterUrl.trim() || undefined,
        telegramUrl: telegramUrl.trim() || undefined,
      });
      navigate(`/catalysts/${catalyst.id}?created=true`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('createCatalyst.errorSubmit', { default: 'Unable to create Catalyst' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasBetaWriteToken = typeof window !== 'undefined' && 
    window.sessionStorage && 
    Boolean(window.sessionStorage.getItem('x-kairo-beta-token'));

  const [hasWriteAccess, setHasWriteAccess] = useState(hasBetaWriteToken);


  return (
    <div className="max-w-5xl mx-auto pb-12 space-y-8">
      {/* Title Header */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
          <Flame className="h-4 w-4 text-[#EE1C25] animate-pulse" />
          {t('createCatalyst.eyebrow')}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">{t('createCatalyst.title')}</h1>
        <p className="mt-2 text-xs text-white/50 leading-5">
          {t('createCatalyst.description')}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Vertical Step Progress Track */}
        <div className="lg:col-span-3 space-y-4">
          <div className="glass-panel p-4 space-y-6">
            <div className="font-mono text-[9px] text-white/30 uppercase tracking-widest border-b border-white/5 pb-2">
              {t('createCatalyst.pipelineProgress')}
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
        <div className="lg:col-span-9 space-y-6">
          {!hasWriteAccess ? (
            <BetaAccessGate onSuccess={() => setHasWriteAccess(true)} />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <PointerGlowCard className="glass-panel p-6 sm:p-8 space-y-6 kairo-tilt">
                
                {/* Step 1: Token Identity */}
                {activeStep === 1 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-white/5 pb-3">
                      <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_01_TOKEN_IDENTITY]</span>
                      <h3 className="text-base font-bold text-white mt-1">{t('createCatalyst.section1Heading')}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">{t('createCatalyst.section1Desc')}</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField 
                        name="tokenName" 
                        label={t('createCatalyst.tokenName')} 
                        value={tokenName}
                        onChange={(e) => setTokenName(e.target.value)}
                        placeholder={t('createCatalyst.tokenNamePlaceholder')} 
                        required 
                      />
                      <FormField 
                        name="tokenSymbol" 
                        label={t('createCatalyst.tokenSymbol')} 
                        value={tokenSymbol}
                        onChange={(e) => setTokenSymbol(e.target.value)}
                        placeholder={t('createCatalyst.tokenSymbolPlaceholder')} 
                        required 
                      />
                      <FormField 
                        name="chain" 
                        label={t('createCatalyst.chain')} 
                        value={chain}
                        onChange={(e) => setChain(e.target.value)}
                        placeholder={t('createCatalyst.chainPlaceholder')} 
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
                      <h3 className="text-base font-bold text-white mt-1">{t('createCatalyst.section2Heading')}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">{t('createCatalyst.section2Desc')}</p>
                    </div>
                    <div className="space-y-6">
                      <FormField 
                        name="title" 
                        label={t('createCatalyst.missionTitle')} 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder={t('createCatalyst.missionTitlePlaceholder')} 
                        required 
                      />
                      <FormTextArea 
                        name="description" 
                        label={t('createCatalyst.missionDesc')} 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('createCatalyst.missionDescPlaceholder')} 
                        required 
                        minLength={20} 
                        rows={6} 
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: External Reward Evidence */}
                {activeStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-white/5 pb-3">
                      <span className="font-mono text-[9px] text-[#ffb95f] uppercase tracking-widest">[SECTION_03_EXTERNAL_REWARD_EVIDENCE]</span>
                      <h3 className="text-base font-bold text-white mt-1">{t('createCatalyst.section3Heading')}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">{t('createCatalyst.section3Desc')}</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField 
                        name="sponsorSource" 
                        label={t('createCatalyst.sponsorSource')} 
                        value={sponsorSource}
                        onChange={(e) => setSponsorSource(e.target.value)}
                        placeholder={t('createCatalyst.sponsorSourcePlaceholder')}
                      />
                      <FormField 
                        name="rewardText" 
                        label={t('createCatalyst.rewardText')} 
                        value={rewardText}
                        onChange={(e) => setRewardText(e.target.value)}
                        placeholder={t('createCatalyst.rewardTextPlaceholder')} 
                      />
                      <FormField 
                        name="evidenceUrl" 
                        label={t('createCatalyst.evidenceUrl')} 
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder={t('createCatalyst.evidenceUrlPlaceholder')}
                      />
                      <FormField 
                        name="whoControlsFunds" 
                        label={t('createCatalyst.whoControlsFunds')} 
                        value={whoControlsFunds}
                        onChange={(e) => setWhoControlsFunds(e.target.value)}
                        placeholder={t('createCatalyst.whoControlsFundsPlaceholder')}
                      />
                      <div className="glass-panel p-3 border-white/5 bg-[#050608] flex justify-between items-center text-xs font-mono">
                        <span className="text-white/40">{t('createCatalyst.assetControlQuestion')}</span>
                        <span className="text-[#EE1C25] font-bold uppercase">{t('createCatalyst.assetControlValue')}</span>
                      </div>
                      <div className="glass-panel p-3 border-white/5 bg-[#050608] flex justify-between items-center text-xs font-mono">
                        <span className="text-white/40">{t('createCatalyst.externallyManagedQuestion')}</span>
                        <span className="text-[#4ade80] font-bold uppercase">{t('createCatalyst.externallyManagedValue')}</span>
                      </div>
                      <FormField 
                        name="disputeContact" 
                        label={t('createCatalyst.disputeContact')} 
                        value={disputeContact}
                        onChange={(e) => setDisputeContact(e.target.value)}
                        placeholder={t('createCatalyst.disputeContactPlaceholder')}
                      />
                      <FormField 
                        name="deadline" 
                        label={t('createCatalyst.deadline')} 
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
                      <h3 className="text-base font-bold text-white mt-1">{t('createCatalyst.section4Heading')}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">{t('createCatalyst.section4Desc')}</p>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <FormField 
                        name="websiteUrl" 
                        label={t('createCatalyst.website')} 
                        type="url" 
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        placeholder="https://" 
                      />
                      <FormField 
                        name="twitterUrl" 
                        label={t('createCatalyst.twitter')} 
                        type="url" 
                        value={twitterUrl}
                        onChange={(e) => setTwitterUrl(e.target.value)}
                        placeholder="https://x.com/" 
                      />
                      <FormField 
                        name="telegramUrl" 
                        label={t('createCatalyst.telegram')} 
                        type="url" 
                        value={telegramUrl}
                        onChange={(e) => setTelegramUrl(e.target.value)}
                        placeholder="https://t.me/" 
                      />
                      <FormField 
                        name="contactInfo" 
                        label={t('createCatalyst.contactInfo')} 
                        value={contactInfo}
                        onChange={(e) => setContactInfo(e.target.value)}
                        placeholder={t('createCatalyst.contactPlaceholder')} 
                      />
                    </div>
                  </div>
                )}

                {/* Step 5: Review & Submit */}
                {activeStep === 5 && (
                  <div className="space-y-6 animate-fadeIn">
                    <div className="border-b border-white/5 pb-3">
                      <span className="font-mono text-[9px] text-[#4ade80] uppercase tracking-widest">[SECTION_05_REVIEW_SUBMIT]</span>
                      <h3 className="text-base font-bold text-white mt-1">{t('createCatalyst.section5Heading')}</h3>
                      <p className="text-xs text-white/50 leading-relaxed mt-1">{t('createCatalyst.section5Desc')}</p>
                    </div>
                    
                    {/* Summary Card */}
                    <div className="rounded border border-white/5 bg-[#050608] p-5 space-y-4 text-xs font-mono">
                      <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-3">
                        <div>
                          <span className="text-white/40 block">{t('createCatalyst.summaryCardTokenName')}</span>
                          <span className="text-white font-bold">{tokenName}</span>
                        </div>
                        <div>
                          <span className="text-white/40 block">{t('createCatalyst.summaryCardSymbolChain')}</span>
                          <span className="text-white font-bold">{tokenSymbol} ({chain})</span>
                        </div>
                      </div>
                      <div className="border-b border-white/5 pb-3">
                        <span className="text-white/40 block">{t('createCatalyst.summaryCardCatalystTitle')}</span>
                        <span className="text-white font-bold">{title}</span>
                      </div>
                      <div className="border-b border-white/5 pb-3">
                        <span className="text-white/40 block">{t('createCatalyst.summaryCardReward')}</span>
                        <span className="text-[#ffb95f] font-bold">{rewardText || t('catalysts.rewardPending')}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">{t('createCatalyst.summaryCardContact')}</span>
                        <span className="text-white">{contactInfo || t('catalysts.notSpecified')}</span>
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#050608] p-4 rounded border border-white/5 font-mono text-[11px] text-white/70">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={check1} onChange={(e) => setCheck1(e.target.checked)} className="mt-1 shrink-0" />
                        <span>{t('createCatalyst.checkbox1')}</span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={check2} onChange={(e) => setCheck2(e.target.checked)} className="mt-1 shrink-0" />
                        <span>{t('createCatalyst.checkbox2')}</span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={check3} onChange={(e) => setCheck3(e.target.checked)} className="mt-1 shrink-0" />
                        <span>{t('createCatalyst.checkbox3')}</span>
                      </label>
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input type="checkbox" checked={check4} onChange={(e) => setCheck4(e.target.checked)} className="mt-1 shrink-0" />
                        <span>{t('createCatalyst.checkbox4')}</span>
                      </label>
                    </div>

                    <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-4 flex gap-3">
                      <ShieldCheck className="h-5 w-5 text-[#ffb95f] shrink-0" />
                      <p className="text-[11px] leading-5 text-white/60">
                        {t('createCatalyst.complianceWarning')}
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
                        className="px-5 py-2 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        {t('createCatalyst.backButton')}
                      </ActionButton>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {activeStep < 5 ? (
                      <ActionButton 
                        type="button" 
                        onClick={handleNext} 
                        tone="primary" 
                        className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer"
                      >
                        {t('createCatalyst.nextButton')}
                        <ChevronRight className="h-4 w-4" />
                      </ActionButton>
                    ) : (
                      <ActionButton 
                        type="submit" 
                        disabled={isSubmitting} 
                        tone="ignite" 
                        className="px-8 py-2.5 text-xs font-bold uppercase tracking-widest cursor-pointer"
                      >
                        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5 inline" /> : null}
                        {t('createCatalyst.submitButton')}
                      </ActionButton>
                    )}
                  </div>
                </div>
              </PointerGlowCard>
            </form>
          )}
        </div>
      </div>

      {error ? <ErrorState message={error} /> : null}
    </div>
  );
}

