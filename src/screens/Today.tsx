import { ArrowRight, ChevronRight, Clock3, Coffee, Flame, Flag, PartyPopper, Play, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore, restFor } from '../lib/store';
import { longLabel, addDays, weekday, diffDays, parts } from '../lib/date';
import { completion, computeStats, daySets, estimateMinutes, growthMessage, weekCompare } from '../lib/stats';
import { programWeek } from '../lib/progress';
import { formatTarget, getEx, unitLabel } from '../data/exercises';
import { QUOTES } from '../data/quotes';
import { WEEK_FOCUS, PROGRAM_WEEKS, variantName } from '../data/program';
import { WEEKDAYS } from '../data/schedule';
import { ExerciseCard } from '../components/ExerciseCard';
import { ChangePreviewSheet, MotivationSheet } from '../components/Boost';
import { BackupReminder, MonthlyRecap } from '../components/Backup';
import { Card, Chip, ProgressBar, Segmented, SectionTitle } from '../components/ui';
import { haptic, unlockAudio } from '../lib/feedback';
import { TEST_REST_SEC } from '../data/testday';
import type { Condition } from '../types';

const CONDITION_MSG: Record<Condition, string | null> = {
  good: null,
  tired: '피곤한 날에는 세트를 줄이거나 준비운동과 걷기만 해도 충분합니다. 각 운동의 "직접 조정"에서 세트를 줄여 주세요.',
  pain: '통증이 있는 부위의 운동은 쉬어도 괜찮습니다. 오늘 통증을 기록하면 다음 운동일에 단계를 올리지 않습니다. 통증이 반복되거나 일상에서도 아프다면 물리치료사나 정형외과 평가를 권장합니다.',
};

