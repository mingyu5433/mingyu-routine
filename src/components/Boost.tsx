import { RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MILESTONES, MOTIVATION } from '../data/motivation';
import { addDays, diffDays, parts } from '../lib/date';
import { useStore } from '../lib/store';
import { Sheet } from './ui';

const pick = (except?: number) => {
  let i = Math.floor(Math.random() * MOTIVATION.length);
  if (i === except) i = (i + 1) % MOTIVATION.length;
  return i;
};

/** 동기부여 버튼 → 무작위 메시지 */
export function MotivationSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(() => pick());
  const [n, setN] = useState(0);
  useEffect(() => { if (open) { setIdx((cur) => pick(cur)); setN((v) => v + 1); } }, [open]);
  const m = MOTIVATION[idx];
  return (
    <Sheet open={open} onClose={onClose} title="동기부여">
      <div key={n} className="animate-rise flex min-h-[220px] flex-col justify-center rounded-md bg-ink px-6 py-8 text-canvas">
        <span className="mb-4 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-on-primary">
          <Sparkles size={11} />{m.tag}
        </span>
        <p className="text-[22px] font-semibold leading-[1.45] tracking-[-0.44px]">{m.text}</p>
      </div>
      <button type="button" onClick={() => { setIdx(pick(idx)); setN((v) => v + 1); }}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-primary text-[16px] font-medium text-on-primary active:bg-primary-active">
        <RefreshCw size={16} /> 다른 메시지
      </button>
      <p className="mt-3 text-center text-[12px] text-muted">{MOTIVATION.length}개의 메시지가 무작위로 나옵니다</p>
    </Sheet>
  );
}

/** 한 달 · 12월 20일 · 크리스마스 · 세 달 · 네 달 변화 미리보기 */
export function ChangePreviewSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, today } = useStore();
  const start = state.settings.startDate;
  const items = MILESTONES.map((m) => {
    const date = m.days !== null ? addDays(start, m.days) : m.fixedDate === 'goal' ? state.settings.goalDate : m.fixedDate!;
    return { ...m, date };
  }).sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <Sheet open={open} onClose={onClose} title="꾸준히 하면 이렇게 바뀝니다">
      <p className="text-[14px] leading-[1.6] text-body">프로그램을 꾸준히 따라갔을 때 많은 초보자에게서 나타나는 변화의 방향입니다. 속도는 사람마다 다릅니다.</p>
      <ol className="relative mt-6 space-y-6 border-l-2 border-hairline pl-6">
        {items.map((m) => {
          const left = diffDays(m.date, today);
          const passed = left < 0;
          const { m: mm, d } = parts(m.date);
          return (
            <li key={m.key} className="relative">
              <span className={`absolute -left-[33px] top-0.5 grid h-4 w-4 place-items-center rounded-full border-2 ${passed ? 'border-primary bg-primary' : m.key === 'goal' ? 'border-primary bg-canvas' : 'border-border-strong bg-canvas'}`} />
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h4 className={`text-[18px] font-semibold ${m.key === 'goal' ? 'text-primary' : ''}`}>{m.title}</h4>
                <span className="tabular text-[13px] text-muted">{mm}월 {d}일 · {passed ? '지남' : left === 0 ? '오늘' : `D-${left}`}</span>
              </div>
              <p className="mt-1 text-[15px] font-medium text-ink">{m.headline}</p>
              <ul className="mt-2 space-y-1.5 text-[14px] leading-[1.6] text-body">
                {m.points.map((p) => <li key={p} className="flex gap-2"><span className="text-muted-soft">–</span>{p}</li>)}
              </ul>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 rounded-sm bg-soft p-3.5 text-[12px] leading-[1.6] text-muted">
        위 내용은 연구에서 흔히 보고되는 경향과 프로그램 목표를 바탕으로 한 안내이며 결과를 보장하지 않습니다. 변화의 크기는 수면, 식사(특히 단백질), 통증 관리, 꾸준함에 따라 달라집니다.
      </p>
    </Sheet>
  );
}
