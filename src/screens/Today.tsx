import { ArrowRight, Check, ChevronDown, ChevronRight, Clock3, HeartPulse, ListChecks, Play, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { addDays, diffDays, longLabel, parts, weekStart, weekday } from '../lib/date';
import { completion, daySets, isWorkoutDay } from '../lib/stats';
import { AREA_LABEL, phaseOfItem, suggestions, warningFor } from '../lib/plan';
import { getEx } from '../data/exercises';
import { QUOTES } from '../data/quotes';
import { DAY_KIND, WEEKDAYS } from '../data/schedule';
import { ExerciseCard } from '../components/ExerciseCard';
import { ExerciseArt } from '../components/ExerciseArt';
import { ChangePreviewSheet, MotivationSheet } from '../components/Boost';
import { BackupReminder, MonthlyRecap } from '../components/Backup';
import { ConditionSheet, PainSheet, Summary, SuggestionBox, mainProps, summaryRows, targetText } from '../components/Session';
import { Sheet } from '../components/ui';
import { DayDetail } from './Records';
import { useSetActions } from '../lib/useSetActions';
import type { ItemLog } from '../types';

export function TodayScreen({ onStart }: { onStart: () => void }) {
  const store = useStore();
  const { state, today } = store;
  const { log, toggle, record } = useSetActions(today);
  const { total, done } = daySets(log);
  const pct = completion(log);
  const quote = QUOTES[Math.abs(diffDays(today, '2026-01-01')) % QUOTES.length];
  const sugs = useMemo(() => suggestions(state, today), [state, today]);
  const [boost, setBoost] = useState(false);
  const [preview, setPreview] = useState(false);
  const [check, setCheck] = useState(false);
  const [summary, setSummary] = useState(false);
  const [all, setAll] = useState(false);
  const [pain, setPain] = useState<number | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());
  useEffect(() => { setOpenSet(new Set()); }, [today]);
  const setOpen = (i: number, v: boolean) => setOpenSet((prev) => { const n = new Set(prev); if (v) n.add(i); else n.delete(i); return n; });

  const isTestDay = log.items.some((it) => it.test);
  const isRest = log.items.filter((it) => !it.optional).length === 0 && !isTestDay;
  const mains = log.items.map((it, i) => ({ it, i })).filter(({ it }) => phaseOfItem(it) === 'main');
  const firstOpen = log.items.findIndex((it) => !it.optional && !it.stopped && it.sets.some((s) => !s.done));
  const nextEx = firstOpen >= 0 ? getEx(log.items[firstOpen].exerciseId) : undefined;
  const plan = state.schedule[weekday(today)];
  const goal = state.settings.goalDate;
  const goalLeft = diffDays(goal, today);
  const tomorrow = addDays(today, 1);
  const tomorrowPlan = state.schedule[weekday(tomorrow)];
  const finished = !isRest && firstOpen < 0 && done > 0;
  const rows = finished ? summaryRows(state, log) : [];

  const ws = weekStart(today);
  const week = Array.from({ length: 7 }, (_, k) => addDays(ws, k));

  const card = ({ it, i }: { it: ItemLog; i: number }) => {
    const ex = getEx(it.exerciseId);
    return (
      <ExerciseCard key={`${today}-${i}-${it.exerciseId}`} id={`ex-${i}`} item={it}
        open={openSet.has(i)} onOpenChange={(v) => setOpen(i, v)}
        onToggle={(j) => toggle(i, j)} onRecord={(j, a, r) => record(i, j, a, r)}
        onTarget={(j, t) => store.updateSet(today, i, j, it.sets[j].done ? { target: t } : { target: t, actual: t })}
        onAdd={() => store.addSet(today, i)} onRemove={(j) => store.removeSet(today, i, j)}
        warning={warningFor(ex, log)}
        {...mainProps(state, today, it, i, store, setPain)} />
    );
  };

  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold tracking-[0.3px] text-primary">MINGYU ROUTINE</span>
          <button type="button" onClick={() => setBoost(true)}
            className="inline-flex h-8 items-center gap-1 rounded-full bg-primary px-3 text-[12px] font-semibold text-on-primary active:bg-primary-active">
            <Sparkles size={13} /> 동기부여
          </button>
        </div>
        <h1 className="mt-3 text-[28px] font-bold leading-[1.3]">{longLabel(today)}</h1>
        <p className="mt-1 text-[14px] text-muted">{quote}</p>
      </header>

      {/* 오늘의 운동 */}
      <section className="mt-5 rounded-md border border-hairline p-5 shadow-float">
        {isRest ? (
          <>
            <p className="text-[13px] font-semibold text-muted">{WEEKDAYS[weekday(today)]}요일</p>
            <h2 className="mt-1 text-[24px] font-bold leading-[1.3] tracking-[-0.4px]">오늘은 쉬는 날</h2>
            <p className="mt-2 text-[14px] leading-[1.6] text-body">회복도 운동의 일부입니다. 근육은 쉬는 동안 자랍니다.</p>
            <p className="mt-4 border-t border-hairline-soft pt-3 text-[14px] text-muted">
              내일 ({WEEKDAYS[weekday(tomorrow)]}) · <b className="text-ink">{tomorrowPlan?.title ?? '휴식'}</b>{tomorrowPlan?.time ? ` · ${tomorrowPlan.time}` : ''}
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between gap-2">
              <p className="text-[13px] font-semibold text-primary">{isTestDay ? '테스트 데이' : `${log.title}`}</p>
              <span className="flex items-center gap-1 text-[13px] text-muted"><Clock3 size={13} />{plan?.time ?? log.time ?? ''}</span>
            </div>
            <h2 className="mt-1 text-[24px] font-bold leading-[1.3] tracking-[-0.4px]">
              {isTestDay ? log.title : `오늘은 ${DAY_KIND[weekday(today)]} 운동하는 날`}
            </h2>

            <ul className="mt-4 space-y-2">
              {mains.map(({ it, i }) => {
                const ex = getEx(it.exerciseId);
                if (!ex) return null;
                const d = it.sets.filter((s) => s.done).length;
                const complete = it.stopped || d === it.sets.length;
                const lv = it.lv !== undefined ? ex.levels?.[it.lv]?.name : undefined;
                return (
                  <li key={i} className="flex items-center gap-3 rounded-sm bg-soft p-2.5">
                    <span className="grid h-[52px] w-[64px] shrink-0 place-items-center rounded-sm bg-canvas">
                      <ExerciseArt art={it.art ?? ex.art} className="h-[46px] w-[58px]" halo="var(--c-canvas)" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[16px] font-semibold ${complete ? 'text-muted' : ''}`}>{it.label ?? ex.name}</span>
                      <span className="tabular block truncate text-[13px] text-muted">{it.test ? '바른 자세로 가능한 최대 1세트' : targetText(it)}{lv && !ex.interval ? ` · ${lv}` : ex.interval && lv ? ` · ${lv}` : ''}</span>
                    </span>
                    {complete ? (
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-on-primary"><Check size={15} strokeWidth={3} /></span>
                    ) : d > 0 ? <span className="tabular shrink-0 text-[13px] font-semibold text-primary">{d}/{it.sets.length}</span> : null}
                  </li>
                );
              })}
            </ul>

            {finished ? (
              <button type="button" onClick={() => setSummary(true)}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-ink text-[16px] font-semibold text-canvas">
                <Check size={17} strokeWidth={3} />{pct === 100 ? '오늘 운동 완료 · 요약 보기' : '오늘 기록 요약 보기'}
              </button>
            ) : (
              <button type="button" onClick={onStart}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary text-[17px] font-semibold text-on-primary active:bg-primary-active">
                {done === 0 ? <><Play size={17} fill="currentColor" />오늘 운동 시작하기</> : <>이어하기 · {nextEx?.name}<ArrowRight size={17} /></>}
              </button>
            )}
            {done > 0 && !finished && (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-strong" aria-label={`${total}세트 중 ${done}세트 완료`}>
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            )}
            {finished && rows.some((r) => r.better) && (
              <p className="mt-3 text-[13px] font-medium text-primary">{rows.find((r) => r.better)!.name} · {rows.find((r) => r.better)!.better}</p>
            )}
            <button type="button" onClick={() => setCheck(true)} className="mt-3 flex w-full items-center gap-1.5 text-left text-[13px] text-muted">
              <HeartPulse size={14} className="shrink-0" />
              {log.check
                ? `수면 ${log.check.sleep}시간 · 피로도 ${log.check.fatigue}${log.check.sore ? ' · 근육통' : ''} · ${log.check.pain.length ? `${log.check.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}`
                : '컨디션 체크 (선택)'}
            </button>
          </>
        )}
      </section>

      {sugs.length > 0 && !isRest && (
        <div className="mt-3 space-y-2">
          {sugs.slice(0, 2).map((sg) => <SuggestionBox key={sg.exId} sg={sg} date={today} />)}
        </div>
      )}

      {/* 이번 주 */}
      <section className="mt-5">
        <p className="mb-2 text-[15px] font-semibold">이번 주</p>
        <div className="grid grid-cols-7 gap-1">
          {week.map((d) => {
            const wd = weekday(d);
            const l = state.logs[d];
            const did = isWorkoutDay(l);
            const full = did && completion(l) === 100;
            const rest = (state.schedule[wd]?.items.length ?? 0) === 0;
            const isToday = d === today;
            return (
              <button key={d} type="button" onClick={() => (isToday ? undefined : setPick(d))} aria-current={isToday ? 'date' : undefined}
                aria-label={`${parts(d).m}월 ${parts(d).d}일 ${DAY_KIND[wd]}${did ? ' 운동함' : ''}`}
                className={`flex flex-col items-center gap-1 rounded-sm py-2 ${isToday ? 'bg-ink text-canvas' : ''}`}>
                <span className={`text-[11px] ${isToday ? 'opacity-80' : 'text-muted'}`}>{WEEKDAYS[wd]}</span>
                <span className={`tabular grid h-8 w-8 place-items-center rounded-full text-[13px] font-semibold
                  ${full ? 'bg-primary text-on-primary' : did ? 'bg-primary-tint text-primary' : ''}`}>{parts(d).d}</span>
                <span className={`text-[10px] font-semibold ${isToday ? '' : rest ? 'text-muted-soft' : 'text-body'}`}>{DAY_KIND[wd]}</span>
              </button>
            );
          })}
        </div>
      </section>

      <MonthlyRecap />
      <BackupReminder />

      {!isRest && (
        <>
          <button type="button" onClick={() => setAll((v) => !v)} aria-expanded={all}
            className="mt-5 flex w-full items-center justify-between rounded-md border border-hairline px-4 py-3.5 text-left">
            <span className="flex items-center gap-2 text-[15px] font-semibold"><ListChecks size={17} />전체 순서 보기 · 직접 체크</span>
            <ChevronDown size={17} className={`text-muted transition-transform ${all ? 'rotate-180' : ''}`} />
          </button>
          {all && (['warmup', 'main', 'cool'] as const).map((p) => {
            const list = log.items.map((it, i) => ({ it, i })).filter(({ it }) => phaseOfItem(it) === p);
            if (!list.length) return null;
            return (
              <div key={p}>
                <p className="mb-2 mt-5 text-[14px] font-semibold text-muted">{p === 'warmup' ? '운동 전 준비운동' : p === 'main' ? (isTestDay ? '테스트' : '본운동') : '운동 후 스트레칭'}</p>
                <div className="space-y-3">{list.map(card)}</div>
              </div>
            );
          })}
        </>
      )}

      {goalLeft > 0 && (
        <button type="button" onClick={() => setPreview(true)} className="mt-6 flex w-full items-center justify-between rounded-md bg-soft px-4 py-3 text-left text-[13px] text-muted">
          <span>{parts(goal).m}월 {parts(goal).d}일까지 <b className="tabular text-ink">{goalLeft}일</b> · 변화 미리 보기</span>
          <ChevronRight size={15} />
        </button>
      )}

      <MotivationSheet open={boost} onClose={() => setBoost(false)} />
      <ChangePreviewSheet open={preview} onClose={() => setPreview(false)} />
      <ConditionSheet open={check} onClose={() => setCheck(false)} />
      <PainSheet date={today} index={pain} onClose={() => setPain(null)} />
      <Sheet open={summary} onClose={() => setSummary(false)} title="오늘 운동">
        {summary && <Summary date={today} onDone={() => setSummary(false)} />}
      </Sheet>
      <DayDetail date={pick} onClose={() => setPick(null)} />
    </div>
  );
}
