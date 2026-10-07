const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const SUBJECTS = ['Math', 'Science', 'English', 'Social Science', 'World Language', 'Arts', 'Computer Science', 'Other'];
const LEVELS = ['Standard', 'Honors', 'AP', 'IB', 'Dual Enrollment', 'College'];
const YEARS = ['9', '10', '11', '12', 'College'];
const emptyRow = { title: '', subject: 'Math', level: 'Standard', grade: '', year: '11', credits: '' };
const emptyEdit = { title: '', subject: 'Math', level: 'Standard', grade: '', year: '11', credits: '' };

export default function CoursesSection() {
  const { items, editing, save, remove, startEdit, cancelEdit, reload } = useCrud('Course');
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setEditForm(editing ? { ...emptyEdit, ...editing } : emptyEdit); }, [editing]);

  const updateRow = (i, k, v) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const dropRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const saveAll = async (e) => {
    e.preventDefault();
    const valid = rows
      .filter((r) => r.title.trim())
      .map((r) => ({ ...r, credits: r.credits === '' ? undefined : Number(r.credits) }));
    if (!valid.length) return;
    setSaving(true);
    try {
      await db.entities.Course.bulkCreate(valid);
      setRows([{ ...emptyRow }]);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const setEdit = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    await save({ ...editForm, credits: editForm.credits === '' ? undefined : Number(editForm.credits) });
  };

  if (editing) {
    return (
      <form onSubmit={submitEdit} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">Course title</Label>
          <Input value={editForm.title} onChange={(e) => setEdit('title', e.target.value)} placeholder="AP Calculus BC" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Subject</Label>
          <Select value={editForm.subject} onValueChange={(v) => setEdit('subject', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Level</Label>
          <Select value={editForm.level} onValueChange={(v) => setEdit('level', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Grade</Label>
          <Input value={editForm.grade} onChange={(e) => setEdit('grade', e.target.value)} placeholder="A-" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Year</Label>
          <Select value={editForm.year} onValueChange={(v) => setEdit('year', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{YEARS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="col-span-2 sm:col-span-6 flex gap-2">
          <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />Update course</Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <form onSubmit={saveAll} className="space-y-3 bg-muted/40 rounded-xl p-4">
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-end">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Course title</Label>
                <Input value={r.title} onChange={(e) => updateRow(i, 'title', e.target.value)} placeholder="AP Calculus BC" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Select value={r.subject} onValueChange={(v) => updateRow(i, 'subject', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Level</Label>
                <Select value={r.level} onValueChange={(v) => updateRow(i, 'level', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Grade</Label>
                <Input value={r.grade} onChange={(e) => updateRow(i, 'grade', e.target.value)} placeholder="A-" />
              </div>
              <div className="flex items-end gap-1">
                <div className="flex-1 space-y-1">
                  <Label className="text-xs text-muted-foreground">Year</Label>
                  <Select value={r.year} onValueChange={(v) => updateRow(i, 'year', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{YEARS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {rows.length > 1 && (
                  <Button type="button" size="icon" variant="ghost" className="shrink-0" onClick={() => dropRow(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addRow}>
            <Plus className="w-4 h-4 mr-1" />Add another course
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : `Save ${rows.filter((r) => r.title.trim()).length || ''} course${rows.filter((r) => r.title.trim()).length === 1 ? '' : 's'}`}
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No courses yet. Add them above or upload a transcript.</p>}
        {items.map((c) => (
          <div key={c.id} className="flex items-center justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{c.title}</div>
              <div className="text-xs text-muted-foreground">{c.subject} · {c.level} · Year {c.year}{c.credits ? ` · ${c.credits} cr` : ''}</div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{c.grade || '—'}</Badge>
              <Button size="icon" variant="ghost" onClick={() => startEdit(c)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}