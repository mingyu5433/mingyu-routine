import { ArrowRight, ChevronRight, Clock3, Coffee, Flag, Flame, HeartPulse, Moon, PartyPopper, Play, Sparkles, Target, TrendingUp } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { addDays, diffDays, longLabel, parts, weekday } from '../lib/date';
import { completion, computeStats, daySets, estimateMinutes, growthMessage, phaseOf, weekCompare, weekStrip } from '../lib/stats';
import { AREA_LABEL, fullSetsDue, phaseOfItem, PLAN_WEEKS, suggestions, warningFor } from '../lib/plan';
import { getEx, unitLabel } from '../data/exercises';
import { QUOTES } from '../data/quotes';
import { WEEKDAYS } from '../data/schedule';
import { ExerciseCard } from '../components/ExerciseCard';
import { ChangePreviewSheet, MotivationSheet } from '../components/Boost';
import { BackupReminder, MonthlyRecap } from '../components/Backup';
import { AfterSheet, BedtimeSheet } from '../components/Session';
import { Card, Chip, SectionTitle } from '../components/ui';
import { useSetActions } from '../lib/useSetActions';
import type { ItemLog } from '../types';

const DAY_LETTERS = ['월', '화', '수', '목', '금', '토', '일'];

function Ring({ pct }: { pct: number }) {
  const R = 26, C = 2 * Math.PI * R;
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16 shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="32" cy="32" r={R} fill="none" stroke="var(--c-surface-strong)" strokeWidth="7" />
      <circle cx="32" cy="32" r={R} fill="none" stroke="var(--c-primary)" strokeWidth="7" strokeLinecap="round"
        strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} style={{ transition: 'stroke-dashoffset .5s' }} />
    </svg>
  );
}

