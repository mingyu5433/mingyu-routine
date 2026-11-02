export type Unit = 'reps' | 'sec' | 'min';
export type Category = 'warmup' | 'strength' | 'pull' | 'cardio' | 'mobility';
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
  moves?: { name: string; dose: string; how: string[]; feel: string; art?: string }[]; // 여러 동작 스트레칭
  testHint?: string;    // 테스트 데이 측정 안내
  art: ArtKey;
  stage?: string;        // 단계 안내 (예: "보조 풀업이 통증 없이 가능해진 뒤")
}

export interface PlanItem {
  exerciseId: string;
  sets: number;
  target: number;
}

export interface DayPlan {
  title: string;      // 예: 상체 운동하는 날
  items: PlanItem[];
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
  hold?: 'miss' | 'pain';  // 단계를 올리지 않은 이유
  test?: boolean;          // 테스트 데이의 최대 기록 항목
  label?: string;          // 표시 이름(테스트 항목)
  art?: ArtKey;            // 표시 도해(테스트 항목)
  optional?: boolean;      // 선택 항목(안 해도 완료율에 영향 없음)
}

export type Condition = 'good' | 'tired' | 'pain';

export interface DayLog {
  date: string; // YYYY-MM-DD (Asia/Seoul)
  title: string;
  items: ItemLog[];
  condition?: Condition;
  completedAt?: number;
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
  firstPullup: { achieved: boolean; date?: string };
}

export interface AppState {
  version: 1;
  settings: Settings;
  schedule: Schedule;
  logs: Record<string, DayLog>;
  timer: TimerState | null;
}
