export function getRuntimeV2Catalysts(t: (key: string) => string) {
  return [
    {
      id: 'dormant-yields',
      title: t('runtimeData.catalysts.dormantYields.title'),
      token: 'DORM',
      category: 'Catalyst',
      summary: t('runtimeData.catalysts.dormantYields.summary'),
      fundingStatus: t('runtimeData.catalysts.dormantYields.fundingStatus'),
      reward: t('runtimeData.catalysts.dormantYields.reward'),
      boostCount: 428,
      momentum: 842,
      kairoScore: 91,
    },
    {
      id: 'pepe2-community-loop',
      title: t('runtimeData.catalysts.pepe2.title'),
      token: 'PEPE2',
      category: 'Catalyst',
      summary: t('runtimeData.catalysts.pepe2.summary'),
      fundingStatus: t('runtimeData.catalysts.pepe2.fundingStatus'),
      reward: t('runtimeData.catalysts.pepe2.reward'),
      boostCount: 612,
      momentum: 930,
      kairoScore: 88,
    },
    {
      id: 'retro-arcade-proof',
      title: t('runtimeData.catalysts.retroArcade.title'),
      token: 'RETRO',
      category: 'Catalyst',
      summary: t('runtimeData.catalysts.retroArcade.summary'),
      fundingStatus: t('runtimeData.catalysts.retroArcade.fundingStatus'),
      reward: t('runtimeData.catalysts.retroArcade.reward'),
      boostCount: 214,
      momentum: 590,
      kairoScore: 76,
    },
  ];
}

export function getRuntimeV2Builders(t: (key: string) => string) {
  return [
    { name: 'Northstar Lab', specialty: t('runtimeData.builders.telegramPrototypes'), kairoScore: 940, completedCatalysts: 3 },
    { name: 'Arcade Guild', specialty: t('runtimeData.builders.playableWebDemos'), kairoScore: 875, completedCatalysts: 2 },
    { name: 'Signal Studio', specialty: t('runtimeData.builders.communityDashboards'), kairoScore: 812, completedCatalysts: 2 },
  ];
}

export function getRuntimeV2FundingEvents(t: (key: string) => string) {
  return [
    { id: 'evt-1', catalyst: 'Dormant Yields', label: t('runtimeData.events.evt1Label'), detail: t('runtimeData.events.evt1Detail') },
    { id: 'evt-2', catalyst: 'PEPE2', label: t('runtimeData.events.evt2Label'), detail: t('runtimeData.events.evt2Detail') },
    { id: 'evt-3', catalyst: 'Retro Arcade', label: t('runtimeData.events.evt3Label'), detail: t('runtimeData.events.evt3Detail') },
  ];
}
