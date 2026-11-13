import { AlertTriangle, ArrowLeftRight, Ban, Check, Crosshair, Lightbulb, PersonStanding, SlidersHorizontal, Wind } from 'lucide-react';
import type { Exercise } from '../types';
import { Chip } from './ui';
import { FigureDemo, FigureStill } from '../figure/Figure';
import { useStore } from '../lib/store';
import { levelOf } from '../lib/plan';

/** 운동 방법 · 잘못된 자세 · 주의사항 · 호흡법 · 초보자 팁 */
export function ExerciseInfo({ ex, demo = true }: { ex: Exercise; demo?: boolean }) {
  const store = useStore();
  const knee = false;
  const lvNow = levelOf(store.state, ex) ?? 0;
  const moves = ex.moves;
  return (
    <div className="space-y-5 text-[14px] leading-[1.6] text-body">
      {demo && !ex.moves?.length && <FigureDemo art={ex.art} />}
      <div>
        <p className="text-ink">{ex.summary}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ex.range && <Chip>권장 {ex.range}</Chip>}
          {ex.stage && <Chip tone="primary">{ex.stage}</Chip>}
        </div>
      </div>
      {ex.start && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><PersonStanding size={15} />시작 자세</h4>
          <p>{ex.start}</p>
        </section>
      )}
      {ex.steps.length > 0 && (
        <section>
          <h4 className="mb-2 text-[14px] font-semibold text-ink">움직이는 방법</h4>
          <ol className="space-y-2">
            {ex.steps.map((t, k) => (
              <li key={k} className="flex gap-2.5">
                <span className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-strong text-[11px] font-semibold text-ink">{k + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      {ex.feel && (
        <p className="flex gap-2 rounded-sm bg-primary-tint px-3 py-2.5 text-[13px] leading-[1.55] text-primary">
          <Crosshair size={15} className="mt-0.5 shrink-0" /><span><b>여기가 느껴지면 정상</b> · {ex.feel}</span>
        </p>
      )}
      {moves && moves.length > 0 && (
        <section>
          <h4 className="mb-2 text-[14px] font-semibold text-ink">순서대로 따라 하기</h4>
          {knee && ex.moves!.length !== moves.length && <p className="mb-2 text-[12px] text-muted">무릎 회복 모드라 무릎을 깊게 굽히는 스트레칭은 뺐습니다.</p>}
          <ol className="space-y-2.5">
            {moves.map((m, k) => (
              <li key={m.name} className="rounded-sm border border-hairline p-3">
                <div className="flex gap-3">
                  {m.art && (
                    <div className="grid h-[72px] w-[92px] shrink-0 place-items-center rounded-sm bg-soft">
                      <FigureStill art={m.art} className="h-[64px] w-[86px]" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold leading-[1.35] text-ink"><span className="tabular mr-1.5 text-primary">{k + 1}</span>{m.name}</p>
                    <span className="mt-1 inline-block rounded-full bg-strong px-2 py-0.5 text-[11px] font-semibold text-ink">{m.dose}</span>
                  </div>
                </div>
                <ul className="mt-1.5 space-y-1">{m.how.map((h) => <li key={h} className="flex gap-2"><span className="text-muted-soft">–</span>{h}</li>)}</ul>
                <p className="mt-1.5 text-[12px] text-primary">느껴지는 곳 · {m.feel}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
      {ex.mistakes && ex.mistakes.length > 0 && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Ban size={15} className="text-error" />이렇게 하지 마세요</h4>
          <ul className="space-y-1.5">{ex.mistakes.map((t, k) => <li key={k} className="flex gap-2"><span className="text-error">×</span>{t}</li>)}</ul>
        </section>
      )}
      {ex.cautions.length > 0 && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><AlertTriangle size={15} className="text-error" />주의사항</h4>
          <ul className="space-y-1.5">{ex.cautions.map((t, k) => <li key={k} className="flex gap-2"><span className="text-muted-soft">–</span>{t}</li>)}</ul>
        </section>
      )}
      {ex.alt && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><ArrowLeftRight size={15} />대체 운동</h4>
          <p>{ex.alt}</p>
        </section>
      )}
      {ex.levels && ex.levels.length > 0 && (
        <section>
          <h4 className="mb-1 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><SlidersHorizontal size={15} />난도 조절</h4>
          <p className="mb-2 text-[12px] text-muted">{ex.interval ? '지금 단계를 직접 바꿀 수 있습니다. 단계에 맞춰 달리는 시간이 정해집니다.' : '지금 단계를 직접 바꿀 수 있습니다. 목표 횟수는 그대로 두니, 필요하면 운동 탭에서 함께 바꿔 주세요. 단계가 바뀌면 성장 그래프도 따로 비교합니다.'}</p>
          <ol className="space-y-1.5">
            {ex.levels.map((l, i) => (
              <li key={l.name}>
                <button type="button" disabled={i === lvNow}
                  onClick={() => { if (confirm(`난도를 '${l.name}'(으)로 바꿀까요?`)) store.setExState(ex.id, { lv: i }); }}
                  className={`flex w-full gap-2.5 rounded-sm border px-3 py-2.5 text-left ${i === lvNow ? 'border-primary bg-primary-tint' : 'border-hairline'}`}>
                  <span className={`tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${i === lvNow ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>{i === lvNow ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                  <span><b className="text-ink">{l.name}</b>{i === lvNow ? ' · 지금 단계' : ''}<br /><span className="text-[13px] text-muted">{l.how}</span></span>
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Wind size={15} />호흡법</h4>
        <p>{ex.breathing}</p>
      </section>
      {ex.tips.length > 0 && (
        <section>
          <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Lightbulb size={15} />초보자 팁</h4>
          <ul className="space-y-1.5">{ex.tips.map((t, k) => <li key={k} className="flex gap-2"><span className="text-muted-soft">–</span>{t}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
