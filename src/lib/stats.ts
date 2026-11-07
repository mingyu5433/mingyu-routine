import type { AppState, DayLog, DayPlan, Settings } from '../types';
import { getEx } from '../data/exercises';
import { addDays, diffDays, weekStart, weekday } from './date';
import { restFor } from './store';
import { PLAN_PHASES, phaseIndex, phaseOfItem, planWeek } from './plan';

export const daySets = (log?: DayLog) => {
  const sets = log?.items.flatMap((i) => (i.optional ? i.sets.filter((s) => s.done) : i.sets)) ?? [];
  return { total: sets.length, done: sets.filter((s) => s.done).length };
};

export const completion = (log?: DayLog) => {
  const { total, done } = daySets(log);
  return total === 0 ? 0 : Math.round((done / total) * 100);
};

/** 세트를 하나라도 완료한 날 = 운동한 날 */
export const isWorkoutDay = (log?: DayLog) => daySets(log).done > 0;
export const isRestPlan = (plan?: DayPlan) => !plan || plan.items.every((p) => p.optional);

/** 예상 소요 시간(분) 범위 */
export function estimateMinutes(log: DayLog, settings: Settings): [number, number] {
  let sec = 0;
  for (const item of log.items) {
    const ex = getEx(item.exerciseId);
    if (!ex) continue;
    const main = phaseOfItem(item) === 'main';
    const rest = main ? restFor(item.exerciseId, settings, item) : 10;
    item.sets.forEach((s, idx) => {
      const sides = ex.each || ex.perSide ? 2 : 1;
      const work = ex.unit === 'min' ? s.target * 60 : ex.unit === 'sec' ? s.target * sides : s.target * 3 * sides;
      sec += work + (idx < item.sets.length - 1 ? rest : 30);
    });
  }
  const m = sec / 60;
  if (m === 0) return [0, 0];
  const lo = Math.max(5, Math.floor((m * 0.8) / 5) * 5);
  const hi = Math.max(lo + 5, Math.ceil((m * 1.2) / 5) * 5);
  return [lo, hi];
}

/** 8주 프로그램 진행 단계 */
export function phaseOf(state: AppState, today: string) {
  const week = planWeek(state, today);
  const idx = phaseIndex(Math.max(1, week));
  return { week, idx, phase: PLAN_PHASES[idx], adapting: week <= 2, before: week < 1 };
}

// ── 통계 화면용 ──────────────────────────────────────
export type DayMark = 'full' | 'part' | 'missed' | 'planned' | 'rest' | 'rest-done';
/** 이번 주(월~일) 요일별 상태 */
export function weekStrip(state: AppState, today: string) {
  const ws = weekStart(today);
  return Array.from({ length: 7 }, (_, k) => {
    const d = addDays(ws, k);
    const log = state.logs[d];
    const rest = isRestPlan(state.schedule[weekday(d)]) && !log?.items.some((i) => i.test);
    let mark: DayMark;
    if (rest) mark = isWorkoutDay(log) ? 'rest-done' : 'rest';
    else if (completion(log) === 100) mark = 'full';
    else if (isWorkoutDay(log)) mark = 'part';
    else mark = d < today ? 'missed' : 'planned';
    return { d, mark };
  });
}

/** 최근 n개월 운동한 날 수 */
export function monthlyCounts(state: AppState, today: string, n = 4) {
  const [y, m] = today.split('-').map(Number);
  return Array.from({ length: n }, (_, k) => {
    const mm = m - (n - 1 - k);
    const yy = y + Math.floor((mm - 1) / 12);
    const mo = ((mm - 1) % 12 + 12) % 12 + 1;
    const prefix = `${yy}-${String(mo).padStart(2, '0')}-`;
    const days = Object.keys(state.logs).filter((d) => d.startsWith(prefix) && isWorkoutDay(state.logs[d])).length;
    return { label: `${mo}월`, value: days };
  });
}

/** 최근 n주 주별 합계 */
export function weeklySum(state: AppState, today: string, n: number, f: (log: DayLog) => number) {
  const ws = weekStart(today);
  return Array.from({ length: n }, (_, k) => {
    const start = addDays(ws, -7 * (n - 1 - k));
    let v = 0;
    for (let i = 0; i < 7; i++) { const l = state.logs[addDays(start, i)]; if (l) v += f(l); }
    const [, mo, dd] = start.split('-').map(Number);
    return { label: k === n - 1 ? '이번 주' : `${mo}/${dd}`, value: v };
  });
}
export const cardioMinutes = (log: DayLog) => log.items.filter((i) => getEx(i.exerciseId)?.category === 'cardio').reduce((a, i) => a + i.sets.filter((s) => s.done).reduce((b, s) => b + s.actual, 0), 0);

