import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AnalysisChartCard({ title, children }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm p-4 w-full h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-white">{title}</h3>
      <div className="flex-1 w-full relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
