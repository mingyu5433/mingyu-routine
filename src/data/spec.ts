import type { Exercise } from '../types';

/**
 * 「개인 맞춤형 맨몸운동 프로그램 및 운동 앱 제작 명세서」(2026-11-08) 기준 운동 데이터.
 * 기존 운동은 SPEC_OVERRIDE로 명세서 내용을 덮어쓰고, 새 운동은 SPEC_EXERCISES로 추가합니다.
 */

type E = Exercise;
const base = (e: Partial<E> & Pick<E, 'id' | 'name' | 'part' | 'category' | 'unit' | 'defaultSets' | 'defaultTarget' | 'summary' | 'steps'>): E => ({
  restSec: 0, cautions: [], breathing: '편하게 계속 호흡합니다.', tips: [], art: e.id, ...e,
});

export const SPEC_EXERCISES: E[] = [
  // ── 준비운동 ─────────────────────────────────────
  base({
    id: 'march', name: '제자리 걷기', part: '전신', category: 'warmup', unit: 'sec', defaultSets: 1, defaultTarget: 60, art: 'brisk-walk',
    purpose: '몸에 열을 내고 관절을 깨우기', summary: '팔을 흔들며 제자리에서 걷기 · 몸에 열이 약간 나는 정도',
    start: '발을 골반 너비로 벌리고 섭니다.',
    steps: ['팔을 자연스럽게 흔들며 제자리에서 걷습니다.', '처음 30초는 천천히, 이후 조금 빠르게 걷습니다.', '몸에 열이 약간 발생하는 정도로 진행합니다.'],
    feel: '몸이 따뜻해지고 숨이 조금 빨라지는 느낌', areas: ['knee'],
  }),
  base({
    id: 'shoulder-rolls', name: '어깨 원 그리기', part: '어깨', category: 'warmup', unit: 'reps', each: '앞뒤 각', defaultSets: 1, defaultTarget: 10,
    purpose: '어깨 주변 근육을 부드럽게 풀기', summary: '양팔을 내린 채 어깨만 앞뒤로 둥글게 돌리기',
    start: '양팔을 옆으로 편안하게 내리고 섭니다.',
    steps: ['어깨를 앞쪽으로 부드럽게 10회 둥글게 돌립니다.', '이어서 뒤쪽으로 10회 돌립니다.', '어깨를 과도하게 으쓱하지 않고 편한 크기로 돌립니다.'],
    mistakes: ['어깨를 귀까지 세게 으쓱하는 것', '빠르게 휘두르는 것'], areas: ['shoulder'],
  }),
  base({
    id: 'torso-rotation', name: '몸통 회전', part: '등 · 옆구리', category: 'warmup', unit: 'reps', each: '좌우 각', defaultSets: 1, defaultTarget: 10,
    purpose: '등 위쪽(흉추)을 부드럽게 돌려 준비하기', summary: '골반은 정면, 몸통만 좌우로 천천히 회전',
    start: '발을 골반 너비로 벌리고 섭니다. 팔은 가슴 앞에서 가볍게 X자로 모읍니다.',
    steps: ['골반은 정면에 가깝게 고정합니다.', '몸통을 오른쪽으로 천천히 돌렸다가 가운데로 돌아옵니다.', '왼쪽도 같은 방법으로 합니다. 좌우 한 번씩이 1회입니다.'],
    mistakes: ['허리를 강하게 비트는 것', '골반까지 같이 돌아가는 것'], cautions: ['허리를 강하게 비틀지 않습니다.'], areas: ['back'],
  }),
  base({
    id: 'hip-circles', name: '고관절 돌리기', part: '고관절', category: 'warmup', unit: 'reps', each: '좌우 각', defaultSets: 1, defaultTarget: 10,
    purpose: '고관절 가동 범위를 부드럽게 넓히기', summary: '벽을 짚고 한쪽 무릎을 들어 작은 원 그리기',
    start: '벽을 옆에 두고 한 손으로 가볍게 짚고 섭니다.',
    steps: ['벽 반대쪽 다리의 무릎을 골반 높이 가까이 들어 올립니다.', '무릎으로 바깥쪽 방향의 작은 원을 천천히 그립니다.', '한쪽을 마치면 반대쪽도 같은 횟수로 합니다.'],
    mistakes: ['골반과 허리가 크게 흔들리는 것', '원을 너무 크게 그려 몸이 기우는 것'], cautions: ['골반과 허리가 과하게 흔들리지 않도록 합니다.'], areas: ['knee'],
  }),
  base({
    id: 'squat-light', name: '가벼운 스쿼트', part: '하체', category: 'warmup', unit: 'reps', defaultSets: 1, defaultTarget: 8, art: 'squat',
    purpose: '무릎과 고관절을 본운동 전에 데우기', summary: '평소보다 얕은 깊이로 천천히 앉았다 일어서기',
    steps: ['발을 어깨너비로 벌립니다.', '평소보다 얕은 깊이로 천천히 앉았다 일어납니다.', '무릎과 발끝 방향을 비슷하게 유지합니다.'],
    areas: ['knee'],
  }),
  base({
    id: 'wall-pushup', name: '벽 푸쉬업', part: '가슴 · 어깨', category: 'warmup', unit: 'reps', defaultSets: 1, defaultTarget: 8,
    purpose: '어깨와 팔꿈치 움직임을 가볍게 준비하기', summary: '벽에 손을 대고 가볍게 하는 푸쉬업',
    start: '벽에서 한 걸음 떨어져 서서 손을 어깨 높이·어깨너비로 벽에 댑니다.',
    steps: ['몸을 일직선으로 유지한 채 팔꿈치를 굽혀 가슴을 벽 쪽으로 가져갑니다.', '손으로 벽을 밀어 시작 자세로 돌아옵니다.', '어깨 통증이 없는 범위에서만 합니다.'],
    mistakes: ['엉덩이만 뒤로 빠지는 것'], areas: ['shoulder'],
  }),
  base({
    id: 'slow-walk', name: '천천히 걷기', part: '전신', category: 'warmup', unit: 'min', defaultSets: 1, defaultTarget: 2, art: 'brisk-walk',
    purpose: '유산소 전에 심박을 천천히 올리기', summary: '편안한 속도로 2분 걷기',
    steps: ['평소 걷는 속도로 편하게 걷습니다.', '어깨에 힘을 빼고 팔을 자연스럽게 흔듭니다.'],
  }),
  base({
    id: 'ankle-circles', name: '발목 돌리기', part: '발목', category: 'warmup', unit: 'reps', each: '좌우 각', defaultSets: 1, defaultTarget: 10,
    purpose: '걷기 전에 발목을 부드럽게 풀기', summary: '한 발을 들어 발목으로 원 그리기',
    start: '벽이나 의자를 짚고 한 발을 살짝 듭니다. (앉아서 해도 됩니다)',
    steps: ['발끝으로 큰 원을 그리듯 발목을 천천히 돌립니다.', '바깥쪽으로 5회, 안쪽으로 5회 돌리고 발을 바꿉니다.'],
  }),
  base({
    id: 'knee-march', name: '제자리 무릎 들어 걷기', part: '고관절 · 하체', category: 'warmup', unit: 'sec', defaultSets: 1, defaultTarget: 30,
    purpose: '고관절을 들어 올리는 근육을 깨우기', summary: '무릎을 골반 높이 가까이 번갈아 들며 제자리 걷기',
    steps: ['상체를 곧게 세우고 무릎을 번갈아 골반 높이 가까이 들어 올립니다.', '반대쪽 팔을 함께 흔듭니다.', '편안한 속도로 30초 진행합니다.'],
    mistakes: ['상체가 뒤로 젖혀지는 것'], areas: ['knee'],
  }),

  // ── 본운동 ───────────────────────────────────────
  base({
    id: 'side-plank', name: '사이드 플랭크', part: '옆구리 · 코어', category: 'strength', unit: 'sec', each: '좌우 각', defaultSets: 2, defaultTarget: 15, restSec: 60,
    purpose: '옆구리와 골반 주변 안정성 강화', summary: '옆으로 누워 팔꿈치로 버티며 몸통을 일직선으로 유지',
    start: '옆으로 누워 팔꿈치를 어깨 바로 아래에 둡니다. 처음에는 무릎을 구부린 자세로 시작할 수 있습니다.',
    steps: ['팔꿈치로 바닥을 밀며 골반을 들어 올립니다.', '머리부터 무릎(또는 발)까지 일직선을 유지합니다.', '골반이 앞뒤로 돌아가지 않게 정해진 시간 버팁니다.', '반대쪽도 같은 시간 진행합니다.'],
    feel: '아래쪽 옆구리가 단단하게 버티는 느낌',
    mistakes: ['골반이 바닥 쪽으로 처지는 것', '골반이 앞이나 뒤로 돌아가는 것', '숨을 참는 것'],
    cautions: ['어깨 통증이 있으면 데드버그로 대체합니다.', '숨을 참지 않습니다.'],
    alt: '데드버그 (어깨 통증이 있을 때)',
    levels: [{ name: '무릎 굽혀서', how: '무릎을 90도로 굽혀 무릎과 팔꿈치로 버팁니다.' }, { name: '다리 펴고', how: '다리를 펴고 발 옆면과 팔꿈치로 버팁니다.' }],
    areas: ['shoulder', 'back'],
  }),
  base({
    id: 'pelvic-breath', name: '복식호흡 · 골반저근 조절', part: '골반저근 · 호흡', category: 'strength', unit: 'min', defaultSets: 1, defaultTarget: 3, art: 'm-breath',
    purpose: '골반저근의 적절한 수축과 충분한 이완 연습', summary: '편하게 누워 호흡에 맞춰 골반저근을 가볍게 수축했다가 충분히 풀기',
    start: '등을 대고 편안하게 누워 무릎을 세웁니다. 한 손은 배 위에 둡니다.',
    steps: [
      '1분간 자연스러운 복식호흡을 합니다. 들이마실 때 배가 부풀고, 내쉴 때 꺼집니다.',
      '불편감이 없다면 숨을 내쉬면서 골반저근(소변을 멈출 때 쓰는 근육 부위)을 가볍게 끌어올리듯 수축합니다.',
      '3초 수축한 뒤 약 6초간 충분히 힘을 풉니다.',
      '이것을 5회 반복합니다.',
      '마지막에는 골반 주변 힘을 모두 빼고 편안하게 호흡합니다.',
    ],
    mistakes: ['소변을 실제로 참는 행동으로 연습하는 것', '엉덩이와 배를 세게 조이는 것', '수축만 하고 충분히 풀지 않는 것'],
    cautions: ['통증, 압박감, 배뇨 불편감이 있다면 중단합니다.', '골반저근 훈련이 모든 남성의 성기능을 개선하는 것은 아닙니다.'],
    breathing: '수축은 내쉬는 숨에, 이완은 들이쉬는 숨에 맞춥니다.',
  }),
  base({
    id: 'hip-hinge', name: '맨몸 힙 힌지', part: '엉덩이 · 허벅지 뒤', category: 'strength', unit: 'reps', defaultSets: 3, defaultTarget: 10, restSec: 90,
    purpose: '고관절 후면(엉덩이·햄스트링) 사용법 익히기', summary: '무릎은 살짝 굽힌 채 엉덩이를 뒤로 보내며 상체를 기울였다 일어나기',
    start: '발을 골반 너비로 벌리고 무릎을 살짝 굽힙니다. 손은 허리나 허벅지 앞에 둡니다.',
    steps: ['엉덩이를 뒤로 보내며 상체를 앞으로 기울입니다. 허리는 자연스러운 정렬을 유지합니다.', '허벅지 뒤쪽이 당기는 지점까지만 내려갑니다.', '엉덩이 근육에 힘을 주며 일어납니다.'],
    feel: '허벅지 뒤쪽이 당기고, 일어설 때 엉덩이에 힘이 들어가는 느낌',
    mistakes: ['허리를 둥글게 마는 것', '허리를 과도하게 젖히는 것', '무릎을 크게 굽혀 스쿼트가 되는 것'],
    cautions: ['허리 통증이 있으면 중단합니다.', '맨몸 힙 힌지는 초기 움직임 학습에 효과적이지만, 장기적인 햄스트링 근력 향상에는 점진적인 부하 증가가 필요합니다.'],
    alt: '글루트 브리지 (허리가 불편할 때)',
    levels: [{ name: '양발 맨몸', how: '두 발로 서서 진행합니다.' }, { name: '한쪽 다리 중심', how: '한쪽 발뒤꿈치를 살짝 들어 반대쪽 다리에 체중을 더 싣습니다.' }],
    areas: ['back'],
  }),
  base({
    id: 'chair-squat', name: '의자 스쿼트', part: '허벅지 · 엉덩이', category: 'strength', unit: 'reps', defaultSets: 2, defaultTarget: 10, restSec: 90, art: 'sit-stand',
    purpose: '안정적인 스쿼트 깊이와 균형 익히기', summary: '의자에 가볍게 닿거나 앉았다가 일어서기',
    start: '안정적인 의자 앞에 등을 지고 섭니다. 발은 어깨너비입니다.',
    steps: ['엉덩이를 뒤로 보내며 천천히 앉습니다.', '의자에 가볍게 닿거나 앉았다가 일어납니다.', '발바닥 전체로 바닥을 밀어 일어납니다.'],
    mistakes: ['털썩 앉는 것', '무릎이 안쪽으로 모이는 것'],
    cautions: ['무릎 통증이 생기면 깊이를 줄이거나 중단합니다.'],
    alt: '글루트 브리지 (무릎이 불편할 때)',
    levels: [{ name: '의자에 앉았다 일어서기', how: '의자에 완전히 앉았다가 일어납니다.' }, { name: '살짝만 닿기', how: '엉덩이가 의자에 닿기만 하고 바로 일어납니다.' }],
    areas: ['knee'],
  }),
  base({
    id: 'bird-dog', name: '버드독', part: '코어 · 등 · 엉덩이', category: 'strength', unit: 'reps', each: '좌우 각', defaultSets: 2, defaultTarget: 8, restSec: 60,
    purpose: '척추를 고정한 채 팔다리를 움직이는 코어 안정성', summary: '네발기기 자세에서 반대쪽 팔과 다리를 뻗어 2초 유지',
    start: '손은 어깨 아래, 무릎은 골반 아래에 두고 네발기기 자세를 만듭니다. 등은 평평하게 유지합니다.',
    steps: ['오른팔은 앞으로, 왼다리는 뒤로 천천히 뻗습니다.', '팔과 다리가 몸통과 일직선이 되는 높이에서 2초간 유지합니다.', '천천히 돌아와 반대쪽(왼팔 + 오른다리)을 합니다.', '허리와 골반이 흔들리지 않도록 합니다.'],
    feel: '배와 엉덩이가 함께 버티는 느낌',
    mistakes: ['다리를 너무 높이 들어 허리가 꺾이는 것', '골반이 옆으로 기우는 것'],
    cautions: ['무릎이 아프면 매트를 두껍게 깝니다.'], alt: '데드버그',
    levels: [{ name: '2초 유지', how: '뻗은 자세에서 2초 유지합니다.' }, { name: '3초 유지', how: '뻗은 자세에서 3초 유지하고 더 천천히 돌아옵니다.' }],
    areas: ['back'],
  }),
  base({
    id: 'cat-cow', name: '고양이-소 자세', part: '척추', category: 'mobility', unit: 'reps', defaultSets: 1, defaultTarget: 8,
    purpose: '척추를 호흡에 맞춰 부드럽게 움직이기', summary: '네발기기 자세에서 등을 둥글게 말았다가 천천히 펴기',
    start: '손은 어깨 아래, 무릎은 골반 아래에 두고 네발기기 자세를 만듭니다.',
    steps: ['숨을 내쉬며 등을 천장 쪽으로 둥글게 말고 시선은 배꼽을 봅니다. (고양이)', '숨을 들이마시며 가슴을 앞으로 내밀고 시선을 살짝 앞으로 둡니다. (소)', '천천히 호흡에 맞춰 반복합니다.'],
    mistakes: ['허리를 끝까지 꺾는 것', '빠르게 반복하는 것'], cautions: ['허리를 끝까지 꺾지 않습니다.'], areas: ['back'],
  }),
  base({
    id: 'clamshell', name: '클램셸', part: '엉덩이 옆', category: 'strength', unit: 'reps', each: '좌우 각', defaultSets: 2, defaultTarget: 12, restSec: 60,
    purpose: '엉덩이 옆 근육(중둔근) 강화로 골반·무릎 안정', summary: '옆으로 누워 발을 붙인 채 위쪽 무릎만 들어 올리기',
    start: '옆으로 누워 머리를 팔에 기대고, 무릎을 굽혀 두 발을 붙입니다.',
    steps: ['골반을 고정한 상태에서 발은 붙인 채 위쪽 무릎을 들어 올립니다.', '골반이 뒤로 넘어가지 않는 높이에서 멈춥니다.', '천천히 내려옵니다.', '한쪽을 마치면 반대쪽도 합니다.'],
    feel: '위쪽 엉덩이 옆이 조이는 느낌',
    mistakes: ['골반이 뒤로 젖혀지며 무릎을 들어 올리는 것', '빠르게 반동으로 하는 것'],
    levels: [{ name: '기본', how: '들어 올렸다 바로 내립니다.' }, { name: '위에서 2초 유지', how: '맨 위에서 2초 멈춘 뒤 내립니다.' }],
  }),
  base({
    id: 'calf-raise', name: '카프 레이즈', part: '종아리', category: 'strength', unit: 'reps', defaultSets: 2, defaultTarget: 12, restSec: 60,
    purpose: '종아리 근력과 발목 안정성 향상', summary: '벽을 짚고 발뒤꿈치를 천천히 들었다 내리기',
    start: '벽을 가볍게 짚고 발을 골반 너비로 벌려 섭니다.',
    steps: ['발뒤꿈치를 천천히 들어 올립니다.', '맨 위에서 잠시 유지합니다.', '천천히 내려옵니다. 반동을 사용하지 않습니다.'],
    feel: '종아리가 조이는 느낌', mistakes: ['튕기듯 빠르게 하는 것', '발목이 바깥으로 꺾이는 것'],
    levels: [{ name: '양발', how: '두 발로 진행합니다.' }, { name: '한 발', how: '한 발씩 진행합니다.' }],
  }),

  // ── 스트레칭 ─────────────────────────────────────
  base({
    id: 'shoulder-stretch', name: '어깨 뒤쪽 스트레칭', part: '어깨 뒤쪽', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 20,
    purpose: '어깨 뒤쪽을 부드럽게 늘리기', summary: '한쪽 팔을 가슴 앞으로 가져와 반대 손으로 부드럽게 지지',
    steps: ['한쪽 팔을 펴서 가슴 앞으로 가져옵니다.', '반대 손으로 팔꿈치 위쪽을 부드럽게 지지해 몸 쪽으로 당깁니다.', '어깨 관절에 통증이 없는 범위에서 유지합니다.'],
    mistakes: ['어깨가 귀 쪽으로 올라가는 것', '세게 잡아당기는 것'], areas: ['shoulder'],
  }),
  base({
    id: 'hipflexor-standing', name: '서서 하는 고관절 앞쪽 스트레칭', part: '고관절 앞', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 30,
    purpose: '오래 앉아 짧아진 고관절 앞쪽을 늘리기', summary: '한 발을 뒤로 보내 앞뒤로 서서 뒤쪽 다리의 고관절 앞을 늘리기',
    start: '한 발을 한 걸음 뒤로 보내 앞뒤로 섭니다. 뒤꿈치는 들어도 됩니다.',
    steps: ['꼬리뼈를 살짝 말아 넣고 뒤쪽 엉덩이에 힘을 줍니다.', '골반을 과하게 꺾지 않고 몸 전체를 앞으로 조금 보냅니다.', '뒤쪽 다리의 고관절 앞이 늘어나는 곳에서 유지합니다.'],
    feel: '뒤쪽 다리의 골반 앞(서혜부)', mistakes: ['허리를 젖혀서 늘리는 것'],
  }),
  base({
    id: 'figure4', name: '누워서 엉덩이 스트레칭', part: '엉덩이', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 30, art: 'm-figure4',
    purpose: '엉덩이 깊은 근육을 늘리기', summary: '누워서 한쪽 발목을 반대쪽 허벅지 위에 올리고 몸 쪽으로 당기기',
    steps: ['누운 상태에서 무릎을 세웁니다.', '한쪽 발목을 반대쪽 허벅지(무릎 바로 위) 위에 올립니다.', '아래쪽 허벅지를 두 손으로 잡고 몸 쪽으로 부드럽게 당깁니다.'],
    feel: '올린 다리 쪽 엉덩이 바깥', cautions: ['무릎에 통증이 있으면 생략합니다.'], areas: ['knee'],
  }),
  base({
    id: 'belly-breath', name: '복식호흡', part: '호흡', category: 'mobility', unit: 'min', defaultSets: 1, defaultTarget: 1, art: 'm-breath',
    purpose: '운동을 마무리하고 몸의 긴장 풀기', summary: '코로 편안하게 들이마시고 천천히 내쉬기',
    steps: ['편하게 누워 한 손은 배, 한 손은 가슴에 둡니다.', '코로 편안하게 들이마시며 배와 갈비뼈가 자연스럽게 부풀게 합니다.', '입으로 천천히 내쉽니다.'],
    cautions: ['숨을 억지로 길게 참지 않습니다.'],
  }),
  base({
    id: 'calf-stretch', name: '종아리 스트레칭', part: '종아리', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 30, art: 'm-calf',
    purpose: '걷기 후 종아리 긴장 풀기', summary: '벽을 짚고 뒤쪽 다리의 뒤꿈치를 바닥에 붙여 늘리기',
    steps: ['벽을 짚고 한 발을 뒤로 크게 뺍니다.', '뒤쪽 발뒤꿈치를 바닥에 붙이고 무릎을 편 채 몸을 벽 쪽으로 기울입니다.'],
    feel: '뒤쪽 다리 종아리',
  }),
  base({
    id: 'hamstring-stretch', name: '햄스트링 스트레칭', part: '허벅지 뒤', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 30, art: 'm-ham-standing',
    purpose: '허벅지 뒤쪽 유연성', summary: '한 발을 앞에 두고 허리를 편 채 엉덩이를 뒤로 빼며 상체 숙이기',
    steps: ['한 발을 반 걸음 앞에 두고 발끝을 듭니다.', '허리를 편 채 엉덩이를 뒤로 빼며 상체를 숙입니다.', '두 손은 뒤쪽 다리 허벅지에 얹습니다.'],
    feel: '앞쪽 다리의 허벅지 뒤', mistakes: ['등을 둥글게 말아 손을 발끝까지 뻗는 것'], areas: ['back'],
  }),
  base({
    id: 'neck-stretch', name: '목 옆 스트레칭', part: '목 · 어깨 위', category: 'mobility', unit: 'sec', each: '좌우 각', defaultSets: 1, defaultTarget: 15, art: 'm-neck',
    purpose: '목과 어깨 위쪽 긴장 풀기', summary: '고개를 옆으로 가볍게 기울이기',
    steps: ['편하게 앉거나 서서 어깨에 힘을 뺍니다.', '고개를 옆으로 가볍게 기울입니다.', '손으로 강하게 잡아당기지 않습니다.'],
  }),
];

