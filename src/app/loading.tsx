import Logo from '@/components/Logo';

export default function Loading() {
  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="rounded-sm pulse"><Logo size={48} /></span>
        <span className="eyebrow">Loading the map</span>
      </div>
    </div>
  );
}
