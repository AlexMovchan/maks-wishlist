import { formatPrice, safeUrl } from '../../lib/format';
import type { Gift } from '../../types';

type Props = {
  gift: Gift;
  onEdit: () => void;
  onUnreserve: () => void;
  onDelete: () => void;
};

export const AdminGiftRow = ({ gift, onEdit, onUnreserve, onDelete }: Props) => {
  const image = safeUrl(gift.image_url);
  const price = gift.price != null ? formatPrice(gift.price) : 'без ціни';

  return (
    <li className="admin-list__item">
      <div className="admin-list__thumb">{image ? <img src={image} alt="" /> : '🎁'}</div>
      <div className="admin-list__info">
        <b>{gift.title}</b>
        <span className="muted">
          {price} · порядок {gift.sort_order}
        </span>
        <ReservationPill reservedBy={gift.is_reserved ? gift.reserved_by : null} />
      </div>
      <div className="admin-list__actions">
        {gift.is_reserved && (
          <button className="btn btn--small" onClick={onUnreserve}>
            Зняти бронь
          </button>
        )}
        <button className="btn btn--small" onClick={onEdit}>
          Редагувати
        </button>
        <button className="btn btn--small btn--danger" onClick={onDelete}>
          Видалити
        </button>
      </div>
    </li>
  );
};

const ReservationPill = ({ reservedBy }: { reservedBy: string | null }) =>
  reservedBy ? (
    <span className="pill pill--taken">Бронь: {reservedBy}</span>
  ) : (
    <span className="pill pill--free">Вільний</span>
  );
