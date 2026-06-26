import { FormEvent, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Send } from 'lucide-react';
import { createSubmission, getBounty } from '../lib/api';
import type { BountyRecord } from '../../shared/domain';
import { ErrorState, LoadingState } from './pageUtils';

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
  if (isLoading) return <LoadingState label="Loading submission form..." />;
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
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]"><Send className="h-4 w-4" />Submit Project</div>
        <h1 className="mt-3 text-3xl font-black text-white">Submit to {catalyst?.title ?? 'Catalyst'}</h1>
        <p className="mt-2 text-white/60">Attach a demo, repository, proof assets, and a short delivery narrative for review.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 md:grid-cols-2">
        <Field name="builderId" label="Builder ID" />
        <Field name="name" label="Project name" required />
        <Field name="tagline" label="Tagline" className="md:col-span-2" required />
        <Field name="demoUrl" label="Demo URL" type="url" />
        <Field name="githubUrl" label="GitHub URL" type="url" />
        <Field name="videoUrl" label="Video URL" type="url" />
        <Field name="screenshotUrl" label="Screenshot URL" type="url" />
        <label className="md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/45">Description</span>
          <textarea name="description" rows={5} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05070d] px-4 py-3 text-sm text-white outline-none focus:border-[#ffd285]/50" />
        </label>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-6 py-3 text-sm font-black text-[#05070d] disabled:opacity-60">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Submit Project
      </button>
    </form>
  );
}

function Field({ name, label, type = 'text', required = false, className = '' }: { name: string; label: string; type?: string; required?: boolean; className?: string }) {
  return (
    <label className={className}>
      <span className="text-xs font-bold uppercase tracking-wider text-white/45">{label}</span>
      <input name={name} type={type} required={required} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05070d] px-4 py-3 text-sm text-white outline-none focus:border-[#ffd285]/50" />
    </label>
  );
}
