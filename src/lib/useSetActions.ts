import { useStore, restFor } from './store';
import { getEx } from '../data/exercises';
import { haptic, unlockAudio } from './feedback';
import { TEST_REST_SEC } from '../data/testday';
import { phaseOfItem } from './plan';
import { daySets } from './stats';

/** 세트 체크 · 수정 공통 동작 (진동, 휴식 타이머) */
export function useSetActions(date: string) {
  const store = useStore();
  const { state } = store;
  const log = store.dayLog(date);

  const afterDone = (i: number, j: number) => {
    if (state.settings.haptic) haptic(15);
    const { total, done } = daySets(log);
    if (total - done - 1 <= 0) {
      store.stopTimer();
      if (state.settings.haptic) haptic([40, 60, 40, 60, 120]);
      return;
    }
    const item = log.items[i];
    const ex = getEx(item.exerciseId)!;
    const nextInSame = item.sets.some((s, k) => k !== j && !s.done);
    // 준비운동·스트레칭은 다음 동작으로 바로 넘어가므로 타이머를 켜지 않습니다
    if (phaseOfItem(item) !== 'main' && !item.test) return;
    if (!nextInSame && phaseOfItem(item) === 'main' && !item.test) {
      store.startTimer(Math.min(60, restFor(ex.id, state.settings, item)), '다음 운동까지');
      return;
    }
    store.startTimer(item.test ? TEST_REST_SEC : restFor(ex.id, state.settings, item), item.test ? '다음 테스트까지 충분히 쉬기' : `${ex.name} 다음 세트까지`);
  };

  return {
    log,
    toggle(i: number, j: number) {
      unlockAudio();
      if (!log.startedAt) store.markStarted(date);
      const wasDone = log.items[i].sets[j].done;
      store.toggleSet(date, i, j);
      if (!wasDone) afterDone(i, j);
    },
    record(i: number, j: number, actual: number, rir?: number) {
      unlockAudio();
      if (!log.startedAt) store.markStarted(date);
      const wasDone = log.items[i].sets[j].done;
      store.recordSet(date, i, j, actual, rir);
      if (!wasDone && actual > 0) afterDone(i, j);
    },
  };
}
