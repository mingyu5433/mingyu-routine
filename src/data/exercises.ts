import type { Exercise } from '../types';
import { DETAIL } from './exerciseDetail';
import { V5_EXERCISES, V5_OVERRIDE } from './v5';
import { SPEC_EXERCISES, SPEC_OVERRIDE } from './spec';
import { DEMOS } from '../figure/demos';

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
    id: 'pushup', name: '푸쉬업', part: '가슴 · 삼두 · 어깨', category: 'strength', art: 'scap-pushup',
    unit: 'reps', defaultSets: 3, defaultTarget: 10, restSec: 0,
    summary: '가슴, 삼두근, 어깨 안정성 강화 · 11월 2일 테스트 최대 20회 기준으로 설계',
    steps: [
      '손은 어깨너비보다 약간 넓게 두고, 손목이 어깨 바로 아래에 오게 합니다.',
      '발끝으로 지지하고 뒤꿈치부터 머리까지 일직선을 만듭니다.',
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
      '세트당 목표는 최대 횟수의 50~90% 수준이라 마지막 1~2회가 힘든 정도가 정상입니다.',
      '목표만큼 못 했으면 한 만큼만 수정 버튼으로 적어 주세요. 다음 단계는 다 채웠을 때만 올라갑니다.',
      '어깨 앞쪽이 불편한 날은 내려가는 깊이를 줄이거나, 벽에 손을 짚는 벽 푸쉬업으로 대신합니다.',
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
    summary: '걷기 후 몸을 풀어 주는 회복 시간 (마무리 스트레칭)',
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
  pushup: ['허리가 처지거나 엉덩이가 들리는 것', '팔꿈치를 몸통에서 90도로 벌리는 것', '고개만 앞으로 내미는 것', '반만 내려가고 빠르게 튕겨 올라오는 것'],
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

EXERCISES.push({
  id: 'close-pushup', name: '좁은 푸쉬업', part: '삼두 · 가슴 안쪽', category: 'strength', art: 'close-pushup',
  unit: 'reps', defaultSets: 3, defaultTarget: 8, restSec: 0,
  summary: '손 간격을 좁혀 팔 뒤쪽(삼두)과 가슴 안쪽을 집중적으로 쓰는 푸쉬업',
  start: '일반 푸쉬업 자세에서 두 손을 어깨너비보다 좁게, 가슴 아래(명치 아래)에 둡니다. 엄지와 검지 사이가 주먹 하나 정도 떨어지면 됩니다. 발뒤꿈치부터 머리까지 일직선을 만듭니다.',
  steps: [
    '팔꿈치를 옆으로 벌리지 말고 옆구리를 스치듯 뒤로 접으며 "하나, 둘, 셋" 동안 내려갑니다.',
    '가슴이 손등 높이에 가까워지면 멈춥니다. 어깨 앞쪽이 불편하면 그보다 높은 곳에서 멈춥니다.',
    '숨을 내쉬며 손바닥으로 바닥을 밀어 1초 만에 올라오고, 맨 위에서 팔 뒤쪽을 조입니다.',
    '목표를 다 못 채우면 남은 횟수는 손 간격을 일반 푸쉬업으로 넓혀 채우고, 수정 버튼에는 좁게 한 횟수만 적습니다.',
  ],
  feel: '팔 뒤쪽(삼두)이 타는 느낌과 가슴 가운데 안쪽',
  cautions: ['손목이 아프면 손을 조금 넓히거나 주먹을 쥐고 합니다.', '어깨 앞쪽 통증을 참고 반복하지 않습니다.'],
  breathing: '내려갈 때 들이마시고, 밀어 올라올 때 내쉽니다.',
  tips: ['일반 푸쉬업보다 횟수가 적게 나오는 것이 정상입니다.', '팔꿈치를 몸에 붙이는 동작이라 일반 푸쉬업보다 어깨 앞쪽 부담이 적은 편입니다.'],
  mistakes: ['팔꿈치가 양옆으로 벌어지는 것', '손을 너무 붙여 손목이 꺾이는 것', '허리가 처지는 것'],
});

EXERCISES.push({
  id: 'plank', name: '플랭크', part: '코어 · 어깨 안정', category: 'strength', art: 'plank',
  unit: 'sec', defaultSets: 3, defaultTarget: 30, restSec: 45,
  summary: '팔꿈치와 발끝으로 몸을 일직선으로 버티는 코어 운동 · 무릎에 부담이 거의 없습니다',
  start: '엎드려 팔꿈치를 어깨 바로 아래에 두고 팔뚝을 바닥에 평행하게 댑니다. 발끝으로 서서 발뒤꿈치부터 머리까지 일직선을 만듭니다.',
  steps: [
    '배꼽을 등 쪽으로 당기고 엉덩이를 살짝 조여 허리가 처지지 않게 합니다.',
    '팔꿈치로 바닥을 밀어 날개뼈 사이가 꺼지지 않게 합니다.',
    '시선은 손 앞 바닥, 목은 몸과 일직선으로 둡니다.',
    '정해진 시간 동안 숨을 고르게 쉬며 버팁니다. 자세가 무너지기 시작하면 그 시점에서 멈추고 버틴 시간을 기록합니다.',
  ],
  feel: '배 전체가 단단하게 조이고 어깨 주변이 버티는 느낌',
  cautions: ['허리가 아프면 엉덩이를 조금 더 조이거나 시간을 줄입니다.'],
  breathing: '숨을 참지 말고 짧고 일정하게 쉽니다.',
  tips: ['무릎이 바닥에 닿지 않으므로 무릎이 불편한 날에도 할 수 있습니다.'],
  mistakes: ['허리가 바닥 쪽으로 처지는 것', '엉덩이가 산처럼 높이 올라가는 것', '숨을 참는 것'],
});

EXERCISES.push({
  id: 'arm-circles', name: '팔 크게 돌리기', part: '어깨 전체', category: 'warmup', art: 'stretch',
  unit: 'reps', defaultSets: 1, defaultTarget: 10, restSec: 15,
  summary: '어깨 관절을 부드럽게 데우는 동적 준비운동 (멈춰서 늘이는 스트레칭 대신)',
  start: '발을 어깨너비로 벌리고 서서 두 팔을 옆으로 뻗습니다. 배에 살짝 힘을 줍니다.',
  steps: [
    '손끝으로 작은 원을 그리며 앞으로 5회 돌립니다.',
    '원을 점점 크게 키워 팔 전체로 큰 원을 그리며 앞으로 5회 더 돌립니다.',
    '같은 방법으로 뒤로 10회 돌립니다. (작은 원 5회 → 큰 원 5회)',
    '한 바퀴에 2초 정도의 편한 속도로, 통증 없는 범위에서만 돌립니다.',
  ],
  feel: '어깨 주변이 따뜻해지고 움직임이 부드러워지는 느낌',
  cautions: ['어깨 앞쪽이 걸리거나 아프면 원을 작게 줄입니다.', '반동을 세게 주지 않습니다.'],
  breathing: '편하게 계속 호흡합니다.',
  tips: ['앞뒤 각 10회가 1세트입니다.'],
  mistakes: ['어깨를 으쓱 올린 채 돌리는 것', '허리를 젖히며 팔을 휘두르는 것'],
});

EXERCISES.push({
  id: 'dead-hang', name: '매달리기 (발 떼고)', part: '악력 · 어깨 · 등', category: 'pull', art: 'dead-hang',
  unit: 'sec', defaultSets: 1, defaultTarget: 15, restSec: 0,
  summary: '발판 없이 철봉에 매달려 버티기 · 테스트 데이 측정용',
  steps: [
    '발판을 철봉 아래에 두되, 매달린 동안에는 발을 대지 않습니다.',
    '철봉을 어깨너비로 잡고 발을 떼는 순간부터 시간을 잽니다.',
    '어깨를 귀에서 살짝 멀리 두고(팔은 편 채) 몸을 흔들지 않습니다.',
    '손이 풀리기 직전이나 어깨가 불편해지면 발판을 딛고 내려옵니다.',
  ],
  cautions: ['어깨 앞쪽 통증이 생기면 즉시 내려옵니다.', '철봉의 허용 하중과 문틀 설치 상태를 확인합니다.', '점프해서 매달리지 않습니다.'],
  breathing: '호흡을 참지 말고 일정하게 쉽니다.',
  tips: ['5초 미만이어도 괜찮습니다. 오늘 숫자가 출발점입니다.'],
  mistakes: ['어깨가 귀에 붙을 정도로 힘없이 늘어지는 것', '다리를 흔들어 반동을 주는 것'],
});

EXERCISES.push({
  id: 'cooldown', name: '마무리 스트레칭', part: '가슴 · 등 · 하체', category: 'mobility', art: 'stretch',
  unit: 'min', defaultSets: 1, defaultTarget: 5, restSec: 0,
  summary: '운동 후 숨을 고르고 사용한 근육을 부드럽게 늘이는 시간',
  steps: [
    '문틀 가슴 스트레칭: 좌우 20~30초, 가슴 앞쪽이 부드럽게 늘어나는 정도로만',
    '등 · 옆구리: 두 팔을 머리 위로 뻗고 옆으로 천천히 기울이기, 좌우 20초',
    '허벅지 앞: 서서 한쪽 발목을 잡고 뒤로 당기기, 좌우 20초',
    '허벅지 뒤 · 엉덩이: 바닥에 앉아 한쪽 다리를 뻗고 상체를 숙이기, 좌우 20초',
    '마지막으로 천천히 깊게 다섯 번 호흡하기',
  ],
  cautions: ['반동을 주지 않습니다.', '어깨 앞쪽에 통증이 느껴지면 범위를 줄이거나 중단합니다.'],
  breathing: '늘이는 동안 길게 내쉽니다.',
  tips: ['운동 직후 몸이 따뜻할 때 하면 잘 늘어납니다.', '시간이 없으면 가슴과 허벅지 앞쪽만이라도 해 주세요.'],
  mistakes: ['아플 때까지 세게 늘이는 것', '숨을 참는 것'],
});

for (const e of EXERCISES) if (DETAIL[e.id]) Object.assign(e, DETAIL[e.id]);
// 명세서(2026-11-08) 반영: 새 운동 추가, 기존 운동 덮어쓰기
for (const e of SPEC_EXERCISES) {
  const i = EXERCISES.findIndex((x) => x.id === e.id);
  if (i >= 0) EXERCISES[i] = e; else EXERCISES.push(e);
}
for (const e of EXERCISES) if (SPEC_OVERRIDE[e.id]) Object.assign(e, SPEC_OVERRIDE[e.id]);
// 요청서(2026-11-13) 반영: 본운동 4가지 + 달리기
for (const e of V5_EXERCISES) {
  const i = EXERCISES.findIndex((x) => x.id === e.id);
  if (i >= 0) EXERCISES[i] = e; else EXERCISES.push(e);
}
for (const e of EXERCISES) if (V5_OVERRIDE[e.id]) Object.assign(e, V5_OVERRIDE[e.id]);
// 동작 그림: 운동 id와 같은 이름의 그림이 있으면 그것을 사용
for (const e of EXERCISES) if (DEMOS[e.id]) e.art = e.id;

export const EX_MAP: Record<string, Exercise> = Object.fromEntries(EXERCISES.map((e) => [e.id, e]));
export const getEx = (id: string): Exercise | undefined => EX_MAP[id];

export const CATEGORY_LABEL: Record<Exercise['category'], string> = {
  warmup: '준비운동',
  strength: '근력',
  pull: '풀업',
  cardio: '유산소',
  mobility: '스트레칭',
};

export function formatTarget(ex: Exercise, target: number): string {
  const each = ex.each ?? (ex.perSide ? '좌우 각' : '');
  const u = unitLabel(ex);
  return `${each ? each + ' ' : ''}${target}${u}`;
}

/** 범위 표기 (예: 6~12회) */
export function formatRange(ex: Exercise, r?: [number, number]): string {
  if (!r || r[0] === r[1]) return '';
  const each = ex.each ?? (ex.perSide ? '좌우 각' : '');
  return `${each ? each + ' ' : ''}${r[0]}~${r[1]}${unitLabel(ex)}`;
}

export function unitLabel(ex: Exercise): string {
  return ex.unit === 'sec' ? '초' : ex.unit === 'min' ? '분' : '회';
}
