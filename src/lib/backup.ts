import type { AppState } from '../types';
import { todayKey } from './date';
import { getEx } from '../data/exercises';

export type BackupResult = 'shared' | 'downloaded' | 'cancelled';

/**
 * 원터치 백업: 아이폰 공유 시트를 열어 '파일에 저장(iCloud Drive)' 등으로 보냅니다.
 * 공유 시트를 지원하지 않는 브라우저에서는 파일을 바로 내려받습니다.
 */
export async function shareBackup(state: AppState): Promise<BackupResult> {
  const name = `mingyu-routine-backup-${todayKey()}.json`;
  const json = JSON.stringify({ ...state, timer: null, exportedAt: new Date().toISOString() }, null, 2);
  const file = new File([json], name, { type: 'application/json' });
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: '민규 루틴 백업' });
      return 'shared';
    }
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return 'cancelled';
    // 공유 실패 시 내려받기로 대체
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}

export const daysSince = (ms?: number) => (ms ? Math.floor((Date.now() - ms) / 86400000) : null);

/** 세트 단위 CSV (엑셀·구글 시트에서 열기) */
export function exportCsv(state: AppState) {
  const esc = (v: unknown) => { const t = String(v ?? ''); return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const head = ['날짜', '운동 종류', '구분', '운동명', '난도', '밴드', '추가 중량(kg)', '대체·중단', '세트', '목표', '실제', '단위', '여유(RIR)', '완료', '총 운동 시간(분)', '체감 난도', '통증', '메모', '수면(시간)', '피로도'];
  const rows: string[] = [head.join(',')];
  const PH: Record<string, string> = { warmup: '준비운동', main: '본운동', cool: '스트레칭' };
  for (const d of Object.keys(state.logs).sort()) {
    const l = state.logs[d];
    const pain = [...new Set([...(l.check?.pain ?? []), ...(l.after?.pain ?? [])])].join('/');
    for (const it of l.items) {
      const ex = getEx(it.exerciseId);
      const phase = it.test ? '테스트' : PH[it.phase ?? (ex?.category === 'warmup' ? 'warmup' : ex?.category === 'mobility' ? 'cool' : 'main')];
      const unit = ex?.unit === 'sec' ? '초' : ex?.unit === 'min' ? '분' : '회';
      it.sets.forEach((s, j) => rows.push([
        d, l.title, phase, it.label ?? ex?.name ?? it.exerciseId, it.lv !== undefined ? ex?.levels?.[it.lv]?.name ?? '' : '',
        j + 1, s.target, s.done ? s.actual : '', unit, s.done ? 'Y' : 'N',
        l.after?.minutes ?? '', l.after?.rpe ?? '', pain, l.after?.memo ?? '', l.check?.sleep ?? '', l.check?.fatigue ?? '',
      ].map(esc).join(',')));
    }
  }
  const blob = new Blob(['﻿' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `mingyu-routine-${todayKey()}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
