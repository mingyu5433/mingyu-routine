import { ArrowLeft, ArrowRight, Check, Flag, Moon, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { Area, ConditionCheck } from '../types';
import { useStore } from '../lib/store';
import { getEx } from '../data/exercises';
import { BEDTIME } from '../data/schedule';
import { AREA_LABEL, phaseOfItem, suggestions, warningFor } from '../lib/plan';
import { daySets } from '../lib/stats';
import { useSetActions } from '../lib/useSetActions';
import { ExerciseCard } from './ExerciseCard';
import { RestTimer } from './RestTimer';
import { FigureDemo, FigureStill } from '../figure/Figure';
import { PrimaryButton, Sheet, Stepper, Toggle } from './ui';

const AREAS: Area[] = ['shoulder', 'back', 'knee'];
const PHASE_LABEL = { warmup: '준비운동', main: '본운동', cool: '스트레칭' } as const;
const PHASE_ORDER = { warmup: 0, main: 1, cool: 2 } as const;

/** 운동 시작 전 컨디션 체크 */
export function ConditionSheet({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
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
    onDone();
  };
  return (
    <Sheet open={open} onClose={onClose} title="운동 전 컨디션 체크">
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
          <p className="text-[15px] font-medium">지금 통증이 있는 곳</p>
          <div className="mt-2 grid grid-cols-3 gap-1.5">
            {AREAS.map((a) => (
              <button key={a} type="button" onClick={() => toggle(a)} aria-pressed={pain.includes(a)}
                className={`h-12 rounded-sm text-[15px] font-semibold ${pain.includes(a) ? 'bg-error text-on-primary' : 'border border-hairline'}`}>{AREA_LABEL[a]}</button>
            ))}
          </div>
          <p className="mt-2 text-[12px] leading-[1.5] text-muted">
            {pain.length ? '체크한 부위에 부담이 큰 운동에는 경고가 표시되고, 다음 단계 제안이 멈춥니다.' : '통증이 없으면 아무것도 누르지 않아도 됩니다.'}
          </p>
        </div>
        {(fatigue >= 4 || sleep < 6) && (
          <p className="rounded-sm bg-soft p-3 text-[13px] leading-[1.55] text-body">피곤한 날입니다. 오늘은 근력운동을 1세트씩 줄이거나, 준비운동과 걷기만 해도 충분합니다.</p>
        )}
        <PrimaryButton className="w-full" onClick={save}>확인하고 시작하기</PrimaryButton>
        <p className="text-center text-[11px] leading-[1.5] text-muted-soft">이 앱은 의학적 진단을 제공하지 않습니다. 통증이 지속되거나 악화되면 전문가의 평가를 받아 주세요.</p>
      </div>
    </Sheet>
  );
}

/** 운동 후 기록: 총 시간 · 체감 난도 · 통증 · 메모 */
export function AfterSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { today, dayLog, setAfter } = useStore();
  const log = dayLog(today);
  const auto = log.startedAt ? Math.max(1, Math.round((Date.now() - log.startedAt) / 60000)) : 40;
  const [minutes, setMinutes] = useState(log.after?.minutes ?? auto);
  const [rpe, setRpe] = useState(log.after?.rpe ?? 6);
  const [pain, setPain] = useState<Area[]>(log.after?.pain ?? []);
  const [memo, setMemo] = useState(log.after?.memo ?? '');
  useEffect(() => { if (open && !log.after) setMinutes(auto); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const { total, done } = daySets(log);
  return (
    <Sheet open={open} onClose={onClose} title="오늘 운동 기록">
      <div className="space-y-5">
        <p className="text-[14px] text-muted">{log.title} · {done}/{total} 세트 완료</p>
        <div className="flex items-center justify-between">
          <p className="text-[15px] font-medium">총 운동 시간</p>
          <Stepper value={minutes} min={1} max={240} suffix="분" onChange={setMinutes} />
        </div>
        <div>
          <p className="text-[15px] font-medium">체감 난도 <span className="text-[13px] text-muted">1 매우 쉬움 ~ 10 한계</span></p>
          <div className="mt-2 grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, k) => k + 1).map((n) => (
              <button key={n} type="button" onClick={() => setRpe(n)} aria-pressed={rpe === n}
                className={`tabular h-11 rounded-sm text-[15px] font-semibold ${rpe === n ? 'bg-ink text-canvas' : 'border border-hairline'}`}>{n}</button>
            ))}
          </div>
          <p className="mt-1.5 text-[12px] text-muted">세트마다 2~3회 여유를 남겼다면 보통 6~7 정도입니다.</p>
        </div>
        <div>
          <p className="text-[15px] font-medium">운동 중 통증이 있었나요?</p>
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            <button type="button" onClick={() => setPain([])} aria-pressed={pain.length === 0}
              className={`h-11 rounded-sm text-[14px] font-semibold ${pain.length === 0 ? 'bg-ink text-canvas' : 'border border-hairline'}`}>없음</button>
            {AREAS.map((a) => (
              <button key={a} type="button" onClick={() => setPain((p) => (p.includes(a) ? p.filter((x) => x !== a) : [...p, a]))} aria-pressed={pain.includes(a)}
                className={`h-11 rounded-sm text-[14px] font-semibold ${pain.includes(a) ? 'bg-error text-on-primary' : 'border border-hairline'}`}>{AREA_LABEL[a]}</button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="text-[15px] font-medium">메모</span>
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={3} maxLength={300}
            placeholder="예: 푸쉬업 마지막 세트에서 어깨 앞쪽이 살짝 당김"
            className="mt-1.5 w-full resize-none rounded-sm border border-hairline bg-canvas px-3.5 py-3 text-[15px] leading-[1.5] outline-none focus:border-2 focus:border-ink" />
        </label>
        <PrimaryButton className="w-full" onClick={() => { setAfter(today, { minutes, rpe, pain, memo: memo.trim() }); onClose(); }}>저장</PrimaryButton>
      </div>
    </Sheet>
  );
}

/** 운동 진행 화면: 한 동작씩 넘기며 진행 */
export function Player({ open, onClose }: { open: boolean; onClose: () => void }) {
  const store = useStore();
  const { today, state } = store;
  const { log, toggle, record } = useSetActions(today);
  const order = useMemo(() => log.items.map((it, i) => ({ it, i }))
    .sort((a, b) => PHASE_ORDER[phaseOfItem(a.it)] - PHASE_ORDER[phaseOfItem(b.it)] || a.i - b.i), [log]);
  const firstOpen = Math.max(0, order.findIndex(({ it }) => it.sets.some((s) => !s.done)));
  const [pos, setPos] = useState(firstOpen);
  const [after, setAfter] = useState(false);
  const sugs = useMemo(() => suggestions(state, today), [state, today]);

  useEffect(() => { if (open) { setPos(firstOpen); store.markStarted(today); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const cur = order[Math.min(pos, order.length - 1)];
  const curDone = cur ? cur.it.sets.every((s) => s.done) : false;
  // 준비운동·스트레칭은 다 하면 다음 동작으로 자동 이동
  useEffect(() => {
    if (!open || !cur || !curDone || phaseOfItem(cur.it) === 'main') return;
    if (pos >= order.length - 1) return;
    const id = setTimeout(() => setPos((p) => Math.min(order.length - 1, p + 1)), 700);
    return () => clearTimeout(id);
  }, [curDone, pos, open]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { document.getElementById('player-scroll')?.scrollTo({ top: 0 }); }, [pos]);

  if (!open || !cur) return null;
  const ex = getEx(cur.it.exerciseId);
  const phase = phaseOfItem(cur.it);
  const inPhase = order.filter(({ it }) => phaseOfItem(it) === phase);
  const nInPhase = inPhase.findIndex((o) => o.i === cur.i) + 1;
  const { total, done } = daySets(log);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const last = pos >= order.length - 1;
  const next = order[pos + 1];
  const nextEx = next ? getEx(next.it.exerciseId) : undefined;
  const sug = sugs.find((s) => s.exId === cur.it.exerciseId && phase === 'main');

  return (
    <div className="fixed inset-0 z-[45] flex flex-col bg-canvas">
      <header className="safe-top border-b border-hairline-soft px-4 pb-3">
        <div className="flex items-center justify-between">
          <button type="button" onClick={onClose} aria-label="닫기" className="grid h-10 w-10 place-items-center rounded-full bg-strong"><X size={18} /></button>
          <p className="text-[14px] font-semibold">{PHASE_LABEL[phase]} <span className="tabular text-muted">{nInPhase} / {inPhase.length}</span></p>
          <span className="tabular w-10 text-right text-[13px] font-semibold text-muted">{pct}%</span>
        </div>
        <div className="mt-3 flex gap-1">
          {(['warmup', 'main', 'cool'] as const).map((ph) => {
            const its = order.filter(({ it }) => phaseOfItem(it) === ph);
            if (!its.length) return null;
            const d = its.filter(({ it }) => it.sets.every((s) => s.done)).length;
            return (
              <div key={ph} className="flex-1" style={{ flexGrow: its.length }}>
                <div className="h-1.5 overflow-hidden rounded-full bg-strong">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(d / its.length) * 100}%` }} />
                </div>
                <p className={`mt-1 text-[11px] ${ph === phase ? 'font-semibold text-ink' : 'text-muted'}`}>{PHASE_LABEL[ph]}</p>
              </div>
            );
          })}
        </div>
      </header>

      <div id="player-scroll" className="flex-1 overflow-y-auto px-4 pb-40 pt-4">
        {!cur.it.test && <FigureDemo art={cur.it.art ?? (ex?.id === 'incline-pushup' && cur.it.lv === 2 ? 'pushup' : ex?.art)} />}
        <div className="mt-4">
          <ExerciseCard key={`${today}-${cur.i}`} item={cur.it} open onOpenChange={() => {}} hideDemo
            onToggle={(j) => toggle(cur.i, j)} onRecord={(j, a) => record(cur.i, j, a)}
            onTarget={(j, t) => store.updateSet(today, cur.i, j, cur.it.sets[j].done ? { target: t } : { target: t, actual: t })}
            onAdd={() => store.addSet(today, cur.i)} onRemove={(j) => store.removeSet(today, cur.i, j)}
            warning={warningFor(ex, log)} suggestion={sug}
            onAccept={() => sug && store.acceptSuggestion(sug)} onSnooze={() => sug && store.snoozeSuggestion(sug, today)} />
        </div>
        {nextEx && (
          <p className="mt-4 flex items-center gap-2 text-[13px] text-muted">
            <span className="grid h-9 w-11 place-items-center rounded-sm bg-soft"><FigureStill art={nextEx.art} className="h-8 w-10" /></span>
            다음 · <b className="text-ink">{next!.it.label ?? nextEx.name}</b>
          </p>
        )}
      </div>

      <RestTimer offset="bottom-[calc(84px+env(safe-area-inset-bottom))]" z="z-[46]" />
      <footer className="safe-bottom fixed inset-x-0 bottom-0 z-[46] border-t border-hairline bg-canvas">
        <div className="mx-auto flex max-w-[560px] gap-2 px-4 py-3">
          <button type="button" onClick={() => setPos((p) => Math.max(0, p - 1))} disabled={pos === 0} aria-label="이전 동작"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-sm border border-hairline disabled:opacity-30"><ArrowLeft size={20} /></button>
          {last ? (
            <button type="button" onClick={() => setAfter(true)}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-sm bg-primary text-[17px] font-semibold text-on-primary active:bg-primary-active">
              <Flag size={18} /> 운동 끝 · 기록 남기기
            </button>
          ) : (
            <button type="button" onClick={() => setPos((p) => Math.min(order.length - 1, p + 1))}
              className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-sm text-[17px] font-semibold ${curDone ? 'bg-primary text-on-primary active:bg-primary-active' : 'bg-ink text-canvas'}`}>
              {curDone ? <><Check size={18} strokeWidth={3} />다음 동작</> : '건너뛰고 다음'} <ArrowRight size={18} />
            </button>
          )}
        </div>
      </footer>
      <AfterSheet open={after} onClose={() => { setAfter(false); onClose(); }} />
    </div>
  );
}

/** 매일 자기 전 5분 루틴 (선택) */
export function BedtimeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { today, dayLog, setBedtime } = useStore();
  const checks = dayLog(today).bedtime ?? [];
  return (
    <Sheet open={open} onClose={onClose} title="자기 전 5분 루틴">
      <p className="text-[14px] leading-[1.6] text-body">운동과 별개로 하는 가벼운 회복 루틴입니다. 하지 않아도 운동 기록에는 영향이 없습니다.</p>
      <ul className="mt-4 space-y-2.5">
        {BEDTIME.map((p, k) => {
          const ex = getEx(p.exerciseId)!;
          const on = !!checks[k];
          const dose = ex.unit === 'min' ? `${p.target}~${p.target + 1}분` : ex.unit === 'sec' ? `${ex.each ?? ''} ${p.target}초` : `천천히 ${p.target}~${p.target + 2}회`;
          return (
            <li key={p.exerciseId} className="flex items-center gap-3 rounded-sm border border-hairline p-2.5">
              <div className="grid h-[56px] w-[72px] shrink-0 place-items-center rounded-sm bg-soft"><FigureStill art={ex.art} className="h-[50px] w-[66px]" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">{ex.name}</p>
                <p className="text-[12px] text-muted">{dose.trim()} · {ex.summary}</p>
              </div>
              <button type="button" onClick={() => setBedtime(today, k, !on)} aria-pressed={on} aria-label={`${ex.name} ${on ? '해제' : '완료'}`}
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${on ? 'border-primary bg-primary text-on-primary' : 'border-border-strong text-transparent'}`}>
                <Check size={18} strokeWidth={3} />
              </button>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 flex items-center gap-1.5 text-[12px] text-muted"><Moon size={13} />문틀 가슴 스트레칭은 어깨 앞쪽에 통증이 있으면 생략합니다.</p>
    </Sheet>
  );
}
