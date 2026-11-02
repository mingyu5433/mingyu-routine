import type { Exercise } from '../types';

export const EXERCISES: Exercise[] = [
  // ── A. 어깨 준비운동 ─────────────────────────────
  {
    id: 'scap-pushup', name: '견갑 푸쉬업', part: '어깨 · 견갑', category: 'warmup', art: 'scap-pushup',
    unit: 'reps', defaultSets: 2, defaultTarget: 10, restSec: 30,
    summary: '날개뼈 주변 근육을 깨우는 어깨 준비운동',
    steps: [
      '푸쉬업 자세(또는 무릎을 대거나 높은 받침대)에서 팔꿈치를 곧게 폅니다.',
      '팔꿈치를 편 상태로 날개뼈를 부드럽게 모읍니다.',
      '바닥을 밀어내듯 날개뼈를 다시 벌립니다.',
    ],
    cautions: ['어깨를 으쓱하지 않습니다.', '어깨 앞쪽 통증이 발생하면 중단합니다.'],
    breathing: '날개뼈를 모을 때 들이마시고, 밀어낼 때 내쉽니다.',
    tips: ['움직임이 작아도 정상입니다. 팔꿈치가 굽혀지지 않는 것이 핵심입니다.', '어렵다면 벽이나 책상에 손을 짚고 시작합니다.'],
  },
  {
    id: 'wall-slide', name: '벽 슬라이드', part: '어깨 · 상부 등', category: 'warmup', art: 'wall-slide',
    unit: 'reps', defaultSets: 1, defaultTarget: 8, range: '8~10회', restSec: 30,
    summary: '벽에 기대 팔을 올렸다 내리며 어깨 가동 범위를 준비',
    steps: [
      '등을 벽에 대고 섭니다. 발은 벽에서 반 걸음 정도 떨어뜨립니다.',
      '팔꿈치를 굽혀 W 모양으로 벽에 댑니다.',
      '팔을 천천히 위로 미끄러뜨려 올렸다가 내립니다.',
    ],
    cautions: ['허리를 과하게 젖히지 않습니다.', '통증 없는 범위에서만 진행합니다.'],
    breathing: '팔을 올릴 때 내쉬고, 내릴 때 들이마십니다.',
    tips: ['손등이 벽에서 떨어져도 괜찮습니다. 범위보다 천천히 움직이는 것이 중요합니다.'],
  },
  {
    id: 'doorway-stretch', name: '문틀 가슴 스트레칭', part: '가슴 앞쪽', category: 'warmup', art: 'doorway',
    unit: 'sec', defaultSets: 2, defaultTarget: 20, restSec: 15,
    summary: '문틀에 팔을 대고 가슴 앞쪽을 가볍게 늘이기',
    steps: [
      '문틀 옆에 서서 팔꿈치를 어깨 높이 정도로 문틀에 댑니다.',
      '몸을 천천히 앞으로 내밀어 가슴 앞쪽이 부드럽게 늘어나게 합니다.',
      '정해진 시간 동안 유지한 뒤 반대쪽도 진행합니다.',
    ],
    cautions: ['어깨 앞쪽에 통증이 발생하면 중단합니다.', '강한 스트레칭보다는 가벼운 스트레칭을 권장합니다.'],
    breathing: '유지하는 동안 천천히 길게 호흡합니다.',
    tips: ['가슴 앞쪽이 "시원하다" 정도면 충분합니다.'],
  },

  // ── B. 경사 푸쉬업 ───────────────────────────────
  {
    id: 'incline-pushup', name: '경사 푸쉬업', part: '가슴 · 삼두 · 어깨', category: 'strength', art: 'incline-pushup',
    unit: 'reps', defaultSets: 2, defaultTarget: 8, range: '6~10회', restSec: 0,
    summary: '가슴, 삼두근, 어깨 안정성 강화',
    steps: [
      '흔들리지 않는 높은 받침대에 손을 올립니다.',
      '손은 어깨너비 또는 약간 넓게 둡니다.',
      '팔꿈치는 몸통에서 약 30~45도 방향으로 움직입니다.',
      '복부에 힘을 주고 몸통을 일직선으로 유지합니다.',
      '2~3초 동안 천천히 내려갑니다.',
      '어깨 통증이 없는 깊이까지만 내려갑니다.',
      '바닥을 밀면서 올라옵니다.',
    ],
    cautions: [
      '말린 어깨가 있다고 해서 통증 원인이 확정되는 것은 아닙니다.',
      '어깨 앞쪽 통증을 참고 반복하지 않습니다.',
      '통증이 반복되면 운동을 중단하고 전문가의 평가를 권장합니다.',
    ],
    breathing: '내려갈 때 들이마시고, 밀어 올라올 때 내쉽니다.',
    tips: ['통증 없이 목표 횟수가 쉬워지면 받침대 높이를 조금씩 낮출 수 있습니다.', '세트 사이 휴식은 60~90초를 권장합니다.'],
  },

  // ── B'. 푸쉬업 (무릎 → 일반) ─────────────────────
  {
    id: 'pushup', name: '푸쉬업', part: '가슴 · 삼두 · 어깨', category: 'strength', art: 'knee-pushup',
    unit: 'reps', defaultSets: 2, defaultTarget: 6, range: '무릎 6~10회 → 일반', restSec: 0,
    summary: '무릎 푸쉬업으로 시작해 일반 푸쉬업으로 넘어갑니다 · 가슴, 삼두근, 어깨 안정성 강화',
    steps: [
      '손은 어깨너비보다 약간 넓게 두고, 손목이 어깨 바로 아래에 오게 합니다.',
      '무릎 푸쉬업은 무릎을 바닥에 대고 무릎부터 머리까지, 일반 푸쉬업은 발끝으로 지지하고 뒤꿈치부터 머리까지 일직선을 만듭니다.',
      '팔꿈치는 몸통에서 약 30~45도 방향으로 움직입니다.',
      '복부와 엉덩이에 힘을 주고 2~3초 동안 천천히 내려갑니다.',
      '어깨 통증이 없는 깊이까지만 내려갑니다.',
      '바닥을 밀면서 올라옵니다.',
    ],
    cautions: [
      '말린 어깨가 있다고 해서 통증 원인이 확정되는 것은 아닙니다.',
      '어깨 앞쪽 통증을 참고 반복하지 않습니다.',
      '통증이 반복되거나 일상생활에서도 아프다면 운동을 중단하고 물리치료사나 정형외과의 평가를 권장합니다.',
    ],
    breathing: '내려갈 때 들이마시고, 밀어 올라올 때 내쉽니다.',
    tips: [
      '무릎 아래에 수건이나 매트를 깔면 편합니다.',
      '무릎 푸쉬업 3세트 × 10회가 편해지면 일반 푸쉬업으로 넘어갑니다. 추천 프로그램은 5주차에 자동으로 바꿔 줍니다.',
      '일반 푸쉬업을 목표만큼 못 하면 남은 횟수는 무릎을 대고 이어서 채우고, 수정 버튼에는 일반으로 한 횟수만 적어 주세요.',
      '무릎 푸쉬업도 어깨가 불편하면 벽에 손을 짚는 벽 푸쉬업으로 강도를 낮출 수 있습니다.',
    ],
  },

  // ── C. 풀업 준비운동 ─────────────────────────────
  {
    id: 'assisted-hang', name: '보조 매달리기', part: '등 · 악력 · 어깨', category: 'pull', art: 'hang',
    unit: 'sec', defaultSets: 2, defaultTarget: 15, range: '10~20초', restSec: 0,
    summary: '발로 체중 일부를 지지한 채 철봉에 매달리기',
    steps: [
      '문틀 철봉 아래 안정적인 발판을 둡니다.',
      '철봉을 어깨너비로 잡고 발로 체중 일부를 지지합니다.',
      '어깨를 귀에서 살짝 멀리 둔 채 정해진 시간 동안 매달립니다.',
    ],
    cautions: ['어깨에 통증이 없는 범위에서 진행합니다.', '철봉의 허용 하중과 문틀 설치 상태를 확인합니다.', '불안정한 의자 위에서 운동하지 않습니다.'],
    breathing: '매달린 동안 호흡을 참지 말고 일정하게 쉽니다.',
    tips: ['손바닥이 아프면 시간을 줄이고 횟수로 나누어도 됩니다.'],
  },
  {
    id: 'scap-pullup', name: '견갑 풀업', part: '하부 승모 · 광배', category: 'pull', art: 'hang',
    unit: 'reps', defaultSets: 2, defaultTarget: 5, range: '5~8회', restSec: 0,
    stage: '매달리기에 익숙해진 뒤 추가합니다.',
    summary: '팔을 편 채 어깨만 내려 등 근육을 깨우는 동작',
    steps: [
      '철봉에 매달린 상태(필요하면 발 보조)에서 팔꿈치를 곧게 폅니다.',
      '팔꿈치를 편 상태에서 어깨를 귀에서 멀어지게 끌어내립니다.',
      '천천히 원래 위치로 돌아옵니다.',
    ],
    cautions: ['어깨 통증이 발생하면 즉시 중단합니다.', '철봉에서 흔들리지 않습니다.'],
    breathing: '어깨를 끌어내릴 때 내쉬고, 돌아올 때 들이마십니다.',
    tips: ['몸이 조금만 움직여도 괜찮습니다.'],
  },
  {
    id: 'foot-pullup', name: '발 보조 풀업', part: '등 · 이두', category: 'pull', art: 'pullup',
    unit: 'reps', defaultSets: 2, defaultTarget: 5, range: '4~6회', restSec: 0,
    summary: '다리의 도움을 받아 당기는 첫 풀업 준비의 핵심 동작',
    steps: [
      '안정적인 발판 위에 발을 두고 철봉을 잡습니다.',
      '다리의 도움을 받으며 팔꿈치를 옆구리 방향으로 당깁니다.',
      '턱이 철봉 근처에 오면 잠시 멈춥니다.',
      '내려갈 때는 천천히 움직입니다.',
    ],
    cautions: ['철봉에서 점프하거나 흔들리지 않습니다.', '불안정한 의자 위에서 운동하지 않습니다.', '어깨 통증이 발생하면 즉시 중단합니다.'],
    breathing: '당길 때 내쉬고, 내려갈 때 들이마십니다.',
    tips: ['익숙해지면 다리의 도움을 조금씩 줄여 봅니다.', '세트 사이 휴식은 풀업 기본값(105초)을 사용합니다.'],
  },
  {
    id: 'negative-pullup', name: '네거티브 풀업', part: '등 · 이두', category: 'pull', art: 'negative',
    unit: 'reps', defaultSets: 2, defaultTarget: 2, range: '2~3회', restSec: 0,
    stage: '보조 풀업이 통증 없이 가능해진 뒤 진행합니다.',
    summary: '위에서 시작해 3~5초에 걸쳐 천천히 내려오기',
    steps: [
      '발판을 이용해 턱이 철봉 위에 있는 자세로 시작합니다.',
      '3~5초에 걸쳐 천천히 내려옵니다.',
      '팔이 완전히 펴지면 발판을 딛고 다시 시작 자세로 갑니다.',
    ],
    cautions: ['안전한 시작 자세를 확보할 수 없으면 생략합니다.', '철봉에서 점프하지 않습니다.', '어깨 통증이 발생하면 즉시 중단합니다.'],
    breathing: '내려오는 동안 천천히 내쉽니다.',
    tips: ['한 번이라도 천천히 내려오는 것이 여러 번 빨리 하는 것보다 효과적입니다.'],
  },

  // ── D. 하체 준비운동 ─────────────────────────────
  {
    id: 'ankle-knee', name: '발목 무릎 밀기', part: '발목', category: 'warmup', art: 'lunge',
    unit: 'reps', perSide: true, defaultSets: 1, defaultTarget: 10, restSec: 15,
    summary: '무릎을 앞으로 밀어 발목 가동 범위를 준비',
    steps: ['벽을 마주 보고 한 발을 앞에 둡니다.', '뒤꿈치를 바닥에 붙인 채 무릎을 벽 쪽으로 밉니다.', '천천히 돌아오고 반대쪽도 진행합니다.'],
    cautions: ['뒤꿈치가 뜨지 않게 합니다.', '통증 없는 범위에서만 진행합니다.'],
    breathing: '무릎을 밀 때 내쉽니다.',
    tips: ['무릎이 두 번째 발가락 방향을 향하게 합니다.'],
  },
  {
    id: 'hip-flexor', name: '고관절 앞쪽 스트레칭', part: '고관절', category: 'warmup', art: 'hip-flexor',
    unit: 'sec', perSide: true, defaultSets: 1, defaultTarget: 20, restSec: 15,
    summary: '한쪽 무릎을 꿇고 고관절 앞쪽을 늘이기',
    steps: ['한쪽 무릎을 바닥에 대고 반대 발을 앞에 둡니다.', '엉덩이에 살짝 힘을 주고 골반을 앞으로 보냅니다.', '정해진 시간 유지 후 반대쪽도 진행합니다.'],
    cautions: ['허리를 젖혀서 늘이지 않습니다.', '무릎이 아프면 수건을 받칩니다.'],
    breathing: '유지하는 동안 천천히 길게 호흡합니다.',
    tips: ['뒤쪽 다리 허벅지 앞이 늘어나는 느낌이면 충분합니다.'],
  },
  {
    id: 'sit-stand', name: '가볍게 앉았다 일어서기', part: '하체 전체', category: 'warmup', art: 'squat',
    unit: 'reps', defaultSets: 1, defaultTarget: 10, restSec: 15,
    summary: '스쿼트 전 가벼운 범위로 관절 데우기',
    steps: ['편하게 서서 가벼운 깊이로 앉았다 일어섭니다.', '반복할수록 조금씩 깊이를 늘립니다.'],
    cautions: ['허리나 무릎에 불편함이 있으면 깊이를 줄입니다.'],
    breathing: '앉을 때 들이마시고, 일어설 때 내쉽니다.',
    tips: ['의자를 뒤에 두고 엉덩이를 살짝 대었다 일어나도 좋습니다.'],
  },

  // ── D. 스쿼트 ────────────────────────────────────
  {
    id: 'squat', name: '스쿼트', part: '허벅지 · 엉덩이', category: 'strength', art: 'squat',
    unit: 'reps', defaultSets: 2, defaultTarget: 12, range: '10~15회', restSec: 0,
    summary: '하체 근력의 기본 동작 · 적응 후 3세트 목표',
    steps: [
      '발을 어깨너비 정도로 벌립니다.',
      '발끝을 자연스럽게 바깥으로 향하게 합니다.',
      '무릎이 발끝 방향을 따라 움직이도록 합니다.',
      '발바닥 전체로 바닥을 밀며 일어납니다.',
      '허리나 무릎에 불편함이 없는 깊이로 진행합니다.',
    ],
    cautions: ['무릎이 안쪽으로 모이지 않게 합니다.', '통증이 있으면 깊이를 줄이거나 중단합니다.'],
    breathing: '앉을 때 들이마시고, 일어설 때 내쉽니다.',
    tips: ['적응기(2주)가 지나고 컨디션이 좋다면 3세트로 늘려 볼 수 있습니다.', '세트 사이 휴식은 60~90초를 권장합니다.'],
  },

  // ── E. 힙 브리지 ─────────────────────────────────
  {
    id: 'hip-bridge', name: '힙 브리지', part: '엉덩이 · 고관절', category: 'strength', art: 'bridge',
    unit: 'reps', defaultSets: 2, defaultTarget: 12, range: '12~15회', restSec: 0,
    summary: '엉덩이 근육 및 고관절 신전 능력 강화 · 적응 후 3세트 목표',
    steps: [
      '등을 바닥에 대고 눕습니다.',
      '무릎을 구부리고 발바닥을 바닥에 붙입니다.',
      '복부에 가볍게 힘을 줍니다.',
      '엉덩이를 들어 올립니다.',
      '위에서 2초 유지합니다.',
      '천천히 내려옵니다.',
    ],
    cautions: ['허리를 과하게 젖히지 않도록 주의합니다.'],
    breathing: '들어 올릴 때 내쉬고, 내려올 때 들이마십니다.',
    tips: ['허리보다 엉덩이에 힘이 들어가는 느낌에 집중합니다.'],
  },

  // ── F. 데드버그 ──────────────────────────────────
  {
    id: 'deadbug', name: '데드버그', part: '코어 · 골반', category: 'strength', art: 'deadbug',
    unit: 'reps', perSide: true, defaultSets: 2, defaultTarget: 8, restSec: 0,
    summary: '코어와 골반 안정성 강화',
    steps: [
      '등을 바닥에 대고 눕습니다.',
      '양팔과 다리를 들어 올립니다.',
      '반대쪽 팔과 다리를 천천히 뻗습니다.',
      '허리가 과하게 뜨지 않도록 유지합니다.',
      '원래 자세로 돌아와 반대쪽을 진행합니다.',
    ],
    cautions: ['허리가 바닥에서 크게 뜨면 뻗는 범위를 줄입니다.'],
    breathing: '호흡을 참지 않습니다. 팔다리를 뻗을 때 내쉽니다.',
    tips: ['어렵다면 다리만 번갈아 내리는 것부터 시작합니다.'],
  },

  // ── G. 유산소 ────────────────────────────────────
  {
    id: 'brisk-walk', name: '빠르게 걷기', part: '심폐 · 전신', category: 'cardio', art: 'walk',
    unit: 'min', defaultSets: 1, defaultTarget: 25, range: '20~30분', restSec: 0,
    summary: '심폐지구력 및 심혈관 건강 강화 · 주 3~5회',
    steps: ['대화는 가능하지만 숨이 조금 차는 속도로 걷습니다.', '팔을 자연스럽게 흔들고 시선은 앞을 봅니다.'],
    cautions: ['처음부터 무리하지 않습니다.', '가슴 통증이나 어지러움이 있으면 즉시 멈춥니다.'],
    breathing: '편안하게 코와 입으로 리듬 있게 호흡합니다.',
    tips: ['장기적으로 주당 약 150분의 중강도 유산소 운동을 목표로 합니다.'],
  },
  {
    id: 'light-stretch', name: '가벼운 스트레칭', part: '전신', category: 'mobility', art: 'stretch',
    unit: 'min', defaultSets: 1, defaultTarget: 10, restSec: 0,
    summary: '걷기 후 몸을 풀어 주는 회복 시간',
    steps: ['종아리, 허벅지 앞뒤, 가슴, 어깨 순서로 부드럽게 늘입니다.', '부위마다 20~30초 정도 편하게 유지합니다.'],
    cautions: ['반동을 주지 않습니다.', '통증이 느껴지기 전에서 멈춥니다.'],
    breathing: '늘이는 동안 길게 내쉽니다.',
    tips: ['휴식에 가까운 시간입니다. 기분 좋은 정도면 충분합니다.'],
  },
];

