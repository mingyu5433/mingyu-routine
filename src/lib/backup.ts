import type { AppState } from '../types';
import { todayKey } from './date';

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