/** 운동별 세션 최고 기록 추이 (테스트 포함) */
export function bestSeries(state: AppState, exIds: string[], n = 8) {
  return Object.keys(state.logs).sort()
    .map((d) => {
      const its = state.logs[d].items.filter((i) => exIds.includes(i.exerciseId) && (i.test || phaseOfItem(i) === 'main'));
      const best = Math.max(0, ...its.flatMap((i) => i.sets.filter((s) => s.done).map((s) => s.actual)));
      const it = its.find((i) => i.sets.some((s) => s.done && s.actual === best));
      return { d, best, test: !!it?.test, ex: it?.exerciseId, lv: it?.lv, label: it?.label };
    })
    .filter((x) => x.best > 0).slice(-n);
}

/** 통증 기록 (운동 전 체크 · 운동 후 기록) */
export function painLog(state: AppState) {
  return Object.keys(state.logs).sort().reverse().flatMap((d) => {
    const l = state.logs[d];
    const areas = [...new Set([...(l.check?.pain ?? []), ...(l.after?.pain ?? [])])];
    if (!areas.length && l.condition !== 'pain') return [];
    return [{ d, areas, when: l.after?.pain.length ? '운동 중' : '운동 전', memo: l.after?.memo ?? '' }];
  });
}

export function computeStats(state: AppState, today: string) {
  const logs = state.logs;
  const ws = weekStart(today);

  // 이번 주
  let weekDays = 0, weekPlanned = 0;
  for (let k = 0; k < 7; k++) {
    const d = addDays(ws, k);
    if (d > today) break;
    if (isWorkoutDay(logs[d])) weekDays++;
    if (!isRestPlan(state.schedule[weekday(d)])) weekPlanned++;
  }
  const weekRate = weekPlanned === 0 ? 0 : Math.min(100, Math.round((weekDays / weekPlanned) * 100));

  // 연속 기록: 오늘이 아직이면 어제부터, 휴식으로 계획된 날은 건너뜀
  let streak = 0;
  let cursor = isWorkoutDay(logs[today]) ? today : addDays(today, -1);
  const earliest = Object.keys(logs).sort()[0] ?? today;
  while (cursor >= earliest) {
    if (isWorkoutDay(logs[cursor])) streak++;
    else if (!isRestPlan(state.schedule[weekday(cursor)])) break;
    cursor = addDays(cursor, -1);
  }

  // 누적
  let totalSets = 0, totalDays = 0;
  const perEx: Record<string, { total: number; best: number; sets: number }> = {};
  for (const log of Object.values(logs)) {
    if (isWorkoutDay(log)) totalDays++;
    for (const item of log.items) {
      for (const s of item.sets) {
        if (!s.done) continue;
        totalSets++;
        const e = (perEx[item.exerciseId] ??= { total: 0, best: 0, sets: 0 });
        e.total += s.actual;
        e.sets++;
        e.best = Math.max(e.best, s.actual);
      }
    }
  }

  // 최근 4주 추이 (월요일 시작)
  const weeks = [3, 2, 1, 0].map((back) => {
    const start = addDays(ws, -7 * back);
    let sets = 0, days = 0;
    for (let k = 0; k < 7; k++) {
      const l = logs[addDays(start, k)];
      const ds = daySets(l).done;
      sets += ds;
      if (ds > 0) days++;
    }
    return { start, sets, days };
  });

  return { weekDays, weekPlanned, weekRate, streak, totalSets, totalDays, perEx, weeks };
}

// ── 실제 기록 기반 성장 비교 ────────────────────────────
const sumExercise = (state: AppState, from: string, to: string, exId?: string) => {
  let reps = 0, sets = 0;
  for (let d = from; d <= to; d = addDays(d, 1)) {
    for (const item of state.logs[d]?.items ?? []) {
      if (exId && item.exerciseId !== exId) continue;
      for (const s of item.sets) if (s.done) { sets++; reps += s.actual; }
    }
  }
  return { reps, sets };
};

