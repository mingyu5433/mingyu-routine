import { Pause, Play } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { blend, dir, points, solve, type P, type Pose, type Solved } from './pose';
import { getDemo, type Demo, type Prop } from './demos';

const C = {
  ink: 'var(--c-ink)',
  far: 'var(--c-muted-soft)',
  hl: 'var(--c-primary)',
  prop: 'var(--c-surface-strong)',
  propLine: 'var(--c-border-strong)',
  soft: 'var(--c-surface-soft)',
};
const W = { arm: 7.5, leg: 9.5, torso: 15, foot: 6 };

const pts = (...p: P[]) => p.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ');
const mid = (a: P, b: P): P => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

function Body({ s, halo = 'var(--c-surface-soft)' }: { s: Solved; halo?: string }) {
  const has = (h: string) => s.hl.includes(h as never);
  const neckBase: P = [s.sh[0] + (s.head[0] - s.sh[0]) * 0.45, s.sh[1] + (s.head[1] - s.sh[1]) * 0.45];
  const farCol = s.front ? C.ink : C.far;
  const torsoMid = mid(s.hip, s.sh);
  const upperHl = has('chest') || has('back') || has('shoulder');
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* 먼 쪽 팔다리 */}
      <polyline points={pts(s.hipF, s.knF, s.anF)} stroke={farCol} strokeWidth={W.leg} />
      <polyline points={pts(s.anF, s.toeF)} stroke={farCol} strokeWidth={W.foot} />
      <polyline points={pts(s.shF, s.elF, s.wrF)} stroke={farCol} strokeWidth={W.arm} />
      <circle cx={s.wrF[0]} cy={s.wrF[1]} r={3.8} fill={farCol} stroke="none" />
      {/* 몸통 · 목 · 머리 */}
      {s.front ? (
        <polygon points={pts(s.shN, s.shF, s.hipF, s.hipN)} fill={C.ink} stroke={C.ink} strokeWidth={8} />
      ) : (
        <line x1={s.hip[0]} y1={s.hip[1]} x2={s.sh[0]} y2={s.sh[1]} stroke={C.ink} strokeWidth={W.torso} />
      )}
      {upperHl && (s.front
        ? <polygon points={pts(s.shN, s.shF, mid(s.shF, s.hipF), mid(s.shN, s.hipN))} fill={C.hl} stroke={C.hl} strokeWidth={6} />
        : <line x1={torsoMid[0]} y1={torsoMid[1]} x2={s.sh[0]} y2={s.sh[1]} stroke={C.hl} strokeWidth={W.torso - 3} />)}
      {has('core') && (s.front
        ? <polygon points={pts(mid(s.shN, s.hipN), mid(s.shF, s.hipF), s.hipF, s.hipN)} fill={C.hl} stroke={C.hl} strokeWidth={6} />
        : <line x1={s.hip[0]} y1={s.hip[1]} x2={torsoMid[0]} y2={torsoMid[1]} stroke={C.hl} strokeWidth={W.torso - 3} />)}
      <line x1={s.sh[0]} y1={s.sh[1]} x2={neckBase[0]} y2={neckBase[1]} stroke={C.ink} strokeWidth={7} />
      <circle cx={s.head[0]} cy={s.head[1]} r={9.5} fill={halo} stroke="none" />
      <circle cx={s.head[0]} cy={s.head[1]} r={8} fill={C.ink} stroke="none" />
      {/* 가까운 쪽 팔다리 (몸통과 겹쳐도 보이도록 바탕색 테두리) */}
      <polyline points={pts(s.hipN, s.knN, s.anN, s.toeN)} stroke={halo} strokeWidth={W.leg + 3.5} />
      <polyline points={pts(s.hipN, s.knN, s.anN)} stroke={C.ink} strokeWidth={W.leg} />
      <polyline points={pts(s.anN, s.toeN)} stroke={C.ink} strokeWidth={W.foot} />
      {(has('thigh') || has('hamstring') || has('hipflexor')) && <line x1={s.hipN[0]} y1={s.hipN[1]} x2={s.knN[0]} y2={s.knN[1]} stroke={C.hl} strokeWidth={W.leg - 2.5} />}
      {has('calf') && <line x1={s.knN[0]} y1={s.knN[1]} x2={s.anN[0]} y2={s.anN[1]} stroke={C.hl} strokeWidth={W.leg - 2.5} />}
      {has('glute') && <circle cx={s.hip[0]} cy={s.hip[1]} r={6.5} fill={C.hl} stroke="none" />}
      <polyline points={pts(s.shN, s.elN, s.wrN)} stroke={halo} strokeWidth={W.arm + 3.5} />
      <circle cx={s.wrN[0]} cy={s.wrN[1]} r={5.6} fill={halo} stroke="none" />
      <polyline points={pts(s.shN, s.elN, s.wrN)} stroke={C.ink} strokeWidth={W.arm} />
      {has('arm') && <polyline points={pts(s.shN, s.elN)} stroke={C.hl} strokeWidth={W.arm - 2.5} />}
      {has('shoulder') && !s.front && <circle cx={s.sh[0]} cy={s.sh[1]} r={5.5} fill={C.hl} stroke="none" />}
      <circle cx={s.wrN[0]} cy={s.wrN[1]} r={3.8} fill={C.ink} stroke="none" />
    </g>
  );
}

