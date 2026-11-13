import { Pause, Play, Square } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { chime, haptic, unlockAudio } from '../lib/feedback';

interface Seg { kind: 'run' | 'walk'; sec: number; round: number }
interface Saved { startAt: number; pausedAt: number | null; pausedTotal: number }

const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

function load(key: string): Saved | null {
  try { const r = localStorage.getItem(`mingyu-routine:interval:${key}`); return r ? JSON.parse(r) as Saved : null; } catch { return null; }
}
function persist(key: string, v: Saved | null) {
  try {
    if (v) localStorage.setItem(`mingyu-routine:interval:${key}`, JSON.stringify(v));
    else localStorage.removeItem(`mingyu-routine:interval:${key}`);
  } catch { /* 저장 불가 환경 */ }
}

/** 달리기·걷기 인터벌 타이머 — 시작 시각 기준으로 계산해 화면이 꺼져도 정확합니다 */
export function IntervalTimer({ storeKey, run, walk, rounds, onFinish }: { storeKey: string; run: number; walk: number; rounds: number; onFinish: () => void }) {
  const segs = useMemo<Seg[]>(() => {
    const out: Seg[] = [];
    for (let r = 1; r <= rounds; r++) {
      out.push({ kind: 'run', sec: run, round: r });
      if (walk > 0 && r < rounds) out.push({ kind: 'walk', sec: walk, round: r });
    }
    return out;
  }, [run, walk, rounds]);
  const total = segs.reduce((a, s) => a + s.sec, 0);
  const [saved, setSaved] = useState<Saved | null>(() => load(storeKey));
  const [now, setNow] = useState(Date.now());
  const lastSeg = useRef(-1);

  const elapsed = saved ? ((saved.pausedAt ?? now) - saved.startAt - saved.pausedTotal) / 1000 : 0;
  let acc = 0, idx = segs.length - 1;
  for (let i = 0; i < segs.length; i++) { if (elapsed < acc + segs[i].sec) { idx = i; break; } acc += segs[i].sec; }
  const seg = segs[idx];
  const left = Math.max(0, acc + seg.sec - elapsed);
  const finished = !!saved && elapsed >= total;
  const running = !!saved && saved.pausedAt === null && !finished;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (!running) { lastSeg.current = idx; return; }
    if (lastSeg.current !== -1 && lastSeg.current !== idx) { haptic([60, 80, 60]); chime(); }
    lastSeg.current = idx;
  }, [idx, running]);
  useEffect(() => {
    if (finished) { haptic([80, 80, 80, 80, 160]); chime(); persist(storeKey, null); onFinish(); }
  }, [finished]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (v: Saved | null) => { setSaved(v); persist(storeKey, v); setNow(Date.now()); };
  const start = () => { unlockAudio(); set({ startAt: Date.now(), pausedAt: null, pausedTotal: 0 }); };
  const toggle = () => {
    if (!saved) return start();
    if (saved.pausedAt === null) set({ ...saved, pausedAt: Date.now() });
    else set({ ...saved, pausedTotal: saved.pausedTotal + (Date.now() - saved.pausedAt), pausedAt: null });
  };

  const isRun = seg.kind === 'run';
  return (
    <div className={`mt-3 rounded-sm p-4 ${saved ? (isRun ? 'bg-primary text-on-primary' : 'bg-ink text-canvas') : 'bg-soft'}`}>
      {saved ? (
        <>
          <div className="flex items-baseline justify-between">
            <p className="text-[15px] font-semibold">{isRun ? '달리기' : '걷기'} <span className="tabular text-[13px] font-medium opacity-80">{seg.round} / {rounds}</span></p>
            <p className="tabular text-[13px] opacity-80">전체 {mmss(Math.min(total, elapsed))} / {mmss(total)}</p>
          </div>
          <p className="tabular mt-1 text-[44px] font-bold leading-none tracking-[-1px]">{mmss(left)}</p>
          <div className="mt-3 flex h-1.5 gap-0.5 overflow-hidden rounded-full">
            {segs.map((s, i) => (
              <span key={i} style={{ flexGrow: s.sec }} className={`h-full ${i < idx ? 'bg-white/90' : i === idx ? 'bg-white/60' : 'bg-white/25'}`} />
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button type="button" onClick={toggle} className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-sm bg-white/20 text-[14px] font-semibold">
              {saved.pausedAt === null ? <><Pause size={15} fill="currentColor" />일시정지</> : <><Play size={15} fill="currentColor" />계속</>}
            </button>
            <button type="button" onClick={() => { if (confirm('인터벌을 끝낼까요? 달린 시간은 직접 기록할 수 있습니다.')) set(null); }}
              className="flex h-11 items-center justify-center gap-1.5 rounded-sm bg-white/20 px-4 text-[14px] font-semibold"><Square size={13} fill="currentColor" />끝내기</button>
          </div>
        </>
      ) : (
        <button type="button" onClick={start} className="flex w-full items-center justify-between text-left">
          <span>
            <span className="block text-[15px] font-semibold">인터벌 타이머</span>
            <span className="block text-[12px] text-muted">달리기 {mmss(run)}{walk ? ` · 걷기 ${mmss(walk)}` : ''} × {rounds} · 전환할 때 알려 드립니다</span>
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-on-primary"><Play size={17} fill="currentColor" /></span>
        </button>
      )}
    </div>
  );
}
