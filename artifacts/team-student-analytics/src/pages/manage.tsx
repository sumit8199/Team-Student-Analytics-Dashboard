import { useMemo, useState } from 'react';
import { Check, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetAnalyticsOverviewQueryKey, getGetTeamAnalyticsQueryKey, getListStudentsQueryKey, useCreateStudent, useDeleteStudent, useListStudents, useUpdateStudent } from '@workspace/api-client-react';
import type { Student } from '@workspace/api-client-react';
import { EmptyState, ErrorState, LoadingState, PageIntro, Panel, ScoreBar, formatDate } from '@/components/analytics-ui';

type FormState = { name: string; subject: string; score: string };
const emptyForm: FormState = { name: '', subject: '', score: '' };

export default function ManagePage() {
  const queryClient = useQueryClient();
  const students = useListStudents({ query: { queryKey: getListStudentsQueryKey(), staleTime: 30_000 } });
  const createStudent = useCreateStudent();
  const updateStudent = useUpdateStudent();
  const deleteStudent = useDeleteStudent();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState('');
  const [confirming, setConfirming] = useState<Student | null>(null);

  const filtered = useMemo(() => (students.data ?? []).filter((student) => `${student.name} ${student.subject}`.toLowerCase().includes(search.toLowerCase().trim())), [students.data, search]);
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetAnalyticsOverviewQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetTeamAnalyticsQueryKey() });
  };
  const openCreate = () => { setEditing(null); setForm(emptyForm); setFormError(''); setModal('create'); };
  const openEdit = (student: Student) => { setEditing(student); setForm({ name: student.name, subject: student.subject, score: String(student.score) }); setFormError(''); setModal('edit'); };
  const closeModal = () => { if (!createStudent.isPending && !updateStudent.isPending) setModal(null); };
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const score = Number(form.score);
    if (!form.name.trim() || !form.subject.trim() || !Number.isFinite(score) || score < 0 || score > 10) {
      setFormError('Add a name, subject, and a score between 0 and 10.'); return;
    }
    const onSuccess = () => { invalidateAll(); setModal(null); };
    if (modal === 'edit' && editing) updateStudent.mutate({ id: editing.id, data: { name: form.name.trim(), subject: form.subject.trim(), score } }, { onSuccess });
    else createStudent.mutate({ data: { name: form.name.trim(), subject: form.subject.trim(), score } }, { onSuccess });
  };
  const remove = () => {
    if (!confirming) return;
    deleteStudent.mutate({ id: confirming.id }, { onSuccess: () => { invalidateAll(); setConfirming(null); } });
  };

  if (students.isLoading) return <LoadingState rows={7} />;
  if (students.isError) return <ErrorState onRetry={() => students.refetch()} message="Student records could not be loaded." />;

  return (
    <div className="mx-auto max-w-[1440px]">
      <PageIntro eyebrow="Records · Keep the source clean" title="Manage the learning ledger." description="Create, tune, and review the individual records behind your performance view." action={<button type="button" data-testid="button-add-student" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-[0_8px_18px_hsl(229_55%_32%/.17)] transition-transform hover:-translate-y-0.5"><Plus className="size-4" /> Add record</button>} />
      <Panel title={`${students.data?.length ?? 0} performance records`} meta="source of truth">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1"><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search learners or subjects" data-testid="input-search-students" className="h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
          <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{filtered.length} shown</div>
        </div>
        {filtered.length === 0 ? (
          <EmptyState title={search ? 'No matching records' : 'The ledger is clear'} description={search ? 'Try a different learner name or subject.' : 'Add your first performance record to give the dashboard something to read.'} action={!search ? <button type="button" data-testid="button-add-first-student" onClick={openCreate} className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Add first record</button> : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-0 text-left">
              <thead><tr className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground"><th className="border-b border-border px-3 pb-3 font-medium">Learner</th><th className="border-b border-border px-3 pb-3 font-medium">Subject</th><th className="border-b border-border px-3 pb-3 font-medium">Score</th><th className="border-b border-border px-3 pb-3 font-medium">Updated</th><th className="border-b border-border px-3 pb-3 text-right font-medium">Actions</th></tr></thead>
              <tbody>{filtered.map((student) => (
                <tr key={student.id} className="group transition-colors hover:bg-secondary/45" data-testid={`row-student-${student.id}`}>
                  <td className="border-b border-border/70 px-3 py-4"><div className="flex items-center gap-3"><div className="grid size-9 place-items-center rounded-xl bg-secondary text-xs font-bold text-primary">{student.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</div><span className="text-sm font-semibold">{student.name}</span></div></td>
                  <td className="border-b border-border/70 px-3 py-4 text-sm text-muted-foreground">{student.subject}</td>
                  <td className="border-b border-border/70 px-3 py-4"><div className="flex items-center gap-3"><div className="w-24"><ScoreBar score={student.score} color={student.score >= 8 ? 'bg-[hsl(168_51%_42%)]' : student.score >= 6 ? 'bg-primary' : 'bg-accent'} /></div><span className="font-mono text-xs font-medium">{student.score.toFixed(1)}</span></div></td>
                  <td className="border-b border-border/70 px-3 py-4 font-mono text-[11px] text-muted-foreground">{formatDate(student.updatedAt)}</td>
                  <td className="border-b border-border/70 px-3 py-4"><div className="flex justify-end gap-1"><button type="button" data-testid={`button-edit-student-${student.id}`} onClick={() => openEdit(student)} aria-label={`Edit ${student.name}`} className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary"><Pencil className="size-4" /></button><button type="button" data-testid={`button-delete-student-${student.id}`} onClick={() => setConfirming(student)} aria-label={`Delete ${student.name}`} className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="size-4" /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </Panel>

      {modal && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(229_35%_18%/.45)] p-4 backdrop-blur-sm" role="dialog" aria-modal="true" data-testid="dialog-student-form"><div className="w-full max-w-md animate-rise rounded-[24px] border border-border bg-card p-6 shadow-2xl"><div className="mb-6 flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{modal === 'edit' ? 'Edit record' : 'New record'}</div><h2 className="mt-1 font-display text-2xl font-bold">{modal === 'edit' ? 'Tune the details.' : 'Add a learner.'}</h2></div><button type="button" data-testid="button-close-student-form" onClick={closeModal} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><X className="size-4" /></button></div><form onSubmit={submit} className="space-y-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-foreground">Learner name</span><input autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} data-testid="input-student-name" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="e.g. Samira Chen" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-foreground">Subject</span><input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} data-testid="input-student-subject" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="e.g. Algebra" /></label><label className="block"><span className="mb-1.5 block text-xs font-bold text-foreground">Score <span className="font-normal text-muted-foreground">(0–10)</span></span><input type="number" min="0" max="10" step="0.1" value={form.score} onChange={(event) => setForm({ ...form, score: event.target.value })} data-testid="input-student-score" className="h-11 w-full rounded-xl border border-input bg-background px-3.5 font-mono text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="7.5" /></label>{formError && <p className="text-xs font-medium text-destructive" data-testid="text-form-error">{formError}</p>}<button disabled={createStudent.isPending || updateStudent.isPending} type="submit" data-testid="button-save-student" className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-60">{(createStudent.isPending || updateStudent.isPending) ? 'Saving record…' : <><Check className="size-4" /> Save record</>}</button></form></div></div>}
      {confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-[hsl(229_35%_18%/.45)] p-4 backdrop-blur-sm" role="alertdialog" aria-modal="true" data-testid="dialog-delete-student"><div className="w-full max-w-sm rounded-[24px] border border-border bg-card p-6 shadow-2xl"><div className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-destructive">Remove record</div><h2 className="font-display text-2xl font-bold">Delete {confirming.name}?</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">This will remove the score from every view and cannot be undone.</p><div className="mt-6 flex gap-3"><button type="button" data-testid="button-cancel-delete" onClick={() => setConfirming(null)} className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold hover:bg-secondary">Keep record</button><button type="button" data-testid="button-confirm-delete" onClick={remove} disabled={deleteStudent.isPending} className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-bold text-destructive-foreground disabled:opacity-60">{deleteStudent.isPending ? 'Removing…' : 'Delete'}</button></div></div></div>}
    </div>
  );
}