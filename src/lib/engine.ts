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

const holds = (a: Answers, c: { id: string; has: string[] }) => picksOf(a, c.id).some((p) => c.has.includes(p));
export const visible = (q: Question, a: Answers) => !q.when || holds(a, q.when);
export const qOpts = (q: Question, a: Answers): string[] => {
  const extra = (q.adds || []).filter((x) => holds(a, x)).flatMap((x) => x.o);
  return [...q.o, ...extra.filter((x) => !q.o.includes(x))];
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
  const out: Answers = {};
  Object.entries(a).forEach(([k, v]) => { if (keep.has(k)) out[k] = v; });
  // also drop picks that are no longer valid options
  flat(route(out)).forEach(({ q }) => {
    const v = out[q.id];
    if (v) { const o = qOpts(q, out); v.picks = v.picks.filter((p) => o.includes(p)); }
  });
  return out;
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
export interface CornerCtx { name: string; actions: string[]; retention: string[]; features: string[]; angles: string[] }
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
      const g = (key: string) => k(qs.find((q) => q.k === key)!);
      dc.corners.push({ name: c, actions: g('corner_a'), retention: g('corner_b'), features: g('features'), angles: g('angle') });
    });
    const other = otherOf(a, d.fork.id);
    if (other && !dc.corners.length) dc.corners.push({ name: other, actions: [], retention: [], features: [], angles: [] });
    d.districts.forEach((x) => x.qs.filter((q) => visible(q, a)).forEach((q) => { dc.v[q.k] = [...(dc.v[q.k] || []), ...k(q)]; if (isAns(a, q.id)) dc.det.push({ district: x.id, q: qText(q, a), a: k(q) }); ctx.qid[`${d.id}.${q.k}`] = q.id; }));
    ctx.domains.push(dc);
  });
  cross.forEach((q) => { ctx.cross[q.k] = k(q); });
  close.forEach((q) => { ctx.close[q.k] = k(q); ctx.qid[q.k] = q.id; });
  return ctx;
}
