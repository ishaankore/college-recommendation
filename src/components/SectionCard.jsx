import React from 'react';
import { cn } from '@/lib/utils';

export default function SectionCard({ icon: Icon, title, description, action, children, className, bodyClassName }) {
  return (
    <section className={cn('rounded-2xl border bg-background', className)}>
      <header className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-border/60">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="font-heading text-base font-semibold leading-tight">{title}</h2>
            {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      <div className={cn('px-5 sm:px-6 py-5', bodyClassName)}>{children}</div>
    </section>
  );
}