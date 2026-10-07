import { useState } from 'react';
import { api } from '../../api';
import type { Notify } from '../../hooks/useToast';
import { errorText } from '../../lib/errors';
import type { Gift, Me } from '../../types';
import { GiftCard } from './GiftCard';

type Props = {
  gifts: Gift[];
  me: Me | null;
  reload: () => Promise<void>;
  notify: Notify;
  onLogin: () => void;
};

export const GiftGrid = ({ gifts, me, reload, notify, onLogin }: Props) => {
  const [busyId, setBusyId] = useState<string | null>(null);

  const run = async (gift: Gift, action: 'reserve' | 'unreserve', success: string) => {
    setBusyId(gift.id);
    try {
      await api[action](gift.id);
      notify(success);
    } catch (err) {
      notify(errorText(err), 'error');
    } finally {
      // reload even after an error: someone else may have just reserved this gift
      await reload().catch(() => {});
      setBusyId(null);
    }
  };

  const reserve = (gift: Gift) => {
    if (!me) return onLogin();
    run(gift, 'reserve', `«${gift.title}» заброньовано за вами 🎉`);
  };

  const unreserve = (gift: Gift) => {
    const question = gift.is_mine
      ? `Скасувати бронювання «${gift.title}»?`
      : `Зняти бронювання «${gift.title}» (${gift.reserved_by})?`;
    if (confirm(question)) run(gift, 'unreserve', 'Бронювання скасовано');
  };

  return (
    <div className="grid">
      {gifts.map((gift) => (
        <GiftCard
          key={gift.id}
          gift={gift}
          isAdmin={Boolean(me?.is_admin)}
          busy={busyId === gift.id}
          onReserve={() => reserve(gift)}
          onUnreserve={() => unreserve(gift)}
        />
      ))}
    </div>
  );
};
