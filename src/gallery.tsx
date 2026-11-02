// 개발용: 모든 동작 그림 확인 (배포 빌드에는 포함되지 않음)
import { createRoot } from 'react-dom/client';
import './index.css';
import { DEMOS } from './figure/demos';
import { FigureStill } from './figure/Figure';
import { solve } from './figure/pose';
import { useMemo } from 'react';

function Frames({ k }: { k: string }) {
  const d = DEMOS[k];
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 10, padding: 6 }}>
      <div style={{ fontSize: 11, fontWeight: 700 }}>{k}</div>
      <div style={{ display: 'flex', gap: 4 }}>
        {d.frames.map((_f, i) => <One key={i} k={k} i={i} />)}
      </div>
      <div style={{ fontSize: 9, color: '#666' }}>{d.frames.map((f) => f.label).filter(Boolean).join(' / ')}</div>
      <span style={{ display: 'none' }}>{JSON.stringify(solve(d.frames[0].p).hip)}</span>
    </div>
  );
}
function One({ k, i }: { k: string; i: number }) {
  const d = useMemo(() => ({ ...DEMOS[k], thumb: i }), [k, i]);
  (DEMOS as Record<string, typeof d>)[`${k}#${i}`] = d;
  return <div style={{ width: 150, background: '#f7f7f7', borderRadius: 8 }}><FigureStill art={`${k}#${i}`} className="w-full h-auto" /></div>;
}
createRoot(document.getElementById('g')!).render(
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, padding: 8, width: 1300 }}>
    {Object.keys(DEMOS).filter((k) => !k.includes('#')).map((k) => <Frames key={k} k={k} />)}
  </div>,
);
