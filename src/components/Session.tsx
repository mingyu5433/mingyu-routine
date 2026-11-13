import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, Flag, HeartPulse, Sparkles, TrendingUp, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Area, ConditionCheck, DayLog, ItemLog } from '../types';
import { useStore } from '../lib/store';
import { formatTarget, getEx, unitLabel } from '../data/exercises';
import { AREA_LABEL, phaseOfItem, previousOf, sessionsOf, suggestions, warningFor, type Suggestion } from '../lib/plan';
import { daySets } from '../lib/stats';
import { useSetActions } from '../lib/useSetActions';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { FigureDemo, FigureStill } from '../figure/Figure';
import { PrimaryButton, Sheet, Stepper, Toggle } from './ui';

const AREAS: Area[] = ['shoulder', 'back', 'knee'];
const PHASE_LABEL = { warmup: '준비운동', main: '본운동', cool: '스트레칭' } as const;
const PHASE_ORDER = { warmup: 0, main: 1, cool: 2 } as const;

/** 운동 전 컨디션 체크 (선택) */
export function ConditionSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { today, dayLog, setCheck } = useStore();
  const prev = dayLog(today).check;
  const [sleep, setSleep] = useState(prev?.sleep ?? 7);
  const [fatigue, setFatigue] = useState(prev?.fatigue ?? 2);
  const [sore, setSore] = useState(prev?.sore ?? false);
  const [pain, setPain] = useState<Area[]>(prev?.pain ?? []);
  const toggle = (a: Area) => setPain((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]));
  const save = () => {
    const check: ConditionCheck = { sleep, fatigue, sore, pain, at: Date.now() };
    setCheck(today, check);
    onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="컨디션 체크 (선택)">
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium">어젯밤 수면 시간</p>
          <Stepper value={sleep} min={0} max={14} suffix="시간" onChange={setSleep} />
        </div>
        <div>
          <p className="text-[15px] font-medium">피로도 <span className="text-[13px] text-muted">1 개운함 ~ 5 매우 피곤</span></p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setFatigue(n)} aria-pressed={fatigue === n}
                className={`tabular h-12 rounded-sm text-[16px] font-semibold ${fatigue === n ? 'bg-ink text-canvas' : 'border border-hairline'}`}>{n}</button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium">근육통이 있나요?</p>
          <Toggle label="근육통" checked={sore} onChange={setSore} />
        </div>
        <div>
          <p className="text-[15px] font-medium">지금 아픈 관절</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {AREAS.map((a) => (
              <button key={a} type="button" onClick={() => toggle(a)} aria-pressed={pain.includes(a)}
                className={`h-12 rounded-sm text-[15px] font-semibold ${pain.includes(a) ? 'bg-error text-on-primary' : 'border border-hairline'}`}>{AREA_LABEL[a]}</button>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-muted">체크한 부위에 부담이 가는 운동에 경고를 띄우고, 그 운동의 난도 올리기 제안을 멈춥니다.</p>
        </div>
        <PrimaryButton className="w-full" onClick={save}>저장</PrimaryButton>
        <p className="text-center text-[11px] leading-[1.5] text-muted-soft">이 앱은 의학적 진단을 제공하지 않습니다. 통증이 계속되거나 심해지면 전문가에게 확인받아 주세요.</p>
      </div>
    </Sheet>
  );
}

/** 운동 중 통증: 중단하거나 대체 동작으로 바꾸기 */
export function PainSheet({ date, index, onClose }: { date: string; index: number | null; onClose: () => void }) {
  const store = useStore();
  const it = index !== null ? store.dayLog(date).items[index] : undefined;
  const ex = it ? getEx(it.exerciseId) : undefined;
  const [areas, setAreas] = useState<Area[]>([]);
  useEffect(() => { setAreas(ex?.areas?.slice(0, 1) ?? []); }, [index]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!it || !ex || index === null) return <Sheet open={false} onClose={onClose} title="">{null}</Sheet>;
  const subs = (ex.subs ?? []).map((id) => getEx(id)).filter((x) => !!x);
  return (
    <Sheet open onClose={onClose} title={`${ex.name} · 통증`}>
      <p className="text-[14px] leading-[1.6] text-body">근육이 힘든 것과 관절이 아픈 것은 다릅니다. 관절이 찌릿하거나 날카롭게 아프면 참고 하지 마세요.</p>
      <p className="mt-4 text-[14px] font-medium">어디가 아픈가요?</p>
      <div className="mt-2 grid grid-cols-3 gap-1.5">
        {AREAS.map((a) => (
          <button key={a} type="button" onClick={() => setAreas((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))} aria-pressed={areas.includes(a)}
            className={`h-11 rounded-sm text-[14px] font-semibold ${areas.includes(a) ? 'bg-error text-on-primary' : 'border border-hairline'}`}>{AREA_LABEL[a]}</button>
        ))}
      </div>
      <div className="mt-5 space-y-2">
        {subs.map((s) => (
          <button key={s.id} type="button" onClick={() => { store.substitute(date, index, s.id, areas); onClose(); }}
            className="flex w-full items-center gap-3 rounded-sm border border-hairline p-2.5 text-left">
            <span className="grid h-[52px] w-[66px] shrink-0 place-items-center rounded-sm bg-soft"><FigureStill art={s.art} className="h-[46px] w-[60px]" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold">{s.name}(으)로 바꾸기</span>
              <span className="block text-[12px] text-muted">남은 세트를 이 동작으로 · 통증 없는 범위에서만</span>
            </span>
          </button>
        ))}
        <button type="button" onClick={() => { store.stopItem(date, index, areas); onClose(); }}
          className="flex h-12 w-full items-center justify-center gap-1.5 rounded-sm bg-ink text-[15px] font-semibold text-canvas">
          <AlertTriangle size={15} /> 이 운동은 오늘 여기까지
        </button>
        <button type="button" onClick={onClose} className="h-11 w-full text-[14px] font-medium text-muted">괜찮아요, 계속할게요</button>
      </div>
      <p className="mt-2 text-[12px] leading-[1.5] text-muted">통증을 기록한 운동은 난도 올리기를 제안하지 않습니다.</p>
    </Sheet>
  );
}

/** 오늘 운동 요약 + 선택 기록 (시간 · 체감 난도 · 통증 · 메모) */
export function Summary({ date, onDone }: { date: string; onDone: () => void }) {
  const store = useStore();
  const { state } = store;
  const log = store.dayLog(date);
  const auto = log.startedAt ? Math.max(1, Math.round((Date.now() - log.startedAt) / 60000)) : 40;
  const [minutes, setMinutes] = useState(log.after?.minutes || auto);
  const [more, setMore] = useState(!!log.after?.memo || !!log.after?.rpe);
  const [rpe, setRpe] = useState(log.after?.rpe ?? 0);
  const [pain, setPain] = useState<Area[]>(log.after?.pain ?? []);
  const [memo, setMemo] = useState(log.after?.memo ?? '');
  const { total, done } = daySets(log);
  const rows = summaryRows(state, log);
  const sugs = useMemo(() => suggestions(state, date).filter((s) => log.items.some((i) => i.exerciseId === s.exId)), [state, date, log]);
  const allDone = total > 0 && done === total;

  return (
    <div>
      <p className="text-[24px] font-bold leading-[1.3]">{allDone ? '오늘 운동 완료!' : '오늘 운동 기록'}</p>
      <p className="mt-1 text-[14px] text-muted">{log.title} · {done}/{total} 세트</p>

      <ul className="mt-5 divide-y divide-hairline-soft rounded-md border border-hairline">
        {rows.map((r) => (
          <li key={r.key} className="px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">{r.name}</p>
              <p className="tabular text-[15px] font-semibold">{r.value}</p>
            </div>
            <p className="tabular mt-0.5 text-[12px] text-muted">{r.detail}</p>
            {r.better && <p className="mt-1 flex items-center gap-1 text-[13px] font-semibold text-primary"><TrendingUp size={13} />{r.better}</p>}
          </li>
        ))}
        <li className="flex items-center justify-between px-4 py-3">
          <p className="text-[15px] font-semibold">운동 시간</p>
          <Stepper size="sm" value={minutes} min={1} max={240} suffix="분" onChange={setMinutes} />
        </li>
      </ul>

      {sugs.length > 0 && (
        <div className="mt-4 space-y-2">
          {sugs.map((sg) => <SuggestionBox key={sg.exId} sg={sg} date={date} />)}
        </div>
      )}

      <button type="button" onClick={() => setMore((v) => !v)} aria-expanded={more}
        className="mt-4 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-3 text-[14px] font-medium">
        체감 난도 · 통증 · 메모 남기기 (선택)
        <ChevronDown size={16} className={`transition-transform ${more ? 'rotate-180' : ''}`} />
      </button>
      {more && (
        <div className="space-y-5 px-1 pt-4">
          <div>
            <p className="text-[14px] font-medium">체감 난도 <span className="text-[12px] text-muted">1 매우 쉬움 ~ 10 한계</span></p>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
                <button key={n} type="button" onClick={() => setRpe(rpe === n ? 0 : n)} aria-pressed={rpe === n}
                  className={`tabular h-10 rounded-sm text-[14px] font-semibold ${rpe === n ? 'bg-ink text-canvas' : 'border border-hairline'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[14px] font-medium">관절 통증이 있었나요?</p>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <button type="button" onClick={() => setPain([])} aria-pressed={pain.length === 0}
                className={`h-10 rounded-sm text-[14px] font-semibold ${pain.length === 0 ? 'bg-ink text-canvas' : 'border border-hairline'}`}>없음</button>
              {AREAS.map((a) => (
                <button key={a} type="button" onClick={() => setPain((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))} aria-pressed={pain.includes(a)}
                  className={`h-10 rounded-sm text-[14px] font-semibold ${pain.includes(a) ? 'bg-error text-on-primary' : 'border border-hairline'}`}>{AREA_LABEL[a]}</button>
              ))}
            </div>
          </div>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} maxLength={300} aria-label="메모"
            placeholder="예: 타이슨 푸쉬업 마지막 세트에서 어깨 앞쪽이 살짝 당김"
            className="w-full resize-none rounded-sm border border-hairline bg-canvas px-3.5 py-3 text-[15px] leading-[1.5] outline-none focus:border-2 focus:border-ink" />
        </div>
      )}
      <PrimaryButton className="mt-5 w-full" onClick={() => { store.setAfter(date, { minutes, rpe, pain, memo: memo.trim() }); onDone(); }}>
        저장하고 마치기
      </PrimaryButton>
    </div>
  );
}

export function SuggestionBox({ sg, date }: { sg: Suggestion; date: string }) {
  const store = useStore();
  return (
    <div className="rounded-sm bg-primary-tint px-3.5 py-3 text-[13px] leading-[1.5]">
      <p className="flex items-center gap-1.5 text-[14px] font-semibold text-primary"><Sparkles size={14} />{sg.title}</p>
      <p className="mt-0.5 text-body">{sg.detail}</p>
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={() => store.applySuggestion(sg)} className="h-9 rounded-sm bg-primary px-3.5 text-[13px] font-semibold text-on-primary">적용하기</button>
        <button type="button" onClick={() => store.snoozeSuggestion(sg, date)} className="h-9 rounded-sm px-3 text-[13px] font-medium text-muted">지금은 그대로</button>
      </div>
    </div>
  );
}

/** 본운동 요약 줄 */
export function summaryRows(state: ReturnType<typeof useStore>['state'], log: DayLog) {
  return log.items.filter((it) => phaseOfItem(it) === 'main' && !it.test && it.sets.some((s) => s.done)).map((it, k) => {
    const ex = getEx(it.exerciseId)!;
    const u = unitLabel(ex);
    const done = it.sets.filter((s) => s.done);
    const sum = done.reduce((a, s) => a + s.actual, 0);
    const lv = it.lv !== undefined ? ex.levels?.[it.lv]?.name : undefined;
    const prev = it.subFor ? undefined : previousOf(state, it.exerciseId, log.date, it.lv);
    const prevSum = prev ? prev.item.sets.filter((s) => s.done).reduce((a, s) => a + s.actual, 0) : 0;
    const extra = [lv, it.band ? `밴드 ${it.band}` : '', it.kg ? `+${it.kg}kg` : '', it.subFor ? `${getEx(it.subFor)?.name} 대신` : '', it.stopped ? '통증으로 중단' : ''].filter(Boolean).join(' · ');
    return {
      key: `${it.exerciseId}-${k}`,
      name: ex.name,
      value: ex.unit === 'min' ? `${sum}분` : `총 ${sum}${u}`,
      detail: `${done.map((s) => s.actual).join(' · ')}${u}${extra ? ` · ${extra}` : ''}`,
      better: prev && sum > prevSum && (!it.kg || (prev.item.kg ?? 0) <= it.kg) ? `지난번(${prevSum}${u})보다 ${sum - prevSum}${u} 더 했습니다` : '',
    };
  });
}

/** 운동 진행 화면: 한 동작씩 넘기며 진행 */
export function Player({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { today, state } = store;
  const { log, toggle, record } = useSetActions(today);
  const order = useMemo(() => log.items.map((it, i) => ({ it, i }))
    .sort((a, b) => PHASE_ORDER[phaseOfItem(a.it)] - PHASE_ORDER[phaseOfItem(b.it)] || a.i - b.i), [log]);
  const firstOpen = Math.max(0, order.findIndex(({ it }) => !it.stopped && it.sets.some((s) => !s.done)));
  const [pos, setPos] = useState(firstOpen);
  const [summary, setSummary] = useState(false);
  const [check, setCheck] = useState(false);
  const [pain, setPain] = useState<number | null>(null);
  const [list, setList] = useState(false);

  useEffect(() => { if (open) { setPos(firstOpen); setSummary(false); store.markStarted(today); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const cur = order[Math.min(pos, order.length - 1)];
  const curDone = cur ? cur.it.stopped || cur.it.sets.every((s) => s.done) : false;
  // 준비운동·스트레칭은 완료하면 다음 동작으로 넘어갑니다
  useEffect(() => {
    if (!open || !cur || !curDone || phaseOfItem(cur.it) === 'main') return;
    if (pos >= order.length - 1) return;
    const id = setTimeout(() => setPos((p) => Math.min(order.length - 1, p + 1)), 700);
    return () => clearTimeout(id);
  }, [curDone, pos, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.getElementById('player-scroll')?.scrollTo({ top: 0 }); }, [pos, summary]);

  if (!open || !cur) return null;
  const ex = getEx(cur.it.exerciseId);
  const phase = phaseOfItem(cur.it);
  const inPhase = order.filter(({ it }) => phaseOfItem(it) === phase);
  const nInPhase = inPhase.findIndex((o) => o.i === cur.i) + 1;
  const last = pos >= order.length - 1;
  const next = order[pos + 1];
  const nextEx = next ? getEx(next.it.exerciseId) : undefined;
  const isMain = phase === 'main' && !cur.it.test;
  const sug = isMain ? suggestions(state, today).find((s) => s.exId === cur.it.exerciseId) : undefined;

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-canvas">
      <header className="safe-top border-b border-hairline-soft px-4 pb-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="닫기" className="grid h-10 w-10 place-items-center rounded-full bg-strong"><X size={18} /></button>
          <button type="button" onClick={() => setList(true)} className="text-[14px] font-semibold">
            {summary ? '완료 및 기록' : <>{PHASE_LABEL[phase]} <span className="tabular text-muted">{nInPhase} / {inPhase.length}</span></>}
          </button>
          <button type="button" onClick={() => setCheck(true)} aria-label="컨디션 체크"
            className={`grid h-10 w-10 place-items-center rounded-full ${log.check ? 'bg-primary-tint text-primary' : 'bg-strong text-muted'}`}><HeartPulse size={17} /></button>
        </div>
        <div className="mt-3 flex gap-1">
          {(['warmup', 'main', 'cool'] as const).map((ph) => {
            const its = order.filter(({ it }) => phaseOfItem(it) === ph);
            if (!its.length) return null;
            const d = its.filter(({ it }) => it.stopped || it.sets.every((s) => s.done)).length;
            return (
              <div key={ph} className="flex-1" style={{ flexGrow: its.length }}>
                <div className="h-1.5 overflow-hidden rounded-full bg-strong">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(d / its.length) * 100}%` }} />
                </div>
                <p className={`mt-1 text-[11px] ${ph === phase && !summary ? 'font-semibold text-ink' : 'text-muted'}`}>{PHASE_LABEL[ph]}</p>
              </div>
            );
          })}
        </div>
      </header>

      <div id="player-scroll" className="flex-1 overflow-y-auto px-4 pb-40 pt-4">
        {summary ? (
          <Summary date={today} onDone={onClose} />
        ) : (
          <>
            {!cur.it.test && <FigureDemo art={cur.it.art ?? ex?.art} />}
            <div className="mt-4">
              <ExerciseCard key={`${today}-${cur.i}-${cur.it.exerciseId}`} item={cur.it} open onOpenChange={() => {}} hideDemo
                onToggle={(j) => toggle(cur.i, j)} onRecord={(j, a, r) => record(cur.i, j, a, r)}
                onTarget={(j, t) => store.updateSet(today, cur.i, j, cur.it.sets[j].done ? { target: t } : { target: t, actual: t })}
                onAdd={() => store.addSet(today, cur.i)} onRemove={(j) => store.removeSet(today, cur.i, j)}
                warning={warningFor(ex, log)} suggestion={sug}
                onAccept={() => sug && store.applySuggestion(sug)} onSnooze={() => sug && store.snoozeSuggestion(sug, today)}
                {...mainProps(state, today, cur.it, cur.i, store, setPain)} />
            </div>
            {nextEx && (
              <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
                <span className="grid h-9 w-11 place-items-center rounded-sm bg-soft"><FigureStill art={nextEx.art} className="h-8 w-10" /></span>
                다음 · <b className="text-ink">{next!.it.label ?? nextEx.name}</b>
              </p>
            )}
          </>
        )}
      </div>

      {!summary && <RestTimer offset="bottom-[calc(84px+env(safe-area-inset-bottom))]" z="z-[46]" />}
      {!summary && (
        <footer className="safe-bottom fixed inset-x-0 bottom-0 z-[46] border-t border-hairline bg-canvas">
          <div className="mx-auto flex max-w-[560px] gap-2 px-4 py-3">
            <button type="button" onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={pos === 0} aria-label="이전 동작"
              className="grid h-14 w-14 shrink-0 place-items-center rounded-sm border border-hairline disabled:opacity-30"><ArrowLeft size={20} /></button>
            {last ? (
              <button type="button" onClick={() => { store.stopTimer(); setSummary(true); }}
                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-sm bg-primary text-[17px] font-semibold text-on-primary active:bg-primary-active">
                <Flag size={18} /> 운동 끝 · 요약 보기
              </button>
            ) : (
              <button type="button" onClick={() => setPos((p) => Math.min(order.length - 1, p + 1))}
                className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-sm text-[17px] font-semibold ${curDone ? 'bg-primary text-on-primary active:bg-primary-active' : 'bg-ink text-canvas'}`}>
                {curDone ? <><Check size={18} strokeWidth={3} />다음 동작</> : '건너뛰고 다음'} <ArrowRight size={18} />
              </button>
            )}
          </div>
        </footer>
      )}
      <ConditionSheet open={check} onClose={() => setCheck(false)} />
      <PainSheet date={today} index={pain} onClose={() => setPain(null)} />
      <Sheet open={list} onClose={() => setList(false)} title="오늘 순서">
        <ol className="space-y-1">
          {order.map(({ it, i }, k) => {
            const e = getEx(it.exerciseId);
            const d = it.stopped || it.sets.every((s) => s.done);
            return (
              <li key={i}>
                <button type="button" onClick={() => { setPos(k); setSummary(false); setList(false); }}
                  className={`flex w-full items-center gap-3 rounded-sm px-2 py-2 text-left ${k === pos && !summary ? 'bg-soft' : ''}`}>
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${d ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>{d ? <Check size={12} strokeWidth={3} /> : k + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-[14px]">{it.label ?? e?.name}</span>
                  <span className="text-[12px] text-muted">{PHASE_LABEL[phaseOfItem(it)]}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </Sheet>
    </div>
  );
}

/** 본운동 카드에 붙는 지난 기록 · 첫 기록 안내 · 통증 · 밴드/중량 */
export function mainProps(state: ReturnType<typeof useStore>['state'], date: string, it: ItemLog, i: number, store: ReturnType<typeof useStore>, onPain: (i: number) => void) {
  if (phaseOfItem(it) !== 'main' || it.test) return {};
  const prev = previousOf(state, it.exerciseId, date, it.lv);
  return {
    prev: prev ? { d: prev.d, sets: prev.item.sets.filter((s) => s.done).map((s) => s.actual) } : undefined,
    firstTry: sessionsOf(state, it.exerciseId, date).length === 0,
    onPain: () => onPain(i),
    onGear: (patch: { band?: string; kg?: number }) => store.setGear(date, i, it.exerciseId, patch),
  };
}

export const targetText = (it: ItemLog) => {
  const ex = getEx(it.exerciseId);
  if (!ex) return '';
  const t = it.sets[0]?.target ?? ex.defaultTarget;
  if (ex.interval) return `달리는 시간 ${t}분`;
  return `${it.sets.length}세트 × ${formatTarget(ex, t)}`;
};
