import { useState, type ChangeEvent, type FormEvent } from 'react';
import { api } from '../../api';
import { useAsyncAction } from '../../hooks/useAsyncAction';
import { isHttpsUrl, parsePrice, safeUrl } from '../../lib/format';
import type { Gift } from '../../types';
import { Field } from '../ui/Field';
import { FormError } from '../ui/FormError';
import { Modal } from '../ui/Modal';
import { ImagePicker } from './ImagePicker';

type FormState = {
  title: string;
  url: string;
  price: string;
  note: string;
  sortOrder: string;
  imageUrl: string;
};

const toFormState = (gift: Gift | null, nextSortOrder: number): FormState => ({
  title: gift?.title ?? '',
  url: gift?.url ?? '',
  price: gift?.price != null ? String(gift.price) : '',
  note: gift?.note ?? '',
  sortOrder: String(gift?.sort_order ?? nextSortOrder),
  imageUrl: gift?.image_url ?? '',
});

const validate = (form: FormState, hasFile: boolean): string | null => {
  if (Number.isNaN(parsePrice(form.price))) return 'Ціна має бути числом';
  if (form.url && !safeUrl(form.url)) return 'Посилання має починатися з https://';
  if (form.imageUrl && !hasFile && !isHttpsUrl(form.imageUrl)) return 'Посилання на картинку має починатися з https://';
  return null;
};

type Props = { gift: Gift | null; nextSortOrder: number; onClose: () => void; onSaved: () => void };

export const GiftForm = ({ gift, nextSortOrder, onClose, onSaved }: Props) => {
  const [form, setForm] = useState(() => toFormState(gift, nextSortOrder));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { busy, error, setError, run } = useAsyncAction();

  const set = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const save = async () => {
    const uploaded = imageFile ? await api.admin.uploadImage(imageFile) : null;
    const imageUrl = uploaded ?? form.imageUrl;

    try {
      await api.admin.saveGift({
        id: gift?.id ?? null,
        title: form.title,
        url: form.url,
        image_url: imageUrl,
        price: parsePrice(form.price),
        note: form.note,
        sort_order: Number(form.sortOrder) || 0,
      });
    } catch (err) {
      await api.admin.removeImage(uploaded);
      throw err;
    }

    if (gift?.image_url !== imageUrl) await api.admin.removeImage(gift?.image_url ?? null);
    onSaved();
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const problem = validate(form, Boolean(imageFile));
    if (problem) return setError(problem);
    run(save);
  };

  return (
    <Modal title={gift ? 'Редагувати подарунок' : 'Новий подарунок'} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <Field label="Назва *">
          <input value={form.title} onChange={set('title')} required maxLength={200} />
        </Field>
        <Field label="Посилання на товар">
          <input type="url" value={form.url} onChange={set('url')} placeholder="https://…" />
        </Field>
        <div className="form__row">
          <Field label="Приблизна ціна, ₴">
            <input value={form.price} onChange={set('price')} inputMode="decimal" placeholder="1500" />
          </Field>
          <Field label="Порядок у списку">
            <input type="number" value={form.sortOrder} onChange={set('sortOrder')} />
          </Field>
        </div>
        <Field label="Примітка">
          <textarea
            value={form.note}
            onChange={set('note')}
            maxLength={1000}
            rows={2}
            placeholder="Колір, розмір, «будь-яка з серії» тощо"
          />
        </Field>
        <ImagePicker
          file={imageFile}
          url={form.imageUrl}
          onFileChange={setImageFile}
          onUrlChange={(imageUrl) => setForm((prev) => ({ ...prev, imageUrl }))}
        />

        <FormError message={error} />

        <div className="form__buttons">
          <button type="button" className="btn" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn--primary" disabled={busy}>
            {busy ? 'Зберігаю…' : 'Зберегти'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
