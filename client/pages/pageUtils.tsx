import type React from 'react';
import type { Bid, Catalyst, UserState } from '../../src/types';

export const demoUserState: UserState = {
  walletAddress: '0x71C8b29330ebde4ea29141088d8b4a2911ba49Bf',
  walletName: 'KAIRO Demo',
  balanceEth: 2.8452,
  balanceSol: 45.8,
  balanceKairo: 400,
  boostedCatalysts: ['cat-1'],
  boostedBids: [],
  ownedTokens: {
    DORM: 5000,
    PEPE2: 12000000,
    RETRO: 250,
    SHIBE: 80000,
  },
};

export function noopNotification(title: string, message: string, type: 'success' | 'info' | 'error') {
  console[type === 'error' ? 'error' : 'log'](`[${type}] ${title}: ${message}`);
}

export function noopBoostCatalyst(id: string, amount: number) {
  console.log(`Boost catalyst ${id} by ${amount}`);
}

export function noopBoostBid(id: string) {
  console.log(`Boost bid ${id}`);
}

export function noopSubmitBid(bid: Omit<Bid, 'id' | 'createdAt' | 'status' | 'votes'>) {
  console.log('Submit bid', bid);
}

export function noopUpdateCatalyst(id: string, updates: Partial<Catalyst>) {
  console.log('Update catalyst', id, updates);
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-[#07090e] p-4 text-white md:p-8">{children}</main>;
}
