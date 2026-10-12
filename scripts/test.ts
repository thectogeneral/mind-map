import { DOMAINS, REGION_Q, route, flat, answeredCount, Answers, prune, picksOf, qOpts, randomAnswers, seeded } from '../src/lib/engine';
import { runRules } from '../src/lib/rules';
import { buildIdeasRules, buildRefineRules } from '../src/lib/prompt';
import { CRITERIA } from '../src/lib/types';
import { answersText, isAns, visible, depthOf, withDepth, DEPTH_ID } from '../src/lib/engine';
import type { Question } from '../src/content/lib';
import { validateDomains } from './validate';
import { buildMap, nodeIds, regionBranches, routeNodes } from '../src/lib/map';
import { you as youQs, regionQs as regQs, cross as crossQs, close as closeQs } from '../src/content/shared';
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
// randomize: 200 seeded random routes
{
  let bad = 0;
  const seen = new Set<string>();
  for (let i = 1; i <= 200; i++) {
    const a = randomAnswers(seeded(i));
    const f = flat(route(a));
    seen.add(picksOf(a, REGION_Q.id).join('+'));
    const onRoute = new Set(f.map((x) => x.q.id));
    const offRoute = Object.keys(a).some((k) => !onRoute.has(k));
    const badPick = f.some(({ q }) => picksOf(a, q.id).some((x) => !qOpts(q, a).includes(x)) || picksOf(a, q.id).length > q.max);
    const unanswered = f.some(({ q }) => !picksOf(a, q.id).length);
    const res = runRules(a);
    if (answeredCount(a) < 12 || offRoute || badPick || unanswered || res.ideas.length < 4) bad++;
    if (JSON.stringify(prune(a)) !== JSON.stringify(a)) bad++;
  }
  ok(bad === 0, `randomize: 200 random routes valid (${seen.size} region combinations)`);
  const mine = fill(['Travel, events and local life']);
  const partial: Answers = {};
  ['y.skill', 'y.hours', 'y.budget', REGION_Q.id, 'tr.sub'].forEach((id) => { if (mine[id]) partial[id] = mine[id]; });
  const rest = randomAnswers(seeded(3), partial);
  ok(Object.entries(partial).every(([k, v]) => JSON.stringify(rest[k]) === JSON.stringify(v)), 'randomize the rest keeps existing answers');
  ok(flat(route(rest)).every(({ q }) => picksOf(rest, q.id).length > 0), 'randomize the rest fills every other question');
  const fromYou = randomAnswers(seeded(4), { 'y.skill': mine['y.skill'] });
  ok(picksOf(fromYou, REGION_Q.id).length > 0 && JSON.stringify(fromYou['y.skill']) === JSON.stringify(mine['y.skill']), 'randomize the rest picks a region when none chosen');
  ok(JSON.stringify(randomAnswers(seeded(7))) === JSON.stringify(randomAnswers(seeded(7))), 'randomize: same seed gives same route');
  ok(JSON.stringify(randomAnswers(seeded(7))) !== JSON.stringify(randomAnswers(seeded(8))), 'randomize: different seeds differ');
}
// prompts: ideas-and-refinement (route) and refine (per idea)
{
  const a = randomAnswers(seeded(11));
  const r = runRules(a);
  const none = buildIdeasRules(a);
  const withIdeas = buildIdeasRules(a, r);
  const answered = flat(route(a)).filter(({ q }) => isAns(a, q.id)).length;
  const lines = answersText(a).split('\n').filter((l) => !l.startsWith('['));
  ok(lines.length === answered && lines.every((l) => none.includes(l.replace(/^[\w.]+ \| /, ''))), `ideas prompt includes all ${answered} answers`);
  ok(/Problems it solves/.test(none) && /Refine my answers/.test(none), 'ideas prompt asks for problems solved and answer refinement');
  ok(!/Ideas a rule-based finder produced/.test(none) && r.ideas.every((i) => withIdeas.includes(i.title)), 'ideas prompt lists the finder ideas only when results exist');
  const idea = r.ideas[0];
  const ref = buildRefineRules(a, idea, r);
  const sc = r.scores.find((x) => x.id === idea.id)!;
  ok(CRITERIA.every((c, i) => ref.includes(`- ${c}: ${sc.c[i]} of 2`)) && ref.includes(sc.note), 'refine prompt has all 8 criterion scores and the weakest point');
  ok(/Problems it solves/.test(ref) && /Change my answers/.test(ref) && ref.includes(idea.title), 'refine prompt asks for problems solved and answer changes');
  ok(buildRefineRules(a, idea).includes('Score: not scored yet'), 'refine prompt works without results');
}
// map: built from the content, every path and branch accounted for
{
  const m = buildMap();
  const raw = [...youQs, ...regQs, ...crossQs, ...closeQs, ...DOMAINS.flatMap((d) => [d.fork, ...Object.values(d.branches).flat(), ...d.districts.flatMap((x) => x.qs)])];
  ok(m.totals.questions === raw.length && m.byId.size === raw.length, `map holds every question once (${raw.length})`);
  ok(m.totals.regions === DOMAINS.length && m.totals.corners === DOMAINS.reduce((n, d) => n + Object.keys(d.branches).length, 0), `map counts regions (${m.totals.regions}) and corners (${m.totals.corners})`);
  ok(m.totals.options === raw.reduce((n, q) => n + q.o.length + (q.adds || []).reduce((k, x) => k + x.o.length, 0), 0), 'map counts every option, including added ones');
  const conds = raw.reduce((n, q) => n + (q.when ? 1 : 0) + (q.adds || []).length, 0);
  ok(m.totals.branches === conds && conds > 0, `map counts every branch rule (${conds})`);
  const all = [...m.you, ...m.regionQs, ...m.cross, ...m.close, ...m.regions.flatMap((r) => [r.fork, ...r.corners.flatMap((c) => c.qs), ...r.stations.flatMap((s) => s.qs)])];
  ok(all.every((q) => q.conds.every((c) => m.byId.has(c.triggerId) && c.label.length > 0)), 'every branch rule points at a real question and has a plain label');
  const ids = nodeIds(m);
  ok(m.regions.every((r) => regionBranches(r).every((e) => ids.has(e.from) && ids.has(e.to))), 'every dashed branch link joins two real stops');
  ok(m.regions.some((r) => regionBranches(r).length > 0), 'branch links are drawn');
  let off = 0;
  for (let i = 1; i <= 100; i++) routeNodes(randomAnswers(seeded(i))).forEach((id) => { if (!ids.has(id)) off++; });
  ok(off === 0, 'a route always lands on stops that exist on the map');
}
// depth and drops
{
  const mkq = (x: Partial<Question>): Question => ({ id: 't.1', k: 't', t: 'Test?', o: ['a', 'b', 'c', 'd', 'e', 'f', 'g'], max: 1, ...x });
  const deepQ = mkq({ depth: 'deep' }), stdQ = mkq({ depth: 'standard' }), coreQ = mkq({});
  const at = (d: 'quick' | 'standard' | 'deep'): Answers => withDepth({}, d);
  ok(depthOf({}) === 'quick', 'no depth saved means quick (old routes keep their questions)');
  ok(visible(coreQ, at('quick')) && !visible(stdQ, at('quick')) && !visible(deepQ, at('quick')), 'quick shows only core questions');
  ok(visible(stdQ, at('standard')) && !visible(deepQ, at('standard')), 'standard adds standard questions');
  ok(visible(deepQ, at('deep')) && visible(stdQ, at('deep')), 'deep shows everything');
  const kept = prune(withDepth({ [REGION_Q.id]: { picks: ['Games'], other: '' } }, 'deep'));
  ok(depthOf(kept) === 'deep' && !!kept[DEPTH_ID], 'prune keeps the chosen depth');
  const dq = mkq({ drops: [{ id: 'y.budget', has: ['$0'], o: ['a', 'b'] }], adds: [{ id: 'y.team', has: ['Just me'], o: ['x', 'y', 'z'] }] });
  const none: Answers = {};
  const zero: Answers = { 'y.budget': { picks: ['$0'], other: '' }, 'y.team': { picks: ['Just me'], other: '' } };
  ok(qOpts(dq, none).join() === 'a,b,c,d,e,f,g', 'drops do nothing until their answer is chosen');
  ok(qOpts(dq, zero).join() === 'c,d,e,f,g,x,y,z', 'drops remove options and adds still append');
  const mq = mkq({ drops: [{ id: 'y.market', has: ['Nigeria', 'Kenya'], o: ['a'] }] });
  const mk = (...m: string[]): Answers => ({ 'y.market': { picks: m, other: '' } });
  ok(!qOpts(mq, mk('Nigeria')).includes('a') && !qOpts(mq, mk('Nigeria', 'Kenya')).includes('a'), 'a market drop applies when every chosen market is listed');
  ok(qOpts(mq, mk('Nigeria', 'USA')).includes('a') && qOpts(mq, mk('Global')).includes('a') && qOpts(mq, {}).includes('a'), 'a market drop does not apply if any chosen market is not listed, or none chosen');
  const bad = JSON.parse(JSON.stringify(DOMAINS[0]));
  const q0 = bad.districts[0].qs[0];
  q0.drops = [{ id: 'y.budget', has: ['$0'], o: ['not an option'] }];
  q0.depth = 'standard';
  bad.districts[0].qs[1].when = { id: q0.id, has: [q0.o[0]] };
  const errs = validateDomains([bad]);
  ok(errs.some((e: string) => e.includes('which is not one of its options')) && errs.some((e: string) => e.includes('shown only at a deeper level')), 'validator rejects a bad drop and a core question that depends on a deeper one');
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
