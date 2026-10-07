const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useEffect } from 'react';

import { Progress } from '@/components/ui/progress';
import { BookOpen, User, Award, FileText, Lightbulb, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTIONS = [
  { key: 'academics', label: 'Academics', icon: BookOpen, tab: 'academics', check: (c) => (c.courses || 0) > 0 || (c.tests || 0) > 0 },
  { key: 'activities', label: 'Activities', icon: User, tab: 'activities', check: (c) => (c.activities || 0) > 0 },
  { key: 'awards', label: 'Awards', icon: Award, tab: 'awards', check: (c) => (c.awards || 0) > 0 },
  { key: 'essays', label: 'Essays', icon: FileText, tab: 'essays', check: (c) => (c.essays || 0) > 0 },
  { key: 'interests', label: 'Interests', icon: Lightbulb, tab: 'interests', check: (c) => (c.interests || 0) > 0 },
];

export default function ProfileCompleteness({ onJump }) {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [courses, tests, activities, awards, essays, interests] = await Promise.all([
        db.entities.Course.list(),
        db.entities.TestScore.list(),
        db.entities.Activity.list(),
        db.entities.Award.list(),
        db.entities.Essay.list(),
        db.entities.Interest.list(),
      ]);
      setCounts({
        courses: courses.length,
        tests: tests.length,
        activities: activities.length,
        awards: awards.length,
        essays: essays.length,
        interests: interests.length,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const done = SECTIONS.filter((s) => s.check(counts)).length;
  const pct = Math.round((done / SECTIONS.length) * 100);

  return (
    <div className="rounded-2xl border bg-background p-5 sm:p-6 mb-6">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-semibold">Profile completeness</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {done === SECTIONS.length ? 'Your profile looks full — ready to analyze.' : 'Fill each section to get the most accurate guidance.'}
          </p>
        </div>
        <div className="text-3xl font-heading font-semibold tabular-nums shrink-0">{loading ? '—' : `${pct}%`}</div>
      </div>
      <Progress value={pct} className="mt-4" />
      <div className="mt-4 flex flex-wrap gap-2">
        {SECTIONS.map((s) => {
          const started = s.check(counts);
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onJump?.(s.tab)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                started ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              )}
            >
              {started ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}