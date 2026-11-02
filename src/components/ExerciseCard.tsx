import { Check, ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ItemLog } from '../types';
import { CATEGORY_LABEL, formatTarget, getEx, unitLabel } from '../data/exercises';
import { timeLabel } from '../lib/date';
import { ExerciseArt } from './ExerciseArt';
import { Stepper } from './ui';
import { ExerciseInfo } from './ExerciseInfo';

interface Props {
  item: ItemLog;
  id?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adapting: boolean;
  onToggle: (setIdx: number) => void;
  onUpdate: (setIdx: number, patch: { target?: number; actual?: number }) => void;
  onAdd: () => void;
  onRemove: (setIdx: number) => void;
}

export function ExerciseCard({ id, item, open, onOpenChange, adapting, onToggle, onUpdate, onAdd, onRemove }: Props) {
  const ex = getEx(item.exerciseId);
  const [info, setInfo] = useState(false);
  const [edit, setEdit] = useState(false);
  if (!ex) return null;

  const done = item.sets.filter((s) => s.done).length;
  const total = item.sets.length;
  const complete = done === total;
  const target = item.sets[0]?.target ?? ex.defaultTarget;
  const sameTarget = item.sets.every((s) => s.target === target);
  const goal = `${total}세트 × ${sameTarget ? formatTarget(ex, target) : '세트별 목표'}`;
  const isStrength = ex.category === 'strength' || ex.category === 'pull';

  return (
    <article id={id} className={`scroll-mt-4 overflow-hidden rounded-md border bg-canvas transition-shadow ${open ? 'border-hairline shadow-float' : 'border-hairline'}`}>
      <button type="button" onClick={() => onOpenChange(!open)} aria-expanded={open}
        className="flex w-full items-center gap-3.5 p-3 text-left">
        <div className={`relative grid h-[68px] w-[84px] shrink-0 place-items-center rounded-sm ${complete ? 'bg-primary-tint text-primary' : 'bg-soft text-ink'}`}>
          <ExerciseArt art={ex.art} className="h-[54px] w-[76px]" />
          {complete && (
            <span className="animate-pop absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-on-primary">
              <Check size={14} strokeWidth={3} />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <span className="text-[12px] font-bold text-muted">{CATEGORY_LABEL[ex.category]}</span>
            <span className="text-[12px] text-muted-soft">·</span>
            <span className="truncate text-[12px] text-muted">{ex.part}</span>
          </div>
          <h3 className={`text-[16px] font-semibold leading-tight ${complete ? 'text-muted' : ''}`}>{ex.name}</h3>
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
          {/* 세트 체크 */}
          <ul className="divide-y divide-hairline-soft">
            {item.sets.map((s, j) => (
              <li key={j} className="flex items-center gap-3 py-2.5">
                <button type="button" onClick={() => onToggle(j)} aria-pressed={s.done}
                  aria-label={`${j + 1}세트 ${s.done ? '완료 해제' : '완료'}`}
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 transition-colors ${s.done ? 'border-primary bg-primary text-on-primary' : 'border-border-strong text-transparent'}`}>
                  <Check size={20} strokeWidth={3} className={s.done ? 'animate-pop' : ''} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-[15px] font-semibold ${s.done ? 'text-muted' : ''}`}>{j + 1}세트</p>
                  <p className="text-[12px] text-muted tabular">
                    {s.done && s.doneAt ? `${timeLabel(s.doneAt)} 완료` : `목표 ${formatTarget(ex, s.target)}`}
                  </p>
                </div>
                {edit ? (
                  <div className="flex items-center gap-1">
                    <div className="text-right">
                      <p className="mb-0.5 text-[11px] text-muted">목표</p>
                      <Stepper size="sm" value={s.target} min={1} suffix={unitLabel(ex)}
                        onChange={(v) => onUpdate(j, s.done ? { target: v } : { target: v, actual: v })} />
                    </div>
                    <button type="button" onClick={() => onRemove(j)} disabled={total <= 1} aria-label={`${j + 1}세트 삭제`}
                      className="ml-1 grid h-8 w-8 place-items-center rounded-full text-muted disabled:opacity-30">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="text-right">
                    <p className="mb-0.5 text-[11px] text-muted">실제</p>
                    <Stepper size="sm" value={s.actual} min={0} suffix={unitLabel(ex)} onChange={(v) => onUpdate(j, { actual: v })} />
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-1 flex items-center gap-2">
            <button type="button" onClick={onAdd}
              className="inline-flex h-9 items-center gap-1 rounded-full border border-hairline px-3.5 text-[14px] font-medium">
              <Plus size={14} /> 세트 추가
            </button>
            <button type="button" onClick={() => setEdit((v) => !v)}
              className={`inline-flex h-9 items-center gap-1 rounded-full px-3.5 text-[14px] font-medium ${edit ? 'bg-ink text-canvas' : 'border border-hairline'}`}>
              <Pencil size={13} /> {edit ? '편집 완료' : '목표 · 세트 편집'}
            </button>
          </div>
          {adapting && isStrength && total > 2 && (
            <p className="mt-2 text-[12px] text-muted">적응기에는 1~2세트로도 충분합니다. 몸이 편할 때만 늘려 주세요.</p>
          )}

          {/* 운동 설명 */}
          <button type="button" onClick={() => setInfo((v) => !v)} aria-expanded={info}
            className="mt-3 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-3 text-[14px] font-medium">
            운동 방법 · 주의사항 보기
            <ChevronDown size={16} className={`transition-transform ${info ? 'rotate-180' : ''}`} />
          </button>
          {info && <div className="px-1 pb-1 pt-4"><ExerciseInfo ex={ex} /></div>}
        </div>
      )}
    </article>
  );
}
