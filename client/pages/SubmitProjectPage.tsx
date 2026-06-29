import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { createSubmission, getBounty } from '../lib/api';
import type { BountyRecord } from '../../shared/domain';
import { ErrorState, LoadingState } from './pageUtils';
import { FormField, FormTextArea, ActionButton } from '../components/runtimeUi';
import { useI18n } from '../i18n/useI18n';
import BetaAccessGate from '../components/BetaAccessGate';

export default function SubmitProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [catalyst, setCatalyst] = useState<BountyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasBetaWriteToken = typeof window !== 'undefined' && 
    window.sessionStorage && 
    Boolean(window.sessionStorage.getItem('x-kairo-beta-token'));

  const [hasWriteAccess, setHasWriteAccess] = useState(hasBetaWriteToken);


  useEffect(() => {
    if (!id) return;
    getBounty(id)
      .then(setCatalyst)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalyst'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label={t('submitProject.loadingWorkspace')} />;
  if (error && !catalyst) return <ErrorState message={error} />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);

    try {
      const fullDescription = `${form.get('description')}\n\n` +
        `${t('submitProject.specHeader')}\n` +
        `${t('submitProject.specGithubProof', { value: String(form.get('githubProof') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specWhatWasBuilt', { value: String(form.get('whatWasBuilt') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specRequirementsSatisfied', { value: String(form.get('requirementsSatisfied') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specTestInstructions', { value: String(form.get('testInstructions') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specKnownLimitations', { value: String(form.get('limitations') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specLicense', { value: String(form.get('license') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specDeploymentStatus', { value: String(form.get('deploymentStatus') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specMaintenanceCommitment', { value: String(form.get('maintenanceCommitment') ?? '') || t('submitProject.specNone') })}\n` +
        `${t('submitProject.specSecurityNotes', { value: String(form.get('disclaimerContact') ?? '') || t('submitProject.specNone') })}`;

      const submission = await createSubmission({
        bountyId: id,
        builderId: String(form.get('builderId') ?? 'user-demo-builder'),
        name: String(form.get('name') ?? ''),
        tagline: String(form.get('tagline') ?? ''),
        demoUrl: String(form.get('demoUrl') ?? '') || undefined,
        githubUrl: String(form.get('githubUrl') ?? '') || undefined,
        videoUrl: String(form.get('videoUrl') ?? '') || undefined,
        screenshotUrl: String(form.get('screenshotUrl') ?? '') || undefined,
        description: fullDescription,
        deliveryStatus: 'submitted_for_review',
      });
      navigate(`/submissions/${submission.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : t('submitProject.errorSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasWriteAccess) {
    return (
      <div className="max-w-4xl mx-auto py-12 space-y-8">
        <section className="glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
            <Send className="h-4 w-4 text-[#EE1C25] animate-pulse" />
            {t('submitProject.eyebrow')}
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">
            {t('submitProject.title', { title: catalyst?.title ?? 'Catalyst' })}
          </h1>
          <p className="mt-2 text-xs text-white/50 leading-5">
            {t('submitProject.description')}
          </p>
        </section>
        <BetaAccessGate onSuccess={() => setHasWriteAccess(true)} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title Header */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
          <Send className="h-4 w-4 text-[#EE1C25] animate-pulse" />
          {t('submitProject.eyebrow')}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">
          {t('submitProject.title', { title: catalyst?.title ?? 'Catalyst' })}
        </h1>
        <p className="mt-2 text-xs text-white/50 leading-5">
          {t('submitProject.description')}
        </p>
      </section>

      {/* Input Section */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField name="builderId" label={t('submitProject.builderId')} placeholder={t('submitProject.builderIdPlaceholder')} required />
          <FormField name="name" label={t('submitProject.projectName')} placeholder={t('submitProject.projectNamePlaceholder')} required />
          <FormField name="tagline" label={t('submitProject.projectTagline')} className="sm:col-span-2" placeholder={t('submitProject.projectTaglinePlaceholder')} required />
          <FormField name="demoUrl" label={t('submitProject.demoUrl')} type="url" placeholder="https://" />
          <FormField name="githubUrl" label={t('submitProject.githubUrl')} type="url" placeholder="https://github.com/" />
          <FormField name="videoUrl" label={t('submitProject.videoUrl')} type="url" placeholder="https://" />
          <FormField name="screenshotUrl" label={t('submitProject.screenshotUrl')} type="url" placeholder="https://" />
        </div>

        <div className="border-t border-white/5 pt-6">
          <FormTextArea name="description" label={t('submitProject.deliveryNarrative')} placeholder={t('submitProject.descriptionPlaceholder')} rows={5} required />
        </div>
      </section>

      {/* Quality Proof & Specifications */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white">{t('submitProject.sectionSpecs')}</h3>
          <p className="text-xs text-white/50 leading-relaxed mt-1">{t('submitProject.sectionSpecsDesc')}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField name="githubProof" label={t('submitProject.githubProof')} placeholder={t('submitProject.githubProofPlaceholder')} required />
          <FormField name="license" label={t('submitProject.license')} placeholder={t('submitProject.licensePlaceholder')} required />
          <FormField name="deploymentStatus" label={t('submitProject.deploymentStatus')} placeholder={t('submitProject.deploymentStatusPlaceholder')} required />
          <FormField name="maintenanceCommitment" label={t('submitProject.maintenanceCommitment')} placeholder={t('submitProject.maintenanceCommitmentPlaceholder')} required />
          <FormField name="disclaimerContact" label={t('submitProject.disclaimerContact')} className="sm:col-span-2" placeholder={t('submitProject.disclaimerContactPlaceholder')} />
        </div>
        <div className="space-y-4 pt-4 border-t border-white/5">
          <FormTextArea name="whatWasBuilt" label={t('submitProject.whatWasBuilt')} placeholder={t('submitProject.whatWasBuiltPlaceholder')} rows={3} required />
          <FormTextArea name="requirementsSatisfied" label={t('submitProject.requirementsSatisfied')} placeholder={t('submitProject.requirementsSatisfiedPlaceholder')} rows={3} required />
          <FormTextArea name="testInstructions" label={t('submitProject.testInstructions')} placeholder={t('submitProject.testInstructionsPlaceholder')} rows={3} required />
          <FormTextArea name="limitations" label={t('submitProject.limitations')} placeholder={t('submitProject.limitationsPlaceholder')} rows={2} required />
        </div>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-4 flex flex-col gap-3">
          <label className="flex items-start gap-2.5 cursor-pointer font-mono text-[11px] text-white/70">
            <input type="checkbox" name="ownWork" required className="mt-1 shrink-0" />
            <span>{t('submitProject.ownWorkConfirm')}</span>
          </label>
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <div className="flex items-center gap-4">
        <ActionButton type="submit" disabled={isSubmitting} tone="ignite" className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest cursor-pointer">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white mr-1.5 inline" /> : null}
          {t('submitProject.submitButton')}
        </ActionButton>
        <ActionButton type="button" onClick={() => navigate(`/catalysts/${id}`)} tone="secondary" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider cursor-pointer">
          {t('submitProject.cancelButton')}
        </ActionButton>
      </div>
    </form>
  );
}

