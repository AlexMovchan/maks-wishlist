import type { Gift } from '../types';

export type GiftStatus = 'free' | 'mine' | 'taken';

export const getGiftStatus = (gift: Gift): GiftStatus => {
  if (gift.is_mine) return 'mine';
  if (gift.is_reserved) return 'taken';

  return 'free';
};

const GUEST_ORDER: Record<GiftStatus, number> = { free: 0, mine: 1, taken: 2 };

/**
 * Free gifts first, then the guest's own, then taken ones.
 * Sort is stable, so the admin's order is kept within each group.
 */
export const sortForGuests = (gifts: Gift[]): Gift[] =>
  [...gifts].sort((a, b) => GUEST_ORDER[getGiftStatus(a)] - GUEST_ORDER[getGiftStatus(b)]);
