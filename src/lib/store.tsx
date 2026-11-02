import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AppState, Condition, DayLog, DayPlan, ItemLog, Settings, SetLog } from '../types';
import { defaultSchedule } from '../data/schedule';
import { getEx } from '../data/exercises';
import { todayKey, weekday } from './date';
import { ADD_AFTER, firstWeek, PROGRAM, stepAt } from '../data/program';
import { levelFor, programWeek } from './progress';
import { buildTestLog } from '../data/testday';
import { idbGet, idbSet, requestPersist } from './storage';

const KEY = 'mingyu-routine:v1';          // 예전 localStorage 키 (이전용)
const IDB_KEY = 'state';
export const THEME_KEY = 'mingyu-routine:theme'; // 첫 화면 깜빡임 방지용 테마만 localStorage에

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
      goalDate: '2026-12-20',
      autoProgram: true,
      testDays: { '2026-11-02': 'upper', '2026-12-20': 'full' },
      firstPullup: { achieved: false },
    },
    schedule: defaultSchedule(),
    logs: {},
    timer: null,
  };
}

let idbOk = true;

/** IndexedDB에서 불러오고, 없으면 예전 localStorage 기록을 옮겨 옵니다. */
async function loadInitial(): Promise<AppState> {
  try {
    const saved = await idbGet<AppState>(IDB_KEY);
    if (saved) return fixToday(normalize(saved));
    const raw = localStorage.getItem(KEY);
    const st = raw ? normalize(JSON.parse(raw)) : defaultState();
    await idbSet(IDB_KEY, st);
    if (raw) localStorage.removeItem(KEY); // 옮기기가 끝난 뒤에만 삭제
    return fixToday(st);
  } catch {
    idbOk = false; // 사생활 보호 모드 등 IndexedDB를 못 쓰는 환경 → localStorage로 계속
    try {
      const raw = localStorage.getItem(KEY);
      return fixToday(raw ? normalize(JSON.parse(raw)) : defaultState());
    } catch {
      return defaultState();
    }
  }
}

function fixToday(st: AppState): AppState {
  try {
    // 추천 프로그램 도입 전에 만들어진 오늘 기록(아직 체크 전)은 새 목표로 다시 계산
    const t = todayKey();
    const tl = st.logs[t];
    const isTest = !!st.settings.testDays?.[t];
    const stale = isTest ? !tl?.items.some((i) => i.test)
      : !tl?.items.some((i) => i.level) || tl?.items.some((i) => i.exerciseId === 'incline-pushup') || !tl?.items.some((i) => getEx(i.exerciseId)?.category === 'mobility');
    if (st.settings.autoProgram && tl && stale && !tl.items.some((i) => i.sets.some((x) => x.done))) {
      const logs = { ...st.logs };
      delete logs[t];
      return { ...st, logs };
    }
    return st;
  } catch {
    return st; // 보정에 실패해도 기록은 그대로 둡니다
  }
}

/** 경사 푸쉬업(받침대 필요)을 무릎 → 일반 푸쉬업 프로그램으로 바꿉니다. */
function migrateSchedule(schedule: AppState['schedule']): AppState['schedule'] {
  const out: AppState['schedule'] = {};
  for (const [k, plan] of Object.entries(schedule)) {
    out[Number(k)] = {
      ...plan,
      items: plan.items.map((p) => (p.exerciseId === 'incline-pushup' ? { exerciseId: 'pushup', sets: 2, target: 6 } : p)),
    };
    // 근력 운동 날인데 마무리 스트레칭이 없으면 맨 끝에 추가
    const its = out[Number(k)].items;
    const strength = its.some((p) => ['strength', 'pull'].includes(getEx(p.exerciseId)?.category ?? ''));
    const hasCool = its.some((p) => getEx(p.exerciseId)?.category === 'mobility');
    if (strength && !hasCool) out[Number(k)] = { ...out[Number(k)], items: [...its, { exerciseId: 'cooldown', sets: 1, target: 5 }] };
  }
  return out;
}

/** 가져오기/불러오기 시 누락 필드를 기본값으로 채웁니다. */
export function normalize(data: unknown): AppState {
  const d = defaultState();
  if (!data || typeof data !== 'object') throw new Error('형식이 올바르지 않습니다.');
  const s = data as Partial<AppState>;
  if (s.logs && typeof s.logs !== 'object') throw new Error('기록 데이터 형식이 올바르지 않습니다.');
  return {
    version: 1,
    settings: { ...d.settings, ...(s.settings ?? {}), testDays: { ...d.settings.testDays, ...(s.settings?.testDays ?? {}) } },
    schedule: migrateSchedule(s.schedule && typeof s.schedule === 'object' ? { ...d.schedule, ...s.schedule } : d.schedule),
    logs: s.logs ?? {},
    timer: s.timer ?? null,
  };
}

const makeSets = (n: number, target: number) =>
  Array.from({ length: Math.max(1, n) }, () => ({ target, actual: target, done: false }));

