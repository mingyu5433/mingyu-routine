import type { DayPlan, Phase, PlanItem, Schedule } from '../types';
import { EX_MAP } from './exercises';

type Opt = { range?: [number, number]; rest?: number; optional?: boolean };
const it = (id: string, phase: Phase, sets?: number, target?: number, o: Opt = {}): PlanItem => ({
  exerciseId: id,
  sets: sets ?? EX_MAP[id].defaultSets,
  target: target ?? EX_MAP[id].defaultTarget,
  phase,
  ...o,
});
const W = (id: string, target?: number, sets = 1) => it(id, 'warmup', sets, target);
const M = (id: string, sets: number, target: number, range?: [number, number], rest?: number) => it(id, 'main', sets, target, { range, rest });
const C = (id: string, target?: number, sets = 1) => it(id, 'cool', sets, target);

// ── 명세서(2026-11-08) 요일별 프로그램 ─────────────────────
const strengthWarm = (order: string[]) => order.map((k) => {
  switch (k) {
    case 'march': return W('march', 60);
    case 'shoulder': return W('shoulder-rolls', 10);
    case 'arm': return W('arm-circles', 10);
    case 'torso': return W('torso-rotation', 10);
    case 'hip': return W('hip-circles', 10);
    case 'squat': return W('squat-light', 8);
    case 'wall': return W('wall-pushup', 8);
    case 'hinge': return W('hip-hinge', 8);
    default: throw new Error(k);
  }
});

const monday = (): DayPlan => ({
  title: '전신 근력 A', time: '35~50분', goal: '가슴, 등, 허벅지, 엉덩이, 코어 강화',
  items: [
    ...strengthWarm(['march', 'shoulder', 'arm', 'torso', 'hip', 'squat', 'wall']),
    M('incline-pushup', 3, 10, [6, 12], 90),
    M('foot-pullup', 3, 4, [3, 6], 120),
    M('squat', 3, 10, [8, 12], 90),
    M('hip-bridge', 2, 12, [12, 15], 60),
    M('deadbug', 2, 8, [8, 8], 60),
    C('doorway-stretch', 30, 2), C('shoulder-stretch', 20), C('hipflexor-standing', 30), C('figure4', 30), C('belly-breath', 1),
  ],
});

const tuesday = (): DayPlan => ({
  title: '유산소 + 코어·골반 조절', time: '25~40분', goal: '심폐지구력, 옆구리·골반 안정성, 골반저근 조절',
  items: [
    W('slow-walk', 2), W('ankle-circles', 10), W('hip-circles', 10), W('knee-march', 30),
    M('brisk-walk', 1, 20, [20, 30]),
    M('side-plank', 2, 15, [15, 30], 60),
    M('pelvic-breath', 1, 3),
    C('calf-stretch', 30), C('hamstring-stretch', 30), C('hipflexor-standing', 30), C('cat-cow', 8), C('belly-breath', 1),
  ],
});

const wednesday = (): DayPlan => ({
  title: '전신 근력 B', time: '35~50분', goal: '등 근육, 고관절 후면, 하체, 코어 안정성',
  items: [
    ...strengthWarm(['march', 'shoulder', 'arm', 'wall', 'hip', 'hinge', 'squat']),
    M('scap-pullup', 3, 6, [5, 8], 90),
    M('incline-pushup', 2, 8, [6, 10], 90),
    M('hip-hinge', 3, 10, [10, 12], 90),
    M('chair-squat', 2, 10, [10, 12], 90),
    M('bird-dog', 2, 8, [8, 8], 60),
    C('doorway-stretch', 30), C('shoulder-stretch', 20), C('hamstring-stretch', 30), C('figure4', 30), C('cat-cow', 10), C('belly-breath', 1),
  ],
});

const thursday = (): DayPlan => ({
  title: '유산소 + 회복·가동성', time: '30~45분', goal: '편안한 유산소와 척추·고관절 가동성',
  items: [
    W('slow-walk', 2), W('ankle-circles', 10), W('hip-circles', 10), W('torso-rotation', 8),
    M('brisk-walk', 1, 25, [25, 35]),
    M('cat-cow', 2, 10, [10, 10], 30),
    M('hip-circles', 2, 8, [8, 8], 30),
    C('calf-stretch', 30), C('hamstring-stretch', 30), C('hipflexor-standing', 30, 2), C('doorway-stretch', 30), C('belly-breath', 1),
  ],
});

