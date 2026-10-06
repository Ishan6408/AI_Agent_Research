import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function AnalysisChartCard({ title, children }: Props) {
  return (
    <div className="w-full h-full flex flex-col p-2">
      <h3 className="text-sm font-bold tracking-wider mb-6 opacity-80 uppercase">{title}</h3>
      <div className="flex-1 w-full relative min-h-[300px]">
        {children}
      </div>
    </div>
  );
}
