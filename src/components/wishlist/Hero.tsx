import type { Gift, Me, SiteContent } from '../../types';

type Props = { site: SiteContent | null; gifts: Gift[] | null; me: Me | null; onLogin: () => void };

export const Hero = ({ site, gifts, me, onLogin }: Props) => {
  const hasGifts = Boolean(gifts?.length);

  return (
    <section className="hero">
      <h1>{site?.title ?? 'Вішліст'}</h1>
      {site?.subtitle && <p className="hero__subtitle">{site.subtitle}</p>}
      {hasGifts && <Stats gifts={gifts!} me={me} maxReservations={site?.max_reservations} />}
      {hasGifts && !me && <LoginHint onLogin={onLogin} />}
    </section>
  );
};

type StatsProps = { gifts: Gift[]; me: Me | null; maxReservations?: number };

const Stats = ({ gifts, me, maxReservations }: StatsProps) => {
  const free = gifts.filter((g) => !g.is_reserved).length;
  const mine = gifts.filter((g) => g.is_mine).length;
  const myPart = me && maxReservations ? ` · ви забронювали ${mine} з ${maxReservations} можливих` : '';

  return (
    <p className="hero__stats">
      Вільно {free} з {gifts.length}
      {myPart}
    </p>
  );
};

const LoginHint = ({ onLogin }: { onLogin: () => void }) => (
  <p className="hero__hint">
    Щоб забронювати подарунок,{' '}
    <button className="link-btn" onClick={onLogin}>
      увійдіть або зареєструйтеся
    </button>{' '}
    з кодом із запрошення. Інші гості бачитимуть лише, що подарунок зайнятий, але не ким.
  </p>
);
