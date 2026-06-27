import { Copy, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const feedbackTemplate = `KAIRO Private Beta Feedback
Role: Builder / Supporter / Admin / Project owner
Page URL:
What happened:
Expected behavior:
Screenshot or video link:
Severity: blocker / major / minor / idea
Optional contact:`;

export default function FeedbackPage() {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(feedbackTemplate);
    setCopyMessage('Feedback template copied.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#ffd285]">
          <MessageSquare className="h-4 w-4" />
          Private Beta Feedback
        </div>
        <h1 className="mt-4 max-w-4xl text-4xl font-black text-white">Report what broke, what confused you, or what would make the workflow clearer.</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/60">
          KAIRO is collecting private beta feedback on Catalyst discovery, Builder submissions, Boost, Proof of Support, leaderboards, and admin review. Please avoid sending private keys, sensitive personal data, or non-public account credentials.
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="Blocker" body="You cannot complete a core beta flow, or production data is clearly unavailable." />
        <InfoCard title="Major" body="A core flow works only with confusing steps, incorrect state, or repeated retries." />
        <InfoCard title="Minor / Idea" body="Copy, layout, clarity, or workflow suggestions that do not block testing." />
      </section>

      <section className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-black text-white">Feedback template</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">Copy this template into the private beta feedback channel or an issue. Include screenshots or short videos when they make the bug easier to reproduce.</p>
          </div>
          <button type="button" onClick={() => void copyTemplate()} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffd285] px-5 py-2 text-sm font-black text-[#05070d] transition hover:bg-white">
            <Copy className="h-4 w-4" />
            Copy template
          </button>
        </div>
        <pre className="mt-5 overflow-x-auto rounded-2xl border border-white/10 bg-[#05070d] p-5 text-sm leading-7 text-white/70">{feedbackTemplate}</pre>
        {copyMessage ? <div className="mt-3 text-sm text-[#ffd285]">{copyMessage}</div> : null}
      </section>

      <section className="rounded-2xl border border-[#ffd285]/20 bg-[#ffd285]/10 p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0 text-[#ffd285]" />
          <div>
            <h2 className="text-lg font-black text-white">Private beta boundaries</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/70">
              Boost is not investment, KAIRO does not guarantee rewards or airdrops, and Funding Status is not asset holding or a financial service. Beta feedback should focus on workflow clarity, community signal, and operational readiness.
            </p>
          </div>
        </div>
      </section>

      <a href="https://github.com/tii-mom/KAIRO/issues" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2 text-sm font-bold text-white/80 transition hover:border-white/25 hover:text-white">
        Open feedback tracker
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0c0e14]/70 p-5">
      <h2 className="text-lg font-black text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
    </article>
  );
}
