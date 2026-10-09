import { Answers, route, isAns, listOf, qText, optText, flat } from './engine';
import { Result, CRITERIA, ranked, sentence, cap } from './types';

export interface Built { ideaId: string; mode: 'rules' | 'ai'; text: string; kind?: 'build' | 'brief' | 'design' }
const KIND_NAME = { build: 'Build prompt', brief: 'Explainer prompt', design: 'UI design prompt' };

export function reportMD(a: Answers, r: Result | null, prompts: Built[] = []): string {
  const L: string[] = [];
  const date = new Date().toISOString().slice(0, 10);
  L.push('# MindMap report', '', `Generated ${date}${r ? ` with the ${r.mode === 'ai' ? 'AI' : 'rule-based'} finder` : ''}.`, '');
  if (r) {
    L.push('## Profile', '', r.profile, '');
    if (r.constraints.length) L.push('Constraints:', ...r.constraints.map((x) => `- ${x}`), '');
    L.push('## Ideas, ranked', '');
    if (r.capped) L.push('Evidence was a hunch or unanswered, so the evidence score is capped at 0 for every idea.', '');
    ranked(r).forEach(({ idea, score }, n) => {
      L.push(`### ${n + 1}. ${idea.title}${score.generic ? ' (flagged generic)' : ''}`, '');
      L.push(`${idea.region} / ${idea.corner}`, '', sentence(idea), '');
      L.push(`- Features: ${idea.features.join('; ') || 'none chosen'}`);
      if (idea.angle) L.push(`- What makes it specific: ${idea.angle}`);
      L.push(`- Earns: ${idea.money}`);
      if (idea.breaks_instinct) L.push('- This idea deliberately breaks your first instinct.');
      L.push(`- Score: ${score.total} of 16. Weakest point: ${score.note}`);
      L.push(`- By criterion: ${CRITERIA.map((c, i) => `${c} ${score.c[i]}`).join(', ')}`, '');
    });
    if (r.details.length) {
      L.push('## Shortlist: where to look, what to test', '');
      r.details.forEach((d) => {
        const i = r.ideas.find((x) => x.id === d.id);
        if (!i) return;
        L.push(`### ${i.title}`, '', 'Watch:', ...d.watch.map((x) => `- ${x}`), '', 'Look for:', ...d.look_for.map((x) => `- ${x}`), '');
        L.push(`- Friction to check (a guess): ${d.friction}`, `- Ask five real people: ${d.ask}`, `- Strongest reason it fails: ${d.fails}`, `- What to change: ${d.change}`, `- Cheapest test this week: ${d.test}`, '');
      });
    }
  }
  prompts.forEach((p) => {
    const i = r?.ideas.find((x) => x.id === p.ideaId);
    L.push(`## ${KIND_NAME[p.kind || 'build']} (${p.mode === 'ai' ? 'AI-written' : 'template'}): ${i ? i.title : p.ideaId}`, '', p.text.replace(/^# .*\n+/, ''), '');
  });
  L.push('## Your answers', '');
  route(a).forEach((s) => {
    const qs = s.qs.filter((q) => isAns(a, q.id));
    if (!qs.length) return;
    L.push(`### ${s.domain ? s.domain.name + ': ' : ''}${s.title}`, '');
    qs.forEach((q) => L.push(`- ${qText(q, a)} ${listOf(a, q.id).map((x) => optText(q, x, a)).join('; ')}`));
    L.push('');
  });
  const n = flat(route(a)).filter((x) => isAns(a, x.q.id)).length;
  L.push(`${n} questions answered.`, '');
  return L.join('\n');
}
export const promptFile = (b: Built, title: string) => `${b.text}\n`;
export { cap };
