import { Award, Check, ChevronLeft, ChevronRight, Flame, TrendingUp, Trophy } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { useStore } from '../lib/store';
import { daysInMonth, longLabel, pad, parts, timeLabel, weekday } from '../lib/date';
import {
  completion, computeStats, dayKinds, daySets, growthMessage, isWorkoutDay, monthSummary, phaseOf, weekCompare, weeklySeries,
} from '../lib/stats';
import { EXERCISES, formatTarget, getEx, unitLabel } from '../data/exercises';
import { PHASES } from '../data/quotes';
import { Card, Chip, PrimaryButton, SectionTitle, Segmented, Sheet } from '../components/ui';

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

      <div className="mt-4 grid grid-cols-3 gap-2">
        <MiniStat label="운동한 날" value={sum.days.length} unit="일" />
        <MiniStat label="모두 완료" value={sum.full} unit="일" />
        <MiniStat label="걷기" value={sum.walkMin} unit="분" />
      </div>

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
function StatsView() {
  const { state, today, updateSettings } = useStore();
  const st = useMemo(() => computeStats(state, today), [state, today]);
  const cmp = useMemo(() => weekCompare(state, today), [state, today]);
  const ph = phaseOf(state.settings.startDate, today);
  const fp = state.settings.firstPullup;
  const exStats = EXERCISES.filter((e) => st.perEx[e.id]);
  const [series, setSeries] = useState<string>('');
  const points = useMemo(() => weeklySeries(state, today, series || undefined), [state, today, series]);
  const seriesEx = series ? getEx(series) : undefined;
  const maxV = Math.max(1, ...points.map((p) => p.value));
  const graphOptions = ['incline-pushup', 'foot-pullup', 'squat', 'hip-bridge', 'brisk-walk'].filter((id) => st.perEx[id]);

  return (
    <>
      <p className="mt-5 text-[14px] text-muted">
        {st.totalDays === 0 ? '첫 기록이 시작될 자리입니다. 오늘 한 세트부터 가볍게.' : `지금까지 ${st.totalDays}일 동안 몸을 움직였습니다.`}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Stat label="이번 주 운동한 날" value={st.weekDays} unit="일" sub={`계획 ${st.weekPlanned}일 중`} />
        <Stat label="주간 지속률" value={st.weekRate} unit="%" sub="오늘까지 계획 대비" />
        <Stat label="연속 운동" value={st.streak} unit="일" sub="휴식일은 이어서 계산" icon={<Flame size={14} className="text-primary" />} />
        <Stat label="총 완료 세트" value={st.totalSets} unit="세트" sub="누적" />
      </div>

      {/* 실제 기록 기반 성장 비교 */}
      <SectionTitle>지난주와 비교</SectionTitle>
      <Card className="p-4">
        {!cmp.hasNow ? (
          <p className="text-[14px] leading-[1.6] text-muted">이번 주 기록이 쌓이면 지난주 같은 기간({cmp.span === 0 ? '월요일' : `월~${WD_SHORT[(cmp.span + 1) % 7]}`})과 비교해 드립니다.</p>
        ) : !cmp.hasPrev ? (
          <p className="text-[14px] leading-[1.6] text-muted">지난주 같은 기간({cmp.span === 0 ? '월요일' : `월~${WD_SHORT[(cmp.span + 1) % 7]}`})에는 기록이 없어 아직 비교할 수 없어요. 실제 기록이 있을 때만 변화를 보여 드립니다.</p>
        ) : (
          <>
            <p className="text-[12px] font-semibold text-muted">{cmp.span === 0 ? '월요일' : `월~${WD_SHORT[(cmp.span + 1) % 7]}`} 기준 · 완료 세트 {cmp.setsPrev} → {cmp.setsNow}</p>
            {cmp.items.length === 0 ? (
              <p className="mt-2 text-[14px] text-muted">두 주에 공통으로 한 운동이 아직 없어요.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {cmp.items.slice(0, 5).map((it) => {
                  const ex = getEx(it.exId)!;
                  return (
                    <li key={it.exId} className="flex gap-2.5 text-[14px] leading-[1.5]">
                      <TrendingUp size={16} className={`mt-0.5 shrink-0 ${it.diff > 0 ? 'text-primary' : 'text-muted-soft'}`} />
                      <span className={it.diff > 0 ? 'text-ink' : 'text-body'}>{growthMessage(ex, it.diff, unitLabel(ex))}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </Card>

      {/* 최근 4주 추이 · 성장 그래프 */}
      <SectionTitle>최근 4주 추이</SectionTitle>
      <div className="-mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {[{ id: '', name: '완료 세트' }, ...graphOptions.map((id) => ({ id, name: getEx(id)!.name }))].map((o) => (
          <button key={o.id || 'all'} onClick={() => setSeries(o.id)}
            className={`h-9 shrink-0 rounded-full px-3.5 text-[14px] font-medium ${series === o.id ? 'bg-ink text-canvas' : 'border border-hairline text-ink'}`}>
            {o.name}
          </button>
        ))}
      </div>
      <Card className="p-4">
        <div className="flex h-36 items-end justify-between gap-3">
          {points.map((w, i) => {
            const h = Math.round((w.value / maxV) * 100);
            const { m, d } = parts(w.start);
            return (
              <div key={w.start} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="tabular text-[12px] font-semibold">{w.value}</span>
                <div className="flex w-full max-w-[44px] flex-1 items-end">
                  <div className={`w-full rounded-t-[6px] ${i === 3 ? 'bg-primary' : 'bg-border-strong'}`} style={{ height: `${Math.max(h, w.value ? 6 : 2)}%` }} />
                </div>
                <span className="tabular text-[11px] text-muted">{i === 3 ? '이번 주' : `${m}/${d}~`}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-[12px] text-muted">
          {seriesEx ? `주별 ${seriesEx.name} 누적 ${unitLabel(seriesEx)}${seriesEx.perSide ? '(좌우 각)' : ''}` : '주별 완료 세트 수'} · 이번 주는 오늘까지
        </p>
      </Card>

      {/* 첫 풀업 */}
      <SectionTitle>첫 풀업</SectionTitle>
      <Card className={`p-5 ${fp.achieved ? 'border-primary' : ''}`}>
        <div className="flex items-center gap-4">
          <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-full ${fp.achieved ? 'bg-primary text-on-primary' : 'bg-strong text-muted'}`}>
            <Trophy size={24} />
          </div>
          <div className="flex-1">
            {fp.achieved ? (
              <>
                <p className="text-[16px] font-semibold">첫 풀업 성공!</p>
                <p className="text-[14px] text-muted">{fp.date ? longLabel(fp.date) : ''}</p>
              </>
            ) : (
              <>
                <p className="text-[16px] font-semibold">도전 중</p>
                <p className="text-[14px] text-muted">발 보조 풀업 최고 {st.perEx['foot-pullup']?.best ?? 0}회 · 천천히, 그러나 꾸준히</p>
              </>
            )}
          </div>
        </div>
        {fp.achieved ? (
          <button onClick={() => { if (confirm('첫 풀업 기록을 취소할까요?')) updateSettings({ firstPullup: { achieved: false } }); }}
            className="mt-4 text-[13px] text-muted underline underline-offset-4">기록 취소</button>
        ) : (
          <PrimaryButton className="mt-4 w-full" onClick={() => { if (confirm('보조 없이 풀업 1회에 성공하셨나요?')) updateSettings({ firstPullup: { achieved: true, date: today } }); }}>
            첫 풀업 성공 기록하기
          </PrimaryButton>
        )}
      </Card>

      {/* 개인 기록 */}
      <SectionTitle>운동별 누적 · 최고 기록</SectionTitle>
      {exStats.length === 0 ? (
        <p className="rounded-md bg-soft p-5 text-center text-[14px] text-muted">세트를 완료하면 이곳에 운동별 기록이 쌓입니다.</p>
      ) : (
        <Card>
          <ul className="divide-y divide-hairline-soft">
            {exStats.map((e) => {
              const s = st.perEx[e.id];
              return (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{e.name}</p>
                    <p className="tabular text-[13px] text-muted">누적 {s.total.toLocaleString()}{unitLabel(e)}{e.perSide ? '(좌우 각)' : ''} · {s.sets}세트</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="flex items-center justify-end gap-1 text-[11px] font-semibold text-muted"><Award size={12} />최고</p>
                    <p className="tabular text-[16px] font-semibold">{formatTarget(e, s.best)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* 성장 로드맵 */}
      <SectionTitle right={<span className="text-[13px] text-muted">{ph.week}주차</span>}>성장 로드맵</SectionTitle>
      <div className="space-y-3">
        {PHASES.map((p, i) => {
          const cur = i === ph.idx, past = i < ph.idx;
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
      <p className="mt-3 px-1 text-[12px] leading-[1.5] text-muted">단계별 목표는 방향을 잡기 위한 기준입니다. 변화의 속도는 개인차가 크며 결과를 보장하지 않습니다.</p>
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
          <ul className="mt-4 space-y-3">
            {log.items.map((it, i) => {
              const ex = getEx(it.exerciseId);
              if (!ex) return null;
              return (
                <li key={i} className="rounded-sm border border-hairline p-3.5">
                  <p className="text-[15px] font-semibold">{ex.name}</p>
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

function Stat({ label, value, unit, sub, icon }: { label: string; value: number; unit: string; sub: string; icon?: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="flex items-center gap-1 text-[12px] font-bold text-muted">{icon}{label}</p>
      <p className="tabular mt-2 text-[28px] font-bold leading-none">{value.toLocaleString()}<span className="ml-0.5 text-[14px] font-medium text-muted">{unit}</span></p>
      <p className="mt-1.5 text-[12px] text-muted-soft">{sub}</p>
    </Card>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="rounded-md bg-soft px-3 py-3">
      <p className="text-[12px] font-semibold text-muted">{label}</p>
      <p className="tabular mt-1 text-[22px] font-bold leading-none">{value}<span className="ml-0.5 text-[12px] font-medium text-muted">{unit}</span></p>
    </div>
  );
}
