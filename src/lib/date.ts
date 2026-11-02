// 모든 날짜는 Asia/Seoul 기준 'YYYY-MM-DD' 문자열로 다룹니다.
const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' });
const timeFmt = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', hour: '2-digit', minute: '2-digit', hour12: false });

export const todayKey = (now = new Date()) => fmt.format(now);

const toUTC = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUTC = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export const addDays = (key: string, n: number) => fromUTC(toUTC(key) + n * 86400000);
export const weekday = (key: string) => new Date(toUTC(key)).getUTCDay();
export const diffDays = (a: string, b: string) => Math.round((toUTC(a) - toUTC(b)) / 86400000);
export const monthOf = (key: string) => key.slice(0, 7);

/** 월요일 시작 주의 첫날 */
export const weekStart = (key: string) => addDays(key, -((weekday(key) + 6) % 7));

export const parts = (key: string) => {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
};

const WD = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
export const longLabel = (key: string) => {
  const { m, d } = parts(key);
  return `${m}월 ${d}일 ${WD[weekday(key)]}`;
};
export const shortLabel = (key: string) => {
  const { m, d } = parts(key);
  return `${m}.${d} (${WD[weekday(key)][0]})`;
};
export const timeLabel = (ms: number) => timeFmt.format(new Date(ms));

export const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
export const pad = (n: number) => String(n).padStart(2, '0');