/** 기존 운동에 명세서 내용 반영 */
export const SPEC_OVERRIDE: Record<string, Partial<E>> = {
  'incline-pushup': {
    name: '인클라인 푸쉬업', part: '가슴 · 삼두 · 어깨', category: 'strength', defaultSets: 3, defaultTarget: 10, restSec: 90, art: 'incline-pushup',
    purpose: '어깨에 무리를 줄이면서 가슴·삼두·어깨 근력 키우기', summary: '튼튼한 지지대에 손을 올리고 하는 푸쉬업 · 지지대가 높을수록 쉬워집니다',
    start: '움직이지 않는 튼튼한 지지대(책상, 침대 프레임, 계단 등)에 양손을 올립니다. 손은 어깨너비 또는 약간 넓게 둡니다.',
    steps: ['머리부터 발끝까지 몸통을 일직선으로 유지합니다.', '팔꿈치는 몸통에서 약 30~45도 벌립니다.', '가슴을 지지대 쪽으로 2~3초 동안 천천히 내립니다.', '손으로 밀어 시작 자세로 돌아옵니다.'],
    mistakes: ['허리가 아래로 꺾이는 것', '어깨가 귀 쪽으로 올라가는 것', '팔꿈치가 90도로 벌어지는 것'],
    cautions: ['어깨 앞쪽에 통증이 발생하면 중단합니다.', '지지대 높이가 높을수록 난도가 낮아집니다.'],
    alt: '벽 푸쉬업 (어깨가 불편할 때)',
    levels: [
      { name: '높은 지지대 (책상 높이)', how: '허리 높이의 튼튼한 지지대에 손을 짚습니다.' },
      { name: '낮은 지지대 (의자·침대 높이)', how: '무릎 높이 정도의 지지대에 손을 짚습니다.' },
      { name: '일반 푸쉬업 (바닥)', how: '바닥에 손을 짚고 발끝으로 섭니다.' },
    ],
    areas: ['shoulder'], feel: '가슴 가운데와 팔 뒤쪽이 뻐근한 느낌',
  },
  'foot-pullup': {
    purpose: '풀업 0회에서 첫 풀업으로 가기 위한 등·팔 근력', defaultSets: 3, defaultTarget: 4, restSec: 120,
    start: '문틀 철봉의 고정 상태를 먼저 확인합니다. 안전하게 발을 지지할 수 있는 환경(흔들리지 않는 발판)에서만 실시합니다.',
    mistakes: ['반동을 사용하는 것', '다리로만 밀어 올라가는 것', '내려올 때 툭 떨어지는 것'],
    cautions: ['불안정한 의자나 발판을 사용하지 않습니다.', '철봉 설치 높이와 구조상 안전한 발 보조가 불가능하면 실시하지 않고 발 지지 스캐풀러 풀업으로 대체합니다.', '어깨 통증이나 불안정감이 생기면 중단합니다.'],
    alt: '발 지지 스캐풀러 풀업',
    levels: [
      { name: '발 보조 많이', how: '다리로 체중의 절반 가까이를 지탱합니다.' },
      { name: '발 보조 줄이기', how: '다리는 모자란 힘만 거들도록 체중을 덜 싣습니다.' },
      { name: '다리는 균형만', how: '발은 균형만 잡고 팔과 등으로 당깁니다.' },
      { name: '네거티브 풀업 병행', how: '세트 마지막 1~2회는 위에서 4초 동안 천천히 내려옵니다.' },
    ],
    areas: ['shoulder'],
  },
  'scap-pullup': {
    name: '발 지지 스캐풀러 풀업', purpose: '풀업의 첫 단계인 날개뼈 끌어내리기 익히기', defaultSets: 3, defaultTarget: 6, restSec: 90,
    start: '철봉을 어깨너비로 잡고, 발로 안전하게 체중 일부를 지지합니다.',
    steps: ['팔꿈치를 거의 편 상태로 유지합니다.', '어깨뼈(날개뼈)를 아래로 내리는 느낌으로 몸을 조금 움직입니다.', '천천히 원래 위치로 돌아옵니다.'],
    mistakes: ['팔꿈치를 굽혀 당기는 것', '완전히 힘을 풀고 어깨 관절에 매달리는 것'],
    cautions: ['어깨에 통증이 없을 때만 진행합니다.', '철봉이 불안정하면 실시하지 않습니다.'],
    levels: [{ name: '발 지지', how: '발로 체중 일부를 지지합니다.' }, { name: '발 지지 줄이기', how: '발끝만 살짝 대고 합니다.' }, { name: '발 떼고', how: '무릎을 굽혀 발을 뒤로 들고 합니다.' }],
    areas: ['shoulder'],
  },
  squat: {
    name: '맨몸 스쿼트', purpose: '하체 근력과 안정적인 스쿼트 자세', defaultSets: 3, defaultTarget: 10, restSec: 90,
    cautions: ['무릎 통증이 생기면 깊이를 줄이거나 중단합니다.', '허리를 과도하게 꺾지 않습니다.', '무릎이 발끝보다 앞으로 나오는 것 자체가 잘못된 자세는 아닙니다.', '통증 없는 움직임과 균형을 우선합니다.'],
    alt: '의자 스쿼트 (깊이가 불안할 때)',
    levels: [{ name: '기본 속도', how: '2초 내려가고 1초에 일어납니다.' }, { name: '3초 천천히 내려가기', how: '3초 동안 천천히 내려갑니다.' }, { name: '아래에서 1초 멈춤', how: '가장 아래에서 1초 멈춘 뒤 일어납니다.' }],
    areas: ['knee', 'back'],
  },
  'hip-bridge': {
    name: '글루트 브리지', purpose: '엉덩이 근력과 골반 움직임 조절', defaultSets: 2, defaultTarget: 12, restSec: 60,
    cautions: ['허리를 과도하게 젖히지 않습니다.', '엉덩이 근육으로 움직입니다.', '허리 통증이 생기면 가동범위를 줄입니다.'],
    mistakes: ['허리를 꺾어 엉덩이를 높이 올리는 것', '발이 엉덩이에서 너무 먼 것'],
    levels: [{ name: '양발', how: '두 발로 진행합니다.' }, { name: '위에서 3초 유지', how: '맨 위에서 3초 유지합니다.' }, { name: '한 발 브리지', how: '한 발을 들고 반대쪽 발로만 들어 올립니다.' }],
    areas: ['back'],
  },
  deadbug: {
    purpose: '허리를 지키는 코어 안정성', defaultSets: 2, defaultTarget: 8, restSec: 60,
    levels: [{ name: '기본', how: '2초 동안 뻗고 2초 동안 돌아옵니다.' }, { name: '4초 천천히', how: '4초 동안 뻗습니다.' }],
    alt: '팔은 그대로 두고 다리만 번갈아 내리기',
    areas: ['back'],
  },
  'brisk-walk': {
    purpose: '심폐지구력과 혈관 건강', defaultTarget: 20,
    cautions: ['첫 2주는 20분부터 시작하고, 통증이 없다면 점진적으로 시간을 늘립니다.', '무릎 통증이 있으면 시간을 줄이거나 쉽니다.'], areas: ['knee'],
  },
  'arm-circles': {
    each: '앞뒤 각', purpose: '어깨 관절을 편안한 범위에서 움직여 준비하기',
    steps: ['양팔을 옆으로 벌립니다.', '작은 원부터 시작해서 편안한 범위로 움직입니다.', '앞으로 10회, 뒤로 10회 돌립니다.', '어깨 앞쪽 통증이 생기지 않도록 합니다.'],
    areas: ['shoulder'],
  },
  'doorway-stretch': {
    category: 'mobility', each: '좌우 각', defaultSets: 1, defaultTarget: 30, purpose: '말린 어깨 방향으로 짧아진 가슴 앞쪽 늘리기',
    cautions: ['어깨 앞쪽이 아프지 않은 팔 높이를 선택합니다.', '허리를 꺾지 않습니다.', '어깨 앞쪽에 통증이 있으면 생략합니다.'], areas: ['shoulder'],
  },
};
