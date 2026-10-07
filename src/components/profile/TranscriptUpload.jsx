const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Upload, Loader2, FileUp } from 'lucide-react';

export default function TranscriptUpload({ onImported }) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const process = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const { file_uri } = await db.integrations.Core.UploadPrivateFile({ file });
      const { signed_url } = await db.integrations.Core.CreateFileSignedUrl({ file_uri });
      const res = await db.functions.invoke('parseUpload', { type: 'transcript', file_url: signed_url });
      const courses = (res.data && res.data.courses) || [];
      if (!courses.length) {
        toast({ variant: 'destructive', title: 'Nothing extracted', description: 'We could not read courses from that file. Add them manually below.' });
        return;
      }
      await db.entities.Course.bulkCreate(courses);
      toast({ title: `Imported ${courses.length} courses`, description: 'Review and edit them below.' });
      onImported?.();
    } catch (err) {
      toast({ variant: 'destructive', title: 'Upload failed', description: err.message });
    } finally {
      setBusy(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (busy) return;
    const file = e.dataTransfer.files?.[0];
    if (file) process(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={onDrop}
      onClick={() => !busy && fileRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
        dragging ? 'border-indigo-500 bg-indigo-50' : 'border-border bg-muted/30 hover:bg-muted/60'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${dragging ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-600'}`}>
          <FileUp className="w-5 h-5" />
        </div>
        <div>
          <Label className="text-sm font-medium cursor-pointer">Drop a transcript here, or click to browse</Label>
          <p className="text-xs text-muted-foreground mt-1">PDF or image. We'll extract courses into the list — review and edit them after.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {busy && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        <Button variant="outline" disabled={busy} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>
          <Upload className="w-4 h-4 mr-2" />{busy ? 'Reading…' : 'Browse files'}
        </Button>
        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => process(e.target.files?.[0])} />
      </div>
    </div>
  );
}