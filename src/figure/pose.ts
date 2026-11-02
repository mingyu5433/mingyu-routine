// 관절 기반 인체 도해 — 손·발 목표 위치만 정하면 팔꿈치·무릎은 자동 계산(2관절 IK)
export type P = [number, number];

export const L = { torso: 34, neck: 12, head: 8, ua: 19, fa: 18, th: 25, sh: 25, foot: 9 };

export interface Pose {
  hip?: P;            // 골반 (hip 또는 sh 중 하나)
  sh?: P;             // 어깨
  torso: number;      // 골반→어깨 방향(도). 위 = -90, 오른쪽 = 0
  neck?: number;      // 어깨→머리 방향 (기본 = torso)
  hn: P; hf?: P;      // 손목 (가까운 쪽 / 먼 쪽)
  fn: P; ff?: P;      // 발목
  tn?: number; tf?: number; // 발끝 방향
  eb?: [number, number];    // 팔꿈치 굽는 방향(+1/-1)
  kb?: [number, number];    // 무릎 굽는 방향
  front?: boolean;    // 정면 보기
  hl?: Highlight[];   // 강조할 부위
}

export type Highlight = 'chest' | 'back' | 'core' | 'glute' | 'thigh' | 'hamstring' | 'calf' | 'arm' | 'shoulder' | 'hipflexor';

export const rad = (d: number) => (d * Math.PI) / 180;
export const dir = (d: number): P => [Math.cos(rad(d)), Math.sin(rad(d))];
const add = (a: P, b: P, k = 1): P => [a[0] + b[0] * k, a[1] + b[1] * k];

function ik(root: P, target: P, l1: number, l2: number, sign: number): [P, P] {
  const dx = target[0] - root[0], dy = target[1] - root[1];
  let d = Math.hypot(dx, dy);
  d = Math.min(l1 + l2 - 0.01, Math.max(Math.abs(l1 - l2) + 0.01, d));
  const base = Math.atan2(dy, dx);
  const a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const mid: P = [root[0] + l1 * Math.cos(base + sign * a), root[1] + l1 * Math.sin(base + sign * a)];
  const end: P = [root[0] + d * Math.cos(base), root[1] + d * Math.sin(base)];
  return [mid, end];
}

export interface Solved {
  front: boolean;
  hip: P; sh: P; head: P;
  shN: P; shF: P; hipN: P; hipF: P;
  elN: P; wrN: P; elF: P; wrF: P;
  knN: P; anN: P; toeN: P; knF: P; anF: P; toeF: P;
  hl: Highlight[];
}

export function solve(p: Pose): Solved {
  const t = dir(p.torso);
  const hip = p.hip ?? add(p.sh!, t, -L.torso);
  const sh = p.sh ?? add(hip, t, L.torso);
  const head = add(sh, dir(p.neck ?? p.torso), L.neck);
  const front = !!p.front;
  const perp = dir(p.torso + 90);
  const shN = front ? add(sh, perp, -11) : sh;
  const shF = front ? add(sh, perp, 11) : add(sh, [-1.5, -1.5]);
  const hipN = front ? add(hip, perp, -7) : hip;
  const hipF = front ? add(hip, perp, 7) : add(hip, [-1.5, -1.5]);
  const hf = p.hf ?? (front ? [2 * sh[0] - p.hn[0], p.hn[1]] as P : add(p.hn, [-3, -2]));
  const ff = p.ff ?? (front ? [2 * hip[0] - p.fn[0], p.fn[1]] as P : add(p.fn, [-3, -1.5]));
  const eb = p.eb ?? [1, 1], kb = p.kb ?? [-1, -1];
  const [elN, wrN] = ik(shN, p.hn, L.ua, L.fa, eb[0]);
  const [elF, wrF] = ik(shF, hf, L.ua, L.fa, eb[1]);
  const [knN, anN] = ik(hipN, p.fn, L.th, L.sh, kb[0]);
  const [knF, anF] = ik(hipF, ff, L.th, L.sh, kb[1]);
  const toeN = add(anN, dir(p.tn ?? (front ? 180 : 0)), front ? 6 : L.foot);
  const toeF = add(anF, dir(p.tf ?? (front ? 0 : p.tn ?? 0)), front ? 6 : L.foot);
  return { front, hip, sh, head, shN, shF, hipN, hipF, elN, wrN, elF, wrF, knN, anN, toeN, knF, anF, toeF, hl: p.hl ?? [] };
}

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpP = (a: P | undefined, b: P | undefined, k: number): P | undefined =>
  a && b ? [lerp(a[0], b[0], k), lerp(a[1], b[1], k)] : (k < 0.5 ? a : b);
const lerpN = (a: number | undefined, b: number | undefined, k: number) =>
  a !== undefined && b !== undefined ? lerp(a, b, k) : (k < 0.5 ? a : b);

/** 두 자세 사이를 보간 (어깨 기준이면 어깨끼리, 골반 기준이면 골반끼리) */
export function blend(a: Pose, b: Pose, k: number): Pose {
  const useSh = !!(a.sh && b.sh);
  const base = (q: Pose) => (useSh ? q.sh! : q.hip ?? add(q.sh!, dir(q.torso), -L.torso));
  return {
    ...(k < 0.5 ? a : b),
    ...(useSh ? { sh: lerpP(a.sh, b.sh, k), hip: undefined } : { hip: lerpP(base(a), base(b), k), sh: undefined }),
    torso: lerp(a.torso, b.torso, k),
    neck: lerpN(a.neck ?? a.torso, b.neck ?? b.torso, k),
    hn: lerpP(a.hn, b.hn, k)!, hf: lerpP(a.hf, b.hf, k),
    fn: lerpP(a.fn, b.fn, k)!, ff: lerpP(a.ff, b.ff, k),
    tn: lerpN(a.tn, b.tn, k), tf: lerpN(a.tf, b.tf, k),
  };
}

export function points(s: Solved): P[] {
  return [s.hip, s.sh, [s.head[0] - 9, s.head[1] - 9], [s.head[0] + 9, s.head[1] + 9], s.shN, s.shF, s.elN, s.wrN, s.elF, s.wrF, s.knN, s.anN, s.toeN, s.knF, s.anF, s.toeF];
}
