const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const emptyRow = { name: '', role: '', description: '', grade_levels: '', hours_per_week: '', weeks_per_year: '', leadership: false };
const emptyEdit = { ...emptyRow };

export default function ActivitiesTab() {
  const { items, editing, save, remove, startEdit, cancelEdit, reload } = useCrud('Activity');
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
      .filter((r) => r.name.trim())
      .map((r) => ({
        ...r,
        hours_per_week: r.hours_per_week === '' ? undefined : Number(r.hours_per_week),
        weeks_per_year: r.weeks_per_year === '' ? undefined : Number(r.weeks_per_year),
      }));
    if (!valid.length) return;
    setSaving(true);
    try {
      await db.entities.Activity.bulkCreate(valid);
      setRows([{ ...emptyRow }]);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const setEdit = (k, v) => setEditForm((f) => ({ ...f, [k]: v }));
  const submitEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name.trim()) return;
    await save({
      ...editForm,
      hours_per_week: editForm.hours_per_week === '' ? undefined : Number(editForm.hours_per_week),
      weeks_per_year: editForm.weeks_per_year === '' ? undefined : Number(editForm.weeks_per_year),
    });
  };

  const validCount = rows.filter((r) => r.name.trim()).length;

  if (editing) {
    return (
      <form onSubmit={submitEdit} className="space-y-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs text-muted-foreground">Activity name</Label>
            <Input value={editForm.name} onChange={(e) => setEdit('name', e.target.value)} placeholder="Robotics Club" />
          </div>
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs text-muted-foreground">Role / position</Label>
            <Input value={editForm.role} onChange={(e) => setEdit('role', e.target.value)} placeholder="Build captain" />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea value={editForm.description} onChange={(e) => setEdit('description', e.target.value)} rows={2} placeholder="What you did and achieved" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Grade levels</Label>
            <Input value={editForm.grade_levels} onChange={(e) => setEdit('grade_levels', e.target.value)} placeholder="9-12" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Hrs / week</Label>
            <Input type="number" value={editForm.hours_per_week} onChange={(e) => setEdit('hours_per_week', e.target.value)} placeholder="8" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Weeks / year</Label>
            <Input type="number" value={editForm.weeks_per_year} onChange={(e) => setEdit('weeks_per_year', e.target.value)} placeholder="36" />
          </div>
          <div className="flex items-center gap-2 pb-1.5">
            <Checkbox id="lead-edit" checked={!!editForm.leadership} onCheckedChange={(v) => setEdit('leadership', !!v)} />
            <Label htmlFor="lead-edit" className="text-sm">Leadership role</Label>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />Update activity</Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <form onSubmit={saveAll} className="space-y-3 bg-muted/40 rounded-xl p-4">
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="rounded-lg border bg-background p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Activity name</Label>
                  <Input value={r.name} onChange={(e) => updateRow(i, 'name', e.target.value)} placeholder="Robotics Club" />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <Label className="text-xs text-muted-foreground">Role / position</Label>
                  <Input value={r.role} onChange={(e) => updateRow(i, 'role', e.target.value)} placeholder="Build captain" />
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea value={r.description} onChange={(e) => updateRow(i, 'description', e.target.value)} rows={2} placeholder="What you did and achieved" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Grade levels</Label>
                  <Input value={r.grade_levels} onChange={(e) => updateRow(i, 'grade_levels', e.target.value)} placeholder="9-12" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hrs / week</Label>
                  <Input type="number" value={r.hours_per_week} onChange={(e) => updateRow(i, 'hours_per_week', e.target.value)} placeholder="8" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Weeks / year</Label>
                  <Input type="number" value={r.weeks_per_year} onChange={(e) => updateRow(i, 'weeks_per_year', e.target.value)} placeholder="36" />
                </div>
                <div className="flex items-center gap-2 pb-1.5">
                  <Checkbox id={`lead-${i}`} checked={!!r.leadership} onCheckedChange={(v) => updateRow(i, 'leadership', !!v)} />
                  <Label htmlFor={`lead-${i}`} className="text-sm">Leadership</Label>
                </div>
              </div>
              {rows.length > 1 && (
                <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={() => dropRow(i)}>
                  <X className="w-4 h-4 mr-1" />Remove
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add another activity</Button>
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : `Save ${validCount} activit${validCount === 1 ? 'y' : 'ies'}`}
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No activities yet. Quality over quantity — depth matters more than count.</p>}
        {items.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{a.name}{a.role ? <span className="text-muted-foreground font-normal"> — {a.role}</span> : null}</div>
              {a.description && <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{a.description}</div>}
              <div className="text-xs text-muted-foreground mt-1">
                {a.grade_levels && `Grades ${a.grade_levels}`} {a.hours_per_week ? `· ${a.hours_per_week} hrs/wk` : ''} {a.weeks_per_year ? `· ${a.weeks_per_year} wks/yr` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {a.leadership && <Badge className="bg-indigo-100 text-indigo-700">Leadership</Badge>}
              <Button size="icon" variant="ghost" onClick={() => startEdit(a)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}