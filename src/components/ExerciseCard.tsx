import { AlertTriangle, Check, ChevronDown, Gauge, History, Info, Pencil, Plus, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ItemLog } from '../types';
import { CATEGORY_LABEL, formatRange, formatTarget, getEx, unitLabel } from '../data/exercises';
import type { Suggestion } from '../lib/plan';
import { timeLabel } from '../lib/date';
import { ExerciseArt } from './ExerciseArt';
import { Stepper } from './ui';
import { ExerciseInfo } from './ExerciseInfo';
import { IntervalTimer } from './IntervalTimer';

interface Props {
  item: ItemLog;
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (setIdx: number) => void;
  onRecord: (setIdx: number, actual: number, rir?: number) => void;
  onTarget: (setIdx: number, target: number) => void;
  onAdd: () => void;
  onRemove: (setIdx: number) => void;
  warning?: string | null;
  suggestion?: Suggestion;
  onAccept?: () => void;
  onSnooze?: () => void;
  hideDemo?: boolean;
  prev?: { d: string; sets: number[] };  // 같은 난도의 지난 기록
  firstTry?: boolean;                    // 아직 기록이 없는 운동
  onPain?: () => void;                   // 통증 → 중단 · 대체
  onGear?: (patch: { band?: string; kg?: number }) => void;
}

