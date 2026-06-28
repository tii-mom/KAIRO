import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { createSubmission, getBounty } from '../lib/api';
import type { BountyRecord } from '../../shared/domain';
import { ErrorState, LoadingState } from './pageUtils';
import { FormField, FormTextArea, ActionButton } from '../components/runtimeUi';

export default function SubmitProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [catalyst, setCatalyst] = useState<BountyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getBounty(id)
      .then(setCatalyst)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load Catalyst'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!id) return <Navigate to="/catalysts" replace />;
  if (isLoading) return <LoadingState label="Loading solution workspace..." />;
  if (error && !catalyst) return <ErrorState message={error} />;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);

    try {
      const fullDescription = `${form.get('description')}\n\n### Quality Proof & Specifications\n- **GitHub Ownership Proof**: ${form.get('githubProof')}\n- **What was built**: ${form.get('whatWasBuilt')}\n- **Requirements Satisfied**: ${form.get('requirementsSatisfied')}\n- **Test Instructions**: ${form.get('testInstructions')}\n- **Known Limitations**: ${form.get('limitations')}\n- **License**: ${form.get('license')}\n- **Deployment Status**: ${form.get('deploymentStatus')}\n- **Maintenance Commitment**: ${form.get('maintenanceCommitment')}\n- **Security Notes**: ${form.get('disclaimerContact') || 'None'}`;

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
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit solution');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title Header */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
          <Send className="h-4 w-4 text-[#EE1C25] animate-pulse" />
          Submit Solution Workspace
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">Submit Solution to {catalyst?.title ?? 'Catalyst'}</h1>
        <p className="mt-2 text-xs text-white/50 leading-5">
          Attach repository links, functional demo files, video walk-throughs, and code delivery descriptions for verification.
        </p>
      </section>

      {/* Input Section */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField name="builderId" label="Builder ID / Identity" placeholder="e.g. 0xDevID or vitalik.eth" required />
          <FormField name="name" label="Solution Project Name" placeholder="e.g. Rust Message Relayer" required />
          <FormField name="tagline" label="Solution Tagline" className="sm:col-span-2" placeholder="A one-sentence summary of the delivery outcome" required />
          <FormField name="demoUrl" label="Live Demo URL" type="url" placeholder="https://" />
          <FormField name="githubUrl" label="GitHub Repository URL" type="url" placeholder="https://github.com/" />
          <FormField name="videoUrl" label="Explainer Video URL" type="url" placeholder="https://" />
          <FormField name="screenshotUrl" label="Screenshot Evidence URL" type="url" placeholder="https://" />
        </div>

        <div className="border-t border-white/5 pt-6">
          <FormTextArea name="description" label="Detailed Delivery Narrative" placeholder="Describe the technical details, implementation steps, and how the targets were met..." rows={5} required />
        </div>
      </section>

      {/* Quality Proof & Specifications */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white">Quality Proof & Specifications</h3>
          <p className="text-xs text-white/50 leading-relaxed mt-1">Provide clear evidence of ownership, quality, and operational parameters of your solution.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField name="githubProof" label="GitHub Ownership Proof / Signed Commit" placeholder="e.g. Commit hash or signed message" required />
          <FormField name="license" label="Software License" placeholder="e.g. MIT, Apache 2.0" required />
          <FormField name="deploymentStatus" label="Deployment Status" placeholder="e.g. Production active, testnet, alpha" required />
          <FormField name="maintenanceCommitment" label="Maintenance Commitment" placeholder="e.g. 6 months security updates" required />
          <FormField name="disclaimerContact" label="Security Notes / Known Vulnerabilities" className="sm:col-span-2" placeholder="Describe any security mitigations or threat models" />
        </div>
        <div className="space-y-4 pt-4 border-t border-white/5">
          <FormTextArea name="whatWasBuilt" label="What was built?" placeholder="Detailed list of features and tools developed..." rows={3} required />
          <FormTextArea name="requirementsSatisfied" label="Which Catalyst requirements are satisfied?" placeholder="Explain exactly how your solution meets the blueprint targets..." rows={3} required />
          <FormTextArea name="testInstructions" label="Demo Test Instructions" placeholder="Step by step instructions for testers to run and verify..." rows={3} required />
          <FormTextArea name="limitations" label="Known Limitations" placeholder="Describe any known bugs, trade-offs, or constraints..." rows={2} required />
        </div>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-4 flex flex-col gap-3">
          <label className="flex items-start gap-2.5 cursor-pointer font-mono text-[11px] text-white/70">
            <input type="checkbox" name="ownWork" required className="mt-1 shrink-0" />
            <span>I confirm that I own or have permission to submit this work, and KAIRO may showcase it for coordination purposes.</span>
          </label>
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <div className="flex items-center gap-4">
        <ActionButton type="submit" disabled={isSubmitting} tone="ignite" className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
          Submit Solution
        </ActionButton>
        <ActionButton type="button" onClick={() => navigate(`/catalysts/${id}`)} tone="secondary" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">
          Cancel
        </ActionButton>
      </div>
    </form>
  );
}
