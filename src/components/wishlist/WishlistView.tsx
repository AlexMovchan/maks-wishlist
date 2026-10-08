import type { Notify } from '../../hooks/useToast';
import type { Gift, Me, SiteContent } from '../../types';
import { GiftGrid } from './GiftGrid';
import { Hero } from './Hero';

type Props = {
  site: SiteContent | null;
  gifts: Gift[] | null;
  me: Me | null;
  error: string;
  reload: () => Promise<void>;
  notify: Notify;
  onLogin: () => void;
};

export const WishlistView = ({ site, gifts, me, error, reload, notify, onLogin }: Props) => (
  <>
    <Hero site={site} gifts={gifts} me={me} onLogin={onLogin} />
    <ListStatus gifts={gifts} error={error} />
    {gifts && <GiftGrid gifts={gifts} me={me} reload={reload} notify={notify} onLogin={onLogin} />}
  </>
);

const ListStatus = ({ gifts, error }: { gifts: Gift[] | null; error: string }) => {
  if (error) return <p className="notice notice--error">{error}</p>;
  if (!gifts) return <p className="muted center">Завантаження…</p>;
  if (gifts.length === 0) return <p className="empty">Список ще порожній. Загляньте пізніше!</p>;

  return null;
};
