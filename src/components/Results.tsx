'use client';
import { useState } from 'react';
import { ArrowRight, Copy, Download, FileText, Sparkles, Wand2, FileDown, RotateCcw, Pencil, Check, Shuffle } from 'lucide-react';
import { Result, CRITERIA, ranked, sentence, Idea } from '@/lib/types';
import { Built } from '@/lib/report';
import { PromptKind, KIND_LABEL, KIND_HELP } from '@/lib/prompt';

export interface AnswerGroup { title: string; rows: { q: string; a: string[] }[] }
interface Props {
  r: Result;
  rolled: boolean;
  answers: AnswerGroup[];
  prompts: Built[];
  busy: string | null;
  aiReady: boolean;
  onPrompt: (idea: Idea, mode: 'rules' | 'ai', kind: PromptKind) => void;
  onCopyPrompt: (b: Built) => void;
  onDownloadPrompt: (b: Built, idea: Idea) => void;
  onCopyMD: () => void;
  onDownloadMD: () => void;
  onDownloadPDF: () => void;
  onEdit: () => void;
  onRerun: () => void;
  onRandomize: () => void;
  onMode: () => void;
}

function Meter({ c }: { c: number[] }) {
  return (
    <div className="grid grid-cols-8 gap-1" role="img" aria-label={c.map((v, i) => `${CRITERIA[i]} ${v} of 2`).join(', ')}>
      {c.map((v, i) => (
        <div key={i} title={`${CRITERIA[i]}: ${v} of 2`} className="h-2.5 border border-foreground rounded-sm relative overflow-hidden bg-card">
          <span className="absolute inset-y-0 left-0 bg-accent" style={{ width: `${(v / 2) * 100}%` }} />
        </div>
      ))}
    </div>
  );
}

