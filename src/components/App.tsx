'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Cpu, Copy, Pencil, Sparkles, Wand2 } from 'lucide-react';
import Logo from './Logo';
import Rail from './Rail';
import Results from './Results';
import {
  Answers, DOMAINS, REGION_Q, answeredCount, answersText, flat, isAns, listOf, optText, picksOf, prune, qOpts, qText, route,
} from '@/lib/engine';
import { Result, Idea } from '@/lib/types';
import { runRules } from '@/lib/rules';
import { runAI, aiErrorText } from '@/lib/ai';
import { buildPromptRules, buildPromptAI } from '@/lib/prompt';
import { Built, reportMD } from '@/lib/report';
import { copy, download, savePDF } from '@/lib/export';

type Screen = 'start' | 'q' | 'review' | 'mode' | 'run' | 'results';
const KEY = 'idea-route:v2';
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'idea';

export default function App() {
  const [mounted, setMounted] = useState(false);
  const [screen, setScreen] = useState<Screen>('start');
  const [ans, setAns] = useState<Answers>({});
  const [cur, setCur] = useState<string>('y.skill');
  const [result, setResult] = useState<Result | null>(null);
  const [prompts, setPrompts] = useState<Built[]>([]);
  const [saved, setSaved] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [confirm, setConfirm] = useState(false);
  const partial = useRef<Partial<Result>>({});
  const runId = useRef(0);
  const tt = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef = useRef<HTMLHeadingElement>(null);

  const say = useCallback((m: string) => { setToast(m); if (tt.current) clearTimeout(tt.current); tt.current = setTimeout(() => setToast(''), 2200); }, []);

  /* persistence */
  useEffect(() => {
    setMounted(true);
    try {
      const t = localStorage.getItem(KEY);
      if (t) { const d = JSON.parse(t); if (d?.ans && Object.keys(d.ans).length) { setAns(d.ans); setCur(d.cur || 'y.skill'); setResult(d.result || null); setPrompts(d.prompts || []); setSaved(true); } }
    } catch { /* storage may be unavailable */ }
  }, []);
  useEffect(() => {
    if (!mounted || !Object.keys(ans).length) return;
    const h = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify({ ans, cur, result, prompts })); } catch { /* ignore */ } }, 300);
    return () => clearTimeout(h);
  }, [ans, cur, result, prompts, mounted]);

  const stations = useMemo(() => route(ans), [ans]);
  const f = useMemo(() => flat(stations), [stations]);
  const total = f.length;
  const done = useMemo(() => answeredCount(ans), [ans]);
  const idx = f.findIndex((x) => x.q.id === cur);
  const here = idx >= 0 ? f[idx] : f[0];

  const go = useCallback((s: Screen) => { setScreen(s); if (typeof window !== 'undefined') window.scrollTo(0, 0); setTimeout(() => stageRef.current?.focus({ preventScroll: true }), 30); }, []);

  /* answering */
  const toggle = (id: string, max: number, opt: string) => {
    setAns((prev) => {
      const a = { ...prev };
      const cu = a[id] ? { ...a[id], picks: [...a[id].picks] } : { picks: [], other: '' };
      const i = cu.picks.indexOf(opt);
      if (i > -1) cu.picks.splice(i, 1);
      else if (max === 1) cu.picks = [opt];
      else if (cu.picks.length >= max) { say(`Up to ${max} picks. Remove one first.`); return prev; }
      else cu.picks.push(opt);
      a[id] = cu;
      return prune(a);
    });
  };
  const setOther = (id: string, text: string) => setAns((prev) => ({ ...prev, [id]: { picks: prev[id]?.picks || [], other: text } }));

  const step = (d: number) => {
    if (!here) return;
    const n = idx + d;
    if (n < 0) return;
    if (n >= f.length) { go('review'); return; }
    setCur(f[n].q.id); go('q');
  };
  const goStation = (id: string) => {
    const s = stations.find((x) => x.id === id);
    if (!s || !s.qs.length) return;
    const q = s.qs.find((x) => !isAns(ans, x.id)) || s.qs[0];
    setCur(q.id); go('q');
  };
  const edit = (id: string) => { setCur(id); go('q'); };

  /* finders */
  const startRules = () => {
    setError('');
    try {
      const r = runRules(ans);
      setResult(r); setPrompts([]); go('results');
    } catch (e) { setError((e as Error).message); }
  };
  const startAI = async (fresh: boolean) => {
    const id = ++runId.current;
    if (fresh) partial.current = {};
    setError(''); setStatus({}); go('run');
    try {
      const r = await runAI(ans, apiKey.trim(), (step, st) => { if (runId.current === id) setStatus((s) => ({ ...s, [step]: st })); }, partial.current);
      if (runId.current !== id) return;
      setResult(r); setPrompts([]); go('results');
    } catch (e) {
      if (runId.current !== id) return;
      setError(aiErrorText(e));
      setStatus((s) => Object.fromEntries(Object.entries(s).map(([k, v]) => [k, v === 'running' ? 'error' : v])));
    }
  };

  /* prompts */
  const makePrompt = async (idea: Idea, mode: 'rules' | 'ai') => {
    if (!result) return;
    const keyB = `${idea.id}:${mode}`;
    setBusy(keyB);
    try {
      const text = mode === 'rules' ? buildPromptRules(ans, idea, result) : await buildPromptAI(ans, idea, apiKey.trim(), result);
      setPrompts((p) => [...p.filter((b) => !(b.ideaId === idea.id && b.mode === mode)), { ideaId: idea.id, mode, text }]);
    } catch (e) { say(aiErrorText(e)); }
    setBusy(null);
  };

  /* exports */
  const md = () => reportMD(ans, result, prompts);
  const doCopy = async (text: string, what: string) => say((await copy(text)) ? `${what} copied` : 'Copy was blocked. Select the text and copy it by hand.');

  const reset = () => {
    if (!confirm) { setConfirm(true); setTimeout(() => setConfirm(false), 4000); return; }
    setConfirm(false); setAns({}); setResult(null); setPrompts([]); setSaved(false); setCur('y.skill');
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    go('start');
  };

  if (!mounted) return <div className="min-h-screen bg-background" />;

  const chosen = picksOf(ans, REGION_Q.id);
  const aiReady = true; // the server may have a key; if not, the call reports it
  const showTools = screen !== 'start';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <button className="group flex items-center gap-2" onClick={() => go('start')} aria-label="MindMap, home">
            <span className="transition-transform group-hover:-rotate-3"><Logo /></span>
            <span className="font-display text-lg font-semibold tracking-tight">Mind<span className="text-accent">Map</span></span>
          </button>
          <div className="flex items-center gap-3">
            {screen !== 'start' && <span className="eyebrow hidden sm:inline">{done} of {total} answered</span>}
            {screen === 'q' && <button className="btn-outline !h-9 !px-3" onClick={() => go('review')}>Review</button>}
            {result && screen !== 'results' && <button className="btn-outline !h-9 !px-3" onClick={() => go('results')}>Ideas</button>}
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        {screen === 'start' && (
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
            <div className="relative grid lg:grid-cols-12 gap-10 items-center py-4 lg:py-10">
              <div className="lg:col-span-7">
                <div className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-8 bg-foreground" />§ 00 · A map for finding what to build</div>
                <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] leading-[0.95] font-black text-balance">
                  You do not need a problem.
                  <span className="block italic font-light text-accent">Follow the route.</span>
                </h1>
                <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-balance">
                  Answer about yourself, choose a region and the questions branch to fit it. Then get ideas found in your answers, a test for each, and a prompt that builds it.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <button className="btn-brutal h-12 px-6" onClick={() => { setAns({}); setResult(null); setPrompts([]); setCur('y.skill'); go('q'); }}>Start the route<ArrowRight className="h-4 w-4" /></button>
                  {saved && <button className="btn-outline h-12 px-6" onClick={() => go(result ? 'results' : 'q')}>Resume where you left off</button>}
                </div>
                <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
                  {['About 50 to 90 questions, one route', 'Rule-based or AI finder', 'Download PDF or Markdown'].map((t) => <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" />{t}</li>)}
                </ul>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-4 bg-accent/20 rounded-sm rotate-2" />
                <div className="relative border border-foreground rounded-sm bg-card p-5">
                  <div className="eyebrow mb-3">12 regions</div>
                  <div className="flex flex-wrap gap-2">{DOMAINS.map((d, i) => <span key={d.id} className={`tag ${i % 3 === 0 ? 'bg-primary text-primary-foreground' : i % 3 === 1 ? 'bg-accent text-accent-foreground' : ''}`}>{d.name.replace(/\s*\(.*\)/, '')}</span>)}</div>
                </div>
              </div>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-6">
              {[
                ['01', 'Choose a region', 'Pick one or two of twelve regions. Each opens its own corners, so a Games route never asks about invoices.'],
                ['02', 'Get narrower', 'Every answer changes the next question and its options. Pick the features you want, many at a time.'],
                ['03', 'Find, test, build', 'Rules or AI find the ideas, say where to look, and write a build prompt for a coding agent.'],
              ].map(([n, t, d]) => (
                <div key={n} className="bg-card border border-foreground rounded-sm p-6 hover:bg-amber-soft transition-colors">
                  <div className="font-mono-tight text-xs text-accent mb-4">{n}</div>
                  <h3 className="font-display text-xl font-bold">{t}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {screen === 'q' && here && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4"><Rail stations={stations} a={ans} curId={here.s.id} onGo={goStation} total={total} done={done} /></div>
            <div className="lg:col-span-8">
              <Question key={here.q.id} ans={ans} here={here} idx={idx} total={f.length} refEl={stageRef}
                onToggle={toggle} onOther={setOther} onBack={() => step(-1)} onNext={() => step(1)} onReview={() => go('review')} />
            </div>
          </div>
        )}

        {screen === 'review' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4"><Rail stations={stations} a={ans} curId="end" onGo={goStation} total={total} done={done} /></div>
            <div className="lg:col-span-8">
              <div className="eyebrow mb-4">§ 04 · Review</div>
              <h2 ref={stageRef} tabIndex={-1} className="font-display text-4xl md:text-5xl font-black leading-[1.02] text-balance">
                Your route so far.<span className="block italic font-light text-accent">Edit anything, then find ideas.</span>
              </h2>
              <p className="mt-3 text-muted-foreground">{done} of {total} answered. You need at least 12 to continue. Unanswered questions are skipped.</p>
              <div className="mt-8 space-y-8">
                {stations.filter((s) => s.qs.length).map((s) => (
                  <div key={s.id}>
                    <h3 className="font-display text-xl font-bold border-b border-foreground pb-2">{s.domain ? <span className="text-muted-foreground font-normal">{s.domain.name.replace(/\s*\(.*\)/, '')} / </span> : null}{s.title}</h3>
                    {s.qs.map((q) => {
                      const ok = isAns(ans, q.id);
                      return (
                        <div key={q.id} className="grid sm:grid-cols-12 gap-2 sm:gap-4 py-3 border-b border-border items-start">
                          <div className="sm:col-span-5 text-sm text-muted-foreground">{qText(q, ans)}</div>
                          <div className={`sm:col-span-6 text-sm ${ok ? '' : 'text-destructive'}`}>{ok ? listOf(ans, q.id).map((x) => optText(q, x, ans)).join('; ') : 'Not answered'}</div>
                          <button className="link sm:col-span-1 justify-self-start sm:justify-self-end" onClick={() => edit(q.id)}>Edit</button>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                <button className="btn-brutal" disabled={done < 12 || !chosen.length} onClick={() => go('mode')}>Find my ideas<ArrowRight className="h-4 w-4" /></button>
                <button className="btn-outline" onClick={() => go('q')}>Back to questions</button>
                {result && <button className="btn-outline" onClick={() => go('results')}>See last ideas</button>}
              </div>
              {!chosen.length && <p className="mt-3 text-sm text-destructive">Choose at least one region first.</p>}
            </div>
          </div>
        )}

        {screen === 'mode' && (
          <div className="max-w-4xl mx-auto">
            <div className="eyebrow mb-4">§ 04 · Choose a finder</div>
            <h2 ref={stageRef} tabIndex={-1} className="font-display text-4xl md:text-6xl font-black leading-[1] text-balance">
              How should the ideas be found?<span className="block italic font-light text-accent">You decide.</span>
            </h2>
            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-foreground rounded-sm p-6 flex flex-col">
                <div className="grid place-items-center w-12 h-12 rounded-sm bg-accent text-accent-foreground mb-4"><Cpu className="h-5 w-5" /></div>
                <h3 className="font-display text-2xl font-bold">Rule-based</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">Instant and offline. Combines your corner, audience, platform, loop and features with fixed scoring rules. The same answers always give the same ideas. No key, no account.</p>
                <div className="mt-3 flex flex-wrap gap-2"><span className="tag">Free</span><span className="tag">Repeatable</span><span className="tag">No key</span></div>
                <button className="btn-brutal mt-6" onClick={startRules}><Wand2 className="h-4 w-4" />Use rules</button>
              </div>
              <div className="bg-primary text-primary-foreground border border-foreground rounded-sm p-6 flex flex-col shadow-[6px_6px_0_hsl(var(--accent))]">
                <div className="grid place-items-center w-12 h-12 rounded-sm bg-accent text-accent-foreground mb-4"><Sparkles className="h-5 w-5" /></div>
                <h3 className="font-display text-2xl font-bold">AI report</h3>
                <p className="mt-2 text-sm opacity-80 leading-relaxed flex-1">Claude reads all your answers and writes sharper, more surprising ideas, scores them and plans a test for the top three. Takes about a minute.</p>
                <div className="mt-3 flex flex-wrap gap-2"><span className="tag border-primary-foreground/30">Sharper</span><span className="tag border-primary-foreground/30">Needs a key</span></div>
                <label className="mt-4 text-xs eyebrow !text-primary-foreground/70" htmlFor="key">Anthropic API key (optional if the server has one)</label>
                <input id="key" type="password" autoComplete="off" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="sk-ant-..." className="mt-1 h-10 rounded-sm border border-primary-foreground/30 bg-transparent px-3 text-sm placeholder:opacity-50" />
                <p className="mt-1 text-xs opacity-60">Kept in this tab only and sent with the request. Never stored.</p>
                <button className="btn bg-accent text-accent-foreground border-primary-foreground/30 mt-5" onClick={() => startAI(true)}><Sparkles className="h-4 w-4" />Use AI</button>
              </div>
            </div>
            {error && <p className="mt-6 text-destructive">{error}</p>}
            <div className="mt-8"><button className="btn-outline" onClick={() => go('review')}><ArrowLeft className="h-4 w-4" />Back to review</button></div>
          </div>
        )}

        {screen === 'run' && (
          <div className="max-w-2xl mx-auto">
            <div className="eyebrow mb-4">§ 05 · Finding ideas</div>
            <h2 ref={stageRef} tabIndex={-1} className="font-display text-4xl md:text-5xl font-black leading-[1.02]">{error ? 'The finder stopped.' : 'Finding your ideas.'}<span className="block italic font-light text-accent">{error ? 'Nothing finished is lost.' : 'About a minute.'}</span></h2>
            <ol className="mt-8 border-t border-foreground">
              {[['ideas', 'Ideas from your answers'], ['scores', 'Scoring on 8 criteria'], ['details', 'Shortlist and tests']].map(([k, t]) => {
                const s = status[k] || 'pending';
                return <li key={k} className="flex items-center justify-between border-b border-foreground py-4"><span className="font-display text-lg font-bold">{t}</span><span className={`tag ${s === 'done' ? 'bg-primary text-primary-foreground' : s === 'running' ? 'bg-accent text-accent-foreground' : s === 'error' ? 'border-destructive text-destructive' : ''}`}>{s === 'pending' ? 'Waiting' : s === 'running' ? 'Working' : s === 'done' ? 'Done' : 'Stopped'}</span></li>;
              })}
            </ol>
            {error && (
              <div className="mt-6">
                <p className="text-destructive">{error}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button className="btn-brutal" onClick={() => startAI(false)}>Try again from here</button>
                  <button className="btn-outline" onClick={startRules}>Use rule-based instead</button>
                  <button className="btn-outline" onClick={() => go('mode')}>Change key</button>
                </div>
              </div>
            )}
          </div>
        )}

        {screen === 'results' && result && (
          <Results r={result} prompts={prompts} busy={busy} aiReady={aiReady}
            onPrompt={makePrompt}
            onCopyPrompt={(b) => doCopy(b.text, 'Prompt')}
            onDownloadPrompt={(b, i) => download(`build-prompt-${slug(i.title)}.md`, b.text)}
            onCopyMD={() => doCopy(md(), 'Markdown')}
            onDownloadMD={() => download('mindmap-report.md', md())}
            onDownloadPDF={() => savePDF(md(), 'mindmap-report.pdf')}
            onEdit={() => go('review')}
            onRerun={() => (result.mode === 'ai' ? startAI(true) : startRules())}
            onMode={() => go('mode')} />
        )}
      </main>

      {showTools && (
        <div className="container pb-10 flex flex-wrap gap-5 items-center">
          <button className="link" onClick={() => doCopy(answersText(ans) || 'No answers yet.', 'Answers')}><Copy className="inline h-3 w-3 mr-1" />Copy answers</button>
          {result && <button className="link" onClick={() => doCopy(md(), 'Markdown')}>Copy report as Markdown</button>}
          <button className="link" onClick={reset}>{confirm ? 'Click again to erase everything' : 'Start over'}</button>
        </div>
      )}

      <footer className="border-t border-border">
        <div className="container py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Logo size={24} /><span className="opacity-70">A map for finding what to build.</span></span>
          <span className="text-xs font-mono-tight uppercase tracking-widest">Answers stay in this browser</span>
        </div>
      </footer>

      <div role="status" aria-live="polite" className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-sm border border-foreground bg-foreground text-background px-4 py-2 text-sm transition-opacity ${toast ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>{toast}</div>
    </div>
  );
}

function Question({ ans, here, idx, total, refEl, onToggle, onOther, onBack, onNext, onReview }: {
  ans: Answers; here: { q: ReturnType<typeof flat>[number]['q']; s: ReturnType<typeof route>[number] }; idx: number; total: number;
  refEl: React.RefObject<HTMLHeadingElement>;
  onToggle: (id: string, max: number, opt: string) => void; onOther: (id: string, t: string) => void;
  onBack: () => void; onNext: () => void; onReview: () => void;
}) {
  const { q, s } = here;
  const opts = qOpts(q, ans);
  const have = picksOf(ans, q.id);
  const pos = s.qs.indexOf(q) + 1;
  const last = idx === total - 1;
  const crumbs = s.domain ? [s.domain.name.replace(/\s*\(.*\)/, ''), s.title] : [s.title];
  const isRegion = q.k === 'regions';
  const a = ans[q.id];
  const added = opts.length - q.o.length;
  return (
    <div>
      <ul className="flex flex-wrap gap-2 mb-5" aria-label="Where you are on the map">
        {crumbs.map((c, i) => <li key={c} className={`tag ${i === 0 && s.domain ? (s.line === 'b' ? 'bg-accent text-accent-foreground' : 'bg-primary text-primary-foreground') : ''}`}>{c}</li>)}
      </ul>
      <div className="eyebrow mb-3">§ {s.tag} · Question {pos} of {s.qs.length}</div>
      <h2 ref={refEl} tabIndex={-1} className="font-display text-3xl md:text-5xl font-black leading-[1.05] text-balance">{qText(q, ans)}</h2>
      {q.note && <p className="mt-3 text-muted-foreground max-w-2xl">{q.note}</p>}
      <p className="mt-3 eyebrow" aria-live="polite">{q.max === 1 ? 'Pick one.' : `Pick up to ${q.max}.`}{q.max > 1 && have.length ? ` ${have.length} picked.` : ''}{added > 0 ? ` ${added} extra options appeared from your earlier answers.` : ''}</p>
      <div className="mt-5 flex flex-wrap gap-2.5" role="group" aria-label="Options">
        {opts.map((o) => (
          <button key={o} type="button" className="chip" aria-pressed={have.includes(o)} onClick={() => onToggle(q.id, q.max, o)}>
            {have.includes(o) && <Check className="h-4 w-4 shrink-0" />}{optText(q, o, ans)}
          </button>
        ))}
      </div>
      {!q.noOther && (
        <div className="mt-5 max-w-xl">
          <label htmlFor="other" className="eyebrow">Or write your own</label>
          <input id="other" type="text" value={a?.other || ''} onChange={(e) => onOther(q.id, e.target.value)} placeholder="Other"
            className="mt-1 w-full h-11 rounded-sm border border-foreground bg-card px-3 text-sm" />
        </div>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <button className="btn-outline" onClick={onBack} disabled={idx === 0}><ArrowLeft className="h-4 w-4" />Back</button>
        <button className="btn-brutal" onClick={onNext}>{last ? 'Review route' : isAns(ans, q.id) ? 'Next' : 'Skip'}<ArrowRight className="h-4 w-4" /></button>
        <button className="btn-outline" onClick={onReview}><Pencil className="h-4 w-4" />Review route</button>
      </div>
    </div>
  );
}
