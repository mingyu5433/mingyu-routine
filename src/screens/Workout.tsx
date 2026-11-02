import { ChevronDown, ChevronRight, Target } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../lib/store';
import { CATEGORY_LABEL, EXERCISES, formatTarget, getEx, unitLabel } from '../data/exercises';
import { WEEKDAYS, WEEK_ORDER } from '../data/schedule';
import { ExerciseArt } from '../components/ExerciseArt';
import { FigureDemo } from '../figure/Figure';
import { ExerciseInfo } from '../components/ExerciseInfo';
import { Card, Chip, PrimaryButton, SectionTitle, Segmented, Sheet, Stepper } from '../components/ui';
import { ScheduleView } from './Schedule';
import type { Category } from '../types';
import { PROGRAM } from '../data/program';
import { levelFor } from '../lib/progress';
import { stepAt } from '../data/program';

const CAT_ORDER: Category[] = ['strength', 'pull', 'cardio', 'warmup', 'mobility'];

export function WorkoutScreen() {
  const [view, setView] = useState<'schedule' | 'library'>('schedule');
  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-bold leading-[1.3]">운동</h1>
      </header>
      <div className="mt-4">
        <Segmented value={view} onChange={setView}
          options={[{ value: 'schedule', label: '주간 일정' }, { value: 'library', label: '운동 목록' }]} />
      </div>
      {view === 'schedule' ? <ScheduleView /> : <LibraryView />}
    </div>
  );
}

function LibraryView() {
  const { state } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const daysOf = (id: string) => WEEK_ORDER.filter((wd) => state.schedule[wd].items.some((p) => p.exerciseId === id));

  return (
    <div>
      {CAT_ORDER.map((cat) => (
        <section key={cat}>
          <SectionTitle>{CATEGORY_LABEL[cat]}</SectionTitle>
          <div className="space-y-2.5">
            {EXERCISES.filter((e) => e.category === cat).map((e) => {
              const days = daysOf(e.id);
              return (
                <button key={e.id} type="button" onClick={() => setSel(e.id)}
                  className="flex w-full items-center gap-3.5 rounded-md border border-hairline p-3 text-left">
                  <div className="grid h-[60px] w-[76px] shrink-0 place-items-center rounded-sm bg-soft">
                    <ExerciseArt art={e.art} className="h-[52px] w-[70px]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{e.name}</p>
                    <p className="truncate text-[13px] text-muted">{e.part}</p>
                    <p className="mt-0.5 truncate text-[12px] text-muted-soft">
                      {days.length ? days.map((d) => WEEKDAYS[d]).join(' · ') : e.stage ? '단계에 따라 추가' : '일정에 없음'}
                    </p>
                  </div>
                  <ChevronRight size={18} className="shrink-0 text-muted" />
                </button>
              );
            })}
          </div>
        </section>
      ))}
      <PurposeCard />
      <ExerciseDetail id={sel} onClose={() => setSel(null)} />
    </div>
  );
}

