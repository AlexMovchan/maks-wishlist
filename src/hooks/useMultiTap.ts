import { useCallback, useRef } from 'react';

/** Calls onComplete after `taps` quick taps in a row (each within `windowMs` of the previous one). */
export const useMultiTap = (taps: number, onComplete: () => void, windowMs = 1500) => {
  const count = useRef(0);
  const lastTap = useRef(0);

  return useCallback(() => {
    const now = Date.now();

    count.current = now - lastTap.current > windowMs ? 1 : count.current + 1;
    lastTap.current = now;

    if (count.current >= taps) {
      count.current = 0;
      onComplete();
    }
  }, [taps, onComplete, windowMs]);
};
