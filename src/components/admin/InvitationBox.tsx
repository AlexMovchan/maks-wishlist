import type { Notify } from '../../hooks/useToast';

const buildInvitation = (inviteCode: string) => {
  const siteUrl = location.href.split('#')[0];
  return `Привіт! Ось список подарунків: ${siteUrl}\nЩоб забронювати подарунок, зареєструйтеся з кодом: ${inviteCode}`;
};

/** Ready-made text to forward to guests in a messenger. */
export const InvitationBox = ({ inviteCode, notify }: { inviteCode: string; notify: Notify }) => {
  const text = buildInvitation(inviteCode);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    notify('Скопійовано');
  };

  return (
    <div className="invitation">
      <span className="field__label">Текст запрошення для гостей</span>
      <pre>{text}</pre>
      <button type="button" className="btn btn--small" onClick={copy}>
        Скопіювати
      </button>
    </div>
  );
};
