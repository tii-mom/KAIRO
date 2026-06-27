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
      const submission = await createSubmission({
        bountyId: id,
        builderId: String(form.get('builderId') ?? 'user-demo-builder'),
        name: String(form.get('name') ?? ''),
        tagline: String(form.get('tagline') ?? ''),
        demoUrl: String(form.get('demoUrl') ?? '') || undefined,
        githubUrl: String(form.get('githubUrl') ?? '') || undefined,
        videoUrl: String(form.get('videoUrl') ?? '') || undefined,
        screenshotUrl: String(form.get('screenshotUrl') ?? '') || undefined,
        description: String(form.get('description') ?? ''),
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
