import { Answers, Ctx, DomainCtx, CornerCtx, buildCtx } from './engine';
import { Idea, Result, Score, Detail, lc, cap, ranked } from './types';

const first = (a: string[], i = 0, fb = '') => (a.length ? a[i % a.length] : fb);
const has = (s: string, re: RegExp) => re.test(s);

/* ---------- capacity and load ---------- */
function capacity(c: Ctx) {
  const h = (c.you.hours || [''])[0];
  const b = (c.you.budget || [''])[0];
  const hs = /Under 5|Weekends only|Evenings only|Irregular/.test(h) || !h ? 0 : /^(5 to 10|10 to 20)/.test(h) ? 1 : 2;
  const bs = /^(\$0|Under \$100|Funded by revenue)/.test(b) || !b ? 0 : /^(\$100|\$500|Grant)/.test(b) ? 1 : 2;
  const team = (c.you.team || []).some((t) => !/Just me|AI tools/.test(t)) ? 1 : 0;
  return Math.min(4, hs + bs + team);
}
const complexity = (p: string) => (has(p, /console|vr|smart tv|steam|hardware|device|sensor|kiosk|iot|marketplace/i) ? 2 : has(p, /ios app|android app|mobile app|desktop|native/i) ? 1 : 0);

const SOCIAL = /multiplayer|team|invite|friends|share|group|community|leaderboard|co-op|matching|marketplace|network|duel|clan|lobby|referral|follow/i;
const AUTO = /daily|auto|feed|import|sync|digest|reminder|generated|templates?|scheduled|recurring|seasonal|new .* every|procedural|ai|user-generated|player-made|submissions/i;
const SMALL_LOOP = /referral|invite|share|challenge|gift|room code|team|friend|duel|co-op|pair|group/i;

/* ---------- candidate generation ---------- */
interface Cand { idea: Idea; load: number; cross: boolean }

function mk(id: string, d: DomainCtx[], cs: CornerCtx[], v: number, c: Ctx): Cand {
  const main = d[0];
  const audience = first(main.v.audience, v, 'a specific group of people');
  const moment = first(main.v.moment, v + 1, '');
  const platform = first(main.v.platform, v, 'web app');
  const action = first(cs[0].actions, v, 'use it in a short session');
  const retention = first(cs[0].retention, v + 1, 'a reason to return each week');
  const angle = first(cs[0].angles, v, '');
  const feats: string[] = [];
  cs.forEach((cc, i) => {
    const pool = cc.features;
    const n = d.length === 2 ? 3 : 5;
    for (let k = 0; k < Math.min(n, pool.length); k++) { const f = pool[(v * 2 + k + i) % pool.length]; if (!feats.includes(f)) feats.push(f); }
  });
  const loop = first(main.v.loop, v, 'people tell others about it');
  const money = first(main.v.money, v, 'not decided yet');
  const aiSel = main.v.ai || [];
  const aiOn = aiSel.some((x) => !/^None/i.test(x));
  const alone = first(feats, 0, 'its core action') + (feats[1] ? ' and ' + lc(feats[1]) : '');
  const refill = aiOn ? `${lc(first(aiSel.filter((x) => !/^None/i.test(x)), v))} plus ${lc(retention)}` : lc(retention);
  const isCross = cs.length === 2;
  const names = cs.map((x) => x.name);
  const title = isCross ? `${names[0]} meets ${names[1]}` : `${cs[0].name} for ${lc(audience)}`;
  const idea: Idea = {
    id, title, region: d.map((x) => x.name).join(' + '), corner: names.join(' + '), audience, moment, platform, action, retention, features: feats,
    angle, loop, refill, money, alone, breaks_instinct: false,
  };
  let load = complexity(platform) + (feats.length > 4 ? 1 : 0) + (aiOn ? 1 : 0) + (isCross ? 1 : 0);
  if (/Tournament|Marketplace|payments|escrow|real money/i.test(money + feats.join(' '))) load += 1;
  return { idea, load, cross: isCross };
}

