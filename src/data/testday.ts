import type { ArtKey, DayLog, DayPlan, ItemLog } from '../types';

/** 테스트 항목: 최대 횟수(초)를 1세트로 기록. 추천 프로그램 단계에는 반영되지 않습니다. */
interface TestDef { exerciseId: string; label: string; art?: ArtKey; optional?: boolean }

const UPPER_TESTS: TestDef[] = [
  { exerciseId: 'pushup', label: '일반 푸쉬업 최대' },
  { exerciseId: 'dead-hang', label: '매달리기 최대 (발 떼고, 초)' },
  { exerciseId: 'scap-pullup', label: '견갑 풀업 최대 (발 떼고)' },
  { exerciseId: 'deadbug', label: '데드버그 최대 (좌우 각)' },
];
const LOWER_TESTS: TestDef[] = [
  { exerciseId: 'squat', label: '스쿼트 최대' },
  { exerciseId: 'hip-bridge', label: '힙 브리지 최대' },
];

export type TestKind = 'upper' | 'full';
export const TEST_TITLE: Record<TestKind, string> = { upper: '상체 테스트 데이', full: '재테스트 데이' };
export const TEST_REST_SEC = 150;

const warm = (id: string, sets: number, target: number): ItemLog => ({
  exerciseId: id, sets: Array.from({ length: sets }, () => ({ target, actual: target, done: false })),
});
const test = (t: TestDef): ItemLog => ({
  exerciseId: t.exerciseId, label: t.label, art: t.art, optional: t.optional, test: true,
  sets: [{ target: 0, actual: 0, done: false }],
});

export function buildTestLog(date: string, kind: TestKind, _plan?: DayPlan): DayLog {
  const items: ItemLog[] = [warm('scap-pushup', 2, 10), warm('wall-slide', 1, 8), warm('arm-circles', 1, 10)];
  if (kind === 'full') items.push(warm('sit-stand', 1, 10));
  items.push(...UPPER_TESTS.map(test));
  if (kind === 'full') items.push(...LOWER_TESTS.map(test));
  items.push(warm('cooldown', 1, 5));
  return { date, title: TEST_TITLE[kind], items };
}
