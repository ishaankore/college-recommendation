import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCrud } from '@/hooks/useCrud';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const TYPES = ['SAT', 'ACT', 'AP', 'SAT Subject', 'PSAT', 'TOEFL', 'Other'];
const empty = { test_type: 'SAT', score: '', subject: '', date_taken: '' };

export default function TestScoresSection() {
  const { items, editing, save, remove, startEdit, cancelEdit } = useCrud('TestScore');
  const [form, setForm] = useState(empty);

  useEffect(() => { setForm(editing ? { ...empty, ...editing } : empty); }, [editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = async (e) => {
    e.preventDefault();
    if (!form.score.trim()) return;
    await save({ ...form, date_taken: form.date_taken || undefined });
    setForm(empty);
  };

  return (
    <div>
      <form onSubmit={submit} className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end bg-muted/40 rounded-xl p-4">
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Test</Label>
          <Select value={form.test_type} onValueChange={(v) => set('test_type', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{TYPES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Score</Label>
          <Input value={form.score} onChange={(e) => set('score', e.target.value)} placeholder="1530" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">Subject (optional)</Label>
          <Input value={form.subject} onChange={(e) => set('subject', e.target.value)} placeholder="AP Calculus BC" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Date</Label>
          <Input type="date" value={form.date_taken} onChange={(e) => set('date_taken', e.target.value)} />
        </div>
        <div className="col-span-2 sm:col-span-5 flex gap-2">
          <Button type="submit" size="sm"><Plus className="w-4 h-4 mr-1" />{editing ? 'Update score' : 'Add score'}</Button>
          {editing && <Button type="button" size="sm" variant="ghost" onClick={() => { cancelEdit(); setForm(empty); }}><X className="w-4 h-4" /></Button>}
        </div>
      </form>
      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No test scores yet.</p>}
        {items.map((t) => (
          <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{t.test_type}{t.subject ? ` — ${t.subject}` : ''}</div>
              <div className="text-xs text-muted-foreground">{t.date_taken || 'No date'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-semibold text-indigo-700">{t.score}</span>
              <Button size="icon" variant="ghost" onClick={() => startEdit(t)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}