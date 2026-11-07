import type { AppState, Area, DayLog, Exercise, ItemLog, PlanItem } from '../types';
import { getEx } from '../data/exercises';
import { diffDays, weekday } from './date';

export const PLAN_WEEKS = 8;

/** 명세서 Ⅺ. 운동 발전 계획 — 8주 */
export const PLAN_PHASES = [
  { weeks: [1, 2], name: '적응 단계', range: '1~2주차', goals: ['각 근력운동 1~2세트부터 시작', '자세와 통증 여부 확인', '실패 지점까지 운동하지 않기', '유산소는 20분 전후로 시작', '철봉에서는 안전한 발 지지와 어깨 조절 연습'] },
  { weeks: [3, 4], name: '기초 근력 단계', range: '3~4주차', goals: ['회복이 충분하다면 목표 세트로 증가', '목표 반복 횟수에 점진적으로 접근', '걷기 25~35분으로 증가', '푸쉬업 지지대 높이와 풀업 보조 정도 기록'] },
  { weeks: [5, 6], name: '점진적 강화', range: '5~6주차', goals: ['푸쉬업 12회가 안정적이면 지지대 높이를 조금 낮추기', '발 보조 풀업이 안정되면 보조량 줄이기', '스쿼트가 쉬워지면 천천히 내려가는 동작으로 난도 조절', '유산소 시간 점진적으로 늘리기'] },
  { weeks: [7, 8], name: '수행 능력 점검', range: '7~8주차', goals: ['푸쉬업 최대 정확 반복 횟수 확인', '안전한 환경에서 풀업 수행 능력 확인', '스쿼트 자세와 반복 횟수 확인', '걷기 시간 및 체감 난도 확인', '통증이 있거나 자세가 무너지면 테스트 즉시 종료'] },
];

export const planWeek = (state: AppState, date: string) => {
  const start = state.settings.planStart;
  if (!start) return 1;
  return Math.floor(diffDays(date, start) / 7) + 1; // 시작 전이면 0 이하
};
export const phaseIndex = (week: number) => (week <= 2 ? 0 : week <= 4 ? 1 : week <= 6 ? 2 : 3);

const isStrength = (ex?: Exercise) => !!ex && (ex.category === 'strength' || ex.category === 'pull') && ex.unit !== 'min';
export const phaseOfItem = (it: { phase?: ItemLog['phase']; exerciseId: string }) =>
  it.phase ?? (getEx(it.exerciseId)?.category === 'warmup' ? 'warmup' : getEx(it.exerciseId)?.category === 'mobility' ? 'cool' : 'main');

const clamp = (v: number, r?: [number, number]) => (r ? Math.min(r[1], Math.max(r[0], v)) : v);

/** 일정 항목 → 오늘 수행할 목표 (수락한 진행 상태 + 8주 단계 반영) */
export function resolveItem(p: PlanItem, state: AppState, date: string): Pick<ItemLog, 'lv'> & { sets: number; target: number } {
  const ex = getEx(p.exerciseId);
  const st = state.settings.exState?.[p.exerciseId] ?? {};
  const week = planWeek(state, date);
  let sets = p.sets;
  let target = p.target;
  if ((p.phase ?? 'main') === 'main') {
    target = clamp(p.target + (st.bump ?? 0), p.range);
    // 1~2주차 적응 단계, 그리고 목표 세트로 늘리기에 동의하기 전까지는 근력운동 최대 2세트
    if (isStrength(ex) && (week <= 2 || !state.settings.fullSets)) sets = Math.min(sets, 2);
    // 1~2주차 유산소는 20분 전후로 시작
    if (ex?.unit === 'min' && ex.category === 'cardio' && week <= 2) target = Math.min(target, 20);
  }
  return { sets, target, lv: ex?.levels ? st.lv ?? 0 : undefined };
}

// ── 다음 단계 제안 (자동 변경하지 않고 사용자 확인 후 적용) ─────────────
export interface Suggestion {
  exId: string;
  kind: 'reps' | 'level';
  title: string;
  detail: string;
  patch: { bump?: number; lv?: number };
}

const painAreas = (log?: DayLog): Area[] => [...(log?.check?.pain ?? []), ...(log?.after?.pain ?? [])];

/** 이 운동이 들어간 최근 본운동 기록 (테스트 제외) */
export function sessionsOf(state: AppState, exId: string, before?: string) {
  return Object.keys(state.logs).sort().reverse()
    .filter((d) => !before || d < before)
    .map((d) => ({ d, log: state.logs[d], item: state.logs[d].items.find((i) => i.exerciseId === exId && !i.test && phaseOfItem(i) === 'main') }))
    .filter((x): x is { d: string; log: DayLog; item: ItemLog } => !!x.item && x.item.sets.some((s) => s.done));
}

