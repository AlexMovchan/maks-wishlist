import type { ReactNode } from 'react';

type Props = { label: string; hint?: ReactNode; children: ReactNode };

/** Label + input + optional hint below it. */
export const Field = ({ label, hint, children }: Props) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {hint && <small>{hint}</small>}
  </label>
);