export function TodayScreen({ onStart }: { onStart: () => void }) {
  const store = useStore();
  const { state, today } = store;
  const { log, toggle, record } = useSetActions(today);
  const pct = completion(log);
  const { total, done } = daySets(log);
  const [lo, hi] = estimateMinutes(log, state.settings);
  const quote = QUOTES[Math.abs(diffDays(today, '2026-01-01')) % QUOTES.length];
  const st = useMemo(() => computeStats(state, today), [state, today]);
  const strip = useMemo(() => weekStrip(state, today), [state, today]);
  const growth = useMemo(() => weekCompare(state, today).items.find((x) => x.diff > 0), [state, today]);
  const sugs = useMemo(() => suggestions(state, today), [state, today]);
  const ph = phaseOf(state, today);
  const [boost, setBoost] = useState(false);
  const [preview, setPreview] = useState(false);
  const [bed, setBed] = useState(false);
  const [after, setAfter] = useState(false);
  const [showPhase, setShowPhase] = useState(false);

  const goal = state.settings.goalDate;
  const goalLeft = diffDays(goal, today);
  const g = parts(goal);

  const groups = (['warmup', 'main', 'cool'] as const).map((p) => ({ p, list: log.items.map((it, i) => ({ it, i })).filter(({ it }) => phaseOfItem(it) === p) }));
  const isTestDay = log.items.some((it) => it.test);
  const required = log.items.filter((it) => !it.optional);
  const isRest = required.length === 0 && !isTestDay;
  const firstOpen = log.items.findIndex((it) => it.sets.some((s) => !s.done) && !it.optional);
  const [openSet, setOpenSet] = useState<Set<number>>(() => new Set());
  useEffect(() => { setOpenSet(new Set()); }, [today]);
  const setOpen = (i: number, v: boolean) => setOpenSet((prev) => { const n = new Set(prev); if (v) n.add(i); else n.delete(i); return n; });
  const nextEx = firstOpen >= 0 ? getEx(log.items[firstOpen].exerciseId) : undefined;
  const plan = state.schedule[weekday(today)];
  const tired = log.check && (log.check.fatigue >= 4 || log.check.sleep < 6);
  const weekPlanned = strip.filter((x) => !x.mark.startsWith('rest')).length;
  const weekDone = strip.filter((x) => x.mark === 'full' || x.mark === 'part').length;

  const card = ({ it, i }: { it: ItemLog; i: number }) => {
    const ex = getEx(it.exerciseId);
    const sg = phaseOfItem(it) === 'main' ? sugs.find((s) => s.exId === it.exerciseId) : undefined;
    return (
      <ExerciseCard key={`${today}-${i}-${it.exerciseId}`} id={`ex-${i}`} item={it}
        open={openSet.has(i)} onOpenChange={(v) => setOpen(i, v)}
        onToggle={(j) => toggle(i, j)} onRecord={(j, a) => record(i, j, a)}
        onTarget={(j, t) => store.updateSet(today, i, j, it.sets[j].done ? { target: t } : { target: t, actual: t })}
        onAdd={() => store.addSet(today, i)} onRemove={(j) => store.removeSet(today, i, j)}
        warning={warningFor(ex, log)} suggestion={sg}
        onAccept={() => sg && store.acceptSuggestion(sg)} onSnooze={() => sg && store.snoozeSuggestion(sg, today)} />
    );
  };

  const tomorrow = addDays(today, 1);
  const tomorrowPlan = state.schedule[weekday(tomorrow)];

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
        {growth && (() => {
          const gx = getEx(growth.exId)!;
          return (
            <p className="mt-3 flex items-start gap-2 rounded-sm bg-primary-tint px-3.5 py-2.5 text-[13px] font-medium leading-[1.5] text-primary">
              <TrendingUp size={15} className="mt-0.5 shrink-0" />{growthMessage(gx, growth.diff, unitLabel(gx))}
            </p>
          );
        })()}
      </header>

      {/* 오늘의 운동 */}
      <Card className="mt-5 p-5 shadow-float">
        <div className="flex items-center justify-between gap-2">
          <Chip tone={isRest ? 'soft' : 'primary'}>{WEEKDAYS[weekday(today)]}요일 · {isTestDay ? '테스트' : isRest ? '휴식' : '운동'}</Chip>
          <span className="flex items-center gap-1 text-[13px] text-muted"><Clock3 size={13} />예상 {plan?.time ?? log.time ?? `${lo}~${hi}분`}</span>
        </div>
        <h2 className="mt-3 text-[22px] font-semibold leading-[1.3] tracking-[-0.44px]">{log.title}</h2>
        {plan?.goal && !isTestDay && <p className="mt-1 text-[14px] leading-[1.5] text-body">{plan.goal}</p>}

        {!isRest && (
          <div className="mt-4 flex items-center gap-4 rounded-sm bg-soft p-3.5">
            <div className="relative">
              <Ring pct={pct} />
              <span className="tabular absolute inset-0 grid place-items-center text-[14px] font-bold">{pct}%</span>
            </div>
            <div className="min-w-0 text-[14px] leading-[1.55] text-body">
              <p><b className="tabular text-ink">{total}세트 중 {done}세트</b>를 마쳤습니다.</p>
              <p className="text-muted">준비운동 {groups[0].list.length} · 본운동 {groups[1].list.length} · 스트레칭 {groups[2].list.length}</p>
            </div>
          </div>
        )}

        {log.check ? (
          <p className="mt-3 flex items-start gap-2 text-[13px] leading-[1.5] text-muted">
            <HeartPulse size={14} className="mt-0.5 shrink-0" />
            수면 {log.check.sleep}시간 · 피로도 {log.check.fatigue}{log.check.sore ? ' · 근육통' : ''} · {log.check.pain.length ? `${log.check.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}
          </p>
        ) : null}
        {tired && <p className="mt-2 rounded-sm bg-soft p-3 text-[13px] leading-[1.55] text-body">피곤한 날입니다. 근력운동은 1세트씩 줄이거나(각 운동의 '직접 조정'), 준비운동과 걷기만 해도 충분합니다.</p>}

        {isRest ? (
          <p className="mt-3 text-[14px] leading-[1.6] text-body">근력운동은 쉬는 날입니다. 피로가 있다면 완전히 쉬고, 몸이 편하면 15~20분 산책하거나 아래 선택 스트레칭을 해 보세요. 연속 기록은 끊기지 않습니다.</p>
        ) : nextEx ? (
          <button type="button" onClick={onStart}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-primary text-[17px] font-semibold text-on-primary active:bg-primary-active">
            {done === 0 ? <><Play size={17} fill="currentColor" />운동 시작</> : <>이어하기 · {nextEx.name}<ArrowRight size={17} /></>}
          </button>
        ) : (
          <button type="button" onClick={() => setAfter(true)}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-ink text-[16px] font-semibold text-canvas">
            <Flag size={16} />{log.after ? `기록 완료 · 체감 난도 ${log.after.rpe} · ${log.after.minutes}분 (수정)` : '운동 끝 · 기록 남기기'}
          </button>
        )}
      </Card>

      {pct === 100 && !isRest && (
        <div className="animate-rise mt-4 flex items-start gap-3 rounded-md bg-ink p-5 text-canvas">
          <PartyPopper size={22} className="mt-0.5 shrink-0 text-primary" />
          <div>
            <p className="text-[16px] font-semibold">오늘의 운동 완료!</p>
            <p className="mt-1 text-[14px] opacity-80">{total}세트를 모두 마쳤습니다. {goalLeft > 0 ? `${g.m}월 ${g.d}일까지 ${goalLeft}일, 오늘도 한 칸 가까워졌습니다.` : '이제 충분히 회복해 주세요.'}</p>
          </div>
        </div>
      )}

      {/* 이번 주 */}
      <section className="mt-5 rounded-md border border-hairline p-4">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-semibold">이번 주 <span className="tabular font-normal text-muted">계획 {weekPlanned}일 중 {weekDone}일 운동</span></p>
          {st.streak > 0 && <span className="flex items-center gap-1 text-[13px] font-semibold text-primary"><Flame size={14} />{st.streak}일 연속</span>}
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center">
          {strip.map(({ d, mark }, k) => {
            const isToday = d === today;
            const cls = mark === 'full' ? 'bg-primary text-on-primary' : mark === 'part' ? 'bg-primary-tint text-primary' : mark === 'rest' || mark === 'rest-done' ? 'bg-soft text-muted-soft' : mark === 'missed' ? 'border border-hairline text-muted-soft' : 'border border-hairline text-ink';
            return (
              <div key={d} className="flex flex-col items-center gap-1">
                <span className={`text-[11px] ${isToday ? 'font-bold text-ink' : 'text-muted'}`}>{DAY_LETTERS[k]}</span>
                <span className={`tabular grid h-9 w-9 place-items-center rounded-full text-[13px] font-semibold ${cls} ${isToday ? 'ring-2 ring-ink ring-offset-2 ring-offset-canvas' : ''}`}>
                  {mark === 'rest' || mark === 'rest-done' ? '휴' : parts(d).d}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8주 프로그램 · 목표일 */}
      <button type="button" onClick={() => setShowPhase((v) => !v)} className="mt-3 block w-full rounded-md bg-ink p-4 text-left text-canvas">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-semibold">
            {ph.before ? '8주 프로그램 시작 전' : `8주 프로그램 ${Math.min(ph.week, PLAN_WEEKS)}주차`} · {ph.phase.name}
          </p>
          <span className="tabular text-[13px] opacity-80">{goalLeft > 0 ? `${g.m}/${g.d}까지 D-${goalLeft}` : ''}</span>
        </div>
        <div className="mt-3 flex gap-1">
          {Array.from({ length: PLAN_WEEKS }, (_, k) => (
            <span key={k} className={`h-1.5 flex-1 rounded-full ${k < ph.week ? 'bg-primary' : 'bg-white/20'}`} />
          ))}
        </div>
        {showPhase ? (
          <ul className="mt-3 space-y-1 text-[13px] leading-[1.5] opacity-90">
            {ph.phase.goals.map((x) => <li key={x}>· {x}</li>)}
          </ul>
        ) : <p className="mt-2 text-[13px] opacity-70">눌러서 이번 단계 목표 보기</p>}
      </button>
      <button type="button" onClick={() => setPreview(true)} className="mt-2 flex w-full items-center justify-end gap-0.5 text-[13px] font-medium text-muted">
        한 달 · 크리스마스 · 세 달 뒤 변화 보기 <ChevronRight size={14} />
      </button>

      {fullSetsDue(state, today) && (
        <div className="mt-3 rounded-md border border-primary p-4">
          <p className="flex items-center gap-1.5 text-[15px] font-semibold"><Target size={15} className="text-primary" />적응 단계가 끝났습니다</p>
          <p className="mt-1 text-[13px] leading-[1.55] text-body">최근 일주일 통증 기록이 없습니다. 회복 상태가 좋다면 근력운동을 목표 세트(3세트)로 늘릴까요?</p>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={() => store.updateSettings({ fullSets: true })} className="h-10 rounded-sm bg-primary px-4 text-[14px] font-semibold text-on-primary">목표 세트로 늘리기</button>
            <span className="self-center text-[12px] text-muted">아직이면 그대로 두셔도 됩니다</span>
          </div>
        </div>
      )}

      {sugs.length > 0 && (
        <section className="mt-3 rounded-md border border-hairline p-4">
          <p className="flex items-center gap-1.5 text-[15px] font-semibold"><Sparkles size={15} className="text-primary" />다음 단계 제안 {sugs.length}개</p>
          <ul className="mt-2 divide-y divide-hairline-soft">
            {sugs.map((sg) => (
              <li key={sg.exId} className="py-2.5">
                <p className="text-[14px] font-semibold">{sg.title}</p>
                <p className="mt-0.5 text-[12px] leading-[1.5] text-muted">{sg.detail}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => store.acceptSuggestion(sg)} className="h-9 rounded-sm bg-primary px-3.5 text-[13px] font-semibold text-on-primary">적용하기</button>
                  <button type="button" onClick={() => store.snoozeSuggestion(sg, today)} className="h-9 rounded-sm px-3 text-[13px] font-medium text-muted">나중에</button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MonthlyRecap />
      <BackupReminder />

      {isTestDay && (
        <div className="mt-5 rounded-sm bg-soft px-3.5 py-3 text-[13px] leading-[1.6] text-body">
          <p className="font-semibold text-ink">테스트 데이 하는 방법</p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>준비운동을 평소대로 합니다.</li>
            <li>테스트는 항목마다 <b className="text-ink">한 번씩만</b>, 사이에 2~3분 쉽니다.</li>
            <li>짜내지 말고 <b className="text-ink">바른 자세로 가능한 마지막 횟수</b>에서 멈춥니다. 통증이 있거나 자세가 무너지면 즉시 종료합니다.</li>
            <li>끝나면 <b className="text-ink">기록</b> 버튼으로 숫자를 적고, 스트레칭으로 끝냅니다.</li>
          </ol>
        </div>
      )}

      {groups.map(({ p, list }) => list.length > 0 && (
        <div key={p}>
          <SectionTitle right={<span className="text-[13px] text-muted">{list.length}개</span>}>
            {p === 'warmup' ? '운동 전 준비운동' : p === 'main' ? (isTestDay ? '테스트' : isRest ? '선택 스트레칭' : '본운동') : isRest ? '선택 스트레칭' : '운동 후 스트레칭'}
          </SectionTitle>
          <div className="space-y-3">{list.map(card)}</div>
        </div>
      ))}

      {isRest && (
        <Card className="mt-4 p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-muted"><Coffee size={14} />내일 ({WEEKDAYS[weekday(tomorrow)]})</p>
          <p className="mt-1 text-[15px] font-semibold">{tomorrowPlan?.title ?? '휴식'}{tomorrowPlan?.time ? <span className="font-normal text-muted"> · {tomorrowPlan.time}</span> : null}</p>
        </Card>
      )}

      <button type="button" onClick={() => setBed(true)} className="mt-6 flex w-full items-center gap-3 rounded-md border border-hairline p-4 text-left">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-strong"><Moon size={18} /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">자기 전 5분 루틴</span>
          <span className="block text-[13px] text-muted">가슴 · 목 · 고양이-소 · 복식호흡 {log.bedtime?.filter(Boolean).length ? `· ${log.bedtime.filter(Boolean).length}/4 완료` : '(선택)'}</span>
        </span>
        <ChevronRight size={16} className="text-muted" />
      </button>

      <MotivationSheet open={boost} onClose={() => setBoost(false)} />
      <ChangePreviewSheet open={preview} onClose={() => setPreview(false)} />
      <BedtimeSheet open={bed} onClose={() => setBed(false)} />
      <AfterSheet open={after} onClose={() => setAfter(false)} />
    </div>
  );
}

