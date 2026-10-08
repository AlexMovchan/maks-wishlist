import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { errorText } from '../lib/errors';
import { isConfigured } from '../lib/supabase';
import type { Gift, Me, SiteContent } from '../types';

/** Profile, site settings and the gift list. Reloaded on sign-in/sign-out and when the tab regains focus. */
export const useWishlist = (userId: string | null) => {
  const [me, setMe] = useState<Me | null>(null);
  const [site, setSite] = useState<SiteContent | null>(null);
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const [nextSite, nextGifts] = await Promise.all([api.siteContent(), api.listGifts()]);

    setSite(nextSite);
    setGifts(nextGifts);
  }, []);

  useEffect(() => {
    if (!isConfigured) return;

    let cancelled = false;

    const load = async () => {
      try {
        const nextMe = userId ? await api.me() : null;

        if (cancelled) return;

        setMe(nextMe);
        await reload();
        setError('');
      } catch (err) {
        if (!cancelled) setError(errorText(err));
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [userId, reload]);

  // Refresh when the guest comes back to the tab (e.g. from a messenger),
  // so they don't try to reserve something that was taken while they were away.
  useEffect(() => {
    if (!isConfigured) return;

    let lastRefresh = 0;

    const refresh = () => {
      // "focus" and "visibilitychange" often fire together — refresh only once
      if (document.visibilityState !== 'visible' || Date.now() - lastRefresh < 2000) return;

      lastRefresh = Date.now();
      reload().catch(() => {});
    };

    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('focus', refresh);

    return () => {
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, [reload]);

  useEffect(() => {
    if (site) document.title = site.title;
  }, [site]);

  return { me, site, gifts, error, reload };
};
