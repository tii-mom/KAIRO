import type { Bid, Catalyst } from '../src/types';
import type { BountyRecord, SubmissionRecord, TokenRecord } from './domain';

export function catalystToTokenRecord(catalyst: Catalyst): TokenRecord {
  return {
    id: `token-${catalyst.token.symbol.toLowerCase()}`,
    name: catalyst.token.name,
    symbol: catalyst.token.symbol,
    chain: 'demo',
    status: catalyst.status === 'Completed' ? 'revived' : 'reviving',
  };
}

export function catalystToBountyRecord(catalyst: Catalyst): BountyRecord {
  const now = new Date().toISOString();

  return {
    id: catalyst.id,
    tokenId: `token-${catalyst.token.symbol.toLowerCase()}`,
    createdBy: catalyst.creator,
    title: catalyst.title,
    description: catalyst.description,
    rewardText: `${catalyst.rewardPool.amount.toLocaleString()} ${catalyst.rewardPool.tokenSymbol}`,
    rewardType: 'token',
    fundingStatus: catalyst.isEscrowed ? 'escrowed' : 'unverified',
    deadline: catalyst.deadline,
    status:
      catalyst.status === 'Active'
        ? 'active'
        : catalyst.status === 'Voting'
          ? 'voting'
          : catalyst.status === 'Completed'
            ? 'completed'
            : 'upcoming',
    boostCount: catalyst.momentum,
    momentumScore: catalyst.momentum,
    submissionCount: catalyst.totalBids,
    featured: Boolean(catalyst.isVerified),
    createdAt: catalyst.createdAt,
    updatedAt: now,
  };
}

export function bidToSubmissionRecord(bid: Bid): SubmissionRecord {
  const createdAt = new Date(bid.createdAt).toISOString();

  return {
    id: bid.id,
    bountyId: bid.catalystId,
    builderId: bid.builderName,
    name: bid.title,
    tagline: bid.description.slice(0, 120),
    demoUrl: bid.demoUrl,
    githubUrl: bid.githubUrl,
    videoUrl: bid.videoUrl,
    description: bid.description,
    status:
      bid.status === 'Approved'
        ? 'shortlisted'
        : bid.status === 'Winner'
          ? 'winner'
          : bid.status === 'Declined'
            ? 'rejected'
            : 'submitted',
    deliveryStatus: bid.status === 'Winner' ? 'completed' : bid.status === 'Approved' ? 'approved' : 'not_started',
    boostCount: bid.votes,
    momentumScore: bid.votes * 10,
    createdAt,
    updatedAt: createdAt,
  };
}
