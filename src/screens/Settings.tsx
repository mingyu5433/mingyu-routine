import { CalendarDays, ChevronRight, Download, Moon, Share, SmartphoneNfc, Sun, SunMoon, Trash2, Upload } from 'lucide-react';
import { useRef, useState, type ReactNode } from 'react';
import { defaultState, normalize, useStore } from '../lib/store';
import { todayKey } from '../lib/date';
import { Card, SectionTitle, Segmented, Stepper, Toggle } from '../components/ui';
import type { Settings } from '../types';

export function SettingsScreen({ onEditSchedule }: { onEditSchedule: () => void }) {
  const { state, updateSettings, replaceAll } = useStore();
  const s = state.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ ...state, timer: null, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mingyu-routine-backup-${todayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMsg('백업 파일을 저장했습니다.');
  };

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

      <SectionTitle>휴식 타이머</SectionTitle>
      <Card>
        <Row title="일반 운동" desc="세트 완료 후 자동 시작">
          <Stepper size="sm" value={s.restDefault} min={15} max={600} step={15} suffix="초" onChange={(v) => updateSettings({ restDefault: v })} />
        </Row>
        <Row title="풀업 계열" desc="매달리기 · 풀업 동작">
          <Stepper size="sm" value={s.restPull} min={15} max={600} step={15} suffix="초" onChange={(v) => updateSettings({ restPull: v })} />
        </Row>
        <Row title="종료 알림음"><Toggle label="종료 알림음" checked={s.sound} onChange={(v) => updateSettings({ sound: v })} /></Row>
        <Row title="진동" desc="지원 기기에서만 동작 (아이폰 Safari 미지원)" last>
          <Toggle label="진동" checked={s.haptic} onChange={(v) => updateSettings({ haptic: v })} />
        </Row>
      </Card>
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">준비운동·스트레칭은 짧은 고정 휴식(15~30초)을 사용합니다. 아이폰에서는 앱이 백그라운드에 있을 때 알림이 울리지 않을 수 있으며, 앱으로 돌아오면 남은 시간이 정확히 다시 계산됩니다.</p>

      <SectionTitle>프로그램</SectionTitle>
      <Card>
        <button onClick={onEditSchedule} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <CalendarDays size={18} /><span className="flex-1 text-[15px] font-medium">운동 일정 수정</span><ChevronRight size={16} className="text-muted" />
        </button>
        <Row title="추천 프로그램" desc="기록을 보고 매주 횟수·세트를 자동으로 정합니다">
          <Toggle label="추천 프로그램" checked={s.autoProgram} onChange={(v) => updateSettings({ autoProgram: v })} />
        </Row>
        <Row title="목표일" desc="홈 화면 D-day 기준">
          <input type="date" value={s.goalDate} min={s.startDate}
            onChange={(e) => e.target.value && updateSettings({ goalDate: e.target.value })}
            className="h-10 rounded-sm border border-hairline bg-canvas px-2.5 text-[14px] outline-none focus:border-ink" />
        </Row>
        <Row title="시작일" desc="프로그램 1주차 · 적응기 2주의 기준" last>
          <input type="date" value={s.startDate} max={todayKey()}
            onChange={(e) => e.target.value && updateSettings({ startDate: e.target.value })}
            className="h-10 rounded-sm border border-hairline bg-canvas px-2.5 text-[14px] outline-none focus:border-ink" />
        </Row>
      </Card>

      <SectionTitle>데이터</SectionTitle>
      <Card>
        <button onClick={exportJson} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <Download size={18} /><span className="flex-1 text-[15px] font-medium">JSON으로 내보내기</span>
        </button>
        <button onClick={() => fileRef.current?.click()} className="flex w-full items-center gap-3 border-b border-hairline-soft px-4 py-4 text-left">
          <Upload size={18} /><span className="flex-1 text-[15px] font-medium">JSON 백업 가져오기</span>
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
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">기록은 이 기기의 브라우저 저장소에만 보관됩니다. Safari 데이터를 지우면 함께 삭제되므로 주기적으로 내보내기를 권장합니다.</p>

      <SectionTitle>아이폰 홈 화면에 추가</SectionTitle>
      <Card className="p-4">
        <ol className="space-y-2.5 text-[14px] text-body">
          <li className="flex gap-2.5"><Num n={1} />Safari로 앱 주소를 엽니다.</li>
          <li className="flex gap-2.5"><Num n={2} /><span>하단 공유 버튼 <Share size={14} className="inline -mt-0.5" /> 을 누릅니다.</span></li>
          <li className="flex gap-2.5"><Num n={3} />'홈 화면에 추가'를 선택합니다.</li>
        </ol>
        <p className="mt-3 flex items-center gap-1.5 text-[12px] text-muted"><SmartphoneNfc size={13} />한 번 열어 두면 오프라인에서도 실행됩니다.</p>
      </Card>

      <p className="mt-10 text-center text-[12px] text-muted-soft">민규 루틴 v1.1 · 광고 없음 · 회원가입 없음</p>
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
