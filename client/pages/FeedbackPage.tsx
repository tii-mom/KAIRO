import { Copy, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ActionButton, PageHero, Panel } from '../components/runtimeUi';

const feedbackTemplate = `KAIRO Private Beta Feedback
Role: Builder / Supporter / Admin / Project owner
Page URL:
What happened:
Expected behavior:
Screenshot or video link:
Severity: blocker / major / minor / idea
Optional contact:`;
const feedbackIssueUrl = 'https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml';

export default function FeedbackPage() {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(feedbackTemplate);
    setCopyMessage('Feedback template copied.');
    setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Feedback Intake"
        title="Report visual bugs, usability blocker errors, or suggestions"
        description="Share your feedback on Catalyst listings, builder solution workspaces, boosts, timelines, or admin dashboards. Do not share private keys or sensitive credentials."
        actions={
          <ActionButton onClick={() => void copyTemplate()} tone="primary" className="text-xs uppercase tracking-widest font-bold">
            <Copy className="h-4 w-4" />
            Copy Feedback Template
          </ActionButton>
        }
        stats={[
          { label: 'Feedback Scope', value: 'Private Beta', detail: 'Workflow and usability coordination only' },
          { label: 'Categorization', value: 'Blocker to Idea', detail: 'Helps organize development queue', tone: 'sky' },
          { label: 'Security boundary', value: 'No Secrets', detail: 'Do not submit key credentials', tone: 'emerald' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <InfoCard title="Blocker" body="You cannot complete a core beta flow, or database telemetry is completely broken." />
        <InfoCard title="Major" body="A flow runs with confusing offsets, invalid states, or requires manual page retries." />
        <InfoCard title="Minor / Idea" body="Layout, typography fallbacks, copywriting, or styling enhancements." />
      </div>

      <Panel eyebrow="Template console" title="Feedback Template Text" icon={MessageSquare}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl text-xs sm:text-sm leading-5 text-white/50">
            Copy the block below and paste it into the private beta feedback channel or issue tracker.
          </p>
          {copyMessage ? <span className="text-xs font-mono text-[#ffb95f]">{copyMessage}</span> : null}
        </div>
        <pre className="mt-5 overflow-x-auto rounded border border-white/5 bg-[#050608] p-5 font-mono text-xs sm:text-sm leading-6 text-white/70">{feedbackTemplate}</pre>
      </Panel>

      <Panel eyebrow="Safety boundaries" title="Beta boundaries warning" icon={ShieldCheck}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-3xl text-xs sm:text-sm leading-6 text-[#ffb95f]">
            Boost is not investment. KAIRO does not guarantee rewards or airdrops. Feedback should strictly focus on visual quality, workflow coordinates, and console usability.
          </p>
        </div>
      </Panel>

      <a href={feedbackIssueUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
        Open Beta Feedback Form
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <Panel eyebrow="Severity tier" title={title}>
      <p className="text-xs sm:text-sm leading-5 text-white/50">{body}</p>
    </Panel>
  );
}
