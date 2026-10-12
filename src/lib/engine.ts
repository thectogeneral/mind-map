import { domains, you, regionQs, cross, close } from '@/content';
import type { Domain, Question } from '@/content/lib';

export type Answer = { picks: string[]; other: string };
export type Answers = Record<string, Answer>;
export type Line = 's' | 'a' | 'b' | 'x';
export interface Station {
  id: string; title: string; tag: string; blurb: string; line: Line;
  qs: Question[]; domain?: Domain; ghost?: boolean;
}

export const REGION_Q = regionQs[0];
export const DOMAINS = domains;
export const domainByName = (n: string) => domains.find((d) => d.name === n);

export const picksOf = (a: Answers, id: string): string[] => (a[id] ? a[id].picks : []);
export const otherOf = (a: Answers, id: string): string => (a[id] ? a[id].other.trim() : '');
export const isAns = (a: Answers, id: string) => picksOf(a, id).length > 0 || otherOf(a, id) !== '';
export const listOf = (a: Answers, id: string): string[] => [...picksOf(a, id), ...(otherOf(a, id) ? [otherOf(a, id)] : [])];

/* ------- depth: how many optional questions the route includes ------- */
export type Depth = 'quick' | 'standard' | 'deep';
export const DEPTHS: Depth[] = ['quick', 'standard', 'deep'];
export const DEPTH_ID = '_depth';
const RANK: Record<string, number> = { quick: 0, standard: 1, deep: 2 };
/** Missing means quick, so routes saved before depth existed keep their questions. */
export const depthOf = (a: Answers): Depth => {
  const d = a[DEPTH_ID]?.picks[0];
  return d === 'standard' || d === 'deep' ? d : 'quick';
};
export const withDepth = (a: Answers, d: Depth): Answers => ({ ...a, [DEPTH_ID]: { picks: [d], other: '' } });
/** True when any question needs more than the quick depth. */
export const depthAvailable = domains.some((d) => [d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)].some((q) => q.depth));

const holds = (a: Answers, c: { id: string; has: string[] }) => picksOf(a, c.id).some((p) => c.has.includes(p));
/** A drop keyed to markets applies only when EVERY chosen market is listed, so someone selling in Nigeria and the USA keeps options that still apply in the USA. */
const dropApplies = (a: Answers, c: { id: string; has: string[] }) =>
  c.id === 'y.market' ? picksOf(a, c.id).length > 0 && picksOf(a, c.id).every((p) => c.has.includes(p)) : holds(a, c);
export const visible = (q: Question, a: Answers) => (!q.depth || RANK[depthOf(a)] >= RANK[q.depth]) && (!q.when || holds(a, q.when));
export const qOpts = (q: Question, a: Answers): string[] => {
  const extra = (q.adds || []).filter((x) => holds(a, x)).flatMap((x) => x.o);
  const gone = new Set((q.drops || []).filter((x) => dropApplies(a, x)).flatMap((x) => x.o));
  return [...q.o, ...extra.filter((x) => !q.o.includes(x))].filter((o) => !gone.has(o));
};

export const pickedDomains = (a: Answers): Domain[] =>
  picksOf(a, REGION_Q.id).map(domainByName).filter(Boolean) as Domain[];

const short = (n: string) => n.replace(/\s*\(.*\)/, '');
export const qText = (q: Question, a: Answers): string => {
  if (!q.x) return q.t;
  const ds = pickedDomains(a);
  const fill = (s: string) => s.replace(/\{A\}/g, short(ds[0]?.name || 'the first region')).replace(/\{B\}/g, short(ds[1]?.name || 'the second region'));
  return fill(q.t);
};
export const optText = (q: Question, o: string, a: Answers) => (q.x ? qText({ ...q, t: o }, a) : o);

