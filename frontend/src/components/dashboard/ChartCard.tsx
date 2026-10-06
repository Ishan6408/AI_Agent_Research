import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px bg-border flex-1" />
        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-foreground">{title}</h3>
        <div className="h-px bg-border flex-1" />
      </div>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