const friday = (): DayPlan => ({
  title: '전신 근력 C', time: '35~50분', goal: '전신 근지구력과 반복 동작의 안정성',
  items: [
    ...strengthWarm(['march', 'shoulder', 'arm', 'hip', 'hinge', 'squat', 'wall']),
    M('incline-pushup', 2, 10, [8, 12], 90),
    M('foot-pullup', 3, 4, [3, 6], 120),
    M('squat', 2, 10, [10, 12], 90),
    M('hip-bridge', 2, 12, [12, 15], 60),
    M('hip-hinge', 2, 10, [10, 12], 60),
    M('deadbug', 2, 8, [8, 8], 60),
    C('doorway-stretch', 30), C('shoulder-stretch', 20), C('hipflexor-standing', 30), C('hamstring-stretch', 30), C('figure4', 30), C('belly-breath', 1),
  ],
});

const saturday = (): DayPlan => ({
  title: '심폐지구력 + 하체 보조', time: '35~50분', goal: '심폐지구력, 엉덩이 옆·종아리 보강',
  items: [
    W('slow-walk', 2), W('ankle-circles', 10), W('hip-circles', 10), W('knee-march', 30), W('squat-light', 8),
    M('brisk-walk', 1, 30, [30, 40]),
    M('clamshell', 2, 12, [12, 15], 60),
    M('calf-raise', 2, 12, [12, 15], 60),
    C('calf-stretch', 30, 2), C('hamstring-stretch', 30), C('hipflexor-standing', 30), C('figure4', 30), C('cat-cow', 8), C('belly-breath', 1),
  ],
});

const sunday = (): DayPlan => ({
  title: '휴식 · 선택 스트레칭', time: '0~15분', goal: '피로가 있다면 완전히 휴식, 몸이 편하면 15~20분 산책',
  items: [
    { ...C('doorway-stretch', 30), optional: true },
    { ...C('cat-cow', 10), optional: true },
    { ...C('figure4', 30), optional: true },
    { ...C('belly-breath', 2), optional: true },
  ],
});

/** 매일 자기 전 5분 루틴 (선택) */
export const BEDTIME: PlanItem[] = [C('doorway-stretch', 30), C('neck-stretch', 15), C('cat-cow', 8), C('belly-breath', 1)];

// ── 무릎 회복 중 상체 집중 (11/5) ───────────────────────
const warmUpper = () => [W('scap-pushup'), W('wall-slide'), W('arm-circles')];
const upperA = (): DayPlan => ({
  title: '상체 A · 밀기 데이', time: '30~40분',
  items: [...warmUpper(), M('pushup', 4, 12), M('close-pushup', 3, 8), M('scap-pullup', 3, 6), M('plank', 3, 30), C('doorway-stretch', 30), C('shoulder-stretch', 20), C('belly-breath', 1)],
});
const upperB = (): DayPlan => ({
  title: '상체 B · 당기기 데이', time: '30~40분',
  items: [...warmUpper(), M('negative-pullup', 3, 3), M('foot-pullup', 4, 5), M('dead-hang', 3, 30), M('deadbug', 3, 10), C('doorway-stretch', 30), C('shoulder-stretch', 20), C('belly-breath', 1)],
});
const restDay = (): DayPlan => ({ title: '휴식', items: [] });

export type SchedulePreset = 'spec' | 'upper';
export const PRESET_LABEL: Record<SchedulePreset, string> = { spec: '주 6일 전신 프로그램 (기본)', upper: '상체 집중 (무릎 회복 중)' };

export function defaultSchedule(preset: SchedulePreset = 'spec'): Schedule {
  if (preset === 'upper') return { 0: restDay(), 1: upperA(), 2: restDay(), 3: upperB(), 4: upperA(), 5: restDay(), 6: upperB() };
  return { 0: sunday(), 1: monday(), 2: tuesday(), 3: wednesday(), 4: thursday(), 5: friday(), 6: saturday() };
}

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** 무릎에 부담이 가는 운동 — 무릎 회복 모드에서는 빼고 진행 */
export const KNEE_LOAD = new Set(['squat', 'sit-stand', 'ankle-knee', 'hip-flexor', 'hip-bridge', 'squat-light', 'chair-squat', 'knee-march', 'figure4']);
