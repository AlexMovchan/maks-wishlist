import type { Me } from '../../types';

type Props = {
  title: string;
  me: Me | null;
  adminView: boolean;
  onLogin: () => void;
  onLogout: () => void;
};

export const Header = ({ title, me, adminView, onLogin, onLogout }: Props) => (
  <header className="header">
    <div className="header__inner">
      {/* Star icon only: the full title is already the page's main heading */}
      <a className="header__brand" href="#" aria-label={title} title={title} />
      <nav className="header__nav">
        {me?.is_admin && <AdminToggle adminView={adminView} />}
        {me ? <UserMenu me={me} onLogout={onLogout} /> : <LoginButton onLogin={onLogin} />}
      </nav>
    </div>
  </header>
);

const AdminToggle = ({ adminView }: { adminView: boolean }) => (
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
