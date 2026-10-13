'use client';
import { useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import StatusPage from '@/components/StatusPage';
import './globals.css';

/** Replaces the whole layout when the root layout itself fails, so it renders its own html and body. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <html lang="en">
      <head>
        <title>Something went wrong | MindMap</title>
        <meta name="robots" content="noindex" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;0,9..144,900;1,9..144,300&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <StatusPage
          eyebrow="§ 500 · The whole map failed"
          title="MindMap could not load."
          accent="Please try again."
          broken
          actions={
            <>
              <button type="button" className="btn-brutal h-12 px-6" onClick={reset}><RotateCcw className="h-4 w-4" />Try again</button>
              <a href="/" className="btn-outline h-12 px-6">Reload the start page<ArrowRight className="h-4 w-4" /></a>
            </>
          }
          note={<>Your answers are saved in this browser.{error.digest ? <> Reference: <span className="font-mono-tight">{error.digest}</span></> : null}</>}
        >
          A serious error stopped the site from loading. It is usually temporary.
        </StatusPage>
      </body>
    </html>
  );
}
