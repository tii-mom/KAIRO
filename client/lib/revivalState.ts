import type { BountyRecord } from '../../shared/domain';

export type RevivalState = 'sleeping' | 'warming' | 'ignited' | 'building' | 'verified' | 'comeback' | 'hall_of_revival';

export function getRevivalState(catalyst: BountyRecord): RevivalState {
  const boostCount = catalyst.boostCount ?? 0;
  const momentumScore = catalyst.momentumScore ?? 0;
  const submissionCount = catalyst.submissionCount ?? 0;
  const fundingStatus = catalyst.fundingStatus ?? 'unverified';

  if (fundingStatus === 'paid') {
    return 'comeback';
  }
  if (fundingStatus !== 'unverified') {
    return 'verified';
  }
  if (submissionCount > 0) {
    return 'building';
  }
  if (momentumScore >= 1000) {
    return 'ignited';
  }
  if (boostCount > 0) {
    return 'warming';
  }
  return 'sleeping';
}

export function getRevivalStateLabel(state: RevivalState, locale: string = 'en-US'): string {
  const labels: Record<string, Record<RevivalState, string>> = {
    'en-US': {
      sleeping: 'Sleeping',
      warming: 'Warming Up',
      ignited: 'Ignited',
      building: 'Building',
      verified: 'Verified',
      comeback: 'Comeback',
      hall_of_revival: 'Hall of Revival',
    },
    'zh-CN': {
      sleeping: '沉睡中',
      warming: '预热中',
      ignited: '已点燃',
      building: '建设中',
      verified: '已验证',
      comeback: '复活成功',
      hall_of_revival: '复活名人堂',
    },
    'ko-KR': {
      sleeping: '휴면 중',
      warming: '예열 중',
      ignited: '점화됨',
      building: '빌딩 중',
      verified: '검증됨',
      comeback: '부활 완료',
      hall_of_revival: '부활 명예의 전당',
    },
  };
  return labels[locale]?.[state] ?? labels['en-US'][state];
}

export function getRevivalStateDescription(state: RevivalState, locale: string = 'en-US'): string {
  const descs: Record<string, Record<RevivalState, string>> = {
    'en-US': {
      sleeping: 'Token dormant. Waiting for community signal.',
      warming: 'Early coordination signal detected.',
      ignited: 'Objective established. Developers recruited.',
      building: 'Contributed solution prototypes delivered.',
      verified: 'Ecosystem reward records confirmed.',
      comeback: 'Project reactivated with verified output.',
      hall_of_revival: 'Elite legacy revival milestone.',
    },
    'zh-CN': {
      sleeping: '代币沉睡中。等待社区发出信号。',
      warming: '检测到早期协调信号。',
      ignited: '复活任务确立。正在招募开发者。',
      building: '开发者已提交解决方案原型。',
      verified: '外部奖励证据已确认。',
      comeback: '项目携经过验证的产品重新启动。',
      hall_of_revival: '卓越的空气币复活历史里程碑。',
    },
    'ko-KR': {
      sleeping: '토큰 휴면 상태. 커뮤니티 신호 대기 중.',
      warming: '초기 조정 신호 감지됨.',
      ignited: '부활 미션 확립. 개발자 모집 중.',
      building: '개발자 솔루션 프로토타입 제출됨.',
      verified: '외부 보상 증거 확인됨.',
      comeback: '검증된 제품과 함께 프로젝트 재가동.',
      hall_of_revival: '엘리트 레거시 부활 기념비.',
    },
  };
  return descs[locale]?.[state] ?? descs['en-US'][state];
}

export function getRevivalStateTone(state: RevivalState): 'gold' | 'sky' | 'emerald' | 'rose' | 'slate' | 'red' {
  switch (state) {
    case 'comeback':
    case 'hall_of_revival':
      return 'emerald';
    case 'verified':
      return 'sky';
    case 'building':
      return 'gold';
    case 'ignited':
      return 'red';
    case 'warming':
      return 'rose';
    case 'sleeping':
    default:
      return 'slate';
  }
}
