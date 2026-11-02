// 햅틱/알림음. iOS Safari는 navigator.vibrate를 지원하지 않으므로 소리로 대체됩니다.
let ctx: AudioContext | null = null;

/** 사용자 터치 시점에 호출해 오디오를 미리 활성화(iOS 정책) */
export function unlockAudio() {
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch { /* 무시 */ }
}

export function haptic(pattern: number | number[] = 15) {
  try { navigator.vibrate?.(pattern); } catch { /* 미지원 */ }
}

export function chime() {
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    [880, 1175].forEach((freq, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      const t = now + i * 0.18;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(ctx!.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  } catch { /* 무시 */ }
}
