import { Answers, buildCtx, Ctx, answersText } from './engine';
import { Idea, Result, lc, cap, sentence } from './types';
import { callAI } from './ai';

const bullets = (a: string[]) => (a.length ? a.map((x) => `- ${x}`).join('\n') : '- (none chosen)');
const num = (a: string[]) => a.map((x, i) => `${i + 1}. ${x}`).join('\n');
const STD = new Set(['audience', 'moment', 'platform', 'ai', 'money', 'first_users', 'loop', 'belief', 'kill', 'prior']);

function fields(c: Ctx, idea: Idea) {
  const stack = c.you.stack?.length ? c.you.stack.join(', ') : 'whichever stack is simplest and well documented';
  const mvpN = (c.you.hours?.[0] || '').match(/Under 5|Weekends|Evenings|Irregular|^5 to 10/) ? 3 : 5;
  const mvp = idea.features.slice(0, Math.max(3, Math.min(mvpN, idea.features.length)));
  const later = idea.features.slice(mvp.length);
  const d0 = c.domains[0];
  const sys = c.domains.flatMap((d) => d.det.filter((x) => x.district === 'system' || x.district === 'shape').map((x) => `${x.q} ${x.a.join('; ')}`));
  return { stack, mvp, later, d0, sys };
}

/** Deterministic template: no AI needed. Fills a build prompt from the idea and the answers. */
export function buildPromptRules(a: Answers, idea: Idea, r?: Result): string {
  const c = buildCtx(a);
  const { stack, mvp, later, d0, sys } = fields(c, idea);
  const detail = r?.details.find((d) => d.id === idea.id);
  const hours = c.you.hours?.[0] || 'not stated';
  const market = c.you.market?.join(', ') || 'not stated';
  const lowBand = /Nigeria|Uganda|Kenya|Ghana|Africa/.test(market);
  return `# Build prompt: ${idea.title}

You are a senior full-stack engineer and product designer acting as my build partner. Read this whole brief, state your assumptions in a short list, propose the file structure and data model, then build the MVP in small, working steps. Do not ask me questions unless you are blocked. Prefer boring, well-supported tools. Commit after each step.

## 1. The product in one sentence
${sentence(idea)}

## 2. Who it is for
- Audience: ${idea.audience}
- When they reach for it: ${idea.moment || 'to be decided'}
- Markets: ${market}
- Languages: ${c.you.language?.join(', ') || 'English'}

## 3. Core action and loop
- Core action: ${cap(idea.action)}
- What brings people back: ${cap(idea.retention)}
- Growth loop: ${cap(idea.loop)}
- Useful on day one with zero other users through: ${lc(idea.alone)}
- What keeps it fresh without me: ${lc(idea.refill)}
${idea.angle ? `- What makes it specific: ${idea.angle}` : ''}

## 4. Platform and stack
- Platform: ${idea.platform}
- Build with: ${stack}
- Hard constraints: ${hours} hours a week, budget ${c.you.budget?.[0] || 'not stated'}, team ${c.you.team?.join(', ') || 'just me'}, first version in ${c.you.time?.[0] || 'no fixed date'}.
${lowBand ? '- Design for low bandwidth and mid-range Android phones first: small bundles, offline-tolerant screens, mobile money friendly checkout.' : '- Mobile-first, responsive, accessible.'}

## 5. MVP features (build these first)
${num(mvp)}

## 6. Later (do not build yet)
${bullets(later)}

## 7. Behind the screens
${bullets(sys.length ? sys : ['Accounts and data: keep the simplest model that works'])}

## 8. Money
- Plan: ${idea.money}
- Do not build billing until the core action works, but leave a clean seam for it.

## 9. Acceptance criteria
${num([...mvp.map((f) => `A user can use "${f}" end to end on ${lc(idea.platform)} without help.`), 'The first screen explains the core action in one sentence and gets the user doing it within 30 seconds.', `The product is useful with zero other users: ${lc(idea.alone)}.`])}

## 10. How I will know it works
${bullets(c.close.success || ['Return visits after a week'])}

## 11. First test, before more building
${bullets(c.close.test || ['Talk to 10 people'])}
${detail ? `\nQuestion to ask five real people: ${detail.ask}\n` : ''}
## 12. Working rules
- Start by listing assumptions and the data model, then wait for nothing and proceed.
- Build vertical slices: one feature fully working before the next.
- Write a short README with run, test and deploy steps.
- Add basic tests for the core action and a seed script with realistic sample data.
- Keep copy plain and short. No lorem ipsum. No placeholder features.
- If a requirement here conflicts with the constraints in section 4, choose the smaller option and say so.
`;
}

/** Ask the AI to turn the same material into a sharper, tailored build prompt. */
export async function buildPromptAI(a: Answers, idea: Idea, key: string, r?: Result): Promise<string> {
  const c = buildCtx(a);
  const { mvp, later } = fields(c, idea);
  const meta = `Write a build prompt for an AI coding agent (such as Claude Code) that will build the MVP of the product below. The prompt must be self-contained, concrete and ready to paste. Use markdown headings. Include: a one-sentence product summary; target user and context; the core action and first-run experience; MVP features with acceptance criteria; a suggested data model with fields; screens or routes; the stack choice with a reason (prefer the builder's own tools); a step-by-step build order sized to the builder's hours; what to leave out; basic tests; analytics events for the builder's success measures; and the first real-world test. Do not invent a problem statement. Do not use em dashes. Output only the prompt, no preface.

PRODUCT
${JSON.stringify({ ...idea, mvp_features: mvp, later_features: later }, null, 2)}

BUILDER AND CONSTRAINTS
${r?.profile || ''}
${(r?.constraints || []).join('; ')}

THEIR ANSWERS
${answersText(a)}`;
  return (await callAI(meta, key, 4500)).trim();
}
export { STD };
