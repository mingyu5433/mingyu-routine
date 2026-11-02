import { ArrowRight, Clock3, Coffee, Flame, PartyPopper, Play, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore, restFor } from '../lib/store';
import { longLabel, addDays, weekday, diffDays } from '../lib/date';
import { completion, computeStats, daySets, estimateMinutes, growthMessage, phaseOf, weekCompare } from '../lib/stats';
import { formatTarget, getEx, unitLabel } from '../data/exercises';
import { QUOTES } from '../data/quotes';
import { WEEKDAYS } from '../data/schedule';
import { ExerciseCard } from '../components/ExerciseCard';
import { Card, Chip, ProgressBar, Segmented, SectionTitle } from '../components/ui';
import { haptic, unlockAudio } from '../lib/feedback';
import type { Condition } from '../types';

const CONDITION_MSG: Record<Condition, string | null> = {
  good: null,
  tired: '피곤한 날에는 세트를 줄이거나 준비운동과 걷기만 해도 충분합니다. 목표 세트는 편하게 줄여 주세요.',
  pain: '통증이 있는 부위의 운동은 쉬어도 괜찮습니다. 통증을 참고 반복하지 말고, 통증이 반복되면 전문가의 평가를 권장합니다.',
};

export function TodayScreen() {
  const store = useStore();
  const { state, today, dayLog } = store;
  const log = dayLog(today);
  const pct = completion(log);
  const { total, done } = daySets(log);
  const [lo, hi] = estimateMinutes(log, state.settings);
  const ph = phaseOf(state.settings.startDate, today);
  const quote = QUOTES[Math.abs(diffDays(today, '2026-01-01')) % QUOTES.length];
  const streak = useMemo(() => computeStats(state, today).streak, [state, today]);
  const growth = useMemo(() => weekCompare(state, today).items.find((x) => x.diff > 0), [state, today]);

  const warmups = log.items.map((it, i) => ({ it, i })).filter(({ it }) => getEx(it.exerciseId)?.category === 'warmup');
  const mains = log.items.map((it, i) => ({ it, i })).filter(({ it }) => getEx(it.exerciseId)?.category !== 'warmup');
  const firstOpen = log.items.findIndex((it) => it.sets.some((s) => !s.done));
  const isRest = log.items.length === 0;
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set([firstOpen]));
  useEffect(() => { setOpenSet(new Set([firstOpen])); }, [today]); // eslint-disable-line react-hooks/exhaustive-deps
  const setOpen = (i: number, v: boolean) => setOpenSet((prev) => {
    const n = new Set(prev);
    if (v) n.add(i); else n.delete(i);
    return n;
  });
  const goTo = (i: number) => {
    if (i < 0) return;
    setOpen(i, true);
    requestAnimationFrame(() => document.getElementById(`ex-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const nextEx = firstOpen >= 0 ? getEx(log.items[firstOpen].exerciseId) : undefined;

  const toggle = (i: number, j: number) => {
    unlockAudio();
    const set = log.items[i].sets[j];
    const willDone = !set.done;
    store.toggleSet(today, i, j);
    if (!willDone) return;
    if (state.settings.haptic) haptic(15);
    const remaining = total - done - 1;
    if (remaining <= 0) {
      store.stopTimer();
      if (state.settings.haptic) haptic([40, 60, 40, 60, 120]);
      return;
    }
    const ex = getEx(log.items[i].exerciseId)!;
    const nextInSame = log.items[i].sets.some((s, k) => k !== j && !s.done);
    if (!nextInSame) {
      // 이 운동을 다 마치면 다음 미완료 운동 카드를 펼쳐 둡니다
      const next = log.items.findIndex((it, k) => k !== i && it.sets.some((s) => !s.done));
      if (next >= 0) setOpenSet((prev) => { const n = new Set(prev); n.delete(i); n.add(next); return n; });
    }
    store.startTimer(restFor(ex.id, state.settings), nextInSame ? `${ex.name} 다음 세트까지` : '다음 운동까지');
  };

  const card = ({ it, i }: { it: typeof log.items[number]; i: number }) => (
    <ExerciseCard key={`${today}-${i}-${it.exerciseId}`} id={`ex-${i}`} item={it} adapting={ph.adapting}
      open={openSet.has(i)} onOpenChange={(v) => setOpen(i, v)}
      onToggle={(j) => toggle(i, j)}
      onUpdate={(j, patch) => store.updateSet(today, i, j, patch)}
      onAdd={() => store.addSet(today, i)}
      onRemove={(j) => store.removeSet(today, i, j)} />
  );

  const tomorrow = addDays(today, 1);
  const tomorrowPlan = state.schedule[weekday(tomorrow)];

  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-[0.3px] text-primary">MINGYU ROUTINE</span>
          <div className="flex items-center gap-1.5">
            {streak > 0 && <Chip><Flame size={12} />{streak}일 연속</Chip>}
            <Chip tone={ph.adapting ? 'primary' : 'soft'}>{ph.phase.name} · {ph.day}일차</Chip>
          </div>
        </div>
        <h1 className="mt-3 text-[28px] font-bold leading-[1.3]">{longLabel(today)}</h1>
        <p className="mt-1 text-[14px] text-muted">{quote}</p>
        {growth && (() => {
          const gx = getEx(growth.exId)!;
          return (
            <p className="mt-3 flex items-start gap-2 rounded-sm bg-primary-tint px-3.5 py-2.5 text-[13px] font-medium leading-[1.5] text-primary">
              <TrendingUp size={15} className="mt-0.5 shrink-0" />{growthMessage(gx, growth.diff, unitLabel(gx))}
            </p>
          );
        })()}
      </header>

      {isRest ? (
        <Card className="mt-6 p-6">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-strong"><Coffee size={22} /></div>
          <h2 className="mt-4 text-[22px] font-medium tracking-[-0.44px]">{log.title || '푹 쉬는 날'}</h2>
          <p className="mt-2 text-[14px] leading-[1.6] text-body">근육은 운동할 때 자극받고 회복할 때 성장합니다. 오늘은 충분히 쉬어 주세요.</p>
          <div className="mt-5 rounded-sm bg-soft p-4">
            <p className="text-[12px] font-semibold text-muted">내일 ({WEEKDAYS[weekday(tomorrow)]})</p>
            <p className="mt-1 text-[15px] font-semibold">{tomorrowPlan.items.length ? tomorrowPlan.title : '휴식'}</p>
          </div>
        </Card>
      ) : (
        <>
          {/* 오늘의 요약 — 시스템에서 유일하게 큰 숫자를 쓰는 지점 */}
          <Card className="mt-6 p-6 shadow-float">
            <p className="text-[22px] font-medium leading-[1.25] tracking-[-0.44px]">오늘은 {log.title}!</p>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-[12px] font-bold text-muted">오늘의 운동 완료율</p>
                <p className="tabular mt-1 text-[64px] font-bold leading-[1.05] tracking-[-1px]">
                  {pct}<span className="ml-0.5 text-[28px] tracking-normal">%</span>
                </p>
              </div>
              <div className="pb-2 text-right text-[14px] text-muted">
                <p className="flex items-center justify-end gap-1"><Clock3 size={14} /> 약 {lo}~{hi}분</p>
                <p className="tabular mt-1">{done} / {total} 세트</p>
              </div>
            </div>
            <div className="mt-4"><ProgressBar value={pct} /></div>
            {nextEx && (
              <button type="button" onClick={() => goTo(firstOpen)}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary text-[16px] font-medium text-on-primary active:bg-primary-active">
                {done === 0 ? <><Play size={16} fill="currentColor" />운동 시작하기</> : <>이어하기 · {nextEx.name}<ArrowRight size={16} /></>}
              </button>
            )}

            <div className="mt-6 border-t border-hairline-soft pt-4">
              <p className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold"><Target size={15} />오늘의 목표</p>
              <ul className="space-y-1.5 text-[14px]">
                {mains.map(({ it }) => {
                  const ex = getEx(it.exerciseId)!;
                  const ok = it.sets.every((s) => s.done);
                  return (
                    <li key={it.exerciseId} className="flex justify-between gap-3">
                      <span className={ok ? 'text-muted line-through' : 'text-body'}>{ex.name}</span>
                      <span className="tabular shrink-0 text-muted">{it.sets.length}세트 × {formatTarget(ex, it.sets[0]?.target ?? 0)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Card>

          {pct === 100 && (
            <div className="animate-rise mt-4 flex items-start gap-3 rounded-md bg-ink p-5 text-canvas">
              <PartyPopper size={22} className="mt-0.5 shrink-0 text-primary" />
              <div>
                <p className="text-[16px] font-semibold">오늘의 운동 완료!</p>
                <p className="mt-1 text-[14px] opacity-80">{total}세트를 모두 마쳤습니다. 기록은 자동으로 저장되었습니다. 이제 충분히 회복해 주세요.</p>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="mb-2 text-[14px] font-medium text-muted">오늘 컨디션은 어떤가요?</p>
            <Segmented<Condition>
              value={log.condition ?? 'good'}
              onChange={(c) => store.setCondition(today, c)}
              options={[{ value: 'good', label: '좋아요' }, { value: 'tired', label: '피곤해요' }, { value: 'pain', label: '통증 있어요' }]}
            />
            {log.condition && CONDITION_MSG[log.condition] && (
              <p className="mt-3 rounded-sm bg-soft p-3.5 text-[14px] leading-[1.55] text-body">{CONDITION_MSG[log.condition]}</p>
            )}
          </div>

          {warmups.length > 0 && (
            <>
              <SectionTitle right={<span className="text-[13px] text-muted">{warmups.length}개</span>}>준비운동</SectionTitle>
              <div className="space-y-3">{warmups.map(card)}</div>
            </>
          )}
          {mains.length > 0 && (
            <>
              <SectionTitle right={<span className="text-[13px] text-muted">{mains.length}개</span>}>본 운동</SectionTitle>
              <div className="space-y-3">{mains.map(card)}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
