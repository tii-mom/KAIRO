import { z } from 'zod';

export const bountyStatuses = [
  'pending_review',
  'active',
  'voting',
  'completed',
  'upcoming',
] as const;

export const fundingStatuses = [
  'unverified',
  'pledged',
  'escrowed',
  'partially_paid',
  'paid',
  'disputed',
  'cancelled',
] as const;

export const deliveryStatuses = [
  'not_started',
  'building',
  'submitted_for_review',
  'approved',
  'rejected',
  'completed',
] as const;

export const submissionStatuses = [
  'submitted',
  'shortlisted',
  'winner',
  'rejected',
  'hidden',
] as const;

export const boostValidityStatuses = ['valid', 'suspicious', 'invalid'] as const;
export const curatedItemTypes = [
  'featured_catalyst',
  'dormant_giant',
  'featured_builder',
  'breakout_story',
  'comeback_hall',
  'genesis_candidate',
  'homepage_banner',
  'sponsor_campaign',
] as const;

export const tokenSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  symbol: z.string().min(1),
  chain: z.string().optional(),
  status: z.enum(['sleeping', 'reviving', 'revived']).default('sleeping'),
});

export const bountySchema = z.object({
  id: z.string().min(1),
  tokenId: z.string().min(1),
  createdBy: z.string().min(1),
  title: z.string().min(3),
  description: z.string().min(20),
  rewardText: z.string().optional(),
  rewardType: z.enum(['offchain', 'token', 'stablecoin']).default('offchain'),
  fundingStatus: z.enum(fundingStatuses).default('unverified'),
  contactInfo: z.string().optional(),
  deadline: z.string().optional(),
  status: z.enum(bountyStatuses).default('pending_review'),
  boostCount: z.number().int().nonnegative().default(0),
  momentumScore: z.number().int().nonnegative().default(0),
  submissionCount: z.number().int().nonnegative().default(0),
  featured: z.boolean().default(false),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const optionalUrlSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().url().optional(),
);

const optionalTextSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.string().optional(),
);

export const createBountySchema = z.object({
  tokenId: z.string().min(1).optional(),
  tokenName: z.string().min(1),
  tokenSymbol: z.string().min(1),
  chain: z.string().min(1),
  contractAddress: optionalTextSchema,
  websiteUrl: optionalUrlSchema,
  twitterUrl: optionalUrlSchema,
  telegramUrl: optionalUrlSchema,
  createdBy: z.string().min(1).optional(),
  title: z.string().min(3),
  description: z.string().min(20),
  rewardText: optionalTextSchema,
  rewardType: z.enum(['offchain', 'token', 'stablecoin']).default('offchain'),
  contactInfo: optionalTextSchema,
  deadline: optionalTextSchema,
});

export const updateBountySchema = bountySchema
  .omit({
    id: true,
    createdBy: true,
    boostCount: true,
    momentumScore: true,
    submissionCount: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const submissionSchema = z.object({
  id: z.string().min(1),
  bountyId: z.string().min(1),
  builderId: z.string().min(1),
  name: z.string().min(2),
  tagline: z.string().min(4),
  demoUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
  screenshotUrl: z.string().url().optional(),
  description: z.string().optional(),
  status: z.enum(submissionStatuses).default('submitted'),
  deliveryStatus: z.enum(deliveryStatuses).default('not_started'),
  boostCount: z.number().int().nonnegative().default(0),
  momentumScore: z.number().int().nonnegative().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createSubmissionSchema = submissionSchema.omit({
  id: true,
  status: true,
  boostCount: true,
  momentumScore: true,
  createdAt: true,
  updatedAt: true,
});

export const updateSubmissionSchema = submissionSchema
  .omit({
    id: true,
    bountyId: true,
    builderId: true,
    boostCount: true,
    momentumScore: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export const patchSubmissionSchema = submissionSchema
  .pick({
    name: true,
    tagline: true,
    demoUrl: true,
    githubUrl: true,
    videoUrl: true,
    screenshotUrl: true,
    description: true,
    status: true,
    deliveryStatus: true,
  })
  .partial();

export const createBoostSchema = z
  .object({
    userId: z.string().min(1),
    bountyId: z.string().min(1).optional(),
    submissionId: z.string().min(1).optional(),
    referrerId: z.string().min(1).optional(),
    source: z.enum(['direct', 'share', 'referral']).default('direct'),
  })
  .refine((value) => value.bountyId || value.submissionId, {
    message: 'A Boost must target a bounty or submission.',
  });

export const supportEventSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  eventType: z.enum([
    'boost_bounty',
    'boost_submission',
    'share',
    'referral_signup',
    'referral_boost',
    'demo_feedback',
    'early_tester',
    'manual_adjustment',
  ]),
  targetType: z.enum(['bounty', 'submission', 'profile']),
  targetId: z.string().min(1),
  pointsDelta: z.number().int(),
  validityStatus: z.enum(boostValidityStatuses).default('valid'),
  createdAt: z.string(),
});

export const fundingEventSchema = z.object({
  id: z.string().min(1),
  bountyId: z.string().min(1),
  actorId: z.string().min(1),
  eventType: z.string().min(1),
  amountText: z.string().nullable().optional(),
  proofUrl: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  createdAt: z.string(),
});

export const curatedItemSchema = z.object({
  id: z.string().min(1),
  itemType: z.enum(curatedItemTypes),
  placement: z.string().default('home'),
  targetType: z.enum(['bounty', 'submission', 'builder', 'external', 'token']),
  targetId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  externalUrl: z.string().optional(),
  sortOrder: z.number().int().default(0),
  status: z.enum(['active', 'hidden']).default('active'),
});

export type TokenRecord = z.infer<typeof tokenSchema>;
export type BountyRecord = z.infer<typeof bountySchema>;
export type CreateBountyInput = z.infer<typeof createBountySchema>;
export type UpdateBountyInput = z.infer<typeof updateBountySchema>;
export type SubmissionRecord = z.infer<typeof submissionSchema>;
export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type PatchSubmissionInput = z.infer<typeof patchSubmissionSchema>;
export type CreateBoostInput = z.infer<typeof createBoostSchema>;
export type SupportEventRecord = z.infer<typeof supportEventSchema>;
export type FundingEventRecord = z.infer<typeof fundingEventSchema>;
export type CuratedItemRecord = z.infer<typeof curatedItemSchema>;

export const fundingStatusLabels: Record<'en-US' | 'zh-CN' | 'ko-KR', Record<(typeof fundingStatuses)[number], string>> = {
  'en-US': {
    unverified: 'External reward evidence pending',
    pledged: 'Reward pledged externally',
    escrowed: 'External evidence recorded',
    partially_paid: 'Externally reported partially completed',
    paid: 'Externally reported completed',
    disputed: 'External evidence disputed',
    cancelled: 'Reward cancelled externally',
  },
  'zh-CN': {
    unverified: '外部奖励证据待提交',
    pledged: '外部已承诺奖励',
    escrowed: '外部证据已记录',
    partially_paid: '外部报告部分完成',
    paid: '外部报告已完成',
    disputed: '外部证据有争议',
    cancelled: '外部已取消奖励',
  },
  'ko-KR': {
    unverified: '외부 보상 증거 대기 중',
    pledged: '외부 약정 보상',
    escrowed: '외부 증거가 기록됨',
    partially_paid: '외부 보고 부분 완료',
    paid: '외부 보고 완료',
    disputed: '외부 증거 분쟁 중',
    cancelled: '외부에서 취소한 보상',
  }
};
