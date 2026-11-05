import type { DayPlan, PlanItem, Schedule } from '../types';
import { EX_MAP } from './exercises';

const item = (id: string, sets?: number, target?: number, optional?: boolean): PlanItem => ({
  exerciseId: id,
  sets: sets ?? EX_MAP[id].defaultSets,
  target: target ?? EX_MAP[id].defaultTarget,
  ...(optional ? { optional: true } : {}),
});

const warmUpper = () => [item('scap-pushup'), item('wall-slide'), item('arm-circles')];

/** 상체 A — 밀기 중심 (가슴 · 삼두 · 코어) */
const upperA = (): DayPlan => ({
  title: '상체 A · 밀기 데이',
  items: [...warmUpper(), item('pushup'), item('close-pushup'), item('scap-pullup'), item('plank'), item('cooldown')],
});
/** 상체 B — 당기기 중심 (등 · 이두 · 악력 · 코어) */
const upperB = (): DayPlan => ({
  title: '상체 B · 당기기 데이',
  items: [...warmUpper(), item('negative-pullup'), item('foot-pullup'), item('dead-hang'), item('deadbug'), item('cooldown')],
});
const lower = (walk: boolean): DayPlan => ({
  title: walk ? '하체 운동 + 걷는 날' : '하체 운동하는 날',
  items: [
    item('ankle-knee'), item('hip-flexor'), item('sit-stand'),
    item('squat'), item('hip-bridge'),
    ...(walk ? [item('brisk-walk')] : []),
    item('cooldown'),
  ],
});
const walkDay = (optional = false): DayPlan => ({
  title: optional ? '회복 · 가볍게 걷기 (무릎 괜찮을 때만)' : '가볍게 걷는 날',
  items: [item('brisk-walk', undefined, undefined, optional), item('light-stretch', undefined, undefined, optional)],
});

export type SchedulePreset = 'upper' | 'full';
export const PRESET_LABEL: Record<SchedulePreset, string> = { upper: '상체 집중 (무릎 회복 중)', full: '전신 (상체 + 하체)' };

/**
 * upper: 무릎 회복 중 — 상체 A(월·목) / B(수·토), 화·금은 선택 걷기
 * full : 무릎 회복 후 — 상체 A(월) · 하체(화) · 상체 B(수) · 상체 A(목) · 하체(금) · 상체 B(토)
 */
export function defaultSchedule(preset: SchedulePreset = 'upper'): Schedule {
  if (preset === 'full') {
    return {
      0: { title: '푹 쉬는 날', items: [] },
      1: upperA(), 2: lower(true), 3: upperB(), 4: upperA(), 5: lower(false), 6: upperB(),
    };
  }
  return {
    0: { title: '푹 쉬는 날', items: [] },
    1: upperA(), 2: walkDay(true), 3: upperB(), 4: upperA(), 5: walkDay(true), 6: upperB(),
  };
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** 무릎에 부담이 가는 운동 — 무릎 회복 모드에서는 빼고 진행 */
export const KNEE_LOAD = new Set(['squat', 'sit-stand', 'ankle-knee', 'hip-flexor', 'hip-bridge']);
