import { AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[60dvh] w-full items-center justify-center">
      <div className="w-full max-w-md rounded-[24px] border border-border bg-card p-7 shadow-[0_8px_22px_hsl(229_35%_18%/.05)]">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-accent/25 text-primary"><AlertCircle className="size-5" /></div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">Off the map</div>
            <h1 className="font-display text-2xl font-bold">This page isn’t in the review.</h1>
          </div>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">Use the workspace navigation to return to a performance view.</p>
      </div>
    </div>
  );
}
