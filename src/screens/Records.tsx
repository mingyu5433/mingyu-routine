import { Check, ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useStore } from '../lib/store';
import { daysInMonth, longLabel, pad, parts, timeLabel, weekday } from '../lib/date';
import {
  bestSeries, cardioMinutes, completion, computeStats, dayKinds, daySets, isWorkoutDay, monthlyCounts, monthSummary, painLog, phaseOf, weekStrip, weeklySum,
} from '../lib/stats';
import { AREA_LABEL, PLAN_PHASES, PLAN_WEEKS, suggestions } from '../lib/plan';
import { EXERCISES, formatTarget, getEx, unitLabel } from '../data/exercises';
import { Card, Chip, PrimaryButton, SectionTitle, Segmented, Sheet } from '../components/ui';
import { ChangePreviewSheet } from '../components/Boost';

const WD_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

export function RecordsScreen() {
  const [view, setView] = useState<'calendar' | 'stats'>('calendar');
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-bold leading-[1.3]">기록</h1>
      </header>
      <div className="mt-4">
        <Segmented value={view} onChange={setView}
          options={[{ value: 'calendar', label: '달력' }, { value: 'stats', label: '통계 · 성장' }]} />
      </div>
      {view === 'calendar' ? <MonthView onPick={setDetail} /> : <StatsView />}
      <DayDetail date={detail} onClose={() => setDetail(null)} />
    </div>
  );
}

