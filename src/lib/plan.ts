import type { AppState, Area, DayLog, Exercise, ExState, ItemLog, PlanItem } from '../types';
import { getEx } from '../data/exercises';
import { weekday } from './date';

export const phaseOfItem = (it: { phase?: ItemLog['phase']; exerciseId: string }) =>
  it.phase ?? (getEx(it.exerciseId)?.category === 'warmup' ? 'warmup' : getEx(it.exerciseId)?.category === 'mobility' ? 'cool' : 'main');

const clamp = (v: number, r?: [number, number]) => (r ? Math.min(r[1], Math.max(r[0], v)) : v);

export const exStateOf = (state: AppState, exId: string): ExState => state.settings.exState?.[exId] ?? {};
/** 지금 난도 단계 (단계가 없는 운동이면 undefined) */
export const levelOf = (state: AppState, ex?: Exercise) =>
  ex?.levels ? Math.min(ex.levels.length - 1, exStateOf(state, ex.id).lv ?? ex.startLv ?? 0) : undefined;

/** 일정 항목 → 그날 수행할 목표 */
export function resolveItem(p: PlanItem, state: AppState, _date: string): Pick<ItemLog, 'lv' | 'band' | 'kg'> & { sets: number; target: number } {
  const ex = getEx(p.exerciseId);
  const main = (p.phase ?? 'main') === 'main';
  const lv = main ? levelOf(state, ex) : undefined;
  const st = exStateOf(state, p.exerciseId);
  let target = p.target;
  // 달리기 인터벌은 단계가 목표(달리는 시간)를 정합니다
  if (ex?.interval && lv !== undefined) target = ex.levels![lv].target ?? target;
  return {
    sets: p.sets, target, lv,
    ...(main && ex?.gear === 'band' && st.band ? { band: st.band } : {}),
    ...(main && ex?.gear === 'kg' && st.kg ? { kg: st.kg } : {}),
  };
}

/** 이 운동이 일정에서 쓰는 목표(세트·횟수·범위) */
export function planOf(state: AppState, exId: string): PlanItem | undefined {
  for (const plan of Object.values(state.schedule)) {
    const p = plan.items.find((q) => q.exerciseId === exId && (q.phase ?? 'main') === 'main');
    if (p) return p;
  }
  return undefined;
}

// ── 성장 제안 (자동으로 바꾸지 않고, 확인을 누를 때만 적용) ─────────────
export interface Suggestion {
  exId: string;
  kind: 'calibrate' | 'reps' | 'level';
  title: string;
  detail: string;
  patch: { target?: number; lv?: number; calibrated?: boolean };
}

const painAreas = (log?: DayLog): Area[] => [...(log?.check?.pain ?? []), ...(log?.after?.pain ?? [])];

/** 이 운동이 들어간 본운동 기록 (테스트 제외, 최근 순) */
export function sessionsOf(state: AppState, exId: string, before?: string) {
  return Object.keys(state.logs).sort().reverse()
    .filter((d) => !before || d < before)
    .map((d) => ({ d, log: state.logs[d], item: state.logs[d].items.find((i) => i.exerciseId === exId && !i.test && phaseOfItem(i) === 'main') }))
    .filter((x): x is { d: string; log: DayLog; item: ItemLog } => !!x.item && x.item.sets.some((s) => s.done));
}

/** 같은 난도에서 한 지난 기록 (세트별 비교용) */
export function previousOf(state: AppState, exId: string, before: string, lv?: number) {
  return sessionsOf(state, exId, before).find((x) => lv === undefined || x.item.lv === lv);
}

const hadPain = (ex: Exercise, x: { log: DayLog; item: ItemLog }) =>
  !!x.item.stopped || painAreas(x.log).some((a) => !ex.areas?.length || ex.areas.includes(a));

const unitOf = (ex: Exercise) => (ex.unit === 'reps' ? '회' : ex.unit === 'sec' ? '초' : '분');

