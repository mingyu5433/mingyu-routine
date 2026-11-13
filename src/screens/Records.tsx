import { Check, ChevronLeft, ChevronRight, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useStore } from '../lib/store';
import { daysInMonth, longLabel, pad, parts, timeLabel, weekday } from '../lib/date';
import { completion, dayKinds, daySets, growthSeries, isWorkoutDay, monthSummary, painLog } from '../lib/stats';
import { AREA_LABEL, levelOf } from '../lib/plan';
import { getEx, unitLabel } from '../data/exercises';
import { MAIN_IDS } from '../data/v5';
import { Card, PrimaryButton, SectionTitle, Segmented, Sheet, Stepper } from '../components/ui';

const WD_SHORT = ['일', '월', '화', '수', '목', '금', '토'];

export function RecordsScreen() {
  const [view, setView] = useState<'calendar' | 'growth'>('growth');
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <div className="px-4 pb-8">
      <header className="pt-2">
        <h1 className="text-[28px] font-bold leading-[1.3]">기록</h1>
      </header>
      <div className="mt-4">
        <Segmented value={view} onChange={setView}
          options={[{ value: 'growth', label: '성장' }, { value: 'calendar', label: '달력' }]} />
      </div>
      {view === 'calendar' ? <MonthView onPick={setDetail} /> : <GrowthView onPick={setDetail} />}
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
        {ym.m}월에는 <b className="tabular text-ink">{sum.days.length}일</b> 운동했고, 그중 <b className="tabular text-ink">{sum.full}일</b>은 모두 완료했습니다. 달리기·걷기는 총 <b className="tabular text-ink">{sum.walkMin}분</b>입니다.
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

/* ───────────── 성장 ───────────── */
const SHORT: Record<string, string> = { 'tyson-pushup': '타이슨', 'band-pullup': '밴드 풀업', squat: '스쿼트', 'hip-bridge': '힙 브리지', 'run-interval': '달리기' };

function GrowthView({ onPick }: { onPick: (d: string) => void }) {
  const { state, today, updateSettings } = useStore();
  const [exId, setExId] = useState<string>(MAIN_IDS[0]);
  const ex = getEx(exId)!;
  const u = unitLabel(ex);
  const all = useMemo(() => growthSeries(state, exId), [state, exId]);
  const lvNow = levelOf(state, ex);
  const lvs = [...new Set(all.map((x) => x.lv ?? lvNow ?? 0))].sort((a, b) => a - b);
  const [lvPick, setLvPick] = useState<number | null>(null);
  const lv = lvPick !== null && lvs.includes(lvPick) ? lvPick : all.length ? all[all.length - 1].lv ?? lvNow ?? 0 : lvNow ?? 0;
  const rows = all.filter((x) => (x.lv ?? lvNow ?? 0) === lv);
  const [metric, setMetric] = useState<'total' | 'best'>('total');
  const series = rows.slice(-10);
  const vals = series.map((x) => (ex.unit === 'min' ? x.total : metric === 'total' ? x.total : x.best));
  const max = Math.max(1, ...vals);
  const first = rows[0], last = rows[rows.length - 1];
  const fv = first ? (metric === 'total' || ex.unit === 'min' ? first.total : first.best) : 0;
  const lv2 = last ? (metric === 'total' || ex.unit === 'min' ? last.total : last.best) : 0;
  const fp = state.settings.firstPullup;
  const pain = useMemo(() => painLog(state).slice(0, 5), [state]);
  const baseline = state.logs['2026-11-02']?.items.find((i) => i.test && i.exerciseId === 'pushup')?.sets[0];

  return (
    <div>
      <div className="-mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {MAIN_IDS.map((id) => (
          <button key={id} type="button" onClick={() => { setExId(id); setLvPick(null); }} aria-pressed={id === exId}
            className={`h-10 shrink-0 rounded-full px-4 text-[14px] font-semibold ${id === exId ? 'bg-ink text-canvas' : 'border border-hairline text-body'}`}>{SHORT[id]}</button>
        ))}
      </div>

      <Card className="mt-4 p-4">
        <p className="text-[18px] font-semibold">{ex.name}</p>
        {ex.levels && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {(lvs.length ? lvs : [lv]).map((k) => (
              <button key={k} type="button" onClick={() => setLvPick(k)} aria-pressed={k === lv}
                className={`h-8 rounded-full px-3 text-[12px] font-semibold ${k === lv ? 'bg-primary-tint text-primary' : 'bg-strong text-muted'}`}>
                {ex.levels![k]?.name}{k === lvNow ? ' · 지금' : ''}
              </button>
            ))}
          </div>
        )}
        {rows.length === 0 ? (
          <p className="mt-4 rounded-sm bg-soft p-4 text-[14px] leading-[1.6] text-muted">아직 이 단계의 기록이 없습니다. 운동을 기록하면 세션마다 그래프가 쌓입니다.</p>
        ) : (
          <>
            <p className="mt-3 text-[14px] leading-[1.6] text-body">
              {rows.length === 1
                ? <>첫 기록은 <b className="tabular text-ink">{fv}{u}</b>입니다. 다음 기록부터 변화가 보입니다.</>
                : lv2 > fv
                  ? <>이 단계 첫 기록 <b className="tabular text-ink">{fv}{u}</b>에서 최근 <b className="tabular text-ink">{lv2}{u}</b>로, <b className="text-primary">{lv2 - fv}{u}</b> 늘었습니다.</>
                  : <>이 단계에서 {rows.length}번 기록했습니다. 최근 기록은 <b className="tabular text-ink">{lv2}{u}</b>입니다.</>}
            </p>
            {ex.unit !== 'min' && (
              <div className="mt-3 w-44"><Segmented value={metric} onChange={setMetric} options={[{ value: 'total', label: '세션 합계' }, { value: 'best', label: '최고 세트' }]} /></div>
            )}
            <div className="mt-4 flex h-36 items-end gap-1.5">
              {series.map((x, i) => (
                <button key={x.d} type="button" onClick={() => onPick(x.d)} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1">
                  <span className="tabular text-[11px] font-semibold">{vals[i]}</span>
                  <div className="flex w-full max-w-[32px] flex-1 items-end">
                    <div className={`w-full rounded-t-[5px] ${i === series.length - 1 ? 'bg-primary' : 'bg-border-strong'}`} style={{ height: `${Math.max(5, (vals[i] / max) * 100)}%` }} />
                  </div>
                  <span className="tabular max-w-full truncate text-[10px] text-muted">{parts(x.d).m}/{parts(x.d).d}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">{ex.unit === 'min' ? '달린 시간(분)' : metric === 'total' ? `세트 합계(${u})` : `가장 많이 한 세트(${u})`} · 같은 단계끼리만 비교합니다</p>
          </>
        )}
      </Card>

      {rows.length > 0 && (
        <>
          <SectionTitle right={<span className="text-[13px] text-muted">{rows.length}번</span>}>세션 기록</SectionTitle>
          <Card>
            <ul className="divide-y divide-hairline-soft">
              {[...rows].reverse().slice(0, 12).map((x) => (
                <li key={x.d}>
                  <button type="button" onClick={() => onPick(x.d)} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                    <span className="tabular w-12 shrink-0 text-[13px] text-muted">{parts(x.d).m}/{parts(x.d).d}</span>
                    <span className="min-w-0 flex-1">
                      <span className="tabular block text-[15px] font-semibold">{x.sets.join(' · ')}{u}</span>
                      {(x.band || x.kg || x.stopped) && <span className="block truncate text-[12px] text-muted">{[x.band && `밴드 ${x.band}`, x.kg && `+${x.kg}kg`, x.stopped && '통증으로 중단'].filter(Boolean).join(' · ')}</span>}
                    </span>
                    <span className="tabular text-[14px] font-semibold text-muted">{ex.unit === 'min' ? `${x.total}분` : `총 ${x.total}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {exId === 'tyson-pushup' && (
        <p className="mt-4 rounded-md bg-soft px-4 py-3 text-[13px] leading-[1.6] text-body">
          <b className="text-ink">초기 참고 기록</b> · 일반 푸쉬업 최대 {baseline?.done ? baseline.actual : 20}회 (11/2). 타이슨 푸쉬업과는 다른 운동이라 숫자를 서로 바꿔 쓰지 않습니다.
        </p>
      )}
      {exId === 'band-pullup' && (
        <Card className="mt-4 p-4">
          <p className="text-[14px] leading-[1.6] text-body"><b className="text-ink">맨몸 풀업</b> · 시작 기준 0회. 목표는 1회 → 3회 → 5회입니다. 달성 시점은 사람마다 다릅니다.</p>
          {fp.achieved ? (
            <p className="mt-3 flex items-center gap-2 text-[14px] font-semibold text-primary"><Check size={16} strokeWidth={3} />첫 맨몸 풀업 {fp.date ? `${parts(fp.date).m}/${parts(fp.date).d}` : ''}
              <button type="button" onClick={() => { if (confirm('첫 풀업 기록을 취소할까요?')) updateSettings({ firstPullup: { achieved: false } }); }} className="ml-auto text-[12px] font-normal text-muted underline">취소</button></p>
          ) : (
            <PrimaryButton className="mt-3 w-full" onClick={() => { if (confirm('밴드 없이 풀업 1회에 성공하셨나요?')) updateSettings({ firstPullup: { achieved: true, date: today } }); }}>첫 맨몸 풀업 성공 기록하기</PrimaryButton>
          )}
        </Card>
      )}

      <SectionTitle>통증 기록</SectionTitle>
      {pain.length === 0 ? (
        <p className="rounded-md bg-soft p-4 text-[14px] text-muted">기록된 통증이 없습니다.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-hairline-soft">
            {pain.map((p) => (
              <li key={p.d}>
                <button type="button" onClick={() => onPick(p.d)} className="flex w-full items-baseline gap-3 px-4 py-3 text-left">
                  <span className="tabular w-12 shrink-0 text-[13px] text-muted">{parts(p.d).m}/{parts(p.d).d}</span>
                  <span className="min-w-0 flex-1 text-[14px]"><b>{p.areas.map((a) => AREA_LABEL[a]).join('·') || '통증'}</b> · {p.when}{p.memo ? <span className="block truncate text-[12px] text-muted">{p.memo}</span> : null}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
      <p className="mt-2 px-1 text-[12px] leading-[1.5] text-muted">통증이 계속되거나 심해지면 전문가에게 확인받아 주세요.</p>

      <TestCompare />
    </div>
  );
}

/* ───────────── 날짜 상세 (기록 수정 가능) ───────────── */
export function DayDetail({ date, onClose }: { date: string | null; onClose: () => void }) {
  const { state, recordSet } = useStore();
  const log = date ? state.logs[date] : undefined;
  const [edit, setEdit] = useState<{ i: number; j: number; v: number } | null>(null);
  return (
    <Sheet open={!!date} onClose={() => { setEdit(null); onClose(); }} title={date ? longLabel(date) : ''}>
      {!log ? (
        <p className="rounded-sm bg-soft p-4 text-[14px] text-muted">이 날은 기록이 없습니다.</p>
      ) : (
        <div>
          <p className="text-[14px] text-muted">{log.title} · {daySets(log).done}/{daySets(log).total} 세트{log.after?.minutes ? ` · ${log.after.minutes}분` : ''}</p>
          {(log.check || log.after?.rpe || log.after?.pain.length || log.after?.memo) && (
            <div className="mt-3 rounded-sm bg-soft px-3.5 py-2.5 text-[13px] leading-[1.6] text-body">
              {log.check && <p>운동 전 · 수면 {log.check.sleep}시간 · 피로도 {log.check.fatigue}/5{log.check.sore ? ' · 근육통' : ''} · {log.check.pain.length ? `${log.check.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}</p>}
              {log.after && (log.after.rpe > 0 || log.after.pain.length > 0) && <p>운동 후 · {log.after.rpe ? `체감 난도 ${log.after.rpe}/10 · ` : ''}{log.after.pain.length ? `${log.after.pain.map((a) => AREA_LABEL[a]).join('·')} 통증` : '통증 없음'}</p>}
              {log.after?.memo && <p className="mt-1 text-ink">“{log.after.memo}”</p>}
            </div>
          )}
          <p className="mt-4 flex items-center gap-1 text-[12px] text-muted"><Pencil size={11} />세트를 누르면 횟수를 고칠 수 있습니다</p>
          <ul className="mt-2 space-y-3">
            {log.items.map((it, i) => {
              const ex = getEx(it.exerciseId);
              if (!ex) return null;
              const u = unitLabel(ex);
              return (
                <li key={i} className="rounded-sm border border-hairline p-3.5">
                  <p className="text-[15px] font-semibold">{it.label ?? ex.name}{it.lv !== undefined && ex.levels?.[it.lv] ? <span className="text-[12px] font-normal text-muted"> · {ex.levels[it.lv].name}</span> : null}</p>
                  {(it.band || it.kg || it.subFor || it.stopped) && <p className="text-[12px] text-muted">{[it.band && `밴드 ${it.band}`, it.kg && `+${it.kg}kg`, it.subFor && `${getEx(it.subFor)?.name} 대신`, it.stopped && '통증으로 중단'].filter(Boolean).join(' · ')}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {it.sets.map((s, j) => (
                      <button key={j} type="button" onClick={() => setEdit({ i, j, v: s.done ? s.actual : s.target })}
                        className={`tabular rounded-full px-2.5 py-1 text-[12px] font-medium ${edit?.i === i && edit.j === j ? 'ring-2 ring-ink' : ''} ${s.done ? 'bg-primary-tint text-primary' : 'bg-strong text-muted-soft'}`}>
                        {j + 1}세트 {s.done ? `${s.actual}${u}` : '–'}{s.done && s.doneAt ? ` · ${timeLabel(s.doneAt)}` : ''}
                      </button>
                    ))}
                  </div>
                  {edit?.i === i && (
                    <div className="mt-3 flex items-center justify-between gap-2 rounded-sm bg-soft p-2.5">
                      <span className="text-[13px] font-medium">{edit.j + 1}세트</span>
                      <Stepper size="sm" value={edit.v} min={0} max={999} suffix={u} onChange={(v) => setEdit({ ...edit, v })} />
                      <button type="button" onClick={() => { recordSet(date!, edit.i, edit.j, edit.v); setEdit(null); }} className="h-9 rounded-sm bg-ink px-3.5 text-[13px] font-medium text-canvas">저장</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[12px] text-muted">0으로 저장하면 그 세트는 안 한 것으로 바뀝니다.</p>
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
      <SectionTitle>테스트 데이 기록</SectionTitle>
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
      
    </>
  );
}
