import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Sparkles } from 'lucide-react';
import { createBounty } from '../lib/api';

export default function CreateCatalystPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    setError(null);

    try {
      const catalyst = await createBounty({
        tokenName: String(form.get('tokenName') ?? ''),
        tokenSymbol: String(form.get('tokenSymbol') ?? ''),
        chain: String(form.get('chain') ?? ''),
        title: String(form.get('title') ?? ''),
        description: String(form.get('description') ?? ''),
        rewardText: String(form.get('rewardText') ?? ''),
        rewardType: 'offchain',
        contactInfo: String(form.get('contactInfo') ?? ''),
        deadline: String(form.get('deadline') ?? ''),
      });
      navigate(`/catalysts/${catalyst.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create Catalyst');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#ffd285]"><Sparkles className="h-4 w-4" />Create Catalyst</div>
        <h1 className="mt-3 text-3xl font-black text-white">Publish a comeback Catalyst</h1>
        <p className="mt-2 max-w-2xl text-white/60">Define the dormant community, reward record, and builder brief.</p>
      </section>

      <section className="grid gap-4 rounded-2xl border border-white/5 bg-[#0c0e14]/50 p-6 md:grid-cols-2">
        <Field name="tokenName" label="Token name" required />
        <Field name="tokenSymbol" label="Token symbol" required />
        <Field name="chain" label="Chain" required />
        <Field name="rewardText" label="Reward record" />
        <Field name="contactInfo" label="Contact" />
        <Field name="deadline" label="Deadline" type="datetime-local" />
        <Field name="title" label="Catalyst title" className="md:col-span-2" required />
        <label className="md:col-span-2">
          <span className="text-xs font-bold uppercase tracking-wider text-white/45">Description</span>
          <textarea name="description" required minLength={20} rows={6} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#05070d] px-4 py-3 text-sm text-white outline-none focus:border-[#ffd285]/50" />
        </label>
      </section>

      {error ? <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">{error}</div> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 rounded-full bg-[#ffd285] px-6 py-3 text-sm font-black text-[#05070d] disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create Catalyst
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
