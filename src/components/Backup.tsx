import { CloudUpload, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { daysSince, shareBackup } from '../lib/backup';
import { addDays, parts } from '../lib/date';
import { completion, daySets, isWorkoutDay, monthSummary } from '../lib/stats';
import { Sheet } from './ui';

export const BACKUP_EVERY_DAYS = 30;

/** 백업 실행 + 마지막 백업 시각 저장 */
export function useBackup() {
  const { state, updateSettings } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const run = async () => {
    const r = await shareBackup(state);
    if (r === 'cancelled') { setMsg('백업을 취소했습니다.'); return; }
    updateSettings({ lastBackupAt: Date.now() });
    setMsg(r === 'shared' ? '백업 파일을 보냈습니다. 저장한 위치를 기억해 두세요.' : '백업 파일을 내려받았습니다.');
  };
  return { run, msg, last: state.settings.lastBackupAt };
}

export function BackupButton({ className = '' }: { className?: string }) {
  const { run, msg } = useBackup();
  return (
    <div className={className}>
      <button type="button" onClick={() => void run()}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-ink text-[15px] font-medium text-canvas">
        <CloudUpload size={17} /> 지금 백업하기
      </button>
      {msg && <p className="mt-2 text-center text-[12px] text-muted">{msg}</p>}
    </div>
  );
}

/** 홈: 백업할 때가 되면 보이는 카드 */
export function BackupReminder() {
  const { state } = useStore();
  const [hidden, setHidden] = useState(false);
  const since = daysSince(state.settings.lastBackupAt);
  const workoutDays = useMemo(() => Object.values(state.logs).filter(isWorkoutDay).length, [state.logs]);
  const due = since === null ? workoutDays >= 3 : since >= BACKUP_EVERY_DAYS;
  if (!due || hidden) return null;
  return (
    <div className="mt-4 rounded-md border border-hairline p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold">백업할 때가 됐습니다</p>
          <p className="mt-0.5 text-[13px] leading-[1.5] text-muted">
            {since === null ? `운동 기록이 ${workoutDays}일 쌓였습니다.` : `마지막 백업이 ${since}일 전입니다.`} 휴대폰을 바꿔도 기록을 되살릴 수 있도록 iCloud Drive에 한 부 저장해 두세요.
          </p>
        </div>
        <button onClick={() => setHidden(true)} aria-label="나중에" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-strong"><X size={14} /></button>
      </div>
      <BackupButton className="mt-3" />
    </div>
  );
}

/** 매달 1~7일: 지난달 결산 + 백업 */
export function MonthlyRecap() {
  const { state, today, updateSettings } = useStore();
  const [open, setOpen] = useState(false);
  const t = parts(today);
  const prev = t.m === 1 ? { y: t.y - 1, m: 12 } : { y: t.y, m: t.m - 1 };
  const key = `${prev.y}-${String(prev.m).padStart(2, '0')}`;
  const sum = useMemo(() => monthSummary(state, prev.y, prev.m), [state, prev.y, prev.m]);
  if (t.d > 7 || state.settings.recapSeen === key || sum.days.length === 0) return null;

  const close = () => { setOpen(false); updateSettings({ recapSeen: key }); };
  const first = `${key}-01`;
  const dim = new Date(Date.UTC(prev.y, prev.m, 0)).getUTCDate();
  const lead = (new Date(Date.UTC(prev.y, prev.m - 1, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: dim }, (_, i) => addDays(first, i));

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="mt-4 flex w-full items-center justify-between rounded-md bg-primary-tint px-4 py-3.5 text-left">
        <span>
          <span className="block text-[15px] font-semibold text-primary">{prev.m}월 결산이 도착했습니다</span>
          <span className="block text-[13px] text-body">운동한 날 {sum.days.length}일 · 완료 세트 {sum.sets}개</span>
        </span>
        <span className="text-[13px] font-semibold text-primary">보기</span>
      </button>
      <Sheet open={open} onClose={close} title={`${prev.y}년 ${prev.m}월 결산`}>
        <div className="grid grid-cols-3 gap-2">
          {[['운동한 날', sum.days.length, '일'], ['모두 완료', sum.full, '일'], ['걷기', sum.walkMin, '분']].map(([l, v, u]) => (
            <div key={l as string} className="rounded-md bg-soft px-3 py-3">
              <p className="text-[12px] font-semibold text-muted">{l}</p>
              <p className="tabular mt-1 text-[22px] font-bold leading-none">{v}<span className="ml-0.5 text-[12px] font-medium text-muted">{u}</span></p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-7 gap-1.5">
          {Array.from({ length: lead }).map((_, i) => <span key={`e${i}`} />)}
          {cells.map((d) => {
            const log = state.logs[d];
            const did = isWorkoutDay(log);
            const full = did && completion(log) === 100;
            return (
              <span key={d} className={`tabular grid aspect-square place-items-center rounded-[6px] text-[11px] ${full ? 'bg-primary font-semibold text-on-primary' : did ? 'bg-primary-tint font-semibold text-primary' : 'bg-strong text-muted-soft'}`}>
                {parts(d).d}
              </span>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-muted">완료 세트 총 {sum.sets}개 · {sum.days.length > 0 ? `가장 많이 한 날 ${Math.max(...sum.days.map((d) => daySets(state.logs[d]).done))}세트` : ''}</p>
        <div className="mt-6 rounded-md border border-hairline p-4">
          <p className="text-[15px] font-semibold">이번 달 백업</p>
          <p className="mt-0.5 text-[13px] leading-[1.5] text-muted">공유 창이 열리면 <b className="text-ink">파일에 저장 → iCloud Drive</b>를 선택하세요.</p>
          <BackupButton className="mt-3" />
        </div>
        <p className="mt-3 text-center text-[12px] text-muted-soft">닫으면 이번 결산은 다시 뜨지 않습니다.</p>
      </Sheet>
    </>
  );
}
