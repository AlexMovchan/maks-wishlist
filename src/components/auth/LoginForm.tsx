import { useState, type FormEvent } from 'react';
import { api } from '../../api';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { Field } from '../ui/Field';
import { FormError } from '../ui/FormError';

export const LoginForm = ({ onDone }: { onDone: (message: string) => void }) => {
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const { busy, error, run } = useAsyncAction();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api.signIn(nickname, password);
      onDone('Ви увійшли');
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <Field label="Ваше ім'я">
        <input value={nickname} onChange={(e) => setNickname(e.target.value)} required autoComplete="username" />
      </Field>
      <Field label="Пароль">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </Field>
      <FormError message={error} />
      <button className="btn btn--primary btn--wide" disabled={busy}>
        {busy ? 'Зачекайте…' : 'Увійти'}
      </button>
    </form>
  );
};
