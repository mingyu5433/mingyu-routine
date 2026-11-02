import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AppState, Condition, DayLog, DayPlan, Settings, SetLog } from '../types';
import { defaultSchedule } from '../data/schedule';
import { getEx } from '../data/exercises';
import { todayKey, weekday } from './date';

const KEY = 'mingyu-routine:v1';

export function defaultState(): AppState {
  return {
    version: 1,
    settings: {
      theme: 'system',
      restDefault: 75,
      restPull: 105,
      sound: true,
      haptic: true,
      startDate: todayKey(),
      firstPullup: { achieved: false },
    },
    schedule: defaultSchedule(),
    logs: {},
    timer: null,
  };
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    return normalize(JSON.parse(raw));
  } catch {
    return defaultState();
  }
}

/** 가져오기/불러오기 시 누락 필드를 기본값으로 채웁니다. */
export function normalize(data: unknown): AppState {
  const d = defaultState();
  if (!data || typeof data !== 'object') throw new Error('형식이 올바르지 않습니다.');
  const s = data as Partial<AppState>;
  if (s.logs && typeof s.logs !== 'object') throw new Error('기록 데이터 형식이 올바르지 않습니다.');
  return {
    version: 1,
    settings: { ...d.settings, ...(s.settings ?? {}) },
    schedule: s.schedule && typeof s.schedule === 'object' ? { ...d.schedule, ...s.schedule } : d.schedule,
    logs: s.logs ?? {},
    timer: s.timer ?? null,
  };
}

export function buildDayLog(date: string, plan: DayPlan): DayLog {
  return {
    date,
    title: plan.title,
    items: plan.items
      .filter((p) => getEx(p.exerciseId))
      .map((p) => ({
        exerciseId: p.exerciseId,
        sets: Array.from({ length: Math.max(1, p.sets) }, () => ({ target: p.target, actual: p.target, done: false })),
      })),
  };
}

const hasDone = (log?: DayLog) => !!log?.items.some((i) => i.sets.some((s) => s.done));

function withCompletion(log: DayLog): DayLog {
  const sets = log.items.flatMap((i) => i.sets);
  const all = sets.length > 0 && sets.every((s) => s.done);
  return { ...log, completedAt: all ? log.completedAt ?? Date.now() : undefined };
}

function useStoreValue() {
  const [state, setState] = useState<AppState>(load);
  const [today, setToday] = useState(todayKey());

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장 공간 부족 등 */ }
  }, [state]);

  // 자정이 지나거나 앱으로 돌아오면 날짜를 다시 확인
  useEffect(() => {
    const check = () => setToday(todayKey());
    const id = setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', check); };
  }, []);

  /** 저장된 기록이 있으면 그것을, 없으면 일정으로 만든 오늘의 기본 기록을 반환 */
  const dayLog = useCallback(
    (date: string): DayLog => state.logs[date] ?? buildDayLog(date, state.schedule[weekday(date)]),
    [state.logs, state.schedule],
  );

  const mutateDay = useCallback((date: string, fn: (log: DayLog) => DayLog) => {
    setState((s) => {
      const base = s.logs[date] ?? buildDayLog(date, s.schedule[weekday(date)]);
      return { ...s, logs: { ...s.logs, [date]: withCompletion(fn(structuredClone(base))) } };
    });
  }, []);

  const actions = useMemo(() => ({
    toggleSet(date: string, i: number, j: number) {
      mutateDay(date, (log) => {
        const set = log.items[i].sets[j];
        set.done = !set.done;
        set.doneAt = set.done ? Date.now() : undefined;
        return log;
      });
    },
    updateSet(date: string, i: number, j: number, patch: Partial<SetLog>) {
      mutateDay(date, (log) => {
        Object.assign(log.items[i].sets[j], patch);
        return log;
      });
    },
    addSet(date: string, i: number) {
      mutateDay(date, (log) => {
        const sets = log.items[i].sets;
        const last = sets[sets.length - 1];
        const t = last?.target ?? getEx(log.items[i].exerciseId)?.defaultTarget ?? 8;
        sets.push({ target: t, actual: t, done: false });
        return log;
      });
    },
    removeSet(date: string, i: number, j: number) {
      mutateDay(date, (log) => {
        if (log.items[i].sets.length > 1) log.items[i].sets.splice(j, 1);
        return log;
      });
    },
    setCondition(date: string, c: Condition | undefined) {
      mutateDay(date, (log) => ({ ...log, condition: c }));
    },
    setDayPlan(wd: number, plan: DayPlan) {
      setState((s) => {
        const schedule = { ...s.schedule, [wd]: plan };
        const logs = { ...s.logs };
        const t = todayKey();
        // 오늘 아직 아무 세트도 체크하지 않았다면 바뀐 일정을 바로 반영
        if (weekday(t) === wd && !hasDone(logs[t])) delete logs[t];
        return { ...s, schedule, logs };
      });
    },
    /** 일정에 포함된 모든 요일의 목표를 한 번에 변경 */
    setExerciseGoalAll(exerciseId: string, sets: number, target: number) {
      setState((s) => {
        const schedule = { ...s.schedule };
        let touchedToday = false;
        const t = todayKey();
        for (const k of Object.keys(schedule)) {
          const wd = Number(k);
          const plan = schedule[wd];
          if (!plan.items.some((p) => p.exerciseId === exerciseId)) continue;
          schedule[wd] = { ...plan, items: plan.items.map((p) => (p.exerciseId === exerciseId ? { ...p, sets, target } : p)) };
          if (weekday(t) === wd) touchedToday = true;
        }
        const logs = { ...s.logs };
        if (touchedToday && !hasDone(logs[t])) delete logs[t];
        return { ...s, schedule, logs };
      });
    },
    resetSchedule() {
      setState((s) => {
        const logs = { ...s.logs };
        const t = todayKey();
        if (!hasDone(logs[t])) delete logs[t];
        return { ...s, schedule: defaultSchedule(), logs };
      });
    },
    updateSettings(patch: Partial<Settings>) {
      setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
    },
    startTimer(seconds: number, label: string) {
      setState((s) => ({ ...s, timer: { endAt: Date.now() + seconds * 1000, total: seconds, pausedLeft: null, label } }));
    },
    pauseTimer() {
      setState((s) => (s.timer && s.timer.pausedLeft === null
        ? { ...s, timer: { ...s.timer, pausedLeft: Math.max(0, s.timer.endAt - Date.now()) } } : s));
    },
    resumeTimer() {
      setState((s) => (s.timer && s.timer.pausedLeft !== null
        ? { ...s, timer: { ...s.timer, endAt: Date.now() + s.timer.pausedLeft, pausedLeft: null } } : s));
    },
    addTimer(seconds: number) {
      setState((s) => {
        if (!s.timer) return s;
        const t = s.timer;
        return {
          ...s,
          timer: t.pausedLeft !== null
            ? { ...t, pausedLeft: Math.max(0, t.pausedLeft + seconds * 1000), total: t.total + seconds }
            : { ...t, endAt: Math.max(Date.now(), t.endAt + seconds * 1000), total: t.total + seconds },
        };
      });
    },
    stopTimer() {
      setState((s) => ({ ...s, timer: null }));
    },
    replaceAll(next: AppState) {
      setState(next);
    },
  }), [mutateDay]);

  return { state, today, dayLog, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('StoreProvider missing');
  return v;
}

export const restFor = (exerciseId: string, settings: Settings) => {
  const ex = getEx(exerciseId);
  if (!ex) return settings.restDefault;
  if (ex.restSec > 0) return ex.restSec;
  return ex.category === 'pull' ? settings.restPull : settings.restDefault;
};
