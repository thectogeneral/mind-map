import path from 'path';
import type { Domain, Question } from '../src/content/lib';
import { you, regionQs } from '../src/content/shared';

const REQUIRED: Record<string, string[]> = {
  people: ['audience', 'moment'],
  shape: ['platform', 'ai'],
  system: [],
  growth: ['money', 'first_users', 'loop'],
  edge: ['belief', 'kill', 'prior'],
};
const MIN_Q: Record<string, number> = { people: 5, shape: 5, system: 4, growth: 4, edge: 3 };

export function validateDomains(domains: Domain[], shared: Question[] = [], strict = false) {
  const errs: string[] = [];
  const ids = new Set<string>(shared.map((q) => q.id));
  const checkQ = (q: Question, where: string, earlier: Set<string>) => {
    if (ids.has(q.id)) errs.push(`duplicate id ${q.id}`);
    ids.add(q.id);
    if (!q.k) errs.push(`${q.id} has no key`);
    if (!q.t || !/\?$/.test(q.t)) errs.push(`${q.id} text should be a question ending in ?: "${q.t}"`);
    if (q.o.length < 10) errs.push(`${q.id} (${where}) has only ${q.o.length} options`);
    if (new Set(q.o.map((x) => x.toLowerCase())).size !== q.o.length) errs.push(`${q.id} has duplicate options`);
    if (q.max < 1 || q.max > q.o.length) errs.push(`${q.id} bad max ${q.max}`);
    q.o.forEach((x) => { if (/—|–/.test(x) || /—/.test(q.t)) errs.push(`${q.id} contains a dash character`); if (x.length > 70) errs.push(`${q.id} option too long: ${x}`); if (/^other$/i.test(x)) errs.push(`${q.id} must not list Other`); });
    const cond = (c: { id: string; has: string[] }, tag: string) => {
      if (!earlier.has(c.id)) errs.push(`${q.id} ${tag} refers to ${c.id}, which is not an earlier question`);
      if (!c.has.length) errs.push(`${q.id} ${tag} has empty has[]`);
    };
    if (q.depth && q.depth !== 'standard' && q.depth !== 'deep') errs.push(`${q.id} bad depth ${q.depth}`);
    (q.drops || []).forEach((x) => {
      cond(x, 'drops');
      const pool = new Set([...q.o, ...(q.adds || []).flatMap((a) => a.o)]);
      x.o.forEach((o) => { if (!pool.has(o)) errs.push(`${q.id} drops "${o}", which is not one of its options`); });
      if (!x.o.length) errs.push(`${q.id} drops has empty o[]`);
    });
    if (q.drops?.length) {
      const all = new Set(q.drops.flatMap((x) => x.o));
      const left = [...q.o, ...(q.adds || []).flatMap((a) => a.o)].filter((o) => !all.has(o)).length;
      if (left < 5) errs.push(`${q.id} would keep only ${left} options if every drop applied (needs 5+)`);
    }
    if (q.when) cond(q.when, 'when');
    (q.adds || []).forEach((a) => { cond(a, 'adds'); if (a.o.length < 3) errs.push(`${q.id} adds needs 3+ options`); const dup = a.o.filter((x) => q.o.includes(x)); if (dup.length) errs.push(`${q.id} adds repeats ${dup[0]}`); });
  };
  const byId = new Map<string, Question>();
  [...you, ...regionQs].forEach((q) => byId.set(q.id, q));
  domains.forEach((d) => {
    [d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)].forEach((q) => byId.set(q.id, q));
  });
  const hasCheck = (q: Question) => {
    const chk = (c: { id: string; has: string[] }) => {
      const t = byId.get(c.id); if (!t) return;
      const pool = new Set([...t.o, ...(t.adds || []).flatMap((a) => a.o)]);
      c.has.forEach((h) => { if (!pool.has(h)) errs.push(`${q.id} condition on ${c.id} uses "${h}", which is not an option there`); });
    };
    if (q.when) chk(q.when);
    (q.adds || []).forEach(chk);
    (q.drops || []).forEach(chk);
    // a question can only depend on a trigger that is shown at the same or a shallower depth
    const rank = (x?: string) => (x === 'deep' ? 2 : x === 'standard' ? 1 : 0);
    [q.when, ...(q.adds || []), ...(q.drops || [])].forEach((c) => { const t = c && byId.get(c.id); if (t && rank(t.depth) > rank(q.depth)) errs.push(`${q.id} depends on ${t.id}, which is shown only at a deeper level`); });
  };
  domains.forEach((d) => {
    [d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)].forEach(hasCheck);
  });
  domains.forEach((d) => {
    const earlier = new Set<string>(['y.skill', 'y.stack', 'y.hours', 'y.budget', 'y.team', 'y.ambition', 'y.time', 'y.assets', 'y.market', 'r.regions', 'r.pull']);
    const here = (q: Question, where: string) => { checkQ(q, where, earlier); earlier.add(q.id); };
    here(d.fork, d.name + ' fork');
    const names = d.fork.o.slice().sort().join('|');
    const bn = Object.keys(d.branches).sort().join('|');
    if (names !== bn) errs.push(`${d.name} fork options do not match branches`);
    if (d.fork.o.length < 12) errs.push(`${d.name} needs 12 corners, has ${d.fork.o.length}`);
    // Corner questions are only seen one corner at a time, so each corner sees fork + its own earlier questions.
    Object.entries(d.branches).forEach(([n, qs]) => {
      const keys = qs.map((q) => q.k).join(',');
      const core = 'corner_a,corner_b,features,angle';
      if (keys !== core && keys !== core + ',corner_e,corner_f,corner_g') errs.push(`${d.name}/${n} keys must be ${core} or ${core},corner_e,corner_f,corner_g (got ${keys})`);
      const save = new Set(earlier);
      qs.forEach((q) => { checkQ(q, d.name + '/' + n, earlier); earlier.add(q.id); });
      earlier.clear(); save.forEach((x) => earlier.add(x));
    });
    // district questions may react to corner answers: a corner question is only answered if that corner was picked
    Object.values(d.branches).flat().forEach((q) => earlier.add(q.id));
    d.districts.forEach((x) => {
      if (x.qs.length < (MIN_Q[x.id] || 3)) errs.push(`${d.name}/${x.id} needs ${MIN_Q[x.id]}+ questions, has ${x.qs.length}`);
      const keys = x.qs.map((q) => q.k);
      (REQUIRED[x.id] || []).forEach((k) => { if (!keys.includes(k)) errs.push(`${d.name}/${x.id} is missing key "${k}"`); });
      x.qs.forEach((q) => here(q, d.name + '/' + x.id));
    });
    const dq = d.districts.flatMap((x) => x.qs);
    const wc = dq.filter((q) => q.when || q.adds).length;
    const cornerIds = new Set(Object.values(d.branches).flat().map((q) => q.id));
    const extended = Object.values(d.branches).every((qs) => qs.length === 7);
    if (strict && !extended) errs.push(`${d.name} is not fully extended: every corner needs 7 questions (${Object.entries(d.branches).filter(([, qs]) => qs.length !== 7).map(([n]) => n).join(', ')})`);
    if (extended) {
      const linked = dq.filter((q) => [q.when, ...(q.adds || []), ...(q.drops || [])].some((c) => c && cornerIds.has(c.id))).length;
      if (linked < 8) errs.push(`${d.name} needs 8+ district questions that react to corner answers, has ${linked}`);
      const drops = dq.filter((q) => q.drops?.length).length;
      if (drops < 3) errs.push(`${d.name} needs 3+ district questions using drops, has ${drops}`);
      const std = dq.filter((q) => q.depth === 'standard').length, deep = dq.filter((q) => q.depth === 'deep').length;
      if (std < 5 || deep < 5) errs.push(`${d.name} needs 5+ standard and 5+ deep district questions, has ${std} and ${deep}`);
      Object.entries(d.branches).forEach(([n, qs]) => qs.slice(4).forEach((q) => { if (!(q.when || q.adds || q.drops)) errs.push(`${q.id} (${d.name}/${n}) should react to an earlier corner answer with when, adds or drops`); }));
    }
    if (wc < 4) errs.push(`${d.name} should use when/adds on at least 4 district questions (has ${wc})`);
    const ids2 = d.p;
    d.fork.id.startsWith(ids2 + '.') || errs.push(`${d.name} ids must start with "${ids2}."`);
  });
  return errs;
}

async function main() {
  const strict = process.argv.includes('--strict');
  const arg = process.argv.slice(2).find((x) => !x.startsWith('--'));
  let domains: Domain[];
  if (arg) {
    const mod = await import(path.resolve(arg));
    domains = (mod.default || mod.domains) as Domain[];
  } else {
    domains = (await import('../src/content/index')).domains;
  }
  const errs = validateDomains(domains, [], strict);
  const all = domains.flatMap((d) => [d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)]);
  const opts = all.reduce((n, q) => n + q.o.length, 0);
  const std = all.filter((q) => q.depth === 'standard').length, deep = all.filter((q) => q.depth === 'deep').length;
  if (errs.length) { console.error('VALIDATION FAILED\n' + errs.slice(0, 80).join('\n') + (errs.length > 80 ? `\n...and ${errs.length - 80} more` : '')); process.exit(1); }
  console.log(`ok: ${domains.length} domains, ${all.length} questions, ${opts} options, min options ${Math.min(...all.map((q) => q.o.length))}`);
  console.log(`depth: ${all.length - std - deep} core, ${std} standard, ${deep} deep`);
}
if (process.argv[1] && /validate\.ts$/.test(process.argv[1])) main();
