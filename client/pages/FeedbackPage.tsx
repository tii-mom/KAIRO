import { Copy, ExternalLink, MessageSquare, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { ActionButton, PageHero, Panel } from '../components/runtimeUi';
import { useI18n } from '../i18n/useI18n';

const feedbackIssueUrl = 'https://github.com/tii-mom/KAIRO/issues/new?template=private-beta-feedback.yml';

export default function FeedbackPage() {
  const { t } = useI18n();
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  const copyTemplate = async () => {
    await navigator.clipboard.writeText(t('feedback.templateText'));
    setCopyMessage(t('feedback.copiedTemplate'));
    setTimeout(() => setCopyMessage(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow={t('feedback.pageEyebrow')}
        title={t('feedback.pageTitle')}
        description={t('feedback.pageDescription')}
        actions={
          <ActionButton onClick={() => void copyTemplate()} tone="primary" className="text-xs uppercase tracking-widest font-bold cursor-pointer">
            <Copy className="h-4 w-4 mr-1.5 inline" />
            {t('feedback.copyTemplate')}
          </ActionButton>
        }
        stats={[
          { label: t('feedback.feedbackScope'), value: t('feedback.feedbackScopeValue'), detail: t('feedback.feedbackScopeDetail') },
          { label: t('feedback.categorization'), value: t('feedback.categorizationValue'), detail: t('feedback.categorizationDetail'), tone: 'sky' },
          { label: t('feedback.securityBoundary'), value: t('feedback.securityBoundaryValue'), detail: t('feedback.securityBoundaryDetail'), tone: 'emerald' },
        ]}
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <InfoCard title={t('feedback.blockerTitle')} body={t('feedback.blockerBody')} />
        <InfoCard title={t('feedback.majorTitle')} body={t('feedback.majorBody')} />
        <InfoCard title={t('feedback.minorTitle')} body={t('feedback.minorBody')} />
      </div>

      <Panel eyebrow={t('feedback.templateConsole')} title={t('feedback.templateTitle')} icon={MessageSquare}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <p className="max-w-2xl text-xs sm:text-sm leading-5 text-white/50">
            {t('feedback.templateDesc')}
          </p>
          {copyMessage ? <span className="text-xs font-mono text-[#ffb95f]">{copyMessage}</span> : null}
        </div>
        <pre className="mt-5 overflow-x-auto rounded border border-white/5 bg-[#050608] p-5 font-mono text-xs sm:text-sm leading-6 text-white/70">{t('feedback.templateText')}</pre>
      </Panel>

      <Panel eyebrow={t('feedback.safetyBoundaries')} title={t('feedback.warningTitle')} icon={ShieldCheck}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-3xl text-xs sm:text-sm leading-6 text-[#ffb95f]">
            {t('feedback.warningDesc')}
          </p>
        </div>
      </Panel>

      <a href={feedbackIssueUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost px-5 py-2.5 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer">
        {t('feedback.openForm')}
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
