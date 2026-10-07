import { useState } from 'react';
import type { Notify } from '../../hooks/useToast';
import type { Gift } from '../../types';
import { Tabs, type TabItem } from '../ui/Tabs';
import { GiftsTab } from './GiftsTab';
import { GuestsTab } from './GuestsTab';
import { SettingsTab } from './SettingsTab';

type Tab = 'gifts' | 'guests' | 'settings';

const TABS: TabItem<Tab>[] = [
  { id: 'gifts', label: 'Подарунки' },
  { id: 'guests', label: 'Гості' },
  { id: 'settings', label: 'Налаштування' },
];

type Props = { gifts: Gift[]; reload: () => Promise<void>; notify: Notify };

export const AdminPanel = ({ gifts, reload, notify }: Props) => {
  const [tab, setTab] = useState<Tab>('gifts');

  return (
    <section className="admin">
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === 'gifts' && <GiftsTab gifts={gifts} reload={reload} notify={notify} />}
      {tab === 'guests' && <GuestsTab reload={reload} notify={notify} />}
      {tab === 'settings' && <SettingsTab reload={reload} notify={notify} />}
    </section>
  );
};
