import { Link } from 'react-router-dom';
import { CheckCircle2, FlaskConical, ShieldAlert } from 'lucide-react';
import { ActionLink, EmptyPanel, PageHero, Panel } from '../components/runtimeUi';

export default function BetaPage() {
  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow="Private Beta"
        title="Invite-Only Testing Consoles & Guardrails"
        description="Verify Catalyst discovery lanes, solution proposal forms, support boosts, and momentum scores. This beta contains zero trading or token purchase systems."
        actions={
          <>
            <ActionLink to="/catalysts" className="text-xs uppercase tracking-widest font-bold">Browse Catalysts</ActionLink>
            <ActionLink tone="secondary" to="/feedback" className="text-xs uppercase tracking-widest font-bold">Give Feedback</ActionLink>
          </>
        }
        stats={[
          { label: 'Audience Scope', value: 'Invite Only', detail: 'Controlled test coordinators' },
          { label: 'Core Target', value: 'Workflow', detail: 'Telemetry validation and safety checks', tone: 'sky' },
          { label: 'Boundary', value: 'No Asset Custody', detail: 'No wallet transfers or token sales', tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow="Platform limits" title="Beta boundaries" icon={FlaskConical}>
            <div className="rounded border border-white/5 bg-[#050608] p-4 text-xs leading-5 text-white/50">
              Boost is not investment. KAIRO does not guarantee rewards or airdrops. The beta is strictly for usability coordinates.
            </div>
          </Panel>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <BetaCard title="Builders" items={['Find a Catalyst', 'Submit a solution demo', 'Verify boost scoring updates']} />
        <BetaCard title="Supporters" items={['Browse Catalysts', 'Boost a Catalyst or solution', 'Copy shareable Support Proof']} />
        <BetaCard title="Operators" items={['Review Catalyst and submission status', 'Update External Evidence', 'Record public-safe Reward Evidence Records']} />
      </div>

      <Panel eyebrow="Compliance log" title="Important private beta guardrails" icon={ShieldAlert}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-4xl text-xs sm:text-sm leading-6 text-[#ffb95f]">
            Boost is not investment. KAIRO does not guarantee rewards or airdrops. External Reward Evidence is a public coordination label and does not represent an asset deposit or financial instrument.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function BetaCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel eyebrow="Test track" title={title}>
      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <div key={item} className="flex gap-3 rounded border border-white/5 bg-[#050608]/80 p-4 text-xs sm:text-sm leading-5 text-white/60">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#4ade80]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyPanel title="No test targets" description="Current track has no active targets." />
      )}
    </Panel>
  );
}
