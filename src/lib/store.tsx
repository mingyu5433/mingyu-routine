import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { AfterNote, AppState, Condition, ConditionCheck, DayLog, DayPlan, ItemLog, Settings, SetLog } from '../types';
import { defaultSchedule, KNEE_LOAD, type SchedulePreset } from '../data/schedule';
import { getEx } from '../data/exercises';
import { todayKey, weekday } from './date';
import { resolveItem, type Suggestion } from './plan';
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
      testDays: { '2026-11-02': 'upper', '2026-12-20': 'full', '2027-01-02': 'full' },
      migV: 4,
      kneeRest: false,
      planStart: '2026-11-09',
      fullSets: false,
      exState: {},
      snooze: {},
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
    const OLD: Record<string, { exerciseId: string; label: string }> = {
      '보조 매달리기 최대': { exerciseId: 'dead-hang', label: '매달리기 최대 (발 떼고, 초)' },
      '발 보조 풀업 최대': { exerciseId: 'scap-pullup', label: '견갑 풀업 최대 (발 떼고)' },
    };
    if (isTest && tl?.items.some((i) => i.label?.startsWith('무릎 푸쉬업') && !i.sets[0]?.done)) {
      const items = tl.items.filter((i) => !(i.label?.startsWith('무릎 푸쉬업') && !i.sets[0]?.done));
      st = { ...st, logs: { ...st.logs, [t]: { ...tl, items } } };
      return fixToday(st);
    }
    if (isTest && tl?.items.some((i) => i.label && OLD[i.label] && !i.sets[0]?.done)) {
      const items = tl.items.map((i) => (i.label && OLD[i.label] && !i.sets[0]?.done ? { ...i, ...OLD[i.label] } : i));
      return { ...st, logs: { ...st.logs, [t]: { ...tl, items } } };
    }
    const stale = isTest ? !tl?.items.some((i) => i.test) : !!tl && !tl.items.some((i) => i.phase);
    if (tl && stale && !tl.items.some((i) => i.sets.some((x) => x.done))) {
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

/**
 * v2 (11/2 테스트 반영): 운동 전 정적 스트레칭(문틀 가슴)은 마무리로 옮기고 동적 준비운동(팔 크게 돌리기)으로 교체,
 * 보조 매달리기 → 견갑 풀업 상시 포함. 한 번만 적용되어 이후 직접 바꾼 일정은 건드리지 않습니다.
 */
function migrateV2(schedule: AppState['schedule']): AppState['schedule'] {
  const out: AppState['schedule'] = {};
  for (const [k, plan] of Object.entries(schedule)) {
    let items = plan.items.map((p) => (p.exerciseId === 'doorway-stretch' ? { exerciseId: 'arm-circles', sets: 1, target: 10 } : p));
    if (items.some((p) => p.exerciseId === 'assisted-hang')) {
      items = items.some((p) => p.exerciseId === 'scap-pullup')
        ? items.filter((p) => p.exerciseId !== 'assisted-hang')
        : items.map((p) => (p.exerciseId === 'assisted-hang' ? { exerciseId: 'scap-pullup', sets: 3, target: 4 } : p));
    }
    out[Number(k)] = { ...plan, items };
  }
  return out;
}

/** 가져오기/불러오기 시 누락 필드를 기본값으로 채웁니다. */
export function normalize(data: unknown): AppState {
  const d = defaultState();
  if (!data || typeof data !== 'object') throw new Error('형식이 올바르지 않습니다.');
  const s = data as Partial<AppState>;
  if (s.logs && typeof s.logs !== 'object') throw new Error('기록 데이터 형식이 올바르지 않습니다.');
  const settings = { ...d.settings, ...(s.settings ?? {}), testDays: { ...d.settings.testDays, ...(s.settings?.testDays ?? {}) } };
  let schedule = migrateSchedule(s.schedule && typeof s.schedule === 'object' ? { ...d.schedule, ...s.schedule } : d.schedule);
  if ((s.settings?.migV ?? 0) < 2) { schedule = migrateV2(schedule); settings.migV = 2; }
  // v3 (11/5): 무릎 부상 → 상체 A/B 주 4회 강화 프로그램으로 일정 교체, 무릎 회복 모드 켜기
  if ((s.settings?.migV ?? 0) < 3) {
    schedule = defaultSchedule('upper');
    settings.migV = 3;
    settings.kneeRest = true;
    const logs = { ...(s.logs ?? {}) };
    const t = todayKey();
    if (logs[t] && !logs[t].items.some((i) => i.sets.some((x) => x.done))) delete logs[t];
    s.logs = logs;
  }
  // v4 (11/8): 명세서 주 6일 전신 프로그램 · 8주 진행 · 무릎 회복 완료
  if ((s.settings?.migV ?? 0) < 4) {
    schedule = defaultSchedule('spec');
    Object.assign(settings, { migV: 4, kneeRest: false, planStart: '2026-11-09', fullSets: false, exState: {}, snooze: {} });
    settings.testDays = { ...settings.testDays, '2027-01-02': 'full' };
    const logs = { ...(s.logs ?? {}) };
    const t = todayKey();
    if (logs[t] && !logs[t].items.some((i) => i.sets.some((x) => x.done))) delete logs[t];
    s.logs = logs;
  }
  return {
    version: 1,
    settings,
    schedule,
    logs: s.logs ?? {},
    timer: s.timer ?? null,
  };
}

const makeSets = (n: number, target: number) =>
  Array.from({ length: Math.max(1, n) }, () => ({ target, actual: target, done: false }));

/** 일정 + (켜져 있으면) 추천 프로그램으로 그날의 기본 기록을 만듭니다. */
export function buildDayLog(date: string, plan: DayPlan, state?: AppState): DayLog {
  const testKind = state?.settings.testDays?.[date];
  if (testKind) {
    const tl = buildTestLog(date, testKind, plan);
    return state?.settings.kneeRest ? { ...tl, items: tl.items.filter((i) => !KNEE_LOAD.has(i.exerciseId)) } : tl;
  }
  const auto = state ? state.settings.autoProgram !== false : false;
  const knee = !!state?.settings.kneeRest;
  const items: ItemLog[] = [];
  for (const p of plan.items) {
    if (!getEx(p.exerciseId)) continue;
    if (knee && KNEE_LOAD.has(p.exerciseId)) continue;
    const r = auto && state ? resolveItem(p, state, date) : { sets: p.sets, target: p.target, lv: undefined };
    items.push({
      exerciseId: p.exerciseId, sets: makeSets(r.sets, r.target),
      phase: p.phase, range: p.range, rest: p.rest,
      ...(r.lv !== undefined ? { lv: r.lv } : {}),
      ...(p.optional ? { optional: true } : {}),
    });
  }
  return { date, title: plan.title, items, ...(plan.time ? { time: plan.time } : {}) };
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
    setCheck(date: string, check: ConditionCheck) {
      mutateDay(date, (log) => ({ ...log, check, startedAt: log.startedAt ?? Date.now() }));
    },
    markStarted(date: string) {
      mutateDay(date, (log) => ({ ...log, startedAt: log.startedAt ?? Date.now() }));
    },
    setAfter(date: string, after: AfterNote) {
      mutateDay(date, (log) => ({ ...log, after }));
    },
    setBedtime(date: string, idx: number, v: boolean) {
      mutateDay(date, (log) => { const b = [...(log.bedtime ?? [])]; b[idx] = v; return { ...log, bedtime: b }; });
    },
    /** 제안 수락 · 난도 직접 변경 (오늘 아직 시작 전이면 오늘 목표도 바로 반영) */
    setExState(exId: string, patch: { bump?: number; lv?: number }) {
      setState((s) => {
        const exState = { ...(s.settings.exState ?? {}), [exId]: { ...(s.settings.exState?.[exId] ?? {}), ...patch } };
        const logs = { ...s.logs };
        const t = todayKey();
        const tl = logs[t];
        if (tl) {
          const idx = tl.items.findIndex((i) => i.exerciseId === exId && !i.sets.some((x) => x.done));
          if (idx >= 0) {
            const plan = s.schedule[weekday(t)];
            const p = plan?.items.find((q) => q.exerciseId === exId && (q.phase ?? 'main') === (tl.items[idx].phase ?? 'main'));
            if (p) {
              const r = resolveItem(p, { ...s, settings: { ...s.settings, exState } }, t);
              const items = [...tl.items];
              items[idx] = { ...items[idx], sets: makeSets(r.sets, r.target), lv: r.lv };
              logs[t] = { ...tl, items };
            }
          }
        }
        return { ...s, settings: { ...s.settings, exState }, logs };
      });
    },
    acceptSuggestion(sg: Suggestion) {
      actions.setExState(sg.exId, sg.patch);
    },
    snoozeSuggestion(sg: Suggestion, date: string) {
      setState((s) => ({ ...s, settings: { ...s.settings, snooze: { ...(s.settings.snooze ?? {}), [sg.exId]: date } } }));
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
    resetSchedule(preset: SchedulePreset = 'spec') {
      setState((s) => {
        const logs = { ...s.logs };
        const t = todayKey();
        if (!hasDone(logs[t])) delete logs[t];
        return { ...s, schedule: defaultSchedule(preset), logs };
      });
    },
    updateSettings(patch: Partial<Settings>) {
      setState((s) => {
        const logs = { ...s.logs };
        const t = todayKey();
        // 프로그램 설정이 바뀌면 아직 시작하지 않은 오늘 목표를 다시 계산
        if (['autoProgram', 'startDate', 'kneeRest', 'planStart', 'fullSets'].some((k) => k in patch) && !hasDone(logs[t])) {
          const tl = logs[t];
          if (tl) delete logs[t];
          if (tl?.check) logs[t] = { ...buildDayLog(t, s.schedule[weekday(t)], { ...s, settings: { ...s.settings, ...patch }, logs }), check: tl.check, startedAt: tl.startedAt };
        }
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

export const restFor = (exerciseId: string, settings: Settings, item?: Pick<ItemLog, 'rest'>) => {
  if (item?.rest) return item.rest;
  const ex = getEx(exerciseId);
  if (!ex) return settings.restDefault;
  if (ex.restSec > 0) return ex.restSec;
  return ex.category === 'pull' ? settings.restPull : settings.restDefault;
};