/** 일정 + (켜져 있으면) 추천 프로그램으로 그날의 기본 기록을 만듭니다. */
export function buildDayLog(date: string, plan: DayPlan, state?: AppState): DayLog {
  const testKind = state?.settings.testDays?.[date];
  if (testKind) return buildTestLog(date, testKind, plan);
  const auto = !!state?.settings.autoProgram;
  const items: ItemLog[] = [];
  for (const p of plan.items) {
    if (!getEx(p.exerciseId)) continue;
    if (auto && PROGRAM[p.exerciseId]) {
      const { level, reason } = levelFor(state!, p.exerciseId, date);
      const step = stepAt(p.exerciseId, level);
      if (step) { items.push({ exerciseId: p.exerciseId, sets: makeSets(step.sets, step.target), level, hold: reason }); continue; }
    }
    items.push({ exerciseId: p.exerciseId, sets: makeSets(p.sets, p.target) });
  }
  if (auto) {
    const week = programWeek(state!.settings.startDate, date);
    for (const [exId, anchor] of Object.entries(ADD_AFTER)) {
      const at = items.findIndex((i) => i.exerciseId === anchor);
      if (at < 0 || items.some((i) => i.exerciseId === exId) || week < firstWeek(exId)) continue;
      const { level, reason } = levelFor(state!, exId, date);
      const step = stepAt(exId, level);
      if (step) items.splice(at + 1, 0, { exerciseId: exId, sets: makeSets(step.sets, step.target), level, hold: reason });
    }
  }
  return { date, title: plan.title, items };
}

const hasDone = (log?: DayLog) => !!log?.items.some((i) => i.sets.some((s) => s.done));

function withCompletion(log: DayLog): DayLog {
  const sets = log.items.flatMap((i) => (i.optional ? i.sets.filter((s) => s.done) : i.sets));
  const all = sets.length > 0 && sets.every((s) => s.done);
  return { ...log, completedAt: all ? log.completedAt ?? Date.now() : undefined };
}

function save(st: AppState) {
  if (idbOk) { idbSet(IDB_KEY, st).catch(() => { idbOk = false; save(st); }); return; }
  try { localStorage.setItem(KEY, JSON.stringify(st)); } catch { /* 저장 공간 부족 */ }
}

function useStoreValue(initial: AppState) {
  const [state, setState] = useState<AppState>(initial);
  const [today, setToday] = useState(todayKey());
  const latest = useRef(state);
  const timer = useRef<number | null>(null);

  // 변경 즉시(0.2초 묶음) 저장, 앱을 벗어날 때는 바로 저장
  useEffect(() => {
    latest.current = state;
    try { localStorage.setItem(THEME_KEY, state.settings.theme); } catch { /* 무시 */ }
    if (timer.current) clearTimeout(timer.current);
    timer.current = window.setTimeout(() => save(state), 200);
  }, [state]);
  useEffect(() => {
    requestPersist();
    const flush = () => { if (document.visibilityState === 'hidden') save(latest.current); };
    const hide = () => save(latest.current);
    document.addEventListener('visibilitychange', flush);
    window.addEventListener('pagehide', hide);
    return () => { document.removeEventListener('visibilitychange', flush); window.removeEventListener('pagehide', hide); };
  }, []);

  // 자정이 지나거나 앱으로 돌아오면 날짜를 다시 확인
  useEffect(() => {
    const check = () => setToday(todayKey());
    const id = setInterval(check, 30_000);
    document.addEventListener('visibilitychange', check);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', check); };
  }, []);

  /** 저장된 기록이 있으면 그것을, 없으면 일정으로 만든 오늘의 기본 기록을 반환 */
  const dayLog = useCallback(
    (date: string): DayLog => state.logs[date] ?? buildDayLog(date, state.schedule[weekday(date)], state),
    [state],
  );

  const mutateDay = useCallback((date: string, fn: (log: DayLog) => DayLog) => {
    setState((s) => {
      const base = s.logs[date] ?? buildDayLog(date, s.schedule[weekday(date)], s);
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
    /** 수정 버튼으로 실제 수행 횟수를 기록 (0이면 미완료로 되돌림) */
    recordSet(date: string, i: number, j: number, actual: number) {
      mutateDay(date, (log) => {
        const set = log.items[i].sets[j];
        set.actual = actual;
        if (actual <= 0) { set.done = false; set.doneAt = undefined; set.actual = set.target; }
        else { if (!set.done) set.doneAt = Date.now(); set.done = true; }
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
      setState((s) => {
        const logs = { ...s.logs };
        const t = todayKey();
        // 프로그램 설정이 바뀌면 아직 시작하지 않은 오늘 목표를 다시 계산
        if (('autoProgram' in patch || 'startDate' in patch) && !hasDone(logs[t])) delete logs[t];
        return { ...s, settings: { ...s.settings, ...patch }, logs };
      });
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

function Inner({ initial, children }: { initial: AppState; children: ReactNode }) {
  const value = useStoreValue(initial);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [initial, setInitial] = useState<AppState | null>(null);
  useEffect(() => { void loadInitial().then(setInitial); }, []);
  if (!initial) return <div className="min-h-dvh bg-canvas" />;
  return <Inner initial={initial}>{children}</Inner>;
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
