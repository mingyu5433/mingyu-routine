import { ArrowDown, ArrowUp, ChevronRight, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { weekday } from '../lib/date';
import { CATEGORY_LABEL, EXERCISES, formatRange, formatTarget, getEx, unitLabel } from '../data/exercises';
import { PRESET_LABEL, WEEKDAYS, WEEK_ORDER, type SchedulePreset } from '../data/schedule';
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
          const rest = plan.items.every((p) => p.optional);
          const mains = plan.items.filter((p) => (p.phase ?? (getEx(p.exerciseId)?.category === 'warmup' ? 'warmup' : getEx(p.exerciseId)?.category === 'mobility' ? 'cool' : 'main')) === 'main');
          return (
            <button key={wd} type="button" onClick={() => openEditor(wd)}
              className={`flex w-full items-center gap-4 rounded-md border p-4 text-left ${wd === todayWd ? 'border-ink' : 'border-hairline'}`}>
              <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-full text-[16px] font-semibold ${wd === todayWd ? 'bg-primary text-on-primary' : rest ? 'bg-soft text-muted' : 'bg-strong text-ink'}`}>
                {WEEKDAYS[wd]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[16px] font-semibold">{plan.title}{plan.time ? <span className="text-[13px] font-normal text-muted"> · {plan.time}</span> : null}</p>
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
        <p className="mt-1">11월 2일 테스트(매달리기 60초, 견갑 풀업 4회)를 바탕으로 <b>상체 B</b>에서 네거티브 풀업 → 발 보조 풀업 → 매달리기 순서로 등과 악력을 키우고, <b>상체 A</b>에서는 견갑 풀업으로 날개뼈를 다집니다. 7주차(12월 20일 주간)에는 안전하다면 보조 없는 풀업 1회를 시도합니다.</p>
      </div>

      <div className="mt-6 rounded-md border border-hairline p-4">
        <p className="flex items-center gap-1.5 text-[14px] font-semibold"><RotateCcw size={14} />추천 일정으로 바꾸기</p>
        <p className="mt-1 text-[12px] text-muted">직접 바꾼 일정은 사라지고, 기록은 그대로 남습니다.</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(PRESET_LABEL) as SchedulePreset[]).map((k) => (
            <button key={k} type="button" onClick={() => { if (confirm(`'${PRESET_LABEL[k]}' 일정으로 바꿀까요?`)) resetSchedule(k); }}
              className="rounded-sm border border-hairline px-3 py-3 text-left text-[13px] font-medium leading-[1.4]">
              {PRESET_LABEL[k]}
            </button>
          ))}
        </div>
      </div>

      <Sheet open={editing !== null && !!draft && !picker} onClose={close} title={`${editing !== null ? WEEKDAYS[editing] : ''}요일 일정`}>
        {draft && (
          <div>
            <label className="block">
              <span className="text-[14px] font-medium text-muted">이 날의 이름</span>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="mt-1.5 h-14 w-full rounded-sm border border-hairline bg-canvas px-3.5 text-[16px] outline-none focus:border-2 focus:border-ink" />
            </label>

            {state.settings.autoProgram && (
              <p className="mt-4 rounded-sm bg-primary-tint px-3 py-2.5 text-[13px] leading-[1.5] text-primary">여기서 정한 세트·목표가 기본값입니다. 1~2주차(적응 단계)에는 근력운동이 최대 2세트로 시작하고, 목표를 안정적으로 채우면 '다음 단계 제안'이 나타납니다. 제안은 적용을 눌러야만 바뀝니다.</p>
            )}
            <div className="mt-5 space-y-2.5">
              {draft.items.length === 0 && <p className="rounded-sm bg-soft p-4 text-center text-[14px] text-muted">휴식일입니다. 운동을 추가하면 운동하는 날이 됩니다.</p>}
              {draft.items.map((p, i) => {
                const ex = getEx(p.exerciseId);
                if (!ex) return null;
                return (
                  <div key={`${p.exerciseId}-${i}`} className="rounded-md border border-hairline p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-bold text-muted">{p.phase === 'warmup' ? '준비운동' : p.phase === 'cool' ? '스트레칭' : p.phase === 'main' ? '본운동' : CATEGORY_LABEL[ex.category]}{p.optional ? ' · 선택' : ''}</p>
                        <p className="text-[16px] font-semibold">{ex.name}</p>
                        {p.range && <p className="text-[12px] text-muted">목표 범위 {formatRange(ex, p.range)}</p>}
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
                        <p className="mb-1 text-[11px] text-muted">세트당 목표{ex.each ? ` (${ex.each})` : ex.perSide ? ' (좌우 각)' : ''}</p>
                        <Stepper size="sm" value={p.target} min={1} suffix={unitLabel(ex)}
                          onChange={(v) => setDraft({ ...draft, items: draft.items.map((x, k) => (k === i ? { ...x, target: v } : x)) })} />
                      </div>
                    </div>
                    {(p.phase ?? 'main') === 'main' && ex.unit !== 'min' && (
                      <div className="mt-3">
                        <p className="mb-1 text-[11px] text-muted">세트 사이 휴식</p>
                        <div className="grid grid-cols-3 gap-1.5">
                          {[60, 90, 120].map((r) => (
                            <button key={r} type="button" onClick={() => setDraft({ ...draft, items: draft.items.map((x, k) => (k === i ? { ...x, rest: r } : x)) })}
                              className={`tabular h-9 rounded-sm text-[13px] font-semibold ${(p.rest ?? ex.restSec ?? 90) === r ? 'bg-ink text-canvas' : 'border border-hairline'}`}>{r}초</button>
                          ))}
                        </div>
                      </div>
                    )}
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
                    onClick={() => { if (draft) setDraft({ ...draft, items: [...draft.items, { exerciseId: e.id, sets: e.defaultSets, target: e.defaultTarget, phase: e.category === 'warmup' ? 'warmup' : e.category === 'mobility' ? 'cool' : 'main', ...(e.restSec ? { rest: e.restSec } : {}) }] }); setPicker(false); }}
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
