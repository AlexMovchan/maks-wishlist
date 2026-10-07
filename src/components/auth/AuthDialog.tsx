import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Tabs, type TabItem } from '../ui/Tabs';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

type Mode = 'login' | 'register';

const MODES: TabItem<Mode>[] = [
  { id: 'login', label: 'Вхід' },
  { id: 'register', label: 'Реєстрація' },
];

type Props = { onClose: () => void; onDone: (message: string) => void };

export const AuthDialog = ({ onClose, onDone }: Props) => {
  const [mode, setMode] = useState<Mode>('login');
  const title = MODES.find((m) => m.id === mode)!.label;

  return (
    <Modal title={title} onClose={onClose}>
      <Tabs tabs={MODES} active={mode} onChange={setMode} />
      {mode === 'login' ? <LoginForm onDone={onDone} /> : <RegisterForm onDone={onDone} />}
    </Modal>
  );
};