export default function Results(p: Props) {
  const { r } = p;
  const list = ranked(r);
  const [open, setOpen] = useState<string | null>(list[0]?.idea.id || null);
  const [pm, setPm] = useState<Record<string, 'rules' | 'ai'>>({});
  const [pk, setPk] = useState<Record<string, PromptKind>>({});
  return (
    <div>
      <section className="bg-primary text-primary-foreground border border-foreground rounded-sm p-6 md:p-10 relative overflow-hidden shadow-[6px_6px_0_hsl(var(--accent))]">
        <div className="absolute inset-0 grain opacity-40 pointer-events-none" />
        <div className="relative">
          <div className="eyebrow !text-primary-foreground/70 mb-4">§ 05 · Your ideas · {r.mode === 'ai' ? 'AI finder' : 'Rule-based finder'}</div>
          <h2 className="font-display text-4xl md:text-6xl font-black leading-[1] text-balance">
            Found in your answers.
            <span className="block italic font-light text-accent">Pick one to build.</span>
          </h2>
          <p className="mt-4 max-w-2xl opacity-80">{r.profile}</p>
          {r.constraints.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">{r.constraints.map((c) => <span key={c} className="tag border-primary-foreground/30">{c}</span>)}</div>
          )}
          {r.capped && <p className="mt-4 text-sm border border-dashed border-primary-foreground/30 rounded-sm p-3 max-w-2xl">Your evidence is a hunch or unanswered, so the evidence score is held at 0 for every idea. Test first, then raise it.</p>}
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="btn bg-accent text-accent-foreground border-primary-foreground/30 hover:bg-primary-foreground" onClick={p.onCopyMD}><Copy className="h-4 w-4" />Copy as Markdown</button>
            <button className="btn bg-transparent border-primary-foreground/30 hover:border-accent hover:text-accent" onClick={p.onDownloadMD}><FileText className="h-4 w-4" />Download .md</button>
            <button className="btn bg-transparent border-primary-foreground/30 hover:border-accent hover:text-accent" onClick={p.onDownloadPDF}><FileDown className="h-4 w-4" />Download PDF</button>
          </div>
        </div>
      </section>

      <details className="mt-6 border border-foreground rounded-sm bg-card group" open={p.rolled}>
        <summary className="flex items-center justify-between cursor-pointer list-none px-5 md:px-7 py-4 font-display text-lg font-bold hover:bg-amber-soft">
          <span>{p.rolled ? 'The answers Randomize chose' : 'The answers behind these ideas'}<span className="ml-2 text-sm font-normal text-muted-foreground">{p.answers.reduce((n, g) => n + g.rows.length, 0)} answers</span></span>
          <span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
        </summary>
        <div className="px-5 md:px-7 pb-6 space-y-6">
          {p.answers.map((g) => (
            <div key={g.title}>
              <div className="eyebrow border-b border-foreground pb-1 mb-2">{g.title}</div>
              {g.rows.map((row) => (
                <div key={row.q} className="grid sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-border text-sm">
                  <div className="sm:col-span-5 text-muted-foreground">{row.q}</div>
                  <div className="sm:col-span-7 flex flex-wrap gap-1.5">{row.a.map((x) => <span key={x} className="tag">{x}</span>)}</div>
                </div>
              ))}
            </div>
          ))}
          <button className="btn-outline" onClick={p.onEdit}><Pencil className="h-4 w-4" />Edit answers</button>
        </div>
      </details>

      <ol className="mt-10 space-y-6">
        {list.map(({ idea, score }, n) => {
          const d = r.details.find((x) => x.id === idea.id);
          const isOpen = open === idea.id;
          const mode = pm[idea.id] || 'rules';
          const kind = pk[idea.id] || 'build';
          const built = p.prompts.find((b) => b.ideaId === idea.id && b.mode === mode && (b.kind || 'build') === kind);
          const busyKey = `${idea.id}:${mode}:${kind}`;
          return (
            <li key={idea.id} className={`border border-foreground rounded-sm bg-card ${n === 0 ? 'shadow-[var(--shadow-brutal)]' : ''}`}>
              <div className="p-5 md:p-7">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-mono-tight text-xs text-accent mb-2">{String(n + 1).padStart(2, '0')} · {idea.region} / {idea.corner}</div>
                    <h3 className="font-display text-2xl md:text-3xl font-black leading-tight text-balance">{idea.title}</h3>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-display text-3xl font-black">{score.total}<span className="text-base text-muted-foreground font-normal"> / 16</span></div>
                    <div className="flex gap-2 justify-end mt-1 flex-wrap">
                      {score.generic && <span className="tag border-destructive text-destructive">Generic</span>}
                      {idea.breaks_instinct && <span className="tag bg-accent text-accent-foreground">Breaks your instinct</span>}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-muted-foreground leading-relaxed">{sentence(idea)}</p>
                {idea.features.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{idea.features.map((f) => <span key={f} className="tag">{f}</span>)}</div>}
                <dl className="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
                  <div className="border-l-2 border-accent pl-3"><dt className="eyebrow">Earns</dt><dd>{idea.money}</dd></div>
                  <div className="border-l-2 border-accent pl-3"><dt className="eyebrow">Platform</dt><dd>{idea.platform}</dd></div>
                  <div className="border-l-2 border-accent pl-3"><dt className="eyebrow">Specific because</dt><dd>{idea.angle || 'No angle chosen yet'}</dd></div>
                </dl>
                <div className="mt-5"><Meter c={score.c} /><p className="mt-2 text-xs text-muted-foreground">Weakest point: {score.note}</p></div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button className="btn-brutal" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : idea.id)}><Sparkles className="h-4 w-4" />{isOpen ? 'Hide prompts' : 'Prompts'}<ArrowRight className="h-4 w-4" /></button>
                </div>
              </div>

              {d && (
                <details className="group border-t border-foreground" open={n === 0}>
                  <summary className="flex items-center justify-between cursor-pointer list-none px-5 md:px-7 py-4 font-display text-lg font-bold hover:bg-amber-soft">
                    Where to look and what to test
                    <span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <div className="px-5 md:px-7 pb-6 grid md:grid-cols-2 gap-6 text-sm">
                    <div><div className="eyebrow mb-2">Watch</div><ul className="space-y-1.5">{d.watch.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />{x}</li>)}</ul></div>
                    <div><div className="eyebrow mb-2">Look for</div><ul className="space-y-1.5">{d.look_for.map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 text-accent shrink-0 mt-0.5" />{x}</li>)}</ul></div>
                    <div><div className="eyebrow mb-2">Friction to check (a guess)</div><p>{d.friction}</p></div>
                    <div><div className="eyebrow mb-2">Ask five real people</div><p>{d.ask}</p></div>
                    <div><div className="eyebrow mb-2">Strongest reason it fails</div><p>{d.fails}</p></div>
                    <div><div className="eyebrow mb-2">What to change</div><p>{d.change}</p></div>
                    <div className="md:col-span-2 border-l-4 border-accent pl-4"><div className="eyebrow mb-1">Cheapest test this week</div><p className="font-display text-lg">{d.test}</p></div>
                  </div>
                </details>
              )}

              {isOpen && (
                <div className="border-t border-foreground bg-amber-soft p-5 md:p-7">
                  <div className="eyebrow mb-2">§ Prompts</div>
                  <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Prompt type">
                    {(['build', 'brief', 'design'] as const).map((k) => (
                      <button key={k} type="button" aria-pressed={kind === k} onClick={() => setPk({ ...pk, [idea.id]: k })}
                        className={`px-4 py-2 text-xs font-mono-tight uppercase tracking-widest border border-foreground rounded-sm ${kind === k ? 'bg-accent text-accent-foreground' : 'bg-card hover:bg-secondary'}`}>
                        {KIND_LABEL[k]}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm mb-4 max-w-2xl">{KIND_HELP[kind]} The template fills in your answers instantly. The AI version writes a sharper one tailored to the idea.</p>
                  <div className="inline-flex border border-foreground rounded-sm overflow-hidden mb-4" role="group" aria-label="Prompt source">
                    {(['rules', 'ai'] as const).map((m) => (
                      <button key={m} type="button" aria-pressed={mode === m} onClick={() => setPm({ ...pm, [idea.id]: m })}
                        className={`px-4 py-2 text-xs font-mono-tight uppercase tracking-widest ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary'}`}>
                        {m === 'rules' ? 'Template, no AI' : 'AI-written'}
                      </button>
                    ))}
                  </div>
                  {!built && (
                    <div>
                      <button className="btn-brutal" disabled={p.busy === busyKey || (mode === 'ai' && !p.aiReady)} onClick={() => p.onPrompt(idea, mode, kind)}>
                        <Wand2 className="h-4 w-4" />{p.busy === busyKey ? 'Writing...' : mode === 'rules' ? 'Fill the template' : 'Write with AI'}
                      </button>
                      {mode === 'ai' && !p.aiReady && <p className="mt-3 text-sm">AI-written prompts need an API key. Add one on the finder step, or use the template.</p>}
                    </div>
                  )}
                  {built && (
                    <div>
                      <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed bg-card border border-foreground rounded-sm p-4 max-h-[28rem] overflow-y-auto font-mono-tight">{built.text}</pre>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button className="btn-brutal" onClick={() => p.onCopyPrompt(built)}><Copy className="h-4 w-4" />Copy prompt</button>
                        <button className="btn-outline" onClick={() => p.onDownloadPrompt(built, idea)}><Download className="h-4 w-4" />Download .md</button>
                        <button className="btn-outline" disabled={p.busy === busyKey || (mode === 'ai' && !p.aiReady)} onClick={() => p.onPrompt(idea, mode, kind)}><RotateCcw className="h-4 w-4" />Regenerate</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-wrap gap-3 border-t border-foreground pt-6">
        <button className="btn-outline" onClick={p.onEdit}><Pencil className="h-4 w-4" />Edit answers</button>
        <button className="btn-outline" onClick={p.onRerun}><RotateCcw className="h-4 w-4" />Run again</button>
        <button className="btn-outline" onClick={p.onRandomize}><Shuffle className="h-4 w-4" />Randomize again</button>
        <button className="btn-outline" onClick={p.onMode}>Switch finder</button>
      </div>
    </div>
  );
}
