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
  | { t: 'arrow'; a: P; b: P }
  | { t: 'band'; x1: number; x2: number; y: number }; // 철봉에 건 보조밴드 (무릎에 걸림)

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

  // ── 요청서(11/13) 본운동 ─────────────────────────
  'tyson-pushup': {
    thumb: 1,
    props: [FLOOR, { t: 'wall', x: 19, y1: 58, y2: 110 }],
    frames: [
      { p: { sh: [92, 80], torso: -27, hn: [116, 106], fn: [34, 104], tn: 155, kb: [1, 1], hl: ['chest', 'arm'] }, label: '발뒤꿈치를 벽에 대고, 팔을 편 채 엉덩이를 발뒤꿈치 쪽으로', hold: 500, move: 1600 },
      { p: { sh: [118, 95], torso: -6, hn: [116, 106], fn: [34, 104], tn: 155, hl: ['chest', 'arm'] }, label: '앞으로 미끄러지듯 나와 가슴을 바닥 가까이 · 팔꿈치는 몸통 쪽 30~45도', hold: 300, move: 1100 },
      { p: { sh: [116, 72], torso: -21, hn: [116, 106], fn: [34, 104], tn: 155, hl: ['chest', 'arm'] }, label: '바닥을 밀어 팔을 펴고, 다시 엉덩이를 뒤로 (1회)', hold: 200, move: 1300 },
    ],
  },
  'band-pullup': {
    props: [BAR, { t: 'band', x1: 104, x2: 110, y: 11 }, { t: 'floor', y: 134 }],
    frames: [
      { p: { sh: [100, 50], torso: -90, hn: [101, 13], hf: [99, 13], fn: [78, 100], ff: [81, 98], tn: 160, tf: 160, hl: ['back', 'arm'] }, label: '밴드에 무릎을 걸고 팔 편 채 · 어깨를 귀에서 멀리', hold: 600, move: 1600 },
      { p: { sh: [99, 21], torso: -87, neck: -82, hn: [106, 12], hf: [104, 12], fn: [77, 71], ff: [80, 69], tn: 160, tf: 160, hl: ['back', 'arm'] }, label: '팔꿈치를 옆구리로 당겨 턱이 철봉 높이까지 · 반동 없이', hold: 300, move: 2600 },
    ],
  },
  'run-interval': {
    props: [FLOOR],
    frames: [
      { p: { hip: [100, 60], torso: -80, hn: [116, 56], hf: [86, 74], eb: [-1, 1], fn: [124, 104], ff: [76, 90], tn: -10, tf: 40, kb: [-1, -1], hl: ['thigh', 'calf'] }, label: '짧은 문장으로 대화가 되는 속도 · 발은 몸 가까이 가볍게', move: 330 },
      { p: { hip: [100, 57], torso: -80, hn: [104, 64], hf: [100, 66], eb: [-1, 1], fn: [102, 110], ff: [110, 86], tn: 0, tf: 40, hl: ['thigh', 'calf'] }, move: 330 },
      { p: { hip: [100, 60], torso: -80, hn: [86, 74], hf: [116, 56], eb: [-1, 1], fn: [76, 90], ff: [124, 104], tn: 40, tf: -10, hl: ['thigh', 'calf'] }, move: 330 },
      { p: { hip: [100, 57], torso: -80, hn: [100, 66], hf: [104, 64], eb: [-1, 1], fn: [110, 86], ff: [102, 110], tn: 40, tf: 0, hl: ['thigh', 'calf'] }, move: 330 },
    ],
  },
  'arm-open-close': {
    props: [FLOOR],
    frames: [
      { p: { hip: [100, 62], torso: -90, front: true, hn: [53, 28], hf: [147, 28], eb: [1, -1], fn: [93, 110], ff: [107, 110], hl: ['chest'] }, label: '양팔을 어깨 높이로 옆으로 벌려 가슴 열기', hold: 300, move: 900 },
      { p: { hip: [100, 62], torso: -90, front: true, hn: [118, 33], hf: [82, 37], eb: [1, -1], fn: [93, 110], ff: [107, 110], hl: ['shoulder'] }, label: '가슴 앞에서 가볍게 교차 · 위로 가는 팔을 번갈아', hold: 200, move: 900 },
    ],
  },
  'wall-scap-pushup': {
    thumb: 0,
    props: [FLOOR, { t: 'wall', x: 150, y1: 0, y2: 110 }, { t: 'arrow', a: [118, 14], b: [126, 18] }],
    frames: [
      { p: { sh: [113, 30.5], torso: -72, hn: [149, 40], hf: [148, 41], fn: [88, 110], ff: [85, 110], tn: 0, tf: 0, hl: ['back'] }, label: '팔은 거의 편 채 벽을 밀어 날개뼈 벌리기', hold: 400, move: 1000 },
      { p: { sh: [116.5, 31.5], torso: -70.5, hn: [149, 40], hf: [148, 41], fn: [88, 110], ff: [85, 110], tn: 0, tf: 0, hl: ['back'] }, label: '팔꿈치는 그대로, 날개뼈만 모아 가슴이 살짝 벽 쪽으로', hold: 400, move: 1000 },
    ],
  },
  'leg-swing': {
    props: [FLOOR, { t: 'wall', x: 66, y1: 0, y2: 110 }],
    frames: [
      { p: stand({ hn: [72, 44], fn: [128, 103], tn: -40, hl: ['hamstring'] }), label: '벽을 짚고 바깥쪽 다리를 앞으로 가볍게', move: 750 },
      { p: stand({ hn: [72, 44], fn: [76, 104], tn: 30, hl: ['hipflexor'] }), label: '뒤로 가볍게 · 상체는 곧게', move: 750 },
    ],
  },
  'ankle-mobility': {
    props: [FLOOR, { t: 'wall', x: 152, y1: 0, y2: 110 }, { t: 'arrow', a: [126, 66], b: [138, 66] }],
    frames: [
      { p: { hip: [106, 64], torso: -84, hn: [151, 44], hf: [150, 46], fn: [126, 110], ff: [86, 110], tn: 0, tf: 0, kb: [1, -1], hl: ['calf'] }, label: '벽을 마주 보고 한 발 앞 · 뒤꿈치는 바닥에', hold: 400, move: 1300 },
      { p: { hip: [111, 66], torso: -83, hn: [151, 45], hf: [150, 47], fn: [126, 110], ff: [90, 110], tn: 0, tf: 0, kb: [1, -1], hl: ['calf'] }, label: '뒤꿈치를 붙인 채 무릎을 발끝 쪽으로 천천히', hold: 600, move: 1300 },
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

  // ── 명세서(11/8) 추가 동작 ─────────────────────────
  'incline-pushup': {
    thumb: 0,
    props: [FLOOR, { t: 'box', x: 120, y: 78, w: 34, h: 32 }, { t: 'arrow', a: [96, 30], b: [108, 50] }],
    frames: [
      { p: { sh: [104, 46], torso: -42, hn: [126, 77], fn: [40, 104], tn: 150, hl: ['chest', 'arm'] }, label: '튼튼한 지지대에 손 · 몸은 머리부터 발끝까지 일직선', hold: 700, move: 2500 },
      { p: { sh: [117, 62], torso: -30, hn: [126, 77], fn: [40, 104], tn: 150, hl: ['chest', 'arm'] }, label: '2~3초 동안 가슴을 지지대 쪽으로 · 팔꿈치 30~45도', hold: 300, move: 1000 },
    ],
  },
  'wall-pushup': {
    thumb: 0,
    props: [FLOOR, { t: 'wall', x: 150, y1: 0, y2: 110 }],
    frames: [
      { p: { sh: [114, 31], torso: -71.7, hn: [149, 40], hf: [148, 41], fn: [88, 110], ff: [85, 110], tn: 0, tf: 0, hl: ['chest'] }, label: '벽에서 한 걸음 · 손은 어깨 높이', hold: 400, move: 1500 },
      { p: { sh: [127, 37], torso: -61.8, hn: [149, 40], hf: [148, 41], fn: [88, 110], ff: [85, 110], tn: 0, tf: 0, hl: ['chest'] }, label: '몸을 일직선으로 벽 쪽으로 · 밀어서 돌아오기', hold: 300, move: 1000 },
    ],
  },
  'hip-hinge': {
    props: [FLOOR],
    frames: [
      { p: stand({ hn: [106, 82], hf: [104, 83], fn: [103, 110], ff: [99, 110], hl: ['hamstring', 'glute'] }), label: '발 골반 너비 · 무릎은 살짝 굽히기', hold: 500, move: 2200 },
      { p: { hip: [84, 64], torso: -40, neck: -30, hn: [112, 82], hf: [110, 83], fn: [103, 110], ff: [99, 110], hl: ['hamstring', 'glute'] }, label: '엉덩이를 뒤로 보내며 상체 기울이기 · 허리는 자연스럽게', hold: 400, move: 1500 },
    ],
  },
  'bird-dog': {
    props: [FLOOR],
    frames: [
      { p: { hip: [70, 80], torso: -3, hn: [105, 108], hf: [102, 107], fn: [40, 106], ff: [42, 105], tn: 180, tf: 180, hl: ['core', 'glute'] }, label: '손은 어깨 아래, 무릎은 골반 아래 · 등은 평평하게', hold: 500, move: 1600 },
      { p: { hip: [70, 80], torso: -3, hn: [141, 76], hf: [102, 107], fn: [40, 106], ff: [22, 79], tn: 180, tf: 180, hl: ['core', 'glute'] }, label: '반대쪽 팔과 다리를 뻗어 2초 유지', hold: 2000, move: 1500 },
      { p: { hip: [70, 80], torso: -3, hn: [105, 108], hf: [102, 107], fn: [40, 106], ff: [42, 105], tn: 180, tf: 180, hl: ['core', 'glute'] }, hold: 300, move: 1600 },
      { p: { hip: [70, 80], torso: -3, hn: [105, 108], hf: [139, 75], fn: [20, 80], ff: [42, 105], tn: 180, tf: 180, hl: ['core', 'glute'] }, label: '반대쪽도 같은 방법으로', hold: 2000, move: 1500 },
    ],
  },
  'cat-cow': {
    props: [FLOOR],
    frames: [
      { p: { hip: [70, 80], torso: -9, neck: 55, hn: [105, 108], hf: [102, 107], fn: [40, 106], ff: [42, 105], tn: 180, tf: 180, hl: ['back'] }, label: '숨 내쉬며 등을 둥글게 (고양이)', hold: 800, move: 2200 },
      { p: { hip: [70, 82], torso: 2, neck: -35, hn: [105, 108], hf: [102, 107], fn: [40, 106], ff: [42, 105], tn: 180, tf: 180, hl: ['back'] }, label: '숨 들이쉬며 가슴을 앞으로 (소)', hold: 800, move: 2200 },
    ],
  },
  'side-plank': {
    props: [FLOOR, { t: 'arrow', a: [86, 104], b: [86, 90] }],
    frames: [
      { p: { sh: [114, 86], torso: -26, eb: [-1, -1], hn: [130, 107], hf: [86, 98], fn: [34, 106], tn: 160, hl: ['core'] }, label: '옆으로 누워 팔꿈치는 어깨 아래', hold: 600, move: 1500 },
      { p: { sh: [114, 80], torso: -14, eb: [-1, -1], hn: [130, 107], hf: [84, 86], fn: [34, 104], tn: 160, hl: ['core'] }, label: '골반을 들어 일직선으로 버티기', hold: 2500, move: 1200 },
    ],
  },
  clamshell: {
    props: [FLOOR, { t: 'arrow', a: [112, 92], b: [112, 76] }],
    frames: [
      { p: { hip: [80, 100], torso: 180, neck: 188, hn: [58, 106], hf: [30, 98], fn: [80, 104], ff: [81, 106], kb: [-1, -1], tn: 180, tf: 180, hl: ['glute'] }, label: '옆으로 누워 무릎 굽히고 두 발 붙이기', hold: 500, move: 1300 },
      { p: { hip: [80, 100], torso: 180, neck: 188, hn: [58, 106], hf: [30, 98], fn: [81, 101], ff: [81, 106], kb: [-1, -1], tn: 180, tf: 180, hl: ['glute'] }, label: '골반은 고정, 위쪽 무릎만 들어 올리기', hold: 600, move: 1300 },
    ],
  },
  'calf-raise': {
    props: [FLOOR, { t: 'wall', x: 140, y1: 0, y2: 110 }],
    frames: [
      { p: stand({ hn: [139, 42], hf: [138, 44], tn: 0, tf: 0, hl: ['calf'] }), label: '벽을 가볍게 짚고 서기', hold: 400, move: 1200 },
      { p: { hip: [100, 55], torso: -90, hn: [139, 38], hf: [138, 40], fn: [102, 103], ff: [98, 103], tn: 40, tf: 40, hl: ['calf'] }, label: '발뒤꿈치를 천천히 들어 잠시 유지', hold: 900, move: 1500 },
    ],
  },
  'knee-march': {
    props: [FLOOR],
    frames: [
      { p: stand({ fn: [120, 88], ff: [99, 110], hn: [88, 86], hf: [116, 66], tn: 10, hl: ['hipflexor'] }), label: '무릎을 골반 높이 가까이 번갈아 들기', move: 500 },
      { p: stand({ fn: [102, 110], ff: [119, 87], hn: [115, 66], hf: [88, 86], tf: 10, hl: ['hipflexor'] }), move: 500 },
    ],
  },
  'shoulder-rolls': {
    props: [FLOOR, { t: 'ring', cx: 100, cy: 28, r: 7 }],
    frames: [
      { p: stand({ sh: [100, 30], hip: undefined, torso: -90, hl: ['shoulder'] }), label: '어깨를 앞 → 위 → 뒤 → 아래로 둥글게', move: 400 },
      { p: stand({ sh: [104, 27], hip: undefined, torso: -84, hl: ['shoulder'] }), move: 400 },
      { p: stand({ sh: [100, 23], hip: undefined, torso: -90, hl: ['shoulder'] }), move: 400 },
      { p: stand({ sh: [96, 27], hip: undefined, torso: -96, hl: ['shoulder'] }), move: 400 },
    ],
  },
  'torso-rotation': {
    props: [FLOOR, { t: 'arrow', a: [84, 4], b: [64, 12] }, { t: 'arrow', a: [116, 4], b: [136, 12] }],
    frames: [{ p: { hip: [100, 62], torso: -90, front: true, hn: [110, 40], hf: [90, 40], eb: [1, -1], fn: [92, 110], ff: [108, 110], hl: ['back'] }, label: '골반은 정면 · 팔을 X자로 모으고 몸통만 좌우로 천천히' }],
  },
  'hip-circles': {
    props: [FLOOR, { t: 'wall', x: 66, y1: 0, y2: 110 }],
    frames: [
      { p: stand({ hn: [72, 44], fn: [118, 88], tn: 0, hl: ['hipflexor'] }), label: '벽을 짚고 한쪽 무릎을 들어 작은 원 그리기', move: 500 },
      { p: stand({ hn: [72, 44], fn: [126, 82], tn: 0, hl: ['hipflexor'] }), move: 500 },
      { p: stand({ hn: [72, 44], fn: [120, 76], tn: 0, hl: ['hipflexor'] }), move: 500 },
      { p: stand({ hn: [72, 44], fn: [110, 84], tn: 0, hl: ['hipflexor'] }), move: 500 },
    ],
  },
  'ankle-circles': {
    props: [FLOOR, { t: 'wall', x: 66, y1: 0, y2: 110 }],
    frames: [
      { p: stand({ hn: [72, 44], fn: [116, 100], tn: -30, hl: ['calf'] }), label: '한 발을 들어 발끝으로 원 그리기', move: 450 },
      { p: stand({ hn: [72, 44], fn: [116, 100], tn: 20, hl: ['calf'] }), move: 450 },
      { p: stand({ hn: [72, 44], fn: [116, 100], tn: 70, hl: ['calf'] }), move: 450 },
      { p: stand({ hn: [72, 44], fn: [116, 100], tn: 20, hl: ['calf'] }), move: 450 },
    ],
  },
  'shoulder-stretch': {
    props: [FLOOR],
    frames: [{ p: { hip: [100, 62], torso: -90, front: true, hn: [125, 33], hf: [106, 38], eb: [1, 1], fn: [93, 110], ff: [107, 110], hl: ['shoulder'] }, label: '한쪽 팔을 가슴 앞으로 · 반대 손으로 부드럽게 지지' }],
  },
  'hipflexor-standing': {
    props: [FLOOR],
    frames: [{ p: { hip: [100, 70], torso: -88, hn: [106, 70], hf: [104, 71], fn: [72, 108], ff: [124, 110], tn: 20, tf: 0, hl: ['hipflexor'] }, label: '앞뒤로 서서 꼬리뼈를 말고 몸을 조금 앞으로' }],
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
  'knee-pushup': 'scap-pushup', hang: 'assisted-hang', pullup: 'foot-pullup', negative: 'negative-pullup',
  bridge: 'hip-bridge', walk: 'brisk-walk', lunge: 'ankle-knee', 'light-stretch': 'stretch', cooldown: 'stretch', 'doorway-stretch': 'doorway',
};
export const getDemo = (key?: string): Demo | undefined => (key ? DEMOS[key] ?? DEMOS[ALIAS[key] ?? ''] : undefined);
