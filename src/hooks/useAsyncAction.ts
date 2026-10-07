import { useCallback, useState } from 'react';
import { errorText } from '../lib/errors';

/** Busy state + error message for forms with an async action. */
export const useAsyncAction = () => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const run = useCallback(async (action: () => Promise<void>) => {
    setError('');
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, error, setError, run };
};
