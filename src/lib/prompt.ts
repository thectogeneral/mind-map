import { Answers, buildCtx, Ctx, answersText } from './engine';
import { Idea, Result, lc, cap, sentence, ranked, CRITERIA } from './types';
import { callAI } from './ai';

const bullets = (a: string[]) => (a.length ? a.map((x) => `- ${x}`).join('\n') : '- (none chosen)');
const num = (a: string[]) => a.map((x, i) => `${i + 1}. ${x}`).join('\n');
const STD = new Set(['audience', 'moment', 'platform', 'ai', 'money', 'first_users', 'loop', 'belief', 'kill', 'prior']);

/** The corner this idea came from, with its optional first-session, outside-needs and trust answers. */
function cornerNotes(c: Ctx, idea: Idea): string[] {
  const all = c.domains.flatMap((d) => d.corners);
  const cn = all.find((x) => idea.corner.includes(x.name)) || all[0];
  if (!cn) return [];
  return [
    cn.firstSession.length ? `- First session: ${cn.firstSession.join('; ')}` : '',
    cn.needs.length ? `- Needs from outside: ${cn.needs.join('; ')}` : '',
    cn.trust.length ? `- Trust and rules: ${cn.trust.join('; ')}` : '',
  ].filter(Boolean);
}

const notesBlock = (c: Ctx, idea: Idea) => cornerNotes(c, idea).map((x) => '\n' + x).join('');

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
${idea.angle ? `- What makes it specific: ${idea.angle}` : ''}${notesBlock(c, idea)}

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


export type IdeaKind = 'build' | 'brief' | 'design' | 'refine';
export type PromptKind = IdeaKind | 'ideas';
export const IDEA_KINDS: IdeaKind[] = ['build', 'brief', 'design', 'refine'];
export const KIND_LABEL: Record<PromptKind, string> = { build: 'Build prompt', brief: 'Explainer prompt', design: 'UI design prompt', refine: 'Refine this idea', ideas: 'Ideas and refinement prompt' };
export const KIND_FILE: Record<PromptKind, string> = { build: 'build-prompt', brief: 'explainer-prompt', design: 'ui-design-prompt', refine: 'refine-prompt', ideas: 'ideas-prompt' };
export const KIND_HELP: Record<PromptKind, string> = {
  build: 'A prompt for a coding agent, built from this idea and all your answers.',
  brief: 'A prompt that makes an AI explain the product and its build prompt to you in plain language: what each part means, the risks, costs, a first-week plan, and what to decide.',
  design: 'A prompt for a UI design tool or an AI designer (Figma AI, v0, Claude, Lovable and similar): screens, flows, components, states and visual direction for this product.',
  refine: 'A prompt that makes an AI sharpen this idea: the problems it solves, a tighter audience, a stronger pitch, fixes for its weakest scores, and which of your answers to change.',
  ideas: 'A prompt that makes an AI generate and refine product ideas from all your answers, name the problems each one solves, and suggest better answers for the vague or contradictory ones.',
};

/** Screens implied by the MVP features, used by the design prompt. */
function screenList(idea: Idea, mvp: string[]) {
  return ['First-run screen that explains the core action in one sentence', `Main screen for the core action: ${lc(idea.action)}`, ...mvp.map((f) => `Screen or panel for "${f}"`), 'Empty, loading and error states for each of the above', 'Settings and account'];
}

