import type { AppState } from '../types';
import { firstWeek, PROGRAM_WEEKS, stepAt } from '../data/program';
import { diffDays } from './date';

/** 시작일 기준 몇 주차인지 (1부터) */
export const programWeek = (startDate: string, date: string) => Math.max(1, Math.floor(diffDays(date, startDate) / 7) + 1);

export type HoldReason = 'miss' | 'pain' | 'jump';

/**
 * 오늘 적용할 단계를 기록으로 판단합니다.
 *  - 달력상 주차보다 앞서 나가지 않습니다.
 *  - 이전 단계 목표를 모든 세트에서 채운 기록이 있어야 다음 단계로 올라갑니다.
 *  - 이 운동을 한 마지막 날 '통증 있어요'를 골랐다면 그날 단계를 넘지 않습니다.
 */
export function levelFor(state: AppState, exId: string, date: string): { level: number; reason?: HoldReason } {
  const cal = Math.min(PROGRAM_WEEKS, programWeek(state.settings.startDate, date));
  const from = firstWeek(exId);
  let achieved = 0, lastLevel = 0, jumped = false;
  let lastPain = false;
  for (const d of Object.keys(state.logs).filter((k) => k < date).sort()) {
    const log = state.logs[d];
    const item = log.items.find((i) => i.exerciseId === exId && i.level);
    if (!item || !item.level) continue;
    lastLevel = item.level;
    lastPain = log.condition === 'pain';
    const step = stepAt(exId, item.level);
    const full = item.sets.length >= (step?.sets ?? 0) && item.sets.every((s) => s.done && s.actual >= s.target);
    if (full) {
      // 모든 세트에서 목표보다 20% 이상(최소 2회) 더 했다면 한 단계 건너뛰기
      const over = item.sets.every((s) => s.actual >= Math.max(s.target + 2, Math.ceil(s.target * 1.2)));
      const got = over && item.level < PROGRAM_WEEKS ? item.level + 1 : item.level;
      if (got > achieved) { achieved = got; jumped = over; }
    }
  }
  const cap = Math.min(PROGRAM_WEEKS, cal + (jumped ? 1 : 0));
  let level = Math.min(cap, Math.max(achieved + 1, from));
  let reason: HoldReason | undefined;
  if (lastPain && lastLevel && level > lastLevel) { level = lastLevel; reason = 'pain'; }
  else if (jumped && level > cal) reason = 'jump';
  else if (level < cal) reason = 'miss';
  return { level, reason };
}
