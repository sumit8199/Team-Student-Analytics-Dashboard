import { useState } from 'react';
import { BrainCircuit, CheckCircle2, Sparkles, Users } from 'lucide-react';
import { useGenerateTeamReport, useGetTeamAnalytics } from '@workspace/api-client-react';
import type { AiReport } from '@workspace/api-client-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, ErrorState, LoadingState, PageIntro, Panel, ScoreBar, StatCard } from '@/components/analytics-ui';

export default function TeamPage() {
  const team = useGetTeamAnalytics({ query: { queryKey: ['/api/analytics/team'], staleTime: 60_000 } });
  const reportMutation = useGenerateTeamReport();
  const [report, setReport] = useState<AiReport | null>(null);
  const analytics = team.data;

  if (team.isLoading) return <LoadingState />;
  if (team.isError || !analytics) return <ErrorState onRetry={() => team.refetch()} message="The team view could not find its footing." />;
  const generateReport = () => reportMutation.mutate({ data: { groupAverage: analytics.groupAverage, totalContributors: analytics.totalContributors, subjectAverages: analytics.subjectAverages, memberAverages: analytics.memberAverages } }, { onSuccess: setReport });
  const heatSubjects = analytics.heatmap.length ? Object.keys(analytics.heatmap[0].subjects) : [];

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageIntro eyebrow="Team performance · shared momentum" title="How is the group learning?" description="A wider lens for team leads: find the strengths to amplify and the friction worth addressing next." action={<button type="button" data-testid="button-generate-team-report" onClick={generateReport} disabled={reportMutation.isPending || analytics.totalContributors === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_18px_hsl(229_55%_32%/.17)] transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"><Sparkles className="size-4" /> {reportMutation.isPending ? 'Reading the group…' : 'Generate AI report'}</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Group average" value={`${analytics.groupAverage.toFixed(1)} / 10`} accent="bg-primary" note="across all contributions" index={0} />
        <StatCard label="Contributors" value={String(analytics.totalContributors)} accent="bg-[hsl(168_51%_42%)]" note="active learners" index={1} />
        <StatCard label="Strongest subject" value={analytics.subjectAverages.length ? analytics.subjectAverages.slice().sort((a, b) => b.average - a.average)[0].subject : '—'} accent="bg-accent" note={analytics.subjectAverages.length ? `${analytics.subjectAverages.slice().sort((a, b) => b.average - a.average)[0].average.toFixed(1)} average` : 'add records to see'} index={2} />
      </div>
      {analytics.totalContributors === 0 ? <div className="mt-6"><EmptyState title="The team canvas is waiting." description="Once student records are added, this view will surface group patterns and an AI-ready brief." /></div> : <>
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <Panel title="Member momentum" meta="average score">
            <div className="h-[320px] w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.memberAverages} layout="vertical" margin={{ top: 5, right: 16, left: 8, bottom: 5 }}><CartesianGrid horizontal={false} stroke="hsl(222 23% 87% / .8)" /><XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(222 23% 87%)', fontSize: 12 }} /><Bar dataKey="average" name="Average" radius={[0, 6, 6, 0]} maxBarSize={24}>{analytics.memberAverages.map((member, index) => <Cell key={`${member.name}-${index}`} fill={member.average >= analytics.groupAverage ? 'hsl(168 51% 42%)' : 'hsl(229 55% 32%)'} />)}</Bar></BarChart></ResponsiveContainer></div>
          </Panel>
          <Panel title="Subject pulse" meta="group average">
            <div className="space-y-5">{analytics.subjectAverages.map((subject, index) => <div key={subject.subject} data-testid={`row-team-subject-${index}`}><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold">{subject.subject}</span><span className="font-mono text-xs text-muted-foreground">{subject.average.toFixed(1)}</span></div><ScoreBar score={subject.average} color={subject.average >= analytics.groupAverage ? 'bg-[hsl(168_51%_42%)]' : 'bg-primary'} /></div>)}</div>
            <div className="mt-7 rounded-xl bg-secondary/65 p-3.5 text-xs leading-5 text-muted-foreground"><Users className="mr-1.5 inline size-3.5 text-primary" /> {analytics.totalContributors} contributors are shaping this team read.</div>
          </Panel>
        </div>
        {heatSubjects.length > 0 && <Panel title="Coverage map" meta="subject by member" className="mt-6"><div className="overflow-x-auto"><table className="w-full min-w-[580px] border-separate border-spacing-y-1 text-left"><thead><tr className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><th className="px-3 pb-2 font-medium">Member</th>{heatSubjects.map((subject) => <th key={subject} className="px-3 pb-2 font-medium">{subject}</th>)}</tr></thead><tbody>{analytics.heatmap.map((row, index) => <tr key={`${row.name}-${index}`} data-testid={`row-heatmap-${index}`}><td className="rounded-l-xl bg-secondary/50 px-3 py-2.5 text-sm font-semibold">{row.name}</td>{heatSubjects.map((subject) => { const value = row.subjects[subject] ?? 0; return <td key={subject} className="bg-secondary/50 px-3 py-2.5"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg font-mono text-[10px] font-medium" style={{ backgroundColor: `hsl(168 51% 42% / ${Math.max(.1, value / 12)})`, color: value > 6 ? 'white' : 'hsl(229 31% 18%)' }}>{value.toFixed(1)}</span></div></td>; })}</tr>)}</tbody></table></div></Panel>}
        {reportMutation.isPending && <div className="mt-6 rounded-[22px] border border-primary/20 bg-primary/[.04] p-5 text-sm text-muted-foreground animate-fade"><BrainCircuit className="mr-2 inline size-4 text-primary" /> Comparing patterns across the team…</div>}
        {report && !reportMutation.isPending && <Panel title={report.headline} meta={`AI report · ${new Date(report.generatedAt).toLocaleDateString()}`} className="mt-6 border-primary/20 bg-primary/[.025]"><div className="grid gap-7 lg:grid-cols-[1fr_1fr]"><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary"><CheckCircle2 className="size-4" /> Readout</div><p className="text-sm leading-7 text-muted-foreground">{report.summary}</p></div><div><div className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-primary">Recommended focus</div><ul className="space-y-3">{report.recommendations.map((item, index) => <li key={index} className="flex gap-2.5 text-sm leading-6"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{item}</li>)}</ul></div></div></Panel>}
      </>}
    </div>
  );
}