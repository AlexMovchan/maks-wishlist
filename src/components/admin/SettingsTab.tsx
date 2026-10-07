import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../../api';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import type { Notify } from '../../hooks/useToast';
import { errorText } from '../../lib/errors';
import type { Settings } from '../../types';
import { Field } from '../ui/Field';
import { FormError } from '../ui/FormError';
import { InvitationBox } from './InvitationBox';

const CODE_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

const randomCode = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(8)), (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join('');

type Props = { reload: () => Promise<void>; notify: Notify };

export const SettingsTab = ({ reload, notify }: Props) => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    api.admin.getSettings().then(setSettings, (err) => notify(errorText(err), 'error'));
  }, [notify]);

  if (!settings) return <p className="muted">Завантаження…</p>;

  return <SettingsForm initial={settings} reload={reload} notify={notify} />;
};

const SettingsForm = ({ initial, reload, notify }: Props & { initial: Settings }) => {
  const [settings, setSettings] = useState(initial);
  const { busy, error, run } = useAsyncAction();

  const update = (patch: Partial<Settings>) => setSettings((prev) => ({ ...prev, ...patch }));

  const save = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await api.admin.updateSettings(settings);
      await reload();
      notify('Налаштування збережено');
    });
  };

  return (
    <form className="form form--narrow" onSubmit={save}>
      <Field label="Заголовок сайту">
        <input value={settings.title} onChange={(e) => update({ title: e.target.value })} maxLength={100} />
      </Field>
      <Field label="Підзаголовок">
        <textarea
          value={settings.subtitle}
          onChange={(e) => update({ subtitle: e.target.value })}
          rows={2}
          maxLength={300}
          placeholder="Наприклад: День народження Макса — 15 листопада"
        />
      </Field>
      <Field
        label="Інвайт-код для реєстрації"
        hint="Якщо код «розлетівся» не туди — змініть його. Уже зареєстровані гості не постраждають."
      >
        <div className="input-with-btn">
          <input
            value={settings.invite_code}
            onChange={(e) => update({ invite_code: e.target.value })}
            minLength={6}
            required
          />
          <button type="button" className="btn btn--small" onClick={() => update({ invite_code: randomCode() })}>
            Згенерувати
          </button>
        </div>
      </Field>
      <Field label="Максимум бронювань на одного гостя">
        <input
          type="number"
          min={1}
          max={100}
          value={settings.max_reservations}
          onChange={(e) => update({ max_reservations: Number(e.target.value) })}
        />
      </Field>

      <FormError message={error} />
      <button className="btn btn--primary" disabled={busy}>
        {busy ? 'Зберігаю…' : 'Зберегти'}
      </button>

      <InvitationBox inviteCode={settings.invite_code} notify={notify} />
    </form>
  );
};