/** Template prompt that asks an AI to explain the product and the build prompt. */
export function buildBriefRules(a: Answers, idea: Idea, r?: Result): string {
  const c = buildCtx(a);
  const { stack, mvp, later } = fields(c, idea);
  const detail = r?.details.find((d) => d.id === idea.id);
  const build = buildPromptRules(a, idea, r);
  return `# Explainer prompt: ${idea.title}

You are a patient senior product mentor and engineer. I am the founder of the product below. Explain it to me in plain language, assume I am smart but not an expert in every area, and avoid jargon unless you define it in one line.

## The product
${sentence(idea)}

- Region and corner: ${idea.region} / ${idea.corner}
- Platform: ${idea.platform}
- Stack I would use: ${stack}
- MVP features: ${mvp.join('; ')}
- Later: ${later.length ? later.join('; ') : 'nothing yet'}
- How it earns: ${idea.money}
- What makes it specific: ${idea.angle || 'not chosen yet'}${notesBlock(c, idea)}
- My constraints: ${c.you.hours?.[0] || 'hours not stated'} a week, budget ${c.you.budget?.[0] || 'not stated'}, team ${c.you.team?.join(', ') || 'just me'}
${detail ? `- Strongest reason it could fail: ${detail.fails}\n- Cheapest test this week: ${detail.test}` : ''}

## What I want from you
1. **The idea in plain words.** Who it is for, the problem it quietly solves, and why someone would switch to it.
2. **Walk through my build prompt.** For each numbered section of the build prompt below, tell me what it means, why it is there, and what you would change for my situation.
3. **Decisions I must make.** List every choice I still owe (stack, scope, pricing, first market) with your recommendation and the reason.
4. **Risks.** The three most likely ways this fails, how I would notice early, and what I would do.
5. **Cost and time.** A realistic estimate of build time at my weekly hours, running costs for the first six months, and the first expense I can avoid.
6. **Competitors and prior art.** What already exists, what they do well, and the gap I could use.
7. **First week plan.** Day by day, ending with one real test with real people.
8. **Questions back to me.** The five things you most need to know to give better advice.

Keep each part short and concrete. Use headings. Do not flatter the idea; say plainly where it is weak.

## My build prompt (for item 2)
${build.replace(/^# .*\n+/, '')}`;
}

/** Template prompt for a UI design tool or an AI designer. */
export function buildDesignRules(a: Answers, idea: Idea, r?: Result): string {
  const c = buildCtx(a);
  const { mvp } = fields(c, idea);
  const market = c.you.market?.join(', ') || 'not stated';
  const lowBand = /Nigeria|Uganda|Kenya|Ghana|Africa/.test(market);
  const mobile = /android|ios|mobile|phone|whatsapp|telegram|sms|ussd/i.test(idea.platform);
  return `# UI design prompt: ${idea.title}

You are a senior product designer. Design the user interface for the product below. Produce clear, buildable designs, not decoration. Where something is unclear, make a sensible choice and list it as an assumption instead of asking.

## 1. Product
${sentence(idea)}

## 2. Users and context
- Audience: ${idea.audience}
- When they reach for it: ${idea.moment || 'to be decided'}
- Markets: ${market}
- Languages: ${c.you.language?.join(', ') || 'English'}
- Platform: ${idea.platform}

## 3. The one thing the interface must do well
${cap(idea.action)}. A new user should be doing this within 30 seconds of opening the product.

## 4. Screens to design
${num(screenList(idea, mvp))}

## 5. Flows
- First run: open, understand, do the core action, see the result.${(() => { const n = cornerNotes(c, idea).find((x) => x.startsWith('- First session')); return n ? ' The builder pictures it like this: ' + n.replace('- First session: ', '') + '.' : ''; })()}
- Return visit: what the user sees that brings them back (${lc(idea.retention)}).
- Sharing: how the growth loop shows up in the interface (${lc(idea.loop)}).
- Useful with zero other users: ${lc(idea.alone)}.

## 6. Design direction
- Tone: plain, confident, friendly. Short copy, no jargon.
- Layout: ${mobile ? 'mobile first, thumb-reachable primary actions, then a tablet and desktop layout' : 'desktop first with a responsive mobile layout'}.
${lowBand ? '- Low bandwidth and mid-range Android phones: light imagery, small assets, clear offline and slow-network states.\n' : ''}${cornerNotes(c, idea).filter((x) => x.startsWith('- Trust')).map((x) => x.replace('- Trust and rules:', '- Trust and rules the interface must respect:') + '\n').join('')}- Accessibility: WCAG AA contrast, 44px touch targets, visible focus, no information carried by colour alone.
- Pick one accent colour, one neutral scale and two type sizes of emphasis. Name the choices.

## 7. Deliverables
- A user flow diagram covering the flows above.
- Low-fidelity wireframes for every screen in section 4, then a high-fidelity version of the first-run and main screens.
- A small design system: colour tokens, type scale, spacing scale, buttons, inputs, cards, lists, empty and error states.
- Component states: default, hover, pressed, disabled, loading, error.
- Realistic sample content for ${idea.audience}. No lorem ipsum.
- A short handoff note listing assumptions and anything a developer should know.

## 8. Do not
- Add features that are not in the MVP list.
- Use stock illustrations as a substitute for clear layout.
- Hide the core action behind menus.
`;
}

