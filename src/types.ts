export type Unit = 'reps' | 'sec' | 'min';
export type Category = 'warmup' | 'strength' | 'pull' | 'cardio' | 'mobility';
export type ArtKey =
  | 'incline-pushup' | 'scap-pushup' | 'wall-slide' | 'doorway' | 'hang' | 'pullup'
  | 'negative' | 'squat' | 'lunge' | 'hip-flexor' | 'bridge' | 'deadbug' | 'walk' | 'stretch';

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
  firstPullup: { achieved: boolean; date?: string };
}

export interface AppState {
  version: 1;
  settings: Settings;
  schedule: Schedule;
  logs: Record<string, DayLog>;
  timer: TimerState | null;
}
