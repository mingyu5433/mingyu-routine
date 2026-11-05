import type { P, Pose } from './pose';

export type Prop =
  | { t: 'floor'; y: number }
  | { t: 'wall'; x: number; y1: number; y2: number }
  | { t: 'backwall'; x: number; y: number; w: number; h: number }
  | { t: 'post'; x: number; y1: number; y2: number }
  | { t: 'bar'; x1: number; x2: number; y: number }
  | { t: 'box'; x: number; y: number; w: number; h: number }
  | { t: 'chair'; x: number; y: number; w: number; floor: number }
  | { t: 'ring'; cx: number; cy: number; r: number }
  | { t: 'arrow'; a: P; b: P };

export interface Frame { p: Pose; label?: string; hold?: number; move?: number }
export interface Demo { frames: Frame[]; props: Prop[]; thumb?: number }

const FLOOR: Prop = { t: 'floor', y: 110 };

// ── 공통 자세 ───────────────────────────────────────
const stand = (o: Partial<Pose> = {}): Pose => ({ hip: [100, 62], torso: -90, hn: [101, 98], fn: [102, 110], ff: [98, 110], ...o });
const hangLegs = { fn: [80, 96] as P, ff: [83, 94] as P, tn: 160, tf: 160 };
const BAR: Prop = { t: 'bar', x1: 72, x2: 134, y: 11 };
const lyingBase = (o: Partial<Pose> = {}): Pose => ({ hip: [78, 104], torso: 180, neck: 180, hn: [74, 107], hf: [72, 106], fn: [112, 107], ff: [110, 106], tn: 0, tf: 0, ...o });

const pushTop: Pose = { sh: [112, 70], torso: -23, hn: [113, 106], fn: [33, 104], tn: 155, hl: ['chest', 'arm'] };
const pushBottom: Pose = { sh: [114, 95], torso: -6, hn: [113, 106], fn: [33, 104], tn: 155, hl: ['chest', 'arm'] };

const pullTop: Pose = { sh: [98, 17], torso: -86, neck: -80, hn: [106, 12], hf: [104, 12], fn: [114, 97], ff: [112, 96], tn: 0, tf: 0, hl: ['back', 'arm'] };
const pullBottom: Pose = { sh: [100, 50], torso: -88, hn: [103, 13], hf: [101, 13], fn: [114, 97], ff: [112, 96], tn: 0, tf: 0, hl: ['back', 'arm'] };
const BOX: Prop = { t: 'box', x: 104, y: 100, w: 30, h: 34 };

const walk = (near: P, far: P, hn: P, hf: P, tn = 0, tf = 0): Pose => ({ hip: [100, 62], torso: -84, hn, hf, fn: near, ff: far, tn, tf, hl: ['calf'] });

