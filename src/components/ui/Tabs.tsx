export type TabItem<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  tabs: readonly TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
};

export const Tabs = <T extends string>({ tabs, active, onChange }: Props<T>) => (
  <div className="tabs" role="tablist">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        role="tab"
        aria-selected={tab.id === active}
        className={tab.id === active ? 'tab tab--active' : 'tab'}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
);
