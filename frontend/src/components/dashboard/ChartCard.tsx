import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-sm flex flex-col h-[350px]">
      <h3 className="text-slate-200 text-base font-semibold mb-4">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}