/**
 * 이번 주(월~오늘)와 지난주 같은 기간(월~같은 요일)을 비교합니다.
 * 두 주 모두 기록이 있는 운동만 비교하며, 데이터가 없으면 아무 수치도 만들지 않습니다.
 */
export function weekCompare(state: AppState, today: string) {
  const ws = weekStart(today);
  const span = diffDays(today, ws);
  const prevStart = addDays(ws, -7);
  const prevEnd = addDays(prevStart, span);
  const now = sumExercise(state, ws, today);
  const prev = sumExercise(state, prevStart, prevEnd);
  const items: { exId: string; now: number; prev: number; diff: number }[] = [];
  const ids = new Set<string>();
  for (const d of [ws, prevStart]) for (let k = 0; k <= span; k++)
    state.logs[addDays(d, k)]?.items.forEach((i) => ids.add(i.exerciseId));
  ids.forEach((id) => {
    const a = sumExercise(state, ws, today, id);
    const b = sumExercise(state, prevStart, prevEnd, id);
    if (a.sets > 0 && b.sets > 0) items.push({ exId: id, now: a.reps, prev: b.reps, diff: a.reps - b.reps });
  });
  items.sort((x, y) => y.diff - x.diff);
  return { hasPrev: prev.sets > 0, hasNow: now.sets > 0, setsNow: now.sets, setsPrev: prev.sets, items, span };
}

/** 받침 유무에 따라 조사를 고릅니다 (예: 푸쉬업을 / 스쿼트를) */
const josa = (word: string, withBatchim: string, without: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code <= 11171 && code % 28 !== 0 ? withBatchim : without;
};

export function growthMessage(ex: { name: string }, diff: number, unitLabel: string) {
  const n = ex.name;
  if (diff > 0) return `지난주 같은 기간보다 ${n}${josa(n, '을', '를')} ${diff}${unitLabel} 더 수행했어요.`;
  if (diff === 0) return `${n}${josa(n, '은', '는')} 지난주와 같은 양을 꾸준히 이어 가고 있어요.`;
  return `${n}${josa(n, '은', '는')} 지난주보다 ${-diff}${unitLabel} 적었어요. 회복도 과정의 일부입니다.`;
}

/** 최근 4주 추이: exId가 없으면 완료 세트 수, 있으면 해당 운동의 누적 수행량 */
export function weeklySeries(state: AppState, today: string, exId?: string) {
  const ws = weekStart(today);
  return [3, 2, 1, 0].map((back) => {
    const start = addDays(ws, -7 * back);
    const end = back === 0 ? today : addDays(start, 6);
    const r = sumExercise(state, start, end, exId);
    return { start, value: exId ? r.reps : r.sets };
  });
}

// ── 월간 달력 ───────────────────────────────────────────
const UPPER = new Set(['pushup', 'incline-pushup', 'assisted-hang', 'scap-pullup', 'foot-pullup', 'negative-pullup']);
const LOWER = new Set(['squat', 'hip-bridge']);

/** 그날 실제로 완료한 운동 기준의 종류 라벨 */
export function dayKinds(log?: DayLog): string[] {
  const done = new Set(log?.items.filter((i) => i.sets.some((s) => s.done)).map((i) => i.exerciseId) ?? []);
  const kinds: string[] = [];
  if ([...done].some((id) => UPPER.has(id))) kinds.push('상체');
  if ([...done].some((id) => LOWER.has(id))) kinds.push('하체');
  if (done.has('brisk-walk')) kinds.push('걷기');
  if (kinds.length === 0 && done.size > 0) kinds.push(done.has('deadbug') ? '코어' : done.has('light-stretch') ? '스트레칭' : '준비');
  return kinds;
}

export function monthSummary(state: AppState, y: number, m: number) {
  const prefix = `${y}-${String(m).padStart(2, '0')}-`;
  const days = Object.keys(state.logs).filter((d) => d.startsWith(prefix) && isWorkoutDay(state.logs[d])).sort();
  let sets = 0, walkMin = 0, full = 0;
  for (const d of days) {
    const log = state.logs[d];
    sets += daySets(log).done;
    if (completion(log) === 100) full++;
    for (const i of log.items) if (i.exerciseId === 'brisk-walk') for (const s of i.sets) if (s.done) walkMin += s.actual;
  }
  return { days, sets, walkMin, full };
}
