import { useState } from 'react';
import { api } from '../../api';
import type { Notify } from '../../hooks/useToast';
import { errorText } from '../../lib/errors';
import type { Gift } from '../../types';
import { AdminGiftRow } from './AdminGiftRow';
import { GiftForm } from './GiftForm';

type Props = { gifts: Gift[]; reload: () => Promise<void>; notify: Notify };

export const GiftsTab = ({ gifts, reload, notify }: Props) => {
  const [editing, setEditing] = useState<Gift | 'new' | null>(null);

  const reservedCount = gifts.filter((g) => g.is_reserved).length;
  const nextSortOrder = gifts.reduce((max, g) => Math.max(max, g.sort_order), 0) + 10;

  const perform = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action();
      await reload();
      notify(success);
    } catch (err) {
      notify(errorText(err), 'error');
    }
  };

  const remove = (gift: Gift) => {
    const warning = gift.is_reserved ? `\n\nЙого вже забронював(-ла) ${gift.reserved_by}.` : '';
    if (!confirm(`Видалити «${gift.title}»?${warning}`)) return;
    perform(async () => {
      await api.admin.deleteGift(gift.id);
      await api.admin.removeImage(gift.image_url);
    }, 'Подарунок видалено');
  };

  const unreserve = (gift: Gift) => {
    if (!confirm(`Зняти бронювання «${gift.title}» (${gift.reserved_by})?`)) return;
    perform(() => api.unreserve(gift.id), 'Бронювання знято');
  };

  const handleSaved = async () => {
    setEditing(null);
    await reload();
    notify('Збережено');
  };

  return (
    <>
      <div className="admin__bar">
        <p className="muted">
          Усього: {gifts.length}, заброньовано: {reservedCount}
        </p>
        <button className="btn btn--primary" onClick={() => setEditing('new')}>
          + Додати подарунок
        </button>
      </div>

      {gifts.length === 0 && <p className="empty">Список порожній — додайте перший подарунок.</p>}

      <ul className="admin-list">
        {gifts.map((gift) => (
          <AdminGiftRow
            key={gift.id}
            gift={gift}
            onEdit={() => setEditing(gift)}
            onUnreserve={() => unreserve(gift)}
            onDelete={() => remove(gift)}
          />
        ))}
      </ul>

      {editing && (
        <GiftForm
          gift={editing === 'new' ? null : editing}
          nextSortOrder={nextSortOrder}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
};
