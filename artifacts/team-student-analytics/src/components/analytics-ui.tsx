import { AlertCircle, ArrowUpRight, RefreshCw } from 'lucide-react';

export function PageIntro({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-primary">{eyebrow}</div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-[38px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, accent, note, index = 0 }: { label: string; value: string; accent: string; note: string; index?: number }) {
  return (
    <div className="animate-rise relative overflow-hidden rounded-[20px] border border-border bg-card p-5 shadow-[0_8px_22px_hsl(229_35%_18%/.04)]" style={{ animationDelay: `${index * 70}ms` }}>
      <div className={`absolute inset-y-0 left-0 w-1 ${accent}`} />
      <div className="font-mono text-[10px] uppercase tracking-[0.17em] text-muted-foreground">{label}</div>
      <div className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">{value}</div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><ArrowUpRight className="size-3 text-[hsl(168_51%_42%)]" />{note}</div>
    </div>
  );
}

export function Panel({ title, meta, action, children, className = '' }: { title: string; meta?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-[22px] border border-border bg-card p-5 shadow-[0_8px_22px_hsl(229_35%_18%/.035)] sm:p-6 ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="font-display text-[17px] font-bold tracking-tight text-foreground">{title}</h2>
        {action ?? (meta && <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{meta}</span>)}
      </div>
      {children}
    </section>
  );
}

export function LoadingState({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-4" data-testid="state-loading">
      <div className="shimmer h-28 rounded-[22px]" />
      <div className="grid gap-4 sm:grid-cols-3"><div className="shimmer h-24 rounded-[20px]" /><div className="shimmer h-24 rounded-[20px]" /><div className="shimmer h-24 rounded-[20px]" /></div>
      <div className="shimmer h-72 rounded-[22px]" />
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="shimmer h-10 rounded-xl" />)}
    </div>
  );
}

export function ErrorState({ message = 'We could not load this view.', onRetry }: { message?: string; onRetry: () => void }) {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[hsl(var(--destructive)/.35)] bg-card px-5 text-center" data-testid="state-error">
      <div className="mb-4 grid size-12 place-items-center rounded-2xl bg-[hsl(var(--destructive)/.1)] text-destructive"><AlertCircle className="size-5" /></div>
      <h2 className="font-display text-lg font-bold">A small detour</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{message}</p>
      <button type="button" data-testid="button-retry" onClick={onRetry} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:-translate-y-0.5">
        <RefreshCw className="size-4" /> Try again
      </button>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[18px] border border-dashed border-border bg-secondary/45 px-5 text-center" data-testid="state-empty">
      <div className="mb-4 grid size-11 place-items-center rounded-2xl bg-accent/30 font-display text-lg font-bold text-primary">∅</div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ScoreBar({ score, max = 10, color = 'bg-primary' }: { score: number; max?: number; color?: string }) {
  return <div className="h-2 w-full overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, (score / max) * 100)}%` }} /></div>;
}

export function formatDate(date?: string) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}