export function suggestions(state: AppState, today: string): Suggestion[] {
  const out: Suggestion[] = [];
  const seen = new Set<string>();
  for (const plan of Object.values(state.schedule)) {
    for (const p of plan.items) {
      if ((p.phase ?? 'main') !== 'main' || seen.has(p.exerciseId)) continue;
      seen.add(p.exerciseId);
      const ex = getEx(p.exerciseId);
      if (!ex) continue;
      const last = sessionsOf(state, ex.id).filter((x) => x.d <= today).slice(0, 2);
      if (last.length < 2) continue;
      const allHit = last.every((x) => x.item.sets.every((s) => s.done && s.actual >= s.target));
      if (!allHit) continue;
      // 통증이 기록된 운동은 난도 증가를 제안하지 않음
      if (ex.areas?.length && last.some((x) => painAreas(x.log).some((a) => ex.areas!.includes(a)))) continue;
      if (last.some((x) => x.log.after?.pain.length && !ex.areas?.length)) continue;
      const snooze = state.settings.snooze?.[ex.id];
      if (snooze && snooze >= last[0].d) continue;

      const st = state.settings.exState?.[ex.id] ?? {};
      const bump = st.bump ?? 0;
      // 이 운동이 들어간 모든 요일 중 범위 최대치까지 남은 여유
      const room = Math.max(0, ...Object.values(state.schedule).flatMap((pl) => pl.items.filter((q) => q.exerciseId === ex.id && (q.phase ?? 'main') === 'main' && q.range).map((q) => q.range![1] - q.target)));
      const surplus = Math.min(...last.flatMap((x) => x.item.sets.map((s) => s.actual - s.target)));
      const step = ex.unit === 'reps' ? (surplus >= 3 ? 2 : 1) : 5;
      const u = ex.unit === 'reps' ? '회' : ex.unit === 'sec' ? '초' : '분';
      if (bump < room) {
        const nb = Math.min(room, bump + step);
        out.push({ exId: ex.id, kind: 'reps', title: `${ex.name} 목표를 ${nb - bump}${u} 늘릴까요?`, detail: `최근 2번 모두 목표를 채웠고 통증 기록이 없습니다. 적용하면 다음 운동부터 세트당 ${nb - bump}${u}씩 늘어납니다.`, patch: { bump: nb } });
      } else if (ex.levels && (st.lv ?? 0) < ex.levels.length - 1) {
        const next = ex.levels[(st.lv ?? 0) + 1];
        out.push({ exId: ex.id, kind: 'level', title: `${ex.name} 다음 단계: ${next.name}`, detail: `목표 범위 최대치를 2번 연속 채웠습니다. ${next.how} 적용하면 목표 횟수는 범위의 시작 값으로 돌아갑니다.`, patch: { lv: (st.lv ?? 0) + 1, bump: 0 } });
      }
    }
  }
  return out;
}

/** 적응 단계가 끝나 목표 세트로 늘릴 시점인지 */
export function fullSetsDue(state: AppState, today: string) {
  if (state.settings.fullSets) return false;
  if (planWeek(state, today) < 3) return false;
  const recentPain = Object.keys(state.logs).filter((d) => diffDays(today, d) <= 7 && d <= today).some((d) => painAreas(state.logs[d]).length > 0);
  return !recentPain;
}

/** 컨디션 체크로 표시할 경고 */
export const AREA_LABEL: Record<Area, string> = { shoulder: '어깨', back: '허리', knee: '무릎' };
export function warningFor(ex: Exercise | undefined, log: DayLog): string | null {
  if (!ex || !log.check) return null;
  const hit = (ex.areas ?? []).filter((a) => log.check!.pain.includes(a));
  if (!hit.length) return null;
  const names = hit.map((a) => AREA_LABEL[a]).join('·');
  return `오늘 ${names} 통증을 체크하셨습니다. 이 운동은 ${names}에 부담이 갈 수 있습니다. 통증이 생기면 바로 멈추세요.${ex.alt ? ` 대체 운동: ${ex.alt}` : ' 오늘은 건너뛰어도 괜찮습니다.'}`;
}

export const isPlanWorkoutDay = (state: AppState, date: string) => {
  const plan = state.schedule[weekday(date)];
  return !!plan && plan.items.some((p) => !p.optional);
};
