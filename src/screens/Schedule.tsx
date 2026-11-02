import { ArrowDown, ArrowUp, ChevronRight, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { weekday } from '../lib/date';
import { CATEGORY_LABEL, EXERCISES, formatTarget, getEx, unitLabel } from '../data/exercises';
import { WEEKDAYS, WEEK_ORDER } from '../data/schedule';
import { Chip, PrimaryButton, SecondaryButton, Sheet, Stepper } from '../components/ui';
import type { Category, DayPlan } from '../types';

const CAT_ORDER: Category[] = ['warmup', 'strength', 'pull', 'cardio', 'mobility'];

export function ScheduleView() {
  const { state, today, setDayPlan, resetSchedule } = useStore();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState<DayPlan | null>(null);
  const [picker, setPicker] = useState(false);
  const todayWd = weekday(today);

  const openEditor = (wd: number) => { setEditing(wd); setDraft(structuredClone(state.schedule[wd])); };
  const close = () => { setEditing(null); setDraft(null); setPicker(false); };
  const save = () => { if (editing !== null && draft) setDayPlan(editing, draft); close(); };

  const move = (i: number, d: number) => setDraft((p) => {
    if (!p) return p;
    const items = [...p.items];
    const j = i + d;
    if (j < 0 || j >= items.length) return p;
    [items[i], items[j]] = [items[j], items[i]];
    return { ...p, items };
  });

  return (
    <div>
      <p className="mt-5 text-[14px] text-muted">요일을 눌러 운동 구성과 목표를 바꿀 수 있습니다.</p>

      <div className="mt-4 space-y-3">
        {WEEK_ORDER.map((wd) => {
          const plan = state.schedule[wd];
          const rest = plan.items.length === 0;
          const mains = plan.items.filter((p) => getEx(p.exerciseId)?.category !== 'warmup');
          return (
            <button key={wd} type="button" onClick={() => openEditor(wd)}
              className={`flex w-full items-center gap-4 rounded-md border p-4 text-left ${wd === todayWd ? 'border-ink' : 'border-hairline'}`}>
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[16px] font-semibold ${wd === todayWd ? 'bg-primary text-on-primary' : rest ? 'bg-soft text-muted' : 'bg-strong text-ink'}`}>
                {WEEKDAYS[wd]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-semibold">{rest ? '휴식' : plan.title}</p>
                  {wd === todayWd && <Chip tone="primary">오늘</Chip>}
                </div>
                <p className="mt-1 truncate text-[14px] text-muted">
                  {rest ? '충분한 회복도 운동입니다' : mains.map((p) => getEx(p.exerciseId)?.name).join(' · ')}
                </p>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-md bg-soft p-4 text-[14px] leading-[1.6] text-body">
        <p className="font-semibold text-ink">풀업 단계 안내</p>
        <p className="mt-1">처음에는 보조 매달리기와 발 보조 풀업으로 시작합니다. 매달리기가 익숙해지면 <b>견갑 풀업</b>을, 보조 풀업이 통증 없이 가능해지면 <b>네거티브 풀업</b>을 일정에 추가해 보세요.</p>
      </div>

      <button type="button" onClick={() => { if (confirm('주간 일정을 기본값으로 되돌릴까요? 기록은 유지됩니다.')) resetSchedule(); }}
        className="mx-auto mt-6 flex items-center gap-1.5 text-[14px] text-muted underline-offset-4 active:underline">
        <RotateCcw size={14} /> 기본 일정으로 되돌리기
      </button>

      <Sheet open={editing !== null && !!draft && !picker} onClose={close} title={`${editing !== null ? WEEKDAYS[editing] : ''}요일 일정`}>
        {draft && (
          <div>
            <label className="block">
              <span className="text-[14px] font-medium text-muted">이 날의 이름</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1.5 h-14 w-full rounded-sm border border-hairline bg-canvas px-3.5 text-[16px] outline-none focus:border-2 focus:border-ink" />
            </label>

            <div className="mt-5 space-y-2.5">
              {draft.items.length === 0 && <p className="rounded-sm bg-soft p-4 text-center text-[14px] text-muted">휴식일입니다. 운동을 추가하면 운동하는 날이 됩니다.</p>}
              {draft.items.map((p, i) => {
                const ex = getEx(p.exerciseId);
                if (!ex) return null;
                return (
                  <div key={`${p.exerciseId}-${i}`} className="rounded-md border border-hairline p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-bold text-muted">{CATEGORY_LABEL[ex.category]}</p>
                        <p className="text-[16px] font-semibold">{ex.name}</p>
                        {ex.range && <p className="text-[12px] text-muted">권장 {ex.range}</p>}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => move(i, -1)} aria-label="위로" className="grid h-8 w-8 place-items-center rounded-full bg-strong disabled:opacity-30" disabled={i === 0}><ArrowUp size={14} /></button>
                        <button onClick={() => move(i, 1)} aria-label="아래로" className="grid h-8 w-8 place-items-center rounded-full bg-strong disabled:opacity-30" disabled={i === draft.items.length - 1}><ArrowDown size={14} /></button>
                        <button onClick={() => setDraft({ ...draft, items: draft.items.filter((_, k) => k !== i) })} aria-label="삭제" className="grid h-8 w-8 place-items-center rounded-full bg-strong text-error"><Trash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="mb-1 text-[11px] text-muted">세트</p>
                        <Stepper size="sm" value={p.sets} min={1} max={10}
                          onChange={(v) => setDraft({ ...draft, items: draft.items.map((x, k) => (k === i ? { ...x, sets: v } : x)) })} />
                      </div>
                      <div className="text-right">
                        <p className="mb-1 text-[11px] text-muted">세트당 목표{ex.perSide ? ' (좌우 각)' : ''}</p>
                        <Stepper size="sm" value={p.target} min={1} suffix={unitLabel(ex)}
                          onChange={(v) => setDraft({ ...draft, items: draft.items.map((x, k) => (k === i ? { ...x, target: v } : x)) })} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={() => setPicker(true)}
              className="mt-3 flex h-12 w-full items-center justify-center gap-1.5 rounded-sm border border-dashed border-border-strong text-[15px] font-medium">
              <Plus size={16} /> 운동 추가
            </button>
            {draft.items.length > 0 && (
              <button type="button" onClick={() => setDraft({ ...draft, items: [], title: '푹 쉬는 날' })}
                className="mt-2 w-full py-2 text-[14px] text-muted">휴식일로 지정</button>
            )}

            <div className="mt-5 flex gap-2">
              <SecondaryButton onClick={close} className="flex-1">취소</SecondaryButton>
              <PrimaryButton onClick={save} className="flex-[2]">저장</PrimaryButton>
            </div>
          </div>
        )}
      </Sheet>

      <Sheet open={picker} onClose={() => setPicker(false)} title="운동 추가">
        {CAT_ORDER.map((cat) => (
          <div key={cat} className="mb-5">
            <p className="mb-2 text-[12px] font-bold text-muted">{CATEGORY_LABEL[cat]}</p>
            <div className="space-y-2">
              {EXERCISES.filter((e) => e.category === cat).map((e) => {
                const added = draft?.items.some((p) => p.exerciseId === e.id);
                return (
                  <button key={e.id} type="button" disabled={added}
                    onClick={() => { if (draft) setDraft({ ...draft, items: [...draft.items, { exerciseId: e.id, sets: e.defaultSets, target: e.defaultTarget }] }); setPicker(false); }}
                    className="flex w-full items-center justify-between gap-3 rounded-sm border border-hairline p-3.5 text-left disabled:opacity-40">
                    <div>
                      <p className="text-[15px] font-semibold">{e.name}</p>
                      <p className="text-[13px] text-muted">{e.defaultSets}세트 × {formatTarget(e, e.defaultTarget)}{e.stage ? ` · ${e.stage}` : ''}</p>
                    </div>
                    <span className="text-[13px] font-medium text-primary">{added ? '추가됨' : '추가'}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </Sheet>
    </div>
  );
}