export function route(a: Answers): Station[] {
  const st: Station[] = [];
  const vis = (qs: Question[]) => qs.filter((q) => visible(q, a));
  st.push({ id: 'you', title: 'You', tag: 'Start', blurb: 'Skills, time, money and who you want to serve.', line: 's', qs: you });
  st.push({ id: 'regions', title: 'Regions', tag: 'Fork', blurb: 'Choose one or two regions to explore.', line: 's', qs: regionQs });
  const ds = pickedDomains(a);
  if (!ds.length) st.push({ id: 'ghost', title: 'Your region', tag: 'Opens after you choose', blurb: '', line: 's', qs: [], ghost: true });
  ds.forEach((d, i) => {
    const line: Line = i === 0 ? 'a' : 'b';
    st.push({ id: `${d.id}:territory`, title: 'Territory', tag: d.name, blurb: d.blurb, line, qs: [d.fork], domain: d });
    const corners = picksOf(a, d.fork.id).filter((c) => d.branches[c]);
    if (!corners.length) st.push({ id: `${d.id}:ghost`, title: 'Your corner', tag: d.name, blurb: '', line, qs: [], domain: d, ghost: true });
    corners.forEach((c) => {
      st.push({ id: `${d.id}:corner:${c}`, title: c, tag: `${short(d.name)} corner`, blurb: 'Narrowing this corner down to a product.', line, qs: vis(d.branches[c]), domain: d });
    });
    d.districts.forEach((x) => {
      const qs = vis(x.qs);
      if (qs.length) st.push({ id: `${d.id}:${x.id}`, title: x.title, tag: short(d.name), blurb: x.blurb, line, qs, domain: d });
    });
  });
  if (ds.length === 2) st.push({ id: 'cross', title: 'Crossover', tag: 'Junction', blurb: 'How your two regions join.', line: 'x', qs: cross });
  st.push({ id: 'close', title: 'Reality check', tag: 'Final stop', blurb: 'Evidence, commitment and a plan B.', line: 's', qs: close });
  return st;
}
export const flat = (r: Station[]) => r.flatMap((s) => s.qs.map((q) => ({ q, s })));
export const route_len = (a: Answers) => flat(route(a)).length;
export const answeredCount = (a: Answers) => flat(route(a)).filter((x) => isAns(a, x.q.id)).length;

/** Remove answers for questions no longer on the route (after changing a region, corner or condition). */
export function prune(a: Answers): Answers {
  const keep = new Set(flat(route(a)).map((x) => x.q.id));
  keep.add(DEPTH_ID);
  const out: Answers = {};
  Object.entries(a).forEach(([k, v]) => { if (keep.has(k)) out[k] = v; });
  // also drop picks that are no longer valid options
  flat(route(out)).forEach(({ q }) => {
    const v = out[q.id];
    if (v) { const o = qOpts(q, out); v.picks = v.picks.filter((p) => o.includes(p)); }
  });
  return out;
}

