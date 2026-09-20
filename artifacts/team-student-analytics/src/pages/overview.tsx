import { useMemo, useState } from 'react';
import { FileText, MoveUpRight, Sparkles } from 'lucide-react';
import { useGenerateStudentReport, useGetAnalyticsOverview, useListStudents } from '@workspace/api-client-react';
import type { AiReport, Student } from '@workspace/api-client-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, Radar, RadarChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { EmptyState, ErrorState, LoadingState, PageIntro, Panel, ScoreBar, StatCard } from '@/components/analytics-ui';

export default function OverviewPage() {
  const overview = useGetAnalyticsOverview({ query: { queryKey: ['/api/analytics/overview'], staleTime: 60_000 } });
  const students = useListStudents({ query: { queryKey: ['/api/students'], staleTime: 60_000 } });
  const reportMutation = useGenerateStudentReport();
  const [report, setReport] = useState<AiReport | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [scoreChart, setScoreChart] = useState<'bar' | 'area' | 'pie'>('bar');
  const analytics = overview.data;
  const sortedScores = useMemo(() => [...(analytics?.studentScores ?? [])].sort((a, b) => b.score - a.score), [analytics?.studentScores]);

  if (overview.isLoading) return <LoadingState />;
  if (overview.isError || !analytics) return <ErrorState onRetry={() => overview.refetch()} message="The overview is taking a moment to respond." />;

  const openReport = (student: Student) => {
    setSelectedId(student.id);
    reportMutation.mutate({ data: { name: student.name, subject: student.subject, score: student.score } }, { onSuccess: setReport });
  };

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageIntro eyebrow="Individual performance · Tuesday review" title="See the signal, not just the score." description="A focused read on how each learner is moving through the current review cycle." action={<div className="hidden items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-[hsl(168_51%_42%)]" /> Live classroom data</div>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Learners tracked" value={String(analytics.totalStudents)} accent="bg-primary" note="active records" index={0} />
        <StatCard label="Overall average" value={`${analytics.overallAverage.toFixed(1)} / 10`} accent="bg-[hsl(168_51%_42%)]" note="across all subjects" index={1} />
        <StatCard label="Highest score" value={`${analytics.topScore.toFixed(1)} / 10`} accent="bg-accent" note="current best mark" index={2} />
        <StatCard label="Subjects covered" value={String(analytics.subjectAverages.length)} accent="bg-[hsl(198_64%_48%)]" note="in this workspace" index={3} />
      </div>

      {analytics.totalStudents === 0 ? (
        <div className="mt-6"><EmptyState title="Your review board is ready." description="Add the first student record from Manage records to start seeing performance patterns." /></div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
            <Panel
              title="Scoreboard"
              action={
                <label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  View
                  <select
                    aria-label="Scoreboard chart type"
                    data-testid="select-scoreboard-chart"
                    value={scoreChart}
                    onChange={(event) => setScoreChart(event.target.value as 'bar' | 'area' | 'pie')}
                    className="rounded-lg border border-border bg-secondary/60 px-2 py-1.5 font-sans text-xs font-semibold normal-case tracking-normal text-foreground outline-none transition-colors focus:border-primary"
                  >
                    <option value="bar">Bars</option>
                    <option value="area">Area</option>
                    <option value="pie">Pie</option>
                  </select>
                </label>
              }
            >
              <div className="h-[315px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {scoreChart === 'pie' ? (
                    <PieChart>
                      <Pie data={analytics.subjectAverages} dataKey="average" nameKey="subject" cx="50%" cy="45%" innerRadius={58} outerRadius={100} paddingAngle={3}>
                        {analytics.subjectAverages.map((entry, index) => <Cell key={entry.subject} fill={['hsl(168 51% 42%)', 'hsl(229 55% 32%)', 'hsl(42 95% 65%)', 'hsl(198 64% 48%)'][index % 4]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(222 23% 87%)', fontSize: 12 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  ) : scoreChart === 'area' ? (
                    <AreaChart data={sortedScores} margin={{ top: 8, right: 8, bottom: 5, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="hsl(222 23% 87% / .8)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ stroke: 'hsl(168 51% 42% / .4)' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(222 23% 87%)', fontSize: 12 }} />
                      <Area type="monotone" dataKey="score" name="Score" stroke="hsl(168 51% 42%)" fill="hsl(168 51% 42% / .18)" strokeWidth={2} />
                    </AreaChart>
                  ) : (
                    <BarChart data={sortedScores} margin={{ top: 8, right: 8, bottom: 5, left: -18 }}>
                      <CartesianGrid vertical={false} stroke="hsl(222 23% 87% / .8)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} interval={0} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: 'hsl(222 15% 47%)' }} axisLine={false} tickLine={false} />
                      <Tooltip cursor={{ fill: 'hsl(220 31% 92% / .6)' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(222 23% 87%)', fontSize: 12 }} />
                      <Bar dataKey="score" name="Score" radius={[6, 6, 0, 0]} maxBarSize={38}>
                        {sortedScores.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={entry.score >= 8 ? 'hsl(168 51% 42%)' : entry.score >= 6 ? 'hsl(229 55% 32%)' : 'hsl(42 95% 65%)'} />)}
                      </Bar>
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-border pt-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-[hsl(168_51%_42%)]" /> On track · 8+</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Building · 6–7.9</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-accent" /> Needs focus · under 6</span>
              </div>
            </Panel>
            <Panel title="Subject balance" meta="average / 10">
              <div className="h-[315px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analytics.radarData} outerRadius="70%">
                    <PolarGrid stroke="hsl(222 23% 87%)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'hsl(222 15% 47%)' }} />
                    <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="Average" dataKey="average" stroke="hsl(168 51% 42%)" fill="hsl(168 51% 42% / .24)" strokeWidth={2} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(222 23% 87%)', fontSize: 12 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Panel>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.1fr]">
            <Panel title="Subject pulse" meta="where to lean in">
              <div className="space-y-5">
                {analytics.subjectAverages.map((subject, index) => (
                  <div key={subject.subject} data-testid={`row-subject-${index}`}>
                    <div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-foreground">{subject.subject}</span><span className="font-mono text-xs text-muted-foreground">{subject.average.toFixed(1)} <span className="text-muted-foreground/60">· {subject.count} learners</span></span></div>
                    <ScoreBar score={subject.average} color={index % 2 ? 'bg-[hsl(168_51%_42%)]' : 'bg-primary'} />
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Learner moments" meta="click a row for an AI read">
              <div className="divide-y divide-border">
                {(students.data ?? []).slice().sort((a, b) => b.score - a.score).slice(0, 6).map((student) => (
                  <div key={student.id} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0" data-testid={`row-learner-${student.id}`}>
                    <div className={`grid size-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${student.score >= 8 ? 'bg-[hsl(168_51%_42%/.13)] text-[hsl(168_51%_42%)]' : 'bg-secondary text-primary'}`}>{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div>
                    <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{student.name}</div><div className="text-xs text-muted-foreground">{student.subject}</div></div>
                    <div className="w-20"><ScoreBar score={student.score} color={student.score >= 8 ? 'bg-[hsl(168_51%_42%)]' : 'bg-primary'} /></div>
                    <span className="w-8 text-right font-mono text-xs font-medium">{student.score.toFixed(1)}</span>
                    <button type="button" onClick={() => openReport(student)} data-testid={`button-report-student-${student.id}`} aria-label={`Generate report for ${student.name}`} className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent/20 hover:text-primary disabled:opacity-50" disabled={reportMutation.isPending && selectedId === student.id}><FileText className="size-4" /></button>
                  </div>
                ))}
                {(students.data ?? []).length === 0 && <EmptyState title="No learner moments yet" description="Student records will appear here once added." />}
              </div>
            </Panel>
          </div>

          {reportMutation.isPending && <div className="mt-6 rounded-[22px] border border-primary/20 bg-primary/[.04] p-5 text-sm text-muted-foreground animate-fade"><Sparkles className="mr-2 inline size-4 text-primary" /> Reading this learner's pattern…</div>}
          {report && !reportMutation.isPending && <ReportCard report={report} />}
        </>
      )}
    </div>
  );
}

function ReportCard({ report }: { report: AiReport }) {
  return <Panel title={report.headline} meta={`AI read · ${new Date(report.generatedAt).toLocaleDateString()}`} className="mt-6 border-primary/20 bg-primary/[.025]"><div className="grid gap-6 md:grid-cols-[1fr_1.2fr]"><p className="text-sm leading-7 text-muted-foreground">{report.summary}</p><div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary"><MoveUpRight className="size-3.5" /> Suggested next moves</div><ul className="space-y-2.5">{report.recommendations.map((recommendation, index) => <li key={index} className="flex gap-2.5 text-sm leading-6 text-foreground"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />{recommendation}</li>)}</ul></div></div></Panel>;
}