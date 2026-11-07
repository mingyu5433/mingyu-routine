import { Pause, Play, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store';
import { chime, haptic } from '../lib/feedback';

/**
 * 휴식 타이머. 종료 예정 시각(endAt)을 저장해 두고 매 틱마다 남은 시간을 계산하므로,
 * iOS에서 앱이 백그라운드로 가서 setInterval이 멈춰도 돌아왔을 때 정확한 시간이 표시됩니다.
 */
export function RestTimer({ offset = 'bottom-[calc(68px+env(safe-area-inset-bottom))]', z = 'z-40' }: { offset?: string; z?: string }) {
  const { state, pauseTimer, resumeTimer, addTimer, stopTimer } = useStore();
  const t = state.timer;
  const [now, setNow] = useState(Date.now());
  const [finished, setFinished] = useState(false);
  const firedFor = useRef<number | null>(null);

  useEffect(() => {
    if (!t) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', tick); };
  }, [t]);

  const left = t ? (t.pausedLeft ?? Math.max(0, t.endAt - now)) : 0;
  const ended = !!t && t.pausedLeft === null && left <= 0;

  useEffect(() => {
    if (!t || !ended || firedFor.current === t.endAt) return;
    firedFor.current = t.endAt;
    // 앱이 화면에 있을 때만 소리/진동 (백그라운드에서 끝난 경우 돌아오면 완료 상태만 표시)
    if (document.visibilityState === 'visible' && Date.now() - t.endAt < 3000) {
      if (state.settings.sound) chime();
      if (state.settings.haptic) haptic([120, 80, 120]);
    }
    setFinished(true);
    const id = setTimeout(() => { setFinished(false); stopTimer(); }, 2500);
    return () => clearTimeout(id);
  }, [ended, t, state.settings.sound, state.settings.haptic, stopTimer]);

  if (!t) return null;
  const secLeft = Math.ceil(left / 1000);
  const pct = t.total > 0 ? Math.min(1, left / (t.total * 1000)) : 0;
  const mm = Math.floor(secLeft / 60);
  const ss = String(secLeft % 60).padStart(2, '0');
  const R = 22, C = 2 * Math.PI * R;

  return (
    <div className={`pointer-events-none fixed inset-x-0 ${offset} ${z} flex justify-center px-4`}>
      <div className="animate-rise pointer-events-auto flex w-full max-w-[528px] items-center gap-3 rounded-full border border-hairline bg-canvas py-2 pl-2 pr-2 shadow-float">
        <div className="relative h-[52px] w-[52px] shrink-0">
          <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
            <circle cx="26" cy="26" r={R} fill="none" stroke="var(--c-surface-strong)" strokeWidth="4" />
            <circle cx="26" cy="26" r={R} fill="none" stroke="var(--c-primary)" strokeWidth="4" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
          </svg>
          <span className="tabular absolute inset-0 grid place-items-center text-[13px] font-semibold">{finished ? '끝' : `${mm}:${ss}`}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-muted">{finished ? '휴식 끝' : t.pausedLeft !== null ? '일시정지' : '휴식 중'}</p>
          <p className="truncate text-[14px] font-medium">{finished ? '다음 세트를 시작해 보세요' : t.label}</p>
        </div>
        {!finished && (
          <>
            <button onClick={() => addTimer(15)} className="h-10 rounded-full bg-strong px-3 text-[13px] font-semibold tabular" aria-label="15초 추가">+15</button>
            <button onClick={() => (t.pausedLeft !== null ? resumeTimer() : pauseTimer())}
              aria-label={t.pausedLeft !== null ? '재시작' : '일시정지'}
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-canvas">
              {t.pausedLeft !== null ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
            </button>
            <button onClick={stopTimer} aria-label="건너뛰기" className="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary">
              <SkipForward size={16} fill="currentColor" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