export const DEMOS: Record<string, Demo> = {
  // ── 본 운동 ──────────────────────────────────────
  pushup: {
    thumb: 0,
    props: [FLOOR, { t: 'arrow', a: [142, 68], b: [142, 92] }],
    frames: [
      { p: pushTop, label: '팔을 편 시작 자세 · 머리부터 발뒤꿈치까지 일직선', hold: 700, move: 2500 },
      { p: pushBottom, label: '2~3초 동안 가슴이 바닥 가까이 · 팔꿈치는 몸통 쪽 30~45도', hold: 300, move: 1000 },
    ],
  },
  'close-pushup': {
    thumb: 0,
    props: [FLOOR, { t: 'arrow', a: [142, 68], b: [142, 92] }],
    frames: [
      { p: { ...pushTop, hn: [107, 106], hl: ['arm', 'chest'] }, label: '손은 가슴 아래로 좁게 · 몸은 일직선', hold: 700, move: 2500 },
      { p: { ...pushBottom, sh: [113, 94], hn: [107, 106], hl: ['arm', 'chest'] }, label: '팔꿈치를 옆구리에 붙인 채 3초 동안 내려가기', hold: 300, move: 1000 },
    ],
  },
  plank: {
    props: [FLOOR],
    frames: [{ p: { sh: [114, 90], torso: -7, eb: [-1, -1], hn: [134, 106], hf: [131, 105], fn: [33, 104], tn: 155, hl: ['core'] }, label: '팔꿈치는 어깨 아래 · 발뒤꿈치부터 머리까지 일직선으로 버티기' }],
  },
  'scap-pushup': {
    props: [FLOOR, { t: 'arrow', a: [136, 80], b: [136, 64] }],
    frames: [
      { p: { sh: [112, 74], torso: -20, hn: [113, 106], fn: [33, 104], tn: 155, hl: ['back'] }, label: '발끝으로 서서 팔은 편 채 날개뼈 모으기 (가슴이 살짝 내려감)', hold: 300, move: 1000 },
      { p: { sh: [112, 68], torso: -24, hn: [113, 106], fn: [33, 104], tn: 155, hl: ['back'] }, label: '바닥을 밀어 등 윗부분을 둥글게 올리기', hold: 300, move: 1000 },
    ],
  },
  'scap-pullup': {
    props: [BAR, { t: 'floor', y: 134 }, { t: 'arrow', a: [120, 54], b: [120, 42] }],
    frames: [
      { p: { sh: [100, 54], torso: -90, hn: [100, 13], hf: [99, 13], ...hangLegs, hl: ['back'] }, label: '팔 편 채 매달리기 · 무릎 굽혀 발은 뒤로', hold: 500, move: 900 },
      { p: { sh: [100, 47], torso: -90, hn: [100, 13], hf: [99, 13], ...hangLegs, hl: ['back'] }, label: '팔은 그대로, 어깨를 귀에서 멀리 끌어내리기', hold: 800, move: 900 },
    ],
  },
  'foot-pullup': {
    props: [BAR, BOX, { t: 'floor', y: 134 }],
    frames: [
      { p: pullBottom, label: '발판에 발 · 팔 펴고 매달리기', hold: 500, move: 1500 },
      { p: pullTop, label: '팔꿈치를 옆구리로 당겨 턱을 철봉 위로 · 다리는 거들기만', hold: 400, move: 2500 },
    ],
  },
  'negative-pullup': {
    props: [BAR, BOX, { t: 'floor', y: 134 }],
    frames: [
      { p: { ...pullTop, fn: [80, 70], ff: [83, 68], tn: 160, tf: 160 }, label: '발판을 딛고 턱을 철봉 위에 둔 채 발을 뒤로 들기', hold: 800, move: 4000 },
      { p: { ...pullBottom, sh: [100, 50], ...hangLegs }, label: '4초 동안 천천히 내려오기 · 팔이 다 펴지면 끝', hold: 700, move: 900 },
    ],
  },
  'dead-hang': {
    props: [BAR, { t: 'floor', y: 134 }],
    frames: [{ p: { sh: [100, 49], torso: -90, hn: [100, 13], hf: [99, 13], ...hangLegs, hl: ['arm', 'back'] }, label: '무릎 굽혀 발을 뒤로 · 발이 떨어진 순간부터 시간 재기' }],
  },
  'assisted-hang': {
    props: [BAR, BOX, { t: 'floor', y: 134 }],
    frames: [{ p: { sh: [100, 52], torso: -88, hn: [100, 13], hf: [99, 13], fn: [114, 97], ff: [112, 96], tn: 0, tf: 0, hl: ['arm'] }, label: '발판에 발을 올려 체중 일부를 지지하며 매달리기' }],
  },
  deadbug: {
    props: [FLOOR],
    frames: [
      { p: lyingBase({ hn: [46, 68], hf: [43, 67], fn: [103, 79], ff: [100, 78], tn: -15, tf: -15, hl: ['core'] }), label: '팔은 천장, 무릎은 90도 (테이블 자세)', hold: 500, move: 2000 },
      { p: lyingBase({ hn: [9, 100], hf: [43, 67], fn: [103, 79], ff: [128, 97], tn: -15, tf: 0, hl: ['core'] }), label: '반대쪽 팔과 다리를 2초 동안 바닥 가까이 뻗기', hold: 500, move: 1500 },
      { p: lyingBase({ hn: [46, 68], hf: [43, 67], fn: [103, 79], ff: [100, 78], tn: -15, tf: -15, hl: ['core'] }), hold: 400, move: 2000 },
      { p: lyingBase({ hn: [46, 68], hf: [8, 99], fn: [129, 98], ff: [100, 78], tn: 0, tf: -15, hl: ['core'] }), label: '반대쪽도 같은 방법으로 (좌우 1번씩 = 1회)', hold: 500, move: 1500 },
    ],
  },
  squat: {
    props: [FLOOR],
    frames: [
      { p: stand({ hn: [137, 30], hf: [135, 31], tn: 0, tf: 0, hl: ['thigh', 'glute'] }), label: '발 어깨너비 · 발끝 살짝 바깥 · 팔은 앞으로', hold: 500, move: 3000 },
      { p: { hip: [82, 88], torso: -52, hn: [139, 60], hf: [137, 61], fn: [102, 110], ff: [98, 110], hl: ['thigh', 'glute'] }, label: '3초 동안 엉덩이를 뒤로 · 무릎은 발끝 방향', hold: 300, move: 1500 },
    ],
  },
  'hip-bridge': {
    props: [FLOOR],
    frames: [
      { p: lyingBase({ hl: ['glute', 'hamstring'] }), label: '등 대고 눕기 · 무릎 세우고 발은 엉덩이 쪽으로', hold: 600, move: 1500 },
      { p: { hip: [80, 82], torso: 150, neck: 175, hn: [74, 107], hf: [72, 106], fn: [112, 107], ff: [110, 106], tn: 0, tf: 0, hl: ['glute', 'hamstring'] }, label: '엉덩이를 들어 어깨~무릎 일직선 · 위에서 2초', hold: 2000, move: 1500 },
    ],
  },
  'brisk-walk': {
    props: [FLOOR],
    frames: [
      { p: walk([120, 109], [83, 109], [86, 88], [116, 86], -15, 35), label: '대화는 되지만 숨이 조금 차는 속도', move: 380 },
      { p: walk([101, 110], [108, 95], [99, 96], [101, 96], 0, 30), move: 380 },
      { p: walk([83, 109], [120, 109], [116, 86], [86, 88], 35, -15), move: 380 },
      { p: walk([108, 95], [101, 110], [101, 96], [99, 96], 30, 0), move: 380 },
    ],
  },

  // ── 준비운동 ─────────────────────────────────────
  'wall-slide': {
    props: [{ t: 'backwall', x: 64, y: -16, w: 72, h: 126 }, FLOOR],
    frames: [
      { p: { hip: [100, 61], torso: -90, front: true, hn: [73, 12], hf: [127, 12], eb: [-1, 1], fn: [93, 110], ff: [107, 110], hl: ['back'] }, label: 'W 자세: 팔꿈치 90도, 팔뚝과 손등을 벽에', hold: 500, move: 3000 },
      { p: { hip: [100, 61], torso: -90, front: true, hn: [78, -9], hf: [122, -9], eb: [-1, 1], fn: [93, 110], ff: [107, 110], hl: ['back'] }, label: 'Y 자세: 벽을 따라 3초 동안 올리기 · 허리는 벽에', hold: 500, move: 3000 },
    ],
  },
  'arm-circles': {
    thumb: 1,
    props: [FLOOR, { t: 'ring', cx: 100, cy: 28, r: 36.5 }],
    frames: [
      { p: stand({ hn: [100, 64.5], hl: ['shoulder'] }), label: '팔을 뻗어 앞으로 크게 원 그리기 → 뒤로도 같은 횟수', move: 450 },
      { p: stand({ hn: [136.5, 28], hl: ['shoulder'] }), move: 450 },
      { p: stand({ hn: [100, -8.5], hl: ['shoulder'] }), move: 450 },
      { p: stand({ hn: [63.5, 28], hl: ['shoulder'] }), move: 450 },
    ],
  },
  doorway: {
    props: [FLOOR, { t: 'post', x: 84, y1: -6, y2: 110 }],
    frames: [
      { p: { hip: [106, 62], torso: -90, hn: [90, 12], eb: [-1, -1], fn: [118, 110], ff: [96, 110], hl: ['chest'] }, label: '팔꿈치를 어깨 높이로, 팔뚝 전체를 문틀에', hold: 600, move: 2000 },
      { p: { hip: [113, 63], torso: -83, hn: [90, 12], eb: [-1, -1], fn: [118, 110], ff: [96, 110], hl: ['chest'] }, label: '체중을 앞발로 옮겨 가슴 앞을 늘이기', hold: 1800, move: 1500 },
    ],
  },
  'ankle-knee': {
    props: [FLOOR, { t: 'wall', x: 152, y1: 0, y2: 110 }],
    frames: [
      { p: { hip: [118, 64], torso: -80, hn: [151, 48], hf: [150, 50], fn: [136, 110], ff: [100, 110], hl: ['calf'] }, label: '앞발은 벽에서 한 뼘 · 뒤꿈치는 바닥에', hold: 500, move: 2000 },
      { p: { hip: [128, 71], torso: -75, hn: [151, 48], hf: [150, 50], fn: [136, 110], ff: [100, 110], hl: ['calf'] }, label: '무릎을 2초 동안 벽 쪽으로 밀기', hold: 800, move: 1200 },
    ],
  },
  'hip-flexor': {
    props: [FLOOR],
    frames: [
      { p: { hip: [104, 86], torso: -90, hn: [118, 84], hf: [116, 85], fn: [64, 106], ff: [128, 110], tn: 180, tf: 0, hl: ['hipflexor'] }, label: '반무릎 자세 · 꼬리뼈를 말아 넣고 엉덩이에 힘', hold: 700, move: 1800 },
      { p: { hip: [110, 88], torso: -90, hn: [108, 17], hf: [118, 87], fn: [64, 106], ff: [128, 110], tn: 180, tf: 0, hl: ['hipflexor'] }, label: '골반을 앞으로 2~3cm · 같은 쪽 팔은 위로', hold: 1800, move: 1500 },
    ],
  },
  'sit-stand': {
    props: [FLOOR, { t: 'chair', x: 60, y: 84, w: 30, floor: 110 }],
    frames: [
      { p: stand({ hn: [137, 30], hf: [135, 31], hl: ['thigh'] }), label: '의자 앞에 서기 · 발 어깨너비', hold: 500, move: 3000 },
      { p: { hip: [84, 82], torso: -58, hn: [138, 56], hf: [136, 57], fn: [102, 110], ff: [98, 110], hl: ['thigh'] }, label: '3초 동안 앉아 엉덩이를 의자에 살짝만 대기', hold: 300, move: 1500 },
    ],
  },

  // ── 스트레칭 동작 (마무리 / 가벼운 스트레칭) ─────────
  'm-doorway': {
    props: [FLOOR, { t: 'post', x: 84, y1: -6, y2: 110 }],
    frames: [{ p: { hip: [113, 63], torso: -83, hn: [90, 12], eb: [-1, -1], fn: [118, 110], ff: [96, 110], hl: ['chest'] } }],
  },
  'm-sidebend': {
    props: [FLOOR],
    frames: [{ p: { hip: [103, 62], torso: -102, neck: -108, front: true, hn: [84, -4], hf: [88, -6], eb: [-1, 1], fn: [92, 110], ff: [108, 110], hl: ['core'] } }],
  },
  'm-doorlat': {
    props: [FLOOR, { t: 'post', x: 144, y1: -6, y2: 110 }],
    frames: [{ p: { hip: [76, 76], torso: -24, neck: -12, hn: [141, 58], hf: [141, 60], fn: [100, 110], ff: [96, 110], hl: ['back'] } }],
  },
  'm-quad': {
    props: [FLOOR, { t: 'wall', x: 140, y1: 0, y2: 110 }],
    frames: [{ p: { hip: [100, 62], torso: -90, hn: [88, 62], hf: [139, 40], fn: [88, 60], ff: [100, 110], tn: 250, tf: 0, hl: ['thigh'] } }],
  },
  'm-ham-seated': {
    props: [FLOOR],
    frames: [{ p: { hip: [60, 103], torso: -38, neck: -25, hn: [101, 99], hf: [99, 100], fn: [110, 106], ff: [80, 107], tn: -80, tf: 0, kb: [-1, -1], hl: ['hamstring'] } }],
  },
  'm-figure4': {
    props: [FLOOR],
    frames: [{ p: lyingBase({ hn: [88, 84], hf: [86, 85], fn: [80, 78], ff: [103, 79], tn: -40, tf: -15, kb: [1, -1], hl: ['glute'] }) }],
  },
  'm-breath': {
    props: [FLOOR],
    frames: [{ p: lyingBase({ hn: [66, 97], hf: [64, 96], hl: ['core'] }) }],
  },
  'm-calf': {
    props: [FLOOR, { t: 'wall', x: 152, y1: 0, y2: 110 }],
    frames: [{ p: { hip: [104, 66], torso: -68, hn: [151, 40], hf: [150, 42], fn: [80, 108], ff: [124, 110], tn: 0, tf: 0, hl: ['calf'] } }],
  },
  'm-ham-standing': {
    props: [FLOOR],
    frames: [{ p: { hip: [86, 66], torso: -32, neck: -25, hn: [109, 82], hf: [107, 83], fn: [120, 107], ff: [84, 110], tn: -55, tf: 0, hl: ['hamstring'] } }],
  },
  'm-hipflexor': {
    props: [FLOOR],
    frames: [{ p: { hip: [110, 88], torso: -90, hn: [108, 17], hf: [118, 87], fn: [64, 106], ff: [128, 110], tn: 180, tf: 0, hl: ['hipflexor'] } }],
  },
  'm-neck': {
    props: [FLOOR],
    frames: [{ p: { hip: [100, 62], torso: -90, neck: -125, front: true, hn: [90, 10], hf: [113, 62], eb: [1, 1], fn: [93, 110], ff: [107, 110], hl: ['shoulder'] } }],
  },
  stretch: {
    props: [FLOOR],
    frames: [{ p: stand({ hn: [98, -8], hf: [102, -8], hl: ['back'] }) }],
  },
};

// 예전 그림 키 → 새 그림
const ALIAS: Record<string, string> = {
  'incline-pushup': 'pushup', 'knee-pushup': 'scap-pushup', hang: 'assisted-hang', pullup: 'foot-pullup', negative: 'negative-pullup',
  bridge: 'hip-bridge', walk: 'brisk-walk', lunge: 'ankle-knee', 'light-stretch': 'stretch', cooldown: 'stretch', 'doorway-stretch': 'doorway',
};
export const getDemo = (key?: string): Demo | undefined => (key ? DEMOS[key] ?? DEMOS[ALIAS[key] ?? ''] : undefined);
