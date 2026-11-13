import { CalendarDays, ChevronRight, Moon, Share, SmartphoneNfc, Sun, SunMoon, Trash2, Upload, FileSpreadsheet } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { defaultState, normalize, useStore } from '../lib/store';
import { todayKey } from '../lib/date';
import { BackupButton } from '../components/Backup';
import { daysSince, exportCsv } from '../lib/backup';
import { Card, SectionTitle, Segmented, Stepper, Toggle } from '../components/ui';
import type { Settings } from '../types';

export function SettingsScreen({ onEditSchedule }: { onEditSchedule: () => void }) {
  const { state, updateSettings, replaceAll } = useStore();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const since = daysSince(s.lastBackupAt);

  const importJson = async (file: File) => {
    try {
      const data = normalize(JSON.parse(await file.text()));
      const days = Object.keys(data.logs).length;
      if (!confirm(`백업 파일의 기록 ${days}일치로 현재 데이터를 덮어씁니다. 계속할까요?`)) return;
      replaceAll(data);
      setMsg(`가져오기 완료: 기록 ${days}일치`);
    } catch (e) {
      setMsg(`가져오지 못했습니다. ${(e as Error).message || 'JSON 파일을 확인해 주세요.'}`);
    }
  };

  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-bold leading-[1.3]">설정</h1>
      </header>

      <SectionTitle>화면</SectionTitle>
      <Segmented<Settings['theme']>
        value={s.theme}
        onChange={(theme) => updateSettings({ theme })}
        options={[
          { value: 'system', label: <span className="inline-flex items-center gap-1.5"><SunMoon size={14} />자동</span> },
          { value: 'light', label: <span className="inline-flex items-center gap-1.5"><Sun size={14} />화이트</span> },
          { value: 'dark', label: <span className="inline-flex items-center gap-1.5"><Moon size={14} />다크</span> },
        ]}
      />

      <SectionTitle>나에게 한 마디</SectionTitle>
      <Card className="p-4">
        <p className="text-[13px] leading-[1.5] text-muted">모든 화면 맨 아래에 보입니다. 비워 두면 동기부여 문장이 무작위로 나옵니다.</p>
        <textarea value={s.selfNote ?? ''} maxLength={80} rows={2}
          onChange={(e) => updateSettings({ selfNote: e.target.value })}
          placeholder="예: 운동은 강하게, 관절은 아프지 않게."
          className="mt-2.5 w-full resize-none rounded-sm border border-hairline bg-canvas px-3.5 py-3 text-[15px] leading-[1.5] outline-none focus:border-2 focus:border-ink" />
        <p className="mt-1 text-right text-[11px] text-muted-soft tabular">{(s.selfNote ?? '').length}/80</p>
      </Card>

      <SectionTitle>휴식 타이머</SectionTitle>
      <Card>
        <Row title="기본 휴식" desc="운동별 휴식을 따로 정하지 않았을 때">
          <Stepper size="sm" value={s.restDefault} min={15} max={600} step={15} suffix="초" onChange={(v) => updateSettings({ restDefault: v })} />
        </Row>
        <Row title="종료 알림음"><Toggle label="종료 알림음" checked={s.sound} onChange={(v) => updateSettings({ sound: v })} /></Row>
        <Row title="진동" desc="지원 기기에서만 동작 (아이폰 Safari 미지원)" last>
          <Toggle label="진동" checked={s.haptic} onChange={(v) => updateSettings({ haptic: v })} />
        </Row>
      </Card>
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">본운동 휴식은 운동마다 정해져 있고(타이슨 2분 · 밴드 풀업 2분 30초 · 스쿼트 1분 45초 · 힙 브리지 1분 15초), 운동 탭에서 바꿀 수 있습니다. 준비운동·스트레칭은 타이머 없이 다음 동작으로 넘어갑니다. 아이폰에서는 앱이 백그라운드에 있을 때 알림이 울리지 않을 수 있으며, 앱으로 돌아오면 남은 시간이 정확히 다시 계산됩니다.</p>

      <SectionTitle>프로그램</SectionTitle>
      <Card>
        <button onClick={onEditSchedule} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <CalendarDays size={18} /><span className="flex-1 text-[15px] font-medium">본운동 목표 · 휴식 시간 바꾸기</span><ChevronRight size={16} className="text-muted" />
        </button>
        <Row title="목표일" desc="홈 화면 D-day 기준">
          <input type="date" value={s.goalDate} min={s.startDate}
            onChange={(e) => e.target.value && updateSettings({ goalDate: e.target.value })}
            className="h-10 rounded-sm border border-hairline bg-canvas px-2.5 text-[14px] outline-none focus:border-ink" />
        </Row>
        <Row title="처음 시작한 날" desc="하단 '시작한 지 N일째' 기준" last>
          <input type="date" value={s.startDate} max={todayKey()}
            onChange={(e) => e.target.value && updateSettings({ startDate: e.target.value })}
            className="h-10 rounded-sm border border-hairline bg-canvas px-2.5 text-[14px] outline-none focus:border-ink" />
        </Row>
      </Card>

      <SectionTitle>백업 · 복원</SectionTitle>
      <Card className="p-4">
        <p className="text-[15px] font-semibold">마지막 백업: {since === null ? '아직 없음' : since === 0 ? '오늘' : `${since}일 전`}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-[13px] leading-[1.55] text-body">
          <li><b className="text-ink">지금 백업하기</b>를 누르면 공유 창이 열립니다.</li>
          <li><b className="text-ink">파일에 저장 → iCloud Drive</b>를 고르고 저장합니다.</li>
          <li>휴대폰을 바꾸면 새 휴대폰에서 이 앱을 홈 화면에 추가한 뒤, 아래 <b className="text-ink">백업 가져오기</b>로 그 파일을 선택합니다.</li>
        </ol>
        <BackupButton className="mt-3" />
      </Card>

      <SectionTitle>데이터</SectionTitle>
      <Card>
        <button onClick={() => exportCsv(state)} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <FileSpreadsheet size={18} /><span className="flex-1 text-[15px] font-medium">기록을 CSV로 내보내기 (엑셀용)</span>
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <Upload size={18} /><span className="flex-1 text-[15px] font-medium">백업 가져오기 (복원)</span>
        </button>
        <button onClick={() => {
          if (confirm('모든 기록과 설정을 삭제합니다. 먼저 백업을 내보내셨나요?') && confirm('정말 초기화할까요? 되돌릴 수 없습니다.')) {
            replaceAll(defaultState()); setMsg('초기화했습니다.');
          }
        }} className="flex w-full items-center gap-3 px-4 py-4 text-left text-error">
          <Trash2 size={18} /><span className="flex-1 text-[15px] font-medium">기록 초기화 (전체 데이터 삭제)</span>
        </button>
      </Card>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void importJson(f); e.target.value = ''; }} />
      {msg && <p className="mt-2 px-1 text-[13px] text-muted">{msg}</p>}
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">기록은 이 아이폰 안의 대용량 저장소(IndexedDB)에 보관되며 서버로 전송되지 않습니다. 홈 화면에서 앱을 지우거나 휴대폰을 바꾸면 기록도 함께 사라지므로, 한 달에 한 번 백업해 두세요.</p>

      <SectionTitle>아이폰 홈 화면에 추가</SectionTitle>
      <Card className="p-4">
        <ol className="space-y-2.5 text-[14px] text-body">
          <li className="flex gap-2.5"><Num n={1} />Safari로 앱 주소를 엽니다.</li>
          <li className="flex gap-2.5"><Num n={2} /><span>하단 공유 버튼 <Share size={14} className="inline -mt-0.5" /> 을 누릅니다.</span></li>
          <li className="flex gap-2.5"><Num n={3} />'홈 화면에 추가'를 선택합니다.</li>
        </ol>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted"><SmartphoneNfc size={13} />한 번 열어 두면 오프라인에서도 실행됩니다.</p>
      </Card>

    </div>
  );
}

function Row({ title, desc, children, last }: { title: string; desc?: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3.5 ${last ? '' : 'border-b border-hairline-soft'}`}>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{title}</p>
        {desc && <p className="text-[12px] text-muted">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

const Num = ({ n }: { n: number }) => (
  <span className="tabular mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-strong text-[11px] font-semibold">{n}</span>
);
