/**
 * 민규 맞춤 추천 프로그램 (12주)
 *
 * 설계 근거 — 알려진 상태만 반영했습니다:
 *  - 풀업 0개에서 시작
 *  - 말린 어깨 + 앞쪽 어깨 통증 이력 → 무릎 푸쉬업으로 시작해 5주차에 일반 푸쉬업으로 전환
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
    s(2, 6, '무릎 푸쉬업 · 통증 없는 깊이 찾기', '무릎'), s(2, 8, undefined, '무릎'), s(3, 8, undefined, '무릎'), s(3, 10, undefined, '무릎'),
    s(3, 4, '일반 푸쉬업 시작 · 못 채운 횟수는 무릎으로 이어서 하고, 일반으로 한 횟수만 기록', '일반'),
    s(3, 5, undefined, '일반'), s(3, 6, undefined, '일반'), s(3, 7, undefined, '일반'), s(3, 8, undefined, '일반'),
    s(3, 10, undefined, '일반'), s(3, 10, undefined, '일반'), s(3, 12, '통증 없이 연속 몇 개까지 되는지 확인', '일반'),
  ],
  'assisted-hang': [
    s(2, 10), s(2, 15), s(2, 20), s(3, 20), s(3, 20), s(3, 25, '발 지지를 조금 줄이기'),
    s(3, 25), s(3, 30), s(3, 30), s(3, 30), s(3, 30), s(3, 30),
  ],
  'scap-pullup': [
    null, null, s(2, 5, '새로 추가: 팔을 편 채 어깨만 내리기'), s(2, 6), s(2, 8), s(2, 8),
    s(2, 8), s(2, 8), s(2, 8), s(2, 8), s(2, 8), s(2, 8),
  ],
  'foot-pullup': [
    s(2, 4), s(2, 5), s(3, 5), s(3, 6),
    s(3, 6, '다리 도움을 조금 줄이기'), s(3, 6, '다리 도움을 조금 줄이기'), s(3, 6, '다리 도움을 조금 줄이기'),
    s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'),
    s(3, 6, '다리는 균형만 잡는 정도로'), s(3, 6, '다리는 균형만 잡는 정도로'),
  ],
  'negative-pullup': [
    null, null, null, null,
    s(2, 2, '새로 추가: 3~5초에 걸쳐 내려오기'), s(2, 3), s(3, 3), s(3, 3), s(3, 4), s(3, 4), s(3, 5),
    s(3, 5, '안전하다면 보조 없는 풀업 1회 시도'),
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
    s(2, 6), s(2, 8), s(3, 8), s(3, 10), s(3, 10), s(3, 10),
    s(3, 12), s(3, 12), s(3, 12), s(3, 12), s(3, 12), s(3, 12),
  ],
  'brisk-walk': [
    s(1, 20), s(1, 25), s(1, 30), s(1, 30), s(1, 35), s(1, 35),
    s(1, 40), s(1, 40), s(1, 40), s(1, 45), s(1, 45), s(1, 45),
  ],
};

/** 중간부터 추가되는 운동과, 그 운동을 넣을 기준 운동 */
export const ADD_AFTER: Record<string, string> = {
  'scap-pullup': 'assisted-hang',
  'negative-pullup': 'foot-pullup',
};

export const WEEK_FOCUS = [
  '동작 익히기 — 가볍게, 통증 없는 범위 찾기',
  '리듬 만들기 — 정해진 요일에 빠지지 않기',
  '3세트에 몸 맞추기 — 견갑 풀업 시작',
  '첫 한 달 마무리 — 횟수 조금 더',
  '난이도 올리기 — 일반 푸쉬업 전환, 네거티브 시작',
  '천천히, 정확하게 — 버티는 힘 키우기',
  '12월 20일 완주 주간 — 7주를 끝까지',
  '두 번째 사이클 — 다시 한 단계',
  '꾸준함이 실력이 되는 주',
  '등 힘 키우기 — 다리 도움은 최소로',
  '마지막 난이도 올리기',
  '12주 점검 — 일반 푸쉬업 12회 · 첫 풀업 확인',
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
  return v === '일반' ? 'scap-pushup' as const : v === '무릎' ? 'knee-pushup' as const : undefined;
};
