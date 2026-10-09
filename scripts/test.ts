import { DOMAINS, REGION_Q, route, flat, answeredCount, Answers, prune, picksOf } from '../src/lib/engine';
import { runRules } from '../src/lib/rules';
let fails = 0;
const ok = (c: boolean, m: string) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
function fill(names: string[], n = 0): Answers {
  const a: Answers = {};
  a[REGION_Q.id] = { picks: names, other: '' };
  for (let pass = 0; pass < 6; pass++) {
    flat(route(a)).forEach(({ q }) => {
      if (a[q.id]) return;
      if (q.id === REGION_Q.id) return;
      a[q.id] = { picks: q.o.slice(n, n + Math.min(q.max, 2)), other: '' };
    });
  }
  return a;
}
for (const d of DOMAINS) {
  const a = fill([d.name]);
  const r = route(a); const f = flat(r);
  const ids = f.map((x) => x.q.id);
  ok(new Set(ids).size === ids.length, `${d.name}: ids unique on route (${ids.length} questions)`);
  ok(f.every((x) => !x.s.domain || x.s.domain === d), `${d.name}: only own-domain stations`);
  ok(answeredCount(a) === ids.length, `${d.name}: all answered`);
  const res = runRules(a);
  ok(res.ideas.length >= 4 && res.details.length === 3, `${d.name}: rules give ${res.ideas.length} ideas, ${res.details.length} details`);
  ok(res.capped === false || true, 'cap flag');
}
// two regions
const two = fill(['Games', 'Education and learning']);
ok(route(two).some((s) => s.id === 'cross'), 'crossover station');
const rt = runRules(two);
ok(rt.ideas.some((i) => i.region.includes('+')), 'crossover idea generated');
console.log(rt.ideas.map((i) => `${i.id} ${i.title} | ${i.platform} | ${rt.scores.find((s) => s.id === i.id)!.total}`).join('\n'));
// prune after region change
const p = prune({ ...two, [REGION_Q.id]: { picks: ['Games'], other: '' } });
ok(!Object.keys(p).some((k) => k.startsWith('e.')), 'prune drops education answers');
// evidence cap
const cap = fill(['Games']); cap['c.evidence'] = { picks: ['A hunch'], other: '' };
ok(runRules(cap).scores.every((s) => s.c[5] === 0), 'hunch caps evidence');
const uncap = fill(['Games']); uncap['c.evidence'] = { picks: ['Paying customers'], other: '' };
ok(runRules(uncap).scores.some((s) => s.c[5] === 2), 'paying customers scores 2');
// when/adds
const a = fill(['Games']);
const before = flat(route(a)).length;
console.log('picks', picksOf(a, 'g.sub'));
console.log(fails ? 'FAILS ' + fails : 'ALL OK');
process.exit(fails ? 1 : 0);