function Props({ props, box, layer, s }: { props: Prop[]; box: [number, number, number, number]; layer: 'back' | 'front'; s?: Solved }) {
  const [x0, , w] = box;
  return (
    <g>
      {props.map((p, i) => {
        if (layer === 'back') {
          switch (p.t) {
            case 'backwall': return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={4} fill={C.soft} />;
            case 'floor': return <line key={i} x1={x0} x2={x0 + w} y1={p.y + 1} y2={p.y + 1} stroke={C.propLine} strokeWidth={2} />;
            case 'wall': return <rect key={i} x={p.x} y={p.y1} width={6} height={p.y2 - p.y1} fill={C.prop} stroke={C.propLine} strokeWidth={1.5} />;
            case 'post': return <rect key={i} x={p.x - 4} y={p.y1} width={8} height={p.y2 - p.y1} rx={2} fill={C.prop} stroke={C.propLine} strokeWidth={1.5} />;
            case 'box': return <rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={3} fill={C.prop} stroke={C.propLine} strokeWidth={1.5} />;
            case 'chair': return (
              <g key={i} stroke={C.propLine} strokeWidth={3} strokeLinecap="round" fill="none">
                <line x1={p.x} y1={p.y} x2={p.x + p.w} y2={p.y} strokeWidth={5} />
                <line x1={p.x + 3} y1={p.y} x2={p.x + 3} y2={p.floor} />
                <line x1={p.x + p.w - 3} y1={p.y} x2={p.x + p.w - 3} y2={p.floor} />
                <line x1={p.x + 2} y1={p.y} x2={p.x - 2} y2={p.y - 32} />
              </g>
            );
            case 'bar': return (
              <g key={i}>
                <rect x={p.x1 - 4} y={p.y - 8} width={6} height={16} rx={1.5} fill={C.prop} stroke={C.propLine} strokeWidth={1.5} />
                <rect x={p.x2 - 2} y={p.y - 8} width={6} height={16} rx={1.5} fill={C.prop} stroke={C.propLine} strokeWidth={1.5} />
                <line x1={p.x1} y1={p.y} x2={p.x2} y2={p.y} stroke={C.propLine} strokeWidth={4} strokeLinecap="round" />
              </g>
            );
            default: return null;
          }
        }
        switch (p.t) {
          case 'band': {
              if (!s) return null;
              const k = s.knN, k2: P = [s.knN[0] + 2, s.knN[1] + 5];
              return (
                <g key={i} stroke={C.hl} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.6}>
                  <polyline points={pts([p.x1, p.y], [k[0] - 1, k[1] + 4], k2, [p.x2, p.y])} />
                </g>
              );
            }
          case 'ring': return <circle key={i} cx={p.cx} cy={p.cy} r={p.r} fill="none" stroke={C.hl} strokeWidth={1.6} strokeDasharray="4 4" opacity={0.7} />;
          case 'arrow': {
            const ang = (Math.atan2(p.b[1] - p.a[1], p.b[0] - p.a[0]) * 180) / Math.PI;
            const l = dir(ang + 150), r = dir(ang - 150);
            return (
              <g key={i} stroke={C.hl} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <line x1={p.a[0]} y1={p.a[1]} x2={p.b[0]} y2={p.b[1]} />
                <polyline points={pts([p.b[0] + l[0] * 6, p.b[1] + l[1] * 6], p.b, [p.b[0] + r[0] * 6, p.b[1] + r[1] * 6])} />
              </g>
            );
          }
          default: return null;
        }
      })}
    </g>
  );
}

