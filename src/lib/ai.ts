import { Answers, answersText, buildCtx } from './engine';
import { evidenceCapped } from './rules';
import { Idea, Result, Score, Detail, ranked } from './types';

export class AIError extends Error { code: string; constructor(code: string) { super(code); this.code = code; } }
export const AI_ERRORS: Record<string, string> = {
  no_key: 'AI mode needs an Anthropic API key. Paste yours below (it is only sent with this request, never stored) or set ANTHROPIC_API_KEY on the server. You can use rule-based mode without a key.',
  bad_key: 'That API key was rejected. Check it and try again.',
  rate_limited: 'Too many requests right now. Wait a minute, then try again.',
  overloaded: 'The AI service is busy. Try again in a moment.',
  upstream: 'The AI service could not be reached. Try again.',
  invalid_json: "The AI's reply could not be read. Try again.",
  prompt_too_large: 'Your answers are too long to send. Shorten any custom answers.',
  bad_request: 'The request was not valid.',
};
export const aiErrorText = (e: unknown) => AI_ERRORS[(e as AIError)?.code] || 'Something went wrong while asking the AI. Try again.';

export async function callAI(prompt: string, key: string, maxTokens = 4000): Promise<string> {
  let res: Response;
  try {
    res = await fetch('/api/ai', { method: 'POST', headers: { 'content-type': 'application/json', ...(key ? { 'x-api-key': key } : {}) }, body: JSON.stringify({ prompt, maxTokens }) });
  } catch { throw new AIError('upstream'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new AIError(j.error || 'upstream');
  if (j.truncated) throw new AIError('invalid_json');
  return String(j.text || '');
}
export async function callJSON<T>(prompt: string, key: string, maxTokens = 4000): Promise<T> {
  const t = await callAI(prompt, key, maxTokens);
  const s = t.replace(/^```(?:json)?/m, '').replace(/```\s*$/m, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  try { return JSON.parse(s.slice(a, b + 1)) as T; } catch { throw new AIError('invalid_json'); }
}

const COMMON = `You help a builder find a product idea from their questionnaire answers. They have NOT stated a problem and you must not invent one. Use only the answers. Be specific; never produce an idea a competitor's tagline could also fit. Do not use em dashes. Reply with JSON only, no prose, no code fence.`;

const P_IDEAS = (at: string, multi: boolean) => `TASK: ideas
${COMMON}

Write a short profile of the builder (max 30 words), list their hard constraints (hours, budget, team, time, max 6 short strings), then write exactly 6 product ideas${multi ? ' (at least 2 must combine the two regions they picked)' : ''}.
Each idea has: title (max 6 words), region, corner, audience (a specific type of person), moment (max 8 words), platform (from the Shape answers, max 4 words), action (what the user does, verb phrase, max 10 words), retention (what brings them back, max 10 words), features (4 to 6 features chosen from their feature answers or consistent with them), angle (what makes it specific, max 10 words), loop (one closed growth cycle, max 14 words), refill (what refreshes it without the builder, max 10 words), money (how it earns, max 8 words), alone (what is useful on day one with zero other users, max 10 words), breaks_instinct (true for exactly one idea that deliberately breaks the builder's first instinct).
Across the 6 ideas use at least 3 different loops and 2 different platforms.

JSON format: {"profile":"","constraints":[""],"ideas":[{"title":"","region":"","corner":"","audience":"","moment":"","platform":"","action":"","retention":"","features":[""],"angle":"","loop":"","refill":"","money":"","alone":"","breaks_instinct":false}]}

ANSWERS:
${at}`;

const P_SCORES = (ideas: string, at: string) => `TASK: scores
${COMMON}

Score each idea 0, 1 or 2 on these 8 criteria, in this exact order, using only the builder's answers:
1 constraints: 0 breaks a hard constraint, 1 tight, 2 comfortable.
2 audience: 0 no named place to reach them, 1 one place, 2 several places.
3 alone: 0 needs other users, 1 partly useful alone, 2 fully useful alone.
4 loop: 0 no loop, 1 loop needs big scale, 2 loop works in a small group.
5 refill: 0 needs the builder, 1 partly automatic, 2 automatic.
6 evidence: 0 a hunch, 1 conversations or a survey, 2 prototype use, signups or money (use the evidence answer).
7 robustness: 0 fragile to the outside condition the builder said would sink it, 1 moderate, 2 robust.
8 priorart: 0 repeats a failure the builder named, 1 unclear, 2 clear reason it differs.
Set generic to true if a competitor's tagline could be this same idea. Give a note of max 12 words naming the biggest weakness.

JSON format: {"scores":[{"id":"I1","c":[0,0,0,0,0,0,0,0],"generic":false,"note":""}]}

IDEAS:
${ideas}

ANSWERS:
${at}`;

const P_DETAIL = (idea: string, weak: string, level: string, at: string) => `TASK: details
${COMMON}

Observation targets and a red team for ONE idea. Do not claim a problem exists; give places to look. Fields: watch (2 specific places where the audience gathers, max 10 words each), look_for (3 workarounds or behaviours to look for, max 10 words each), friction (ONE guess about where it might hurt, max 25 words, a hypothesis), ask (one question for 5 real people about the last time they did the thing; it must not mention the idea; max 25 words), fails (the strongest reason this idea fails, max 30 words), change (which answer, cited by id, would need to change to fix it, and to what; max 20 words), test (the cheapest test this week, matched to the builder's evidence level, which is: ${level}; max 30 words).

JSON format: {"watch":["",""],"look_for":["","",""],"friction":"","ask":"","fails":"","change":"","test":""}

IDEA:
${idea}

BIGGEST WEAKNESS: ${weak}

ANSWERS:
${at}`;

function normIdea(x: Record<string, unknown>, i: number): Idea {
  const t = (k: string) => String(x[k] ?? '');
  return {
    id: 'I' + (i + 1), title: t('title'), region: t('region'), corner: t('corner'), audience: t('audience'), moment: t('moment'), platform: t('platform'),
    action: t('action'), retention: t('retention'), features: Array.isArray(x.features) ? x.features.map(String) : [], angle: t('angle'), loop: t('loop'),
    refill: t('refill'), money: t('money'), alone: t('alone'), breaks_instinct: !!x.breaks_instinct,
  };
}

export type Progress = (step: 'ideas' | 'scores' | 'details', state: 'running' | 'done') => void;

export async function runAI(a: Answers, key: string, onProgress: Progress, partial?: Partial<Result>): Promise<Result> {
  const at = answersText(a);
  const ctx = buildCtx(a);
  const capped = evidenceCapped(ctx);
  const multi = ctx.domains.length === 2;
  const r: Partial<Result> = partial || {};
  if (!r.ideas) {
    onProgress('ideas', 'running');
    const j = await callJSON<{ profile: string; constraints: string[]; ideas: Omit<Idea, 'id'>[] }>(P_IDEAS(at, multi), key, 5000);
    if (!j || !Array.isArray(j.ideas) || !j.ideas.length) throw new AIError('invalid_json');
    r.profile = String(j.profile || '');
    r.constraints = Array.isArray(j.constraints) ? j.constraints.map(String) : [];
    r.ideas = j.ideas.slice(0, 8).map((x, i) => normIdea(x as unknown as Record<string, unknown>, i));
  }
  onProgress('ideas', 'done');
  if (!r.scores) {
    onProgress('scores', 'running');
    const j = await callJSON<{ scores: Score[] }>(P_SCORES(JSON.stringify(r.ideas), at), key, 3000);
    const m: Record<string, Partial<Score>> = {};
    (j?.scores || []).forEach((s) => { m[s.id] = s; });
    r.scores = r.ideas!.map((i) => {
      const s = m[i.id] || {};
      const c = (Array.isArray(s.c) ? s.c : []).slice(0, 8).map((n) => Math.max(0, Math.min(2, Math.round(Number(n)) || 0)));
      while (c.length < 8) c.push(0);
      if (capped) c[5] = 0;
      return { id: i.id, c, total: c.reduce((x, y) => x + y, 0), generic: !!s.generic, note: String(s.note || '') };
    });
  }
  onProgress('scores', 'done');
  r.capped = capped; r.mode = 'ai'; r.at = Date.now();
  if (!r.details || !r.details.length) {
    onProgress('details', 'running');
    const rk = ranked(r as Result).slice(0, 3);
    const level = (ctx.close.evidence || []).join('; ') || 'none stated (treat as a hunch)';
    const out = await Promise.all(rk.map(async (x) => {
      const d = await callJSON<Omit<Detail, 'id'>>(P_DETAIL(JSON.stringify(x.idea), x.score.note, level, at), key, 1500);
      const arr = (v: unknown) => (Array.isArray(v) ? v.map(String) : []);
      return { id: x.idea.id, watch: arr(d.watch), look_for: arr(d.look_for), friction: String(d.friction || ''), ask: String(d.ask || ''), fails: String(d.fails || ''), change: String(d.change || ''), test: String(d.test || '') } as Detail;
    }));
    r.details = out;
  }
  onProgress('details', 'done');
  return r as Result;
}