export function ExerciseCard({ id, item, open, onOpenChange, onToggle, onRecord, onTarget, onAdd, onRemove, warning, suggestion, onAccept, onSnooze, hideDemo, prev, firstTry, onPain, onGear }: Props) {
  const ex = getEx(item.exerciseId);
  const ex0 = getEx(item.exerciseId);
  // 준비운동·스트레칭은 따라 하기 쉽도록 설명을 펼친 채로 보여 줍니다
  const [info, setInfo] = useState(() => ex0?.category === 'warmup' || ex0?.category === 'mobility');
  const [manage, setManage] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState(0);
  const [rir, setRir] = useState<number | undefined>(undefined);
  const [bandDraft, setBandDraft] = useState<string | null>(null);
  if (!ex) return null;

  const isTest = !!item.test;
  const done = item.sets.filter((s) => s.done).length;
  const total = item.sets.length;
  const complete = done === total;
  const target = item.sets[0]?.target ?? ex.defaultTarget;
  const sameTarget = item.sets.every((s) => s.target === target);
  const goal = isTest ? (complete ? `기록 ${formatTarget(ex, item.sets[0].actual)}` : '1세트 · 바른 자세로 가능한 최대') : ex.interval ? `달리는 시간 ${target}분` : `${total}세트 × ${sameTarget ? formatTarget(ex, target) : '세트별 목표'}`;
  const range = formatRange(ex, item.range);
  const level = item.lv !== undefined ? ex.levels?.[item.lv] : undefined;
  const u = unitLabel(ex);

  const startEdit = (j: number) => { setEditing(j); setRir(item.sets[j].rir); setDraft(item.sets[j].done ? item.sets[j].actual : isTest ? ex.defaultTarget : item.sets[j].target); };
  const isMain = !isTest && (item.phase ?? 'main') === 'main' && (ex.category === 'strength' || ex.category === 'pull' || ex.category === 'cardio');
  const runLevel = ex.interval && item.lv !== undefined ? ex.levels?.[item.lv] : undefined;

  return (
    <article id={id} className={`scroll-mt-4 overflow-hidden rounded-md border bg-canvas transition-shadow ${open ? 'border-hairline shadow-float' : 'border-hairline'}`}>
      <button type="button" onClick={() => onOpenChange(!open)} aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-3 text-left">
        <div className={`relative grid h-[68px] w-[84px] shrink-0 place-items-center rounded-sm ${complete ? 'bg-primary-tint text-primary' : 'bg-soft text-ink'}`}>
          <ExerciseArt art={item.art ?? ex.art} className="h-[62px] w-[80px]" halo={complete ? 'var(--c-primary-tint)' : 'var(--c-surface-soft)'} />
          {complete && (
            <span className="animate-pop absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-on-primary">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`text-[12px] font-bold ${isTest ? 'text-primary' : 'text-muted'}`}>{isTest ? (item.optional ? '테스트 · 선택' : '테스트') : item.optional ? `${CATEGORY_LABEL[ex.category]} · 선택` : CATEGORY_LABEL[ex.category]}</span>
            <span className="text-[12px] text-muted-soft">·</span>
            <span className="truncate text-[12px] text-muted">{ex.part}</span>
          </div>
          <h3 className={`text-[16px] font-semibold leading-tight ${complete ? 'text-muted' : ''}`}>{item.label ?? ex.name}</h3>
          <p className="mt-1 text-[14px] text-muted tabular">{goal}{range && !isTest ? <span className="text-muted-soft"> · 범위 {range}</span> : null}</p>
          {level && <p className="mt-0.5 truncate text-[12px] font-semibold text-primary">난도 · {level.name}</p>}
          {item.subFor && <p className="mt-0.5 truncate text-[12px] font-semibold text-muted">{getEx(item.subFor)?.name} 대신 (통증)</p>}
          {item.stopped && <p className="mt-0.5 truncate text-[12px] font-semibold text-muted">통증으로 중단</p>}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="tabular text-[14px] font-semibold">
            <span className={complete ? 'text-primary' : ''}>{done}</span>
            <span className="text-muted-soft">/{total}</span>
          </span>
          <ChevronDown size={18} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="border-t border-hairline-soft px-3 pb-3">
          {isTest && (
            <div className="mt-3 rounded-sm bg-primary-tint px-3 py-2.5 text-[13px] leading-[1.5] text-primary">
              <p className="flex items-center gap-1.5 font-semibold"><Gauge size={13} />한 번만, 바른 자세로 가능한 만큼</p>
              <p className="mt-0.5">자세가 무너지거나 어깨가 불편해지는 순간 멈추고, 그때까지의 숫자를 기록하세요.{item.optional ? ' 일반 푸쉬업이 5개 이상이면 건너뛰어도 됩니다.' : ''}</p>
              {ex.testHint && <p className="mt-1 font-semibold">{ex.testHint}</p>}
            </div>
          )}
          {warning && (
            <p className="mt-3 flex gap-2 rounded-sm border border-error/40 px-3 py-2.5 text-[13px] leading-[1.5] text-body">
              <AlertTriangle size={15} className="mt-0.5 shrink-0 text-error" />{warning}
            </p>
          )}
          {ex.purpose && !isTest && <p className="mt-3 text-[13px] leading-[1.5] text-muted"><b className="text-ink">목적</b> · {ex.purpose}</p>}
          {firstTry && ex.firstTry && isMain && (
            <p className="mt-3 flex gap-2 rounded-sm bg-soft px-3 py-2.5 text-[13px] leading-[1.55] text-body">
              <Info size={15} className="mt-0.5 shrink-0 text-ink" /><span><b className="text-ink">첫 기록</b> · {ex.firstTry}</span>
            </p>
          )}
          {isMain && ex.gear === 'band' && onGear && (
            bandDraft !== null ? (
              <div className="mt-3 flex gap-2">
                <input autoFocus value={bandDraft} onChange={(e) => setBandDraft(e.target.value)} maxLength={30} placeholder="예: 빨강"
                  className="h-11 min-w-0 flex-1 rounded-sm border border-hairline bg-canvas px-3 text-[15px] outline-none focus:border-2 focus:border-ink" />
                <button type="button" onClick={() => { onGear({ band: bandDraft.trim() }); setBandDraft(null); }} className="h-11 rounded-sm bg-ink px-4 text-[14px] font-medium text-canvas">저장</button>
              </div>
            ) : (
              <button type="button" onClick={() => setBandDraft(item.band ?? '')}
                className="mt-3 flex w-full items-center justify-between rounded-sm border border-hairline px-3.5 py-2.5 text-left text-[14px]">
                <span><span className="text-muted">사용한 밴드 · </span><b>{item.band || '색깔 적기 (선택)'}</b></span>
                <Pencil size={13} className="text-muted" />
              </button>
            )
          )}
          {isMain && ex.gear === 'kg' && onGear && (
            <div className="mt-3 flex items-center justify-between rounded-sm border border-hairline px-3.5 py-2">
              <span className="text-[14px] text-muted">추가 중량 <span className="text-[12px]">(없으면 0)</span></span>
              <Stepper size="sm" value={item.kg ?? 0} min={0} max={100} step={1} suffix="kg" onChange={(v) => onGear({ kg: v })} />
            </div>
          )}
          {runLevel?.run && !complete && (
            <IntervalTimer storeKey={`run-${item.exerciseId}`} run={runLevel.run} walk={runLevel.walk ?? 0} rounds={runLevel.rounds ?? 1}
              onFinish={() => onRecord(0, Math.round((runLevel.run! * (runLevel.rounds ?? 1)) / 60))} />
          )}
          {suggestion && (
            <div className="mt-3 rounded-sm bg-primary-tint px-3 py-2.5 text-[13px] leading-[1.5]">
              <p className="flex items-center gap-1.5 font-semibold text-primary"><Sparkles size={13} />{suggestion.title}</p>
              <p className="mt-0.5 text-body">{suggestion.detail}</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={onAccept} className="h-9 rounded-sm bg-primary px-3.5 text-[13px] font-semibold text-on-primary">적용하기</button>
                <button type="button" onClick={onSnooze} className="h-9 rounded-sm px-3 text-[13px] font-medium text-muted">나중에</button>
              </div>
            </div>
          )}

          {/* 세트: 체크 + 수정 */}
          <ul className="divide-y divide-hairline-soft">
            {item.sets.map((s, j) => {
              const diff = s.done && !isTest ? s.actual - s.target : 0;
              if (editing === j) {
                return (
                  <li key={j} className="animate-rise py-3">
                    <p className="text-[14px] font-semibold">{isTest ? `최대 몇 ${u} 했나요?` : `${j + 1}세트 · 실제로 몇 ${u} 했나요?`}</p>
                    <p className="text-[12px] text-muted">{isTest ? '숫자를 눌러 직접 입력해도 됩니다' : `목표 ${formatTarget(ex, s.target)} · 덜 했거나 더 했으면 그대로 적어 주세요`}</p>
                    <div className="mt-2.5 flex items-center justify-between gap-2">
                      <Stepper value={draft} min={0} max={999} suffix={u} onChange={setDraft} />
                      <div className="flex gap-1.5">
                        <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-sm px-3 text-[14px] font-medium text-muted">취소</button>
                        <button type="button" onClick={() => { onRecord(j, draft, rir); setEditing(null); }}
                          className="h-10 rounded-sm bg-ink px-4 text-[14px] font-medium text-canvas">저장</button>
                      </div>
                    </div>
                    {isMain && ex.unit === 'reps' && (
                      <div className="mt-3">
                        <p className="text-[12px] text-muted">선택 · 몇 회 더 할 수 있었나요? (RIR)</p>
                        <div className="mt-1.5 flex gap-1.5">
                          {[0, 1, 2, 3].map((n) => (
                            <button key={n} type="button" onClick={() => setRir(rir === n ? undefined : n)} aria-pressed={rir === n}
                              className={`tabular h-9 flex-1 rounded-sm text-[13px] font-semibold ${rir === n ? 'bg-ink text-canvas' : 'border border-hairline text-muted'}`}>{n === 3 ? '3+' : n}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    {draft === 0 && <p className="mt-1.5 text-[12px] text-muted">0으로 저장하면 이 세트는 '안 함'으로 돌아갑니다.</p>}
                  </li>
                );
              }
              return (
                <li key={j} className="flex items-center gap-3 py-2.5">
                  <button type="button" onClick={() => (isTest && !s.done ? startEdit(j) : onToggle(j))} aria-pressed={s.done}
                    aria-label={`${j + 1}세트 ${s.done ? '완료 해제' : '완료'}`}
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors ${s.done ? 'border-primary bg-primary text-on-primary' : 'border-border-strong text-transparent'}`}>
                    <Check size={20} strokeWidth={3} className={s.done ? 'animate-pop' : ''} />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="tabular text-[16px] font-semibold">
                      <span className="mr-1.5 text-[13px] font-medium text-muted">{isTest ? '기록' : `${j + 1}세트`}</span>
                      {isTest && !s.done ? '최대' : formatTarget(ex, s.done ? s.actual : s.target)}
                      {diff !== 0 && (
                        <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${diff > 0 ? 'bg-primary-tint text-primary' : 'bg-strong text-muted'}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </p>
                    <p className="tabular text-[12px] text-muted">
                      {s.done ? `${s.doneAt ? timeLabel(s.doneAt) + ' 완료' : '완료'}${diff !== 0 ? ` · 목표 ${formatTarget(ex, s.target)}` : ''}${s.rir !== undefined ? ` · 여유 ${s.rir === 3 ? '3+' : s.rir}회` : ''}` : isTest ? '하고 나서 기록 버튼으로 입력' : '다 하면 체크'}
                      {prev?.sets[j] !== undefined && !isTest && <span className="ml-1 inline-flex items-center gap-0.5 text-muted-soft"><History size={11} className="inline" />지난번 {prev.sets[j]}{u}</span>}
                    </p>
                  </div>
                  {manage ? (
                    <div className="flex items-center gap-1">
                      <Stepper size="sm" value={s.target} min={1} suffix={u} onChange={(v) => onTarget(j, v)} />
                      <button type="button" onClick={() => onRemove(j)} disabled={total <= 1} aria-label={`${j + 1}세트 삭제`}
                        className="grid h-8 w-8 place-items-center rounded-full text-muted disabled:opacity-30"><Trash2 size={16} /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => startEdit(j)}
                      className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-hairline px-3 text-[13px] font-medium">
                      <Pencil size={12} /> {isTest && !s.done ? '기록' : '수정'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>

          {manage && (
            <button type="button" onClick={onAdd}
              className="mb-1 inline-flex h-9 items-center gap-1 rounded-full border border-hairline px-3.5 text-[14px] font-medium">
              <Plus size={14} /> 세트 추가
            </button>
          )}

          {/* 운동 설명 */}
          <button type="button" onClick={() => setInfo((v) => !v)} aria-expanded={info}
            className="mt-2 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-3 text-[14px] font-medium">
            {ex.category === 'warmup' || ex.category === 'mobility' ? '동작 안내 접기 · 펼치기' : '운동 방법 · 주의사항 보기'}
            <ChevronDown size={16} className={`transition-transform ${info ? 'rotate-180' : ''}`} />
          </button>
          {info && <div className="px-1 pb-1 pt-4"><ExerciseInfo ex={ex} demo={!hideDemo} /></div>}

          {!isTest && (
            <div className="mt-3 flex items-center justify-center gap-4">
              <button type="button" onClick={() => { setManage((v) => !v); setEditing(null); }}
                className="flex h-9 items-center gap-1 text-[12px] text-muted">
                <Settings2 size={12} /> {manage ? '조정 끝내기' : '오늘 세트 수 · 목표 조정'}
              </button>
              {isMain && onPain && !item.stopped && !complete && (
                <button type="button" onClick={onPain} className="flex h-9 items-center gap-1 rounded-full border border-error/40 px-3 text-[12px] font-semibold text-error">
                  <AlertTriangle size={12} /> 통증이 있어요
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
