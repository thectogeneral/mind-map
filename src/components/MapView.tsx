'use client';
import { useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus } from 'lucide-react';
import { Answers } from '@/lib/engine';
import { MapQ, MapRegion, buildMap, regionBranches, routeNodes } from '@/lib/map';

interface Props { answers: Answers; curStationId: string | null; onBack: () => void }
type Pos = { x: number; y: number; w: number; h: number };

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const curve = (a: Pos, b: Pos, vertical: boolean) => {
  if (vertical) {
    const x1 = a.x + a.w / 2, y1 = a.y + a.h, x2 = b.x + b.w / 2, y2 = b.y, m = (y1 + y2) / 2;
    return `M${x1},${y1} C${x1},${m} ${x2},${m} ${x2},${y2}`;
  }
  const x1 = a.x + a.w, y1 = a.y + a.h / 2, x2 = b.x, y2 = b.y + b.h / 2, m = (x1 + x2) / 2;
  return `M${x1},${y1} C${m},${y1} ${m},${y2} ${x2},${y2}`;
};

interface NodeProps {
  id: string; pos: Pos; title: string; sub?: string; on: boolean; cur: boolean; sel: boolean; dashed?: boolean; tone?: 'ink' | 'green' | 'amber';
  onPick: (id: string) => void;
}
function MapNode({ id, pos, title, sub, on, cur, sel, dashed, tone = 'ink', onPick }: NodeProps) {
  const fill = cur ? 'hsl(var(--accent))' : tone === 'green' ? 'hsl(var(--primary))' : on ? 'hsl(var(--amber-soft))' : 'hsl(var(--card))';
  const text = !cur && tone === 'green' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))';
  return (
    <g role="button" tabIndex={0} aria-label={`${title}${sub ? ', ' + sub : ''}${on ? ', on your route' : ''}`} className="cursor-pointer focus:outline-none"
      onClick={() => onPick(id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPick(id); } }}>
      <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx={3} fill={fill} stroke="hsl(var(--foreground))" strokeWidth={sel ? 3.5 : on ? 2.5 : 1.25} strokeDasharray={dashed ? '5 4' : undefined} />
      <text x={pos.x + 10} y={pos.y + (sub ? 20 : pos.h / 2 + 5)} fontSize={13} fontWeight={700} fill={text}>{clip(title, Math.floor((pos.w - 16) / 7.2))}</text>
      {sub && <text x={pos.x + 10} y={pos.y + 37} fontSize={10.5} fill={text} opacity={0.75}>{clip(sub, Math.floor((pos.w - 16) / 6))}</text>}
    </g>
  );
}

