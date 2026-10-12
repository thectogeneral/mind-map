import { domains, you, regionQs, cross, close } from '@/content';
import type { Question, Domain } from '@/content/lib';
import { Answers, route } from './engine';

/** A plain-language branch rule on a question: shown only if / adds options if. */
export interface MapCond { kind: 'when' | 'adds'; triggerId: string; has: string[]; added: number; label: string }
export interface MapQ { id: string; k: string; text: string; opts: number; max: number; conds: MapCond[]; depth?: 'standard' | 'deep' }
export interface MapCorner { id: string; name: string; qs: MapQ[] }
export interface MapStation { id: string; key: string; title: string; blurb: string; qs: MapQ[] }
export interface MapRegion {
  id: string; name: string; blurb: string; people: string;
  forkId: string; fork: MapQ; corners: MapCorner[]; stations: MapStation[];
  counts: { corners: number; questions: number; options: number; branches: number };
}
export interface MapModel {
  you: MapQ[]; regionQs: MapQ[]; cross: MapQ[]; close: MapQ[]; regions: MapRegion[];
  totals: { regions: number; corners: number; questions: number; options: number; branches: number };
  byId: Map<string, MapQ>;
}
/** A dashed link on the region map: a question that depends on an earlier answer. */
export interface BranchEdge { from: string; to: string; kind: 'when' | 'adds'; labels: string[] }

const short = (n: string) => n.replace(/\s*\(.*\)/, '');
const plain = (t: string) => t.replace(/\{A\}/g, 'the first region').replace(/\{B\}/g, 'the second region');
const listOr = (xs: string[]) => (xs.length > 3 ? `${xs.slice(0, 3).join(' or ')} or ${xs.length - 3} more` : xs.join(' or '));

export function buildMap(): MapModel {
  const raw = new Map<string, Question>();
  const all = (qs: Question[]) => qs.forEach((q) => raw.set(q.id, q));
  all(you); all(regionQs); all(cross); all(close);
  const forks = new Map<string, Domain>();
  domains.forEach((d) => {
    all([d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)]);
    forks.set(d.fork.id, d);
  });

  const label = (c: { id: string; has: string[] }, kind: 'when' | 'adds', added: number) => {
    const fork = forks.get(c.id);
    const t = raw.get(c.id);
    const trig = fork ? `the corner is ${listOr(c.has)}` : `"${plain(t?.t || c.id)}" includes ${listOr(c.has)}`;
    return kind === 'when' ? `Shown only if ${trig}` : `Adds ${added} option${added === 1 ? '' : 's'} if ${trig}`;
  };
  const mq = (q: Question): MapQ => {
    const conds: MapCond[] = [];
    if (q.when) conds.push({ kind: 'when', triggerId: q.when.id, has: q.when.has, added: 0, label: label(q.when, 'when', 0) });
    (q.adds || []).forEach((x) => conds.push({ kind: 'adds', triggerId: x.id, has: x.has, added: x.o.length, label: label(x, 'adds', x.o.length) }));
    return { id: q.id, k: q.k, text: plain(q.t), opts: q.o.length + (q.adds || []).reduce((n, x) => n + x.o.length, 0), max: q.max, conds, depth: q.depth };
  };

  const byId = new Map<string, MapQ>();
  const reg = (qs: Question[]) => qs.map((q) => { const m = mq(q); byId.set(m.id, m); return m; });
  const youQ = reg(you), regQ = reg(regionQs), crossQ = reg(cross), closeQ = reg(close);

  const regions: MapRegion[] = domains.map((d) => {
    const fork = reg([d.fork])[0];
    const corners: MapCorner[] = Object.entries(d.branches).map(([name, qs]) => ({ id: `${d.id}:corner:${name}`, name, qs: reg(qs) }));
    const stations: MapStation[] = d.districts.map((x) => ({ id: `${d.id}:${x.id}`, key: x.id, title: x.title, blurb: x.blurb, qs: reg(x.qs) }));
    const qs = [fork, ...corners.flatMap((c) => c.qs), ...stations.flatMap((s) => s.qs)];
    return {
      id: d.id, name: d.name, blurb: d.blurb, people: d.people, forkId: d.fork.id, fork, corners, stations,
      counts: { corners: corners.length, questions: qs.length, options: qs.reduce((n, q) => n + q.opts, 0), branches: qs.reduce((n, q) => n + q.conds.length, 0) },
    };
  });

  const shared = [...youQ, ...regQ, ...crossQ, ...closeQ];
  const sum = (f: (r: MapRegion['counts']) => number) => regions.reduce((n, r) => n + f(r.counts), 0);
  return {
    you: youQ, regionQs: regQ, cross: crossQ, close: closeQ, regions, byId,
    totals: {
      regions: regions.length,
      corners: sum((c) => c.corners),
      questions: sum((c) => c.questions) + shared.length,
      options: sum((c) => c.options) + shared.reduce((n, q) => n + q.opts, 0),
      branches: sum((c) => c.branches) + shared.reduce((n, q) => n + q.conds.length, 0),
    },
  };
}

/** Dashed links on one region's map: from a corner or an earlier stop to the stop holding a dependent question. */
export function regionBranches(r: MapRegion): BranchEdge[] {
  const where = new Map<string, string>(); // question id -> node id
  where.set(r.forkId, `${r.id}:territory`);
  r.corners.forEach((c) => c.qs.forEach((q) => where.set(q.id, c.id)));
  r.stations.forEach((s) => s.qs.forEach((q) => where.set(q.id, s.id)));
  const cornerByName = new Map(r.corners.map((c) => [c.name, c.id]));
  const out = new Map<string, BranchEdge>();
  r.stations.forEach((s) => s.qs.forEach((q) => q.conds.forEach((c) => {
    const froms = new Set<string>();
    if (c.triggerId === r.forkId) c.has.forEach((h) => { const id = cornerByName.get(h); if (id) froms.add(id); });
    else { const w = where.get(c.triggerId); if (w && w !== s.id) froms.add(w); }
    froms.forEach((from) => {
      const key = `${from}>${s.id}>${c.kind}`;
      const e = out.get(key) || { from, to: s.id, kind: c.kind, labels: [] };
      e.labels.push(`${plain(q.text)}: ${c.label}`);
      out.set(key, e);
    });
  })));
  return [...out.values()];
}

/** Every node id on the map. */
export function nodeIds(m: MapModel): Set<string> {
  const s = new Set<string>(['you', 'regions', 'cross', 'close']);
  m.regions.forEach((r) => {
    s.add(`region:${r.id}`); s.add(`${r.id}:territory`);
    r.corners.forEach((c) => s.add(c.id));
    r.stations.forEach((x) => s.add(x.id));
  });
  return s;
}

/** Node ids the user's current answers pass through, used to highlight their route. */
export function routeNodes(a: Answers): Set<string> {
  const s = new Set<string>();
  route(a).forEach((st) => {
    if (st.ghost) return;
    s.add(st.id);
    if (st.domain) s.add(`region:${st.domain.id}`);
  });
  return s;
}

export const regionName = short;