/* ───────────── 월간 달력 ───────────── */
function MonthView({ onPick }: { onPick: (d: string) => void }) {
  const { state, today } = useStore();
  const t = parts(today);
  const [ym, setYm] = useState({ y: t.y, m: t.m });
  const shift = (d: number) => setYm(({ y, m }) => {
    const n = m + d;
    return n < 1 ? { y: y - 1, m: 12 } : n > 12 ? { y: y + 1, m: 1 } : { y, m: n };
  });
  const dim = daysInMonth(ym.y, ym.m);
  const first = `${ym.y}-${pad(ym.m)}-01`;
  const lead = (weekday(first) + 6) % 7;
  const cells = Array.from({ length: dim }, (_, i) => `${ym.y}-${pad(ym.m)}-${pad(i + 1)}`);
  const sum = useMemo(() => monthSummary(state, ym.y, ym.m), [state, ym]);
  const isCurrent = ym.y === t.y && ym.m === t.m;

  return (
    <>
      <div className="mb-3 mt-6 flex items-center justify-between">
        <button onClick={() => shift(-1)} aria-label="이전 달" className="grid h-10 w-10 place-items-center rounded-full bg-strong"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <p className="tabular text-[20px] font-semibold tracking-[-0.18px]">{ym.y}년 {ym.m}월</p>
          {!isCurrent && <button onClick={() => setYm({ y: t.y, m: t.m })} className="text-[12px] text-muted underline underline-offset-2">이번 달로</button>}
        </div>
        <button onClick={() => shift(1)} aria-label="다음 달" className="grid h-10 w-10 place-items-center rounded-full bg-strong"><ChevronRight size={18} /></button>
      </div>

      <Card className="px-1.5 pb-2 pt-3">
        <div className="grid grid-cols-7 text-center text-[12px] font-medium text-muted">
          {['월', '화', '수', '목', '금', '토', '일'].map((d) => <div key={d} className="pb-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: lead }).map((_, i) => <div key={`e${i}`} />)}
          {cells.map((d) => {
            const log = state.logs[d];
            const did = isWorkoutDay(log);
            const full = did && completion(log) === 100;
            const kinds = did ? dayKinds(log) : [];
            const isToday = d === today;
            const future = d > today;
            return (
              <button key={d} type="button" disabled={!did} onClick={() => onPick(d)}
                aria-label={`${parts(d).m}월 ${parts(d).d}일${did ? ` ${kinds.join(', ')} 운동` : ''}`}
                className="flex h-[74px] min-w-0 flex-col items-center gap-1 pt-1">
                <span className={`tabular grid h-9 w-9 place-items-center rounded-full text-[14px]
                  ${full ? 'bg-primary font-semibold text-on-primary' : did ? 'bg-primary-tint font-semibold text-primary' : future ? 'text-muted-soft' : 'text-ink'}
                  ${isToday && !did ? 'font-semibold ring-2 ring-inset ring-ink' : ''}`}>
                  {parts(d).d}
                </span>
                <span className="flex w-full flex-col items-center leading-[1.15]">
                  {kinds.slice(0, 2).map((k) => (
                    <span key={k} className="max-w-full truncate text-[10px] font-semibold text-body">{k}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline-soft px-2.5 pt-2.5 text-[12px] text-muted">
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-primary" />모두 완료</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full bg-primary-tint" />일부 완료</span>
          <span className="flex items-center gap-1.5"><i className="h-3 w-3 rounded-full ring-2 ring-inset ring-ink" />오늘</span>
        </div>
      </Card>

      <p className="mt-4 rounded-md bg-soft px-4 py-3 text-[14px] leading-[1.6] text-body">
        {ym.m}월에는 <b className="tabular text-ink">{sum.days.length}일</b> 운동했고, 그중 <b className="tabular text-ink">{sum.full}일</b>은 모두 완료했습니다. 걷기는 총 <b className="tabular text-ink">{sum.walkMin}분</b>입니다.
      </p>

      <SectionTitle right={<span className="text-[13px] text-muted tabular">총 {sum.sets}세트</span>}>{ym.m}월에 운동한 날</SectionTitle>
      {sum.days.length === 0 ? (
        <p className="rounded-md bg-soft p-5 text-center text-[14px] leading-[1.6] text-muted">
          {isCurrent ? '이번 달 첫 기록을 기다리고 있어요. 한 세트만 해도 달력에 표시됩니다.' : '이 달에는 기록이 없어요.'}
        </p>
      ) : (
        <Card>
          <ul className="divide-y divide-hairline-soft">
            {[...sum.days].reverse().map((d) => {
              const log = state.logs[d];
              const { done, total } = daySets(log);
              const pct = completion(log);
              return (
                <li key={d}>
                  <button type="button" onClick={() => onPick(d)} className="flex w-full items-center gap-3.5 px-4 py-3 text-left">
                    <div className={`flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-sm ${pct === 100 ? 'bg-primary text-on-primary' : 'bg-strong'}`}>
                      <span className="tabular text-[16px] font-semibold leading-none">{parts(d).d}</span>
                      <span className={`mt-0.5 text-[11px] ${pct === 100 ? 'opacity-90' : 'text-muted'}`}>{WD_SHORT[weekday(d)]}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold">{dayKinds(log).join(' · ')}</p>
                      <p className="tabular text-[13px] text-muted">{done}/{total} 세트 · {log.title}</p>
                    </div>
                    <span className={`tabular text-[14px] font-semibold ${pct === 100 ? 'text-primary' : 'text-muted'}`}>{pct}%</span>
                    <ChevronRight size={16} className="text-muted-soft" />
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}

/* ───────────── 통계 · 성장 ───────────── */
function Bars({ data, unit, highlightLast = true, note }: { data: { label: string; value: number; tag?: string }[]; unit: string; highlightLast?: boolean; note?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="py-3 text-[13px] text-muted">아직 기록이 없습니다. 운동을 기록하면 여기에 그래프가 쌓입니다.</p>;
  return (
    <div>
      <div className="flex h-32 items-end gap-2">
        {data.map((d, i) => (
          <div key={i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
            <span className="tabular text-[11px] font-semibold">{d.value}</span>
            <div className="flex w-full max-w-[36px] flex-1 items-end">
              <div className={`w-full rounded-t-[5px] ${highlightLast && i === data.length - 1 ? 'bg-primary' : d.tag ? 'bg-ink' : 'bg-border-strong'}`} style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }} />
            </div>
            <span className="tabular max-w-full truncate text-[10px] text-muted">{d.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted">{unit}{note ? ` · ${note}` : ''}</p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5">
      <span className="text-[14px] text-body">{k}</span>
      <span className="tabular text-right text-[15px] font-semibold">{v}</span>
    </div>
  );
}

function StatsView() {
  const { state, today, updateSettings, acceptSuggestion, snoozeSuggestion } = useStore();
  const st = useMemo(() => computeStats(state, today), [state, today]);
  const strip = useMemo(() => weekStrip(state, today), [state, today]);
  const ph = phaseOf(state, today);
  const fp = state.settings.firstPullup;
  const [preview, setPreview] = useState(false);
  const sugs = useMemo(() => suggestions(state, today), [state, today]);
  const months = useMemo(() => monthlyCounts(state, today, 4), [state, today]);
  const minutes = useMemo(() => weeklySum(state, today, 6, (l) => l.after?.minutes ?? 0), [state, today]);
  const cardio = useMemo(() => weeklySum(state, today, 6, cardioMinutes), [state, today]);
  const pushS = useMemo(() => bestSeries(state, ['incline-pushup', 'pushup']), [state]);
  const pullS = useMemo(() => bestSeries(state, ['foot-pullup']), [state]);
  const squatS = useMemo(() => bestSeries(state, ['squat']), [state]);
  const pains = useMemo(() => painLog(state), [state]);
  const totalMin = Object.values(state.logs).reduce((a, l) => a + (l.after?.minutes ?? 0), 0);
  const planned = strip.filter((x) => !x.mark.startsWith('rest') && x.d <= today).length;
  const doneW = strip.filter((x) => x.mark === 'full' || x.mark === 'part').length;
  const pullLv = state.settings.exState?.['foot-pullup']?.lv ?? 0;
  const pullEx = getEx('foot-pullup');
  const pushLv = state.settings.exState?.['incline-pushup']?.lv ?? 0;
  const pushEx = getEx('incline-pushup');
  const exStats = EXERCISES.filter((e) => st.perEx[e.id]);
  const lab = (x: { d: string; test: boolean }) => `${parts(x.d).m}/${parts(x.d).d}${x.test ? '*' : ''}`;

  return (
    <>
      <SectionTitle>이번 주 달성</SectionTitle>
      <Card className="px-4 py-3">
        <p className="text-[14px] leading-[1.6] text-body">
          오늘까지 계획한 <b className="tabular text-ink">{planned}일</b> 중 <b className="tabular text-ink">{doneW}일</b> 운동했습니다{planned ? ` (${Math.round((doneW / Math.max(1, planned)) * 100)}%)` : ''}.
          {st.streak > 0 ? <> 지금 <b className="text-primary">{st.streak}일 연속</b>입니다.</> : ' 오늘 한 세트로 다시 시작하면 됩니다.'}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-strong">
          <div className="h-full rounded-full bg-primary" style={{ width: `${planned ? (doneW / planned) * 100 : 0}%` }} />
        </div>
      </Card>

      <SectionTitle>월간 운동 횟수</SectionTitle>
      <Card className="p-4"><Bars data={months} unit="운동한 날 (일)" /></Card>

      <SectionTitle right={<span className="tabular text-[13px] text-muted">누적 {totalMin.toLocaleString()}분</span>}>총 운동 시간</SectionTitle>
      <Card className="p-4"><Bars data={minutes} unit="주별 운동 시간 (분)" note="운동 끝에 남긴 기록 기준" /></Card>

      <SectionTitle>푸쉬업 최대 반복</SectionTitle>
      <Card className="p-4">
        <p className="mb-3 text-[13px] text-muted">지금 난도 · <b className="text-ink">{pushEx?.levels?.[pushLv]?.name}</b></p>
        <Bars data={pushS.map((x) => ({ label: lab(x), value: x.best, tag: x.test ? 't' : undefined }))} unit="그날 가장 많이 한 세트 (회)" note="*는 테스트 데이(일반 푸쉬업 최대)" />
      </Card>

      <SectionTitle>풀업 진행</SectionTitle>
      <Card className="p-4">
        <ol className="mb-3 flex flex-wrap gap-1.5">
          {pullEx?.levels?.map((l, i) => (
            <li key={l.name} className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${i < pullLv ? 'bg-ink text-canvas' : i === pullLv ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>{i + 1}. {l.name}</li>
          ))}
          <li className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${fp.achieved ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>첫 풀업</li>
        </ol>
        <Bars data={pullS.map((x) => ({ label: lab(x), value: x.best }))} unit="발 보조 풀업 그날 최고 (회)" />
        <div className="mt-3 border-t border-hairline-soft pt-3">
          {fp.achieved ? (
            <p className="flex items-center gap-2 text-[14px]"><Trophy size={16} className="text-primary" />첫 풀업 성공 · {fp.date ? longLabel(fp.date) : ''}
              <button onClick={() => { if (confirm('첫 풀업 기록을 취소할까요?')) updateSettings({ firstPullup: { achieved: false } }); }} className="ml-auto text-[12px] text-muted underline">취소</button></p>
          ) : (
            <PrimaryButton className="w-full" onClick={() => { if (confirm('보조 없이 풀업 1회에 성공하셨나요?')) updateSettings({ firstPullup: { achieved: true, date: today } }); }}>첫 풀업 성공 기록하기</PrimaryButton>
          )}
        </div>
      </Card>

      <SectionTitle>스쿼트 수행 변화</SectionTitle>
      <Card className="p-4"><Bars data={squatS.map((x) => ({ label: lab(x), value: x.best, tag: x.test ? 't' : undefined }))} unit="맨몸 스쿼트 그날 최고 (회)" /></Card>

      <SectionTitle>유산소 시간</SectionTitle>
      <Card className="p-4"><Bars data={cardio} unit="주별 빠르게 걷기 (분)" note="장기 목표 주 150분" /></Card>

      <SectionTitle right={<span className="text-[13px] text-muted">{pains.length}건</span>}>통증 기록</SectionTitle>
      {pains.length === 0 ? (
        <p className="rounded-md bg-soft p-4 text-[14px] text-muted">기록된 통증이 없습니다.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-hairline-soft">
            {pains.slice(0, 12).map((p) => (
              <li key={p.d} className="px-4 py-3 text-[14px]">
                <p><b className="tabular">{parts(p.d).m}/{parts(p.d).d}</b> <span className="text-error">{p.areas.length ? p.areas.map((a) => AREA_LABEL[a]).join('·') : '통증'}</span> <span className="text-muted">· {p.when}</span></p>
                {p.memo && <p className="mt-0.5 text-[13px] text-muted">{p.memo}</p>}
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">통증이 지속되거나 악화되면 전문가의 평가를 받아 주세요. 통증이 기록된 운동은 다음 단계 제안이 멈춥니다.</p>

      {sugs.length > 0 && (
        <>
          <SectionTitle>다음 단계 제안</SectionTitle>
          <Card>
            <ul className="divide-y divide-hairline-soft">
              {sugs.map((sg) => (
                <li key={sg.exId} className="px-4 py-3">
                  <p className="text-[14px] font-semibold">{sg.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{sg.detail}</p>
                  <div className="mt-2 flex gap-2">
                    <button type="button" onClick={() => acceptSuggestion(sg)} className="h-9 rounded-sm bg-primary px-3.5 text-[13px] font-semibold text-on-primary">적용하기</button>
                    <button type="button" onClick={() => snoozeSuggestion(sg, today)} className="h-9 rounded-sm px-3 text-[13px] font-medium text-muted">나중에</button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <TestCompare />

      <SectionTitle>운동별 누적 · 최고 기록</SectionTitle>
      {exStats.length === 0 ? (
        <p className="rounded-md bg-soft p-5 text-center text-[14px] text-muted">세트를 완료하면 이곳에 운동별 기록이 쌓입니다.</p>
      ) : (
        <Card className="px-4">
          <div className="divide-y divide-hairline-soft">
            {exStats.map((e) => {
              const s = st.perEx[e.id];
              return <Row key={e.id} k={e.name} v={<>{formatTarget(e, s.best)} <span className="text-[12px] font-normal text-muted">최고 · 누적 {s.total.toLocaleString()}{unitLabel(e)}</span></>} />;
            })}
          </div>
        </Card>
      )}

      <SectionTitle right={<span className="text-[13px] text-muted">{ph.before ? '시작 전' : `${Math.min(ph.week, PLAN_WEEKS)}주차`}</span>}>8주 발전 계획</SectionTitle>
      <div className="space-y-3">
        {PLAN_PHASES.map((p, i) => {
          const cur = i === ph.idx && !ph.before, past = i < ph.idx;
          return (
            <Card key={p.name} className={`p-4 ${cur ? 'border-ink shadow-float' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold ${past ? 'bg-ink text-canvas' : cur ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>
                    {past ? <Check size={13} strokeWidth={3} /> : i + 1}
                  </span>
                  <p className={`text-[16px] font-semibold ${!cur && !past ? 'text-muted' : ''}`}>{p.name}</p>
                </div>
                {cur ? <Chip tone="primary">지금</Chip> : <span className="text-[13px] text-muted">{p.range}</span>}
              </div>
              <ul className={`mt-2.5 space-y-1 pl-8 text-[14px] ${cur ? 'text-body' : 'text-muted'}`}>
                {p.goals.map((g) => <li key={g}>{g}</li>)}
              </ul>
            </Card>
          );
        })}
      </div>
      <p className="mt-3 px-1 text-[12px] leading-[1.5] text-muted">변화의 속도는 개인차가 크며 결과를 보장하지 않습니다. 장비가 늘면(예: 운동용 밴드) 밴드 로우를 주 2~3회 추가하는 것이 권장됩니다.</p>
      <button type="button" onClick={() => setPreview(true)}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-sm border border-ink text-[15px] font-medium">
        한 달 · 크리스마스 · 세 달 · 네 달 뒤 변화 보기
      </button>
      <ChangePreviewSheet open={preview} onClose={() => setPreview(false)} />
    </>
  );
}

/* ───────────── 날짜 상세 ───────────── */
function DayDetail({ date, onClose }: { date: string | null; onClose: () => void }) {
  const { state } = useStore();
  const log = date ? state.logs[date] : undefined;
  return (
    <Sheet open={!!date} onClose={onClose} title={date ? longLabel(date) : ''}>
      {log && (
        <div>
          <p className="text-[14px] text-muted">{log.title} · 완료율 {completion(log)}% · {daySets(log).done}/{daySets(log).total} 세트</p>
          {(log.check || log.after) && (
            <div className="mt-3 rounded-sm bg-soft px-3.5 py-2.5 text-[13px] leading-[1.6] text-body">
              {log.check && <p>운동 전 · 수면 {log.check.sleep}시간 · 피로도 {log.check.fatigue}/5{log.check.sore ? ' · 근육통' : ''} · {log.check.pain.length ? `${log.check.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}</p>}
              {log.after && <p>운동 후 · {log.after.minutes}분 · 체감 난도 {log.after.rpe}/10 · {log.after.pain.length ? `${log.after.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}</p>}
              {log.after?.memo && <p className="mt-1 text-ink">“{log.after.memo}”</p>}
            </div>
          )}
          <ul className="mt-4 space-y-3">
            {log.items.map((it, i) => {
              const ex = getEx(it.exerciseId);
              if (!ex) return null;
              return (
                <li key={i} className="rounded-sm border border-hairline p-3.5">
                  <p className="text-[15px] font-semibold">{it.label ?? ex.name}{it.lv !== undefined && ex.levels?.[it.lv] ? <span className="text-[12px] font-normal text-muted"> · {ex.levels[it.lv].name}</span> : null}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {it.sets.map((s, j) => (
                      <span key={j} className={`tabular rounded-full px-2.5 py-1 text-[12px] font-medium ${s.done ? 'bg-primary-tint text-primary' : 'bg-strong text-muted-soft'}`}>
                        {j + 1}세트 {s.done ? `${s.actual}${unitLabel(ex)}` : '–'}{s.done && s.doneAt ? ` · ${timeLabel(s.doneAt)}` : ''}
                      </span>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </Sheet>
  );
}

/** 테스트 데이 결과 비교 (11/2 → 12/20) */
function TestCompare() {
  const { state } = useStore();
  const days = Object.entries(state.settings.testDays ?? {}).map(([d]) => d).sort();
  if (days.length === 0) return null;
  const rows: { label: string; exId: string; vals: (number | null)[] }[] = [];
  for (const [di, d] of days.entries()) {
    for (const it of state.logs[d]?.items ?? []) {
      if (!it.test) continue;
      let r = rows.find((x) => x.label === it.label);
      if (!r) { r = { label: it.label ?? '', exId: it.exerciseId, vals: days.map(() => null) }; rows.push(r); }
      if (it.sets[0]?.done) r.vals[di] = it.sets[0].actual;
    }
  }
  return (
    <>
      <SectionTitle>테스트 기록</SectionTitle>
      <Card>
        <div style={{ gridTemplateColumns: `1fr repeat(${days.length}, auto)` }} className="grid items-center gap-x-3 border-b border-hairline-soft px-4 py-2.5 text-[12px] font-semibold text-muted">
          <span>항목</span>
          {days.map((d) => <span key={d} className="tabular w-12 text-right">{parts(d).m}/{parts(d).d}</span>)}
        </div>
        {rows.length === 0 ? (
          <p className="px-4 py-4 text-[14px] text-muted">테스트 데이에 기록한 숫자가 여기에 나란히 표시됩니다.</p>
        ) : rows.map((r) => {
          const ex = getEx(r.exId);
          const [a, b] = [r.vals[0], r.vals[r.vals.length - 1]];
          const up = days.length > 1 && a !== null && b !== null ? b - a : null;
          return (
            <div key={r.label} style={{ gridTemplateColumns: `1fr repeat(${days.length}, auto)` }} className="grid items-center gap-x-3 border-b border-hairline-soft px-4 py-3 last:border-0">
              <span className="min-w-0 text-[14px] font-medium">{r.label.replace(' 최대', '')}
                {up !== null && up !== 0 && <span className={`ml-1.5 text-[12px] font-semibold ${up > 0 ? 'text-primary' : 'text-muted'}`}>{up > 0 ? `+${up}` : up}</span>}
              </span>
              {r.vals.map((v, i) => (
                <span key={i} className="tabular w-12 text-right text-[15px] font-semibold">{v === null ? <span className="text-muted-soft">–</span> : `${v}${ex ? unitLabel(ex) : ''}`}</span>
              ))}
            </div>
          );
        })}
      </Card>
      <p className="mt-2 px-1 text-[12px] text-muted">같은 방식으로 잰 숫자끼리 비교해야 정확합니다. 재테스트도 바른 자세 기준으로 재 주세요.</p>
    </>
  );
}
