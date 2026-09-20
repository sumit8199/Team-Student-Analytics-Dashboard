import { useState } from 'react';
import { Activity, BarChart3, BookOpen, ChevronRight, ClipboardList, Menu, UsersRound, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useHealthCheck } from '@workspace/api-client-react';

type AppShellProps = { children: React.ReactNode };

const navItems = [
  { href: '/', label: 'Overview', detail: 'Daily pulse', icon: BarChart3 },
  { href: '/manage', label: 'Manage records', detail: 'Student performance', icon: ClipboardList },
  { href: '/team', label: 'Team view', detail: 'Group momentum', icon: UsersRound },
];

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: health } = useHealthCheck({ query: { queryKey: ['/api/healthz'], staleTime: 30_000 } });

  return (
    <div className="min-h-[100dvh] bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex items-center gap-3 border-b border-sidebar-border px-7 py-7">
          <div className="grid size-10 place-items-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_hsl(var(--sidebar-primary)/.2)]">
            <BookOpen className="size-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-[17px] font-bold tracking-tight text-white">Fieldnotes</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-sidebar-foreground/55">Learning ops</div>
          </div>
        </div>

        <div className="px-4 pt-8">
          <div className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/40">Workspace</div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const active = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                  className={`group flex items-center gap-3 rounded-2xl px-3 py-3.5 transition-colors ${active ? 'bg-sidebar-accent text-white' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-white'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon className={`size-[18px] ${active ? 'text-sidebar-primary' : 'text-sidebar-foreground/45 group-hover:text-sidebar-primary'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] text-sidebar-foreground/40">{item.detail}</span>
                  </span>
                  {active && <ChevronRight className="size-4 text-sidebar-primary" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto space-y-4 p-5">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/55 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-sidebar-foreground/50">System pulse</span>
              <Activity className={`size-3.5 ${health?.status === 'ok' ? 'text-sidebar-primary' : 'text-sidebar-foreground/45'}`} />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/75">
              <span className={`size-1.5 rounded-full ${health?.status === 'ok' ? 'bg-sidebar-primary' : 'bg-sidebar-foreground/40'}`} />
              {health?.status === 'ok' ? 'Synced just now' : 'Checking connection'}
            </div>
          </div>
          <div className="flex items-center gap-3 px-2">
            <div className="grid size-9 place-items-center rounded-full bg-[hsl(168_51%_42%)] text-xs font-bold text-white">MR</div>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">Maya Rivera</div>
              <div className="font-mono text-[10px] text-sidebar-foreground/45">Program lead</div>
            </div>
          </div>
        </div>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-sidebar lg:hidden">
          <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-5">
            <div className="font-display text-lg font-bold text-white">Fieldnotes</div>
            <button type="button" aria-label="Close navigation" data-testid="button-close-navigation" onClick={() => setMenuOpen(false)} className="rounded-xl p-2 text-sidebar-foreground hover:bg-sidebar-accent">
              <X className="size-5" />
            </button>
          </div>
          <nav className="space-y-2 p-5 pt-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-2xl bg-sidebar-accent/70 px-4 py-4 text-white">
                  <Icon className="size-5 text-sidebar-primary" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="lg:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md sm:px-8 lg:px-11">
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setMenuOpen(true)} className="rounded-xl p-2 text-muted-foreground hover:bg-secondary lg:hidden">
              <Menu className="size-5" />
            </button>
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Tue · 14 May 2024</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="hidden text-xs text-muted-foreground sm:inline">Spring review cycle</span>
            <span className="size-2 rounded-full bg-[hsl(168_51%_42%)] shadow-[0_0_0_4px_hsl(168_51%_42%/.12)]" />
          </div>
        </header>
        <main className="dashboard-grid min-h-[calc(100dvh-72px)] px-5 py-8 sm:px-8 lg:px-11 lg:py-10">{children}</main>
      </div>
    </div>
  );
}