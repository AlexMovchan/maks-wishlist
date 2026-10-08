import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api';
import type { Notify } from '../../hooks/useToast';
import { errorText } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import type { Guest } from '../../types';

type Props = { reload: () => Promise<void>; notify: Notify };

export const GuestsTab = ({ reload, notify }: Props) => {
  const [guests, setGuests] = useState<Guest[] | null>(null);

  const load = useCallback(async () => {
    try {
      setGuests(await api.admin.listGuests());
    } catch (err) {
      notify(errorText(err), 'error');
    }
  }, [notify]);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (guest: Guest) => {
    const extra = guest.reservations ? ` Його бронювання (${guest.reservations}) теж зникнуть.` : '';

    if (!confirm(`Видалити акаунт «${guest.nickname}»?${extra}`)) return;

    try {
      await api.admin.deleteGuest(guest.id);
      await Promise.all([load(), reload()]);
      notify('Акаунт видалено');
    } catch (err) {
      notify(errorText(err), 'error');
    }
  };

  if (!guests) return <p className="muted">Завантаження…</p>;
  if (guests.length === 0) return <p className="empty">Ще ніхто не зареєструвався.</p>;

  return (
    <ul className="admin-list">
      {guests.map((guest) => (
        <GuestRow key={guest.id} guest={guest} onDelete={() => remove(guest)} />
      ))}
    </ul>
  );
};

const GuestRow = ({ guest, onDelete }: { guest: Guest; onDelete: () => void }) => (
  <li className="admin-list__item">
    <div className="admin-list__info">
      <b>
        {guest.nickname} {guest.is_admin && <span className="pill">адмін</span>}
      </b>
      <span className="muted">
        Бронювань: {guest.reservations} · з {formatDate(guest.created_at)}
      </span>
    </div>
    {!guest.is_admin && (
      <div className="admin-list__actions">
        <button className="btn btn--small btn--danger" onClick={onDelete}>
          Видалити
        </button>
      </div>
    )}
  </li>
);
