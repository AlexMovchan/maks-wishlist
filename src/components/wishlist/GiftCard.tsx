import { formatPrice, safeUrl } from '../../lib/format';
import type { Gift } from '../../types';

type Status = 'free' | 'mine' | 'taken';

const getStatus = (gift: Gift): Status => {
  if (gift.is_mine) return 'mine';
  if (gift.is_reserved) return 'taken';
  return 'free';
};

type Props = {
  gift: Gift;
  isAdmin: boolean;
  busy: boolean;
  onReserve: () => void;
  onUnreserve: () => void;
};

export const GiftCard = ({ gift, isAdmin, busy, onReserve, onUnreserve }: Props) => {
  const status = getStatus(gift);

  return (
    <article className={`card card--${status}`}>
      <div className="card__ribbon" aria-hidden="true" />
      <GiftImage image={safeUrl(gift.image_url)} status={status} />
      <GiftDetails gift={gift} showReservedBy={isAdmin} />
      <div className="card__actions">
        <ShopLink url={safeUrl(gift.url)} />
        <GiftActions status={status} isAdmin={isAdmin} busy={busy} onReserve={onReserve} onUnreserve={onUnreserve} />
      </div>
    </article>
  );
};

const BADGES: Record<Status, string | null> = {
  free: null,
  mine: 'Ви даруєте це',
  taken: 'Заброньовано',
};

const GiftImage = ({ image, status }: { image: string | null; status: Status }) => (
  <div className="card__image">
    {image ? <img src={image} alt="" loading="lazy" /> : <span className="card__placeholder">🎁</span>}
    {BADGES[status] && <span className={`badge badge--${status}`}>{BADGES[status]}</span>}
  </div>
);

const GiftDetails = ({ gift, showReservedBy }: { gift: Gift; showReservedBy: boolean }) => (
  <div className="card__body">
    <h3 className="card__title">{gift.title}</h3>
    {gift.note && <p className="card__note">{gift.note}</p>}
    {/* Pushed to the bottom so prices line up across cards regardless of title length */}
    <div className="card__meta">
      {gift.price != null && <p className="card__price">≈ {formatPrice(gift.price)}</p>}
      {showReservedBy && gift.reserved_by && (
        <p className="card__who">
          Забронював(-ла): <b>{gift.reserved_by}</b>
        </p>
      )}
    </div>
  </div>
);

const ShopLink = ({ url }: { url: string | null }) =>
  url && (
    <a className="btn btn--shop btn--wide" href={url} target="_blank" rel="noopener noreferrer nofollow">
      До магазину ↗
    </a>
  );

type ActionsProps = {
  status: Status;
  isAdmin: boolean;
  busy: boolean;
  onReserve: () => void;
  onUnreserve: () => void;
};

const GiftActions = ({ status, isAdmin, busy, onReserve, onUnreserve }: ActionsProps) => {
  if (status === 'free') {
    return (
      <button className="btn btn--primary btn--wide" disabled={busy} onClick={onReserve}>
        Забронювати
      </button>
    );
  }

  if (status === 'mine') {
    return (
      <button className="btn btn--wide" disabled={busy} onClick={onUnreserve}>
        Скасувати бронювання
      </button>
    );
  }

  if (isAdmin) {
    return (
      <button className="btn btn--danger btn--wide" disabled={busy} onClick={onUnreserve}>
        Зняти бронювання
      </button>
    );
  }

  return <p className="card__taken">Цей подарунок уже хтось дарує</p>;
};
