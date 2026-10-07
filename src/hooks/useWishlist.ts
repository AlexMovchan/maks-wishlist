import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { errorText } from '../lib/errors';
import { isConfigured } from '../lib/supabase';
import type { Gift, Me, SiteInfo } from '../types';

/** Profile, site settings and the gift list. Reloaded on sign-in/sign-out. */
export const useWishlist = (userId: string | null) => {
  const [me, setMe] = useState<Me | null>(null);
  const [site, setSite] = useState<SiteInfo | null>(null);
  const [gifts, setGifts] = useState<Gift[] | null>(null);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    const [nextSite, nextGifts] = await Promise.all([api.siteInfo(), api.listGifts()]);
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

  useEffect(() => {
    if (site) document.title = site.title;
  }, [site]);

  return { me, site, gifts, error, reload };
};