/** Small seeded generator so random routes can be repeated in tests. */
export function seeded(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fill a route at random: one region (sometimes two), then every question that becomes visible.
 *  With `base`, existing answers are kept and only the unanswered questions are filled. */
export function randomAnswers(rng: () => number = Math.random, base: Answers = {}): Answers {
  const pick = (list: string[], n: number) => {
    const pool = [...list];
    const out: string[] = [];
    while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
    return out;
  };
  const a: Answers = {};
  Object.entries(base).forEach(([k, v]) => { if (v.picks.length || v.other.trim()) a[k] = { picks: [...v.picks], other: v.other }; });
  if (!picksOf(a, REGION_Q.id).length) a[REGION_Q.id] = { picks: pick(REGION_Q.o, rng() < 0.25 ? 2 : 1), other: '' };
  for (let pass = 0; pass < 10; pass++) {
    let added = false;
    flat(route(a)).forEach(({ q }) => {
      if (a[q.id] || q.id === REGION_Q.id) return;
      const opts = qOpts(q, a);
      if (!opts.length) return;
      const n = q.max <= 1 ? 1 : 2 + Math.floor(rng() * (Math.min(q.max, 3) - 1));
      a[q.id] = { picks: pick(opts, n), other: '' };
      added = true;
    });
    if (!added) break;
  }
  return prune(a);
}

const typical = new Map<Depth, number>();
/** Average number of questions on a random route at a depth, used for plain-language copy. */
export function typicalRouteLength(d: Depth, samples = 30): number {
  const hit = typical.get(d);
  if (hit !== undefined) return hit;
  let sum = 0;
  for (let i = 1; i <= samples; i++) sum += flat(route(randomAnswers(seeded(i), withDepth({}, d)))).length;
  const n = Math.round(sum / samples);
  typical.set(d, n);
  return n;
}

export function answersText(a: Answers): string {
  const out: string[] = [];
  route(a).forEach((s) => {
    const lines = s.qs.filter((q) => isAns(a, q.id)).map((q) => `${q.id} | ${qText(q, a)} -> ${listOf(a, q.id).map((x) => optText(q, x, a)).join('; ')}`);
    if (lines.length) { out.push(`[${s.domain ? short(s.domain.name) + ' / ' : ''}${s.title}]`); lines.forEach((l) => out.push(l)); }
  });
  return out.join('\n');
}

/* ------- structured context used by the rule engine, the prompts and the report ------- */
export interface CornerCtx { name: string; actions: string[]; retention: string[]; features: string[]; angles: string[]; firstSession: string[]; needs: string[]; trust: string[] }
export interface DomainCtx {
  name: string; id: string; corners: CornerCtx[];
  v: Record<string, string[]>; // district answers by key
  det: { district: string; q: string; a: string[] }[]; // every district answer, in order
}
export interface Ctx {
  you: Record<string, string[]>;
  pull: string[];
  domains: DomainCtx[];
  cross: Record<string, string[]>;
  close: Record<string, string[]>;
  qid: Record<string, string>; // domain.key -> question id (for "change" pointers)
}
export function buildCtx(a: Answers): Ctx {
  const k = (q: Question) => listOf(a, q.id).map((x) => optText(q, x, a));
  const ctx: Ctx = { you: {}, pull: [], domains: [], cross: {}, close: {}, qid: {} };
  you.forEach((q) => { ctx.you[q.k] = k(q); ctx.qid[q.k] = q.id; });
  ctx.pull = k(regionQs[1]);
  pickedDomains(a).forEach((d) => {
    const dc: DomainCtx = { name: d.name, id: d.id, corners: [], v: {}, det: [] };
    picksOf(a, d.fork.id).filter((c) => d.branches[c]).forEach((c) => {
      const qs = d.branches[c];
      const g = (key: string) => { const q = qs.find((x) => x.k === key); return q ? k(q) : []; };
      dc.corners.push({ name: c, actions: g('corner_a'), retention: g('corner_b'), features: g('features'), angles: g('angle'), firstSession: g('corner_e'), needs: g('corner_f'), trust: g('corner_g') });
    });
    const other = otherOf(a, d.fork.id);
    if (other && !dc.corners.length) dc.corners.push({ name: other, actions: [], retention: [], features: [], angles: [], firstSession: [], needs: [], trust: [] });
    d.districts.forEach((x) => x.qs.filter((q) => visible(q, a)).forEach((q) => { dc.v[q.k] = [...(dc.v[q.k] || []), ...k(q)]; if (isAns(a, q.id)) dc.det.push({ district: x.id, q: qText(q, a), a: k(q) }); ctx.qid[`${d.id}.${q.k}`] = q.id; }));
    ctx.domains.push(dc);
  });
  cross.forEach((q) => { ctx.cross[q.k] = k(q); });
  close.forEach((q) => { ctx.close[q.k] = k(q); ctx.qid[q.k] = q.id; });
  return ctx;
}
