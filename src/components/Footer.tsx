import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { computeStats } from '../lib/stats';
import { diffDays, parts } from '../lib/date';
import { MOTIVATION } from '../data/motivation';

/** 모든 화면 맨 아래: 나에게 한 마디(직접 쓴 문장 또는 무작위 동기부여) + 실제 기록으로 만든 한 줄 */
export function Footer({ tab }: { tab: string }) {
  const { state, today } = useStore();
  const st = useMemo(() => computeStats(state, today), [state, today]);
  const own = state.settings.selfNote?.trim();
  // 탭을 옮길 때마다 다른 문장
  const [seed] = useState(() => Math.floor(Math.random() * 1000));
  const line = own || MOTIVATION[(seed + tab.length * 7) % MOTIVATION.length].text;
  const start = parts(state.settings.startDate);
  const dayN = diffDays(today, state.settings.startDate) + 1;

  const fact = st.totalDays === 0
    ? `${start.m}월 ${start.d}일, 민규의 루틴이 시작됐다. 첫 세트가 첫 기록이 된다.`
    : `${start.m}월 ${start.d}일에 시작한 지 ${dayN}일째. 민규는 지금까지 ${st.totalDays}일 동안 ${st.totalSets.toLocaleString()}세트를 해냈다.${st.streak >= 2 ? ` 지금 ${st.streak}일 연속.` : ''}`;

  return (
    <footer className="px-6 pb-4 pt-10 text-center">
      <div className="mx-auto mb-5 h-px w-10 bg-hairline" />
      <p className="text-[16px] font-semibold leading-[1.5] tracking-[-0.2px] text-ink">“{line}”</p>
      <p className="mx-auto mt-2 max-w-[320px] text-[12px] leading-[1.6] text-muted">{fact}</p>
    </footer>
  );
}
