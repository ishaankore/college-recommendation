import React, { useState } from 'react';
import TranscriptUpload from './TranscriptUpload';
import CoursesSection from './CoursesSection';
import TestScoresSection from './TestScoresSection';

export default function AcademicsTab() {
  const [tick, setTick] = useState(0);
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h3 className="font-heading font-semibold text-lg">Transcript &amp; courses</h3>
        <TranscriptUpload onImported={() => setTick((t) => t + 1)} />
        <CoursesSection key={tick} />
      </section>
      <section className="space-y-3">
        <h3 className="font-heading font-semibold text-lg">Test scores</h3>
        <TestScoresSection />
      </section>
    </div>
  );
}