// 잘못된 자세 — 운동 상세에 '이렇게 하지 마세요'로 표시
const MISTAKES: Record<string, string[]> = {
  'scap-pushup': ['팔꿈치를 굽혀 일반 푸쉬업처럼 하는 것', '어깨가 귀 쪽으로 올라가는 것'],
  'wall-slide': ['허리를 젖혀 팔을 더 높이 올리려는 것', '빠르게 반동을 주는 것'],
  'doorway-stretch': ['통증이 느껴질 만큼 몸을 깊이 내미는 것', '팔꿈치를 어깨보다 너무 높게 대는 것'],
  'incline-pushup': ['허리가 처지거나 엉덩이가 들리는 것', '팔꿈치를 몸통에서 90도로 벌리는 것', '고개만 앞으로 내미는 것'],
  pushup: ['허리가 처지거나 엉덩이가 들리는 것', '팔꿈치를 몸통에서 90도로 벌리는 것', '고개만 앞으로 내미는 것', '무릎 푸쉬업에서 엉덩이를 뒤로 빼고 상체만 움직이는 것'],
  'assisted-hang': ['어깨가 귀에 붙을 정도로 힘없이 늘어지는 것', '몸을 흔드는 것'],
  'scap-pullup': ['팔꿈치를 굽혀 당기는 것', '반동을 주는 것'],
  'foot-pullup': ['다리로 점프하듯 차고 올라가는 것', '내려올 때 툭 떨어지는 것', '불안정한 의자를 발판으로 쓰는 것'],
  'negative-pullup': ['1초 만에 떨어지듯 내려오는 것', '점프해서 시작 자세를 잡는 것'],
  'ankle-knee': ['뒤꿈치가 바닥에서 뜨는 것', '무릎이 안쪽으로 꺾이는 것'],
  'hip-flexor': ['허리를 젖혀서 늘이는 것'],
  'sit-stand': ['털썩 앉는 것'],
  'squat': ['무릎이 안쪽으로 모이는 것', '뒤꿈치가 들리는 것', '허리가 둥글게 말리는 것'],
  'hip-bridge': ['허리를 꺾어 엉덩이를 높이 올리는 것', '발이 엉덩이에서 너무 먼 것'],
  'deadbug': ['허리가 바닥에서 크게 뜨는 것', '숨을 참는 것', '빠르게 팔다리를 휘두르는 것'],
  'brisk-walk': ['처음부터 숨이 너무 차서 말을 못 할 속도로 걷는 것'],
  'light-stretch': ['반동을 주며 늘이는 것'],
};
for (const e of EXERCISES) e.mistakes = MISTAKES[e.id];

export const EX_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const getEx = (id: string): Exercise | undefined => EX_MAP[id];

export const CATEGORY_LABEL: Record<Exercise['category'], string> = {
  warmup: '준비운동',
  strength: '근력',
  pull: '풀업',
  cardio: '유산소',
  mobility: '회복',
};

export function formatTarget(ex: Exercise, target: number): string {
  if (ex.unit === 'sec') return ex.perSide ? `좌우 각 ${target}초` : `${target}초`;
  if (ex.unit === 'min') return `${target}분`;
  return ex.perSide ? `좌우 각 ${target}회` : `${target}회`;
}

export function unitLabel(ex: Exercise): string {
  return ex.unit === 'sec' ? '초' : ex.unit === 'min' ? '분' : '회';
}