function bboxOf(solved: Solved[], props: Prop[]): [number, number, number, number] {
  const all: P[] = solved.flatMap(points);
  for (const p of props) {
    if (p.t === 'wall' || p.t === 'post') all.push([p.x - 4, p.y1], [p.x + 6, p.y2]);
    if (p.t === 'bar') all.push([p.x1 - 4, p.y - 8], [p.x2 + 4, p.y + 8]);
    if (p.t === 'box' || p.t === 'backwall') all.push([p.x, p.y], [p.x + p.w, p.y + p.h]);
    if (p.t === 'chair') all.push([p.x - 2, p.y - 32], [p.x + p.w, p.floor]);
    if (p.t === 'ring') all.push([p.cx - p.r, p.cy - p.r], [p.cx + p.r, p.cy + p.r]);
    if (p.t === 'arrow') all.push(p.a, p.b);
    if (p.t === 'floor') all.push([solved[0].hip[0], p.y + 2]);
  }
  const xs = all.map((q) => q[0]), ys = all.map((q) => q[1]);
  const pad = 8;
  let x = Math.min(...xs) - pad, y = Math.min(...ys) - pad;
  let w = Math.max(...xs) + pad - x, h = Math.max(...ys) + pad - y;
  // 너무 길쭉하지 않게 비율 보정
  const minRatio = 1.25;
  if (w / h < minRatio) { const nw = h * minRatio; x -= (nw - w) / 2; w = nw; }
  return [x, y, w, h];
}

const easeInOut = (k: number) => 0.5 - Math.cos(Math.PI * k) / 2;

function poseAt(demo: Demo, t: number): { pose: Pose; idx: number } {
  const fr = demo.frames;
  if (fr.length === 1) return { pose: fr[0].p, idx: 0 };
  const total = fr.reduce((a, f) => a + (f.hold ?? 0) + (f.move ?? 1000), 0);
  let x = t % total;
  for (let i = 0; i < fr.length; i++) {
    const h = fr[i].hold ?? 0, m = fr[i].move ?? 1000;
    if (x < h) return { pose: fr[i].p, idx: i };
    x -= h;
    if (x < m) return { pose: blend(fr[i].p, fr[(i + 1) % fr.length].p, easeInOut(x / m)), idx: i };
    x -= m;
  }
  return { pose: fr[0].p, idx: 0 };
}

/** 카드 썸네일용 정지 그림 */
export function FigureStill({ art, className = '', halo }: { art?: string; className?: string; halo?: string }) {
  const demo = getDemo(art);
  const data = useMemo(() => {
    if (!demo) return null;
    const f = demo.frames[demo.thumb ?? demo.frames.length - 1];
    const s = solve(f.p);
    return { s, box: bboxOf([s], demo.props) };
  }, [demo]);
  if (!demo || !data) return null;
  const { s, box } = data;
  return (
    <svg viewBox={box.map((v) => v.toFixed(1)).join(' ')} className={className} aria-hidden="true">
      <Props props={demo.props} box={box} layer="back" s={s} />
      <Body s={s} halo={halo} />
      <Props props={demo.props} box={box} layer="front" s={s} />
    </svg>
  );
}

