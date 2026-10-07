const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCrud } from '@/hooks/useCrud';
import { Plus, Pencil, Trash2, X, Save, Lightbulb } from 'lucide-react';

const emptyRow = { name: '', description: '' };
const emptyEdit = { name: '', description: '' };

export default function InterestsTab() {
  const { items, editing, save, remove, startEdit, cancelEdit, reload } = useCrud('Interest');
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setEditForm(editing ? { ...emptyEdit, ...editing } : emptyEdit); }, [editing]);

  const updateRow = (i, k, v) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const dropRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const saveAll = async (e) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.name.trim());
    if (!valid.length) return;
    setSaving(true);
    try {
      await db.entities.Interest.bulkCreate(valid);
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
    await save(editForm);
  };

  const validCount = rows.filter((r) => r.name.trim()).length;

  if (editing) {
    return (
      <form onSubmit={submitEdit} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="sm:col-span-2 space-y-1">
          <Label className="text-xs text-muted-foreground">Interest</Label>
          <Input value={editForm.name} onChange={(e) => setEdit('name', e.target.value)} placeholder="Biomedical engineering" />
        </div>
        <div className="sm:col-span-4 space-y-1">
          <Label className="text-xs text-muted-foreground">Why / how you pursue it</Label>
          <Textarea value={editForm.description} onChange={(e) => setEdit('description', e.target.value)} rows={2} placeholder="What draws you in and what you've done with it" />
        </div>
        <div className="sm:col-span-6 flex gap-2">
          <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />Update interest</Button>
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
            <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs text-muted-foreground">Interest</Label>
                <Input value={r.name} onChange={(e) => updateRow(i, 'name', e.target.value)} placeholder="Biomedical engineering" />
              </div>
              <div className="sm:col-span-4 space-y-1">
                <Label className="text-xs text-muted-foreground">Why / how you pursue it</Label>
                <Textarea value={r.description} onChange={(e) => updateRow(i, 'description', e.target.value)} rows={2} placeholder="What draws you in and what you've done with it" />
              </div>
              {rows.length > 1 && (
                <div className="sm:col-span-6 flex justify-end">
                  <Button type="button" size="sm" variant="ghost" className="text-muted-foreground" onClick={() => dropRow(i)}>
                    <X className="w-4 h-4 mr-1" />Remove
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add another interest</Button>
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : `Save ${validCount} interest${validCount === 1 ? '' : 's'}`}
          </Button>
        </div>
      </form>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4 col-span-2">No interests yet. These help shape realistic college and major suggestions.</p>}
        {items.map((it) => (
          <div key={it.id} className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <div className="font-medium truncate">{it.name}</div>
                {it.description && <div className="text-sm text-muted-foreground line-clamp-2 mt-0.5">{it.description}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => startEdit(it)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}