function score(cand: Cand, c: Ctx, cap_: number, capped: boolean): Score {
  const i = cand.idea;
  const d0 = c.domains[0];
  const sc: number[] = [];
  const slack = cap_ - cand.load;
  let k = slack >= 1 ? 2 : slack >= -1 ? 1 : 0;
  const t = (c.you.time || [''])[0];
  if (/weekend|1 week/i.test(t) && cand.load >= 3) k = 0;
  sc.push(k);
  const chans = c.domains.reduce((n, d) => n + (d.v.first_users || []).length, 0);
  const aud = (d0.v.audience || []).length;
  sc.push(chans >= 3 && aud ? 2 : chans >= 1 && aud ? 1 : 0);
  const soc = [i.action, i.retention, ...i.features].filter((x) => SOCIAL.test(x)).length;
  sc.push(soc >= 3 ? 0 : soc >= 1 ? 1 : 2);
  sc.push(!i.loop || /not decided/i.test(i.loop) ? 0 : SMALL_LOOP.test(i.loop) ? 2 : 1);
  const auto = [i.refill, i.retention, ...i.features].filter((x) => AUTO.test(x)).length;
  sc.push(auto >= 3 ? 2 : auto >= 1 ? 1 : 0);
  const ev = (c.close.evidence || [''])[0];
  const evScore = !ev || /hunch/i.test(ev) ? 0 : /gut|One conversation|Five conversations|survey/i.test(ev) ? 1 : 2;
  sc.push(capped ? 0 : evScore);
  const kill = (c.domains.flatMap((d) => d.v.kill || [])).join(' ');
  const dep = `${i.platform} ${i.money} ${i.loop}`;
  let rob = 2;
  if (has(kill, /store policy|platform fees/i) && has(i.platform, /app|ios|android/i)) rob = 0;
  else if (has(kill, /api/i) && has(i.platform, /whatsapp|telegram|discord|extension|bot/i)) rob = 0;
  else if (has(kill, /ad rates/i) && has(i.money, /ad/i)) rob = 0;
  else if (has(kill, /payment access/i) && has(dep, /pay|purchase|subscription|fee/i)) rob = 1;
  else if (has(kill, /clone|big studio|incumbent|copies/i) && !i.angle) rob = 1;
  else if (kill) rob = 2;
  else rob = 1;
  sc.push(rob);
  const prior = c.domains.flatMap((d) => d.v.prior || []).join(' ');
  let pa = !prior || /do not know/i.test(prior) ? 1 : i.angle ? 2 : 1;
  if (has(prior, /no reason to return|no one to play with|fade/i) && !i.retention) pa = 0;
  if (has(prior, /ran out of content/i) && !AUTO.test(i.refill)) pa = Math.min(pa, 1);
  sc.push(pa);
  const generic = !i.angle;
  const weakest = sc.map((v, n) => [v, n] as const).sort((a, b) => a[0] - b[0])[0][1];
  const NOTES = [
    'Heavier to build than your hours, budget and team allow.',
    'Few named places to reach the first users.',
    'Needs other people before it is useful.',
    'No clear loop that brings in new users.',
    'Needs you to refill content by hand.',
    capped ? 'Evidence is only a hunch, so this is capped at zero.' : 'Evidence is thin.',
    'Fragile to the outside risk you named.',
    'Unclear how it differs from earlier attempts.',
  ];
  return { id: i.id, c: sc, total: sc.reduce((x, y) => x + y, 0), generic, note: NOTES[weakest] };
}

export function evidenceCapped(c: Ctx) {
  const ev = c.close.evidence || [];
  return !ev.length || ev.includes('A hunch');
}

export function runRules(a: Answers): Result {
  const c = buildCtx(a);
  if (!c.domains.length || !c.domains[0].corners.length) throw new Error('Pick a region and a corner first.');
  const capped = evidenceCapped(c);
  const capy = capacity(c);
  const cands: Cand[] = [];
  let n = 0;
  c.domains.forEach((d) => d.corners.forEach((cn) => { for (let v = 0; v < 6; v++) cands.push(mk('I' + ++n, [d], [cn], v, c)); }));
  if (c.domains.length === 2 && c.domains[0].corners[0] && c.domains[1].corners[0]) {
    for (let v = 0; v < 2; v++) {
      const ca = c.domains[0].corners[v % c.domains[0].corners.length];
      const cb = c.domains[1].corners[v % c.domains[1].corners.length];
      const cand = mk('I' + ++n, c.domains, [ca, cb], v, c);
      // blend the second region's audience and features into the crossover idea
      cand.idea.features = [...ca.features.slice(v, v + 3), ...cb.features.slice(v, v + 3)].filter((x, i, arr) => arr.indexOf(x) === i);
      cand.idea.action = `${lc(first(ca.actions, v, 'use the first side'))}, then ${lc(first(cb.actions, v, 'the second side'))}`;
      cand.idea.platform = first(c.domains[0].v.platform, v, 'web app');
      if (c.cross.crossover?.[0]) cand.idea.angle = cand.idea.angle || c.cross.crossover[0];
      cands.push(cand);
    }
  }
  const scored = cands.map((x) => ({ x, s: score(x, c, capy, capped) }));
  scored.sort((p, q) => (q.s.total - (q.s.generic ? 3 : 0)) - (p.s.total - (p.s.generic ? 3 : 0)));
  // diversity: avoid repeating the same corner + platform + audience; keep at least one crossover when present
  const picked: typeof scored = [];
  const seen = new Set<string>();
  for (const p of scored) {
    const key = `${p.x.idea.corner}|${p.x.idea.platform}|${p.x.idea.audience}|${p.x.idea.action}`;
    if (seen.has(key)) continue;
    seen.add(key); picked.push(p);
    if (picked.length >= 6) break;
  }
  if (c.domains.length === 2 && !picked.some((p) => p.x.cross)) { const cr = scored.find((p) => p.x.cross); if (cr) picked[picked.length - 1] = cr; }
  const lowest = picked.reduce((m, p) => (p.x.load > m.x.load ? p : m), picked[0]);
  // one idea deliberately breaks the first instinct: the one with a non-first platform and non-first audience
  const odd = picked.find((p) => p.x.idea.audience !== first(c.domains[0].v.audience) && p.x.idea.platform !== first(c.domains[0].v.platform));
  (odd || picked[picked.length - 1]).x.idea.breaks_instinct = true;
  void lowest;
  const ideas = picked.map((p, i) => ({ ...p.x.idea, id: 'I' + (i + 1) }));
  const scores = picked.map((p, i) => ({ ...p.s, id: 'I' + (i + 1) }));
  const r: Result = {
    mode: 'rules', profile: profileText(c), constraints: constraints(c, capy), ideas, scores, details: [], capped, at: Date.now(),
  };
  r.details = ranked(r).slice(0, 3).map((x) => detailFor(x.idea, x.score, c));
  return r;
}

