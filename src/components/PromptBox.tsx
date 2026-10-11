'use client';
import { useState } from 'react';
import { Copy, Download, RotateCcw, Wand2 } from 'lucide-react';
import { Built } from '@/lib/report';

export type Mode = 'rules' | 'ai';

interface BoxProps {
  mode: Mode;
  onMode: (m: Mode) => void;
  built?: Built;
  busy: boolean;
  aiReady: boolean;
  onGenerate: (m: Mode) => void;
  onCopy: (b: Built) => void;
  onDownload: (b: Built) => void;
}

/** Mode switch, generate button, preview and copy/download/regenerate controls for one prompt. */
export function PromptBox({ mode, onMode, built, busy, aiReady, onGenerate, onCopy, onDownload }: BoxProps) {
  const blocked = busy || (mode === 'ai' && !aiReady);
  return (
    <div>
      <div className="inline-flex border border-foreground rounded-sm overflow-hidden mb-4" role="group" aria-label="Prompt source">
        {(['rules', 'ai'] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => onMode(m)}
            className={`px-4 py-2 text-xs font-mono-tight uppercase tracking-widest ${mode === m ? 'bg-primary text-primary-foreground' : 'bg-card hover:bg-secondary'}`}>
            {m === 'rules' ? 'Template, no AI' : 'AI-written'}
          </button>
        ))}
      </div>
      {!built && (
        <div>
          <button className="btn-brutal" disabled={blocked} onClick={() => onGenerate(mode)}>
            <Wand2 className="h-4 w-4" />{busy ? 'Writing...' : mode === 'rules' ? 'Fill the template' : 'Write with AI'}
          </button>
          {mode === 'ai' && !aiReady && <p className="mt-3 text-sm">AI-written prompts need an API key. Add one on the finder step, or use the template.</p>}
        </div>
      )}
      {built && (
        <div>
          <pre className="whitespace-pre-wrap break-words text-[13px] leading-relaxed bg-card border border-foreground rounded-sm p-4 max-h-[28rem] overflow-y-auto font-mono-tight">{built.text}</pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <button className="btn-brutal" onClick={() => onCopy(built)}><Copy className="h-4 w-4" />Copy prompt</button>
            <button className="btn-outline" onClick={() => onDownload(built)}><Download className="h-4 w-4" />Download .md</button>
            <button className="btn-outline" disabled={blocked} onClick={() => onGenerate(mode)}><RotateCcw className="h-4 w-4" />Regenerate</button>
          </div>
        </div>
      )}
    </div>
  );
}

interface RouteProps {
  prompts: Built[];
  busy: string | null;
  aiReady: boolean;
  onGenerate: (m: Mode) => void;
  onCopy: (b: Built) => void;
  onDownload: (b: Built) => void;
  help: string;
}

/** The route-wide "Ideas and refinement" prompt, built from all answers. */
export function RoutePrompt({ prompts, busy, aiReady, onGenerate, onCopy, onDownload, help }: RouteProps) {
  const [mode, setMode] = useState<Mode>('rules');
  const built = prompts.find((b) => b.ideaId === '_route' && b.kind === 'ideas' && b.mode === mode);
  return (
    <details className="border border-foreground rounded-sm bg-amber-soft group">
      <summary className="flex items-center justify-between cursor-pointer list-none px-5 md:px-7 py-4 font-display text-lg font-bold">
        <span>Ideas and refinement prompt<span className="ml-2 text-sm font-normal text-muted-foreground">for any AI assistant</span></span>
        <span className="text-accent text-xl group-open:rotate-45 transition-transform">+</span>
      </summary>
      <div className="px-5 md:px-7 pb-6">
        <p className="text-sm mb-4 max-w-2xl">{help}</p>
        <PromptBox mode={mode} onMode={setMode} built={built} busy={busy === `_route:${mode}:ideas`} aiReady={aiReady}
          onGenerate={onGenerate} onCopy={onCopy} onDownload={onDownload} />
      </div>
    </details>
  );
}