const META_COMMON = 'The prompt must be self-contained, concrete and ready to paste. Use markdown headings. Do not use em dashes. Output only the prompt, no preface.';

export async function buildBriefAI(a: Answers, idea: Idea, key: string, r?: Result): Promise<string> {
  const c = buildCtx(a);
  const { mvp, later } = fields(c, idea);
  const meta = `Write an explainer prompt that a founder will paste into an AI assistant. The assistant should then explain the product below and its build prompt to the founder in plain language. The prompt must tell the assistant to: describe the idea plainly; walk through each section of the build prompt and what it means; list decisions the founder still owes with a recommendation; name the top risks and early warning signs; estimate time and costs at the founder's hours and budget; map competitors and the gap; give a day-by-day first-week plan ending in a real test; ask the founder the questions it most needs answered; and be honest about weaknesses. Include the product facts, the constraints and a short build prompt outline inside it. ${META_COMMON}

PRODUCT
${JSON.stringify({ ...idea, mvp_features: mvp, later_features: later }, null, 2)}

BUILDER AND CONSTRAINTS
${r?.profile || ''}
${(r?.constraints || []).join('; ')}

THEIR ANSWERS
${answersText(a)}`;
  return (await callAI(meta, key, 4500)).trim();
}

export async function buildDesignAI(a: Answers, idea: Idea, key: string, r?: Result): Promise<string> {
  const c = buildCtx(a);
  const { mvp, later } = fields(c, idea);
  const meta = `Write a UI design prompt that a founder will paste into a UI design tool or an AI designer (such as Figma AI, v0, Lovable or Claude). It must cover: the product and audience in context; the single core action the interface serves; a list of screens with the purpose of each; the main user flows; layout and platform rules, including low-bandwidth and mid-range phone needs where the markets suggest it; tone and visual direction with concrete choices for colour, type, spacing and components; accessibility requirements; empty, loading and error states; realistic sample content for the audience; the deliverables expected (flows, wireframes, high-fidelity key screens, a small design system, a handoff note); and what to leave out. Base it only on the facts below. ${META_COMMON}

PRODUCT
${JSON.stringify({ ...idea, mvp_features: mvp, later_features: later }, null, 2)}

BUILDER AND CONSTRAINTS
${r?.profile || ''}
${(r?.constraints || []).join('; ')}

THEIR ANSWERS
${answersText(a)}`;
  return (await callAI(meta, key, 4500)).trim();
}

/** Scores, weakest point and test plan for one idea, as plain lines. */
function ideaEvidence(idea: Idea, r?: Result) {
  const sc = r?.scores.find((x) => x.id === idea.id);
  const d = r?.details.find((x) => x.id === idea.id);
  const lines = sc ? [
    `Score: ${sc.total} of 16${sc.generic ? ' (flagged as generic)' : ''}`,
    ...CRITERIA.map((c, i) => `- ${c}: ${sc.c[i]} of 2`),
    `Weakest point: ${sc.note}`,
  ] : ['Score: not scored yet'];
  const det = d ? [`Strongest reason it fails: ${d.fails}`, `Friction to check: ${d.friction}`, `What to change: ${d.change}`, `Cheapest test this week: ${d.test}`] : [];
  return { lines, det };
}