export default function MapView({ answers, curStationId, onBack }: Props) {
  const model = useMemo(() => buildMap(), []);
  const mine = useMemo(() => routeNodes(answers), [answers]);
  const [rid, setRid] = useState<string | null>(null);
  const [sel, setSel] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [outline, setOutline] = useState(false);
  const region = rid ? model.regions.find((r) => r.id === rid) || null : null;
  const hasRoute = mine.size > 0;
  const t = model.totals;

  const pick = (id: string) => {
    if (!region && id.startsWith('region:')) { setRid(id.slice(7)); setSel(null); return; }
    setSel(id);
  };
  const detail = detailFor(sel, model, region);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-outline" onClick={onBack}><ArrowLeft className="h-4 w-4" />Back</button>
        <div className="inline-flex border border-foreground rounded-sm overflow-hidden" role="group" aria-label="Map view">
          {[['Map', false], ['Outline', true]].map(([l, v]) => (
            <button key={String(l)} type="button" aria-pressed={outline === v} onClick={() => setOutline(v as boolean)}
              className={`px-4 py-2 text-xs font-mono-tight uppercase tracking-widest ${outline === v ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="eyebrow mt-8 mb-3">§ Map · every path through the questionnaire</div>
      <h2 className="font-display text-4xl md:text-6xl font-black leading-[1] text-balance">
        The whole map.<span className="block italic font-light text-accent">{region ? region.name : 'Pick a region to zoom in.'}</span>
      </h2>
      <ul className="mt-5 flex flex-wrap gap-2 text-xs">
        {([['regions', t.regions], ['corners', t.corners], ['questions', t.questions.toLocaleString()], ['options', t.options.toLocaleString()], ['branch rules', t.branches.toLocaleString()]] as const).map(([l, n]) => (
          <li key={l} className="tag">{n} {l}</li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-muted-foreground max-w-3xl">
        Every route starts at You and Regions, goes into one or two regions (corner, then five stops), and ends at the Reality check. Dashed links are branches: a question that only appears, or gains options, because of an earlier answer.
        {hasRoute ? ' Your own route is outlined.' : ''}
      </p>

      {outline ? <Outline model={model} region={region} /> : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {region && <button className="btn-outline !h-9 !px-3" onClick={() => { setRid(null); setSel(null); }}><ArrowLeft className="h-4 w-4" />All regions</button>}
            <div className="flex items-center gap-1" role="group" aria-label="Zoom">
              <button className="btn-outline !h-9 !px-2" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.2).toFixed(1)))}><Minus className="h-4 w-4" /></button>
              <span className="eyebrow w-12 text-center">{Math.round(zoom * 100)}%</span>
              <button className="btn-outline !h-9 !px-2" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.2).toFixed(1)))}><Plus className="h-4 w-4" /></button>
            </div>
            <Legend hasRoute={hasRoute} />
          </div>
          <div className="mt-4 border border-foreground rounded-sm bg-card overflow-auto max-h-[75vh]">
            {region
              ? <RegionSvg r={region} mine={mine} cur={curStationId} sel={sel} zoom={zoom} onPick={pick} />
              : <OverviewSvg model={model} mine={mine} cur={curStationId} sel={sel} zoom={zoom} onPick={pick} />}
          </div>
          <Detail d={detail} />
        </>
      )}
    </div>
  );
}

function Legend({ hasRoute }: { hasRoute: boolean }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-2"><svg width="26" height="8" aria-hidden><line x1="0" y1="4" x2="26" y2="4" stroke="hsl(var(--foreground))" strokeWidth="2" /></svg>Main path</li>
      <li className="flex items-center gap-2"><svg width="26" height="8" aria-hidden><line x1="0" y1="4" x2="26" y2="4" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeDasharray="5 3" /></svg>Branch</li>
      {hasRoute && <li className="flex items-center gap-2"><span className="inline-block h-3 w-5 border-2 border-foreground bg-amber-soft" />Your route</li>}
    </ul>
  );
}

/* ------------------------- overview ------------------------- */
function OverviewSvg({ model, mine, cur, sel, zoom, onPick }: { model: ReturnType<typeof buildMap>; mine: Set<string>; cur: string | null; sel: string | null; zoom: number; onPick: (id: string) => void }) {
  const n = model.regions.length, rowH = 58, top = 24, H = Math.max(n * rowH + top * 2, 360), W = 980, mid = H / 2;
  const you: Pos = { x: 16, y: mid - 38, w: 130, h: 76 };
  const hub: Pos = { x: 200, y: mid - 38, w: 130, h: 76 };
  const rp = (i: number): Pos => ({ x: 400, y: top + i * rowH, w: 300, h: 46 });
  const cr: Pos = { x: 790, y: mid - 76, w: 170, h: 56 };
  const rc: Pos = { x: 790, y: mid + 20, w: 170, h: 56 };
  const ink = 'hsl(var(--foreground))';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * zoom} height={H * zoom} role="group" aria-label="Map of all regions" className="block">
      <path d={curve(you, hub, false)} fill="none" stroke={ink} strokeWidth={2} />
      {model.regions.map((r, i) => {
        const on = mine.has(`region:${r.id}`);
        return (
          <g key={r.id}>
            <path d={curve(hub, rp(i), false)} fill="none" stroke={ink} strokeWidth={on ? 3 : 1.25} opacity={on ? 1 : 0.5} />
            <path d={curve(rp(i), rc, false)} fill="none" stroke={ink} strokeWidth={on ? 3 : 1} opacity={on ? 1 : 0.25} />
            <path d={curve(rp(i), cr, false)} fill="none" stroke="hsl(var(--accent))" strokeWidth={1} strokeDasharray="5 4" opacity={0.35} />
          </g>
        );
      })}
      <MapNode id="you" pos={you} title="You" sub={`${model.you.length} questions`} on={mine.has('you')} cur={cur === 'you'} sel={sel === 'you'} tone="green" onPick={onPick} />
      <MapNode id="regions" pos={hub} title="Regions" sub={`pick 1 or 2 of ${n}`} on={mine.has('regions')} cur={cur === 'regions'} sel={sel === 'regions'} tone="green" onPick={onPick} />
      {model.regions.map((r, i) => (
        <MapNode key={r.id} id={`region:${r.id}`} pos={rp(i)} title={r.name} sub={`${r.counts.corners} corners · ${r.counts.questions} questions · ${r.counts.branches} ${r.counts.branches === 1 ? 'branch' : 'branches'}`}
          on={mine.has(`region:${r.id}`)} cur={false} sel={false} onPick={onPick} />
      ))}
      <MapNode id="cross" pos={cr} title="Crossover" sub="only with two regions" on={mine.has('cross')} cur={cur === 'cross'} sel={sel === 'cross'} dashed onPick={onPick} />
      <MapNode id="close" pos={rc} title="Reality check" sub={`${model.close.length} questions`} on={mine.has('close')} cur={cur === 'close'} sel={sel === 'close'} tone="green" onPick={onPick} />
    </svg>
  );
}

/* ------------------------- one region ------------------------- */
function RegionSvg({ r, mine, cur, sel, zoom, onPick }: { r: MapRegion; mine: Set<string>; cur: string | null; sel: string | null; zoom: number; onPick: (id: string) => void }) {
  const n = r.corners.length, rowH = 52, top = 24, W = 1040;
  const H = Math.max(n * rowH + top * 2, 640);
  const fork: Pos = { x: 16, y: H / 2 - 36, w: 240, h: 72 };
  const cp = (i: number): Pos => ({ x: 330, y: top + i * rowH, w: 250, h: 42 });
  const sh = 84, sp = (i: number): Pos => ({ x: 720, y: top + i * sh, w: 244, h: 56 });
  const last = r.stations.length - 1;
  const cross: Pos = { x: 720, y: top + last * sh + 90, w: 244, h: 46 };
  const close: Pos = { x: 720, y: top + last * sh + 160, w: 244, h: 46 };
  const bus = 650;
  const pos = new Map<string, Pos>();
  pos.set(`${r.id}:territory`, fork);
  r.corners.forEach((c, i) => pos.set(c.id, cp(i)));
  r.stations.forEach((x, i) => pos.set(x.id, sp(i)));
  const ink = 'hsl(var(--foreground))';
  const branches = regionBranches(r);
  const cy = (i: number) => cp(i).y + cp(i).h / 2;
  const first = sp(0);
  const midY = (cy(0) + cy(n - 1)) / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W * zoom} height={H * zoom} role="group" aria-label={`Map of ${r.name}`} className="block">
      {r.corners.map((c, i) => {
        const on = mine.has(c.id);
        return (
          <g key={c.id}>
            <path d={curve(fork, cp(i), false)} fill="none" stroke={ink} strokeWidth={on ? 3 : 1.25} opacity={on ? 1 : 0.4} />
            <path d={`M${cp(i).x + cp(i).w},${cy(i)} H${bus}`} fill="none" stroke={ink} strokeWidth={on ? 3 : 1} opacity={on ? 1 : 0.3} />
          </g>
        );
      })}
      <path d={`M${bus},${cy(0)} V${cy(n - 1)}`} fill="none" stroke={ink} strokeWidth={1.5} opacity={0.5} />
      <path d={`M${bus},${midY} H${first.x - 14} V${first.y + first.h / 2} H${first.x}`} fill="none" stroke={ink} strokeWidth={1.5} />
      {r.stations.slice(0, -1).map((x, i) => (
        <path key={x.id} d={`M${sp(i).x + sp(i).w / 2},${sp(i).y + sp(i).h} V${sp(i + 1).y}`} fill="none" stroke={ink} strokeWidth={mine.has(x.id) ? 3 : 1.5} />
      ))}
      <path d={`M${sp(last).x + sp(last).w / 2},${sp(last).y + sp(last).h} V${cross.y}`} fill="none" stroke={ink} strokeWidth={1.5} strokeDasharray="5 4" />
      <path d={`M${cross.x + cross.w / 2},${cross.y + cross.h} V${close.y}`} fill="none" stroke={ink} strokeWidth={1.5} />
      <path d={`M${sp(last).x + sp(last).w},${sp(last).y + sp(last).h / 2} H${W - 8} V${close.y + close.h / 2} H${close.x + close.w}`} fill="none" stroke={ink} strokeWidth={1.5} />
      {branches.map((e) => {
        const a = pos.get(e.from), b = pos.get(e.to);
        if (!a || !b) return null;
        const fromCorner = e.from.includes(':corner:');
        const d = fromCorner
          ? `M${a.x + a.w},${a.y + a.h / 2} C${a.x + a.w + 70},${a.y + a.h / 2} ${b.x - 70},${b.y + 14} ${b.x},${b.y + 14}`
          : `M${a.x + a.w},${a.y + 14} C${a.x + a.w + 50},${a.y + 14} ${b.x + b.w + 50},${b.y + 14} ${b.x + b.w},${b.y + 14}`;
        return <path key={`${e.from}>${e.to}>${e.kind}`} d={d} fill="none" stroke="hsl(var(--accent))" strokeWidth={e.kind === 'when' ? 2.5 : 1.5} strokeDasharray="6 4" opacity={0.9}><title>{e.labels.join('\n')}</title></path>;
      })}
      <MapNode id={`${r.id}:territory`} pos={fork} title={r.fork.text} sub={`${n} corners, pick up to ${r.fork.max}`} on={mine.has(`${r.id}:territory`)} cur={cur === `${r.id}:territory`} sel={sel === `${r.id}:territory`} tone="green" onPick={onPick} />
      {r.corners.map((c, i) => (
        <MapNode key={c.id} id={c.id} pos={cp(i)} title={c.name} sub={`${c.qs.length} questions`} on={mine.has(c.id)} cur={cur === c.id} sel={sel === c.id} onPick={onPick} />
      ))}
      {r.stations.map((x, i) => {
        const br = x.qs.reduce((k, q) => k + q.conds.length, 0);
        return <MapNode key={x.id} id={x.id} pos={sp(i)} title={x.title} sub={`${x.qs.length} questions · ${br} ${br === 1 ? 'branch' : 'branches'}`} on={mine.has(x.id)} cur={cur === x.id} sel={sel === x.id} tone="green" onPick={onPick} />;
      })}
      <MapNode id="cross" pos={cross} title="Crossover" sub="only with two regions" on={mine.has('cross')} cur={cur === 'cross'} sel={sel === 'cross'} dashed onPick={onPick} />
      <MapNode id="close" pos={close} title="Reality check" sub="5 questions" on={mine.has('close')} cur={cur === 'close'} sel={sel === 'close'} tone="green" onPick={onPick} />
    </svg>
  );
}

/* ------------------------- detail panel ------------------------- */
interface DetailData { title: string; note: string; qs: MapQ[]; opens?: string[] }
function detailFor(sel: string | null, m: ReturnType<typeof buildMap>, r: MapRegion | null): DetailData | null {
  if (!sel) return null;
  if (sel === 'you') return { title: 'You', note: 'Skills, time, money and who you want to serve. Everyone answers these.', qs: m.you };
  if (sel === 'regions') return { title: 'Regions', note: 'Choose one region, or two to combine them.', qs: m.regionQs };
  if (sel === 'cross') return { title: 'Crossover', note: 'Asked only when two regions are chosen.', qs: m.cross };
  if (sel === 'close') return { title: 'Reality check', note: 'Evidence, commitment and a plan B. Everyone answers these.', qs: m.close };
  if (!r) return null;
  if (sel === `${r.id}:territory`) return { title: r.name, note: r.blurb, qs: [r.fork] };
  const c = r.corners.find((x) => x.id === sel);
  if (c) return { title: `${r.name} / ${c.name}`, note: 'Asked only if you choose this corner.', qs: c.qs, opens: regionBranches(r).filter((e) => e.from === c.id).flatMap((e) => e.labels) };
  const s = r.stations.find((x) => x.id === sel);
  if (s) return { title: `${r.name} / ${s.title}`, note: s.blurb, qs: s.qs };
  return null;
}
function Detail({ d }: { d: DetailData | null }) {
  if (!d) return <p className="mt-4 text-sm text-muted-foreground">Click a stop to see its questions and branch rules.</p>;
  return (
    <section className="mt-4 border border-foreground rounded-sm bg-card p-5" aria-live="polite">
      <h3 className="font-display text-2xl font-black">{d.title}</h3>
      <p className="text-sm text-muted-foreground">{d.note}</p>
      <QList qs={d.qs} />
      {d.opens && d.opens.length > 0 && (
        <div className="mt-4">
          <div className="eyebrow mb-2">Choosing this corner changes later questions</div>
          <ul className="space-y-1 text-sm">{d.opens.map((o) => <li key={o} className="border-l-2 border-accent pl-3">{o}</li>)}</ul>
        </div>
      )}
    </section>
  );
}
function QList({ qs }: { qs: MapQ[] }) {
  return (
    <ol className="mt-3 space-y-2">
      {qs.map((q) => (
        <li key={q.id} className="text-sm border-b border-border pb-2">
          <div><span className="font-medium">{q.text}</span> <span className="text-muted-foreground">· {q.opts} options, {q.max === 1 ? 'pick one' : `up to ${q.max}`}</span>{q.depth && <span className="ml-2 tag">{q.depth} depth</span>}</div>
          {q.conds.map((c, i) => <div key={i} className="mt-1 text-xs text-accent-foreground bg-amber-soft inline-block mr-2 px-2 py-0.5 rounded-sm border border-dashed border-foreground">{c.label}</div>)}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------- outline (text view) ------------------------- */
function Outline({ model, region }: { model: ReturnType<typeof buildMap>; region: MapRegion | null }) {
  const regions = region ? [region] : model.regions;
  return (
    <div className="mt-6 space-y-3">
      {[['You', model.you], ['Regions', model.regionQs]].map(([t, qs]) => (
        <details key={t as string} className="border border-foreground rounded-sm bg-card"><summary className="cursor-pointer px-4 py-3 font-display font-bold">{t as string}<span className="ml-2 text-sm font-normal text-muted-foreground">{(qs as MapQ[]).length} questions</span></summary><div className="px-4 pb-4"><QList qs={qs as MapQ[]} /></div></details>
      ))}
      {regions.map((r) => (
        <details key={r.id} className="border border-foreground rounded-sm bg-card" open={!!region}>
          <summary className="cursor-pointer px-4 py-3 font-display font-bold">{r.name}<span className="ml-2 text-sm font-normal text-muted-foreground">{r.counts.corners} corners · {r.counts.questions} questions · {r.counts.branches} {r.counts.branches === 1 ? 'branch' : 'branches'}</span></summary>
          <div className="px-4 pb-4 space-y-2">
            <div className="text-sm font-medium">{r.fork.text}</div>
            {r.corners.map((c) => (
              <details key={c.id} className="border border-border rounded-sm"><summary className="cursor-pointer px-3 py-2 text-sm font-medium">Corner: {c.name}<span className="ml-2 text-xs text-muted-foreground">{c.qs.length} questions</span></summary><div className="px-3 pb-3"><QList qs={c.qs} /></div></details>
            ))}
            {r.stations.map((s) => (
              <details key={s.id} className="border border-border rounded-sm"><summary className="cursor-pointer px-3 py-2 text-sm font-medium">{s.title}<span className="ml-2 text-xs text-muted-foreground">{s.qs.length} questions</span></summary><div className="px-3 pb-3"><QList qs={s.qs} /></div></details>
            ))}
          </div>
        </details>
      ))}
      {[['Crossover (only with two regions)', model.cross], ['Reality check', model.close]].map(([t, qs]) => (
        <details key={t as string} className="border border-foreground rounded-sm bg-card"><summary className="cursor-pointer px-4 py-3 font-display font-bold">{t as string}<span className="ml-2 text-sm font-normal text-muted-foreground">{(qs as MapQ[]).length} questions</span></summary><div className="px-4 pb-4"><QList qs={qs as MapQ[]} /></div></details>
      ))}
    </div>
  );
}
