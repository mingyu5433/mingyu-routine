/**
 * 민규 맞춤 추천 프로그램 (12주)
 *
 * 설계 근거 — 알려진 상태만 반영했습니다:
 *  - 풀업 0개에서 시작 (매달리기 60초 → 네거티브를 2주차부터)
 *  - 11월 2일 테스트: 일반 푸쉬업 20회, 매달리기 60초, 견갑 풀업 4회, 데드버그 좌우 8회
 *  - 말린 어깨 + 앞쪽 어깨 통증 이력 → 세트당 횟수는 최대치의 50~90%로 시작
 *  - 한동안 운동을 쉰 상태 → 1~2주는 적응기(2세트)
 *  - 1주차 시작일부터 정확히 7주째 일요일이 12월 20일
 *
 * 진행 원칙 — 같은 운동의 이전 주 목표를 모든 세트에서 채웠을 때만 다음 단계로 올라갑니다.
 * 못 채웠거나 지난 운동일에 '통증 있어요'를 선택했다면 같은 단계를 유지합니다.
 */
export interface Step { sets: number; target: number; note?: string; variant?: '무릎' | '일반' }

const s = (sets: number, target: number, note?: string, variant?: Step['variant']): Step => ({ sets, target, note, variant });

export const PROGRAM: Record<string, (Step | null)[]> = {
  pushup: [
    s(3, 10, '2~3초 동안 천천히 내려가기'), s(3, 12), s(4, 12), s(4, 13), s(4, 15), s(4, 16),
    s(4, 18, '12월 20일 재테스트 주간'), s(4, 18), s(4, 20), s(4, 20, '3초 동안 천천히 내려가기'), s(5, 18), s(5, 20),
  ],
  'assisted-hang': [
    s(2, 10), s(2, 15), s(2, 20), s(3, 20), s(3, 20), s(3, 25, '발 지지를 조금 줄이기'),
    s(3, 25), s(3, 30), s(3, 30), s(3, 30), s(3, 30), s(3, 30),
  ],
  'scap-pullup': [
    s(3, 4, '팔을 편 채 어깨만 끌어내리기'), s(3, 5), s(3, 6), s(3, 6), s(3, 8), s(3, 8),
    s(3, 8), s(3, 10), s(3, 10), s(3, 10), s(3, 10), s(3, 10),
  ],
  'foot-pullup': [
    s(3, 5), s(3, 6), s(3, 6), s(3, 6, '다리 도움을 조금 줄이기'), s(3, 6, '다리 도움을 조금 줄이기'),
    s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'),
    s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'),
  ],
  'negative-pullup': [
    null, s(2, 3, '새로 추가: 3~5초에 걸쳐 내려오기'), s(3, 3), s(3, 4), s(3, 4, '5초 동안 내려오기'), s(3, 5),
    s(3, 5, '안전하다면 보조 없는 풀업 1회 시도'), s(4, 5), s(4, 5), s(4, 6), s(4, 6), s(4, 6, '보조 없는 풀업 다시 시도'),
  ],
  squat: [
    s(2, 10), s(2, 12), s(3, 12), s(3, 15),
    s(3, 15, '내려갈 때 3초 천천히'), s(3, 15, '내려갈 때 3초 천천히'), s(3, 15, '내려갈 때 3초 천천히'),
    s(4, 12), s(4, 12), s(4, 15), s(4, 15), s(4, 15),
  ],
  'hip-bridge': [
    s(2, 12), s(2, 15), s(3, 15), s(3, 15),
    s(3, 15, '위에서 3초 유지'), s(3, 15, '위에서 3초 유지'), s(3, 15, '위에서 3초 유지'),
    s(3, 20), s(3, 20), s(3, 20), s(3, 20), s(3, 20),
  ],
  deadbug: [
    s(3, 8), s(3, 10), s(3, 10), s(3, 12), s(3, 12), s(3, 12),
    s(3, 14), s(3, 14), s(3, 15), s(3, 15), s(3, 15), s(3, 15),
  ],
  'brisk-walk': [
    s(1, 20), s(1, 25), s(1, 30), s(1, 30), s(1, 35), s(1, 35),
    s(1, 40), s(1, 40), s(1, 40), s(1, 45), s(1, 45), s(1, 45),
  ],
};

/** 중간부터 추가되는 운동과, 그 운동을 넣을 기준 운동 */
export const ADD_AFTER: Record<string, string> = {
  'negative-pullup': 'foot-pullup',
};

export const WEEK_FOCUS = [
  '정확한 자세로 리듬 만들기 — 2~3초 내려가기',
  '네거티브 풀업 시작',
  '푸쉬업 4세트로 늘리기',
  '첫 한 달 마무리 — 다리 도움 줄이기 시작',
  '네거티브 5초 — 버티는 힘',
  '풀업에서 다리 도움은 최소로',
  '12월 20일 재테스트 · 첫 풀업 시도 주간',
  '두 번째 사이클 — 다시 한 단계',
  '꾸준함이 실력이 되는 주',
  '천천히 내려가기로 강도 올리기',
  '5세트 도전',
  '12주 점검 — 첫 풀업 확인',
];

export const PROGRAM_WEEKS = 12;

export const firstWeek = (exId: string) => {
  const t = PROGRAM[exId];
  return t ? t.findIndex((x) => x !== null) + 1 : 0;
};
export const stepAt = (exId: string, level: number): Step | null => PROGRAM[exId]?.[Math.min(PROGRAM_WEEKS, Math.max(1, level)) - 1] ?? null;

/** 단계에 따른 동작 이름 (예: 푸쉬업 → 무릎 푸쉬업) */
export const variantName = (name: string, exId: string, level?: number) => {
  const v = level ? stepAt(exId, level)?.variant : undefined;
  return v === '무릎' ? `무릎 ${name}` : v === '일반' ? `일반 ${name}` : name;
};
export const variantArt = (exId: string, level?: number) => {
  const v = level ? stepAt(exId, level)?.variant : undefined;
  return v === '무릎' ? 'scap-pushup' : undefined;
};