/** Template prompt that makes an AI sharpen one idea. */
export function buildRefineRules(a: Answers, idea: Idea, r?: Result): string {
  const c = buildCtx(a);
  const { mvp, later } = fields(c, idea);
  const { lines, det } = ideaEvidence(idea, r);
  return `# Refine prompt: ${idea.title}

You are a sharp, honest product strategist. Below is a product idea found from my answers by a rule-based finder. It is a first draft, not a verdict. Refine it: make it narrower, clearer and easier to test. Do not flatter it. Where you are guessing, say so.

## The idea
${sentence(idea)}

- Region and corner: ${idea.region} / ${idea.corner}
- Audience: ${idea.audience}${idea.moment ? ` (${lc(idea.moment)})` : ''}
- Platform: ${idea.platform}
- Core action: ${cap(idea.action)}
- What brings people back: ${cap(idea.retention)}
- Growth loop: ${cap(idea.loop)}
- How it earns: ${idea.money}
- What makes it specific: ${idea.angle || 'not chosen yet'}
- MVP features: ${mvp.join('; ') || 'none chosen'}
- Later features: ${later.length ? later.join('; ') : 'none'}${notesBlock(c, idea)}

## How the finder scored it
${lines.join('\n')}
${det.length ? '\n' + det.join('\n') + '\n' : ''}
## About me
${r?.profile || 'Not stated.'}
${(r?.constraints || []).length ? 'Constraints: ' + (r?.constraints || []).join('; ') : ''}

## What I want from you
1. **Problems it solves.** Name the three most likely problems this product solves. For each: who has it, how often, what it costs them today, and how they cope now. Label each as a hypothesis and say how I would check it.
2. **A sharper audience and moment.** Narrow the audience to one reachable group and the exact moment they would use it. Say what you cut and why.
3. **Three versions of the pitch.** One sentence each, in different styles: plain, benefit-led and story-led.
4. **Fix the weakest scores.** Take the two lowest-scoring criteria above and give two concrete changes each, ranked by effort.
5. **Features.** Which MVP features to keep, which to cut, and anything missing. Keep the first version buildable at my hours and budget.
6. **Three alternative angles.** Different ways to make it specific, each with its trade-off.
7. **Kill criteria.** Three measurable signals in the first month that would tell me to stop or change direction.
8. **Change my answers.** Which answers in my questionnaire would you change to get a better idea from the finder? For each: the question, my current answer, your suggested answer and why.

Be concise and concrete. Use headings. End with the single next action I should take this week.
`;
}

export async function buildRefineAI(a: Answers, idea: Idea, key: string, r?: Result): Promise<string> {
  const c = buildCtx(a);
  const { mvp, later } = fields(c, idea);
  const { lines, det } = ideaEvidence(idea, r);
  const meta = `Write a refine prompt that a founder will paste into an AI assistant. The assistant should then sharpen the product idea below. The prompt must tell the assistant to: name the three most likely problems the product solves (who has each, how often, what it costs them, how they cope now, and how to check it, labelled as hypotheses); narrow the audience and moment; offer three versions of the pitch; fix the two weakest scored criteria with concrete changes; trim or complete the MVP features for the builder's limits; propose three alternative angles; set measurable kill criteria for the first month; and suggest which of the builder's questionnaire answers to change and why. Include the idea, its scores and the builder's context inside the prompt. Be honest, no flattery. ${META_COMMON}

IDEA
${JSON.stringify({ ...idea, mvp_features: mvp, later_features: later }, null, 2)}

SCORES AND TEST PLAN
${[...lines, ...det].join('\n')}

BUILDER AND CONSTRAINTS
${r?.profile || ''}
${(r?.constraints || []).join('; ')}

THEIR ANSWERS
${answersText(a)}`;
  return (await callAI(meta, key, 4500)).trim();
}

/** Answers as readable text, without internal ids. */
const readableAnswers = (a: Answers) => answersText(a).replace(/^[\w.]+ \| /gm, '');

