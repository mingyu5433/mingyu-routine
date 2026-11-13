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

// ── 요청서(2026-11-13): 본운동 4가지 + 토요일 달리기 ─────────
const upper = (title: string): DayPlan => ({
  title, time: '35~45분', goal: '타이슨 푸쉬업 + 밴드 보조 풀업',
  items: [
    W('shoulder-rolls', 10), W('arm-circles', 10), W('arm-open-close', 15), W('wall-scap-pushup', 10), W('wall-pushup', 10),
    M('tyson-pushup', 3, 5, [4, 10], 120),
    M('band-pullup', 4, 5, [3, 8], 150),
    C('doorway-stretch', 30), C('shoulder-stretch', 30), C('neck-stretch', 20), C('cat-cow', 10), C('belly-breath', 1),
  ],
});

const lower = (title: string): DayPlan => ({
  title, time: '35~45분', goal: '맨몸 스쿼트 + 힙 브리지',
  items: [
    W('march', 60), W('hip-circles', 10), W('leg-swing', 10), W('ankle-mobility', 10), W('squat-light', 10),
    M('squat', 4, 12, [12, 20], 105),
    M('hip-bridge', 3, 12, [12, 20], 75),
    C('hipflexor-standing', 30), C('hamstring-stretch', 30), C('calf-stretch', 30), C('figure4', 30), C('belly-breath', 1),
  ],
});

const run = (): DayPlan => ({
  title: '달리기', time: '30~40분', goal: '대화가 되는 속도로 가볍게',
  items: [
    W('slow-walk', 4), W('ankle-circles', 10), W('leg-swing', 10),
    M('run-interval', 1, 6),
    C('slow-walk', 3), C('calf-stretch', 30), C('hamstring-stretch', 30), C('hipflexor-standing', 30),
  ],
});

const restDay = (): DayPlan => ({ title: '휴식', items: [] });

export function defaultSchedule(): Schedule {
  return { 0: restDay(), 1: upper('상체 A'), 2: lower('하체 A'), 3: restDay(), 4: upper('상체 B'), 5: lower('하체 B'), 6: run() };
}

/** 요일 짧은 이름 (주간 현황용) */
export const DAY_KIND: Record<number, string> = { 0: '휴식', 1: '상체', 2: '하체', 3: '휴식', 4: '상체', 5: '하체', 6: '달리기' };

export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

