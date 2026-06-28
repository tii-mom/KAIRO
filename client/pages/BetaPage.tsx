import { CheckCircle2, FlaskConical, ShieldAlert } from 'lucide-react';
import { ActionLink, EmptyPanel, PageHero, Panel } from '../components/runtimeUi';
import { useI18n } from '../i18n/useI18n';

export default function BetaPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-8 pb-12">
      <PageHero
        eyebrow={t('beta.pageEyebrow')}
        title={t('beta.pageTitle')}
        description={t('beta.pageDescription')}
        actions={
          <>
            <ActionLink to="/catalysts" className="text-xs uppercase tracking-widest font-bold">{t('beta.browseCatalysts')}</ActionLink>
            <ActionLink tone="secondary" to="/feedback" className="text-xs uppercase tracking-widest font-bold">{t('beta.giveFeedback')}</ActionLink>
          </>
        }
        stats={[
          { label: t('beta.audienceScope'), value: t('beta.inviteOnly'), detail: t('beta.audienceDetail') },
          { label: t('beta.coreTarget'), value: t('beta.coreTargetValue'), detail: t('beta.coreTargetDetail'), tone: 'sky' },
          { label: t('beta.boundary'), value: t('beta.boundaryValue'), detail: t('beta.boundaryDetail'), tone: 'emerald' },
        ]}
        aside={
          <Panel eyebrow={t('beta.limitsEyebrow')} title={t('beta.limitsTitle')} icon={FlaskConical}>
            <div className="rounded border border-white/5 bg-[#050608] p-4 text-xs leading-5 text-white/50">
              {t('beta.limitsDesc')}
            </div>
          </Panel>
        }
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <BetaCard title={t('beta.buildersTitle')} items={[t('beta.buildersItem1'), t('beta.buildersItem2'), t('beta.buildersItem3')]} />
        <BetaCard title={t('beta.supportersTitle')} items={[t('beta.supportersItem1'), t('beta.supportersItem2'), t('beta.supportersItem3')]} />
        <BetaCard title={t('beta.operatorsTitle')} items={[t('beta.operatorsItem1'), t('beta.operatorsItem2'), t('beta.operatorsItem3')]} />
      </div>

      <Panel eyebrow={t('beta.complianceEyebrow')} title={t('beta.complianceTitle')} icon={ShieldAlert}>
        <div className="rounded border border-[#ffb95f]/20 bg-[#ffb95f]/5 p-5">
          <p className="max-w-4xl text-xs sm:text-sm leading-6 text-[#ffb95f]">
            {t('beta.complianceDesc')}
          </p>
        </div>
      </Panel>
    </div>
  );
}

function BetaCard({ title, items }: { title: string; items: string[] }) {
  const { t } = useI18n();
  return (
    <Panel eyebrow={t('beta.testTrack')} title={title}>
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
        <EmptyPanel title={t('beta.noTestTargets')} description={t('beta.noTestTargetsDesc')} />
      )}
    </Panel>
  );
}
