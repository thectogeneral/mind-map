import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import StatusPage from '@/components/StatusPage';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <StatusPage
      eyebrow="§ 404 · Off the map"
      title="This route does not exist."
      accent="Let's get you back on it."
      actions={<Link href="/" className="btn-brutal h-12 px-6">Back to the start<ArrowRight className="h-4 w-4" /></Link>}
      note="If you followed a link to get here, the page may have moved. Your answers are saved in this browser, so nothing is lost."
    >
      The address you opened is not part of MindMap. The questionnaire, the map and your results all live on the start page.
    </StatusPage>
  );
}
