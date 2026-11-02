import { AlertTriangle, Ban, Lightbulb, Wind } from 'lucide-react';
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
      <section>
        <h4 className="mb-2 text-[14px] font-semibold text-ink">운동 방법</h4>
        <ol className="space-y-2">
          {ex.steps.map((t, k) => (
            <li key={k} className="flex gap-2.5">
              <span className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-strong text-[11px] font-semibold text-ink">{k + 1}</span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
      </section>
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
