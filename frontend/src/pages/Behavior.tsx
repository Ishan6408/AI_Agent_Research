import BehaviourAnalysis from '../components/analytics/BehaviourAnalysis';
import { Download, RefreshCw } from 'lucide-react';

export default function Behavior() {
  return (
    <div className="flex flex-col h-full text-text-main gap-6 max-w-6xl mx-auto w-full pb-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-border pb-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-primary mb-2">Behavioral Logs</h1>
          <p className="text-text-muted max-w-2xl text-sm leading-relaxed">
            Evaluation of synthetic agent deception, honesty preservation, and psychological drift across active simulation clusters.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-surface-alt hover:bg-secondary text-brand-primary px-4 py-2 rounded-md text-sm font-medium transition-colors border border-border">
            <RefreshCw size={16} />
            Sync Data
          </button>
          <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-accent-blue hover:bg-accent-blue/90 text-white px-4 py-2 rounded-md text-sm font-semibold transition-all shadow-sm">
            <Download size={16} />
            Export Data
          </button>
        </div>
      </header>
      
      <div className="w-full">
        <BehaviourAnalysis />
      </div>
    </div>
  );
}