/** Template prompt for the whole route: generate and refine ideas from every answer, and refine the answers. */
export function buildIdeasRules(a: Answers, r?: Result): string {
  const found = r ? ranked(r).map((x, i) => `${i + 1}. ${x.idea.title}: ${sentence(x.idea)} (score ${x.score.total} of 16)`) : [];
  return `# Ideas and refinement prompt

You are a sharp, honest product strategist. Below are my answers to a questionnaire about what I am drawn to, who I could serve and what I can build. I did not start from a problem, so help me find the problems worth solving. Generate ideas, refine them, and also tell me where my answers are weak. Do not flatter. Where you are guessing, say so.

## My answers
${readableAnswers(a) || '(no answers yet)'}
${found.length ? `\n## Ideas a rule-based finder produced from these answers\nStart from these. Improve the good ones, replace the weak ones, and say which is which.\n${found.join('\n')}\n` : ''}
## What I want from you
1. **Who I am as a builder.** In four lines: what I am drawn to, what I can realistically build, my limits (time, money, team) and where my answers point.
2. **Five to eight product ideas.** For each give:
   - Name and one-sentence pitch
   - Audience and the moment they would use it
   - Core action and the first-run experience
   - MVP features (3 to 5)
   - How it earns
   - **Problems it solves:** two or three concrete problems, who has each, how often, and what it costs them today. Label them hypotheses and say how to check each.
   - Biggest risk
3. **Refine.** Rank the ideas. Merge any that overlap. Take the best two and sharpen them: a narrower audience, a stronger angle, and what to cut.
4. **Refine my answers.** Find the answers above that are vague, too broad, contradictory or at odds with my limits. For each one give: the question, my answer, why it is weak, and a better answer. Then list up to five questions the questionnaire did not ask that would have helped.
5. **Next step.** The single cheapest test I should run this week, and what result would make me continue or stop.

Use headings. Keep each idea short. Do not invent facts about me beyond my answers.
`;
}

export async function buildIdeasAI(a: Answers, key: string, r?: Result): Promise<string> {
  const found = r ? ranked(r).map((x) => `${x.idea.title}: ${sentence(x.idea)} (score ${x.score.total} of 16)`) : [];
  const meta = `Write a prompt that a founder will paste into an AI assistant. The assistant should then generate and refine product ideas from the founder's questionnaire answers below. The prompt must tell the assistant to: summarise the builder and their limits; produce five to eight ideas, each with a pitch, audience and moment, core action, MVP features, how it earns, the two or three problems it solves (who has them, how often, what it costs, labelled as hypotheses with a way to check each) and the biggest risk; rank, merge and sharpen the best two; review the founder's answers and, for each vague, too broad or contradictory one, show the question, the answer, why it is weak and a better answer, plus questions the questionnaire should have asked; and end with the cheapest test for this week. Include the answers, and any ideas already found, inside the prompt so it stands alone. The founder did not start from a problem, so the prompt should help find the problems worth solving. ${META_COMMON}

THEIR ANSWERS
${readableAnswers(a)}

IDEAS ALREADY FOUND
${found.join('\n') || '(none yet)'}

BUILDER AND CONSTRAINTS
${r?.profile || ''}
${(r?.constraints || []).join('; ')}`;
  return (await callAI(meta, key, 4500)).trim();
}

export async function makeRoutePromptText(mode: 'rules' | 'ai', a: Answers, key: string, r?: Result): Promise<string> {
  return mode === 'rules' ? buildIdeasRules(a, r) : buildIdeasAI(a, key, r);
}

/** One entry point for every prompt kind. */
export async function makePromptText(kind: IdeaKind, mode: 'rules' | 'ai', a: Answers, idea: Idea, key: string, r?: Result): Promise<string> {
  if (kind === 'build') return mode === 'rules' ? buildPromptRules(a, idea, r) : buildPromptAI(a, idea, key, r);
  if (kind === 'brief') return mode === 'rules' ? buildBriefRules(a, idea, r) : buildBriefAI(a, idea, key, r);
  if (kind === 'refine') return mode === 'rules' ? buildRefineRules(a, idea, r) : buildRefineAI(a, idea, key, r);
  return mode === 'rules' ? buildDesignRules(a, idea, r) : buildDesignAI(a, idea, key, r);
}
export { STD };