const reduceMotion = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 운동 설명 상단: 시작 → 끝 자세를 반복해서 보여 주는 동작 그림 */
export function FigureDemo({ art }: { art?: string }) {
  const demo = getDemo(art);
  const [playing, setPlaying] = useState(() => !reduceMotion());
  const [t, setT] = useState(0);
  const [pinned, setPinned] = useState<number | null>(null);
  const start = useRef<number | null>(null);
  const raf = useRef(0);

  const box = useMemo(() => {
    if (!demo) return [0, 0, 1, 1] as [number, number, number, number];
    // 프레임 사이 동작도 화면 안에 들어오도록 중간 자세까지 포함
    const samples: Solved[] = [];
    demo.frames.forEach((f, i) => {
      const n = demo.frames[(i + 1) % demo.frames.length];
      for (const k of [0, 0.25, 0.5, 0.75]) samples.push(solve(blend(f.p, n.p, k)));
    });
    return bboxOf(samples, demo.props);
  }, [demo]);

  useEffect(() => {
    if (!demo || !playing || demo.frames.length < 2 || pinned !== null) return;
    const loop = (now: number) => {
      if (start.current === null) start.current = now - t;
      setT(now - start.current);
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf.current); start.current = null; };
  }, [demo, playing, pinned]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!demo) return null;
  const { pose, idx } = pinned !== null ? { pose: demo.frames[pinned].p, idx: pinned } : poseAt(demo, t);
  const s = solve(pose);
  const labeled = demo.frames.map((f, i) => ({ ...f, i })).filter((f) => f.label);
  let activeLabel = -1;
  for (const f of labeled) if (f.i <= idx) activeLabel = f.i;
  const animated = demo.frames.length > 1;

  return (
    <div className="overflow-hidden rounded-md bg-soft">
      <div className="relative">
        <svg viewBox={box.map((v) => v.toFixed(1)).join(' ')} className="block aspect-[5/3] w-full" role="img" aria-label="동작 그림">
          <Props props={demo.props} box={box} layer="back" s={s} />
          <Body s={s} />
          <Props props={demo.props} box={box} layer="front" s={s} />
        </svg>
        {animated && (
          <button type="button" onClick={() => { setPinned(null); setPlaying((v) => !v); }}
            aria-label={playing && pinned === null ? '일시정지' : '재생'}
            className="absolute right-2.5 top-2.5 grid h-9 w-9 place-items-center rounded-full bg-canvas text-ink shadow-float">
            {playing && pinned === null ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
          </button>
        )}
        <span className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink shadow-float">
          <i className="h-2 w-2 rounded-full bg-primary" /> 힘이 들어가는 곳
        </span>
      </div>
      {labeled.length > 0 && (
        <ol className="space-y-1 px-3 pb-3 pt-1">
          {labeled.map((f, n) => {
            const on = (pinned ?? activeLabel) === f.i || (labeled.length === 1);
            return (
              <li key={f.i}>
                <button type="button" disabled={!animated}
                  onClick={() => setPinned((v) => (v === f.i ? null : f.i))}
                  className={`flex w-full gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] leading-[1.45] transition-colors ${on ? 'bg-canvas font-semibold text-ink shadow-float' : 'text-muted'}`}>
                  <span className={`tabular mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold ${on ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>{n + 1}</span>
                  <span>{f.label}</span>
                </button>
              </li>
            );
          })}
          {animated && <li className="px-2 pt-0.5 text-[11px] text-muted-soft">번호를 누르면 그 자세에서 멈춥니다</li>}
        </ol>
      )}
    </div>
  );
}
