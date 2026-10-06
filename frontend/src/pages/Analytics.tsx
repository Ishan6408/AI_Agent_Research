import DeveloperAnalysis from '../components/analytics/DeveloperAnalysis';
import { BarChart } from 'lucide-react';

export default function Analytics() {
  return (
    <div className="flex flex-col h-full text-text-main gap-6 max-w-6xl mx-auto w-full pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Developer Analysis</h1>
          <p className="text-text-muted max-w-2xl text-sm">
            Investigating performance and truthfulness metrics across software engineering personas.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 px-3 py-1 bg-surface-alt border border-border rounded text-text-muted text-xs font-medium flex items-center gap-2">
          <BarChart size={14} /> Analytics Node
        </div>
      </header>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        <DeveloperAnalysis />
      </div>
    </div>
  );
}
