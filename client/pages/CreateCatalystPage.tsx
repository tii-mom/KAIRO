import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Flame } from 'lucide-react';
import { createBounty } from '../lib/api';
import { ErrorState } from './pageUtils';
import { FormField, FormTextArea, ActionButton } from '../components/runtimeUi';

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
        websiteUrl: String(form.get('websiteUrl') ?? '') || undefined,
        twitterUrl: String(form.get('twitterUrl') ?? '') || undefined,
        telegramUrl: String(form.get('telegramUrl') ?? '') || undefined,
      });
      navigate(`/catalysts/${catalyst.id}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to create Catalyst');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Title Header */}
      <section className="glass-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ffb95f]">
          <Flame className="h-4 w-4 text-[#EE1C25] animate-pulse" />
          Ignite Catalyst Flow
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-white leading-none">Ignite a Resurrection Catalyst</h1>
        <p className="mt-2 text-xs text-white/50 leading-5">
          Specify token metadata, builder core objectives, reward verification structures, and contact endpoints to list this Catalyst lane on KAIRO.
        </p>
      </section>

      {/* Input Section */}
      <section className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField name="tokenName" label="Token Name" placeholder="e.g. DeFi Liquidity Engine" required />
          <FormField name="tokenSymbol" label="Token Symbol" placeholder="e.g. DLE" required />
          <FormField name="chain" label="Target Protocol Chain" placeholder="e.g. Ethereum, Arbitrum" required />
          <FormField name="rewardText" label="Reward Structure Record" placeholder="e.g. 50,000 USDC via Milestone logs" />
          <FormField name="contactInfo" label="Coordinator Contact Details" placeholder="e.g. telegram handle / email" />
          <FormField name="deadline" label="Submission Deadline" type="datetime-local" />
          <FormField name="websiteUrl" label="Website URL" type="url" placeholder="https://" />
          <FormField name="twitterUrl" label="X (Twitter) URL" type="url" placeholder="https://x.com/" />
          <FormField name="telegramUrl" label="Telegram Channel URL" type="url" placeholder="https://t.me/" />
        </div>

        <div className="border-t border-white/5 pt-6 space-y-6">
          <FormField name="title" label="Catalyst Objective Title" placeholder="e.g. Cross-Chain Routing Engine Implementation" required />
          <FormTextArea name="description" label="Detailed Objective Brief" placeholder="Explain the token context, builder requirements, and how the solution revives token utility..." required minLength={20} rows={6} />
        </div>
      </section>

      {error ? <ErrorState message={error} /> : null}

      <div className="flex items-center gap-4">
        <ActionButton type="submit" disabled={isSubmitting} tone="ignite" className="px-8 py-3.5 text-xs font-bold uppercase tracking-widest">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : null}
          Ignite Catalyst
        </ActionButton>
        <ActionButton type="button" onClick={() => navigate('/catalysts')} tone="secondary" className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider">
          Cancel
        </ActionButton>
      </div>
    </form>
  );
}