export function suggestionFor(state: AppState, exId: string, today: string): Suggestion | null {
  const ex = getEx(exId);
  const p = planOf(state, exId);
  if (!ex || !p) return null;
  const st = exStateOf(state, exId);
  const lv = levelOf(state, ex);
  const target = ex.interval && lv !== undefined ? ex.levels![lv].target ?? p.target : p.target;
  const all = sessionsOf(state, exId).filter((x) => x.d <= today && !x.item.subFor);
  const same = all.filter((x) => lv === undefined || x.item.lv === lv);
  if (!same.length) return null;
  const snooze = state.settings.snooze?.[exId];
  if (snooze && snooze >= same[0].d) return null;
  const u = unitOf(ex);

  // 첫 운동 뒤: 실제로 한 횟수에 목표를 맞춥니다
  if (ex.firstTry && !st.calibrated) {
    const done = same[0].item.sets.filter((s) => s.done);
    const proposed = clamp(Math.min(...done.map((s) => s.actual)), p.range);
    if (done.length && proposed !== target && !(proposed > target && hadPain(ex, same[0]))) {
      return {
        exId, kind: 'calibrate',
        title: `${ex.name} 목표를 ${proposed}${u}로 맞출까요?`,
        detail: `최근 기록에서 세트마다 ${done.map((s) => s.actual).join(' · ')}${u}를 하셨습니다. 적용하면 다음 운동부터 세트당 ${proposed}${u}가 목표입니다. 마지막 1~3${u} 정도 여유가 남는 강도가 기본입니다.`,
        patch: { target: proposed, calibrated: true },
      };
    }
  }

  // 같은 난도에서 2번 연속 모든 세트를 안정적으로 채웠을 때만
  const last = same.slice(0, 2);
  if (last.length < 2) return null;
  const stable = last.every((x) => x.item.sets.length > 0 && x.item.sets.every((s) => s.done && s.actual >= s.target && (s.rir === undefined || s.rir >= 1)));
  if (!stable || last.some((x) => hadPain(ex, x))) return null;

  const max = p.range?.[1];
  if (!ex.interval && max !== undefined && target < max) {
    const surplus = Math.min(...last.flatMap((x) => x.item.sets.map((s) => s.actual - s.target)));
    const next = Math.min(max, target + (surplus >= 3 ? 2 : 1));
    return {
      exId, kind: 'reps',
      title: `${ex.name} 목표를 ${next}${u}로 올릴까요?`,
      detail: `최근 두 번 모든 세트를 목표대로 마쳤고 통증 기록이 없습니다. 적용하면 다음 운동부터 세트당 ${next}${u}입니다.`,
      patch: { target: next },
    };
  }
  if (ex.levels && lv !== undefined && lv < ex.levels.length - 1) {
    const nx = ex.levels[lv + 1];
    const nt = nx.target ?? p.range?.[0] ?? target;
    return {
      exId, kind: 'level',
      title: `${ex.name} 다음 단계: ${nx.name}`,
      detail: ex.interval
        ? `최근 두 번 편하게 마쳤고 무릎 통증 기록이 없습니다. ${nx.how}.`
        : `목표 상한(${target}${u})을 두 번 연속 모든 세트에서 채웠습니다. ${nx.how} 적용하면 목표는 ${nt}${u}부터 다시 시작합니다.`,
      patch: { lv: lv + 1, target: ex.interval ? undefined : nt },
    };
  }
  return null;
}

export function suggestions(state: AppState, today: string): Suggestion[] {
  const ids = new Set<string>();
  for (const plan of Object.values(state.schedule)) for (const p of plan.items) if ((p.phase ?? 'main') === 'main') ids.add(p.exerciseId);
  return [...ids].map((id) => suggestionFor(state, id, today)).filter((x): x is Suggestion => !!x);
}

/** 컨디션 체크로 표시할 경고 */
export const AREA_LABEL: Record<Area, string> = { shoulder: '어깨', back: '허리', knee: '무릎' };
export function warningFor(ex: Exercise | undefined, log: DayLog): string | null {
  if (!ex || !log.check) return null;
  const hit = (ex.areas ?? []).filter((a) => log.check!.pain.includes(a));
  if (!hit.length) return null;
  const names = hit.map((a) => AREA_LABEL[a]).join('·');
  return `오늘 ${names} 통증을 체크하셨습니다. 이 운동은 ${names}에 부담이 갈 수 있습니다. 통증이 생기면 바로 멈추세요.${ex.alt ? ` 대체: ${ex.alt}` : ''}`;
}

export const isPlanWorkoutDay = (state: AppState, date: string) => {
  const plan = state.schedule[weekday(date)];
  return !!plan && plan.items.some((p) => !p.optional);
};
