import React from 'react';
import { cn } from '@/lib/utils';

export default function PageHeader({ eyebrow, icon: Icon, title, description, action, className }) {
  return (
    <header className={cn('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8', className)}>
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && <div className="text-xs font-medium uppercase tracking-wider text-indigo-600">{eyebrow}</div>}
          <h1 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
      </div>
      {action && <div className="w-full sm:w-auto shrink-0">{action}</div>}
    </header>
  );
}