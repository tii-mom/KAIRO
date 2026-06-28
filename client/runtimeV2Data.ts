export const runtimeV2Catalysts = [
  {
    id: 'dormant-yields',
    title: 'Dormant Yields community utility sprint',
    token: 'DORM',
    category: 'Catalyst',
    summary:
      'A focused Catalyst for builders to ship a lightweight community tool, document usage, and gather Proof of Support from early supporters.',
    fundingStatus: 'External evidence recorded',
    reward: '15,000 DORM reward record',
    boostCount: 428,
    momentum: 842,
    kairoScore: 91,
  },
  {
    id: 'pepe2-community-loop',
    title: ' PEPE2 community game loop',
    token: 'PEPE2',
    category: 'Catalyst',
    summary:
      'A builder challenge for a browser-based community loop with transparent Reward Records and public delivery milestones.',
    fundingStatus: 'Reward reported by community',
    reward: '8,000,000 PEPE2 reward record',
    boostCount: 612,
    momentum: 930,
    kairoScore: 88,
  },
  {
    id: 'retro-arcade-proof',
    title: 'Retro Arcade playable proof',
    token: 'RETRO',
    category: 'Catalyst',
    summary:
      'A Catalyst for restoring a playable web demo, publishing builder notes, and collecting community Boost signals.',
    fundingStatus: 'External reward evidence pending',
    reward: '5,000 RETRO reward record',
    boostCount: 214,
    momentum: 590,
    kairoScore: 76,
  },
];

export const runtimeV2Builders = [
  { name: 'Northstar Lab', specialty: 'Telegram prototypes', kairoScore: 940, completedCatalysts: 3 },
  { name: 'Arcade Guild', specialty: 'Playable web demos', kairoScore: 875, completedCatalysts: 2 },
  { name: 'Signal Studio', specialty: 'Community dashboards', kairoScore: 812, completedCatalysts: 2 },
];

export const runtimeV2FundingEvents = [
  { id: 'evt-1', catalyst: 'Dormant Yields', label: 'Funding Status updated', detail: 'External evidence recorded' },
  { id: 'evt-2', catalyst: 'PEPE2', label: 'Reward Records updated', detail: 'Community reward note added' },
  { id: 'evt-3', catalyst: 'Retro Arcade', label: 'Proof of Support milestone', detail: '200 valid Boost records reached' },
];
