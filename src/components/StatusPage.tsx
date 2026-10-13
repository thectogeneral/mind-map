import Logo from './Logo';

/** A route that stops short: used by the 404 and error pages. */
function DeadEnd({ broken }: { broken: boolean }) {
  const ink = 'hsl(var(--foreground))';
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label={broken ? 'A route that has broken off' : 'A route that leads nowhere'} className="w-full max-w-sm">
      <path d="M16 118 H100 V70 H190 V32" fill="none" stroke={ink} strokeWidth="5" strokeLinejoin="round" />
      <path d={broken ? 'M190 32 L214 18' : 'M190 32 V16 H262 V92 H292'} fill="none" stroke="hsl(var(--accent))" strokeWidth="5" strokeLinejoin="round" strokeDasharray="2 11" strokeLinecap="round" />
      <circle cx="16" cy="118" r="9" fill="hsl(var(--primary))" stroke={ink} strokeWidth="2.5" />
      <circle cx="100" cy="70" r="6" fill="hsl(var(--card))" stroke={ink} strokeWidth="2.5" />
      <circle cx="190" cy="32" r="9" fill="hsl(var(--accent))" stroke={ink} strokeWidth="2.5" />
      {broken
        ? <path d="M208 8 l12 12 M220 8 l-12 12" stroke="hsl(var(--destructive))" strokeWidth="4" strokeLinecap="round" />
        : <g><circle cx="292" cy="92" r="13" fill="hsl(var(--card))" stroke={ink} strokeWidth="2.5" strokeDasharray="4 4" /><text x="292" y="98" textAnchor="middle" fontSize="16" fontWeight="700" fill={ink}>?</text></g>}
    </svg>
  );
}

interface Props {
  eyebrow: string;
  title: string;
  accent: string;
  broken?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
  note?: React.ReactNode;
}

/** Shared frame for the 404, error and global error pages. Uses plain anchors so it also works when the app itself has failed. */
export default function StatusPage({ eyebrow, title, accent, broken = false, children, actions, note }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/80">
        <div className="container flex h-16 items-center">
          <a href="/" className="flex items-center gap-2" aria-label="MindMap, home">
            <Logo />
            <span className="font-display text-lg font-semibold tracking-tight">Mind<span className="text-accent">Map</span></span>
          </a>
        </div>
      </header>
      <main id="main" className="container flex-1 py-12 md:py-20 relative">
        <div className="absolute inset-0 grain opacity-60 pointer-events-none" />
        <div className="relative grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-6 flex items-center gap-3"><span className="h-px w-8 bg-foreground" />{eyebrow}</div>
            <h1 className="font-display text-5xl md:text-7xl leading-[0.95] font-black text-balance">
              {title}
              <span className="block italic font-light text-accent">{accent}</span>
            </h1>
            <div className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl text-balance">{children}</div>
            {actions && <div className="mt-8 flex flex-wrap gap-4">{actions}</div>}
            {note && <p className="mt-8 text-sm text-muted-foreground max-w-xl">{note}</p>}
          </div>
          <div className="lg:col-span-5 flex lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-4 bg-accent/20 rounded-sm -rotate-2" />
              <div className="relative border border-foreground rounded-sm bg-card p-6 flex justify-center"><DeadEnd broken={broken} /></div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-border">
        <div className="container py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Logo size={24} /><span className="opacity-70">A map for finding what to build.</span></span>
          <span className="text-xs font-mono-tight uppercase tracking-widest">Answers stay in this browser</span>
        </div>
      </footer>
    </div>
  );
}
