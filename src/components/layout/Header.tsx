import type { MouseEvent } from 'react';
import type { Me } from '../../types';

const BOUNCE: Keyframe[] = [
  { transform: 'scale(1) rotate(0)' },
  { transform: 'scale(0.75) rotate(-20deg)', offset: 0.3 },
  { transform: 'scale(1.15) rotate(8deg)', offset: 0.7 },
  { transform: 'scale(1) rotate(0)' },
];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Each tap plays the bounce from the start, so quick taps never look stuck mid-transition
const bounce = (el: HTMLElement) => {
  if (prefersReducedMotion()) return;

  el.getAnimations().forEach((a) => a.cancel());
  el.animate(BOUNCE, { duration: 350, easing: 'ease-out' });
};

type Props = {
  title: string;
  me: Me | null;
  adminView: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onStarTap: () => void;
};

export const Header = ({ title, me, adminView, onLogin, onLogout, onStarTap }: Props) => (
  <header className="header">
    <div className="header__inner">
      {/* Star icon only: the full title is already the page's main heading */}
      <StarButton title={title} onTap={onStarTap} />
      <nav className="header__nav">
        {me?.is_admin && <AdminToggle adminView={adminView} />}
        {me ? <UserMenu me={me} onLogout={onLogout} /> : <LoginButton onLogin={onLogin} />}
      </nav>
    </div>
  </header>
);

const StarButton = ({ title, onTap }: { title: string; onTap: () => void }) => {
  const tap = (e: MouseEvent<HTMLAnchorElement>) => {
    bounce(e.currentTarget);
    onTap();
  };

  return <a className="header__brand" href="#" aria-label={title} title={title} onClick={tap} />;
};

const AdminToggle =({ adminView }: { adminView: boolean }) => (
  <a className="btn btn--small" href={adminView ? '#' : '#/admin'}>
    {adminView ? 'До списку' : 'Адмінка'}
  </a>
);

const UserMenu = ({ me, onLogout }: { me: Me; onLogout: () => void }) => (
  <>
    <span className="header__user">{me.nickname}</span>
    <button className="btn btn--small" onClick={onLogout}>
      Вийти
    </button>
  </>
);

const LoginButton = ({ onLogin }: { onLogin: () => void }) => (
  <button className="btn btn--small btn--primary" onClick={onLogin}>
    Увійти
  </button>
);