export function TodayScreen() {
  const store = useStore();
  const { state, today, dayLog } = store;
  const log = dayLog(today);
  const pct = completion(log);
  const { total, done } = daySets(log);
  const [lo, hi] = estimateMinutes(log, state.settings);
  const quote = QUOTES[Math.abs(diffDays(today, '2026-01-01')) % QUOTES.length];
  const streak = useMemo(() => computeStats(state, today).streak, [state, today]);
  const growth = useMemo(() => weekCompare(state, today).items.find((x) => x.diff > 0), [state, today]);
  const [boost, setBoost] = useState(false);
  const [preview, setPreview] = useState(false);

  // 목표일 카운트다운
  const goal = state.settings.goalDate;
  const week = programWeek(state.settings.startDate, today);
  const totalDays = Math.max(1, diffDays(goal, state.settings.startDate) + 1);
  const goalLeft = diffDays(goal, today);
  const goalPct = Math.min(100, Math.max(0, Math.round(((diffDays(today, state.settings.startDate) + 1) / totalDays) * 100)));
  const goalWeeks = Math.ceil(totalDays / 7);
  const g = parts(goal);

  const warmups = log.items.map((it, i) => ({ it, i })).filter(({ it }) => getEx(it.exerciseId)?.category === 'warmup');
  const mains = log.items.map((it, i) => ({ it, i })).filter(({ it }) => !['warmup', 'mobility'].includes(getEx(it.exerciseId)?.category ?? ''));
  const cools = log.items.map((it, i) => ({ it, i })).filter(({ it }) => getEx(it.exerciseId)?.category === 'mobility');
  const isTestDay = log.items.some((it) => it.test);
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

  /** 세트가 새로 완료되었을 때: 진동, 휴식 타이머, 다음 운동 펼치기 */
  const afterDone = (i: number, j: number) => {
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
      const next = log.items.findIndex((it, k) => k !== i && it.sets.some((s) => !s.done));
      if (next >= 0) setOpenSet((prev) => { const n = new Set(prev); n.delete(i); n.add(next); return n; });
    }
    const isTestItem = !!log.items[i].test;
    store.startTimer(isTestItem ? TEST_REST_SEC : restFor(ex.id, state.settings), isTestItem ? '다음 테스트까지 충분히 쉬기' : nextInSame ? `${ex.name} 다음 세트까지` : '다음 운동까지');
  };

  const toggle = (i: number, j: number) => {
    unlockAudio();
    const wasDone = log.items[i].sets[j].done;
    store.toggleSet(today, i, j);
    if (!wasDone) afterDone(i, j);
  };
  const record = (i: number, j: number, actual: number) => {
    unlockAudio();
    const wasDone = log.items[i].sets[j].done;
    store.recordSet(today, i, j, actual);
    if (!wasDone && actual > 0) afterDone(i, j);
  };

  const card = ({ it, i }: { it: typeof log.items[number]; i: number }) => (
    <ExerciseCard key={`${today}-${i}-${it.exerciseId}`} id={`ex-${i}`} item={it}
      open={openSet.has(i)} onOpenChange={(v) => setOpen(i, v)}
      onToggle={(j) => toggle(i, j)}
      onRecord={(j, a) => record(i, j, a)}
      onTarget={(j, t) => store.updateSet(today, i, j, it.sets[j].done ? { target: t } : { target: t, actual: t })}
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
            <button type="button" onClick={() => setBoost(true)}
              className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-semibold text-on-primary active:bg-primary-active">
              <Sparkles size={13} /> 동기부여
            </button>
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

      {/* 목표일 카운트다운 */}
      <button type="button" onClick={() => setPreview(true)} className="mt-5 block w-full rounded-md bg-ink p-4 text-left text-canvas">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold opacity-80"><Flag size={13} />{g.m}월 {g.d}일까지</p>
          <p className="tabular text-[13px] font-semibold opacity-80">{Math.min(week, PROGRAM_WEEKS)}주차 / {goalWeeks}주</p>
        </div>
        <p className="tabular mt-1 text-[28px] font-bold leading-tight">
          {goalLeft > 0 ? <>D-{goalLeft}</> : goalLeft === 0 ? '오늘이 목표일' : '목표일 완주'}
        </p>
        <p className="mt-1 text-[14px] opacity-85">{WEEK_FOCUS[Math.min(week, PROGRAM_WEEKS) - 1]}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-primary" style={{ width: `${goalPct}%` }} />
        </div>
        <p className="mt-3 flex items-center justify-end gap-0.5 text-[13px] font-medium opacity-80">한 달 · 크리스마스 · 세 달 뒤 변화 보기 <ChevronRight size={14} /></p>
      </button>

      <MonthlyRecap />
      <BackupReminder />

      {isRest ? (
        <Card className="mt-4 p-6">
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
          <Card className="mt-4 p-6 shadow-float">
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
                {done === 0 ? <><Play size={16} fill="currentColor" />운동 시작하기</> : <>이어하기 · {variantName(nextEx.name, nextEx.id, log.items[firstOpen].level)}<ArrowRight size={16} /></>}
              </button>
            )}

            <div className="mt-6 border-t border-hairline-soft pt-4">
              <p className="mb-2 text-[14px] font-semibold">{isTestDay ? '오늘 잴 것 (각 1번씩)' : state.settings.autoProgram ? '오늘 해야 할 것 (추천)' : '오늘의 목표'}</p>
              <ul className="space-y-1.5 text-[14px]">
                {mains.map(({ it }) => {
                  const ex = getEx(it.exerciseId)!;
                  const ok = it.sets.every((s) => s.done);
                  return (
                    <li key={`${it.exerciseId}-${it.label ?? ''}`} className="flex justify-between gap-3">
                      <span className={ok ? 'text-muted line-through' : 'text-body'}>{it.label ?? variantName(ex.name, ex.id, it.level)}</span>
                      <span className="tabular shrink-0 text-muted">{it.test ? (ok ? formatTarget(ex, it.sets[0].actual) : '최대') : `${it.sets.length}세트 × ${formatTarget(ex, it.sets[0]?.target ?? 0)}`}</span>
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
                <p className="mt-1 text-[14px] opacity-80">{total}세트를 모두 마쳤습니다. 기록은 자동으로 저장되었습니다. {goalLeft > 0 ? `${g.m}월 ${g.d}일까지 ${goalLeft}일, 오늘도 한 칸 가까워졌습니다.` : '이제 충분히 회복해 주세요.'}</p>
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

          {isTestDay ? (
            <div className="mt-6 rounded-sm bg-soft px-3.5 py-3 text-[13px] leading-[1.6] text-body">
              <p className="font-semibold text-ink">테스트 데이 하는 방법</p>
              <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                <li>준비운동을 평소대로 합니다.</li>
                <li>테스트는 항목마다 <b className="text-ink">한 번씩만</b>, 사이에 2~3분 쉽니다.</li>
                <li>짜내지 말고 <b className="text-ink">바른 자세로 가능한 마지막 횟수</b>에서 멈춥니다. 어깨가 불편하면 바로 중단합니다.</li>
                <li>끝나면 <b className="text-ink">기록</b> 버튼으로 숫자를 적고, 마무리 스트레칭으로 끝냅니다.</li>
              </ol>
            </div>
          ) : (
            <p className="mt-6 rounded-sm bg-soft px-3.5 py-3 text-[13px] leading-[1.55] text-body">
              <b className="text-ink">하는 방법</b> · 세트를 끝내면 동그라미를 누르세요. 목표보다 덜 했거나 더 했다면 옆의 <b className="text-ink">수정</b>을 눌러 실제 횟수를 적으면 됩니다.
            </p>
          )}

          {warmups.length > 0 && (
            <>
              <SectionTitle right={<span className="text-[13px] text-muted">{warmups.length}개</span>}>준비운동</SectionTitle>
              <div className="space-y-3">{warmups.map(card)}</div>
            </>
          )}
          {mains.length > 0 && (
            <>
              <SectionTitle right={<span className="text-[13px] text-muted">{mains.length}개</span>}>{isTestDay ? '테스트' : '본 운동'}</SectionTitle>
              <div className="space-y-3">{mains.map(card)}</div>
            </>
          )}
          {cools.length > 0 && (
            <>
              <SectionTitle right={<span className="text-[13px] text-muted">약 {cools.reduce((a, { it }) => a + (getEx(it.exerciseId)?.unit === 'min' ? it.sets[0]?.target ?? 0 : 0), 0)}분</span>}>마무리 스트레칭</SectionTitle>
              <div className="space-y-3">{cools.map(card)}</div>
            </>
          )}
        </>
      )}

      <MotivationSheet open={boost} onClose={() => setBoost(false)} />
      <ChangePreviewSheet open={preview} onClose={() => setPreview(false)} />
    </div>
  );
}
