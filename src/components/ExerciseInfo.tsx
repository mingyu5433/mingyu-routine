import { AlertTriangle, Ban, Crosshair, Lightbulb, PersonStanding, Wind } from 'lucide-react';
import type { Exercise } from '../types';
import { Chip } from './ui';

/** 운동 방법 · 잘못된 자세 · 주의사항 · 호흡법 · 초보자 팁 */
export function ExerciseInfo({ ex }: { ex: Exercise }) {
  return (
    <div className="space-y-5 text-[14px] leading-[1.6] text-body">
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
      {ex.moves && ex.moves.length > 0 && (
        <section>
          <h4 className="mb-2 text-[14px] font-semibold text-ink">순서대로 따라 하기</h4>
          <ol className="space-y-2.5">
            {ex.moves.map((m, k) => (
              <li key={m.name} className="rounded-sm border border-hairline p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="text-[14px] font-semibold text-ink"><span className="tabular mr-1.5 text-primary">{k + 1}</span>{m.name}</p>
                  <span className="shrink-0 rounded-full bg-strong px-2 py-0.5 text-[11px] font-semibold text-ink">{m.dose}</span>
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
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><AlertTriangle size={15} className="text-error" />주의사항</h4>
        <ul className="space-y-1.5">{ex.cautions.map((t, k) => <li key={k} className="flex gap-2"><span className="text-muted-soft">–</span>{t}</li>)}</ul>
      </section>
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Wind size={15} />호흡법</h4>
        <p>{ex.breathing}</p>
      </section>
      <section>
        <h4 className="mb-2 flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Lightbulb size={15} />초보자 팁</h4>
        <ul className="space-y-1.5">{ex.tips.map((t, k) => <li key={k} className="flex gap-2"><span className="text-muted-soft">–</span>{t}</li>)}</ul>
      </section>
    </div>
  );
}
