import AuditorAnalysis from '../components/analytics/AuditorAnalysis';
import { ShieldAlert } from 'lucide-react';

export default function Auditor() {
  return (
    <div className="flex flex-col min-h-full text-text-main gap-6 max-w-6xl mx-auto w-full pb-12">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-2 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Auditor Matrix</h1>
          <p className="text-text-muted max-w-2xl text-sm">
            Strict compliance and anomaly detection framework for evaluating deceptive vectors.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <span className="px-3 py-1 bg-surface-alt border border-border text-brand-secondary rounded text-xs font-medium flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-accent-red" /> Compliance Audit
          </span>
        </div>
      </header>
      
      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden p-2">
        <AuditorAnalysis />
      </div>
    </div>
  );
}
