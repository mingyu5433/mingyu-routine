import { BarChart3, Dumbbell, House, Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import { TodayScreen } from './screens/Today';
import { WorkoutScreen } from './screens/Workout';
import { RecordsScreen } from './screens/Records';
import { SettingsScreen } from './screens/Settings';
import { RestTimer } from './components/RestTimer';

type Tab = 'today' | 'workout' | 'records' | 'settings';
const TABS: { id: Tab; label: string; icon: typeof Dumbbell }[] = [
  { id: 'today', label: '홈', icon: House },
  { id: 'workout', label: '운동', icon: Dumbbell },
  { id: 'records', label: '기록', icon: BarChart3 },
  { id: 'settings', label: '설정', icon: SettingsIcon },
];

function useTheme(theme: 'system' | 'light' | 'dark') {
  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches);
      document.documentElement.classList.toggle('dark', dark);
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#121212' : '#ffffff');
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [theme]);
}

export default function App() {
  const { state } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  useTheme(state.settings.theme);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  return (
    <div className="mx-auto min-h-dvh max-w-[560px] bg-canvas">
      <main className="safe-top pb-[calc(96px+env(safe-area-inset-bottom))]">
        {tab === 'today' && <TodayScreen />}
        {tab === 'workout' && <WorkoutScreen />}
        {tab === 'records' && <RecordsScreen />}
        {tab === 'settings' && <SettingsScreen onEditSchedule={() => setTab('workout')} />}
      </main>

      <RestTimer />

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-canvas/95 backdrop-blur">
        <ul className="mx-auto flex h-[64px] max-w-[560px]">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <li key={id} className="flex-1">
                <button type="button" onClick={() => setTab(id)} aria-current={active ? 'page' : undefined}
                  className={`flex h-full w-full flex-col items-center justify-center gap-1 ${active ? 'text-primary' : 'text-muted'}`}>
                  <Icon size={22} strokeWidth={active ? 2.4 : 1.8} />
                  <span className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
