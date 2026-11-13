import { BookOpen, ChevronDown, ChevronRight, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { weekday } from '../lib/date';
import { formatRange, formatTarget, getEx, unitLabel } from '../data/exercises';
import { DAY_KIND, WEEKDAYS, WEEK_ORDER } from '../data/schedule';
import { MAIN_IDS } from '../data/v5';
import { levelOf, planOf } from '../lib/plan';
import { ExerciseArt } from '../components/ExerciseArt';
import { ExerciseInfo } from '../components/ExerciseInfo';
import { FigureDemo } from '../figure/Figure';
import { Card, SectionTitle, Sheet, Stepper } from '../components/ui';

const PHASE_LABEL = { warmup: '운동 전 준비운동', main: '본운동', cool: '운동 후 스트레칭' } as const;

export function WorkoutScreen() {
  const { state, today, setMainPlan, resetSchedule } = useStore();
  const [info, setInfo] = useState<string | null>(null);
  const [day, setDay] = useState<number | null>(null);
  const todayWd = weekday(today);
  const infoEx = info ? getEx(info) : undefined;
  const dayPlan = day !== null ? state.schedule[day] : undefined;

  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-bold leading-[1.3]">운동</h1>
        <p className="mt-1 text-[14px] text-muted">본운동은 네 가지와 토요일 달리기뿐입니다. 종류는 그대로, 강도로 성장합니다.</p>
      </header>

      <SectionTitle>본운동 목표</SectionTitle>
      <div className="space-y-3">
        {MAIN_IDS.map((id) => {
          const ex = getEx(id)!;
          const p = planOf(state, id);
          if (!p) return null;
          const lv = levelOf(state, ex);
          const lvName = lv !== undefined ? ex.levels?.[lv]?.name : undefined;
          const days = WEEK_ORDER.filter((wd) => state.schedule[wd].items.some((q) => q.exerciseId === id)).map((wd) => WEEKDAYS[wd]).join(' · ');
          const rr = ex.restRange;
          const restOpts = rr ? [rr[0], Math.round((rr[0] + rr[1]) / 2 / 15) * 15, rr[1]] : [];
          return (
            <Card key={id} className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-[60px] w-[76px] shrink-0 place-items-center rounded-sm bg-soft"><ExerciseArt art={ex.art} className="h-[52px] w-[70px]" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-semibold">{ex.name}</span>
                  <span className="block text-[13px] text-muted">{days}</span>
                  {lvName && <span className="block truncate text-[12px] font-semibold text-primary">단계 · {lvName}</span>}
                </span>
              </div>
              {ex.interval ? (
                <p className="mt-3 rounded-sm bg-soft px-3 py-2.5 text-[13px] leading-[1.55] text-body">
                  {lv !== undefined ? ex.levels![lv].how : ''}. 단계를 올리면 달리는 시간이 늘어납니다.
                </p>
              ) : (
                <>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <div>
                      <p className="mb-1 text-[11px] text-muted">세트</p>
                      <Stepper size="sm" value={p.sets} min={1} max={8} onChange={(v) => setMainPlan(id, { sets: v })} />
                    </div>
                    <div className="text-right">
                      <p className="mb-1 text-[11px] text-muted">세트당 목표{p.range ? ` (범위 ${formatRange(ex, p.range)})` : ''}</p>
                      <Stepper size="sm" value={p.target} min={1} max={60} suffix={unitLabel(ex)} onChange={(v) => setMainPlan(id, { target: v })} />
                    </div>
                  </div>
                  {restOpts.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-[11px] text-muted">세트 사이 휴식</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {restOpts.map((r) => (
                          <button key={r} type="button" onClick={() => setMainPlan(id, { rest: r })} aria-pressed={(p.rest ?? ex.restSec) === r}
                            className={`tabular h-9 rounded-sm text-[13px] font-semibold ${(p.rest ?? ex.restSec) === r ? 'bg-ink text-canvas' : 'border border-hairline'}`}>
                            {r >= 60 ? `${Math.floor(r / 60)}분${r % 60 ? ` ${r % 60}초` : ''}` : `${r}초`}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <button type="button" onClick={() => setInfo(id)} className="mt-3 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-2.5 text-[14px] font-medium">
                <span className="flex items-center gap-1.5"><BookOpen size={14} />자세 · 주의사항 · 단계 바꾸기</span>
                <ChevronRight size={15} className="text-muted" />
              </button>
            </Card>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">바꾼 목표는 이 운동이 있는 모든 요일에 적용됩니다. 오늘 이미 체크한 운동은 그대로 두고 다음부터 반영합니다.</p>

      <SectionTitle>주간 일정</SectionTitle>
      <Card>
        <ul className="divide-y divide-hairline-soft">
          {WEEK_ORDER.map((wd) => {
            const plan = state.schedule[wd];
            const rest = plan.items.length === 0;
            const mains = plan.items.filter((q) => (q.phase ?? 'main') === 'main').map((q) => getEx(q.exerciseId)?.name).join(' + ');
            return (
              <li key={wd}>
                <button type="button" disabled={rest} onClick={() => setDay(wd)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[14px] font-semibold ${wd === todayWd ? 'bg-primary text-on-primary' : rest ? 'bg-soft text-muted' : 'bg-strong'}`}>{WEEKDAYS[wd]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{rest ? '휴식' : plan.title}</span>
                    <span className="block truncate text-[13px] text-muted">{rest ? '본운동 없음' : mains}</span>
                  </span>
                  {!rest && <ChevronRight size={16} className="text-muted-soft" />}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <button type="button" onClick={() => { if (confirm('본운동 목표와 일정을 처음 값으로 되돌릴까요? 기록과 난도 단계는 그대로 남습니다.')) resetSchedule(); }}
        className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] text-muted"><RotateCcw size={13} />처음 목표로 되돌리기</button>

      <PurposeCard />

      <Sheet open={!!infoEx} onClose={() => setInfo(null)} title={infoEx?.name ?? ''}>
        {infoEx && <ExerciseInfo ex={infoEx} />}
      </Sheet>

      <Sheet open={!!dayPlan} onClose={() => setDay(null)} title={day !== null ? `${WEEKDAYS[day]}요일 · ${DAY_KIND[day]}` : ''}>
        {dayPlan && (
          <div>
            <p className="text-[14px] text-muted">{dayPlan.title}{dayPlan.time ? ` · ${dayPlan.time}` : ''}</p>
            {(['warmup', 'main', 'cool'] as const).map((ph) => {
              const its = dayPlan.items.filter((q) => (q.phase ?? 'main') === ph);
              if (!its.length) return null;
              return (
                <div key={ph}>
                  <p className="mb-2 mt-5 text-[13px] font-semibold text-muted">{PHASE_LABEL[ph]}</p>
                  <ul className="space-y-1.5">
                    {its.map((q) => <DayItem key={q.exerciseId + ph} id={q.exerciseId} text={ph === 'main' ? (getEx(q.exerciseId)?.interval ? '단계에 따라' : `${q.sets}세트 × ${formatTarget(getEx(q.exerciseId)!, q.target)}`) : formatTarget(getEx(q.exerciseId)!, q.target)} />)}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Sheet>
    </div>
  );
}

function DayItem({ id, text }: { id: string; text: string }) {
  const ex = getEx(id);
  const [open, setOpen] = useState(false);
  if (!ex) return null;
  return (
    <li className="rounded-sm border border-hairline">
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-3 p-2.5 text-left">
        <span className="grid h-[48px] w-[60px] shrink-0 place-items-center rounded-sm bg-soft"><ExerciseArt art={ex.art} className="h-[42px] w-[54px]" /></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold">{ex.name}</span>
          <span className="tabular block text-[12px] text-muted">{text}</span>
        </span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="border-t border-hairline-soft p-3"><FigureDemo art={ex.art} /><div className="mt-4"><ExerciseInfo ex={ex} demo={false} /></div></div>}
    </li>
  );
}

function PurposeCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SectionTitle>나의 운동 목표</SectionTitle>
      <Card className="p-4">
        <ul className="space-y-1.5 text-[14px] leading-[1.55] text-body">
          <li>· 전신 근력 향상과 근육 발달, 체형 개선</li>
          <li>· 맨몸 풀업 0회 → 1회 → 3회 → 5회</li>
          <li>· 주 1회 달리기로 20~30분 이어 달리는 체력</li>
          <li>· 관절은 아프지 않게 — 근육이 힘든 것과 관절이 아픈 것은 다릅니다</li>
        </ul>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="mt-4 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-3 text-[14px] font-medium">
          <span className="flex items-center gap-1.5"><SlidersHorizontal size={14} />이 프로그램이 성장하는 방식</span>
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <ul className="space-y-2 px-1 pt-3 text-[14px] leading-[1.6] text-body">
            <li>· 세트는 1~3회 더 할 수 있을 때 끝냅니다. 매번 한계까지 하지 않습니다.</li>
            <li>· 같은 단계에서 두 번 연속 모든 세트를 목표대로 마치면 목표를 1~2회 올리자고 제안합니다.</li>
            <li>· 목표 범위의 끝(예: 스쿼트 20회)에 닿으면 같은 운동을 더 어렵게 하는 다음 단계를 제안합니다.</li>
            <li>· 제안은 적용을 눌러야만 바뀌고, 통증이 기록된 운동은 제안하지 않습니다.</li>
          </ul>
        )}
      </Card>
    </>
  );
}
