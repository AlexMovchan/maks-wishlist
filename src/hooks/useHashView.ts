import { useEffect, useState } from 'react';

export type View = 'list' | 'admin';

const readView = (): View => (location.hash === '#/admin' ? 'admin' : 'list');

/** Simple hash-based "routing": avoids 404s on page refresh on GitHub Pages. */
export const useHashView = (): View => {
  const [view, setView] = useState<View>(readView);

  useEffect(() => {
    const onHashChange = () => setView(readView());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return view;
};
