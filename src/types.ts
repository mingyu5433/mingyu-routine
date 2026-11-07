export type Unit = 'reps' | 'sec' | 'min';
export type Category = 'warmup' | 'strength' | 'pull' | 'cardio' | 'mobility';
export type Phase = 'warmup' | 'main' | 'cool';
export type Area = 'shoulder' | 'back' | 'knee';
/** 동작 그림 키 (src/figure/demos.ts) */
export type ArtKey = string;

export interface Exercise {
  id: string;
  name: string;
  part: string;
  category: Category;
  unit: Unit;
  perSide?: boolean;
  defaultSets: number;
  defaultTarget: number;
  range?: string;        // 권장 범위 표기 (예: "6~10회")
  restSec: number;       // 0이면 설정값(일반/풀업) 사용
  summary: string;
  steps: string[];
  cautions: string[];
  breathing: string;
  tips: string[];
  mistakes?: string[];  // 자주 하는 잘못된 자세
  start?: string;       // 시작 자세
  feel?: string;        // 느껴져야 하는 곳
  moves?: { name: string; dose: string; how: string[]; feel: string; art?: string; knee?: boolean }[]; // 여러 동작 스트레칭
  testHint?: string;    // 테스트 데이 측정 안내
  art: ArtKey;
  stage?: string;        // 단계 안내 (예: "보조 풀업이 통증 없이 가능해진 뒤")
  purpose?: string;      // 운동 목적
  alt?: string;          // 대체 운동
  levels?: { name: string; how: string }[]; // 난도 조절 단계 (0부터)
  areas?: Area[];        // 부담이 가는 부위 (컨디션 체크 경고용)
  each?: string;         // '좌우 각' · '앞뒤 각' 표기
}

export interface PlanItem {
  exerciseId: string;
  sets: number;
  target: number;
  optional?: boolean; // 선택 운동 (안 해도 완료율에 영향 없음)
  range?: [number, number]; // 목표 범위 (예: 6~12회)
  rest?: number;      // 세트 사이 휴식(초)
  phase?: Phase;      // 준비운동 / 본운동 / 스트레칭 (없으면 운동 종류로 판단)
}

export interface DayPlan {
  title: string;      // 예: 전신 근력 A
  items: PlanItem[];
  time?: string;      // 예상 시간 (예: 35~50분)
  goal?: string;      // 이날의 목표
}

export type Schedule = Record<number, DayPlan>; // 0=일 ~ 6=토

export interface SetLog {
  target: number;
  actual: number;
  done: boolean;
  doneAt?: number;
}

export interface ItemLog {
  exerciseId: string;
  sets: SetLog[];
  level?: number;          // 추천 프로그램 단계(주차)
  hold?: 'miss' | 'pain' | 'jump';  // 단계 판단 이유
  test?: boolean;          // 테스트 데이의 최대 기록 항목
  label?: string;          // 표시 이름(테스트 항목)
  art?: ArtKey;            // 표시 도해(테스트 항목)
  optional?: boolean;      // 선택 항목(안 해도 완료율에 영향 없음)
  range?: [number, number];
  rest?: number;
  phase?: Phase;
  lv?: number;             // 그날 수행한 난도 단계
}

export type Condition = 'good' | 'tired' | 'pain';

export interface ConditionCheck {
  sleep: number;        // 수면 시간
  fatigue: number;      // 피로도 1~5
  sore: boolean;        // 근육통
  pain: Area[];         // 통증 부위
  at: number;
}

export interface AfterNote {
  rpe: number;          // 체감 난도 1~10
  pain: Area[];         // 운동 중 통증
  memo: string;
  minutes: number;      // 총 운동 시간(분)
}

export interface DayLog {
  date: string; // YYYY-MM-DD (Asia/Seoul)
  title: string;
  items: ItemLog[];
  condition?: Condition;  // (이전 버전)
  check?: ConditionCheck; // 운동 전 컨디션 체크
  after?: AfterNote;      // 운동 후 기록
  startedAt?: number;
  completedAt?: number;
  time?: string;
  bedtime?: boolean[];    // 자기 전 5분 루틴 체크
}

export interface TimerState {
  endAt: number;        // 종료 예정 시각(ms) — 백그라운드에서도 정확히 계산
  total: number;        // 초
  pausedLeft: number | null; // 일시정지 시 남은 ms
  label: string;
}

export interface Settings {
  theme: 'system' | 'light' | 'dark';
  restDefault: number;
  restPull: number;
  sound: boolean;
  haptic: boolean;
  startDate: string;    // 적응기·프로그램 1주차 기준일
  goalDate: string;     // 목표일 (기본 12월 20일)
  autoProgram: boolean; // 추천 프로그램이 목표를 자동으로 정함
  testDays: Record<string, 'upper' | 'full'>; // 테스트 데이
  lastBackupAt?: number; // 마지막 백업 시각(ms)
  recapSeen?: string;    // 확인한 월간 결산 (YYYY-MM)
  selfNote?: string;     // 나에게 한 마디 (화면 맨 아래)
  migV?: number;         // 적용된 데이터 이전 버전
  kneeRest?: boolean;    // 무릎 회복 모드: 무릎에 부담 가는 운동 제외
  planStart?: string;    // 8주 프로그램 1주차 월요일
  fullSets?: boolean;    // 적응기 이후 목표 세트로 늘리기에 동의
  exState?: Record<string, { bump?: number; lv?: number }>; // 운동별 진행 상태 (사용자가 수락한 것만)
  snooze?: Record<string, string>; // 제안 '나중에' (운동 id → 날짜)
  firstPullup: { achieved: boolean; date?: string };
}

export interface AppState {
  version: 1;
  settings: Settings;
  schedule: Schedule;
  logs: Record<string, DayLog>;
  timer: TimerState | null;
}
