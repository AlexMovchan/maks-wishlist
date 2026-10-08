import { useCallback, useState } from 'react';
import { api } from './api';
import { AdminPanel } from './components/admin/AdminPanel';
import { AuthDialog } from './components/auth/AuthDialog';
import { BIRTHDAY_AGE, Celebration } from './components/eggs/Celebration';
import { Header } from './components/layout/Header';
import { NotConfigured } from './components/layout/NotConfigured';
import { Snowdrift, Snowfall } from './components/layout/WinterDecor';
import { Toast } from './components/ui/Toast';
import { WishlistView } from './components/wishlist/WishlistView';
import { useHashView } from './hooks/useHashView';
import { useMultiTap } from './hooks/useMultiTap';
import { useSession } from './hooks/useSession';
import { useToast } from './hooks/useToast';
import { useWishlist } from './hooks/useWishlist';
import { isConfigured } from './lib/supabase';

export const App = () => {
  const session = useSession();
  const view = useHashView();
  const { toast, notify, dismiss } = useToast();
  const { me, site, gifts, error, reload } = useWishlist(session?.user.id ?? null);
  const [authOpen, setAuthOpen] = useState(false);
  const [partyKey, setPartyKey] = useState(0);

  const startParty = useCallback(() => setPartyKey((k) => k + 1), []);
  const endParty = useCallback(() => setPartyKey(0), []);
  const onStarTap = useMultiTap(BIRTHDAY_AGE, startParty);

  if (!isConfigured) return <NotConfigured />;

  const showAdmin = view === 'admin' && Boolean(me?.is_admin);
  const openAuth = () => setAuthOpen(true);

  const signOut = async () => {
    await api.signOut();
    location.hash = '';
    notify('Ви вийшли');
  };

  const handleAuthDone = (message: string) => {
    setAuthOpen(false);
    notify(message);
  };

  return (
    <>
      <Snowfall />
      <Header
        title={site?.title ?? 'Вішліст'}
        me={me}
        adminView={showAdmin}
        onLogin={openAuth}
        onLogout={signOut}
        onStarTap={onStarTap}
      />

      <main className="page">
        {showAdmin ? (
          <AdminPanel gifts={gifts ?? []} reload={reload} notify={notify} />
        ) : (
          <WishlistView
            site={site}
            gifts={gifts}
            me={me}
            error={error}
            reload={reload}
            notify={notify}
            onLogin={openAuth}
          />
        )}
      </main>
      <Snowdrift />

      {authOpen && <AuthDialog onClose={() => setAuthOpen(false)} onDone={handleAuthDone} />}
      <Toast toast={toast} onClose={dismiss} />
      {partyKey > 0 && <Celebration key={partyKey} onDone={endParty} />}
    </>
  );
};
