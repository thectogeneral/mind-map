'use client';
import { useEffect } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <StatusPage
      eyebrow="§ 500 · The route broke"
      title="Something went wrong."
      accent="That one is on us."
      broken
      actions={
        <>
          <button type="button" className="btn-brutal h-12 px-6" onClick={reset}><RotateCcw className="h-4 w-4" />Try again</button>
          <a href="/" className="btn-outline h-12 px-6">Back to the start<ArrowRight className="h-4 w-4" /></a>
        </>
      }
      note={<>Your answers are saved in this browser, so you can pick up where you left off.{error.digest ? <> Reference: <span className="font-mono-tight">{error.digest}</span></> : null}</>}
    >
      The page hit an unexpected error. Trying again often fixes it. If it keeps happening, go back to the start and resume from there.
    </StatusPage>
  );
}