function constraints(c: Ctx, capy: number): string[] {
  const out: string[] = [];
  if (c.you.hours?.[0]) out.push(`Time: ${c.you.hours[0]} hours a week`);
  if (c.you.budget?.[0]) out.push(`Budget: ${c.you.budget[0]}`);
  if (c.you.team?.length) out.push(`Team: ${c.you.team.join(', ')}`);
  if (c.you.time?.[0]) out.push(`First version: ${c.you.time[0]}`);
  if (capy <= 1) out.push('Low capacity: prefer one platform, few features, no custom backend');
  return out;
}
function profileText(c: Ctx): string {
  const s = c.you.skill?.join(' and ') || 'general skills';
  const t = c.you.stack?.join(', ') || 'no fixed stack';
  const regs = c.domains.map((d) => d.name).join(' and ');
  return `A builder strongest in ${lc(s)}, fastest in ${t}, exploring ${regs}${c.you.market?.length ? ', selling in ' + c.you.market.join(', ') : ''}.`;
}

/* ---------- details, all templated from the answers ---------- */
const FAILS = [
  'It asks for more build time, money or people than you said you have.',
  'You named no reliable place where these first users already gather.',
  'It is empty until other people join, so day one feels dead.',
  'Nothing brings new users in without you pushing each one.',
  'Content or data goes stale unless you keep feeding it.',
  'Everything rests on a hunch, so you could build for nobody.',
  'The outside risk you named would break its main dependency.',
  'It looks like earlier attempts that faded, with no clear difference.',
];
const CHANGE = (c: Ctx, w: number): string => {
  void c;
  return [
    'Change the "Where does it run" answer to a lighter platform, or cut features.',
    'Change "How do the first 100 find it" to name three places they would come from.',
    'Change the features to include one thing that is useful with a single user.',
    'Change "What makes users bring others" to a loop that works inside a small group.',
    'Change the features or the AI role to add an automatic source of fresh content.',
    'Change the evidence answer: talk to five people, then raise it above a hunch.',
    'Change the platform or revenue answer to drop the dependency you named as a risk.',
    'Change the angle question to choose a specific twist, and name why earlier products faded.',
  ][w];
};
const TEST: [RegExp, string][] = [
  [/hunch|^$/i, 'This week: talk to 5 people in the audience about the last time they did the action. Build nothing yet.'],
  [/gut|One conversation|Five conversations/i, 'This week: post a one-page description in two communities where they gather, count replies, and book three calls.'],
  [/interviews|survey/i, 'This week: put up a landing page describing the single core action and measure signups from your best channel.'],
  [/landing page|signups/i, 'This week: build a clickable prototype of the core action and watch five people try it without help.'],
  [/prototype|Pre-orders|Paying/i, 'This week: ship the smallest working version to your first 10 users and measure who returns on day 3.'],
  [/Public data|competitor/i, 'This week: study two competitors closely, then run a manual version of the core action for five people.'],
];
function detailFor(i: Idea, s: Score, c: Ctx): Detail {
  const d0 = c.domains[0];
  const chans = d0.v.first_users?.length ? d0.v.first_users : ['a community near you'];
  const w = s.c.map((v, n) => [v, n] as const).sort((a, b) => a[0] - b[0])[0][1];
  const ev = (c.close.evidence || [''])[0] || '';
  const test = (TEST.find(([re]) => re.test(ev)) || TEST[0])[1];
  const corner = lc(i.corner);
  return {
    id: i.id,
    watch: [
      `${chans[0]}: posts where ${lc(i.audience)} talk about ${corner}`,
      `${chans[1] || 'A local group'} for ${lc(i.audience)}: what they share and ask for`,
    ],
    look_for: [
      `What ${lc(i.audience)} already use to ${lc(i.action)}`,
      `Spreadsheets, chat threads or paper they keep for ${corner}`,
      `Anything they pay for, or copy by hand, around ${corner}`,
    ],
    friction: `Around "${lc(i.moment || 'their usual moment')}", ${lc(i.audience)} may lack a quick, simple way to ${lc(i.action)}. Unvalidated.`,
    ask: `Tell me about the last time you were doing this: ${lc(i.action)}. What did you use, and what happened next?`,
    fails: FAILS[w],
    change: CHANGE(c, w),
    test,
  };
}
export { cap };
