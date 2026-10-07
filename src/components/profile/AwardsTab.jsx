const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';

const LEVELS = ['School', 'Regional', 'State', 'National', 'International'];
const emptyRow = { name: '', description: '', level: 'School', date_received: '' };
const emptyEdit = { ...emptyRow };

export default function AwardsTab() {
  const { items, editing, save, remove, startEdit, cancelEdit, reload } = useCrud('Award');
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setEditForm(editing ? { ...emptyEdit, ...editing } : emptyEdit); }, [editing]);

  const updateRow = (i, k, v) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const dropRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const saveAll = async (e) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.name.trim()).map((r) => ({ ...r, date_received: r.date_received || undefined }));
    if (!valid.length) return;
    setSaving(true);
    try {
      await db.entities.Award.bulkCreate(valid);
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
    await save({ ...editForm, date_received: editForm.date_received || undefined });
  };

  const validCount = rows.filter((r) => r.name.trim()).length;

  if (editing) {
    return (
      <form onSubmit={submitEdit} className="space-y-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs text-muted-foreground">Award name</Label>
            <Input value={editForm.name} onChange={(e) => setEdit('name', e.target.value)} placeholder="National Merit Finalist" />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Level</Label>
            <Select value={editForm.level} onValueChange={(v) => setEdit('level', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input type="date" value={editForm.date_received} onChange={(e) => setEdit('date_received', e.target.value)} />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-xs text-muted-foreground">Description</Label>
            <Textarea value={editForm.description} onChange={(e) => setEdit('description', e.target.value)} rows={2} placeholder="What it recognizes and how selective it is" />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />Update award</Button>
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
                  <Label className="text-xs text-muted-foreground">Award name</Label>
                  <Input value={r.name} onChange={(e) => updateRow(i, 'name', e.target.value)} placeholder="National Merit Finalist" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Level</Label>
                  <Select value={r.level} onValueChange={(v) => updateRow(i, 'level', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{LEVELS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Input type="date" value={r.date_received} onChange={(e) => updateRow(i, 'date_received', e.target.value)} />
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Textarea value={r.description} onChange={(e) => updateRow(i, 'description', e.target.value)} rows={2} placeholder="What it recognizes and how selective it is" />
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
          <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add another award</Button>
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : `Save ${validCount} award${validCount === 1 ? '' : 's'}`}
          </Button>
        </div>
      </form>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No awards yet.</p>}
        {items.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{a.name}</div>
              {a.description && <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{a.description}</div>}
              {a.date_received && <div className="text-xs text-muted-foreground mt-1">{a.date_received}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">{a.level}</Badge>
              <Button size="icon" variant="ghost" onClick={() => startEdit(a)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}