import { useState, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../api';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { SignUpInput } from '../../types';
import { Field } from '../ui/Field';
import { FormError } from '../ui/FormError';

const EMPTY: SignUpInput = { nickname: '', password: '', invite: '' };

export const RegisterForm = ({ onDone }: { onDone: (message: string) => void }) => {
  const [form, setForm] = useState(EMPTY);
  const { busy, error, run } = useAsyncAction();

  const set = (key: keyof SignUpInput) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api.signUp(form);
      onDone('Акаунт створено — можна бронювати!');
    });
  };

  return (
    <form className="form" onSubmit={submit}>
      <Field label="Ваше ім'я" hint="З ним ви будете входити. Його побачить лише власник списку.">
        <input
          value={form.nickname}
          onChange={set('nickname')}
          required
          minLength={2}
          maxLength={24}
          autoComplete="username"
          placeholder="Наприклад, Тітка Оля"
        />
      </Field>
      <Field label="Пароль" hint="Мінімум 6 символів. Запам'ятайте його — відновити пароль не вийде.">
        <input
          type="password"
          value={form.password}
          onChange={set('password')}
          required
          minLength={6}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Код із запрошення">
        <input value={form.invite} onChange={set('invite')} required autoComplete="off" />
      </Field>
      <FormError message={error} />
      <button className="btn btn--primary btn--wide" disabled={busy}>
        {busy ? 'Зачекайте…' : 'Зареєструватися'}
      </button>
    </form>
  );
};
