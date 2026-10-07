const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCrud } from '@/hooks/useCrud';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Pencil, Trash2, X, Save, Upload, Loader2, FileText } from 'lucide-react';

const STATUSES = ['Not started', 'Draft', 'In progress', 'Complete'];
const emptyRow = { title: '', prompt: '', text: '', status: 'Draft' };
const emptyEdit = { title: '', prompt: '', text: '', status: 'Draft', file_uri: '' };

export default function EssaysTab() {
  const { items, editing, save, remove, startEdit, cancelEdit, reload } = useCrud('Essay');
  const { toast } = useToast();
  const [rows, setRows] = useState([{ ...emptyRow }]);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { setEditForm(editing ? { ...emptyEdit, ...editing } : emptyEdit); }, [editing]);

  const updateRow = (i, k, v) => setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  const addRow = () => setRows((rs) => [...rs, { ...emptyRow }]);
  const dropRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  const saveAll = async (e) => {
    e.preventDefault();
    const valid = rows.filter((r) => r.title.trim());
    if (!valid.length) return;
    setSaving(true);
    try {
      await db.entities.Essay.bulkCreate(valid);
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
    await save({ ...editForm, file_uri: editForm.file_uri || undefined });
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await db.integrations.Core.CreateFileSignedUrl({ file_uri });
      const res = await db.functions.invoke('parseUpload', { type: 'essay', file_url: signed_url });
      const d = res.data || {};
      setEditForm((f) => ({
        ...f,
        title: f.title || d.title || '',
        prompt: f.prompt || d.prompt || '',
        text: d.text || f.text,
        file_uri,
      }));
      toast({ title: 'Essay imported', description: 'Text extracted — review and edit as needed.' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Import failed', description: err.message });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const validCount = rows.filter((r) => r.title.trim()).length;

  if (editing) {
    return (
      <form onSubmit={submitEdit} className="space-y-3 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
        <div className="grid grid-cols-1 sm:grid-cols-6 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <Label className="text-xs text-muted-foreground">Essay title</Label>
            <Input value={editForm.title} onChange={(e) => setEdit('title', e.target.value)} placeholder="Common App — Personal statement" />
          </div>
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={editForm.status} onValueChange={(v) => setEdit('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-xs text-muted-foreground">Prompt</Label>
            <Textarea value={editForm.prompt} onChange={(e) => setEdit('prompt', e.target.value)} rows={2} placeholder="The question you're answering" />
          </div>
          <div className="sm:col-span-6 space-y-1">
            <Label className="text-xs text-muted-foreground">Essay text</Label>
            <Textarea value={editForm.text} onChange={(e) => setEdit('text', e.target.value)} rows={8} placeholder="Paste or write your essay here" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm"><Save className="w-4 h-4 mr-1" />Update essay</Button>
          <Button type="button" size="sm" variant="ghost" onClick={cancelEdit}><X className="w-4 h-4" /></Button>
          <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
            {busy ? 'Reading…' : 'Upload essay file'}
          </Button>
          <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.txt,.md" onChange={handleFile} />
          {editForm.file_uri && <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> File attached</span>}
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
                <div className="sm:col-span-4 space-y-1">
                  <Label className="text-xs text-muted-foreground">Essay title</Label>
                  <Input value={r.title} onChange={(e) => updateRow(i, 'title', e.target.value)} placeholder="Common App — Personal statement" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <Select value={r.status} onValueChange={(v) => updateRow(i, 'status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">Prompt</Label>
                  <Textarea value={r.prompt} onChange={(e) => updateRow(i, 'prompt', e.target.value)} rows={2} placeholder="The question you're answering" />
                </div>
                <div className="sm:col-span-6 space-y-1">
                  <Label className="text-xs text-muted-foreground">Essay text</Label>
                  <Textarea value={r.text} onChange={(e) => updateRow(i, 'text', e.target.value)} rows={5} placeholder="Paste or write your essay here" />
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
          <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add another essay</Button>
          <Button type="submit" size="sm" disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? 'Saving…' : `Save ${validCount} essay${validCount === 1 ? '' : 's'}`}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">To import text from a file, save the essay then edit it — the upload option is in the edit view.</p>
      </form>

      <div className="mt-4 space-y-2">
        {items.length === 0 && <p className="text-sm text-muted-foreground py-4">No essays yet. Add your personal statement and any supplemental essays.</p>}
        {items.map((e) => (
          <div key={e.id} className="flex items-start justify-between gap-3 rounded-lg border px-4 py-3">
            <div className="min-w-0">
              <div className="font-medium truncate">{e.title}</div>
              {e.prompt && <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{e.prompt}</div>}
              <div className="text-xs text-muted-foreground mt-1">{(e.text || '').length} chars{e.file_uri ? ' · file attached' : ''}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline">{e.status}</Badge>
              <Button size="icon" variant="ghost" onClick={() => startEdit(e)}><Pencil className="w-4 h-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}