function ExerciseDetail({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { state, today, setDayPlan, setExerciseGoalAll } = useStore();
  const managed = !!id && state.settings.autoProgram && !!PROGRAM[id];
  const nowStep = managed && id ? stepAt(id, levelFor(state, id, today).level) : null;
  const ex = id ? getEx(id) : undefined;
  const current = id ? WEEK_ORDER.flatMap((wd) => state.schedule[wd].items.filter((p) => p.exerciseId === id)) : [];
  const [goal, setGoal] = useState<{ id: string; sets: number; target: number } | null>(null);
  const g = goal && goal.id === id ? goal : ex ? { id: ex.id, sets: current[0]?.sets ?? ex.defaultSets, target: current[0]?.target ?? ex.defaultTarget } : null;
  const [saved, setSaved] = useState(false);

  const toggleDay = (wd: number) => {
    if (!ex || !g) return;
    const plan = state.schedule[wd];
    const has = plan.items.some((p) => p.exerciseId === ex.id);
    if (has) {
      setDayPlan(wd, { ...plan, items: plan.items.filter((p) => p.exerciseId !== ex.id) });
      return;
    }
    const item = { exerciseId: ex.id, sets: g.sets, target: g.target };
    const items = [...plan.items];
    // 준비운동은 앞쪽(준비운동 묶음 끝)에, 유산소·회복은 맨 뒤에, 나머지는 유산소 앞에 넣습니다
    const isLate = (cid: string) => ['cardio', 'mobility'].includes(getEx(cid)?.category ?? '');
    let at = items.length;
    if (ex.category === 'warmup') at = items.filter((p) => getEx(p.exerciseId)?.category === 'warmup').length;
    else if (!isLate(ex.id)) { const k = items.findIndex((p) => isLate(p.exerciseId)); if (k >= 0) at = k; }
    items.splice(at, 0, item);
    setDayPlan(wd, { title: plan.items.length ? plan.title : `${ex.name} 하는 날`, items });
  };

  return (
    <Sheet open={!!ex} onClose={() => { onClose(); setSaved(false); setGoal(null); }} title={ex?.name ?? ''}>
      {ex && g && (
        <div>
          <FigureDemo art={ex.art} />
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            <Chip tone="ink">{CATEGORY_LABEL[ex.category]}</Chip>
            <Chip>{ex.part}</Chip>
          </div>

          <div className="mt-5 rounded-md border border-hairline p-4">
            <p className="flex items-center gap-1.5 text-[14px] font-semibold"><Target size={15} />목표</p>
            {managed && (
              <p className="mt-2 rounded-sm bg-primary-tint px-3 py-2.5 text-[13px] leading-[1.5] text-primary">
                추천 프로그램이 기록을 보고 매주 목표를 정합니다.{nowStep ? ` 지금 단계: ${nowStep.sets}세트 × ${formatTarget(ex, nowStep.target)}` : ''}
                {' '}직접 정하려면 설정에서 추천 프로그램을 꺼 주세요.
              </p>
            )}
            {!managed && <>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div>
                <p className="mb-1 text-[11px] text-muted">세트</p>
                <Stepper size="sm" value={g.sets} min={1} max={10} onChange={(v) => { setGoal({ ...g, sets: v }); setSaved(false); }} />
              </div>
              <div className="text-right">
                <p className="mb-1 text-[11px] text-muted">세트당{ex.perSide ? ' (좌우 각)' : ''}</p>
                <Stepper size="sm" value={g.target} min={1} suffix={unitLabel(ex)} onChange={(v) => { setGoal({ ...g, target: v }); setSaved(false); }} />
              </div>
            </div>
            {current.length > 0 ? (
              <PrimaryButton className="mt-4 w-full" onClick={() => { setExerciseGoalAll(ex.id, g.sets, g.target); setSaved(true); }}>
                {saved ? '저장했습니다' : `포함된 모든 요일에 적용 (${g.sets}세트 × ${formatTarget(ex, g.target)})`}
              </PrimaryButton>
            ) : (
              <p className="mt-3 text-[12px] text-muted">아래에서 요일을 선택하면 이 목표로 일정에 추가됩니다.</p>
            )}
            </>}
            <p className="mt-3 text-[14px] font-medium">하는 요일</p>
            <div className="mt-2 flex gap-1.5">
              {WEEK_ORDER.map((wd) => {
                const on = state.schedule[wd].items.some((p) => p.exerciseId === ex.id);
                return (
                  <button key={wd} type="button" onClick={() => toggleDay(wd)} aria-pressed={on}
                    className={`h-10 flex-1 rounded-full text-[14px] font-semibold ${on ? 'bg-ink text-canvas' : 'border border-hairline text-muted'}`}>
                    {WEEKDAYS[wd]}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-muted">오늘 이미 체크한 세트가 있으면 오늘 기록은 그대로 두고 다음부터 반영됩니다.</p>
          </div>

          <div className="mt-6"><ExerciseInfo ex={ex} demo={false} /></div>
        </div>
      )}
    </Sheet>
  );
}

function PurposeCard() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <SectionTitle>나의 운동 목적</SectionTitle>
      <Card className="p-4">
        <ul className="space-y-2 text-[14px] leading-[1.55] text-body">
          <li>· 말린 어깨와 앞쪽 어깨 통증을 고려하며 푸쉬업 능력 향상</li>
          <li>· 풀업 0개에서 시작해 첫 풀업 달성, 등 근육 성장</li>
          <li>· 스쿼트로 하체 근력 강화</li>
          <li>· 힙 브리지 · 데드버그로 둔근 · 코어 · 골반 안정성 향상</li>
          <li>· 유산소 운동으로 심폐지구력과 혈관 건강 개선</li>
          <li>· 전반적인 체력 향상과 성관계 시 필요한 신체 기능 개선</li>
        </ul>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}
          className="mt-4 flex w-full items-center justify-between rounded-sm bg-soft px-3.5 py-3 text-[14px] font-medium">
          운동과 성기능, 무엇이 확인되었나요?
          <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="space-y-4 px-1 pt-4 text-[14px] leading-[1.65] text-body">
            <section>
              <h4 className="font-semibold text-ink">유산소 운동 — 혈관 건강을 통한 연관성</h4>
              <p className="mt-1">규칙적인 유산소 운동은 심혈관 건강 개선에 도움이 된다는 근거가 많습니다. 발기 기능은 혈관 건강과 밀접하게 관련되어 있어, 일부 연구에서 꾸준한 유산소 운동과 발기 기능 개선 사이의 연관성이 보고되었습니다. 다만 효과의 크기는 개인차가 크고, 모든 사람에게 개선이 확인된 것은 아닙니다.</p>
            </section>
            <section>
              <h4 className="font-semibold text-ink">근력 운동 — 간접적인 도움</h4>
              <p className="mt-1">스쿼트, 힙 브리지, 데드버그 같은 운동은 하체 · 둔근 · 코어의 근력과 지구력, 자세 유지 능력을 높여 전반적인 신체 활동을 수월하게 하는 데 도움이 될 수 있습니다. 이것이 성기능 자체를 직접 개선한다는 의학적 근거로 확인된 것은 아니므로, 간접적인 체력 향상으로 이해하는 것이 정확합니다.</p>
            </section>
            <section>
              <h4 className="font-semibold text-ink">이 앱이 약속하지 않는 것</h4>
              <p className="mt-1">이 앱은 특정 기능의 개선을 보장하지 않으며 진단이나 치료를 대신하지 않습니다. 증상이 지속되거나 걱정된다면 비뇨의학과 등 전문의와 상담해 주세요.</p>
            </section>
          </div>
        )}
      </Card>
    </>
  );
}
