import { Check, ChevronDown, Gauge, Pause, Pencil, Plus, Settings2, Sparkles, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ItemLog } from '../types';
import { CATEGORY_LABEL, formatTarget, getEx, unitLabel } from '../data/exercises';
import { stepAt, variantArt, variantName } from '../data/program';
import { timeLabel } from '../lib/date';
import { ExerciseArt } from './ExerciseArt';
import { Stepper } from './ui';
import { ExerciseInfo } from './ExerciseInfo';

interface Props {
  item: ItemLog;
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggle: (setIdx: number) => void;
  onRecord: (setIdx: number, actual: number) => void;
  onTarget: (setIdx: number, target: number) => void;
  onAdd: () => void;
  onRemove: (setIdx: number) => void;
}

export function ExerciseCard({ id, item, open, onOpenChange, onToggle, onRecord, onTarget, onAdd, onRemove }: Props) {
  const ex = getEx(item.exerciseId);
  const ex0 = getEx(item.exerciseId);
  // 준비운동·스트레칭은 따라 하기 쉽도록 설명을 펼친 채로 보여 줍니다
  const [info, setInfo] = useState(() => ex0?.category === 'warmup' || ex0?.category === 'mobility');
  const [manage, setManage] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState(0);
  if (!ex) return null;

  const isTest = !!item.test;
  const done = item.sets.filter((s) => s.done).length;
  const total = item.sets.length;
  const complete = done === total;
  const target = item.sets[0]?.target ?? ex.defaultTarget;
  const sameTarget = item.sets.every((s) => s.target === target);
  const goal = isTest ? (complete ? `기록 ${formatTarget(ex, item.sets[0].actual)}` : '1세트 · 바른 자세로 가능한 최대') : `${total}세트 × ${sameTarget ? formatTarget(ex, target) : '세트별 목표'}`;
  const step = item.level ? stepAt(ex.id, item.level) : null;
  const u = unitLabel(ex);

  const startEdit = (j: number) => { setEditing(j); setDraft(item.sets[j].done ? item.sets[j].actual : isTest ? ex.defaultTarget : item.sets[j].target); };

  return (
    <article id={id} className={`scroll-mt-4 overflow-hidden rounded-md border bg-canvas transition-shadow ${open ? 'border-hairline shadow-float' : 'border-hairline'}`}>
      <button type="button" onClick={() => onOpenChange(!open)} aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-3 text-left">
        <div className={`relative grid h-[68px] w-[84px] shrink-0 place-items-center rounded-sm ${complete ? 'bg-primary-tint text-primary' : 'bg-soft text-ink'}`}>
          <ExerciseArt art={item.art ?? variantArt(ex.id, item.level) ?? ex.art} className="h-[62px] w-[80px]" halo={complete ? 'var(--c-primary-tint)' : 'var(--c-surface-soft)'} />
          {complete && (
            <span className="animate-pop absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-on-primary">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className={`text-[12px] font-bold ${isTest ? 'text-primary' : 'text-muted'}`}>{isTest ? (item.optional ? '테스트 · 선택' : '테스트') : CATEGORY_LABEL[ex.category]}</span>
            <span className="text-[12px] text-muted-soft">·</span>
            <span className="truncate text-[12px] text-muted">{ex.part}</span>
          </div>
          <h3 className={`text-[16px] font-semibold leading-tight ${complete ? 'text-muted' : ''}`}>{item.label ?? variantName(ex.name, ex.id, item.level)}</h3>
          <p className="mt-1 text-[14px] text-muted tabular">{goal}</p>
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
          {/* 추천 프로그램 안내 */}
          {item.level && (
            <div className="mt-3 rounded-sm bg-soft px-3 py-2.5 text-[13px] leading-[1.5]">
              <p className="flex items-center gap-1.5 font-semibold text-ink">
                {item.hold ? <Pause size={13} /> : <Sparkles size={13} className="text-primary" />}
                {item.hold === 'pain' ? '통증을 고려해 지난번 단계를 유지합니다'
                  : item.hold === 'miss' ? '지난 목표를 다 채우면 다음 단계로 올라갑니다'
                  : `추천 목표 · ${item.level}단계`}
              </p>
              {step?.note && <p className="mt-0.5 text-body">{step.note}</p>}
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
                        <button type="button" onClick={() => { onRecord(j, draft); setEditing(null); }}
                          className="h-10 rounded-sm bg-ink px-4 text-[14px] font-medium text-canvas">저장</button>
                      </div>
                    </div>
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
                      {s.done ? `${s.doneAt ? timeLabel(s.doneAt) + ' 완료' : '완료'}${diff !== 0 ? ` · 목표 ${formatTarget(ex, s.target)}` : ''}` : isTest ? '하고 나서 기록 버튼으로 입력' : '다 하면 체크'}
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
          {info && <div className="px-1 pb-1 pt-4"><ExerciseInfo ex={ex} /></div>}

          {!isTest && <button type="button" onClick={() => { setManage((v) => !v); setEditing(null); }}
            className="mx-auto mt-3 flex items-center gap-1 text-[12px] text-muted underline-offset-2 active:underline">
            <Settings2 size={12} /> {manage ? '목표 조정 끝내기' : '오늘 목표 · 세트 수 직접 조정'}
          </button>}
        </div>
      )}
    </article>
  );
}
