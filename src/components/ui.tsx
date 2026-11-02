import { Minus, Plus, X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md border border-hairline bg-canvas ${className}`}>{children}</div>;
}

export function Chip({ children, tone = 'soft' }: { children: ReactNode; tone?: 'soft' | 'primary' | 'ink' }) {
  const cls = tone === 'primary' ? 'bg-primary-tint text-primary' : tone === 'ink' ? 'bg-ink text-canvas' : 'bg-strong text-muted';
  return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none ${cls}`}>{children}</span>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex items-end justify-between">
      <h2 className="text-[20px] font-semibold tracking-[-0.18px]">{children}</h2>
      {right}
    </div>
  );
}

export function Stepper({ value, onChange, min = 0, max = 999, suffix, size = 'md', step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; suffix?: string; size?: 'sm' | 'md'; step?: number;
}) {
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const set = (v: number) => onChange(Math.min(max, Math.max(min, v)));
  return (
    <div className="inline-flex items-center gap-1.5">
      <button type="button" aria-label="줄이기" onClick={() => set(value - step)} disabled={value <= min}
        className={`${btn} grid place-items-center rounded-full border border-hairline text-ink disabled:text-muted-soft disabled:border-hairline-soft`}>
        <Minus size={14} strokeWidth={2.5} />
      </button>
      <label className="flex min-w-[44px] items-baseline justify-center gap-0.5">
        <input type="number" inputMode="numeric" value={value}
          onChange={(e) => set(Number(e.target.value) || 0)}
          className="tabular w-9 bg-transparent text-center text-[16px] font-semibold outline-none" />
        {suffix && <span className="text-[13px] text-muted">{suffix}</span>}
      </label>
      <button type="button" aria-label="늘리기" onClick={() => set(value + step)} disabled={value >= max}
        className={`${btn} grid place-items-center rounded-full border border-hairline text-ink disabled:text-muted-soft`}>
        <Plus size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-8 w-[52px] rounded-full transition-colors ${checked ? 'bg-ink' : 'bg-border-strong'}`}>
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-canvas shadow-float transition-all ${checked ? 'left-[24px]' : 'left-1'}`} />
    </button>
  );
}

export function Segmented<T extends string>({ value, options, onChange }: {
  value: T; options: { value: T; label: ReactNode }[]; onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-strong p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-3 py-2 text-[14px] font-medium transition-colors ${value === o.value ? 'bg-canvas text-ink shadow-float' : 'text-muted'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="animate-rise safe-bottom relative max-h-[85vh] w-full max-w-[560px] overflow-y-auto rounded-t-[24px] bg-canvas">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-hairline-soft bg-canvas px-5 py-4">
          <h3 className="text-[16px] font-semibold">{title}</h3>
          <button onClick={onClose} aria-label="닫기" className="grid h-8 w-8 place-items-center rounded-full bg-strong"><X size={16} /></button>
        </div>
        <div className="px-5 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, className = '', disabled }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`h-12 rounded-sm bg-primary px-6 text-[16px] font-medium text-on-primary active:bg-primary-active disabled:bg-primary-disabled ${className}`}>
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = '' }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`h-12 rounded-sm border border-ink bg-canvas px-5 text-[15px] font-medium text-ink active:bg-soft ${className}`}>
      {children}
    </button>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-strong">
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${value}%` }} />
    </div>
  );
}
