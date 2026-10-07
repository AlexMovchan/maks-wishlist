import { useEffect, useState } from 'react';
import { safeUrl } from '../../lib/format';

/** Temporary object URL of the selected file, for preview. */
const useObjectUrl = (file: File | null) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return setUrl(null);
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
};

type Props = {
  file: File | null;
  url: string;
  onFileChange: (file: File | null) => void;
  onUrlChange: (url: string) => void;
};

/** Image from either an uploaded file or a URL. The file takes precedence. */
export const ImagePicker = ({ file, url, onFileChange, onUrlChange }: Props) => {
  const preview = useObjectUrl(file) ?? safeUrl(url);

  const typeUrl = (value: string) => {
    onFileChange(null);
    onUrlChange(value);
  };

  const clear = () => typeUrl('');

  return (
    <fieldset className="field">
      <span>Картинка</span>
      <div className="image-picker">
        <div className="image-picker__preview">{preview ? <img src={preview} alt="" /> : <span>🎁</span>}</div>
        <div className="image-picker__controls">
          <label className="btn btn--small">
            Завантажити файл
            <input type="file" accept="image/*" hidden onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
          </label>
          <input
            value={file ? file.name : url}
            onChange={(e) => typeUrl(e.target.value)}
            placeholder="або встав посилання на картинку https://…"
          />
          {preview && (
            <button type="button" className="link-btn" onClick={clear}>
              Прибрати картинку
            </button>
          )}
        </div>
      </div>
    </fieldset>
  );
};
