const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect, useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

export default function CollegeSearchInput({ value, onChange, placeholder = 'Search for a college…' }) {
  const [query, setQuery] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);
  const boxRef = useRef(null);

  useEffect(() => { setQuery(value || ''); }, [value]);

  useEffect(() => {
    const onClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const runSearch = (q) => {
    setLoading(true);
    db.functions.invoke('suggestColleges', { query: q })
      .then((res) => {
        const s = (res.data && res.data.suggestions) || [];
        setSuggestions(s);
        setOpen(true);
      })
      .catch(() => { setSuggestions([]); })
      .finally(() => setLoading(false));
  };

  const handleChange = (v) => {
    setQuery(v);
    onChange(v);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    timer.current = setTimeout(() => runSearch(v), 350);
  };

  const pick = (name) => {
    setQuery(name);
    onChange(name);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={boxRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (suggestions.length) setOpen(true); }}
          placeholder={placeholder}
          className="pl-8"
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-30 mt-1 w-full rounded-lg border bg-popover shadow-md max-h-64 overflow-auto">
          {suggestions.map((s) => (
            <button
              type="button"
              key={s}
              onMouseDown={(e) => { e.preventDefault(); pick(s); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground border-b last:border-b-0"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}