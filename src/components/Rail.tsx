'use client';
import { Answers, Station, isAns, listOf, optText } from '@/lib/engine';
import { Check } from 'lucide-react';

const LINE: Record<string, string> = { s: 'hsl(var(--foreground))', a: 'hsl(var(--emerald))', b: 'hsl(var(--amber))', x: 'hsl(var(--foreground))' };

export default function Rail({ stations, a, curId, onGo, total, done }: { stations: Station[]; a: Answers; curId: string | null; onGo: (id: string) => void; total: number; done: number }) {
  const cur = stations.find((s) => s.id === curId);
  const body = (
    <ol className="relative">
      {stations.map((s, idx) => {
        const n = s.qs.length, d = s.qs.filter((q) => isAns(a, q.id)).length;
        const full = n > 0 && d === n, isCur = s.id === curId;
        const color = LINE[s.line];
        const first = s.qs.find((q) => isAns(a, q.id));
        const sum = first ? listOf(a, first.id).map((x) => optText(first, x, a)).join(', ') : '';
        const last = idx === stations.length - 1;
        const dotStyle: React.CSSProperties = s.line === 'x'
          ? { borderColor: 'hsl(var(--emerald)) hsl(var(--amber)) hsl(var(--amber)) hsl(var(--emerald))', background: full ? 'hsl(var(--foreground))' : 'hsl(var(--card))' }
          : { borderColor: color, background: isCur ? 'hsl(var(--accent))' : full ? color : 'hsl(var(--card))' };
        const inner = (
          <>
            <span className="eyebrow !text-[10px] block">{s.tag}</span>
            <span className={`font-display text-base leading-tight block ${isCur ? 'font-black' : 'font-bold'} ${s.ghost ? 'text-muted-foreground italic font-normal' : ''}`}>{s.title}</span>
            {n > 0 && (
              <span className="mt-1 flex items-center gap-2 text-[10px] font-mono-tight uppercase tracking-widest text-muted-foreground">
                {full ? <Check className="h-3 w-3 text-accent" /> : null}{d} of {n}
              </span>
            )}
            {sum && <span className="mt-0.5 block text-xs text-muted-foreground truncate max-w-[15rem]">{sum}</span>}
          </>
        );
        return (
          <li key={s.id} className="relative pl-9 pb-5">
            {!last && <span aria-hidden className="absolute left-[9px] top-4 bottom-[-2px] w-[3px]" style={{ background: color, opacity: s.ghost ? 0.25 : 1 }} />}
            <span aria-hidden className={`absolute left-0 top-1 h-[21px] w-[21px] rounded-full border-[3px] ${isCur ? 'pulse' : ''}`} style={dotStyle} />
            {s.ghost ? <div className="opacity-60">{inner}</div> : (
              <button type="button" onClick={() => onGo(s.id)} aria-current={isCur ? 'step' : undefined}
                className={`block w-full text-left rounded-sm -mx-2 px-2 py-1 transition-colors hover:bg-amber-soft ${isCur ? 'bg-amber-soft' : ''}`}>{inner}</button>
            )}
          </li>
        );
      })}
    </ol>
  );
  return (
    <aside aria-label="Your route">
      <details className="lg:hidden border border-foreground rounded-sm bg-card">
        <summary className="flex items-center justify-between gap-3 p-3 cursor-pointer text-sm font-medium list-none">
          <span className="font-display font-bold truncate">Route: {cur ? cur.title : 'Overview'}</span>
          <span className="eyebrow shrink-0">{done} of {total}</span>
        </summary>
        <div className="p-4 pt-2 max-h-[60vh] overflow-y-auto border-t border-foreground">{body}</div>
      </details>
      <div className="hidden lg:block sticky top-20 border border-foreground rounded-sm bg-card p-5 max-h-[calc(100vh-7rem)] overflow-y-auto">
        <div className="flex items-baseline justify-between mb-4"><span className="eyebrow">Your route</span><span className="eyebrow">{done} of {total} answered</span></div>
        {body}
      </div>
    </aside>
  );
}
