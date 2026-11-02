import type { DayPlan, PlanItem, Schedule } from '../types';
import { EX_MAP } from './exercises';

const item = (id: string, sets?: number, target?: number): PlanItem => ({
  exerciseId: id,
  sets: sets ?? EX_MAP[id].defaultSets,
  target: target ?? EX_MAP[id].defaultTarget,
});

const upper = (): DayPlan => ({
  title: '상체 운동하는 날',
  items: [
    item('scap-pushup'), item('wall-slide'), item('doorway-stretch'),
    item('pushup'), item('assisted-hang'), item('foot-pullup'), item('deadbug'), item('cooldown'),
  ],
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
const walkDay = (): DayPlan => ({
  title: '가볍게 걷는 날',
  items: [item('brisk-walk'), item('light-stretch')],
});

export function defaultSchedule(): Schedule {
  return {
    0: { title: '푹 쉬는 날', items: [] },
    1: upper(),
    2: lower(true),
    3: walkDay(),
    4: upper(),
    5: lower(false),
    6: walkDay(),
  };
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
